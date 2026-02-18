import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShipmentService } from '../../core/services/shipment.service';
import { Shipment } from '../../shared/models/shipment.model';

@Component({
  selector: 'app-delivery',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './delivery.component.html',
  styleUrl: './delivery.component.css'
})
export class DeliveryComponent implements OnInit {
  shipments: Shipment[] = [];
  filteredShipments: Shipment[] = [];

  constructor(private shipmentService: ShipmentService) {}

  ngOnInit() {
    this.loadShipments();
  }

  loadShipments() {
    this.shipmentService.getAll().subscribe(shipments => {
      this.shipments = shipments;
      this.filteredShipments = shipments;
    });
  }
}

