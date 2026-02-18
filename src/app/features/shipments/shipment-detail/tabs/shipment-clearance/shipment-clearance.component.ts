import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Shipment } from '../../../../../shared/models/shipment.model';

@Component({
  selector: 'app-shipment-clearance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shipment-clearance.component.html',
  styleUrl: './shipment-clearance.component.css'
})
export class ShipmentClearanceComponent {
  @Input() shipment!: Shipment;
}

