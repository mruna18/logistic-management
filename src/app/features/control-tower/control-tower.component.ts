import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardAnalyticsService } from './services/dashboard-analytics.service';
import { KpiCardComponent } from './widgets/kpi-card/kpi-card.component';
import { ChartWidgetComponent } from './widgets/chart-widget/chart-widget.component';
import { TableWidgetComponent } from './widgets/table-widget/table-widget.component';
import { AlertWidgetComponent } from './widgets/alert-widget/alert-widget.component';
import type {
  ShipmentOverview,
  BottleneckTracker,
  FinancialExposure,
  ContainerMovement,
  ClientPerformance,
  AgentPerformance,
  DashboardAlert,
} from './models/dashboard.model';
import type { TableColumn } from './widgets/table-widget/table-widget.component';

@Component({
  selector: 'app-control-tower',
  standalone: true,
  imports: [
    CommonModule,
    KpiCardComponent,
    ChartWidgetComponent,
    TableWidgetComponent,
    AlertWidgetComponent,
  ],
  templateUrl: './control-tower.component.html',
  styleUrls: ['./control-tower.component.scss'],
})
export class ControlTowerComponent implements OnInit {
  overview: ShipmentOverview | null = null;
  bottlenecks: BottleneckTracker | null = null;
  financial: FinancialExposure | null = null;
  containerMovement: ContainerMovement | null = null;
  clientPerformance: ClientPerformance[] = [];
  agentPerformance: AgentPerformance[] = [];
  alerts: DashboardAlert[] = [];

  clientColumns: TableColumn[] = [
    { field: 'client', header: 'Client' },
    { field: 'activeFiles', header: 'Active Files', type: 'number' },
    { field: 'delayedFiles', header: 'Delayed', type: 'number' },
    { field: 'paymentDelay', header: 'Payment Delay (days)', type: 'number' },
    {
      field: 'riskLevel',
      header: 'Risk',
      type: 'badge',
      badgeClass: (r) =>
        r.riskLevel === 'green'
          ? 'badge bg-success'
          : r.riskLevel === 'yellow'
          ? 'badge bg-warning text-dark'
          : 'badge bg-danger',
    },
  ];

  agentColumns: TableColumn[] = [
    { field: 'agent', header: 'Agent' },
    { field: 'filesHandled', header: 'Files', type: 'number' },
    { field: 'avgClearanceTime', header: 'Avg Days', type: 'number' },
    { field: 'queriesPercent', header: 'Queries %', type: 'number' },
  ];

  containerChartData: any = null;
  movementChartData: any = null;

  constructor(private analytics: DashboardAnalyticsService) {}

  ngOnInit(): void {
    this.analytics.getShipmentOverview().subscribe((o) => (this.overview = o));
    this.analytics.getBottleneckTracker().subscribe((b) => (this.bottlenecks = b));
    this.analytics.getFinancialExposure().subscribe((f) => (this.financial = f));
    this.analytics.getContainerMovement().subscribe((cm) => {
      this.containerMovement = cm;
      this.buildContainerCharts(cm);
    });
    this.analytics.getClientPerformance().subscribe((c) => (this.clientPerformance = c));
    this.analytics.getAgentPerformance().subscribe((a) => (this.agentPerformance = a));
    this.analytics.getAlerts().subscribe((a) => (this.alerts = a));
  }

  private buildContainerCharts(cm: ContainerMovement): void {
    this.containerChartData = {
      labels: ['In Port', 'Delivered Today', 'Returned Today', 'Stuffed Today', 'Sailed This Week'],
      datasets: [
        {
          label: 'Containers',
          data: [cm.inPort, cm.deliveredToday, cm.returnedToday, cm.stuffedToday, cm.sailedThisWeek],
          backgroundColor: ['#0d6efd', '#198754', '#20c997', '#fd7e14', '#6f42c1'],
          borderWidth: 0,
        },
      ],
    };
    this.movementChartData = {
      labels: ['In Port', 'Delivered Today', 'Returned Today', 'Stuffed Today', 'Sailed This Week'],
      datasets: [
        {
          label: 'Count',
          data: [cm.inPort, cm.deliveredToday, cm.returnedToday, cm.stuffedToday, cm.sailedThisWeek],
          backgroundColor: 'rgba(13, 110, 253, 0.6)',
          borderColor: '#0d6efd',
          borderWidth: 1,
          tension: 0.3,
        },
      ],
    };
  }

  formatCurrency(n: number): string {
    if (n >= 1e9) return `₦${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `₦${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `₦${(n / 1e3).toFixed(0)}K`;
    return `₦${n}`;
  }
}
