import { 
  ChangeDetectionStrategy, 
  Component, 
  EventEmitter, 
  Input, 
  OnChanges, 
  Output, 
  SimpleChanges 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  FormBuilder, 
  FormGroup, 
  ReactiveFormsModule, 
  Validators 
} from '@angular/forms';
import { FormSchema, FormSection } from '../../core/models/form-schema.model';
import { FormField } from '../../core/models/form-field.model';
import { ErpDynamicFieldComponent } from './dynamic-field.component';

@Component({
  selector: 'app-erp-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErpDynamicFieldComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit($event)">
      <div *ngFor="let section of schema.sections; trackBy: trackBySection" class="card shadow-sm mb-3">
        <div class="card-header bg-white py-2">
          <h6 class="mb-0 fw-bold text-primary small">{{ section.sectionTitle }}</h6>
        </div>
        <div class="card-body p-3">
          <div class="row g-3">
            <app-erp-dynamic-field
              *ngFor="let field of section.fields; trackBy: trackByField"
              [config]="field"
              [group]="form"
              [userRoles]="userRoles"
            ></app-erp-dynamic-field>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-end gap-2 mt-3" *ngIf="showActions">
        <button type="button" class="btn btn-sm btn-outline-secondary px-4" (click)='onReset()'>Reset</button>
        <button type="submit" class="btn btn-sm btn-primary px-4" [disabled]="form.invalid">
          {{ submitLabel }}
        </button>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErpDynamicFormComponent implements OnChanges {
  @Input() schema!: FormSchema;
  @Input() userRoles: string[] = [];
  @Input() submitLabel: string = 'Save';
  @Input() showActions: boolean = true;
  @Input() initialData: any = {};

  @Output() formSubmit = new EventEmitter<any>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({});
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['schema'] && this.schema) {
      this.buildForm();
    }
    if (changes['initialData'] && this.initialData) {
      this.form.patchValue(this.initialData, { emitEvent: false });
    }
  }

  private buildForm(): void {
    const group = this.fb.group({});
    
    this.schema.sections.forEach((section:any) => {
      section.fields.forEach((field:any) => {
        const validators = [];
        if (field.required) {
          validators.push(Validators.required);
        }

        const control = this.fb.control(
          { 
            value: field.value !== undefined ? field.value : '', 
            disabled: field.editable === false 
          },
          validators
        );
        
        group.addControl(field.key, control);
      });
    });

    this.form = group;
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    if (this.form.valid) {
      this.formSubmit.emit(this.form.getRawValue());
    } else {
      this.form.markAllAsTouched();
    }
  }

  onReset(): void {
    this.form.reset(this.initialData || {});
  }

  trackBySection(index: number, section: FormSection): string {
    return section.sectionTitle;
  }

  trackByField(index: number, field: FormField): string {
    return field.key;
  }
}
