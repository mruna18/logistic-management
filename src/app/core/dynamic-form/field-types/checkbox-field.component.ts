import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormField } from '../../models/form-field.model';

@Component({
  selector: 'app-checkbox-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [formGroup]="group" [class]="config.className || 'col-md-6' + ' d-flex align-items-center mt-4'">
      <div class="form-check">
        <input
          [id]="config.key"
          type="checkbox"
          [formControlName]="config.key"
          class="form-check-input shadow-sm"
        />
        <label [for]="config.key" class="form-check-label small">
          {{ config.label }}
          <span *ngIf="config.required" class="text-danger">*</span>
        </label>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxFieldComponent {
  @Input() config!: FormField;
  @Input() group!: FormGroup;
}
