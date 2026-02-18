import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Shipment } from '../../shared/models/shipment.model';
import { ProductType, ServiceScope, Status, ContainerType } from '../../shared/enums/status.enum';
import { Container } from '../../shared/models/container.model';

@Injectable({
  providedIn: 'root'
})
export class ShipmentService {
  private shipments: Shipment[] = [
    {
      id: '1',
      orderReference: 'ORD-2024-001',
      shipmentReference: 'SHIP-2024-001',
      productType: ProductType.ELECTRONICS,
      serviceScope: ServiceScope.D2D,
      status: Status.IN_PROGRESS,
      origin: {
        port: 'Shanghai Port',
        country: 'China',
        etd: new Date('2024-01-20'),
        actualDeparture: new Date('2024-01-21')
      },
      transit: {
        vessel: 'MV Atlantic Star',
        voyage: 'V001',
        estimatedArrival: new Date('2024-02-15'),
        currentLocation: 'Indian Ocean'
      },
      clearance: {
        paarNumber: 'PAAR-2024-001',
        dutyAmount: 2500000,
        dutyPaid: true,
        dutyPaymentDate: new Date('2024-02-10'),
        customsRelease: true,
        customsReleaseDate: new Date('2024-02-12'),
        terminalRelease: false
      },
      containers: [
        {
          id: '1',
          containerNo: 'CONT-001',
          type: ContainerType.TWENTY_FT as any,
          sealNo: 'SEAL-001',
          arrivalDate: new Date('2024-02-15'),
          freeDays: 7,
          demurrage: 0,
          status: Status.IN_PROGRESS,
          shipmentId: '1'
        }
      ],
      delivery: {
        deliveryAddress: 'Lagos Warehouse, Ikeja',
        delivered: false
      },
      finance: {
        totalCost: 5000000,
        payments: [
          {
            id: '1',
            type: 'Duty',
            amount: 2500000,
            date: new Date('2024-02-10'),
            reference: 'PAY-001',
            shipmentId: '1'
          }
        ]
      },
      documents: [
        {
          id: '1',
          name: 'Bill of Lading',
          type: 'BL',
          uploadDate: new Date('2024-01-21')
        }
      ],
      history: [
        {
          id: '1',
          action: 'Order Created',
          description: 'Import order created',
          timestamp: new Date('2024-01-10'),
          user: 'Admin'
        }
      ],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-02-15')
    }
  ];

  getAll(): Observable<Shipment[]> {
    return of(this.shipments);
  }

  getById(id: string): Observable<Shipment | undefined> {
    const shipment = this.shipments.find(s => s.id === id);
    return of(shipment);
  }

  getByOrderReference(orderRef: string): Observable<Shipment | undefined> {
    const shipment = this.shipments.find(s => s.orderReference === orderRef);
    return of(shipment);
  }
}

