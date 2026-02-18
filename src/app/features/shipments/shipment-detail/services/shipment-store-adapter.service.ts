import { Injectable } from '@angular/core';
import { Shipment, ShipmentStatus } from '../models/shipment-store.model';
import type { ShipmentDetail } from '../models/shipment-detail.model';

@Injectable({
  providedIn: 'root',
})
export class ShipmentStoreAdapterService {
  toShipment(detail: ShipmentDetail): Shipment {
    const statusMap: Record<string, ShipmentStatus> = {
      Draft: ShipmentStatus.DRAFT,
      'In Progress': ShipmentStatus.DRAFT,
      'Pre Arrival': ShipmentStatus.DRAFT,
      'Awaiting Payment': ShipmentStatus.DRAFT,
      'At Terminal': ShipmentStatus.ARRIVED,
      Cleared: ShipmentStatus.DELIVERING,
      'Compliance Pending': ShipmentStatus.UNDER_CLEARANCE,
      'In Transit': ShipmentStatus.IN_TRANSIT,
      Delivered: ShipmentStatus.COMPLETED,
      'Refund Pending': ShipmentStatus.COMPLETED,
      Invoicing: ShipmentStatus.READY_FOR_INVOICE,
      Closed: ShipmentStatus.CLOSED,
    };
    return {
      ...detail,
      status: statusMap[detail.status] ?? ShipmentStatus.DRAFT,
      teamDocumentation: (detail as { teamDocumentation?: unknown }).teamDocumentation ?? null,
    } as Shipment;
  }

  toShipmentDetail(shipment: Shipment): ShipmentDetail {
    const { teamDocumentation, ...rest } = shipment;
    return {
      ...rest,
      status: this.mapWorkflowStatusToLegacy(shipment.status),
    } as ShipmentDetail;
  }

  private mapWorkflowStatusToLegacy(status: ShipmentStatus): ShipmentDetail['status'] {
    const map: Record<ShipmentStatus, ShipmentDetail['status']> = {
      [ShipmentStatus.DRAFT]: 'Draft',
      [ShipmentStatus.IN_TRANSIT]: 'In Transit',
      [ShipmentStatus.ARRIVED]: 'At Terminal',
      [ShipmentStatus.UNDER_CLEARANCE]: 'Compliance Pending',
      [ShipmentStatus.DELIVERING]: 'In Transit',
      [ShipmentStatus.COMPLETED]: 'Delivered',
      [ShipmentStatus.READY_FOR_INVOICE]: 'Invoicing',
      [ShipmentStatus.CLOSED]: 'Closed',
      [ShipmentStatus.ON_HOLD]: 'Awaiting Payment',
    };
    return map[status] ?? 'Draft';
  }
}
