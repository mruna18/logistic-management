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
import { Subject, takeUntil } from 'rxjs';
import { ExportOrderCommercialComponent } from './components/export-order-commercial/export-order-commercial.component';
import { ExportTeamDocumentationComponent } from './components/export-team-documentation/export-team-documentation.component';
import { ExportTransportStuffingComponent } from './components/export-transport-stuffing/export-transport-stuffing.component';
import { ExportInspectionsCustomsComponent } from './components/export-inspections-customs/export-inspections-customs.component';
import { ExportTerminalShippingComponent } from './components/export-terminal-shipping/export-terminal-shipping.component';
import { ExportDocumentsClosingComponent } from './components/export-documents-closing/export-documents-closing.component';
import { ExportShipmentStateService } from './services/export-shipment-state.service';
import { ExportStoreService } from './services/export-store.service';
import type {
  ExportShipmentModel,
} from './models/export-shipment.model';
import type {
  ExportOrderCommercialModel,
  ExportTeamDocumentationModel,
  ExportTransportStuffingModel,
  ExportInspectionsCustomsModel,
  ExportTerminalShippingModel,
  ExportDocumentsClosingModel,
} from './models/export-shipment.model';
import { ExportShipmentStatus } from './export-state.enum';

const TABS = [
  '1. Order (Commercial)',
  '2. Team & Documentation',
  '3. Transport & Stuffing',
  '4. Inspections & Customs',
  '5. Terminal & Shipping',
  '6. Documents & Closing',
] as const;

type TabName = (typeof TABS)[number];

@Component({
  selector: 'app-export-shipment-detail',
  standalone: true,
  imports: [
    CommonModule,
    ExportOrderCommercialComponent,
    ExportTeamDocumentationComponent,
    ExportTransportStuffingComponent,
    ExportInspectionsCustomsComponent,
    ExportTerminalShippingComponent,
    ExportDocumentsClosingComponent,
  ],
  templateUrl: './export-shipment-detail.component.html',
  styleUrls: ['./export-shipment-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportShipmentDetailComponent implements OnInit, OnDestroy {
  @Input() shipmentId = 0;
  @Input() shipmentNo = '';
  @Input() clientName = '';
  @Input() orderReference = '';
  @Input() disabled = false;

  readonly activeTab = signal<TabName>('1. Order (Commercial)');
  readonly tabs = TABS;
  readonly exportData = signal<ExportShipmentModel | null>(null);
  readonly status = computed(() => {
    const data = this.store.getExportData();
    return this.stateService.computeStatus(data);
  });
  readonly statusLabel = computed(() => this.stateService.getStatusLabel(this.status()));
  readonly statusBadgeClass = computed(() => this.stateService.getStatusBadgeClass(this.status()));
  readonly lastContainerGatedIn = computed(() => this.store.getExportData()?.transportStuffing?.lastStuffedGatedInPol ?? null);

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly store: ExportStoreService,
    private readonly stateService: ExportShipmentStateService
  ) {}

  ngOnInit(): void {
    const id = this.shipmentId || 0;
    this.store.loadExportShipment(id);
    this.store.exportData$.pipe(takeUntil(this.destroy$)).subscribe((d) => this.exportData.set(d));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setActiveTab(tab: TabName): void {
    this.activeTab.set(tab);
  }

  onOrderSave(data: ExportOrderCommercialModel): void {
    this.store.updateSection('orderCommercial', data);
  }

  onTeamSave(data: ExportTeamDocumentationModel): void {
    this.store.updateSection('teamDocumentation', data);
  }

  onTransportSave(data: ExportTransportStuffingModel): void {
    this.store.updateSection('transportStuffing', data);
  }

  onInspectionsSave(data: ExportInspectionsCustomsModel): void {
    this.store.updateSection('inspectionsCustoms', data);
  }

  onTerminalSave(data: ExportTerminalShippingModel): void {
    this.store.updateSection('terminalShipping', data);
  }

  onDocumentsSave(data: ExportDocumentsClosingModel): void {
    this.store.updateSection('documentsClosing', data);
  }

  saveAll(): void {
    this.store.persist();
  }

  trackByTab(_: number, tab: string): string {
    return tab;
  }
}
