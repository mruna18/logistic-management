import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Container } from '../../shared/models/container.model';
import { ContainerType, Status } from '../../shared/enums/status.enum';

@Injectable({
  providedIn: 'root'
})
export class ContainerService {
  private containers: Container[] = [
    {
      id: '1',
      containerNo: 'CONT-001',
      type: ContainerType.TWENTY_FT as any,
      sealNo: 'SEAL-001',
      arrivalDate: new Date('2024-02-15'),
      freeDays: 7,
      gateOutDate: undefined,
      emptyReturn: undefined,
      demurrage: 0,
      status: Status.IN_PROGRESS,
      shipmentId: '1'
    },
    {
      id: '2',
      containerNo: 'CONT-002',
      type: ContainerType.FORTY_FT as any,
      sealNo: 'SEAL-002',
      arrivalDate: new Date('2024-02-15'),
      freeDays: 7,
      gateOutDate: new Date('2024-02-20'),
      emptyReturn: undefined,
      demurrage: 150000,
      status: Status.DELAYED,
      shipmentId: '1'
    },
    {
      id: '3',
      containerNo: 'CONT-003',
      type: ContainerType.TWENTY_FT as any,
      sealNo: 'SEAL-003',
      arrivalDate: new Date('2024-02-10'),
      freeDays: 7,
      gateOutDate: new Date('2024-02-16'),
      emptyReturn: new Date('2024-02-18'),
      demurrage: 0,
      status: Status.COMPLETED,
      shipmentId: '2'
    }
  ];

  getAll(): Observable<Container[]> {
    return of(this.containers);
  }

  getById(id: string): Observable<Container | undefined> {
    const container = this.containers.find(c => c.id === id);
    return of(container);
  }

  getByShipmentId(shipmentId: string): Observable<Container[]> {
    const filtered = this.containers.filter(c => c.shipmentId === shipmentId);
    return of(filtered);
  }

  update(id: string, container: Partial<Container>): Observable<Container> {
    const index = this.containers.findIndex(c => c.id === id);
    if (index !== -1) {
      this.containers[index] = { ...this.containers[index], ...container };
      return of(this.containers[index]);
    }
    throw new Error('Container not found');
  }
}

