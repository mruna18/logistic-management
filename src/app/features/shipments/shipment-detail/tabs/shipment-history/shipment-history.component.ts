import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Shipment } from '../../../../../shared/models/shipment.model';

@Component({
  selector: 'app-shipment-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shipment-history.component.html',
  styleUrl: './shipment-history.component.css'
})
export class ShipmentHistoryComponent {
  @Input() shipment!: Shipment;
}

