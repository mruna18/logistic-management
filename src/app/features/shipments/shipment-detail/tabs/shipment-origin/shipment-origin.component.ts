import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Shipment } from '../../../../../shared/models/shipment.model';

@Component({
  selector: 'app-shipment-origin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shipment-origin.component.html',
  styleUrl: './shipment-origin.component.css'
})
export class ShipmentOriginComponent {
  @Input() shipment!: Shipment;
}

