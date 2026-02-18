import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { DynamicSectionConfig } from '../models/dynamic-form.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormConfigService {

  // Simulate fetching configuration based on Company ID or Module
  getFormConfig(moduleId: string, companyId: string = 'DEFAULT'): Observable<DynamicSectionConfig[]> {
    if (moduleId === 'TEAM_ASSIGNMENT') {
      return of(this.getTeamAssignmentConfig(companyId));
    }
    if (moduleId === 'FORM_M_DETAILS') {
      return of(this.getFormMDetailsConfig(companyId));
    }
    return of([]);
  }

  private getTeamAssignmentConfig(companyId: string): DynamicSectionConfig[] {
    const config: DynamicSectionConfig[] = [
      {
        sectionTitle: 'Team Assignment',
        fields: [
          {
            name: 'salesPersonId',
            label: 'Sales Person',
            type: 'select',
            className: 'col-md-4',
            options: [
              { label: 'John Doe', value: '1' },
              { label: 'Jane Smith', value: '2' }
            ],
            validations: [{ name: 'required', validator: Validators.required, message: 'Sales Person is required' }]
          },
          {
            name: 'customerServiceId',
            label: 'Customer Service',
            type: 'select',
            className: 'col-md-4',
            options: [
              { label: 'Alice Johnson', value: '1' },
              { label: 'Bob Wilson', value: '2' }
            ]
          },
          {
            name: 'clearingAgentId',
            label: 'Clearing Agent',
            type: 'select',
            className: 'col-md-4',
            options: [
              { label: 'Swift Clearing', value: '1' },
              { label: 'Fast Logistics', value: '2' }
            ]
          }
        ]
      }
    ];

    // Example of company-specific customization
    if (companyId === 'COMPANY_B') {
      // Add an extra field for Company B
      config[0].fields.push({
        name: 'secondaryAgentId',
        label: 'Secondary Agent',
        type: 'select',
        className: 'col-md-4',
        options: [{ label: 'Global Cargo', value: '3' }]
      });
    }

    return config;
  }

  private getFormMDetailsConfig(companyId: string): DynamicSectionConfig[] {
    return [
      {
        sectionTitle: 'Form M & Banking Details',
        fields: [
          {
            name: 'bankId',
            label: 'Bank',
            type: 'select',
            className: 'col-md-4',
            options: [
              { label: 'Access Bank', value: '1' },
              { label: 'GTBank', value: '2' },
              { label: 'Zenith Bank', value: '3' }
            ]
          },
          {
            name: 'type',
            label: 'Form M Type',
            type: 'select',
            className: 'col-md-4',
            options: [
              { label: 'Valid for Forex', value: 'Valid for Forex' },
              { label: 'Not Valid for Forex', value: 'Not Valid for Forex' }
            ]
          },
          {
            name: 'paymentMode',
            label: 'Payment Mode',
            type: 'select',
            className: 'col-md-4',
            options: [
              { label: 'Letter of Credit', value: 'LC' },
              { label: 'Bills for Collection', value: 'BC' },
              { label: 'Open Account', value: 'OA' }
            ]
          },
          {
            name: 'formMNumber',
            label: 'Form M Number',
            type: 'text',
            className: 'col-md-4',
            placeholder: 'MF...'
          },
          {
            name: 'baNumber',
            label: 'BA Number',
            type: 'text',
            className: 'col-md-4',
            placeholder: 'BA...'
          },
          {
            name: 'appliedDate',
            label: 'Date Applied',
            type: 'date',
            className: 'col-md-4'
          },
          {
            name: 'approvedDate',
            label: 'Date Approved',
            type: 'date',
            className: 'col-md-4'
          },
          {
            name: 'specialRemarks',
            label: 'Special Remarks',
            type: 'textarea',
            className: 'col-12'
          }
        ]
      }
    ];
  }
}
