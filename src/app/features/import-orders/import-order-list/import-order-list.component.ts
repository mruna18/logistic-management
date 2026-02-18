import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ImportOrderService } from '../../../core/services/import-order.service';
import { ImportOrder } from '../../../shared/models/import-order.model';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { TableColumn } from '../../../shared/models/table-column.model';

@Component({
  selector: 'app-import-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DataTableComponent],
  templateUrl: './import-order-list.component.html',
  styleUrl: './import-order-list.component.css'
})
export class ImportOrderListComponent implements OnInit {
  orders: ImportOrder[] = [];
  columns: TableColumn[] = [
    { field: 'orderReference', header: 'Order Ref', sortable: true, filterable: true },
    { field: 'jobType', header: 'Job Type', sortable: true, filterable: true, type: 'jobType' },
    { field: 'buyerName', header: 'Client / Buyer', sortable: true, filterable: true },
    { field: 'supplierName', header: 'Supplier', sortable: false, filterable: true },
    { field: 'fileStatus', header: 'File Status', sortable: false, filterable: true },
    { field: 'pfiNumber', header: 'PFI No', sortable: false, filterable: true },
    { field: 'containerCount', header: 'Containers', sortable: true, type: 'number' },
    { field: 'containerType', header: 'Container Type', sortable: false, filterable: true },
    { field: 'productType', header: 'Product Type', sortable: false, filterable: true },
    { field: 'productDescription', header: 'Product', sortable: false, filterable: true },
    { field: 'shipmentMode', header: 'Mode', sortable: false, filterable: true },
    { field: 'allocationDate', header: 'Allocation Date', sortable: true, type: 'date' },
    { field: 'status', header: 'Status', sortable: true, type: 'status', filterable: true }
  ];

  constructor(private importOrderService: ImportOrderService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.importOrderService.getAll().subscribe(orders => {
      this.orders = orders;
    });
  }
}

