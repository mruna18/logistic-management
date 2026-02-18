import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import type { ExportTeamDocumentationModel, DocumentProcessedBy } from '../../models/export-shipment.model';

const PROCESSED_BY_OPTIONS: DocumentProcessedBy[] = ['Client', 'Agent'];

@Component({
  selector: 'app-export-team-documentation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './export-team-documentation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportTeamDocumentationComponent implements OnInit, OnChanges {
  @Input() initialValue: Partial<ExportTeamDocumentationModel> | null = null;
  @Input() disabled = false;
  @Output() save = new EventEmitter<ExportTeamDocumentationModel>();

  form!: FormGroup;
  readonly processedByOptions = PROCESSED_BY_OPTIONS;

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
    if (this.initialValue) this.patchValue(this.initialValue);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValue'] && this.form && changes['initialValue'].currentValue) {
      this.patchValue(changes['initialValue'].currentValue);
    }
    if (changes['disabled'] && this.form) {
      this.disabled ? this.form.disable() : this.form.enable();
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      salesOwner: [''],
      customerServiceOwner: [''],
      clearingAgent: [''],
      fileCloseSubmittedForInvoicingDate: [null as string | null],
      nxpRequired: [false],
      nxpDateProcessed: [null as string | null],
      nxpDateReceived: [null as string | null],
      nxpProcessedBy: ['Client' as DocumentProcessedBy],
      nxpNo: [null as string | null],
      bookingRequired: [false],
      bookingDateProcessed: [null as string | null],
      bookingDateReceived: [null as string | null],
      bookingProcessedBy: ['Client' as DocumentProcessedBy],
      bookingNo: [null as string | null],
      shippingLineName: [''],
      equipmentReleaseRequired: [false],
      equipmentReleaseDateProcessed: [null as string | null],
      equipmentReleaseDateReceived: [null as string | null],
      equipmentReleaseProcessedBy: ['Client' as DocumentProcessedBy],
      emptyPickupYard: [null as string | null],
      inspectionAgencyName: ['Neroli'],
      inspectionAgencyRequired: [false],
      inspectionAgencyDateProcessed: [null as string | null],
      inspectionAgencyDateReceived: [null as string | null],
      inspectionAgencyProcessedBy: ['Client' as DocumentProcessedBy],
      federalProduceRequired: [false],
      federalProduceDateProcessed: [null as string | null],
      federalProduceDateReceived: [null as string | null],
      federalProduceProcessedBy: ['Client' as DocumentProcessedBy],
      quarantineRequired: [false],
      quarantineDateProcessed: [null as string | null],
      quarantineDateReceived: [null as string | null],
      quarantineProcessedBy: ['Client' as DocumentProcessedBy],
    });
  }

  private patchValue(v: Partial<ExportTeamDocumentationModel>): void {
    this.form.patchValue(v, { emitEvent: false });
  }

  onSave(): void {
    if (this.form.disabled) return;
    this.save.emit(this.form.getRawValue() as ExportTeamDocumentationModel);
  }
}
