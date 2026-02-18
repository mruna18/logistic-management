import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FormSchema } from '../models/form-schema.model';

@Injectable({
  providedIn: 'root'
})
export class DynamicFormService {

  getShipmentTeamSchema(companyId: string = 'DEFAULT'): Observable<FormSchema> {
    const schema: FormSchema = {
      companyId,
      moduleId: 'SHIPMENT_TEAM',
      sections: [
        {
          sectionTitle: 'Team Assignment',
          fields: [
            {
              key: 'salesPersonId',
              label: 'Sales Person',
              type: 'select',
              required: true,
              className: 'col-md-4',
              options: [
                { label: 'John Doe', value: '1' },
                { label: 'Jane Smith', value: '2' }
              ]
            },
            {
              key: 'customerServiceId',
              label: 'Customer Service',
              type: 'select',
              className: 'col-md-4',
              options: [
                { label: 'Alice Johnson', value: '1' },
                { label: 'Bob Wilson', value: '2' }
              ]
            },
            {
              key: 'clearingAgentId',
              label: 'Clearing Agent',
              type: 'select',
              className: 'col-md-4',
              options: [
                { label: 'Swift Clearing', value: '1' },
                { label: 'Fast Logistics', value: '2' }
              ]
            }
          ]
        },
        {
          sectionTitle: 'Form M & Banking Details',
          fields: [
            {
              key: 'bankId',
              label: 'Bank',
              type: 'select',
              className: 'col-md-4',
              options: [
                { label: 'Access Bank', value: '1' },
                { label: 'GTBank', value: '2' }
              ]
            },
            {
              key: 'formMType',
              label: 'Form M Type',
              type: 'select',
              className: 'col-md-4',
              options: [
                { label: 'Valid for Forex', value: 'FOREX' },
                { label: 'Not Valid for Forex', value: 'NON_FOREX' }
              ]
            },
            {
              key: 'formMNumber',
              label: 'Form M Number',
              type: 'text',
              className: 'col-md-4',
              placeholder: 'MF...'
            },
            {
              key: 'baNumber',
              label: 'BA Number',
              type: 'text',
              className: 'col-md-4',
              placeholder: 'BA...'
            },
            {
              key: 'appliedDate',
              label: 'Date Applied',
              type: 'date',
              className: 'col-md-4'
            },
            {
              key: 'approvedDate',
              label: 'Date Approved',
              type: 'date',
              className: 'col-md-4'
            },
            {
              key: 'specialRemarks',
              label: 'Special Remarks',
              type: 'textarea',
              className: 'col-12'
            }
          ]
        }
      ]
    };

    // Example of company-specific customization
    if (companyId === 'COMPANY_B') {
      // Add an extra field for Company B in the first section
      schema.sections[0].fields.push({
        key: 'secondaryAgentId',
        label: 'Secondary Agent',
        type: 'select',
        className: 'col-md-4',
        options: [{ label: 'Global Cargo', value: '3' }]
      });
      
      // Make bank required for Company B
      const bankField = schema.sections[1].fields.find(f => f.key === 'bankId');
      if (bankField) bankField.required = true;
    }

    return of(schema);
  }
}
