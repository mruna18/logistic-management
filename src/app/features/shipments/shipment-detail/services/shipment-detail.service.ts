import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, map, throwError } from 'rxjs';
import {
  ShipmentDetail,
  ShipmentDocument,
  ActivityLogEntry,
  ShipmentStatus,
} from '../models/shipment-detail.model';
import { OriginDetailsModel } from '../../../import-orders/origin-details/origin-details.component';
import { PreArrivalModel } from '../../../import-orders/pre-arrival/pre-arrival.component';
import {
  TerminalShippingModel,
  CustomsRegulatoryModel,
  TransportDeliveryModel,
} from '../models/shipment-detail.model';
import { ShipmentStateMachineService } from './shipment-state-machine.service';

@Injectable({
  providedIn: 'root',
})
export class ShipmentDetailService {
  private readonly shipmentSubject = new BehaviorSubject<ShipmentDetail | null>(null);
  private readonly activitySubject = new BehaviorSubject<ActivityLogEntry[]>([]);
  private readonly documentsSubject = new BehaviorSubject<ShipmentDocument[]>([]);

  readonly shipment$ = this.shipmentSubject.asObservable();
  readonly activity$ = this.activitySubject.asObservable();
  readonly documents$ = this.documentsSubject.asObservable();

  constructor(private readonly stateMachine: ShipmentStateMachineService) {}

  private mockShipment(id: number): ShipmentDetail {
    const isExport = id === 2 || id === 100;
    return {
      id,
      shipmentNo: `SHP-${String(id).padStart(6, '0')}`,
      clientName: 'Acme Industries Ltd',
      logisticType: isExport ? 'Export' : 'Import',
      shipmentMode: 'Sea',
      status: 'In Progress',
      eta: '2027-02-20',
      dutyPaidStatus: 'Unpaid',
      containerCount: 2,
      riskLevel: 'Medium',
      orderReference: `ORD-2024-${String(id).padStart(3, '0')}`,
      productType: 'Chemical',
      containerInfo: '2 x 40FT',
      allocationDate: '2026-12-08',
      shipmentType: 'FCL (Full Container Load)',
      currentStep: 2,
      etdIndia: '2026-12-10',
      etaNigeria: '2027-01-15',
      actualDeparture: '2026-12-12',
      actualArrival: null,
      vesselName: 'MSC Oscar',
      shippingLine: 'MSC',
      trackingNumber: 'MSC123456789',
      freightCost: 4500,
      clearingCost: 1200,
      dutyPaid: 0,
      refunds: 0,
      totalLandedCost: 5700,
      paymentMode: 'Direct Transfer',
      formMApprovedDate: '2026-12-01',
      originDetails: {
        goodsCollectionBy: 'Shipper',
        readinessEstimatedDate: '2026-12-05',
        readinessActualDate: '2026-12-06',
        shippingLine: 'Maersk',
        etd: '2026-12-10',
        atd: '2026-12-12',
        documentsCourieredBy: 'Direct',
        documentsCourierDate: '2026-12-08',
      },
      preArrival: null,
      terminalShipping: null,
      customsRegulatory: null,
      transportDelivery: null,
      ...(isExport && { type: 'EXPORT' as const }),
    };
  }

  private mockDocuments: ShipmentDocument[] = [
    {
      id: '1',
      documentName: 'Bill of Lading',
      uploadedBy: 'John Doe',
      date: '2026-12-12',
      type: 'PDF',
    },
    {
      id: '2',
      documentName: 'Commercial Invoice',
      uploadedBy: 'Jane Smith',
      date: '2026-12-13',
      type: 'Excel',
    },
  ];

  private mockActivity: ActivityLogEntry[] = [
    {
      id: '1',
      action: 'File Created',
      description: 'Shipment record created',
      performedBy: 'System',
      timestamp: '2026-12-08T10:00:00',
      eventType: 'status_change',
    },
    {
      id: '2',
      action: 'Origin Details Updated',
      description: 'ATD recorded',
      performedBy: 'John Doe',
      timestamp: '2026-12-12T14:30:00',
      eventType: 'other',
    },
  ];

  getShipmentById(id: number): Observable<ShipmentDetail> {
    return of(this.mockShipment(id)).pipe(
      delay(300),
      map((s) => {
        const computed = this.computeStatus(s);
        this.shipmentSubject.next({ ...s, status: computed });
        return { ...s, status: computed };
      })
    );
  }

  getActivity(id: number): Observable<ActivityLogEntry[]> {
    return of(this.mockActivity).pipe(
      delay(200),
      map((a) => {
        this.activitySubject.next(a);
        return a;
      })
    );
  }

  getDocuments(id: number): Observable<ShipmentDocument[]> {
    return of(this.mockDocuments).pipe(
      delay(200),
      map((d) => {
        this.documentsSubject.next(d);
        return d;
      })
    );
  }

  updateShipment(id: number, patch: Partial<ShipmentDetail>): Observable<ShipmentDetail> {
    const current = this.shipmentSubject.value;
    if (!current || current.id !== id) {
      return of(this.mockShipment(id));
    }
    const merged = { ...current, ...patch };
    const computed = this.computeStatus(merged);
    const updated = { ...merged, status: computed };
    this.shipmentSubject.next(updated);
    return of(updated).pipe(delay(150));
  }

  mergeAndSave(
    id: number,
    updates: {
      originDetails?: OriginDetailsModel | null;
      preArrival?: PreArrivalModel | null;
      terminalShipping?: TerminalShippingModel | null;
      customsRegulatory?: CustomsRegulatoryModel | null;
      transportDelivery?: TransportDeliveryModel | null;
    }
  ): Observable<ShipmentDetail> {
    const current = this.shipmentSubject.value;
    if (!current || current.id !== id) {
      return of(this.mockShipment(id));
    }
    const guard = this.stateMachine.validateTransition(current, updates);
    if (!guard.canTransition) {
      return throwError(() => new Error(guard.reason ?? 'Transition not allowed'));
    }
    const merged: ShipmentDetail = {
      ...current,
      ...(updates.originDetails !== undefined && { originDetails: updates.originDetails }),
      ...(updates.preArrival !== undefined && { preArrival: updates.preArrival }),
      ...(updates.terminalShipping !== undefined && { terminalShipping: updates.terminalShipping }),
      ...(updates.customsRegulatory !== undefined && { customsRegulatory: updates.customsRegulatory }),
      ...(updates.transportDelivery !== undefined && { transportDelivery: updates.transportDelivery }),
    };
    const computed = this.computeStatus(merged);
    const updated = { ...merged, status: computed };
    this.shipmentSubject.next(updated);
    this.appendActivity(id, 'Shipment Updated', 'Data saved', 'User');
    return of(updated).pipe(delay(150));
  }

  appendActivity(
    _id: number,
    action: string,
    description: string,
    performedBy: string,
    eventType: ActivityLogEntry['eventType'] = 'other'
  ): void {
    const entry: ActivityLogEntry = {
      id: String(Date.now()),
      action,
      description,
      performedBy,
      timestamp: new Date().toISOString(),
      eventType,
    };
    const current = this.activitySubject.value;
    this.activitySubject.next([entry, ...current]);
  }

  getCurrentShipment(): ShipmentDetail | null {
    return this.shipmentSubject.value;
  }

  private computeStatus(s: ShipmentDetail): ShipmentStatus {
    const state = this.stateMachine.computeState(s);
    return this.stateMachine.mapStateToShipmentStatus(state);
  }

  getStateContext(s: ShipmentDetail | null) {
    return s ? this.stateMachine.computeContext(s) : null;
  }
}
