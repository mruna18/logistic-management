import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShipmentDetail, ShipmentStatus } from '../../models/shipment-detail.model';
import { ShipmentStatus as WorkflowStatus } from '../../models/shipment-store.model';
import { ShipmentStatusEngineService } from '../../services/shipment-status-engine.service';
import { OrderShipmentLinkService } from '../../../../../core/services/order-shipment-link.service';

@Component({
  selector: 'app-shipment-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shipment-header.component.html',
  styleUrl: './shipment-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentHeaderComponent {
  @Input() shipment!: ShipmentDetail | import('../../models/shipment-store.model').Shipment;

  constructor(
    private readonly statusEngine: ShipmentStatusEngineService,
    private readonly linkService: OrderShipmentLinkService
  ) {}

  getOrderId(orderReference: string | undefined): string {
    return this.linkService.getOrderIdFromReference(orderReference ?? '') ?? '';
  }

  getStatusLabel(status: ShipmentStatus | WorkflowStatus | string): string {
    if (typeof status === 'string' && Object.values(WorkflowStatus).includes(status as WorkflowStatus)) {
      return this.statusEngine.getStatusLabel(status as WorkflowStatus);
    }
    return String(status);
  }

  getStatusBadgeClass(status: ShipmentStatus | WorkflowStatus | string): string {
    switch (status) {
      case 'Draft':
      case WorkflowStatus.DRAFT:
        return 'bg-secondary';
      case 'In Progress':
        return 'bg-warning text-dark';
      case 'Pre Arrival':
        return 'bg-info';
      case 'Awaiting Payment':
        return 'bg-warning text-dark';
      case 'At Terminal':
        return 'bg-info';
      case 'Cleared':
        return 'bg-primary';
      case 'Compliance Pending':
        return 'bg-warning text-dark';
      case 'In Transit':
      case WorkflowStatus.IN_TRANSIT:
        return 'bg-info';
      case WorkflowStatus.ARRIVED:
        return 'bg-primary';
      case WorkflowStatus.UNDER_CLEARANCE:
        return 'bg-warning text-dark';
      case WorkflowStatus.DELIVERING:
        return 'bg-primary';
      case 'Delivered':
      case WorkflowStatus.COMPLETED:
      case WorkflowStatus.READY_FOR_INVOICE:
        return 'bg-success';
      case 'Refund Pending':
        return 'bg-warning text-dark';
      case 'Invoicing':
        return 'bg-info';
      case 'Closed':
      case WorkflowStatus.CLOSED:
        return 'bg-dark';
      case WorkflowStatus.ON_HOLD:
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getShipmentTypeLabel(shipment: { type?: string; logisticType?: string }): string {
    return shipment.type === 'EXPORT' ? 'Export' : (shipment.logisticType ?? 'Import');
  }

  getShipmentTypeBadgeClass(shipment: { type?: string }): string {
    return shipment.type === 'EXPORT' ? 'bg-primary' : 'bg-success';
  }

  getRiskBadgeClass(level: string): string {
    switch (level) {
      case 'Low':
        return 'bg-success';
      case 'Medium':
        return 'bg-warning text-dark';
      case 'High':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getDutyStatusClass(status: string | undefined): string {
    switch (status) {
      case 'Paid':
        return 'text-success';
      case 'Partial':
        return 'text-warning';
      case 'Unpaid':
        return 'text-danger';
      default:
        return 'text-muted';
    }
  }
}
