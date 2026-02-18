import { Injectable } from '@angular/core';
import { Observable, of, map } from 'rxjs';
import { MockDataService } from '../../../core/services/mock-data.service';
import {
  generateShipmentOverview,
  generateBottlenecks,
  generateFinancialExposure,
  generateContainerMovement,
  generateClientPerformance,
  generateAgentPerformance,
  generateAlerts,
} from './dashboard-mock.generator';
import type {
  ShipmentOverview,
  BottleneckTracker,
  FinancialExposure,
  ContainerMovement,
  ClientPerformance,
  AgentPerformance,
  DashboardAlert,
} from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardAnalyticsService {
  constructor(private mockData: MockDataService) {}

  getShipmentOverview(): Observable<ShipmentOverview> {
    return this.mockData.getShipments().pipe(
      map((shipments) => this.computeShipmentOverview(shipments))
    );
  }

  getBottleneckTracker(): Observable<BottleneckTracker> {
    return this.mockData.getShipments().pipe(
      map(() => this.computeBottlenecks())
    );
  }

  getFinancialExposure(): Observable<FinancialExposure> {
    return this.mockData.getShipments().pipe(
      map((shipments) => this.computeFinancialExposure(shipments))
    );
  }

  getContainerMovement(): Observable<ContainerMovement> {
    return this.mockData.getContainers().pipe(
      map((containers) => this.computeContainerMovement(containers))
    );
  }

  getClientPerformance(): Observable<ClientPerformance[]> {
    return this.mockData.getShipments().pipe(
      map((shipments) => this.computeClientPerformance(shipments))
    );
  }

  getAgentPerformance(): Observable<AgentPerformance[]> {
    return of(this.computeAgentPerformance());
  }

  getAlerts(): Observable<DashboardAlert[]> {
    return this.mockData.getShipments().pipe(
      map((shipments) => this.computeAlerts(shipments))
    );
  }

  private computeShipmentOverview(shipments: any[]): ShipmentOverview {
    return generateShipmentOverview(shipments.length);
  }

  private computeBottlenecks(): BottleneckTracker {
    return generateBottlenecks();
  }

  private computeFinancialExposure(shipments: any[]): FinancialExposure {
    return generateFinancialExposure(shipments.length);
  }

  private computeContainerMovement(containers: any[]): ContainerMovement {
    return generateContainerMovement(containers.length);
  }

  private computeClientPerformance(_shipments: any[]): ClientPerformance[] {
    return generateClientPerformance();
  }

  private computeAgentPerformance(): AgentPerformance[] {
    return generateAgentPerformance();
  }

  private computeAlerts(_shipments: any[]): DashboardAlert[] {
    return generateAlerts(generateBottlenecks());
  }
}
