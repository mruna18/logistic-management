import { Component, Input, ChangeDetectionStrategy, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShipmentDetail } from '../../models/shipment-detail.model';
import type { Shipment } from '../../models/shipment-store.model';
import { Container } from '../../../../../shared/models/container.model';
import { ContainerLinkService } from '../../../../../core/services/container-link.service';

@Component({
  selector: 'app-shipment-dashboard-summary',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shipment-dashboard-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentDashboardSummaryComponent implements OnInit, OnChanges {
  @Input() shipment!: ShipmentDetail | Shipment;
  linkedContainers: Container[] = [];

  constructor(private containerLinkService: ContainerLinkService) {}

  ngOnInit(): void {
    this.loadContainers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['shipment']) {
      this.loadContainers();
    }
  }

  private loadContainers(): void {
    const s = this.shipment;
    if (!s?.id) return;
    this.containerLinkService.getContainersByShipmentId(String(s.id)).subscribe((list: Container[]) => {
      this.linkedContainers = list;
    });
  }
}
