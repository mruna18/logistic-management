import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShipmentService } from '../../core/services/shipment.service';
import { Shipment } from '../../shared/models/shipment.model';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.css'
})
export class DocumentsComponent implements OnInit {
  shipments: Shipment[] = [];
  allDocuments: any[] = [];

  constructor(private shipmentService: ShipmentService) {}

  ngOnInit() {
    this.loadShipments();
  }

  loadShipments() {
    this.shipmentService.getAll().subscribe(shipments => {
      this.shipments = shipments;
      this.allDocuments = shipments.flatMap(shipment => 
        shipment.documents.map(doc => ({
          ...doc,
          orderRef: shipment.orderReference,
          shipmentRef: shipment.shipmentReference
        }))
      );
    });
  }
}

