import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErpDynamicFormComponent } from '../../../core/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../../core/services/dynamic-form.service';
import { FormSchema } from '../../../core/models/form-schema.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dynamic-form-demo',
  standalone: true,
  imports: [CommonModule, ErpDynamicFormComponent],
  template: `
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="mb-0 fw-bold">Dynamic Form Engine Demo</h4>
          <p class="text-muted small">Metadata-driven forms for Logistics ERP</p>
        </div>
        <div class="btn-group shadow-sm">
          <button 
            class="btn btn-sm" 
            [class.btn-primary]="selectedCompany === 'DEFAULT'"
            [class.btn-outline-primary]="selectedCompany !== 'DEFAULT'"
            (click)="loadSchema('DEFAULT')">
            Default Config
          </button>
          <button 
            class="btn btn-sm" 
            [class.btn-primary]="selectedCompany === 'COMPANY_B'"
            [class.btn-outline-primary]="selectedCompany !== 'COMPANY_B'"
            (click)="loadSchema('COMPANY_B')">
            Company B Config
          </button>
        </div>
      </div>

      <div class="row">
        <div class="col-lg-8">
          <div *ngIf="schema$ | async as schema; else loading">
            <app-erp-dynamic-form
              [schema]="schema"
              [userRoles]="['ADMIN']"
              submitLabel="Save Documentation"
              (formSubmit)="handleFormSubmit($event)"
            ></app-erp-dynamic-form>
          </div>
          <ng-template #loading>
            <div class="text-center p-5">
              <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
              <span class="ms-2 small">Loading form metadata...</span>
            </div>
          </ng-template>
        </div>

        <div class="col-lg-4">
          <div class="card shadow-sm border-0 bg-light">
            <div class="card-body p-3">
              <h6 class="fw-bold small mb-3">Submitted Data (JSON)</h6>
              <pre class="bg-dark text-success p-3 rounded small mb-0" style="min-height: 200px;">{{ submittedData | json }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicFormDemoComponent implements OnInit {
  schema$!: Observable<FormSchema>;
  selectedCompany: string = 'DEFAULT';
  submittedData: any = null;

  constructor(private dynamicFormService: DynamicFormService) {}

  ngOnInit(): void {
    this.loadSchema(this.selectedCompany);
  }

  loadSchema(companyId: string): void {
    this.selectedCompany = companyId;
    this.schema$ = this.dynamicFormService.getShipmentTeamSchema(companyId);
    this.submittedData = null;
  }

  handleFormSubmit(data: any): void {
    console.log('Form Submitted:', data);
    this.submittedData = data;
    alert('Form data captured! Check the JSON preview.');
  }
}
