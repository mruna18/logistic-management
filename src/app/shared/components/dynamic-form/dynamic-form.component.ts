import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicSectionConfig, DynamicFieldConfig } from '../../models/dynamic-form.model';
import { DynamicFieldComponent } from '../dynamic-field/dynamic-field.component';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicFieldComponent],
  template: `
    <form *ngIf="form" [formGroup]="form" (ngSubmit)="onSubmit($event)">
      <div *ngFor="let section of sections" class="card shadow-sm mb-3">
        <div class="card-header bg-white py-2">
          <h6 class="mb-0 fw-bold text-primary small">{{ section.sectionTitle }}</h6>
        </div>
        <div class="card-body p-2">
          <div class="row g-2">
            <app-dynamic-field 
              *ngFor="let field of section.fields" 
              [config]="field" 
              [group]="form">
            </app-dynamic-field>
          </div>
        </div>
      </div>
      
      <div class="d-flex justify-content-end gap-2 mt-3" *ngIf="showSubmit">
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="onCancel()">Cancel</button>
        <button type="submit" class="btn btn-sm btn-primary px-3" [disabled]="form.invalid">
          {{ submitLabel }}
        </button>
      </div>
    </form>
  `
})
export class DynamicFormComponent implements OnInit {
  @Input() sections: DynamicSectionConfig[] = [];
  @Input() submitLabel: string = 'Save Changes';
  @Input() showSubmit: boolean = true;
  @Input() form?: FormGroup; // Optional existing form group
  @Output() submitForm = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    if (!this.form) {
      this.form = this.createGroup();
    } else {
      // Ensure existing form has controls for all fields
      this.sections.forEach(section => {
        section.fields.forEach(field => {
          if (!this.form?.get(field.name)) {
            const control = this.fb.control(
              { value: field.value !== undefined ? field.value : '', disabled: field.disabled },
              this.bindValidations(field.validations || [])
            );
            this.form?.addControl(field.name, control);
          }
        });
      });
    }
  }

  createGroup(): FormGroup {
    const group = this.fb.group({});
    this.sections.forEach(section => {
      section.fields.forEach(field => {
        const control = this.fb.control(
          { value: field.value !== undefined ? field.value : '', disabled: field.disabled },
          this.bindValidations(field.validations || [])
        );
        group.addControl(field.name, control);
      });
    });
    return group;
  }

  bindValidations(validations: any[]) {
    if (validations.length > 0) {
      const validList = validations.map(v => v.validator);
      return Validators.compose(validList);
    }
    return null;
  }

  onSubmit(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.form && this.form.valid) {
      this.submitForm.emit(this.form.value);
    } else {
      this.form?.markAllAsTouched();
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  // Helper method to patch values
  patchValue(value: any) {
    this.form?.patchValue(value);
  }
}
