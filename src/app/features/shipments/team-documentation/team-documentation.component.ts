import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ClosureSectionComponent } from './closure-section.component';
import { DocumentationTableComponent } from './documentation-table.component';
import { ErpDynamicFormComponent } from '../../../core/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../../core/services/dynamic-form.service';
import { FormSchema } from '../../../core/models/form-schema.model';

@Component({
  selector: 'app-team-documentation',
  standalone: true,
  inputs: ['disabled'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ClosureSectionComponent,
    DocumentationTableComponent,
    ErpDynamicFormComponent
  ],
  templateUrl: './team-documentation.component.html',
  styleUrls: ['./team-documentation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamDocumentationComponent implements OnInit, OnChanges {
  @Input() initialValue: import('./models/team-documentation.model').TeamDocumentationData | null = null;
  @Input() disabled = false;
  @Output() save = new EventEmitter<import('./models/team-documentation.model').TeamDocumentationData>();

  mainForm: FormGroup;
  isLoading = true;
  teamSchema$!: Observable<FormSchema>;

  constructor(
    private fb: FormBuilder, 
    private dynamicFormService: DynamicFormService,
    private cdr: ChangeDetectorRef
  ) {
    this.mainForm = this.fb.group({
      teamAssignment: this.fb.group({}), 
      formMDetails: this.fb.group({}),
      documents: this.fb.array([]),
      closureDetails: this.fb.group({
        fecdUpdated: [false],
        eirDate: [null],
        waybillDate: [null],
        terminalRefundDate: [null],
        shippingRefundDate: [null],
        fileClosedDate: [{ value: null, disabled: true }]
      })
    });
  }

  ngOnInit(): void {
    this.teamSchema$ = this.dynamicFormService.getShipmentTeamSchema();
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.markForCheck();
    }, 500);
    if (this.initialValue) {
      this.patchForm(this.initialValue);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValue']?.currentValue && this.mainForm) {
      this.patchForm(changes['initialValue'].currentValue);
    }
    if (changes['disabled'] && this.mainForm) {
      this.disabled ? this.mainForm.disable() : this.mainForm.enable();
    }
  }

  private patchForm(data: import('./models/team-documentation.model').TeamDocumentationData): void {
    this.mainForm.patchValue({
      teamAssignment: data.teamAssignment ?? {},
      formMDetails: data.formMDetails ?? {},
      closureDetails: data.fileClosure ?? {},
    });
    if (data.documents?.length) {
      const docsCtrl = this.mainForm.get('documents');
      if (docsCtrl) docsCtrl.setValue(data.documents);
    }
  }

  handleTeamFormSubmit(data: any): void {
    console.log('Team Data:', data);
    this.mainForm.get('teamAssignment')?.patchValue(data);
  }

  get teamFormGroup(): FormGroup {
    return this.mainForm.get('teamAssignment') as FormGroup;
  }

  get formMGroup(): FormGroup {
    return this.mainForm.get('formMDetails') as FormGroup;
  }

  get closureFormGroup(): FormGroup {
    return this.mainForm.get('closureDetails') as FormGroup;
  }

  onSave(): void {
    if (this.mainForm.valid && !this.disabled) {
      const raw = this.mainForm.getRawValue();
      const closure = raw.closureDetails ?? raw.fileClosure ?? {};
      const data: import('./models/team-documentation.model').TeamDocumentationData = {
        teamAssignment: raw.teamAssignment ?? { salesPersonId: '', customerServiceId: '', clearingAgentId: '' },
        fileClosure: {
          fecdUpdated: closure.fecdUpdated ?? false,
          eirDate: closure.eirDate ?? null,
          waybillDate: closure.waybillDate ?? null,
          terminalRefundDate: closure.terminalRefundDate ?? null,
          shippingRefundDate: closure.shippingRefundDate ?? null,
          fileClosedDate: closure.fileClosedDate ?? null,
        },
        documents: raw.documents ?? [],
        formMDetails: raw.formMDetails ?? {
          bankId: '',
          type: 'Not Valid for Forex',
          paymentMode: null,
          appliedDate: null,
          approvedDate: null,
          formMNumber: '',
          baNumber: '',
          specialRemarks: '',
        },
      };
      this.save.emit(data);
    } else {
      this.mainForm.markAllAsTouched();
    }
  }
}
