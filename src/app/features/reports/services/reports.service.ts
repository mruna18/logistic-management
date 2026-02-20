import { Injectable } from '@angular/core';
import { Observable, of, map } from 'rxjs';
import { MockDataService } from '../../../core/services/mock-data.service';
import type {
  OrderSummaryRow,
  ShipmentStatusRow,
  FinancialSummaryRow,
  ClearancePerformanceRow,
  ClientActivityRow,
} from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  constructor(private mockData: MockDataService) {}

  getOrderSummaryReport(): Observable<OrderSummaryRow[]> {
    return this.mockData.getImportOrders().pipe(
      map((orders) => {
        const byStatus: Record<string, { import: number; export: number }> = {};
        orders.forEach((o) => {
          const status = (o.status as string) || 'Unknown';
          if (!byStatus[status]) byStatus[status] = { import: 0, export: 0 };
          if (o.jobType === 'Export') byStatus[status].export++;
          else byStatus[status].import++;
        });
        return Object.entries(byStatus).map(([status, v]) => ({
          status,
          import: v.import,
          export: v.export,
          total: v.import + v.export,
        }));
      })
    );
  }

  getShipmentStatusReport(): Observable<ShipmentStatusRow[]> {
    return this.mockData.getShipments().pipe(
      map((shipments) => {
        const byStage: Record<string, number> = {};
        shipments.forEach((s) => {
          const stage = (s.status as string) || 'Unknown';
          byStage[stage] = (byStage[stage] ?? 0) + 1;
        });
        const total = shipments.length;
        return Object.entries(byStage).sort((a, b) => b[1] - a[1]).map(([stage, count]) => ({
          stage,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }));
      })
    );
  }

  getFinancialSummaryReport(): Observable<FinancialSummaryRow[]> {
    return this.mockData.getShipments().pipe(
      map((shipments) => {
        const n = shipments.length;
        return [
          { category: 'Duty Unpaid', amount: n * 850000, count: n },
          { category: 'Refund Pending', amount: n * 120000 },
          { category: 'Demurrage Risk', amount: n * 45000, count: Math.floor(n * 0.3) },
          { category: 'Invoice Pending', amount: n * 1200000 },
          { category: 'Unbilled Shipments', amount: n * 980000, count: Math.floor(n * 0.4) },
        ];
      })
    );
  }

  getClearancePerformanceReport(): Observable<ClearancePerformanceRow[]> {
    return of([
      { phase: 'PAAR Processing', avgDays: 5.2, files: 42, trend: 'down' },
      { phase: 'Customs Examination', avgDays: 3.8, files: 28, trend: 'stable' },
      { phase: 'Regulatory Clearance', avgDays: 4.1, files: 35, trend: 'up' },
      { phase: 'Terminal Release', avgDays: 2.1, files: 58, trend: 'down' },
      { phase: 'Delivery Order', avgDays: 1.5, files: 62, trend: 'stable' },
    ]);
  }

  getClientActivityReport(): Observable<ClientActivityRow[]> {
    return this.mockData.getImportOrders().pipe(
      map((orders) => {
        const byClient: Record<string, { active: number; completed: number; days: number[] }> = {};
        const clients = ['Magnifico Synergies Ltd', 'Acme Industries Ltd', 'Nigerian Petro Corp', 'Lagos Trading Co', 'West Africa Imports'];
        orders.forEach((o) => {
          const client = o.buyerName || clients[Math.floor(Math.random() * clients.length)];
          if (!byClient[client]) byClient[client] = { active: 0, completed: 0, days: [] };
          byClient[client].active++;
          byClient[client].completed += Math.floor(Math.random() * 3);
          byClient[client].days.push(3 + Math.floor(Math.random() * 8));
        });
        return Object.entries(byClient).map(([client, v]) => ({
          client,
          activeFiles: v.active,
          completedThisMonth: v.completed,
          avgClearanceDays: v.days.length ? Math.round(v.days.reduce((a, b) => a + b, 0) / v.days.length * 10) / 10 : 0,
        }));
      })
    );
  }
}
