import { Injectable } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';
import { Container } from '../../shared/models/container.model';
import { Shipment } from '../../shared/models/shipment.model';
import { MockDataService } from './mock-data.service';
import { OrderShipmentLinkService } from './order-shipment-link.service';

export interface ContainerWithLinks extends Container {
  shipmentReference?: string;
  orderReference?: string;
  orderId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContainerLinkService {
  constructor(
    private mockDataService: MockDataService,
    private orderShipmentLinkService: OrderShipmentLinkService
  ) {}

  getContainersWithLinks(): Observable<ContainerWithLinks[]> {
    return combineLatest([
      this.mockDataService.getContainers(),
      this.mockDataService.getShipments(),
    ]).pipe(
      map(([containers, shipments]) => {
        const shipmentMap = new Map<string, Shipment>();
        shipments.forEach(s => shipmentMap.set(s.id, s));
        return containers.map(c => this.enrichContainer(c, shipmentMap));
      })
    );
  }

  getContainersByShipmentId(shipmentId: string): Observable<Container[]> {
    return this.mockDataService.getContainers().pipe(
      map(containers => containers.filter(c => c.shipmentId === shipmentId))
    );
  }

  getContainersByOrderId(orderId: string): Observable<ContainerWithLinks[]> {
    return combineLatest([
      this.orderShipmentLinkService.getShipmentsByOrderId(orderId),
      this.getContainersWithLinks(),
    ]).pipe(
      map(([shipments, containersWithLinks]) => {
        const shipmentIds = new Set(shipments.map(s => s.id));
        return containersWithLinks.filter(c => shipmentIds.has(c.shipmentId));
      })
    );
  }

  private enrichContainer(
    container: Container,
    shipmentMap: Map<string, Shipment>
  ): ContainerWithLinks {
    const shipment = shipmentMap.get(container.shipmentId);
    const orderReference = shipment?.orderReference;
    const orderId = orderReference
      ? this.orderShipmentLinkService.getOrderIdFromReference(orderReference)
      : undefined;
    return {
      ...container,
      shipmentReference: shipment?.shipmentReference,
      orderReference: orderReference ?? undefined,
      orderId: orderId ?? undefined,
    };
  }
}
