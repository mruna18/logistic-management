import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DynamicFieldConfig } from '../../models/dynamic-form.model';

@Component({
  selector: 'app-dynamic-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [formGroup]="group" [class]="config.className || 'col-12'" [hidden]="config.hidden">
      <div class="mb-2">
        <label [for]="config.name" class="form-label small fw-medium mb-1">
          {{ config.label }}
          <span *ngIf="isRequired" class="text-danger">*</span>
        </label>

        <ng-container [ngSwitch]="config.type">
          <!-- Text, Email, Password, Number, Date -->
          <input *ngSwitchCase="'text'" [type]="config.type" [formControlName]="config.name"
                 [id]="config.name" [placeholder]="config.placeholder || ''"
                 class="form-control form-control-sm shadow-sm">
          
          <input *ngSwitchCase="'number'" type="number" [formControlName]="config.name"
                 [id]="config.name" [placeholder]="config.placeholder || ''"
                 class="form-control form-control-sm shadow-sm">

          <input *ngSwitchCase="'email'" type="email" [formControlName]="config.name"
                 [id]="config.name" [placeholder]="config.placeholder || ''"
                 class="form-control form-control-sm shadow-sm">

          <input *ngSwitchCase="'date'" type="date" [formControlName]="config.name"
                 [id]="config.name" class="form-control form-control-sm shadow-sm">

          <!-- Select -->
          <select *ngSwitchCase="'select'" [formControlName]="config.name"
                  [id]="config.name" class="form-select form-select-sm shadow-sm">
            <option value="" disabled>{{ config.placeholder || 'Select option' }}</option>
            <option *ngFor="let opt of config.options" [value]="opt.value">{{ opt.label }}</option>
          </select>

          <!-- Checkbox -->
          <div *ngSwitchCase="'checkbox'" class="form-check mt-1">
            <input type="checkbox" [formControlName]="config.name" [id]="config.name"
                   class="form-check-input shadow-sm">
            <label [for]="config.name" class="form-check-label small">{{ config.label }}</label>
          </div>

          <!-- Textarea -->
          <textarea *ngSwitchCase="'textarea'" [formControlName]="config.name"
                    [id]="config.name" [placeholder]="config.placeholder || ''"
                    class="form-control form-control-sm shadow-sm" rows="3"></textarea>
        </ng-container>

        <!-- Validation Messages -->
        <ng-container *ngFor="let validation of config.validations">
          <div class="text-danger mt-1" style="font-size: 0.75rem;"
               *ngIf="group.get(config.name)?.hasError(validation.name) && (group.get(config.name)?.touched || group.get(config.name)?.dirty)">
            {{ validation.message }}
          </div>
        </ng-container>
      </div>
    </div>
  `
})
export class DynamicFieldComponent {
  @Input() config!: DynamicFieldConfig;
  @Input() group!: FormGroup;

  get isRequired(): boolean {
    return this.config.validations?.some(v => v.name === 'required') || false;
  }
}
