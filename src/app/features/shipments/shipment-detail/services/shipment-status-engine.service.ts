import { Injectable } from '@angular/core';
import { ShipmentStatus } from '../models/shipment-store.model';
import type { Shipment } from '../models/shipment-store.model';

@Injectable({
  providedIn: 'root',
})
export class ShipmentStatusEngineService {
  computeShipmentStatus(shipment: Shipment): ShipmentStatus {
    if (shipment.status === ShipmentStatus.CLOSED) return ShipmentStatus.CLOSED;
    if (shipment.status === ShipmentStatus.ON_HOLD) return ShipmentStatus.ON_HOLD;

    const origin = shipment.originDetails;
    const terminal = shipment.terminalShipping;
    const customs = shipment.customsRegulatory;
    const transport = shipment.transportDelivery;
    const teamDoc = shipment.teamDocumentation;

    const hasAtd = !!origin?.atd;
    const hasAta = !!terminal?.ata;
    const customsReleased = !!customs?.customReleaseDate;
    const firstContainerGatedOut = !!(
      transport?.firstContainerLoadedOut ||
      (transport?.containers?.length &&
        transport.containers.some((c) => c.gatedOutTerminalDateTime))
    );
    const allContainersEmptyReturned =
      !!transport?.containers?.length &&
      transport.containers.every((c) => c.emptyReturnDateTime);
    const docsSubmitted =
      !!teamDoc?.fileClosure?.fileClosedDate ||
      !!transport?.docsSubmittedToInvoicingDate;

    if (docsSubmitted) return ShipmentStatus.READY_FOR_INVOICE;
    if (allContainersEmptyReturned) return ShipmentStatus.COMPLETED;
    if (firstContainerGatedOut || customsReleased) return ShipmentStatus.DELIVERING;
    if (hasAta && !customsReleased) return ShipmentStatus.UNDER_CLEARANCE;
    if (hasAta) return ShipmentStatus.ARRIVED;
    if (hasAtd) return ShipmentStatus.IN_TRANSIT;
    return ShipmentStatus.DRAFT;
  }

  getStatusBadgeClass(status: ShipmentStatus): string {
    switch (status) {
      case ShipmentStatus.DRAFT:
        return 'bg-secondary';
      case ShipmentStatus.IN_TRANSIT:
        return 'bg-info';
      case ShipmentStatus.ARRIVED:
        return 'bg-primary';
      case ShipmentStatus.UNDER_CLEARANCE:
        return 'bg-warning text-dark';
      case ShipmentStatus.DELIVERING:
        return 'bg-primary';
      case ShipmentStatus.COMPLETED:
        return 'bg-success';
      case ShipmentStatus.READY_FOR_INVOICE:
        return 'bg-success';
      case ShipmentStatus.CLOSED:
        return 'bg-dark';
      case ShipmentStatus.ON_HOLD:
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatusLabel(status: ShipmentStatus): string {
    const labels: Record<ShipmentStatus, string> = {
      [ShipmentStatus.DRAFT]: 'Draft',
      [ShipmentStatus.IN_TRANSIT]: 'In Transit',
      [ShipmentStatus.ARRIVED]: 'Arrived at Port',
      [ShipmentStatus.UNDER_CLEARANCE]: 'Under Clearance',
      [ShipmentStatus.DELIVERING]: 'In Delivery',
      [ShipmentStatus.COMPLETED]: 'Port Cycle Completed',
      [ShipmentStatus.READY_FOR_INVOICE]: 'Ready for Invoicing',
      [ShipmentStatus.CLOSED]: 'Closed',
      [ShipmentStatus.ON_HOLD]: 'On Hold',
    };
    return labels[status] ?? status;
  }
}
