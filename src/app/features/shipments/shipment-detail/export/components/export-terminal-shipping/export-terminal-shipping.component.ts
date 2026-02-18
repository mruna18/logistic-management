import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import type { ExportTerminalShippingModel } from '../../models/export-shipment.model';

const TERMINALS = ['APMT', 'TICT', 'P&C', 'PTML'];
const SHIPPING_LINES = ['MSC', 'MAERSK', 'CMA CGM', 'Hapag-Lloyd', 'ONE', 'Evergreen', 'Cosco', 'PIL'];

@Component({
  selector: 'app-export-terminal-shipping',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
      additionalTerminalDnReceived: [null as string | null],
      additionalTerminalDnPaid: [null as string | null],
      additionalTerminalValidTill: [null as string | null],
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
    this.save.emit(this.form.getRawValue() as ExportTerminalShippingModel);
  }
}
