import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Buyer {
  id: string;
  name: string;
  approved: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BuyerService {
  private buyers: Buyer[] = [
    { id: '1', name: 'Magnifico Synergies Limited', approved: true },
    { id: '2', name: 'Jubaili Agrotec Limited', approved: true },
    { id: '3', name: 'Dangote Industries Limited', approved: true },
    { id: '4', name: 'Test Unapproved Buyer', approved: false },
    { id: '5', name: 'Test Approved Buyer', approved: true },
    { id: '6', name: 'Nigerian Breweries PLC', approved: true },
    { id: '7', name: 'Guinness Nigeria PLC', approved: true },
    { id: '8', name: 'Bua Group', approved: true },
    { id: '9', name: 'Olam International Limited', approved: true },
    { id: '10', name: 'Honeywell Flour Mills', approved: true },
    { id: '11', name: 'Nestle Nigeria PLC', approved: true },
    { id: '12', name: 'Transcorp Power Limited', approved: false },
    { id: '13', name: 'Seven-Up Bottling Company', approved: true },
    { id: '14', name: 'Unilever Nigeria PLC', approved: true },
    { id: '15', name: 'PZ Cussons Nigeria PLC', approved: true }
  ];

  getApprovedBuyers(): Observable<Buyer[]> {
    return of(this.buyers.filter(b => b.approved));
  }
}


