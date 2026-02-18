import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Shipment } from '../../../../../shared/models/shipment.model';

@Component({
  selector: 'app-shipment-documents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shipment-documents.component.html',
  styleUrl: './shipment-documents.component.css'
})
export class ShipmentDocumentsComponent {
  @Input() shipment!: Shipment;
}

