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
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { distinctUntilChanged } from 'rxjs';

export const TERMINAL_NAMES = ['APMT', 'TICT', 'P&C', 'PTML'] as const;
export type TerminalName = (typeof TERMINAL_NAMES)[number];

export const BONDED_TERMINALS = ['APMT', 'TICT', 'P&C', 'PTML'] as const;
export type BondedTerminal = (typeof BONDED_TERMINALS)[number];

export const REFUND_COPY_TYPES = ['Hard', 'Email'] as const;
export type RefundCopyType = (typeof REFUND_COPY_TYPES)[number];

export const SHIPPING_LINES = ['MSC', 'MAERSK', 'CMA'] as const;
export type ShippingLine = (typeof SHIPPING_LINES)[number];

export interface TransportDataInput {
  lastContainerLoadedOut?: string | null;
  blNo?: string | null;
  lastEmptyReturn?: string | null;
}

export interface TerminalShippingModel {
  ata: string | null;
  terminalName: TerminalName;
  bondedApplicable: boolean;
  bondedTerminalName: BondedTerminal | '';
  bondedTransferDate: string | null;
  terminalDnReceived: string | null;
  terminalDnPaid: string | null;
  terminalValidTill: string | null;
  additionalTerminalDnReceived: string | null;
  additionalTerminalDnPaid: string | null;
  additionalTerminalValidTill: string | null;
  examinationApplicable: boolean;
  examinationBooked: string | null;
  examinationDone: string | null;
  tdoProjected: string | null;
  tdoReceived: string | null;
  lastContainerLoadedOut: string | null;
  refundApplicable: boolean;
  refundAppliedDate: string | null;
  refundAcknowledgementDate: string | null;
  refundCopyType: RefundCopyType | '';
  shippingLine: ShippingLine;
  vesselName: string;
  blNo: string;
  shippingDnReceived: string | null;
  shippingDnPaid: string | null;
  shippingValidTill: string | null;
  freeDays: number;
  doReceived: string | null;
  additionalShippingDnReceived: string | null;
  additionalShippingDnPaid: string | null;
  additionalShippingValidTill: string | null;
  lastEmptyReturn: string | null;
  shippingRefundApplicable: boolean;
  shippingRefundAppliedDate: string | null;
  shippingRefundAckCopyType: RefundCopyType | '';
  shippingRefundAckDate: string | null;
  finalInvoiceToBeProcessed: boolean;
}

function dateNotBeforeValidator(
  beforeControlName: string,
  afterControlName: string
): ValidatorFn {
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

function bondedRequiredValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control.parent;
    if (!group) return null;
    const bondedApplicable = group.get('bondedApplicable')?.value;
    const val = control.value;
    if (bondedApplicable && (!val || (typeof val === 'string' && val.trim() === ''))) {
      return { required: true };
    }
    return null;
  };
}

function bondedTransferDateRequiredValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control.parent;
    if (!group) return null;
    const bondedApplicable = group.get('bondedApplicable')?.value;
    const val = control.value;
    if (bondedApplicable && !val) return { required: true };
    return null;
  };
}

function examinationRequiredValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control.parent;
    if (!group) return null;
    const applicable = group.get('examinationApplicable')?.value;
    const val = control.value;
    if (applicable && !val) return { required: true };
    return null;
  };
}

function examinationDoneNotBeforeBookedValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control.parent;
    if (!group) return null;
    const booked = group.get('examinationBooked')?.value;
    const done = control.value;
    if (!booked || !done) return null;
    if (new Date(done) < new Date(booked)) {
      return { examinationDoneBeforeBooked: true };
    }
    return null;
  };
}

function doReceivedAfterShippingDnPaidValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control.parent;
    if (!group) return null;
    const dnPaid = group.get('shippingDnPaid')?.value;
    const doReceived = control.value;
    if (!dnPaid || !doReceived) return null;
    if (new Date(doReceived) < new Date(dnPaid)) {
      return { doBeforeDnPaid: true };
    }
    return null;
  };
}

@Component({
  selector: 'app-terminal-shipping',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './terminal-shipping.component.html',
  styleUrl: './terminal-shipping.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TerminalShippingComponent implements OnInit, OnDestroy, OnChanges {
  @Input() initialValue: Partial<TerminalShippingModel> | null = null;
  @Input() transportData: TransportDataInput | null = null;
  @Input() disabled = false;
  @Output() save = new EventEmitter<TerminalShippingModel>();

  readonly terminalNames = TERMINAL_NAMES;
  readonly bondedTerminals = BONDED_TERMINALS;
  readonly refundCopyTypes = REFUND_COPY_TYPES;
  readonly shippingLines = SHIPPING_LINES;

  form!: FormGroup;

  readonly refundApplicable = signal<boolean>(false);
  readonly shippingRefundApplicable = signal<boolean>(false);
  readonly finalInvoiceToBeProcessed = signal<boolean>(false);
  readonly terminalFreeDaysExpired = signal<boolean>(false);
  readonly shippingFreeDaysExpired = signal<boolean>(false);
  readonly terminalDaysOverdue = signal<number | null>(null);
  readonly shippingDaysOverdue = signal<number | null>(null);
  showAdditionalTerminalDn = false;

  readonly refundBadgeClass = computed(() =>
    this.refundApplicable() ? 'bg-success' : 'bg-danger'
  );
  readonly shippingRefundBadgeClass = computed(() =>
    this.shippingRefundApplicable() ? 'bg-success' : 'bg-danger'
  );
  readonly finalInvoiceBadgeClass = computed(() =>
    this.finalInvoiceToBeProcessed() ? 'bg-success' : 'bg-secondary'
  );

  private subscription: (() => void) | null = null;

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
    this.registerValueChangeHandlers();
    if (this.initialValue) {
      this.patchValue(this.initialValue);
    }
    if (this.transportData) {
      this.applyTransportData();
    }
    if (this.disabled) {
      this.form.disable();
    }
  }

  ngOnDestroy(): void {
    this.subscription?.();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transportData'] && this.form) {
      this.applyTransportData();
    }
    if (changes['initialValue'] && this.form && changes['initialValue'].currentValue) {
      this.patchValue(changes['initialValue'].currentValue);
    }
    if (changes['disabled'] && this.form) {
      if (this.disabled) this.form.disable();
      else this.form.enable();
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      ata: [null as string | null, Validators.required],
      terminalName: ['APMT' as TerminalName, Validators.required],
      bondedApplicable: [false],
      bondedTerminalName: [
        '' as BondedTerminal | '',
        [bondedRequiredValidator()],
      ],
      bondedTransferDate: [null as string | null, [bondedTransferDateRequiredValidator()]],
      terminalDnReceived: [null as string | null],
      terminalDnPaid: [
        null as string | null,
        [dateNotBeforeValidator('terminalDnReceived', 'terminalDnPaid')],
      ],
      terminalValidTill: [null as string | null],
      additionalTerminalDnReceived: [null as string | null],
      additionalTerminalDnPaid: [
        null as string | null,
        [dateNotBeforeValidator('additionalTerminalDnReceived', 'additionalTerminalDnPaid')],
      ],
      additionalTerminalValidTill: [null as string | null],
      examinationApplicable: [false],
      examinationBooked: [null as string | null, [examinationRequiredValidator()]],
      examinationDone: [
        null as string | null,
        [examinationRequiredValidator(), examinationDoneNotBeforeBookedValidator()],
      ],
      tdoProjected: [null as string | null],
      tdoReceived: [null as string | null],
      lastContainerLoadedOut: [null as string | null],
      refundApplicable: [false as boolean],
      refundAppliedDate: [null as string | null],
      refundAcknowledgementDate: [null as string | null],
      refundCopyType: ['' as RefundCopyType | ''],
      shippingLine: ['MSC' as ShippingLine, Validators.required],
      vesselName: [''],
      blNo: [''],
      shippingDnReceived: [null as string | null],
      shippingDnPaid: [
        null as string | null,
        [dateNotBeforeValidator('shippingDnReceived', 'shippingDnPaid')],
      ],
      shippingValidTill: [null as string | null],
      freeDays: [14],
      doReceived: [
        null as string | null,
        [doReceivedAfterShippingDnPaidValidator()],
      ],
      additionalShippingDnReceived: [null as string | null],
      additionalShippingDnPaid: [
        null as string | null,
        [dateNotBeforeValidator('additionalShippingDnReceived', 'additionalShippingDnPaid')],
      ],
      additionalShippingValidTill: [null as string | null],
      lastEmptyReturn: [null as string | null],
      shippingRefundApplicable: [false as boolean],
      shippingRefundAppliedDate: [null as string | null],
      shippingRefundAckCopyType: ['' as RefundCopyType | ''],
      shippingRefundAckDate: [null as string | null],
      finalInvoiceToBeProcessed: [false as boolean],
    });

    this.form.get('bondedApplicable')?.valueChanges.subscribe(() => {
      this.form.get('bondedTerminalName')?.updateValueAndValidity();
      this.form.get('bondedTransferDate')?.updateValueAndValidity();
    });
    this.form.get('examinationApplicable')?.valueChanges.subscribe(() => {
      this.form.get('examinationBooked')?.updateValueAndValidity();
      this.form.get('examinationDone')?.updateValueAndValidity();
    });
    this.form.get('refundApplicable')?.valueChanges.subscribe((v) => {
      const required = v === true ? [Validators.required] : [];
      this.form.get('refundAppliedDate')?.setValidators(required);
      this.form.get('refundAcknowledgementDate')?.setValidators(required);
      this.form.get('refundAppliedDate')?.updateValueAndValidity();
      this.form.get('refundAcknowledgementDate')?.updateValueAndValidity();
    });
  }

  private registerValueChangeHandlers(): void {
    const controls = [
      'terminalValidTill',
      'additionalTerminalValidTill',
      'lastContainerLoadedOut',
      'shippingValidTill',
      'additionalShippingValidTill',
      'lastEmptyReturn',
    ];
    const sub = this.form.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
      this.calculateTerminalRefund();
      this.calculateShippingRefund();
      this.calculateFinalInvoiceEligibility();
      this.calculateFreeDayExpiryAlerts();
    });
    this.subscription = () => sub.unsubscribe();
  }

  private calculateTerminalRefund(): void {
    const latestValidity = this.getLatestTerminalValidity();
    const loadedOut = this.form.get('lastContainerLoadedOut')?.value;
    const transportLoadedOut = this.transportData?.lastContainerLoadedOut;
    const loadedOutVal = loadedOut || transportLoadedOut || null;

    if (!latestValidity || !loadedOutVal) {
      this.refundApplicable.set(false);
      return;
    }
    this.refundApplicable.set(new Date(loadedOutVal) < new Date(latestValidity));
  }

  private calculateShippingRefund(): void {
    const latestValidity = this.getLatestShippingValidity();
    const emptyReturn = this.form.get('lastEmptyReturn')?.value;
    const transportEmptyReturn = this.transportData?.lastEmptyReturn;
    const emptyReturnVal = emptyReturn || transportEmptyReturn || null;

    if (!latestValidity || !emptyReturnVal) {
      this.shippingRefundApplicable.set(false);
      return;
    }
    this.shippingRefundApplicable.set(new Date(emptyReturnVal) < new Date(latestValidity));
  }

  private calculateFinalInvoiceEligibility(): void {
    const latestValidity = this.getLatestShippingValidity();
    const emptyReturn =
      this.form.get('lastEmptyReturn')?.value || this.transportData?.lastEmptyReturn;

    if (!latestValidity || !emptyReturn) {
      this.finalInvoiceToBeProcessed.set(false);
      return;
    }
    this.finalInvoiceToBeProcessed.set(new Date(emptyReturn) < new Date(latestValidity));
  }

  private getLatestTerminalValidity(): string | null {
    const val1 = this.form.get('terminalValidTill')?.value;
    const val2 = this.form.get('additionalTerminalValidTill')?.value;
    if (!val1 && !val2) return null;
    if (!val1) return val2;
    if (!val2) return val1;
    return new Date(val1) >= new Date(val2) ? val1 : val2;
  }

  private getLatestShippingValidity(): string | null {
    const val1 = this.form.get('shippingValidTill')?.value;
    const val2 = this.form.get('additionalShippingValidTill')?.value;
    if (!val1 && !val2) return null;
    if (!val1) return val2;
    if (!val2) return val1;
    return new Date(val1) >= new Date(val2) ? val1 : val2;
  }

  private calculateFreeDayExpiryAlerts(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const terminalValidity = this.getLatestTerminalValidity();
    const loadedOut = this.form.get('lastContainerLoadedOut')?.value || this.transportData?.lastContainerLoadedOut;
    if (terminalValidity && !loadedOut) {
      const validDate = new Date(terminalValidity);
      validDate.setHours(0, 0, 0, 0);
      const expired = today > validDate;
      this.terminalFreeDaysExpired.set(expired);
      this.terminalDaysOverdue.set(
        expired ? Math.ceil((today.getTime() - validDate.getTime()) / (1000 * 60 * 60 * 24)) : null
      );
    } else {
      this.terminalFreeDaysExpired.set(false);
      this.terminalDaysOverdue.set(null);
    }

    const shippingValidity = this.getLatestShippingValidity();
    const emptyReturn = this.form.get('lastEmptyReturn')?.value || this.transportData?.lastEmptyReturn;
    if (shippingValidity && !emptyReturn) {
      const validDate = new Date(shippingValidity);
      validDate.setHours(0, 0, 0, 0);
      const expired = today > validDate;
      this.shippingFreeDaysExpired.set(expired);
      this.shippingDaysOverdue.set(
        expired ? Math.ceil((today.getTime() - validDate.getTime()) / (1000 * 60 * 60 * 24)) : null
      );
    } else {
      this.shippingFreeDaysExpired.set(false);
      this.shippingDaysOverdue.set(null);
    }
  }

  private applyTransportData(): void {
    const t = this.transportData;
    if (!t) return;
    if (t.lastContainerLoadedOut != null) {
      this.form.patchValue(
        { lastContainerLoadedOut: t.lastContainerLoadedOut },
        { emitEvent: false }
      );
    }
    if (t.blNo != null) {
      this.form.patchValue({ blNo: t.blNo }, { emitEvent: false });
    }
    if (t.lastEmptyReturn != null) {
      this.form.patchValue(
        { lastEmptyReturn: t.lastEmptyReturn },
        { emitEvent: false }
      );
    }
    this.calculateTerminalRefund();
    this.calculateShippingRefund();
    this.calculateFinalInvoiceEligibility();
    this.calculateFreeDayExpiryAlerts();
  }

  patchValue(value: Partial<TerminalShippingModel>): void {
    this.form.patchValue(value, { emitEvent: true });
    this.calculateTerminalRefund();
    this.calculateShippingRefund();
    this.calculateFinalInvoiceEligibility();
    this.calculateFreeDayExpiryAlerts();
  }

  onSave(): void {
    if (this.form.invalid || this.form.disabled) return;
    const raw = this.form.getRawValue();
    const payload: TerminalShippingModel = {
      ...raw,
      refundApplicable: this.refundApplicable(),
      shippingRefundApplicable: this.shippingRefundApplicable(),
      finalInvoiceToBeProcessed: this.finalInvoiceToBeProcessed(),
    };
    this.save.emit(payload);
  }

  get ata(): AbstractControl | null {
    return this.form?.get('ata');
  }
  get bondedTerminalName(): AbstractControl | null {
    return this.form?.get('bondedTerminalName');
  }
  get bondedTransferDate(): AbstractControl | null {
    return this.form?.get('bondedTransferDate');
  }
  get examinationBooked(): AbstractControl | null {
    return this.form?.get('examinationBooked');
  }
  get examinationDone(): AbstractControl | null {
    return this.form?.get('examinationDone');
  }
  get doReceived(): AbstractControl | null {
    return this.form?.get('doReceived');
  }

  trackByIndex(index: number): number {
    return index;
  }
}
