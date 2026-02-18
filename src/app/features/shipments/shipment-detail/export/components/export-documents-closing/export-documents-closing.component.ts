import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import type { ExportDocumentsClosingModel } from '../../models/export-shipment.model';

@Component({
  selector: 'app-export-documents-closing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './export-documents-closing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportDocumentsClosingComponent implements OnInit, OnChanges {
  @Input() initialValue: Partial<ExportDocumentsClosingModel> | null = null;
  @Input() disabled = false;
  @Output() save = new EventEmitter<ExportDocumentsClosingModel>();

  form!: FormGroup;

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
      fumigationCertificateCollectedDateTime: [null as string | null],
      phytosanitaryCertificateCollectedDateTime: [null as string | null],
      customsFinalClosingDocsCollectedDateTime: [null as string | null],
      inspectionActDateTime: [null as string | null],
      stampedSgdDateTime: [null as string | null],
      stampedNxpDateTime: [null as string | null],
      allCompleteDocsSubmittedToInvoicingDateTime: [null as string | null],
    });
  }

  onSave(): void {
    if (this.form.disabled) return;
    this.save.emit(this.form.getRawValue() as ExportDocumentsClosingModel);
  }
}
