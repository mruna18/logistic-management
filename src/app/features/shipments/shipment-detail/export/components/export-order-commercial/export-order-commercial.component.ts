import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import type {
  ExportOrderCommercialModel,
  ExportFileStatus,
  ExportApprovalMode,
  ExportShipmentMode,
  ExportJobType,
} from '../../models/export-shipment.model';
import { JobScope } from '../../../../../../shared/enums/import-process.enum';

const FILE_STATUSES: ExportFileStatus[] = ['Quoted', 'Approved', 'Cancelled'];
const APPROVAL_MODES: ExportApprovalMode[] = ['Approved Quote', 'PO', 'Advance Payment'];
const SHIPMENT_MODES: ExportShipmentMode[] = ['Sea', 'Air', 'Road'];
const JOB_TYPES: ('Import' | 'Export')[] = ['Import', 'Export'];
const CONTAINER_TYPES = ['20ft', '40ft', 'Reefer', '20ft Dry Storage', '40ft Dry Storage', '40ft High Cube', 'Flat Rack', 'Open Top'];

@Component({
  selector: 'app-export-order-commercial',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './export-order-commercial.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportOrderCommercialComponent implements OnInit, OnChanges {
  @Input() initialValue: Partial<ExportOrderCommercialModel> | null = null;
  @Input() companyCode = 'CLE';
  @Input() clientName = '';
  @Input() clientCode = 'CLI';
  @Input() disabled = false;
  @Output() save = new EventEmitter<ExportOrderCommercialModel>();

  form!: FormGroup;
  readonly fileStatuses = FILE_STATUSES;
  readonly approvalModes = APPROVAL_MODES;
  readonly shipmentModes = SHIPMENT_MODES;
  readonly jobTypes = JOB_TYPES;
  readonly containerTypes = CONTAINER_TYPES;
  readonly jobScopes = Object.values(JobScope);

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
    if (this.initialValue) this.patchValue(this.initialValue);
    this.registerCalculations();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValue'] && this.form && changes['initialValue'].currentValue) {
      this.patchValue(changes['initialValue'].currentValue);
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      orderNo: [this.generateOrderNo(), Validators.required],
      fileStatus: ['Quoted', Validators.required],
      fileStatusDate: [null as string | null],
      approvalMode: ['Approved Quote', Validators.required],
      approvalDate: [null as string | null],
      pfiNumber: ['', Validators.required],
      pfiDate: [null as string | null],
      supplierName: ['', Validators.required],
      buyerName: ['', Validators.required],
      containerCount: [1, [Validators.required, Validators.min(1)]],
      containerType: ['', Validators.required],
      productDescription: ['', Validators.required],
      hsCode: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]],
      value: [0, [Validators.required, Validators.min(0)]],
      exWorks: [0, [Validators.required, Validators.min(0)]],
      fob: [0, [Validators.required, Validators.min(0)]],
      freight: [0, [Validators.required, Validators.min(0)]],
      cnf: [{ value: 0, disabled: true }],
      marineInsurance: [{ value: 0, disabled: true }],
      totalCif: [{ value: 0, disabled: true }],
      shipmentMode: ['Sea', Validators.required],
      jobType: ['Export', Validators.required],
      scope: [[] as string[]],
      additionalFileDetails: [''],
    });
  }

  private generateOrderNo(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const clientCode = this.clientCode || this.deriveClientCode(this.clientName);
    const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
    return `${this.companyCode}-${year}${month}-${clientCode}-${seq}`;
  }

  private deriveClientCode(name: string): string {
    if (!name?.trim()) return 'CLI';
    return name
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 5);
  }

  private registerCalculations(): void {
    ['exWorks', 'fob', 'freight'].forEach((ctrl) => {
      this.form.get(ctrl)?.valueChanges.subscribe(() => this.recalculateCommercials());
    });
  }

  private recalculateCommercials(): void {
    const exWorks = Number(this.form.get('exWorks')?.value) || 0;
    const fob = Number(this.form.get('fob')?.value) || 0;
    const freight = Number(this.form.get('freight')?.value) || 0;
    const cnf = exWorks + fob + freight;
    const marineInsurance = cnf * 0.015 * 1.1;
    const totalCif = cnf + marineInsurance;
    this.form.get('cnf')?.setValue(cnf, { emitEvent: false });
    this.form.get('marineInsurance')?.setValue(marineInsurance, { emitEvent: false });
    this.form.get('totalCif')?.setValue(totalCif, { emitEvent: false });
  }

  private patchValue(v: Partial<ExportOrderCommercialModel>): void {
    this.form.patchValue(v, { emitEvent: false });
    this.recalculateCommercials();
  }

  onSave(): void {
    if (this.form.invalid || this.form.disabled) return;
    const raw = this.form.getRawValue();
    this.save.emit(raw as ExportOrderCommercialModel);
  }

  toggleScope(scope: string | JobScope): void {
    const current: string[] = this.form.get('scope')?.value ?? [];
    const idx = current.indexOf(scope);
    const next = idx >= 0 ? current.filter((_, i) => i !== idx) : [...current, scope];
    this.form.get('scope')?.setValue(next);
  }
}
