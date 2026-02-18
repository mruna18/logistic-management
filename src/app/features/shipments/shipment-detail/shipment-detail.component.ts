import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  Input,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ShipmentDetailService } from './services/shipment-detail.service';
import { ShipmentStoreService } from './services/shipment-store.service';
import { ShipmentStoreAdapterService } from './services/shipment-store-adapter.service';
import { ShipmentDetail } from './models/shipment-detail.model';
import type { Shipment } from './models/shipment-store.model';
import { OriginDetailsModel } from '../../import-orders/origin-details/origin-details.component';
import { PreArrivalModel } from '../../import-orders/pre-arrival/pre-arrival.component';
import {
  TerminalShippingModel,
  CustomsRegulatoryModel,
  TransportDeliveryModel,
} from './models/shipment-detail.model';
import type { TransportDataInput } from './components/terminal-shipping/terminal-shipping.component';
import type { TransportTerminalData } from './components/transport-delivery/transport-delivery.component';
import { ShipmentHeaderComponent } from './components/shipment-header/shipment-header.component';
import { ShipmentStatusTrackerComponent } from './components/shipment-status-tracker.component';
import { OriginDetailsComponent } from '../../import-orders/origin-details/origin-details.component';
import { PreArrivalComponent } from '../../import-orders/pre-arrival/pre-arrival.component';
import { TerminalShippingComponent } from './components/terminal-shipping/terminal-shipping.component';
import { CustomsRegulatoryComponent } from './components/customs-regulatory/customs-regulatory.component';
import { TransportDeliveryComponent } from './components/transport-delivery/transport-delivery.component';
import { ShipmentDashboardSummaryComponent } from './components/shipment-dashboard-summary/shipment-dashboard-summary.component';
import { ShipmentDocumentsComponent } from './components/shipment-documents/shipment-documents.component';
import { ActivityLogPanelComponent } from './components/activity-log-panel/activity-log-panel.component';
import { TeamDocumentationComponent } from '../team-documentation/team-documentation.component';
import { PerformanceControlMatrixComponent } from './components/performance-control-matrix/performance-control-matrix.component';
import { BankClosureComponent } from './components/bank-closure/bank-closure.component';
import { ExportShipmentDetailComponent } from './export/export-shipment-detail.component';
import type { PerformanceControlStage } from '../../../core/models/performance-control-matrix.model';
import type { ShipmentType } from './models/shipment-store.model';

const TABS = [
  'Overview',
  'Origin Details',
  'Pre Arrival',
  'Terminal & Shipping',
  'Customs & Regulatory',
  'Transport & Delivery',
  'Team & Documentation',
  'Performance Matrix',
  'Bank Closure',
  'Documents',
  'Activity Log',
] as const;

type TabName = (typeof TABS)[number];

@Component({
  selector: 'app-shipment-detail',
  standalone: true,
  imports: [
    CommonModule,
    ShipmentHeaderComponent,
    ShipmentStatusTrackerComponent,
    OriginDetailsComponent,
    PreArrivalComponent,
    TerminalShippingComponent,
    CustomsRegulatoryComponent,
    TransportDeliveryComponent,
    ShipmentDashboardSummaryComponent,
    ShipmentDocumentsComponent,
    ActivityLogPanelComponent,
    TeamDocumentationComponent,
    PerformanceControlMatrixComponent,
    BankClosureComponent,
    ExportShipmentDetailComponent,
  ],
  templateUrl: './shipment-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentDetailComponent implements OnInit, OnDestroy {
  @Input() userRole: string = 'clearing_agent';

  readonly activeTab = signal<TabName>('Overview');
  readonly shipment = signal<ShipmentDetail | Shipment | null>(null);
  readonly documents = signal<import('./models/shipment-detail.model').ShipmentDocument[]>([]);
  readonly activities = signal<import('./models/shipment-detail.model').ActivityLogEntry[]>([]);

  readonly tabs = TABS;
  readonly isOverviewEditable = computed(() => this.canEdit('sales'));
  readonly isPreArrivalEditable = computed(() => this.canEdit('clearing_agent'));
  readonly isDutyEditable = computed(() => this.canEdit('finance'));
  readonly isManagementViewOnly = computed(() => this.userRole === 'management');
  readonly isExportShipment = computed(() => {
    const s = this.shipment();
    const t = (s as { type?: ShipmentType })?.type;
    return t === 'EXPORT';
  });
  readonly isFormDisabled = computed(
    () =>
      this.isManagementViewOnly() ||
      this.shipment()?.status === 'Closed' ||
      (this.shipment() as Shipment)?.status === 'CLOSED'
  );

  readonly stateContext = computed(() => {
    const s = this.shipment();
    if (!s) return null;
    const detail = 'teamDocumentation' in s ? this.adapter.toShipmentDetail(s as Shipment) : s;
    return this.service.getStateContext(detail);
  });

  isTabLocked(tab: string): boolean {
    if (tab === 'Performance Matrix' || tab === 'Bank Closure') return false;
    const s = this.shipment();
    if (!s) return false;
    const status = (s as { status?: string }).status;
    if (status === 'Closed' || status === 'CLOSED') return false;
    // All operational tabs (Origin, Pre Arrival, Terminal, Customs, Transport) are always editable
    // to allow flexible data entry and updates regardless of workflow order
    return false;
  }

  readonly transitionError = signal<string | null>(null);

  private readonly destroy$ = new Subject<void>();
  private shipmentId = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly service: ShipmentDetailService,
    private readonly store: ShipmentStoreService,
    private readonly adapter: ShipmentStoreAdapterService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('id');
      this.shipmentId = id ? parseInt(id, 10) : 0;
      if (this.shipmentId) {
        this.service.getShipmentById(this.shipmentId).subscribe((s) => {
          this.store.loadFromDetail(s);
        });
        this.service.getDocuments(this.shipmentId).subscribe((d) => this.documents.set(d));
        this.service.getActivity(this.shipmentId).subscribe((a) => this.activities.set(a));
      }
    });

    this.store.shipment$.pipe(takeUntil(this.destroy$)).subscribe((s) => {
      if (s) this.shipment.set(s);
    });
    this.service.documents$.pipe(takeUntil(this.destroy$)).subscribe((d) => this.documents.set(d));
    this.service.activity$.pipe(takeUntil(this.destroy$)).subscribe((a) => this.activities.set(a));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setActiveTab(tab: TabName): void {
    if (this.isTabLocked(tab)) return;
    this.transitionError.set(null);
    this.activeTab.set(tab);
  }

  canEdit(role: string): boolean {
    if (this.userRole === 'management') return false;
    return this.userRole === role;
  }

  onOriginDetailsSave(data: OriginDetailsModel): void {
    this.transitionError.set(null);
    this.store.updateSection('origin', data);
  }

  onPreArrivalSave(data: PreArrivalModel): void {
    this.transitionError.set(null);
    this.store.updateSection('preArrival', data);
  }

  onTerminalShippingSave(data: TerminalShippingModel): void {
    this.transitionError.set(null);
    this.store.updateSection('terminal', data);
  }

  onCustomsRegulatorySave(data: CustomsRegulatoryModel): void {
    this.transitionError.set(null);
    this.store.updateSection('customs', data);
  }

  onTransportDeliverySave(data: TransportDeliveryModel): void {
    this.transitionError.set(null);
    this.store.updateSection('transport', data);
  }

  onTeamDocumentationSave(data: import('../team-documentation/models/team-documentation.model').TeamDocumentationData): void {
    this.transitionError.set(null);
    this.store.updateSection('teamDocumentation', data);
  }

  onPerformanceMatrixSave(data: PerformanceControlStage[]): void {
    this.transitionError.set(null);
    this.store.updateSection('performanceControl', data);
  }

  onBankClosureSave(data: import('./components/bank-closure/bank-closure.component').BankClosureModel): void {
    this.transitionError.set(null);
    this.store.updateSection('bankClosure', data);
  }

  getTransportData(s: ShipmentDetail | Shipment): TransportDataInput {
    return {
      lastContainerLoadedOut: s.terminalShipping?.lastContainerLoadedOut ?? null,
      blNo: s.preArrival?.blNo ?? null,
      lastEmptyReturn: s.transportDelivery?.lastEmptyReturn ?? null,
    };
  }

  getTransportTerminalData(s: ShipmentDetail | Shipment): TransportTerminalData | null {
    const ts = s.terminalShipping;
    if (!ts) return null;
    return {
      terminalName: ts.terminalName ?? '',
      shippingLine: ts.shippingLine ?? '',
      tdoReceivedDate: ts.tdoReceived ?? null,
      tdoProjected: ts.tdoProjected ?? null,
      terminalValidTill: ts.terminalValidTill ?? null,
      shippingValidTill: ts.shippingValidTill ?? null,
    };
  }

  saveAll(): void {
    const s = this.shipment();
    if (!s || !this.shipmentId) return;
    const detail = 'teamDocumentation' in s ? this.adapter.toShipmentDetail(s as Shipment) : s;
    this.service
      .updateShipment(this.shipmentId, detail)
      .pipe(takeUntil(this.destroy$))
      .subscribe((updated) => this.store.loadFromDetail(updated));
  }

  trackByTab(index: number, tab: string): string {
    return tab;
  }

  getShipmentId(): number {
    return this.shipmentId;
  }

  getCurrentStep(s: ShipmentDetail | Shipment): number {
    return s.currentStep ?? 1;
  }

  getTeamDocumentation(s: ShipmentDetail | Shipment | null): import('../team-documentation/models/team-documentation.model').TeamDocumentationData | null {
    if (!s || !('teamDocumentation' in s)) return null;
    return (s as Shipment).teamDocumentation ?? null;
  }

  getBankClosureData(s: ShipmentDetail | Shipment | null): import('./components/bank-closure/bank-closure.component').BankClosureModel | null {
    if (!s || !('bankClosure' in s)) return null;
    return (s as Shipment).bankClosure ?? null;
  }

  getPerformanceMatrixShipmentData(s: ShipmentDetail | Shipment | null): {
    formMApprovedDate?: string | null;
    originDetails?: { atd?: string | null; etd?: string | null } | null;
    preArrival?: { paarReceivedDate?: string | null; dutyPaidDate?: string | null; eta?: string | null } | null;
    terminalShipping?: { ata?: string | null; tdoReceived?: string | null; examinationDone?: string | null } | null;
    customsRegulatory?: { customReleaseDate?: string | null } | null;
    transportDelivery?: { firstContainerLoadedOut?: string | null; lastContainerDelivered?: string | null } | null;
  } | null {
    if (!s) return null;
    return {
      formMApprovedDate: s.formMApprovedDate ?? null,
      originDetails: s.originDetails ?? null,
      preArrival: s.preArrival ?? null,
      terminalShipping: s.terminalShipping ?? null,
      customsRegulatory: s.customsRegulatory ?? null,
      transportDelivery: s.transportDelivery ?? null,
    };
  }
}
