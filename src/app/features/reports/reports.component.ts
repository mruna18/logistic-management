import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsService } from './services/reports.service';
import { ChartWidgetComponent } from '../control-tower/widgets/chart-widget/chart-widget.component';
import type {
  OrderSummaryRow,
  ShipmentStatusRow,
  FinancialSummaryRow,
  ClearancePerformanceRow,
  ClientActivityRow,
} from './models/report.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ChartWidgetComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css',
})
export class ReportsComponent implements OnInit {
  activeReport: string | null = null;

  orderSummary: OrderSummaryRow[] = [];
  shipmentStatus: ShipmentStatusRow[] = [];
  financialSummary: FinancialSummaryRow[] = [];
  clearancePerformance: ClearancePerformanceRow[] = [];
  clientActivity: ClientActivityRow[] = [];

  orderChartData: any = null;
  shipmentChartData: any = null;
  financialChartData: any = null;

  constructor(private reports: ReportsService) {}

  ngOnInit(): void {
    this.loadOrderSummary();
    this.loadShipmentStatus();
    this.loadFinancialSummary();
    this.loadClearancePerformance();
    this.loadClientActivity();
  }

  selectReport(id: string): void {
    this.activeReport = this.activeReport === id ? null : id;
  }

  private loadOrderSummary(): void {
    this.reports.getOrderSummaryReport().subscribe((rows) => {
      this.orderSummary = rows;
      this.orderChartData = {
        labels: rows.map((r) => r.status),
        datasets: [
          { label: 'Import', data: rows.map((r) => r.import), backgroundColor: '#0d6efd' },
          { label: 'Export', data: rows.map((r) => r.export), backgroundColor: '#fd7e14' },
        ],
      };
    });
  }

  private loadShipmentStatus(): void {
    this.reports.getShipmentStatusReport().subscribe((rows) => {
      this.shipmentStatus = rows;
      this.shipmentChartData = {
        labels: rows.map((r) => r.stage),
        datasets: [
          {
            label: 'Count',
            data: rows.map((r) => r.count),
            backgroundColor: ['#0d6efd', '#198754', '#20c997', '#fd7e14', '#6f42c1'],
            borderWidth: 0,
          },
        ],
      };
    });
  }

  private loadFinancialSummary(): void {
    this.reports.getFinancialSummaryReport().subscribe((rows) => {
      this.financialSummary = rows;
      this.financialChartData = {
        labels: rows.map((r) => r.category),
        datasets: [
          {
            label: 'Amount (₦M)',
            data: rows.map((r) => r.amount / 1e6),
            backgroundColor: 'rgba(253, 126, 20, 0.7)',
            borderColor: '#fd7e14',
            borderWidth: 1,
          },
        ],
      };
    });
  }

  private loadClearancePerformance(): void {
    this.reports.getClearancePerformanceReport().subscribe((rows) => (this.clearancePerformance = rows));
  }

  private loadClientActivity(): void {
    this.reports.getClientActivityReport().subscribe((rows) => (this.clientActivity = rows));
  }

  formatCurrency(n: number): string {
    if (n >= 1e9) return `₦${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `₦${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `₦${(n / 1e3).toFixed(0)}K`;
    return `₦${n}`;
  }
}
