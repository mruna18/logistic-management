import { Injectable } from '@angular/core';
import { Observable, of, map, switchMap } from 'rxjs';
import { ImportOrder } from '../../shared/models/import-order.model';
import { Shipment } from '../../shared/models/shipment.model';
import { ImportOrderService } from './import-order.service';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root',
})
export class OrderShipmentLinkService {
  constructor(
    private importOrderService: ImportOrderService,
    private mockDataService: MockDataService
  ) {}

  getOrderIdFromReference(orderReference: string): string | null {
    if (!orderReference) return null;
    const parts = orderReference.split('-');
    const last = parts[parts.length - 1];
    const num = parseInt(last || '0', 10);
    return isNaN(num) ? null : String(num);
  }

  getOrderByReference(orderReference: string): Observable<ImportOrder | undefined> {
    const id = this.getOrderIdFromReference(orderReference);
    if (!id) return of(undefined);
    return this.importOrderService.getById(id);
  }

  getShipmentsByOrderId(orderId: string): Observable<Shipment[]> {
    return this.importOrderService.getById(orderId).pipe(
      switchMap(order => {
        const ref = order?.orderReference;
        if (!ref) return of([]);
        return this.getShipmentsByOrderReference(ref);
      })
    );
  }

  getShipmentsByOrderReference(orderReference: string): Observable<Shipment[]> {
    return this.mockDataService.getShipments().pipe(
      map(shipments => shipments.filter(s => s.orderReference === orderReference))
    );
  }
}
