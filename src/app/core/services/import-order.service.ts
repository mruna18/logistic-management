import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, map } from 'rxjs';
import { ImportOrder } from '../../shared/models/import-order.model';
import { Status } from '../../shared/enums/status.enum';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class ImportOrderService {
  private readonly ordersSubject = new BehaviorSubject<ImportOrder[]>([]);
  private updatedById = new Map<string, ImportOrder>();

  constructor(private mockDataService: MockDataService) {
    this.refreshList();
  }

  refreshList(): void {
    this.mockDataService.getImportOrders().subscribe(orders => {
      const merged = orders.map(o => this.updatedById.get(o.id) ?? o);
      this.ordersSubject.next(merged);
    });
  }

  getAll(): Observable<ImportOrder[]> {
    if (this.ordersSubject.value.length === 0) {
      this.refreshList();
    }
    return this.ordersSubject.asObservable();
  }

  getById(id: string): Observable<ImportOrder | undefined> {
    const updated = this.updatedById.get(id);
    if (updated) return of(updated);
    const fromCache = this.ordersSubject.value.find(o => o.id === id);
    if (fromCache) return of(fromCache);
    return this.mockDataService.getImportOrders().pipe(
      map(orders => orders.find(o => o.id === id))
    );
  }

  create(order: Partial<ImportOrder> & { numberOfContainers?: number }): Observable<ImportOrder> {
    const current = this.ordersSubject.value;
    const { numberOfContainers, ...rest } = order;
    const normalized = {
      ...rest,
      containerCount: rest.containerCount ?? numberOfContainers ?? 1,
    };
    const newOrder: ImportOrder = {
      id: String(Math.max(...current.map(o => parseInt(o.id, 10) || 0), 0) + 1),
      orderReference: normalized.orderReference ?? `ORD-2024-${String(current.length + 1).padStart(3, '0')}`,
      ...normalized,
      status: Status.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    } as ImportOrder;
    this.updatedById.set(newOrder.id, newOrder);
    this.ordersSubject.next([...current, newOrder]);
    return of(newOrder);
  }

  update(id: string, order: Partial<ImportOrder>): Observable<ImportOrder> {
    const current = this.ordersSubject.value;
    const index = current.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Order not found');
    const updated = { ...current[index], ...order, updatedAt: new Date() };
    this.updatedById.set(id, updated);
    const next = [...current];
    next[index] = updated;
    this.ordersSubject.next(next);
    return of(updated);
  }

  delete(id: string): Observable<boolean> {
    this.updatedById.delete(id);
    const next = this.ordersSubject.value.filter(o => o.id !== id);
    this.ordersSubject.next(next);
    return of(true);
  }
}

