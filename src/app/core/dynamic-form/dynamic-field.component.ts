import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormField } from '../../core/models/form-field.model';
import { InputFieldComponent } from './field-types/input-field.component';
import { SelectFieldComponent } from './field-types/select-field.component';
import { DateFieldComponent } from './field-types/date-field.component';
import { CheckboxFieldComponent } from './field-types/checkbox-field.component';
import { TextareaFieldComponent } from './field-types/textarea-field.component';

@Component({
  selector: 'app-erp-dynamic-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputFieldComponent,
    SelectFieldComponent,
    DateFieldComponent,
    CheckboxFieldComponent,
    TextareaFieldComponent
  ],
  template: `
    <ng-container *ngIf="isVisible">
      <ng-container [ngSwitch]="config.type">
        <app-input-field
          *ngSwitchCase="'text'"
          [config]="config"
          [group]="group"
        ></app-input-field>
        
        <app-input-field
          *ngSwitchCase="'number'"
          [config]="config"
          [group]="group"
        ></app-input-field>

        <app-select-field
          *ngSwitchCase="'select'"
          [config]="config"
          [group]="group"
        ></app-select-field>

        <app-date-field
          *ngSwitchCase="'date'"
          [config]="config"
          [group]="group"
        ></app-date-field>

        <app-checkbox-field
          *ngSwitchCase="'checkbox'"
          [config]="config"
          [group]="group"
        ></app-checkbox-field>

        <app-textarea-field
          *ngSwitchCase="'textarea'"
          [config]="config"
          [group]="group"
        ></app-textarea-field>
      </ng-container>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErpDynamicFieldComponent {
  @Input() config!: FormField;
  @Input() group!: FormGroup;
  @Input() userRoles: string[] = [];

  get isVisible(): boolean {
    if (this.config.visible === false) return false;
    
    if (this.config.rolePermissions && this.config.rolePermissions.length > 0) {
      return this.config.rolePermissions.some((role:any) => this.userRoles.includes(role));
    }
    
    return true;
  }
}
