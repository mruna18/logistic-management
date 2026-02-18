import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContainerLinkService, ContainerWithLinks } from '../../../core/services/container-link.service';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { TableColumn } from '../../../shared/models/table-column.model';

@Component({
  selector: 'app-container-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DataTableComponent],
  templateUrl: './container-list.component.html',
  styleUrl: './container-list.component.css'
})
export class ContainerListComponent implements OnInit {
  containers: ContainerWithLinks[] = [];
  columns: TableColumn[] = [
    { field: 'containerNo', header: 'Container No', sortable: true, filterable: true },
    { field: 'type', header: 'Type', sortable: true, filterable: true },
    { field: 'shipmentReference', header: 'Shipment Ref', sortable: true, filterable: true, type: 'link', linkPath: '/shipments', linkIdField: 'shipmentId' },
    { field: 'orderReference', header: 'Order Ref', sortable: true, filterable: true, type: 'link', linkPath: '/import-orders', linkIdField: 'orderId' },
    { field: 'arrivalDate', header: 'Arrival Date', sortable: true, type: 'date' },
    { field: 'freeDays', header: 'Free Days', sortable: true, type: 'number' },
    { field: 'gateOutDate', header: 'Gate Out Date', sortable: true, type: 'date' },
    { field: 'demurrage', header: 'Demurrage', sortable: true, type: 'number' },
    { field: 'status', header: 'Status', sortable: true, type: 'status' }
  ];

  constructor(private containerLinkService: ContainerLinkService) {}

  ngOnInit() {
    this.loadContainers();
  }

  loadContainers() {
    this.containerLinkService.getContainersWithLinks().subscribe(containers => {
      this.containers = containers;
    });
  }
}

