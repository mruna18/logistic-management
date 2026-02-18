import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardKPIs } from '../../core/services/dashboard.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ChartComponent } from '../../shared/components/chart/chart.component';
import { Status } from '../../shared/enums/status.enum';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgeComponent, ChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  kpis: Partial<DashboardKPIs> = {};
  recentShipments: any[] = [];
  Status = Status;

  // Chart data
  shipmentStatusData: any = {};
  exportStatusData: any = {};
  monthlyShipmentsData: any = {};
  containerStatusData: any = {};
  demurrageRiskData: any = {};
  revenueTrendData: any = {};
  productTypeData: any = {};
  terminalPerformanceData: any = {};
  clearanceSLAData: any = {};
  containerTurnaroundData: any = {};
  phaseOverview: { phase: number; label: string; count: number }[] = [];

  // Chart options
  revenueChartOptions: any = {
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => {
            return '₦' + (value / 1000000).toFixed(1) + 'M';
          }
        }
      }
    }
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.dashboardService.getKPIs().subscribe(kpis => {
      this.kpis = kpis;
    });

    this.dashboardService.getRecentShipments().subscribe(shipments => {
      this.recentShipments = shipments.slice(0, 5);
    });

    // Load chart data
    this.dashboardService.getShipmentStatusData().subscribe(data => {
      this.shipmentStatusData = data;
    });

    this.dashboardService.getExportStatusData().subscribe(data => {
      this.exportStatusData = data;
    });

    this.dashboardService.getMonthlyShipmentsData().subscribe(data => {
      this.monthlyShipmentsData = data;
    });

    this.dashboardService.getContainerStatusData().subscribe(data => {
      this.containerStatusData = data;
    });

    this.dashboardService.getDemurrageRiskData().subscribe(data => {
      this.demurrageRiskData = data;
    });

    this.dashboardService.getRevenueTrendData().subscribe(data => {
      this.revenueTrendData = data;
    });

    this.dashboardService.getProductTypeDistribution().subscribe(data => {
      this.productTypeData = data;
    });

    this.dashboardService.getTerminalPerformance().subscribe(data => {
      this.terminalPerformanceData = data;
    });

    this.dashboardService.getClearanceSLA().subscribe(data => {
      this.clearanceSLAData = data;
    });

    this.dashboardService.getContainerTurnaround().subscribe(data => {
      this.containerTurnaroundData = data;
    });

    this.dashboardService.getPhaseOverview().subscribe(data => {
      this.phaseOverview = data;
    });
  }
}

