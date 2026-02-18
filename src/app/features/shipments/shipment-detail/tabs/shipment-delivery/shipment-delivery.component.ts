import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Shipment } from '../../../../../shared/models/shipment.model';

@Component({
  selector: 'app-shipment-delivery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shipment-delivery.component.html',
  styleUrl: './shipment-delivery.component.css'
})
export class ShipmentDeliveryComponent {
  @Input() shipment!: Shipment;
}

