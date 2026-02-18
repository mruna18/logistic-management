import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import {
  Shipment,
  ShipmentStatus,
  ShipmentSection,
  createEmptyShipment,
} from '../models/shipment-store.model';
import type { OriginDetailsModel } from '../../../import-orders/origin-details/origin-details.component';
import type { PreArrivalModel } from '../../../import-orders/pre-arrival/pre-arrival.component';
import type { TerminalShippingModel } from '../components/terminal-shipping/terminal-shipping.component';
import type { CustomsRegulatoryModel } from '../components/customs-regulatory/customs-regulatory.component';
import type {
  TransportDeliveryModel,
  ContainerModel,
} from '../components/transport-delivery/transport-delivery.component';
import type { TeamDocumentationData } from '../../team-documentation/models/team-documentation.model';
import type { PerformanceControlStage } from '../../../../core/models/performance-control-matrix.model';
import type { BankClosureModel } from '../components/bank-closure/bank-closure.component';
import { ShipmentStatusEngineService } from './shipment-status-engine.service';
import { ShipmentStoreAdapterService } from './shipment-store-adapter.service';

type SectionData =
  | OriginDetailsModel
  | PreArrivalModel
  | TerminalShippingModel
  | CustomsRegulatoryModel
  | TransportDeliveryModel
  | TeamDocumentationData
  | PerformanceControlStage[]
  | BankClosureModel
  | null;

@Injectable({
  providedIn: 'root',
})
export class ShipmentStoreService {
  private readonly shipmentSubject = new BehaviorSubject<Shipment | null>(null);
  private readonly recalcTrigger = new Subject<void>();
  private shipmentId = 0;

  readonly shipment$ = this.shipmentSubject.asObservable();

  constructor(
    private readonly statusEngine: ShipmentStatusEngineService,
    private readonly adapter: ShipmentStoreAdapterService
  ) {
    this.recalcTrigger
      .pipe(debounceTime(100), distinctUntilChanged())
      .subscribe(() => this.recalculateState());
  }

  getShipment(): Shipment | null {
    return this.shipmentSubject.value;
  }

  loadShipment(id: number): void {
    this.shipmentId = id;
    const initial = createEmptyShipment(id);
    initial.originDetails = {
      goodsCollectionBy: 'Shipper',
      readinessEstimatedDate: null,
      readinessActualDate: null,
      shippingLine: 'Maersk',
      etd: null,
      atd: null,
      documentsCourieredBy: '',
      documentsCourierDate: null,
    };
    this.shipmentSubject.next(initial);
    this.recalculateState();
  }

  loadFromDetail(detail: import('../models/shipment-detail.model').ShipmentDetail): void {
    const shipment = this.adapter.toShipment(detail);
    this.shipmentId = shipment.id;
    this.shipmentSubject.next(shipment);
    this.recalculateState();
  }

  updateSection(sectionName: ShipmentSection, data: SectionData): void {
    const current = this.shipmentSubject.value;
    if (!current) return;

    const patch: Partial<Shipment> = {};
    switch (sectionName) {
      case 'origin':
        patch.originDetails = data as OriginDetailsModel | null;
        break;
      case 'preArrival':
        patch.preArrival = data as PreArrivalModel | null;
        break;
      case 'terminal':
        patch.terminalShipping = data as TerminalShippingModel | null;
        break;
      case 'customs':
        patch.customsRegulatory = data as CustomsRegulatoryModel | null;
        break;
      case 'transport':
        patch.transportDelivery = data as TransportDeliveryModel | null;
        break;
      case 'teamDocumentation':
        patch.teamDocumentation = data as TeamDocumentationData | null;
        break;
      case 'performanceControl':
        patch.performanceControlStages = data as PerformanceControlStage[] | null;
        break;
      case 'bankClosure':
        patch.bankClosure = data as BankClosureModel | null;
        break;
      default:
        return;
    }

    const merged = { ...current, ...patch };
    this.computeDerivedFields(merged);
    this.shipmentSubject.next(merged);
    this.recalcTrigger.next();
  }

  recalculateState(): void {
    const current = this.shipmentSubject.value;
    if (!current) return;

    this.computeDerivedFields(current);
    const status = this.statusEngine.computeShipmentStatus(current);
    const updated = { ...current, status };
    this.shipmentSubject.next(updated);
  }

  computeDerivedFields(shipment: Shipment): void {
    this.aggregateContainerFields(shipment);
    this.syncAutoConnections(shipment);
    this.computeRefundApplicable(shipment);
    this.computeFinalInvoiceTrigger(shipment);
  }

  private aggregateContainerFields(shipment: Shipment): void {
    const transport = shipment.transportDelivery;
    if (!transport?.containers?.length) return;

    const containers = transport.containers;
    const extractDate = (val: string | null | undefined): string | null => {
      if (!val) return null;
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : val;
    };
    const minDate = (vals: (string | null)[]): string | null => {
      const parsed = vals
        .filter((v): v is string => !!v)
        .map((v) => new Date(v))
        .filter((d) => !isNaN(d.getTime()));
      if (parsed.length === 0) return null;
      return new Date(Math.min(...parsed.map((d) => d.getTime()))).toISOString().slice(0, 10);
    };
    const maxDate = (vals: (string | null)[]): string | null => {
      const parsed = vals
        .filter((v): v is string => !!v)
        .map((v) => new Date(v))
        .filter((d) => !isNaN(d.getTime()));
      if (parsed.length === 0) return null;
      return new Date(Math.max(...parsed.map((d) => d.getTime()))).toISOString().slice(0, 10);
    };

    const gatedOuts = containers.map((c) => extractDate(c.gatedOutTerminalDateTime));
    const arriveds = containers.map((c) => extractDate(c.arrivedDeliveryLocationDateTime));
    const emptyReturns = containers.map((c) => extractDate(c.emptyReturnDateTime));
    const eirs = containers.map((c) => extractDate(c.eirReceivedDateTime));
    const waybills = containers.map((c) => extractDate(c.waybillReceivedDateTime));

    const allComplete = containers.every(
      (c) => c.emptyReturnDateTime && c.eirReceivedDateTime && c.waybillReceivedDateTime
    );

    Object.assign(transport, {
      firstContainerLoadedOut: minDate(gatedOuts),
      lastContainerLoadedOut: maxDate(gatedOuts),
      firstContainerDelivered: minDate(arriveds),
      lastContainerDelivered: maxDate(arriveds),
      firstEmptyReturn: minDate(emptyReturns),
      lastEmptyReturn: maxDate(emptyReturns),
      completeEirReceived: maxDate(eirs),
      completeWaybillsReceived: maxDate(waybills),
      fileDeliveryCompleted: allComplete,
    });
  }

  private syncAutoConnections(shipment: Shipment): void {
    const preArrival = shipment.preArrival;
    const terminal = shipment.terminalShipping;
    const transport = shipment.transportDelivery;

    if (preArrival?.blNo && terminal && !terminal.blNo) {
      (terminal as TerminalShippingModel).blNo = preArrival.blNo;
    }

    if (terminal?.tdoProjected && transport) {
      (transport as TransportDeliveryModel).tdoProjected = terminal.tdoProjected;
    }

    if (terminal && transport?.lastContainerLoadedOut) {
      (terminal as TerminalShippingModel).lastContainerLoadedOut =
        transport.lastContainerLoadedOut;
    }

    if (terminal && transport?.lastEmptyReturn) {
      (terminal as TerminalShippingModel).lastEmptyReturn = transport.lastEmptyReturn;
    }
  }

  private computeRefundApplicable(shipment: Shipment): void {
    const terminal = shipment.terminalShipping;
    const transport = shipment.transportDelivery;
    if (!terminal) return;

    const lastLoadedOut =
      transport?.lastContainerLoadedOut ?? terminal.lastContainerLoadedOut;
    const lastEmpty = transport?.lastEmptyReturn ?? terminal.lastEmptyReturn;
    const terminalValidTill = terminal.terminalValidTill;
    const shippingValidTill = terminal.shippingValidTill;

    const latestValidity = [terminalValidTill, shippingValidTill]
      .filter((v): v is string => !!v)
      .map((v) => new Date(v))
      .filter((d) => !isNaN(d.getTime()));

    if (lastLoadedOut && latestValidity.length > 0) {
      const validityDate = new Date(Math.max(...latestValidity.map((d) => d.getTime())));
      (terminal as TerminalShippingModel).refundApplicable =
        new Date(lastLoadedOut) < validityDate;
    }

    if (lastEmpty && latestValidity.length > 0) {
      const validityDate = new Date(Math.max(...latestValidity.map((d) => d.getTime())));
      (terminal as TerminalShippingModel).shippingRefundApplicable =
        new Date(lastEmpty) < validityDate;
    }
  }

  private computeFinalInvoiceTrigger(shipment: Shipment): void {
    const terminal = shipment.terminalShipping;
    const transport = shipment.transportDelivery;
    if (!terminal) return;

    const lastEmpty = transport?.lastEmptyReturn ?? terminal.lastEmptyReturn;
    const shippingValidTill = terminal.shippingValidTill;
    if (!lastEmpty || !shippingValidTill) return;

    (terminal as TerminalShippingModel).finalInvoiceToBeProcessed =
      new Date(lastEmpty) < new Date(shippingValidTill);
  }

  setOnHold(onHold: boolean): void {
    const current = this.shipmentSubject.value;
    if (!current) return;
    const status = onHold ? ShipmentStatus.ON_HOLD : this.statusEngine.computeShipmentStatus(current);
    this.shipmentSubject.next({ ...current, status });
  }

  setClosed(): void {
    const current = this.shipmentSubject.value;
    if (!current) return;
    this.shipmentSubject.next({ ...current, status: ShipmentStatus.CLOSED });
  }
}
