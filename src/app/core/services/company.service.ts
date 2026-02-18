import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Company, Terminal, Port } from '../models/company.model';

const MOCK_COMPANIES: Company[] = [
  {
    id: 1,
    name: 'Acme Logistics Nigeria Ltd',
    code: 'ALN',
    address: '12 Marina Street, Lagos Island',
    city: 'Lagos',
    state: 'Lagos',
    country: 'Nigeria',
    phone: '+234 1 234 5678',
    email: 'info@acmelogistics.ng',
    defaultTerminalId: 1,
    defaultPortId: 1,
    regulatoryDefaults: { nafdacRequired: true, sonRequired: true, defaultHsCodePrefix: '84' },
    approvalMatrixId: 1,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const MOCK_TERMINALS: Terminal[] = [
  { id: 1, name: 'APMT Apapa', code: 'APMT', portId: 1, companyId: 1 },
  { id: 2, name: 'TICT Tin Can', code: 'TICT', portId: 1, companyId: 1 },
];

const MOCK_PORTS: Port[] = [
  { id: 1, name: 'Lagos Port Complex', code: 'NGLOS', country: 'Nigeria' },
];

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  getCompanies(): Observable<Company[]> {
    return of(MOCK_COMPANIES);
  }

  getCompany(id: number): Observable<Company | null> {
    const found = MOCK_COMPANIES.find((c) => c.id === id);
    return of(found ?? null);
  }

  getTerminals(companyId?: number): Observable<Terminal[]> {
    const filtered = companyId
      ? MOCK_TERMINALS.filter((t) => t.companyId === companyId)
      : MOCK_TERMINALS;
    return of(filtered);
  }

  getPorts(): Observable<Port[]> {
    return of(MOCK_PORTS);
  }
}
