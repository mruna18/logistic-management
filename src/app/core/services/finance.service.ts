import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Payment } from '../../shared/models/shipment.model';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private payments: Payment[] = [
    {
      id: '1',
      type: 'Duty',
      amount: 2500000,
      date: new Date('2024-02-10'),
      reference: 'PAY-001',
      shipmentId: '1'
    },
    {
      id: '2',
      type: 'Freight',
      amount: 1500000,
      date: new Date('2024-02-05'),
      reference: 'PAY-002',
      shipmentId: '1'
    },
    {
      id: '3',
      type: 'Demurrage',
      amount: 150000,
      date: new Date('2024-02-20'),
      reference: 'PAY-003',
      shipmentId: '1'
    }
  ];

  getAll(): Observable<Payment[]> {
    return of(this.payments);
  }

  getByShipmentId(shipmentId: string): Observable<Payment[]> {
    const filtered = this.payments.filter(p => p.shipmentId === shipmentId);
    return of(filtered);
  }

  getTotalCost(): Observable<number> {
    const total = this.payments.reduce((sum, p) => sum + p.amount, 0);
    return of(total);
  }
}

