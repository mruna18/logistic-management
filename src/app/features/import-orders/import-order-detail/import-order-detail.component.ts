import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ImportOrderService } from '../../../core/services/import-order.service';
import { OrderShipmentLinkService } from '../../../core/services/order-shipment-link.service';
import { ContainerLinkService, ContainerWithLinks } from '../../../core/services/container-link.service';
import { ImportOrder } from '../../../shared/models/import-order.model';
import { Shipment } from '../../../shared/models/shipment.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-import-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgeComponent],
  templateUrl: './import-order-detail.component.html',
  styleUrl: './import-order-detail.component.css'
})
export class ImportOrderDetailComponent implements OnInit {
  order?: ImportOrder;
  shipments: Shipment[] = [];
  containers: ContainerWithLinks[] = [];
  loaded = false;

  constructor(
    private route: ActivatedRoute,
    private importOrderService: ImportOrderService,
    private linkService: OrderShipmentLinkService,
    private containerLinkService: ContainerLinkService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.loaded = false;
      this.order = undefined;
      this.shipments = [];
      this.containers = [];
      if (id) {
        this.loadOrder(id);
        this.loadShipments(id);
        this.loadContainers(id);
      } else {
        this.loaded = true;
      }
    });
  }

  loadOrder(id: string) {
    this.importOrderService.getById(id).subscribe(order => {
      this.order = order;
      this.loaded = true;
    });
  }

  loadShipments(orderId: string) {
    this.linkService.getShipmentsByOrderId(orderId).subscribe(shipments => {
      this.shipments = shipments;
    });
  }

  loadContainers(orderId: string) {
    this.containerLinkService.getContainersByOrderId(orderId).subscribe(containers => {
      this.containers = containers;
    });
  }
}

