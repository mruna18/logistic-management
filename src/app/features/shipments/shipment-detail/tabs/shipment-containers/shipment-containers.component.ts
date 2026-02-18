import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Shipment } from '../../../../../shared/models/shipment.model';
import { StatusBadgeComponent } from '../../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-shipment-containers',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  templateUrl: './shipment-containers.component.html',
  styleUrl: './shipment-containers.component.css'
})
export class ShipmentContainersComponent {
  @Input() shipment!: Shipment;
}

