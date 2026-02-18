import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Shipment } from '../../../../../shared/models/shipment.model';

@Component({
  selector: 'app-shipment-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shipment-overview.component.html',
  styleUrl: './shipment-overview.component.css'
})
export class ShipmentOverviewComponent {
  @Input() shipment!: Shipment;
}

