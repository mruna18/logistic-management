import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import type { ExportInspectionsCustomsModel } from '../../models/export-shipment.model';

@Component({
  selector: 'app-export-inspections-customs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './export-inspections-customs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportInspectionsCustomsComponent implements OnInit, OnChanges {
  @Input() initialValue: Partial<ExportInspectionsCustomsModel> | null = null;
  @Input() disabled = false;
  @Output() save = new EventEmitter<ExportInspectionsCustomsModel>();

  form!: FormGroup;
  readonly processedByOptions = ['Client', 'Agent'] as const;

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
    if (this.initialValue) this.form.patchValue(this.initialValue);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValue'] && this.form && changes['initialValue'].currentValue) {
      this.form.patchValue(changes['initialValue'].currentValue);
    }
    if (changes['disabled'] && this.form) {
      this.disabled ? this.form.disable() : this.form.enable();
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      vgmIssuedDate: [null as string | null],
      vgmSubmittedToShippingLineDate: [null as string | null],
      packingListInvoiceReceivedDate: [null as string | null],
      packingListInvoiceUploadedDate: [null as string | null],
      cciProcessedDateTime: [null as string | null],
      cciReceivedDateTime: [null as string | null],
      nessDnReceivedDate: [null as string | null],
      nessDnProcessedBy: ['' as ExportInspectionsCustomsModel['nessDnProcessedBy']],
      nessDnPaidDate: [null as string | null],
      nessPaymentReceiptUploadedDate: [null as string | null],
      applicationForInspectionByCustomsDateTime: [null as string | null],
      dtiPrepareSgdDateTime: [null as string | null],
      examinationWithCustomsAgencyDateTime: [null as string | null],
      releaseByCustomsAgencyDateTime: [null as string | null],
      exportReleaseDocsToShippingLineDateTime: [null as string | null],
      shippingInstructionToShippingLineDateTime: [null as string | null],
      remarks: [''],
    });
  }

  onSave(): void {
    if (this.form.disabled) return;
    this.save.emit(this.form.getRawValue() as ExportInspectionsCustomsModel);
  }
}
