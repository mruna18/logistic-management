import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, FormsModule } from '@angular/forms';
import type { ExportTerminalShippingModel } from '../../models/export-shipment.model';

const TERMINALS = ['APMT', 'TICT', 'P&C', 'PTML'];
const SHIPPING_LINES = ['MSC', 'MAERSK', 'CMA CGM', 'Hapag-Lloyd', 'ONE', 'Evergreen', 'Cosco', 'PIL'];

@Component({
  selector: 'app-export-terminal-shipping',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule],
  templateUrl: './export-terminal-shipping.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportTerminalShippingComponent implements OnInit, OnChanges {
  @Input() initialValue: Partial<ExportTerminalShippingModel> | null = null;
  @Input() lastContainerGatedIn: string | null = null;
  /** Shipping line from Window 3 (Transport & Stuffing) - pre-fills when provided */
  @Input() shippingLineFromTransport = '';
  @Input() disabled = false;
  @Output() save = new EventEmitter<ExportTerminalShippingModel>();

  form!: FormGroup;
  readonly terminals = TERMINALS;
  readonly shippingLines = SHIPPING_LINES;
  readonly freightPaidByOptions = ['Client', 'Agent'] as const;

  constructor(private readonly fb: FormBuilder) {}

  get additionalTerminalDns(): FormArray {
    return this.form.get('additionalTerminalDns') as FormArray;
  }

  addAdditionalTerminal() {
    const grp = this.fb.group({
      additionalTerminalDnReceived: [null as string | null],
      additionalTerminalDnPaid: [null as string | null],
      additionalTerminalValidTill: [null as string | null],
    });
    this.additionalTerminalDns.push(grp);
  }

  // Shipping dynamic entries (additional shipping DN array)
  get additionalShippingDns(): FormArray {
    return (this.form.get('additionalShippingDns') as FormArray) || (this.form.get('additionalShippingDns') as FormArray);
  }

  createAdditionalShippingEntry(data?: { received?: string | null; paid?: string | null; validTill?: string | null }) {
    return this.fb.group({
      additionalShippingDnReceived: [data?.received ?? null],
      additionalShippingDnPaid: [
        data?.paid ?? null,
        [/* reuse date validators if needed */],
      ],
      additionalShippingValidTill: [data?.validTill ?? null],
    });
  }

  addAdditionalShipping() {
    if (!this.form.get('additionalShippingDns')) {
      this.form.addControl('additionalShippingDns', this.fb.array([]));
    }
    (this.form.get('additionalShippingDns') as FormArray).push(this.createAdditionalShippingEntry());
  }

  removeAdditionalShippingDn(index: number) {
    const arr = this.form.get('additionalShippingDns') as FormArray;
    if (arr && index >= 0 && index < arr.length) arr.removeAt(index);
  }

  ngOnInit(): void {
    this.buildForm();
    if (this.initialValue) this.form.patchValue(this.initialValue);
    if (this.lastContainerGatedIn) this.form.patchValue({ lastContainerGatedIn: this.lastContainerGatedIn });
    if (this.shippingLineFromTransport) this.form.patchValue({ shippingLine: this.shippingLineFromTransport });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValue'] && this.form && changes['initialValue'].currentValue) {
      this.form.patchValue(changes['initialValue'].currentValue);
    }
    if (changes['lastContainerGatedIn'] && this.form && this.lastContainerGatedIn != null) {
      this.form.patchValue({ lastContainerGatedIn: this.lastContainerGatedIn });
    }
    if (changes['shippingLineFromTransport'] && this.form && this.shippingLineFromTransport) {
      this.form.patchValue({ shippingLine: this.shippingLineFromTransport });
    }
    if (changes['disabled'] && this.form) {
      this.disabled ? this.form.disable() : this.form.enable();
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      terminalName: [''],
      terminalDnReceived: [null as string | null],
      terminalDnPaid: [null as string | null],
      terminalValidTill: [null as string | null],
      // support multiple additional terminal DN entries
      additionalTerminalDns: this.fb.array([]),
      lastContainerGatedIn: [null as string | null],
      shippingLine: [''],
      vesselName: [''],
      etd: [null as string | null],
      atd: [null as string | null],
      shippingFreightPaidBy: ['' as ExportTerminalShippingModel['shippingFreightPaidBy']],
      shippingFreightDnReceived: [null as string | null],
      shippingFreightDnPaid: [null as string | null],
      shippingLineLocalDnReceived: [null as string | null],
      shippingLineLocalDnPaid: [null as string | null],
      shippingLineLocalDnValidTill: [null as string | null],
      vesselPlanningSubmitted: [null as string | null],
      additionalShippingDnReceived: [null as string | null],
      additionalShippingDnPaid: [null as string | null],
      additionalShippingValidTill: [null as string | null],
      draftOblReceivedDateTime: [null as string | null],
      draftOblSentToClientDateTime: [null as string | null],
      draftOblApprovedByClientDateTime: [null as string | null],
      oblCollectionDateTime: [null as string | null],
      oblSubmittedToInvoicingDateTime: [null as string | null],
    });
  }

  onSave(): void {
    if (this.form.disabled) return;
    const raw = this.form.getRawValue();
    // map additionalTerminalDns array into legacy fields if any (keep compatibility)
    const payload = { ...(raw as any) } as ExportTerminalShippingModel & { additionalTerminalDns?: any[] };
    if (raw.additionalTerminalDns && raw.additionalTerminalDns.length) {
      payload.additionalTerminalDns = raw.additionalTerminalDns;
      // set latest valid till for compatibility
      const latest = raw.additionalTerminalDns.map((d: any) => d.additionalTerminalValidTill).filter(Boolean);
      if (latest.length) payload.additionalTerminalValidTill = latest.reduce((a: string, b: string) => (new Date(a) > new Date(b) ? a : b));
    }
    this.save.emit(payload);
  }
}
