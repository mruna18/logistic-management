import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Shipment } from '../../../../../shared/models/shipment.model';

@Component({
  selector: 'app-shipment-transit',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shipment-transit.component.html',
  styleUrl: './shipment-transit.component.css'
})
export class ShipmentTransitComponent {
  @Input() shipment!: Shipment;
}

