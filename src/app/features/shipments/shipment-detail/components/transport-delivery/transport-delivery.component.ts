import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Subscription, distinctUntilChanged } from 'rxjs';

export const TRANSPORTERS = ['Transporter A', 'Transporter B', 'Transporter C', 'Transporter D', 'Transporter E'] as const;

export interface TransportTerminalData {
  terminalName: string;
  shippingLine: string;
  tdoReceivedDate: string | null;
  tdoProjected: string | null;
  terminalValidTill: string | null;
  shippingValidTill: string | null;
}

export interface ContainerModel {
  containerNumber: string;
  transporterNames: string[];
  allocationDate: string | null;
  deliveryLocation: string;
  tdoPickedDateTime: string | null;
  truckGatedInDateTime: string | null;
  loadedAtTerminalDateTime: string | null;
  gatedOutTerminalDateTime: string | null;
  escortName: string;
  arrivedDeliveryLocationDateTime: string | null;
  offloadingStartedDateTime: string | null;
  offloadingCompletedDateTime: string | null;
  waybillReceivedDateTime: string | null;
  emptyGateOutDateTime: string | null;
  emptyReturnedToLocation: string;
  emptyReturnDateTime: string | null;
  eirReceivedDateTime: string | null;
  waybillEirSubmittedToInvoicingDateTime: string | null;
  demurrageCharged: boolean;
  demurrageDays: number | null;
  demurrageReason: string;
  debitToTransporter: boolean;
  debitReason: string;
}

export interface WaybillPrintModel {
  containerNumber: string;
  transporterNames: string[];
  deliveryLocation: string;
  deliveryAddress: string;
  generatedAt: string;
}

export interface TransportDeliveryModel {
  tdoProjected: string | null;
  terminalName: string;
  shippingLine: string;
  deliveryAddress: string;
  transportersAllocated: string[];
  tdoReceivedDate: string | null;
  firstContainerLoadedOut: string | null;
  lastContainerLoadedOut: string | null;
  firstContainerDelivered: string | null;
  lastContainerDelivered: string | null;
  firstEmptyReturn: string | null;
  lastEmptyReturn: string | null;
  completeEirReceived: string | null;
  completeWaybillsReceived: string | null;
  indemnityApplicable: boolean;
  indemnityReceivedDate: string | null;
  docsSubmittedToInvoicingDate: string | null;
  containers: ContainerModel[];
  fileDeliveryCompleted: boolean;
}

function dateTimeNotBeforeValidator(beforeControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control.parent;
    if (!group) return null;
    const beforeVal = group.get(beforeControlName)?.value;
    const afterVal = control.value;
    if (!beforeVal || !afterVal) return null;
    if (new Date(afterVal) < new Date(beforeVal)) {
      return { dateBefore: { before: beforeControlName } };
    }
    return null;
  };
}

function indemnityReceivedRequiredValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control.parent;
    if (!group) return null;
    const applicable = group.get('indemnityApplicable')?.value;
    const val = control.value;
    if (applicable && !val) return { required: true };
    return null;
  };
}

function demurrageDaysRequiredValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control.parent;
    if (!group) return null;
    const charged = group.get('demurrageCharged')?.value;
    const val = control.value;
    if (charged && (val == null || val === '')) return { required: true };
    return null;
  };
}

function docsSubmittedAllowedValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control.parent;
    if (!group) return null;
    const containers = (group.get('containers') as FormArray)?.value ?? [];
    const lastEmpty = group.get('lastEmptyReturn')?.value;
    const completeEir = group.get('completeEirReceived')?.value;
    const completeWaybills = group.get('completeWaybillsReceived')?.value;
    const val = control.value;
    if (!val) return null;
    const allEmptyReturned = containers.every((c: ContainerModel) => c.emptyReturnDateTime);
    const allEirReceived = containers.every((c: ContainerModel) => c.eirReceivedDateTime);
    const allWaybillsReceived = containers.every((c: ContainerModel) => c.waybillReceivedDateTime);
    if (!allEmptyReturned || !allEirReceived || !allWaybillsReceived) {
      return { docsSubmittedBeforeComplete: true };
    }
    return null;
  };
}

const EMPTY_CONTAINER: ContainerModel = {
  containerNumber: '',
  transporterNames: [],
  allocationDate: null,
  deliveryLocation: '',
  tdoPickedDateTime: null,
  truckGatedInDateTime: null,
  loadedAtTerminalDateTime: null,
  gatedOutTerminalDateTime: null,
  escortName: '',
  arrivedDeliveryLocationDateTime: null,
  offloadingStartedDateTime: null,
  offloadingCompletedDateTime: null,
  waybillReceivedDateTime: null,
  emptyGateOutDateTime: null,
  emptyReturnedToLocation: '',
  emptyReturnDateTime: null,
  eirReceivedDateTime: null,
  waybillEirSubmittedToInvoicingDateTime: null,
  demurrageCharged: false,
  demurrageDays: null,
  demurrageReason: '',
  debitToTransporter: false,
  debitReason: '',
};

@Component({
  selector: 'app-transport-delivery',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transport-delivery.component.html',
  styleUrls: ['./transport-delivery.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransportDeliveryComponent implements OnInit, OnDestroy, OnChanges {
  @Input() initialValue: Partial<TransportDeliveryModel> | null = null;
  @Input() terminalData: TransportTerminalData | null = null;
  @Input() dutyReceiptReceivedDate: string | null = null;
  @Input() disabled = false;
  @Output() save = new EventEmitter<TransportDeliveryModel>();

  form!: FormGroup;
  readonly expandedContainerIndex = signal<number | null>(null);
  readonly transporters = TRANSPORTERS;

  readonly terminalName = computed(() => this.terminalData?.terminalName ?? '');
  readonly shippingLine = computed(() => this.terminalData?.shippingLine ?? '');
  readonly tdoReceivedDate = computed(() => this.terminalData?.tdoReceivedDate ?? null);
  readonly tdoProjected = computed(() => this.terminalData?.tdoProjected ?? null);

  readonly firstContainerLoadedOut = computed(() => this.form?.get('firstContainerLoadedOut')?.value ?? null);
  readonly lastContainerLoadedOut = computed(() => this.form?.get('lastContainerLoadedOut')?.value ?? null);
  readonly firstContainerDelivered = computed(() => this.form?.get('firstContainerDelivered')?.value ?? null);
  readonly lastContainerDelivered = computed(() => this.form?.get('lastContainerDelivered')?.value ?? null);
  readonly firstEmptyReturn = computed(() => this.form?.get('firstEmptyReturn')?.value ?? null);
  readonly lastEmptyReturn = computed(() => this.form?.get('lastEmptyReturn')?.value ?? null);
  readonly completeEirReceived = computed(() => this.form?.get('completeEirReceived')?.value ?? null);
  readonly completeWaybillsReceived = computed(() => this.form?.get('completeWaybillsReceived')?.value ?? null);
  readonly fileDeliveryCompleted = computed(() => this.form?.get('fileDeliveryCompleted')?.value ?? false);

  private subscription?: Subscription;

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
    if (this.initialValue) {
      this.patchValue(this.initialValue);
    }
    if (this.disabled) {
      this.form.disable();
    }
    this.subscription = this.form.valueChanges
      .pipe(distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)))
      .subscribe(() => {
        this.calculateFileLevelDates();
        this.calculateDemurrage();
        this.calculateCompletionStatus();
        this.form.get('docsSubmittedToInvoicingDate')?.updateValueAndValidity();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValue'] && this.form && changes['initialValue'].currentValue) {
      this.patchValue(changes['initialValue'].currentValue);
    }
    if (changes['disabled'] && this.form) {
      if (this.disabled) this.form.disable();
      else this.form.enable();
    }
    if (changes['terminalData'] && this.form && this.terminalData) {
      this.form.patchValue(
        {
          terminalName: this.terminalData.terminalName,
          shippingLine: this.terminalData.shippingLine,
          tdoReceivedDate: this.terminalData.tdoReceivedDate,
          tdoProjected: this.form.get('tdoProjected')?.value ?? this.terminalData.tdoProjected,
        },
        { emitEvent: false }
      );
    }
    if ((changes['dutyReceiptReceivedDate'] || changes['terminalData']) && this.form) {
      this.applyTdoProjectedFromDutyReceipt();
    }
  }

  private applyTdoProjectedFromDutyReceipt(): void {
    const current = this.form.get('tdoProjected')?.value;
    if (current) return;
    const dutyDate = this.dutyReceiptReceivedDate ?? this.terminalData?.tdoProjected;
    if (!dutyDate) return;
    const d = new Date(dutyDate);
    d.setDate(d.getDate() + 3);
    this.form.patchValue({ tdoProjected: d.toISOString().slice(0, 10) }, { emitEvent: false });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get containers(): FormArray {
    return this.form.get('containers') as FormArray;
  }

  get containersArray(): FormGroup[] {
    return this.containers.controls as FormGroup[];
  }

  trackByContainer(index: number): number {
    return index;
  }

  addContainer(): void {
    this.containers.push(this.createContainerGroup());
  }

  removeContainer(index: number): void {
    this.containers.removeAt(index);
    if (this.expandedContainerIndex() === index) {
      this.expandedContainerIndex.set(null);
    } else if ((this.expandedContainerIndex() ?? -1) > index) {
      this.expandedContainerIndex.update((i) => (i != null ? i - 1 : null));
    }
  }

  toggleContainerRow(index: number): void {
    this.expandedContainerIndex.update((i) => (i === index ? null : index));
  }

  isExpanded(index: number): boolean {
    return this.expandedContainerIndex() === index;
  }

  getContainerStatus(container: AbstractControl): 'Delivered' | 'In Transit' | 'At Terminal' | 'Delayed' {
    const gatedOut = container.get('gatedOutTerminalDateTime')?.value;
    const arrived = container.get('arrivedDeliveryLocationDateTime')?.value;
    const offloadComplete = container.get('offloadingCompletedDateTime')?.value;
    const emptyReturn = container.get('emptyReturnDateTime')?.value;
    if (emptyReturn && container.get('eirReceivedDateTime')?.value && container.get('waybillReceivedDateTime')?.value) {
      return 'Delivered';
    }
    if (arrived && offloadComplete) return 'In Transit';
    if (gatedOut) return 'In Transit';
    if (container.get('truckGatedInDateTime')?.value) return 'At Terminal';
    return 'Delayed';
  }

  hasDemurrageRisk(container: AbstractControl): boolean {
    return container.get('demurrageCharged')?.value === true;
  }

  getTransporterDisplay(container: AbstractControl): string {
    const names = container.get('transporterNames')?.value as string[] | undefined;
    if (!names || !Array.isArray(names) || names.length === 0) return '-';
    return names.filter(Boolean).join(', ');
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Delivered': return 'status-delivered';
      case 'In Transit': return 'status-transit';
      case 'At Terminal': return 'status-terminal';
      case 'Delayed': return 'status-delayed';
      default: return 'status-delayed';
    }
  }

  generateWaybill(containerIndex: number): void {
    const ctrl = this.containers.at(containerIndex);
    if (!ctrl) return;
    const val = ctrl.value as ContainerModel;
    const model: WaybillPrintModel = {
      containerNumber: val.containerNumber,
      transporterNames: val.transporterNames ?? [],
      deliveryLocation: val.deliveryLocation,
      deliveryAddress: this.form.get('deliveryAddress')?.value ?? '',
      generatedAt: new Date().toISOString(),
    };
    console.log('Waybill generated:', model);
  }

  patchValue(value: Partial<TransportDeliveryModel>): void {
    if (!this.form || !value) return;
    const { containers: containersVal, ...fileLevel } = value;
    this.form.patchValue(
      {
        ...fileLevel,
        transportersAllocated: value.transportersAllocated ?? [],
      },
      { emitEvent: false }
    );
    if (containersVal && containersVal.length > 0) {
      this.containers.clear();
      containersVal.forEach((c) => this.containers.push(this.createContainerGroup(c)));
    }
    this.calculateFileLevelDates();
    this.calculateDemurrage();
    this.calculateCompletionStatus();
  }

  saveForm(): void {
    if (this.form.invalid || this.form.disabled) return;
    const raw = this.form.getRawValue();
    const model: TransportDeliveryModel = {
      ...raw,
      transportersAllocated: Array.isArray(raw.transportersAllocated) ? raw.transportersAllocated : [],
      containers: raw.containers.map((c: ContainerModel) => ({ ...c })),
    };
    this.save.emit(model);
  }

  private buildForm(): void {
    this.form = this.fb.group({
      tdoProjected: [null as string | null],
      terminalName: [{ value: '', disabled: true }],
      shippingLine: [{ value: '', disabled: true }],
      deliveryAddress: [''],
      transportersAllocated: [[] as string[]],
      tdoReceivedDate: [{ value: null as string | null, disabled: true }],
      firstContainerLoadedOut: [{ value: null as string | null, disabled: true }],
      lastContainerLoadedOut: [{ value: null as string | null, disabled: true }],
      firstContainerDelivered: [{ value: null as string | null, disabled: true }],
      lastContainerDelivered: [{ value: null as string | null, disabled: true }],
      firstEmptyReturn: [{ value: null as string | null, disabled: true }],
      lastEmptyReturn: [{ value: null as string | null, disabled: true }],
      completeEirReceived: [{ value: null as string | null, disabled: true }],
      completeWaybillsReceived: [{ value: null as string | null, disabled: true }],
      indemnityApplicable: [false],
      indemnityReceivedDate: [null as string | null, [indemnityReceivedRequiredValidator()]],
      docsSubmittedToInvoicingDate: [null as string | null, [docsSubmittedAllowedValidator()]],
      containers: this.fb.array([]),
      fileDeliveryCompleted: [null as boolean | null, Validators.required],
    });
  }

  private createContainerGroup(data?: Partial<ContainerModel> & { transporterName?: string }): FormGroup {
    const c = { ...EMPTY_CONTAINER, ...data };
    const transporterNames = Array.isArray(c.transporterNames)
      ? c.transporterNames
      : data?.transporterName
        ? [data.transporterName]
        : [];
    return this.fb.group({
      containerNumber: [c.containerNumber, Validators.required],
      transporterNames: [transporterNames],
      allocationDate: [c.allocationDate],
      deliveryLocation: [c.deliveryLocation],
      tdoPickedDateTime: [c.tdoPickedDateTime],
      truckGatedInDateTime: [c.truckGatedInDateTime],
      loadedAtTerminalDateTime: [
        c.loadedAtTerminalDateTime,
        [dateTimeNotBeforeValidator('truckGatedInDateTime')],
      ],
      gatedOutTerminalDateTime: [
        c.gatedOutTerminalDateTime,
        [dateTimeNotBeforeValidator('loadedAtTerminalDateTime')],
      ],
      escortName: [c.escortName],
      arrivedDeliveryLocationDateTime: [
        c.arrivedDeliveryLocationDateTime,
        [dateTimeNotBeforeValidator('gatedOutTerminalDateTime')],
      ],
      offloadingStartedDateTime: [c.offloadingStartedDateTime],
      offloadingCompletedDateTime: [
        c.offloadingCompletedDateTime,
        [dateTimeNotBeforeValidator('offloadingStartedDateTime')],
      ],
      waybillReceivedDateTime: [
        c.waybillReceivedDateTime,
        [dateTimeNotBeforeValidator('offloadingCompletedDateTime')],
      ],
      emptyGateOutDateTime: [c.emptyGateOutDateTime],
      emptyReturnedToLocation: [c.emptyReturnedToLocation],
      emptyReturnDateTime: [
        c.emptyReturnDateTime,
        [dateTimeNotBeforeValidator('emptyGateOutDateTime')],
      ],
      eirReceivedDateTime: [
        c.eirReceivedDateTime,
        [dateTimeNotBeforeValidator('emptyReturnDateTime')],
      ],
      waybillEirSubmittedToInvoicingDateTime: [c.waybillEirSubmittedToInvoicingDateTime],
      demurrageCharged: [c.demurrageCharged],
      demurrageDays: [c.demurrageDays, [demurrageDaysRequiredValidator()]],
      demurrageReason: [c.demurrageReason],
      debitToTransporter: [c.debitToTransporter],
      debitReason: [c.debitReason],
    });
  }

  private extractDate(val: string | null): string | null {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }

  private extractDateTime(val: string | null): string | null {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : val;
  }

  private minDate(vals: (string | null)[]): string | null {
    const parsed = vals
      .filter((v): v is string => !!v)
      .map((v) => new Date(v))
      .filter((d) => !isNaN(d.getTime()));
    if (parsed.length === 0) return null;
    return new Date(Math.min(...parsed.map((d) => d.getTime()))).toISOString().slice(0, 10);
  }

  private maxDate(vals: (string | null)[]): string | null {
    const parsed = vals
      .filter((v): v is string => !!v)
      .map((v) => new Date(v))
      .filter((d) => !isNaN(d.getTime()));
    if (parsed.length === 0) return null;
    return new Date(Math.max(...parsed.map((d) => d.getTime()))).toISOString().slice(0, 10);
  }

  private calculateFileLevelDates(): void {
    if (!this.form) return;
    const containers = this.containers.value as ContainerModel[];
    const gatedOuts = containers.map((c) => this.extractDateTime(c.gatedOutTerminalDateTime));
    const arriveds = containers.map((c) => this.extractDateTime(c.arrivedDeliveryLocationDateTime));
    const emptyReturns = containers.map((c) => this.extractDateTime(c.emptyReturnDateTime));
    const eirs = containers.map((c) => this.extractDateTime(c.eirReceivedDateTime));
    const waybills = containers.map((c) => this.extractDateTime(c.waybillReceivedDateTime));

    this.form.patchValue(
      {
        firstContainerLoadedOut: this.minDate(gatedOuts),
        lastContainerLoadedOut: this.maxDate(gatedOuts),
        firstContainerDelivered: this.minDate(arriveds),
        lastContainerDelivered: this.maxDate(arriveds),
        firstEmptyReturn: this.minDate(emptyReturns),
        lastEmptyReturn: this.maxDate(emptyReturns),
        completeEirReceived: this.maxDate(eirs),
        completeWaybillsReceived: this.maxDate(waybills),
      },
      { emitEvent: false }
    );
  }

  private calculateDemurrage(): void {
    const SLA_HOURS = 48;
    const terminalValidTill = this.terminalData?.terminalValidTill ?? null;
    const shippingValidTill = this.terminalData?.shippingValidTill ?? null;
    const latestValidity = [terminalValidTill, shippingValidTill]
      .filter((v): v is string => !!v)
      .map((v) => new Date(v))
      .filter((d) => !isNaN(d.getTime()));
    const validityDate = latestValidity.length > 0 ? new Date(Math.max(...latestValidity.map((d) => d.getTime()))) : null;

    this.containersArray.forEach((grp) => {
      const emptyReturn = grp.get('emptyReturnDateTime')?.value;
      if (emptyReturn && validityDate) {
        const emptyDate = new Date(emptyReturn);
        if (!isNaN(emptyDate.getTime())) {
          const charged = emptyDate > validityDate;
          const currentCharged = grp.get('demurrageCharged')?.value;
          if (charged !== currentCharged) {
            grp.patchValue({ demurrageCharged: charged }, { emitEvent: false });
          }
          if (charged) {
            const diffMs = emptyDate.getTime() - validityDate.getTime();
            const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            const currentDays = grp.get('demurrageDays')?.value;
            if (currentDays !== days) {
              grp.patchValue({ demurrageDays: days }, { emitEvent: false });
            }
          }
        }
      }
      const gatedOut = grp.get('gatedOutTerminalDateTime')?.value;
      const arrived = grp.get('arrivedDeliveryLocationDateTime')?.value;
      if (gatedOut && arrived) {
        const gatedDate = new Date(gatedOut);
        const arrivedDate = new Date(arrived);
        if (!isNaN(gatedDate.getTime()) && !isNaN(arrivedDate.getTime())) {
          const diffMs = arrivedDate.getTime() - gatedDate.getTime();
          const hours = diffMs / (1000 * 60 * 60);
          const debit = hours > SLA_HOURS;
          const currentDebit = grp.get('debitToTransporter')?.value;
          if (debit !== currentDebit) {
            grp.patchValue({ debitToTransporter: debit }, { emitEvent: false });
          }
        }
      }
    });
  }

  private calculateCompletionStatus(): void {
    const containers = this.containers.value as ContainerModel[];
    if (containers.length === 0) {
      this.form.patchValue({ fileDeliveryCompleted: false }, { emitEvent: false });
      return;
    }
    const allComplete = containers.every(
      (c) => c.emptyReturnDateTime && c.eirReceivedDateTime && c.waybillReceivedDateTime
    );
    this.form.patchValue({ fileDeliveryCompleted: allComplete }, { emitEvent: false });
  }
}
