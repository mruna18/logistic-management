import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Shipment } from '../../../../../shared/models/shipment.model';

@Component({
  selector: 'app-shipment-finance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shipment-finance.component.html',
  styleUrl: './shipment-finance.component.css'
})
export class ShipmentFinanceComponent {
  @Input() shipment!: Shipment;

  getTotalPaid(): number {
    return this.shipment.finance.payments.reduce((sum, payment) => sum + payment.amount, 0);
  }
}
