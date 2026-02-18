import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ImportOrderService } from '../../../core/services/import-order.service';
import { Buyer, BuyerService } from '../../../core/services/buyer.service';
import { ProductType, LogisticType, MovementType, ServiceScope, ClearingType, Status } from '../../../shared/enums/status.enum';
import { ApprovalMode, FileStatus, JobScope, JobType, ShipmentMode, ShipmentType, DocumentParty, FormMType, PaymentMode } from '../../../shared/enums/import-process.enum';
import { OriginDetailsComponent, OriginDetailsModel } from '../origin-details/origin-details.component';
import { PreArrivalComponent, PreArrivalModel } from '../pre-arrival/pre-arrival.component';
import {
  TerminalShippingComponent,
  TerminalShippingModel,
} from '../../shipments/shipment-detail/components/terminal-shipping/terminal-shipping.component';
import {
  CustomsRegulatoryComponent,
  CustomsRegulatoryModel,
} from '../../shipments/shipment-detail/components/customs-regulatory/customs-regulatory.component';
import {
  TransportDeliveryComponent,
  TransportDeliveryModel,
  TransportTerminalData,
} from '../../shipments/shipment-detail/components/transport-delivery/transport-delivery.component';
import { ExportShipmentDetailComponent } from '../../shipments/shipment-detail/export/export-shipment-detail.component';
import { ExportStoreService } from '../../shipments/shipment-detail/export/services/export-store.service';
import type { ExportShipmentModel } from '../../shipments/shipment-detail/export/models/export-shipment.model';

@Component({
  selector: 'app-import-order-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OriginDetailsComponent, PreArrivalComponent, TerminalShippingComponent, CustomsRegulatoryComponent, TransportDeliveryComponent, ExportShipmentDetailComponent],
  templateUrl: './import-order-form.component.html',
  styleUrls: ['./import-order-form.component.css']
})
export class ImportOrderFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  orderId?: string;
  generatedOrderRef = '';

  productTypes = Object.values(ProductType);
  logisticTypes = Object.values(LogisticType);
  movementTypes = Object.values(MovementType);
  serviceScopes = Object.values(ServiceScope);
  clearingTypes = Object.values(ClearingType);
  fileStatuses = Object.values(FileStatus);
  approvalModes = Object.values(ApprovalMode);
  shipmentModes = Object.values(ShipmentMode);
  shipmentTypes = Object.values(ShipmentType);
  jobTypes = Object.values(JobType);
  jobScopes = Object.values(JobScope);
  DocumentParty = DocumentParty;
  FormMType = FormMType;
  PaymentMode = PaymentMode;
  Object = Object;
  formMTypes = Object.values(FormMType);
  paymentModesList = Object.values(PaymentMode);
  // use a permissive type to avoid template type-checking narrowing issues
  activeWindow: any = 'window1';
  readonly WINDOW1 = 'window1';
  readonly WINDOW2 = 'window2';
  readonly WINDOW3 = 'window3';
  readonly WINDOW4 = 'window4';
  readonly WINDOW5 = 'window5';
  readonly WINDOW6 = 'window6';
  readonly WINDOW7 = 'window7';
  originDetailsData: OriginDetailsModel | null = null;
  preArrivalData: PreArrivalModel | null = null;
  terminalShippingData: TerminalShippingModel | null = null;
  customsRegulatoryData: CustomsRegulatoryModel | null = null;
  transportDeliveryData: TransportDeliveryModel | null = null;
  documentNames = ['msds', 'coa', 'cria', 'nafdacPermit', 'soncapPermit', 'nercPermit', 'quarantinePermit', 'marineInsurance'];
  docViewMode: 'card' | 'list' = 'card';
  readonly CUSTOM_CONTAINER_VALUE = '__CUSTOM__';
  private static readonly DEFAULT_CONTAINER_TYPES = [
    '20ft Dry Storage (General Purpose)',
    '40ft Dry Storage (General Purpose)',
    '40ft High Cube (Extra Height)',
    'Refrigerated (Reefer)',
    'Flat Rack (Heavy/Oversized)',
    'Open Top'
  ];
  containerTypes: string[] = [...ImportOrderFormComponent.DEFAULT_CONTAINER_TYPES];
  customContainerInput = '';

  addCustomContainerType(): void {
    const trimmed = this.customContainerInput?.trim();
    if (!trimmed) return;
    if (this.containerTypes.includes(trimmed)) {
      this.form.get('containerType')?.setValue(trimmed);
    } else {
      this.containerTypes = [...this.containerTypes, trimmed];
      this.form.get('containerType')?.setValue(trimmed);
    }
    this.customContainerInput = '';
  }
  approvedBuyers: Buyer[] = [];
  filteredBuyers: Buyer[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private importOrderService: ImportOrderService,
    private buyerService: BuyerService,
    private exportStore: ExportStoreService
  ) {
    this.form = this.fb.group({
      // Header & client
      orderReference: ['', Validators.required],
      // clientName: ['', Validators.required],
      buyerName: ['', Validators.required],
      supplierName: ['', Validators.required],
      fileStatus: [FileStatus.DRAFT, Validators.required],
      quotedDate: [null],
      approvedDate: [null],
      cancelledDate: [null],
      approvalMode: [ApprovalMode.APPROVED_QUOTE, Validators.required],
      approvalDate: [null],
      pfiNumber: ['', Validators.required],
      pfiDate: [null],
      soncapNumber: [''],
      soncapDate: [null],
      nafdacNumber: [''],
      nafdacDate: [null],
      insuranceCertificateDate: [null],

      // Shipment & product
      numberOfContainers: [1, [Validators.required, Validators.min(1)]],
      partShipmentToBeCreated: [false],
      containerType: ['', Validators.required],
      containerTypeCustom: [''], // used when loading legacy data; new flow uses addCustomContainerType
      productDescription: ['', Validators.required],
      hsCode: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]],
      baseValue: [0, [Validators.required, Validators.min(0)]],

      // Commercial values
      exWorks: [0, [Validators.required, Validators.min(0)]],
      fob: [0, [Validators.required, Validators.min(0)]],
      freight: [0, [Validators.required, Validators.min(0)]],
      cnf: [{ value: 0, disabled: true }],
      marineInsurance: [{ value: 0, disabled: true }],
      totalCif: [{ value: 0, disabled: true }],

      shipmentMode: [ShipmentMode.SEA, Validators.required],
      shipmentType: [ShipmentType.FCL, Validators.required],
      jobType: [JobType.IMPORT, Validators.required],
      jobScopes: this.fb.control<JobScope[]>([]),

      additionalDetails: [''],
      createdAt: [{ value: new Date(), disabled: true }],

      // Team & Documentation (Window 2)
      salesOwner: [''],
      customerServiceOwner: [''],
      clearingAgent: [''],
      fileClosedForInvoicingDate: [null],

      documents: this.fb.group({
        msds: this.fb.group({ required: [false], processedDate: [null], receivedDate: [null], processedBy: [DocumentParty.CLIENT] }),
        coa: this.fb.group({ required: [false], processedDate: [null], receivedDate: [null], processedBy: [DocumentParty.CLIENT] }),
        cria: this.fb.group({ required: [false], processedDate: [null], receivedDate: [null], processedBy: [DocumentParty.CLIENT] }),
        nafdacPermit: this.fb.group({ required: [false], processedDate: [null], receivedDate: [null], processedBy: [DocumentParty.CLIENT] }),
        soncapPermit: this.fb.group({ required: [false], processedDate: [null], receivedDate: [null], processedBy: [DocumentParty.CLIENT] }),
        nercPermit: this.fb.group({ required: [false], processedDate: [null], receivedDate: [null], processedBy: [DocumentParty.CLIENT] }),
        quarantinePermit: this.fb.group({ required: [false], processedDate: [null], receivedDate: [null], processedBy: [DocumentParty.CLIENT] }),
        marineInsurance: this.fb.group({ required: [false], processedDate: [null], receivedDate: [null], processedBy: [DocumentParty.CLIENT] })
      }),

      documentationVettingDone: [false],
      documentationVettingDate: [null],
      documentationVettingCheckedBy: [''],

      formMBank: [''],
      formMType: [FormMType.NOT_VALID_FOR_FOREX],
      paymentMode: [PaymentMode.DIRECT_TRANSFER],
      formMAppliedDate: [null],
      formMBankSubmittedDate: [null],
      formMNcsApprovedDate: [null],
      formMApprovedDate: [null],
      formMNumber: [''],
      baNumber: [''],
      formMSpecialRemarks: [''],

      // Legacy fields to stay compatible with existing model/service
      productType: ['', Validators.required],
      clearingType: ['', Validators.required],
      allocationDate: ['', Validators.required],
      status: [Status.PENDING],

      // Custom dynamic fields
      customFields: this.fb.array([])
    });

    this.registerValueChangeHandlers();
  }

  ngOnInit() {
    this.buyerService.getApprovedBuyers().subscribe(buyers => {
      this.approvedBuyers = buyers;
      this.filteredBuyers = buyers;
    });

    this.route.params.subscribe(params => {
      if (params['id'] && params['id'] !== 'new') {
        this.isEdit = true;
        this.orderId = params['id'];
        this.loadOrder();
      }
    });

    this.route.queryParams.subscribe(q => {
      if (q['type'] === 'export' && !this.isEdit) {
        this.form.get('jobType')?.setValue(JobType.EXPORT);
        this.exportStore.loadExportShipment(0);
      }
    });

    this.form.get('jobType')?.valueChanges.subscribe(jobType => {
      if (jobType === JobType.EXPORT) {
        this.exportStore.loadExportShipment(0);
      }
    });
  }

  loadOrder() {
    if (this.orderId) {
      this.importOrderService.getById(this.orderId).subscribe(order => {
        if (order) {
          const orderData = order as unknown as Record<string, unknown>;
          const ct = String(orderData['containerType'] ?? '');
          const isCustom = ct && !this.containerTypes.includes(ct);
          if (isCustom) {
            this.containerTypes = [...this.containerTypes, ct];
          }
          this.form.patchValue({
            ...order,
            orderReference: order.orderReference,
            allocationDate: new Date(order.allocationDate).toISOString().split('T')[0],
            containerType: ct || ''
          });
          const originDetails = orderData['originDetails'];
          if (originDetails && typeof originDetails === 'object') {
            this.originDetailsData = originDetails as OriginDetailsModel;
          }
          const preArrival = orderData['preArrival'];
          if (preArrival && typeof preArrival === 'object') {
            this.preArrivalData = preArrival as PreArrivalModel;
          }
          const terminalShipping = orderData['terminalShipping'];
          if (terminalShipping && typeof terminalShipping === 'object') {
            this.terminalShippingData = terminalShipping as TerminalShippingModel;
          }
          const customsRegulatory = orderData['customsRegulatory'];
          if (customsRegulatory && typeof customsRegulatory === 'object') {
            this.customsRegulatoryData = customsRegulatory as CustomsRegulatoryModel;
          }
          const transportDelivery = orderData['transportDelivery'];
          if (transportDelivery && typeof transportDelivery === 'object') {
            this.transportDeliveryData = transportDelivery as TransportDeliveryModel;
          }
          if (orderData['jobType'] === JobType.EXPORT) {
            const exportData = orderData['exportData'] as Partial<ExportShipmentModel> | undefined;
            if (exportData) {
              this.exportStore.loadFromData(exportData);
            } else {
              this.exportStore.loadExportShipment(0);
            }
          }
        }
      });
    }
  }

  get customFields(): FormArray {
    return this.form.get('customFields') as FormArray;
  }

  addCustomField() {
    this.customFields.push(
      this.fb.group({
        label: ['', Validators.required],
        type: ['text', Validators.required],
        value: ['']
      })
    );
  }

  removeCustomField(index: number) {
    this.customFields.removeAt(index);
  }

  filterBuyers(term: string) {
    const value = term.toLowerCase();
    this.filteredBuyers = this.approvedBuyers.filter(b =>
      b.name.toLowerCase().includes(value)
    );
  }

  isActiveWindow(name: string): boolean {
    return this.activeWindow === name;
  }

  isExportJob(): boolean {
    return this.form?.get('jobType')?.value === JobType.EXPORT;
  }

  onOriginDetailsSave(data: OriginDetailsModel): void {
    this.originDetailsData = data;
  }

  onPreArrivalSave(data: PreArrivalModel): void {
    this.preArrivalData = data;
  }

  onTerminalShippingSave(data: TerminalShippingModel): void {
    this.terminalShippingData = data;
  }

  onCustomsRegulatorySave(data: CustomsRegulatoryModel): void {
    this.customsRegulatoryData = data;
  }

  onTransportDeliverySave(data: TransportDeliveryModel): void {
    this.transportDeliveryData = data;
  }

  getTerminalTransportData(): { lastContainerLoadedOut: string | null; blNo: string | null; lastEmptyReturn: string | null } {
    return {
      lastContainerLoadedOut: this.terminalShippingData?.lastContainerLoadedOut ?? null,
      blNo: this.preArrivalData?.blNo ?? null,
      lastEmptyReturn: this.transportDeliveryData?.lastEmptyReturn ?? null,
    };
  }

  getTransportTerminalData(): TransportTerminalData | null {
    const ts = this.terminalShippingData;
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

  getFormMApprovalDate(): string | null {
    const val = this.form.get('formMApprovedDate')?.value;
    if (!val) return null;
    if (typeof val === 'string') return val;
    return new Date(val).toISOString().split('T')[0];
  }

  formatDocName(docName: string): string {
    return docName.replace(/([A-Z])/g, ' $1');
  }

  onBuyerInput(value: string) {
    const match = this.approvedBuyers.find(b => b.name === value);
    if (match) {
      this.form.get('buyerName')!.setValue(match.name);
    } else {
      this.form.get('buyerName')!.setValue(value);
    }
  }

  toggleJobScope(scope: JobScope, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.form.get('jobScopes')!.value as JobScope[];
    if (checked && !current.includes(scope)) {
      this.form.get('jobScopes')!.setValue([...current, scope]);
    } else if (!checked) {
      this.form.get('jobScopes')!.setValue(current.filter(s => s !== scope));
    }
  }

  private registerValueChangeHandlers() {
    this.form.get('fileStatus')!.valueChanges.subscribe(status => {
      const today = new Date();
      if (status === FileStatus.PENDING_APPROVAL && !this.form.get('quotedDate')!.value) {
        this.form.get('quotedDate')!.setValue(today);
      }
      if (status === FileStatus.APPROVED && !this.form.get('approvedDate')!.value) {
        this.form.get('approvedDate')!.setValue(today);
      }
      if (status === FileStatus.CANCELLED && !this.form.get('cancelledDate')!.value) {
        this.form.get('cancelledDate')!.setValue(today);
      }
    });

    const commercialControls = ['exWorks', 'fob', 'freight'];
    commercialControls.forEach(ctrl => {
      this.form.get(ctrl)!.valueChanges.subscribe(() => this.recalculateCommercials());
    });
  }

  private recalculateCommercials() {
    const exWorks = Number(this.form.get('exWorks')!.value) || 0;
    const fob = Number(this.form.get('fob')!.value) || 0;
    const freight = Number(this.form.get('freight')!.value) || 0;

    const cnf = exWorks + fob + freight;
    const insurance = cnf * 0.015 * 1.1;
    const totalCif = cnf + insurance;

    this.form.get('cnf')!.setValue(cnf, { emitEvent: false });
    this.form.get('marineInsurance')!.setValue(insurance, { emitEvent: false });
    this.form.get('totalCif')!.setValue(totalCif, { emitEvent: false });
  }

  private generateOrderReference(): string {
    const client = (this.form.get('clientName')!.value || '') as string;
    const clientCode = client
      .split(' ')
      .map(p => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 5);
    const jobType = this.form.get('jobType')!.value === JobType.EXPORT ? 'EXP' : 'IMP';
    const now = new Date();
    const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    // For now simple timestamp-based sequence; can be replaced with backend sequence
    const seq = String(now.getTime()).slice(-3);
    return `CLE-${clientCode}-${jobType}-${ym}-${seq}`;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.isEdit) {
      this.generatedOrderRef = this.generateOrderReference();
      this.form.get('orderReference')!.setValue(this.generatedOrderRef);
    }

    const raw = this.form.getRawValue();
    const exportData = this.isExportJob() ? this.exportStore.getExportData() : null;
    const payload: Record<string, unknown> = {
      ...raw,
      orderReference: this.isExportJob() && exportData?.orderCommercial?.orderNo
        ? exportData.orderCommercial.orderNo
        : raw.orderReference,
      allocationDate: new Date(this.form.value.allocationDate),
      ...(this.originDetailsData && { originDetails: this.originDetailsData }),
      ...(this.preArrivalData && { preArrival: this.preArrivalData }),
      ...(this.terminalShippingData && { terminalShipping: this.terminalShippingData }),
      ...(this.customsRegulatoryData && { customsRegulatory: this.customsRegulatoryData }),
      ...(this.transportDeliveryData && { transportDelivery: this.transportDeliveryData }),
      ...(this.isExportJob() && exportData && { exportData })
    };

    if (this.isEdit && this.orderId) {
      this.importOrderService.update(this.orderId, payload).subscribe(() => {
        this.router.navigate(['/import-orders']);
      });
    } else {
      this.importOrderService.create(payload).subscribe(() => {
        this.router.navigate(['/import-orders']);
      });
    }
  }

  cancel() {
    this.router.navigate(['/import-orders']);
  }
}

