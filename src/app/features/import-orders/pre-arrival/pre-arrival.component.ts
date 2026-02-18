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

export type DutyPaidBy = 'Client' | 'Agent';

export type PreArrivalStatus =
  | 'Waiting for Docs'
  | 'PAAR Processing'
  | 'Awaiting Draft Approval'
  | 'Awaiting Payment'
  | 'Completed';

export interface PreArrivalModel {
  copyShippingDocsReceived: string | null;
  originalShippingDocsReceived: string | null;
  copyBLReceived: string | null;
  originalBLReceived: string | null;
  blNo: string;
  paarAppliedDate: string | null;
  draftPaarReceivedDate: string | null;
  consignmentNo: string;
  paarValidatedDate: string | null;
  paarProcessDate: string | null;
  paarReceivedDate: string | null;
  paarAmendmentDate: string | null;
  paarRemarks: string;
  paarNo: string;
  eta: string | null;
  idecApplicable: boolean;
  idecResponseDate: string | null;
  specialDutyWaiver: boolean;
  rotationNo: string;
  terminalCode: string;
  commandCode: string;
  dutyDraftAssessedDate: string | null;
  dutyDraftSentDate: string | null;
  dutyDraftApprovedDate: string | null;
  dutyFinalProcessedDate: string | null;
  dutyFinalSentDate: string | null;
  dutyPaidBy: DutyPaidBy;
  dutyPaidDate: string | null;
  dutyReceiptReceivedDate: string | null;
  cNo: string;
}

function originalNotBeforeCopyValidator(
  copyControlName: string,
  originalControlName: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control.parent;
    if (!group) return null;
    const copyVal = group.get(copyControlName)?.value;
    const originalVal = control.value;
    if (!copyVal || !originalVal) return null;
    if (new Date(originalVal) < new Date(copyVal)) {
      return { originalBeforeCopy: true };
    }
    return null;
  };
}

function paarRemarksRequiredWhenAmendmentValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control.parent;
    if (!group) return null;
    const amendmentDate = group.get('paarAmendmentDate')?.value;
    const remarks = control.value;
    if (amendmentDate && (!remarks || (typeof remarks === 'string' && remarks.trim() === ''))) {
      return { required: true };
    }
    return null;
  };
}

function idecResponseDateRequiredValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control.parent;
    if (!group) return null;
    const idecApplicable = group.get('idecApplicable')?.value;
    const date = control.value;
    if (idecApplicable && !date) {
      return { required: true };
    }
    return null;
  };
}

function sequenceValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    if (!(group instanceof FormGroup)) return null;
    const paarReceived = group.get('paarReceivedDate')?.value;
    const dutyDraftAssessed = group.get('dutyDraftAssessedDate')?.value;
    const dutyDraftApproved = group.get('dutyDraftApprovedDate')?.value;
    const dutyFinalProcessed = group.get('dutyFinalProcessedDate')?.value;
    const dutyPaid = group.get('dutyPaidDate')?.value;

    if (!paarReceived && (dutyDraftAssessed || dutyDraftApproved || dutyFinalProcessed || dutyPaid)) {
      return { sequenceBroken: { stage: 'PAAR' } };
    }
    if (!dutyDraftAssessed && (dutyDraftApproved || dutyFinalProcessed || dutyPaid)) {
      return { sequenceBroken: { stage: 'Duty Draft' } };
    }
    if (!dutyDraftApproved && (dutyFinalProcessed || dutyPaid)) {
      return { sequenceBroken: { stage: 'Draft Approval' } };
    }
    if (!dutyFinalProcessed && dutyPaid) {
      return { sequenceBroken: { stage: 'Final Processing' } };
    }
    return null;
  };
}

@Component({
  selector: 'app-pre-arrival',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pre-arrival.component.html',
  styleUrl: './pre-arrival.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreArrivalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() paymentMode: string | null = null;
  @Input() atd: string | null = null;
  @Input() autoEta: string | null = null;
  @Input() autoShippingLine: string | null = null;
  @Input() autoTerminalName: string | null = null;
  @Input() initialValue: Partial<PreArrivalModel> | null = null;
  @Input() disabled = false;
  @Output() save = new EventEmitter<PreArrivalModel>();

  readonly dutyPaidByOptions: readonly DutyPaidBy[] = ['Client', 'Agent'];

  form!: FormGroup;
  private readonly paarProcessingDelayDays = signal<number | null>(null);
  readonly showPaarDelayBadge = signal<boolean>(false);
  readonly paarDelayBadgeClass = signal<string>('');
  readonly showEtaWarning = signal<boolean>(false);
  readonly sequenceError = signal<string | null>(null);

  readonly paarDelayText = computed(() => {
    const days = this.paarProcessingDelayDays();
    if (days === null) return '';
    return days > 0 ? `${days} day(s) delay` : days === 0 ? 'On time' : `${Math.abs(days)} day(s) early`;
  });

  readonly status = computed<PreArrivalStatus>(() => {
    const raw = this.form?.getRawValue();
    if (!raw) return 'Waiting for Docs';

    const copyDocs = raw.copyShippingDocsReceived;
    const copyBL = raw.copyBLReceived;
    const blNo = raw.blNo?.trim();
    const paarReceived = raw.paarReceivedDate;
    const dutyDraftAssessed = raw.dutyDraftAssessedDate;
    const dutyDraftApproved = raw.dutyDraftApprovedDate;
    const dutyFinalProcessed = raw.dutyFinalProcessedDate;
    const dutyPaid = raw.dutyPaidDate;

    if (!copyDocs || !copyBL || !blNo) return 'Waiting for Docs';
    if (!paarReceived) return 'PAAR Processing';
    if (!dutyDraftAssessed) return 'PAAR Processing';
    if (!dutyDraftApproved) return 'Awaiting Draft Approval';
    if (!dutyFinalProcessed) return 'Awaiting Draft Approval';
    if (!dutyPaid) return 'Awaiting Payment';
    return 'Completed';
  });

  readonly statusBadgeClass = computed(() => {
    const s = this.status();
    switch (s) {
      case 'Waiting for Docs':
        return 'bg-secondary';
      case 'PAAR Processing':
        return 'bg-info';
      case 'Awaiting Draft Approval':
        return 'bg-warning text-dark';
      case 'Awaiting Payment':
        return 'bg-warning text-dark';
      case 'Completed':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  });

  private subscription: (() => void) | null = null;

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
    this.registerValueChangeHandlers();
    if (this.initialValue) {
      this.patchValue(this.initialValue);
    }
    this.patchAutoFillFromParent();
    if (this.disabled) {
      this.form.disable();
    }
  }

  ngOnDestroy(): void {
    this.subscription?.();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['paymentMode'] && this.form) {
      const ctrl = this.form.get('originalShippingDocsReceived');
      if (ctrl) {
        const validators = [
          originalNotBeforeCopyValidator('copyShippingDocsReceived', 'originalShippingDocsReceived'),
        ];
        if (this.paymentMode === 'LC' || this.paymentMode === 'Letter of Credit') {
          validators.push(Validators.required);
        }
        ctrl.setValidators(validators);
        ctrl.updateValueAndValidity();
      }
    }
    if (changes['atd'] && this.form) {
      this.checkEtaWarning();
    }
    if ((changes['autoEta'] || changes['autoShippingLine'] || changes['autoTerminalName']) && this.form) {
      this.patchAutoFillFromParent();
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
    const originalShippingDocsValidators = [
      originalNotBeforeCopyValidator('copyShippingDocsReceived', 'originalShippingDocsReceived'),
      ...(this.paymentMode === 'LC' ? [Validators.required] : []),
    ];

    this.form = this.fb.group(
      {
        copyShippingDocsReceived: [null as string | null, Validators.required],
        originalShippingDocsReceived: [null as string | null, originalShippingDocsValidators],
        copyBLReceived: [null as string | null, Validators.required],
        originalBLReceived: [
          null as string | null,
          [originalNotBeforeCopyValidator('copyBLReceived', 'originalBLReceived')],
        ],
        blNo: ['', Validators.required],
        shippingLineDisplay: [''],
        terminalNameDisplay: [''],
        paarAppliedDate: [null as string | null],
        draftPaarReceivedDate: [null as string | null],
        consignmentNo: [''],
        paarValidatedDate: [null as string | null],
        paarProcessDate: [null as string | null],
        paarReceivedDate: [null as string | null],
        paarAmendmentDate: [null as string | null],
        paarRemarks: ['', [paarRemarksRequiredWhenAmendmentValidator()]],
        paarNo: [''],
        eta: [null as string | null],
        idecApplicable: [false],
        idecResponseDate: [null as string | null, [idecResponseDateRequiredValidator()]],
        specialDutyWaiver: [false],
        rotationNo: [''],
        terminalCode: [''],
        commandCode: [''],
        dutyDraftAssessedDate: [null as string | null],
        dutyDraftSentDate: [null as string | null],
        dutyDraftApprovedDate: [null as string | null],
        dutyFinalProcessedDate: [null as string | null],
        dutyFinalSentDate: [null as string | null],
        dutyPaidBy: ['Client' as DutyPaidBy, Validators.required],
        dutyPaidDate: [null as string | null],
        dutyReceiptReceivedDate: [null as string | null],
        cNo: [''],
      },
      { validators: [sequenceValidator()] }
    );

    this.form.get('paarAmendmentDate')?.valueChanges.subscribe(() => {
      this.form.get('paarRemarks')?.updateValueAndValidity();
    });
    this.form.get('idecApplicable')?.valueChanges.subscribe(() => {
      this.form.get('idecResponseDate')?.updateValueAndValidity();
    });
  }

  private registerValueChangeHandlers(): void {
    const sub1 = this.form.get('paarAppliedDate')?.valueChanges.subscribe(() => this.calculatePaarDelay());
    const sub2 = this.form.get('paarReceivedDate')?.valueChanges.subscribe(() => this.calculatePaarDelay());
    const sub3 = this.form.get('eta')?.valueChanges.subscribe(() => this.checkEtaWarning());
    const sub4 = this.form
      .get('dutyDraftAssessedDate')
      ?.valueChanges.subscribe((v) => this.onDutyDraftAssessedChange(v));
    const sub5 = this.form
      .get('dutyFinalProcessedDate')
      ?.valueChanges.subscribe((v) => this.onDutyFinalProcessedChange(v));
    const sub6 = this.form.get('dutyPaidDate')?.valueChanges.subscribe((v) => this.onDutyPaidChange(v));

    this.subscription = () => {
      sub1?.unsubscribe();
      sub2?.unsubscribe();
      sub3?.unsubscribe();
      sub4?.unsubscribe();
      sub5?.unsubscribe();
      sub6?.unsubscribe();
    };
  }

  private calculatePaarDelay(): void {
    const applied = this.form.get('paarAppliedDate')?.value;
    const received = this.form.get('paarReceivedDate')?.value;
    if (!received) {
      this.paarProcessingDelayDays.set(null);
      this.showPaarDelayBadge.set(false);
      return;
    }
    if (!applied) {
      this.paarProcessingDelayDays.set(null);
      this.showPaarDelayBadge.set(false);
      return;
    }
    const appliedTime = new Date(applied).getTime();
    const receivedTime = new Date(received).getTime();
    const days = Math.round((receivedTime - appliedTime) / (1000 * 60 * 60 * 24));
    this.paarProcessingDelayDays.set(days);
    this.showPaarDelayBadge.set(true);
    this.paarDelayBadgeClass.set(days > 0 ? 'bg-danger' : days === 0 ? 'bg-success' : 'bg-success');
  }

  private patchAutoFillFromParent(): void {
    const patch: Record<string, string | null> = {};
    if (this.autoEta) patch['eta'] = this.autoEta;
    if (this.autoShippingLine) patch['shippingLineDisplay'] = this.autoShippingLine;
    if (this.autoTerminalName) patch['terminalNameDisplay'] = this.autoTerminalName;
    if (Object.keys(patch).length) {
      this.form.patchValue(patch, { emitEvent: false });
    }
  }

  private checkEtaWarning(): void {
    const eta = this.form.get('eta')?.value;
    const atdVal = this.atd;
    if (!eta || !atdVal) {
      this.showEtaWarning.set(false);
      return;
    }
    this.showEtaWarning.set(new Date(eta) < new Date(atdVal));
  }

  private onDutyDraftAssessedChange(value: string | null): void {
    if (value) {
      this.form.patchValue(
        { dutyDraftSentDate: new Date().toISOString().slice(0, 19).replace('T', ' ') },
        { emitEvent: false }
      );
    }
  }

  private onDutyFinalProcessedChange(value: string | null): void {
    if (value) {
      this.form.patchValue(
        { dutyFinalSentDate: new Date().toISOString().slice(0, 19).replace('T', ' ') },
        { emitEvent: false }
      );
    }
  }

  private onDutyPaidChange(value: string | null): void {
    if (value) {
      this.form.patchValue(
        { dutyReceiptReceivedDate: new Date().toISOString().slice(0, 19).replace('T', ' ') },
        { emitEvent: false }
      );
    }
  }

  private updateSequenceError(): void {
    const err = this.form.errors?.['sequenceBroken'];
    if (err?.stage) {
      this.sequenceError.set(`Sequence broken: Complete "${err.stage}" before proceeding.`);
    } else {
      this.sequenceError.set(null);
    }
  }

  get copyShippingDocsReceived(): AbstractControl | null {
    return this.form?.get('copyShippingDocsReceived');
  }

  get originalShippingDocsReceived(): AbstractControl | null {
    return this.form?.get('originalShippingDocsReceived');
  }

  get copyBLReceived(): AbstractControl | null {
    return this.form?.get('copyBLReceived');
  }

  get originalBLReceived(): AbstractControl | null {
    return this.form?.get('originalBLReceived');
  }

  get blNo(): AbstractControl | null {
    return this.form?.get('blNo');
  }

  get paarRemarks(): AbstractControl | null {
    return this.form?.get('paarRemarks');
  }

  get idecResponseDate(): AbstractControl | null {
    return this.form?.get('idecResponseDate');
  }

  patchValue(value: Partial<PreArrivalModel>): void {
    this.form.patchValue(value, { emitEvent: true });
    this.calculatePaarDelay();
    this.checkEtaWarning();
    const draft = value.dutyDraftAssessedDate;
    const final = value.dutyFinalProcessedDate;
    const paid = value.dutyPaidDate;
    if (draft && !this.form.get('dutyDraftSentDate')?.value) {
      this.form.patchValue(
        { dutyDraftSentDate: new Date().toISOString().slice(0, 19).replace('T', ' ') },
        { emitEvent: false }
      );
    }
    if (final && !this.form.get('dutyFinalSentDate')?.value) {
      this.form.patchValue(
        { dutyFinalSentDate: new Date().toISOString().slice(0, 19).replace('T', ' ') },
        { emitEvent: false }
      );
    }
    if (paid && !this.form.get('dutyReceiptReceivedDate')?.value) {
      this.form.patchValue(
        { dutyReceiptReceivedDate: new Date().toISOString().slice(0, 19).replace('T', ' ') },
        { emitEvent: false }
      );
    }
  }

  onSave(): void {
    this.form.updateValueAndValidity();
    this.updateSequenceError();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.sequenceError.set(null);
    this.save.emit(this.form.getRawValue() as PreArrivalModel);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
