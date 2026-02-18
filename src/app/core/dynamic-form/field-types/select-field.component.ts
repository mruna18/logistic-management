import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormField } from '../../models/form-field.model';

@Component({
  selector: 'app-select-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [formGroup]="group" [class]="config.className || 'col-md-6'">
      <label [for]="config.key" class="form-label small mb-1">
        {{ config.label }}
        <span *ngIf="config.required" class="text-danger">*</span>
      </label>
      <select
        [id]="config.key"
        [formControlName]="config.key"
        class="form-select form-select-sm shadow-sm"
        [class.is-invalid]="group.get(config.key)?.touched && group.get(config.key)?.invalid"
      >
        <option value="" disabled>{{ config.placeholder || 'Select ' + config.label }}</option>
        <option *ngFor="let opt of config.options" [value]="opt.value">
          {{ opt.label }}
        </option>
      </select>
      <div class="invalid-feedback small" *ngIf="group.get(config.key)?.touched && group.get(config.key)?.invalid">
        Please select {{ config.label }}
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectFieldComponent {
  @Input() config!: FormField;
  @Input() group!: FormGroup;
}
