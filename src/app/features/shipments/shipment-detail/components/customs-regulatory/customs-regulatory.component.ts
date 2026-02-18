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
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { distinctUntilChanged } from 'rxjs';

export const CHANNELS = ['Examination', 'Scanning', 'Fastrack', 'AEO'] as const;
export type Channel = (typeof CHANNELS)[number];

const DEFAULT_COMMANDS = ['Apapa', 'Tincan', 'PTML', 'Kirikiri', 'Lekki', 'Alaro'] as const;
export type Command = (typeof DEFAULT_COMMANDS)[number] | string;

export type CustomsStatus = 'Under Clearance' | 'Query Pending' | 'Released' | 'Closed Compliance';
export type RegulatoryStatus = 'Not Applicable' | 'Blocked' | 'Query Pending' | 'Cleared' | 'In Progress';
export type ComplianceStatus = 'Regulatory Cleared' | 'Pending Compliance';

export interface CustomsRegulatoryModel {
  clearingAgent: string;
  channel: Channel;
  command: Command;
  copyDocsReceived: string | null;
  copyDutyReceiptReceived: string | null;
  customExaminationDate: string | null;
  customQuery: boolean;
  customQueryDate: string | null;
  customQueryResolvedDate: string | null;
  customReleaseDate: string | null;
  gateProcessDate: string | null;
  pcaDate: string | null;
  fouDate: string | null;
  ciuDate: string | null;
  escortApplicable: boolean;
  operationRemarks: string;
  trucksPassingProcessedDate: string | null;
  fecdProcessedDate: string | null;
  fecdStampedDate: string | null;
  fecdSubmittedToOfficeDate: string | null;
  fecdSubmittedToBankDate: string | null;
  nafdacApplicable: boolean;
  nafdacInvoiceRequestedDate: string | null;
  nafdacPaidDate: string | null;
  nafdacFirstStampingDate: string | null;
  nafdacSecondStampingDate: string | null;
  nafdacQueryDate: string | null;
  nafdacBlockDate: string | null;
  nafdacQueryResolvedDate: string | null;
  nafdacBlockResolvedDate: string | null;
  nafdacQueryDetail: string;
  sonApplicable: boolean;
  sonInvoiceRequestedDate: string | null;
  sonPaidDate: string | null;
  sonFirstStampingDate: string | null;
  sonSecondStampingDate: string | null;
  sonQueryDate: string | null;
  sonBlockDate: string | null;
  sonQueryResolvedDate: string | null;
  sonBlockResolvedDate: string | null;
  sonQueryDetail: string;
}

function dateNotBeforeValidator(beforeControlName: string): ValidatorFn {
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

function customQueryDateRequiredValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control.parent;
    if (!group) return null;
    const customQuery = group.get('customQuery')?.value;
    const val = control.value;
    if (customQuery && !val) return { required: true };
    return null;
  };
}

function customReleaseDateAllowedValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control.parent;
    if (!group) return null;
    const releaseDate = control.value;
    if (!releaseDate) return null;
    const dutyReceipt = group.get('copyDutyReceiptReceived')?.value;
    const customQuery = group.get('customQuery')?.value;
    const queryResolved = group.get('customQueryResolvedDate')?.value;
    if (!dutyReceipt) return { releaseBeforeDutyReceipt: true };
    if (customQuery && !queryResolved) return { releaseBeforeQueryResolved: true };
    return null;
  };
}

@Component({
  selector: 'app-customs-regulatory',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './customs-regulatory.component.html',
  styleUrl: './customs-regulatory.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomsRegulatoryComponent implements OnInit, OnDestroy, OnChanges {
  @Input() initialValue: Partial<CustomsRegulatoryModel> | null = null;
  @Input() dutyReceiptReceivedDate: string | null = null;
  @Input() disabled = false;
  @Output() save = new EventEmitter<CustomsRegulatoryModel>();

  readonly channels = CHANNELS;
  readonly CUSTOM_COMMAND_VALUE = '__CUSTOM__';
  commandsList: string[] = [...DEFAULT_COMMANDS];
  customCommandInput = '';

  addCustomCommand(): void {
    const trimmed = this.customCommandInput?.trim();
    if (!trimmed) return;
    if (!this.commandsList.includes(trimmed)) {
      this.commandsList = [...this.commandsList, trimmed];
    }
    this.form.get('command')?.setValue(trimmed);
    this.customCommandInput = '';
  }

  form!: FormGroup;

  readonly customsStatus = signal<CustomsStatus>('Under Clearance');
  readonly nafdacStatus = signal<RegulatoryStatus>('Not Applicable');
  readonly sonStatus = signal<RegulatoryStatus>('Not Applicable');
  readonly complianceStatus = signal<ComplianceStatus>('Pending Compliance');

  readonly customsStatusBadgeClass = computed(() => {
    const s = this.customsStatus();
    switch (s) {
      case 'Under Clearance': return 'bg-primary';
      case 'Query Pending': return 'bg-warning text-dark';
      case 'Released': return 'bg-success';
      case 'Closed Compliance': return 'bg-success';
      default: return 'bg-secondary';
    }
  });

  readonly nafdacStatusBadgeClass = computed(() => {
    const s = this.nafdacStatus();
    switch (s) {
      case 'Not Applicable': return 'bg-secondary';
      case 'Blocked': return 'bg-danger';
      case 'Query Pending': return 'bg-warning text-dark';
      case 'Cleared': return 'bg-success';
      case 'In Progress': return 'bg-primary';
      default: return 'bg-secondary';
    }
  });

  readonly sonStatusBadgeClass = computed(() => {
    const s = this.sonStatus();
    switch (s) {
      case 'Not Applicable': return 'bg-secondary';
      case 'Blocked': return 'bg-danger';
      case 'Query Pending': return 'bg-warning text-dark';
      case 'Cleared': return 'bg-success';
      case 'In Progress': return 'bg-primary';
      default: return 'bg-secondary';
    }
  });

  readonly complianceStatusBadgeClass = computed(() =>
    this.complianceStatus() === 'Regulatory Cleared' ? 'bg-success' : 'bg-warning text-dark'
  );

  private subscription: (() => void) | null = null;

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
    this.registerValueChangeHandlers();
    if (this.initialValue) {
      this.patchValue(this.initialValue);
    }
    if (this.disabled) {
      this.form.disable();
    }
  }

  ngOnDestroy(): void {
    this.subscription?.();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValue'] && this.form && changes['initialValue'].currentValue) {
      this.patchValue(changes['initialValue'].currentValue);
    }
    if (changes['disabled'] && this.form) {
      if (this.disabled) this.form.disable();
      else this.form.enable();
    }
    if (changes['dutyReceiptReceivedDate'] && this.form && this.dutyReceiptReceivedDate) {
      const current = this.form.get('copyDutyReceiptReceived')?.value;
      if (!current) {
        const normalized = this.dutyReceiptReceivedDate.slice(0, 10);
        this.form.patchValue(
          { copyDutyReceiptReceived: normalized },
          { emitEvent: false }
        );
      }
      this.form.get('customReleaseDate')?.updateValueAndValidity();
    }
    if ((changes['initialValue'] || changes['dutyReceiptReceivedDate']) && this.form) {
      this.form.get('customReleaseDate')?.updateValueAndValidity();
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      clearingAgent: [''],
      channel: ['Examination' as Channel, Validators.required],
      command: ['Apapa' as Command, Validators.required],
      copyDocsReceived: [null as string | null],
      copyDutyReceiptReceived: [null as string | null],
      customExaminationDate: [null as string | null],
      customQuery: [false],
      customQueryDate: [null as string | null, [customQueryDateRequiredValidator()]],
      customQueryResolvedDate: [
        null as string | null,
        [dateNotBeforeValidator('customQueryDate')],
      ],
      customReleaseDate: [null as string | null, [customReleaseDateAllowedValidator()]],
      gateProcessDate: [null as string | null, [dateNotBeforeValidator('customReleaseDate')]],
      pcaDate: [null as string | null],
      fouDate: [null as string | null],
      ciuDate: [null as string | null],
      escortApplicable: [false],
      operationRemarks: [''],
      trucksPassingProcessedDate: [null as string | null],
      fecdProcessedDate: [null as string | null],
      fecdStampedDate: [null as string | null, [dateNotBeforeValidator('fecdProcessedDate')]],
      fecdSubmittedToOfficeDate: [
        null as string | null,
        [dateNotBeforeValidator('fecdStampedDate')],
      ],
      fecdSubmittedToBankDate: [
        null as string | null,
        [dateNotBeforeValidator('fecdStampedDate')],
      ],
      nafdacApplicable: [false],
      nafdacInvoiceRequestedDate: [null as string | null],
      nafdacPaidDate: [null as string | null, [dateNotBeforeValidator('nafdacInvoiceRequestedDate')]],
      nafdacFirstStampingDate: [null as string | null],
      nafdacSecondStampingDate: [
        null as string | null,
        [dateNotBeforeValidator('nafdacFirstStampingDate')],
      ],
      nafdacQueryDate: [null as string | null],
      nafdacBlockDate: [null as string | null],
      nafdacQueryResolvedDate: [
        null as string | null,
        [dateNotBeforeValidator('nafdacQueryDate')],
      ],
      nafdacBlockResolvedDate: [
        null as string | null,
        [dateNotBeforeValidator('nafdacBlockDate')],
      ],
      nafdacQueryDetail: [''],
      sonApplicable: [false],
      sonInvoiceRequestedDate: [null as string | null],
      sonPaidDate: [null as string | null, [dateNotBeforeValidator('sonInvoiceRequestedDate')]],
      sonFirstStampingDate: [null as string | null],
      sonSecondStampingDate: [
        null as string | null,
        [dateNotBeforeValidator('sonFirstStampingDate')],
      ],
      sonQueryDate: [null as string | null],
      sonBlockDate: [null as string | null],
      sonQueryResolvedDate: [
        null as string | null,
        [dateNotBeforeValidator('sonQueryDate')],
      ],
      sonBlockResolvedDate: [
        null as string | null,
        [dateNotBeforeValidator('sonBlockDate')],
      ],
      sonQueryDetail: [''],
    });

    this.form.get('customQuery')?.valueChanges.subscribe(() => {
      this.form.get('customQueryDate')?.updateValueAndValidity();
      this.form.get('customReleaseDate')?.updateValueAndValidity();
    });
    this.form.get('copyDutyReceiptReceived')?.valueChanges.subscribe(() => {
      this.form.get('customReleaseDate')?.updateValueAndValidity();
    });
    this.form.get('customQueryResolvedDate')?.valueChanges.subscribe(() => {
      this.form.get('customReleaseDate')?.updateValueAndValidity();
    });
  }

  private registerValueChangeHandlers(): void {
    const sub = this.form.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
      this.calculateCustomsStatus();
      this.calculateNafdacStatus();
      this.calculateSonStatus();
      this.calculateOverallCompliance();
    });
    this.subscription = () => sub.unsubscribe();
  }

  private calculateCustomsStatus(): void {
    const releaseDate = this.form.get('customReleaseDate')?.value;
    const query = this.form.get('customQuery')?.value;
    const queryDate = this.form.get('customQueryDate')?.value;
    const queryResolved = this.form.get('customQueryResolvedDate')?.value;
    const fecdSubmitted = this.form.get('fecdSubmittedToOfficeDate')?.value;

    if (!releaseDate) {
      if (query && queryDate && !queryResolved) {
        this.customsStatus.set('Query Pending');
      } else {
        this.customsStatus.set('Under Clearance');
      }
      return;
    }
    const fecdToBank = this.form.get('fecdSubmittedToBankDate')?.value;
    if (fecdToBank || fecdSubmitted) {
      this.customsStatus.set('Closed Compliance');
    } else {
      this.customsStatus.set('Released');
    }
  }

  private calculateNafdacStatus(): void {
    const applicable = this.form.get('nafdacApplicable')?.value;
    if (!applicable) {
      this.nafdacStatus.set('Not Applicable');
      return;
    }
    const blockDate = this.form.get('nafdacBlockDate')?.value;
    const blockResolved = this.form.get('nafdacBlockResolvedDate')?.value;
    const queryDate = this.form.get('nafdacQueryDate')?.value;
    const queryResolved = this.form.get('nafdacQueryResolvedDate')?.value;
    const secondStamping = this.form.get('nafdacSecondStampingDate')?.value;

    if (blockDate && !blockResolved) {
      this.nafdacStatus.set('Blocked');
      return;
    }
    if (queryDate && !queryResolved) {
      this.nafdacStatus.set('Query Pending');
      return;
    }
    if (secondStamping) {
      this.nafdacStatus.set('Cleared');
    } else {
      this.nafdacStatus.set('In Progress');
    }
  }

  private calculateSonStatus(): void {
    const applicable = this.form.get('sonApplicable')?.value;
    if (!applicable) {
      this.sonStatus.set('Not Applicable');
      return;
    }
    const blockDate = this.form.get('sonBlockDate')?.value;
    const blockResolved = this.form.get('sonBlockResolvedDate')?.value;
    const queryDate = this.form.get('sonQueryDate')?.value;
    const queryResolved = this.form.get('sonQueryResolvedDate')?.value;
    const secondStamping = this.form.get('sonSecondStampingDate')?.value;

    if (blockDate && !blockResolved) {
      this.sonStatus.set('Blocked');
      return;
    }
    if (queryDate && !queryResolved) {
      this.sonStatus.set('Query Pending');
      return;
    }
    if (secondStamping) {
      this.sonStatus.set('Cleared');
    } else {
      this.sonStatus.set('In Progress');
    }
  }

  private calculateOverallCompliance(): void {
    const releaseDate = this.form.get('customReleaseDate')?.value;
    const nafdacStat = this.nafdacStatus();
    const sonStat = this.sonStatus();

    const customsReleased = !!releaseDate;
    const nafdacOk = nafdacStat === 'Cleared' || nafdacStat === 'Not Applicable';
    const sonOk = sonStat === 'Cleared' || sonStat === 'Not Applicable';

    this.complianceStatus.set(
      customsReleased && nafdacOk && sonOk ? 'Regulatory Cleared' : 'Pending Compliance'
    );
  }

  patchValue(value: Partial<CustomsRegulatoryModel>): void {
    const cmd = value?.command ? String(value.command) : '';
    if (cmd && cmd !== this.CUSTOM_COMMAND_VALUE && !this.commandsList.includes(cmd)) {
      this.commandsList = [...this.commandsList, cmd];
    }
    this.form.patchValue(value, { emitEvent: true });
    this.calculateCustomsStatus();
    this.calculateNafdacStatus();
    this.calculateSonStatus();
    this.calculateOverallCompliance();
  }

  onSave(): void {
    if (this.form.invalid || this.form.disabled) return;
    const raw = this.form.getRawValue();
    const payload: CustomsRegulatoryModel = {
      ...raw,
    };
    this.save.emit(payload);
  }

  get customQueryDate(): AbstractControl | null {
    return this.form?.get('customQueryDate');
  }
  get customQueryResolvedDate(): AbstractControl | null {
    return this.form?.get('customQueryResolvedDate');
  }
  get gateProcessDate(): AbstractControl | null {
    return this.form?.get('gateProcessDate');
  }
  get fecdStampedDate(): AbstractControl | null {
    return this.form?.get('fecdStampedDate');
  }
  get fecdSubmittedToOfficeDate(): AbstractControl | null {
    return this.form?.get('fecdSubmittedToOfficeDate');
  }

  trackByIndex(index: number): number {
    return index;
  }
}
