import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';
import { OrderShipmentLinkService } from '../../../core/services/order-shipment-link.service';
import { Shipment } from '../../../shared/models/shipment.model';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { TableColumn } from '../../../shared/models/table-column.model';

@Component({
  selector: 'app-shipment-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DataTableComponent],
  templateUrl: './shipment-list.component.html',
  styleUrl: './shipment-list.component.css'
})
export class ShipmentListComponent implements OnInit {
  shipments: (Shipment & { orderRefId?: string })[] = [];
  columns: TableColumn[] = [
    { field: 'shipmentReference', header: 'Shipment Ref', sortable: true, filterable: false },
    { field: 'orderReference', header: 'Order Ref', sortable: true, filterable: true, type: 'link', linkPath: '/import-orders', linkIdField: 'orderRefId' },
    { field: 'transit.vessel', header: 'Vessel', sortable: false, filterable: true },
    { field: 'transit.estimatedArrival', header: 'ETA', sortable: true, type: 'date' },
    { field: 'transit.actualArrival', header: 'Arrival Date', sortable: true, type: 'date' },
    { field: 'status', header: 'Status', sortable: true, type: 'status', filterable: true }
  ];

  constructor(
    private mockDataService: MockDataService,
    private linkService: OrderShipmentLinkService
  ) {}

  ngOnInit() {
    this.loadShipments();
  }

  loadShipments() {
    this.mockDataService.getShipments().subscribe(shipments => {
      this.shipments = shipments.map(s => ({
        ...s,
        orderRefId: this.linkService.getOrderIdFromReference(s.orderReference) ?? undefined
      }));
    });
  }
}

