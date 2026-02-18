import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User, Bank, DocumentType, TeamDocumentationData, ShipmentDocument } from '../models/team-documentation.model';

@Injectable({
  providedIn: 'root'
})
export class TeamDocumentationService {
  private mockUsers: User[] = [
    { id: '1', name: 'John Doe', role: 'Sales' },
    { id: '2', name: 'Jane Smith', role: 'Sales' },
    { id: '3', name: 'Alice Brown', role: 'Customer Service' },
    { id: '4', name: 'Bob Wilson', role: 'Customer Service' },
    { id: '5', name: 'Charlie Davis', role: 'Agent' },
    { id: '6', name: 'Eve White', role: 'Agent' }
  ];

  private mockBanks: Bank[] = [
    { id: '1', name: 'Access Bank' },
    { id: '2', name: 'Zenith Bank' },
    { id: '3', name: 'GTBank' },
    { id: '4', name: 'First Bank' },
    { id: '5', name: 'UBA' }
  ];

  private mockDocumentTypes: DocumentType[] = [
    { id: 'MSDS', name: 'MSDS' },
    { id: 'COA', name: 'COA' },
    { id: 'CRIA', name: 'CRIA' },
    { id: 'NAFDAC', name: 'NAFDAC Permit' },
    { id: 'SONCAP', name: 'SONCAP Permit' },
    { id: 'NERC', name: 'NERC Permit' },
    { id: 'QUARANTINE', name: 'Quarantine Permit' },
    { id: 'MARINE', name: 'Marine Insurance' }
  ];

  getUsersByRole(role: 'Sales' | 'Customer Service' | 'Agent'): Observable<User[]> {
    return of(this.mockUsers.filter(u => u.role === role));
  }

  getBanks(): Observable<Bank[]> {
    return of(this.mockBanks);
  }

  getDocumentTypes(): Observable<DocumentType[]> {
    return of(this.mockDocumentTypes);
  }

  getInitialData(): Observable<TeamDocumentationData> {
    return of({
      teamAssignment: {
        salesPersonId: '',
        customerServiceId: '',
        clearingAgentId: ''
      },
      fileClosure: {
        fecdUpdated: false,
        eirDate: null,
        waybillDate: null,
        terminalRefundDate: null,
        shippingRefundDate: null,
        fileClosedDate: null
      },
      documents: this.mockDocumentTypes.map(dt => ({
        documentName: dt.name,
        required: false,
        dateProcessed: null,
        dateReceived: null,
        processedBy: 'Agent',
        status: 'Pending'
      } as ShipmentDocument)),
      formMDetails: {
        bankId: '',
        type: 'Not Valid for Forex',
        paymentMode: null,
        appliedDate: null,
        approvedDate: null,
        formMNumber: '',
        baNumber: '',
        specialRemarks: ''
      }
    });
  }

  saveData(data: TeamDocumentationData): Observable<boolean> {
    console.log('Saving Team Documentation Data:', data);
    return of(true);
  }
}
