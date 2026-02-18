import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShipmentDetail } from '../models/shipment-detail.model';

@Component({
  selector: 'app-shipment-header-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shipment-header-summary.component.html'
})
export class ShipmentHeaderSummaryComponent {
  @Input() shipment!: ShipmentDetail;

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Draft': return 'bg-secondary';
      case 'In Progress': return 'bg-warning text-dark';
      case 'Pre Arrival': return 'bg-info';
      case 'Awaiting Payment': return 'bg-warning text-dark';
      case 'At Terminal': return 'bg-info';
      case 'Cleared': return 'bg-primary';
      case 'Compliance Pending': return 'bg-warning text-dark';
      case 'In Transit': return 'bg-primary';
      case 'Delivered': return 'bg-success';
      case 'Refund Pending': return 'bg-warning text-dark';
      case 'Invoicing': return 'bg-info';
      case 'Closed': return 'bg-dark';
      default: return 'bg-secondary';
    }
  }
}
