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
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export type GoodsCollectionBy = 'Shipper' | 'Agent';
export type DocumentsCourieredBy = 'Direct' | 'Bank';

export const SHIPPING_LINES = ['Maersk', 'MSC', 'Hapag Lloyd', 'ONE', 'CMA CGM'] as const;
export type ShippingLine = (typeof SHIPPING_LINES)[number];

export interface OriginDetailsModel {
  goodsCollectionBy: GoodsCollectionBy;
  readinessEstimatedDate: string | null;
  readinessActualDate: string | null;
  shippingLine: ShippingLine;
  etd: string | null;
  atd: string | null;
  documentsCourieredBy: DocumentsCourieredBy | '';
  documentsCourierDate: string | null;
}

function atdNotBeforeEtdValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control.parent;
    if (!group) return null;
    const etd = group.get('etd')?.value;
    const atd = control.value;
    if (!etd || !atd) return null;
    if (new Date(atd) < new Date(etd)) {
      return { atdBeforeEtd: true };
    }
    return null;
  };
}

function documentsCourierDateRequiredValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control.parent;
    if (!group) return null;
    const courieredBy = group.get('documentsCourieredBy')?.value;
    const date = control.value;
    if (courieredBy && !date) {
      return { required: true };
    }
    return null;
  };
}

@Component({
  selector: 'app-origin-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './origin-details.component.html',
  styleUrl: './origin-details.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OriginDetailsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() formMApprovalDate: string | null = null;
  @Input() initialValue: Partial<OriginDetailsModel> | null = null;
  @Input() disabled = false;
  @Output() save = new EventEmitter<OriginDetailsModel>();

  readonly goodsCollectionByOptions: readonly GoodsCollectionBy[] = ['Shipper', 'Agent'];
  readonly shippingLines = SHIPPING_LINES;
  readonly documentsCourieredByOptions: readonly DocumentsCourieredBy[] = ['Direct', 'Bank'];

  form!: FormGroup;
  private readonly productionDelayDays = signal<number | null>(null);
  private readonly sailingDelayDays = signal<number | null>(null);
  readonly showProductionBadge = signal<boolean>(false);
  readonly showSailingBadge = signal<boolean>(false);
  readonly productionBadgeClass = signal<string>('');
  readonly sailingBadgeClass = signal<string>('');
  readonly showComplianceAlert = signal<boolean>(false);

  readonly productionBadgeText = computed(() => {
    const days = this.productionDelayDays();
    if (days === null) return '';
    return days > 0 ? `${days} day(s) delay` : days === 0 ? 'On time' : `${Math.abs(days)} day(s) early`;
  });

  readonly sailingBadgeText = computed(() => {
    const days = this.sailingDelayDays();
    if (days === null) return '';
    return days > 0 ? `${days} day(s) delay` : days === 0 ? 'On time' : `${Math.abs(days)} day(s) early`;
  });

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
    if (changes['formMApprovalDate'] && this.form) {
      this.checkCompliance();
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
      goodsCollectionBy: ['Shipper' as GoodsCollectionBy, Validators.required],
      readinessEstimatedDate: [null as string | null, Validators.required],
      readinessActualDate: [null as string | null],
      shippingLine: ['Maersk' as ShippingLine, Validators.required],
      etd: [null as string | null, Validators.required],
      atd: [null as string | null, [atdNotBeforeEtdValidator()]],
      documentsCourieredBy: ['' as DocumentsCourieredBy | ''],
      documentsCourierDate: [null as string | null, [documentsCourierDateRequiredValidator()]],
    });

    this.form.get('documentsCourieredBy')?.valueChanges.subscribe(() => {
      this.form.get('documentsCourierDate')?.updateValueAndValidity();
    });
  }

  private registerValueChangeHandlers(): void {
    const sub1 = this.form.get('readinessEstimatedDate')?.valueChanges.subscribe(() => this.calculateProductionDelay());
    const sub2 = this.form.get('readinessActualDate')?.valueChanges.subscribe(() => this.calculateProductionDelay());
    const sub3 = this.form.get('etd')?.valueChanges.subscribe(() => {
      this.calculateSailingDelay();
      this.checkCompliance();
    });
    const sub4 = this.form.get('atd')?.valueChanges.subscribe(() => {
      this.calculateSailingDelay();
      this.checkCompliance();
    });

    this.subscription = () => {
      sub1?.unsubscribe();
      sub2?.unsubscribe();
      sub3?.unsubscribe();
      sub4?.unsubscribe();
    };
  }

  private calculateProductionDelay(): void {
    const estimated = this.form.get('readinessEstimatedDate')?.value;
    const actual = this.form.get('readinessActualDate')?.value;
    if (!actual) {
      this.productionDelayDays.set(null);
      this.showProductionBadge.set(false);
      return;
    }
    if (!estimated) {
      this.productionDelayDays.set(null);
      this.showProductionBadge.set(false);
      return;
    }
    const est = new Date(estimated).getTime();
    const act = new Date(actual).getTime();
    const days = Math.round((act - est) / (1000 * 60 * 60 * 24));
    this.productionDelayDays.set(days);
    this.showProductionBadge.set(true);
    this.productionBadgeClass.set(days > 0 ? 'bg-danger' : days === 0 ? 'bg-success' : 'bg-success');
  }

  private calculateSailingDelay(): void {
    const etd = this.form.get('etd')?.value;
    const atd = this.form.get('atd')?.value;
    if (!atd) {
      this.sailingDelayDays.set(null);
      this.showSailingBadge.set(false);
      return;
    }
    if (!etd) {
      this.sailingDelayDays.set(null);
      this.showSailingBadge.set(false);
      return;
    }
    const etdTime = new Date(etd).getTime();
    const atdTime = new Date(atd).getTime();
    const days = Math.round((atdTime - etdTime) / (1000 * 60 * 60 * 24));
    this.sailingDelayDays.set(days);
    this.showSailingBadge.set(true);
    this.sailingBadgeClass.set(days > 0 ? 'bg-danger' : days === 0 ? 'bg-success' : 'bg-success');
  }

  private checkCompliance(): void {
    const atd = this.form.get('atd')?.value;
    const formMDate = this.formMApprovalDate;
    if (!atd || !formMDate) {
      this.showComplianceAlert.set(false);
      return;
    }
    if (new Date(atd) < new Date(formMDate)) {
      this.showComplianceAlert.set(true);
    } else {
      this.showComplianceAlert.set(false);
    }
  }

  get goodsCollectionBy(): AbstractControl | null {
    return this.form.get('goodsCollectionBy');
  }

  get readinessEstimatedDate(): AbstractControl | null {
    return this.form.get('readinessEstimatedDate');
  }

  get readinessActualDate(): AbstractControl | null {
    return this.form.get('readinessActualDate');
  }

  get shippingLine(): AbstractControl | null {
    return this.form.get('shippingLine');
  }

  get etd(): AbstractControl | null {
    return this.form.get('etd');
  }

  get atd(): AbstractControl | null {
    return this.form.get('atd');
  }

  get documentsCourieredBy(): AbstractControl | null {
    return this.form.get('documentsCourieredBy');
  }

  get documentsCourierDate(): AbstractControl | null {
    return this.form.get('documentsCourierDate');
  }

  patchValue(value: Partial<OriginDetailsModel>): void {
    this.form.patchValue(value, { emitEvent: true });
    this.calculateProductionDelay();
    this.calculateSailingDelay();
    this.checkCompliance();
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit(this.form.getRawValue() as OriginDetailsModel);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
