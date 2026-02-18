import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormField } from '../../models/form-field.model';

@Component({
  selector: 'app-textarea-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [formGroup]="group" [class]="config.className || 'col-12'">
      <label [for]="config.key" class="form-label small mb-1">
        {{ config.label }}
        <span *ngIf="config.required" class="text-danger">*</span>
      </label>
      <textarea
        [id]="config.key"
        [formControlName]="config.key"
        [placeholder]="config.placeholder || ''"
        class="form-control form-control-sm shadow-sm"
        rows="3"
        [class.is-invalid]="group.get(config.key)?.touched && group.get(config.key)?.invalid"
      ></textarea>
      <div class="invalid-feedback small" *ngIf="group.get(config.key)?.touched && group.get(config.key)?.invalid">
        {{ config.label }} is required
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextareaFieldComponent {
  @Input() config!: FormField;
  @Input() group!: FormGroup;
}
