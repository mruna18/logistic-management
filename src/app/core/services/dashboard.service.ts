import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Shipment } from '../../shared/models/shipment.model';
import { MockDataService } from './mock-data.service';

export interface DashboardKPIs {
  activeShipments: number;
  containersInTransit: number;
  containersAtPort: number;
  containersInClearance: number;
  demurrageRisk: number;
  refundPending: number;
  approvalPending: number;
  deliveredThisMonth: number;
  totalRevenue: number;
  pendingClearance: number;
  averageClearanceDays: number;
  /** Export KPIs */
  exportActive: number;
  exportSailed: number;
  exportReadyForInvoice: number;
  exportClosed: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private mockDataService: MockDataService) {}

  getKPIs(): Observable<DashboardKPIs> {
    return of({
      activeShipments: 12,
      containersInTransit: 8,
      containersAtPort: 5,
      containersInClearance: 7,
      demurrageRisk: 3,
      refundPending: 4,
      approvalPending: 2,
      deliveredThisMonth: 25,
      totalRevenue: 45000000,
      pendingClearance: 7,
      averageClearanceDays: 4.2,
      exportActive: 5,
      exportSailed: 8,
      exportReadyForInvoice: 3,
      exportClosed: 12,
    });
  }

  getExportKPIs(): Observable<{ active: number; sailed: number; readyForInvoice: number; closed: number }> {
    return of({
      active: 5,
      sailed: 8,
      readyForInvoice: 3,
      closed: 12,
    });
  }

  getExportStatusData(): Observable<{ labels: string[]; datasets: { label: string; data: number[]; backgroundColor: string[] }[] }> {
    return of({
      labels: ['Draft', 'Planning', 'Stuffing', 'At Port', 'Customs', 'Sailed', 'Docs Pending', 'Ready', 'Closed'],
      datasets: [{
        label: 'Export Shipments',
        data: [2, 1, 2, 1, 1, 8, 2, 3, 12],
        backgroundColor: ['#6c757d', '#0d6efd', '#ffc107', '#0d6efd', '#ffc107', '#198754', '#ffc107', '#198754', '#212529'],
      }],
    });
  }

  getRecentShipments(): Observable<Shipment[]> {
    return this.mockDataService.getShipments();
  }

  getShipmentStatusData(): Observable<any> {
    return of({
      labels: ['Pending', 'In Progress', 'Completed', 'Delayed'],
      datasets: [{
        label: 'Shipments',
        data: [8, 15, 22, 3],
        backgroundColor: [
          '#6c757d',
          '#ffc107',
          '#198754',
          '#dc3545'
        ],
        borderWidth: 1
      }]
    });
  }

  getMonthlyShipmentsData(): Observable<any> {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return of({
      labels: months,
      datasets: [
        {
          label: 'Shipments',
          data: [12, 19, 15, 25, 22, 30],
          borderColor: '#41299b',
          backgroundColor: 'rgba(65, 41, 155, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    });
  }

  getContainerStatusData(): Observable<any> {
    return of({
      labels: ['In Transit', 'At Port', 'Delivered', 'Delayed'],
      datasets: [{
        label: 'Containers',
        data: [18, 12, 35, 5],
        backgroundColor: [
          '#0d6efd',
          '#ffc107',
          '#198754',
          '#dc3545'
        ],
        borderWidth: 1
      }]
    });
  }

  getDemurrageRiskData(): Observable<any> {
    return of({
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        label: 'Demurrage Risk (₦)',
        data: [500000, 750000, 1200000, 950000],
        backgroundColor: '#dc3545',
        borderColor: '#dc3545',
        borderWidth: 1
      }]
    });
  }

  getRevenueTrendData(): Observable<any> {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return of({
      labels: months,
      datasets: [
        {
          label: 'Revenue (₦)',
          data: [35000000, 42000000, 38000000, 45000000, 48000000, 52000000],
          borderColor: '#198754',
          backgroundColor: 'rgba(25, 135, 84, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    });
  }

  getProductTypeDistribution(): Observable<any> {
    return of({
      labels: ['Electronics', 'Textiles', 'Food Items', 'Machinery', 'General Cargo'],
      datasets: [{
        label: 'Shipments',
        data: [15, 12, 8, 10, 5],
        backgroundColor: [
          '#41299b',
          '#0d6efd',
          '#ffc107',
          '#198754',
          '#6c757d'
        ],
        borderWidth: 1
      }]
    });
  }

  getTerminalPerformance(): Observable<any> {
    return of({
      labels: ['APMT Apapa', 'TICT Tin Can', 'PTML', 'Lilypond'],
      datasets: [{
        label: 'Shipments Cleared',
        data: [45, 32, 28, 15],
        backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#6c757d'],
        borderWidth: 1
      }]
    });
  }

  getClearanceSLA(): Observable<any> {
    return of({
      labels: ['Within SLA', '1-2 Days Over', '3+ Days Over'],
      datasets: [{
        label: 'Shipments',
        data: [78, 15, 7],
        backgroundColor: ['#198754', '#ffc107', '#dc3545'],
        borderWidth: 1
      }]
    });
  }

  getPhaseOverview(): Observable<{ phase: number; label: string; count: number }[]> {
    return of([
      { phase: 1, label: 'Pre-Shipment (Form M)', count: 3 },
      { phase: 2, label: 'Shipment & Export', count: 5 },
      { phase: 3, label: 'PAAR', count: 4 },
      { phase: 4, label: 'Port & Customs', count: 7 },
      { phase: 5, label: 'Delivery & Empty Return', count: 6 },
      { phase: 6, label: 'Bank Closure', count: 2 },
    ]);
  }

  getContainerTurnaround(): Observable<any> {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return of({
      labels: days,
      datasets: [{
        label: 'Avg Days (Gate Out to Empty Return)',
        data: [4.2, 3.8, 4.5, 3.9, 4.1, 5.2],
        borderColor: '#41299b',
        backgroundColor: 'rgba(65, 41, 155, 0.1)',
        tension: 0.4,
        fill: true
      }]
    });
  }
}

