import { Injectable } from '@angular/core';
import { Observable, of, map, delay } from 'rxjs';
import {
  MOCK_CLIENTS,
  MOCK_TERMINALS,
  MOCK_SHIPPING_LINES,
  MOCK_CLEARING_AGENTS,
  MOCK_CONTAINER_TYPES,
  randomIn,
  randomInt,
  randomDate,
} from '../mock/report-mock.data';
import type { ReportFilterState, ReportDefinition } from '../models/report.model';

/** Report definitions - single source of truth */
export const REPORT_DEFINITIONS: ReportDefinition[] = [
  // IMPORT
  {
    id: 'import-shipment-status',
    title: 'Shipment Status',
    category: 'import',
    description: 'Import shipment status by stage',
    icon: 'ship',
    columns: [
      { field: 'orderRef', header: 'Order Ref', type: 'string', sortable: true },
      { field: 'client', header: 'Client', type: 'string', sortable: true },
      { field: 'status', header: 'Status', type: 'badge', sortable: true },
      { field: 'terminal', header: 'Terminal', type: 'string' },
      { field: 'daysAtPort', header: 'Days at Port', type: 'number', riskCondition: (r) => (r['daysAtPort'] as number) > 14 },
    ],
    supportsChart: true,
    chartType: 'bar',
    chartLabelField: 'status',
    chartValueField: 'count',
  },
  {
    id: 'import-paar-aging',
    title: 'PAAR Aging',
    category: 'import',
    description: 'PAAR processing aging analysis',
    icon: 'clock',
    columns: [
      { field: 'paarNumber', header: 'PAAR Number', type: 'string' },
      { field: 'orderRef', header: 'Order Ref', type: 'string' },
      { field: 'daysPending', header: 'Days Pending', type: 'number', riskCondition: (r) => (r['daysPending'] as number) > 7 },
      { field: 'status', header: 'Status', type: 'badge' },
    ],
    supportsChart: true,
    chartType: 'doughnut',
  },
  {
    id: 'import-customs-timeline',
    title: 'Customs Clearance Timeline',
    category: 'import',
    description: 'Clearance phase duration analysis',
    icon: 'check',
    columns: [
      { field: 'phase', header: 'Phase', type: 'string' },
      { field: 'avgDays', header: 'Avg Days', type: 'number' },
      { field: 'files', header: 'Files', type: 'number' },
      { field: 'trend', header: 'Trend', type: 'badge' },
    ],
    supportsChart: true,
    chartType: 'bar',
  },
  {
    id: 'import-refund-tracking',
    title: 'Refund Tracking',
    category: 'import',
    description: 'Refund status and aging',
    icon: 'wallet',
    columns: [
      { field: 'orderRef', header: 'Order Ref', type: 'string' },
      { field: 'amount', header: 'Amount', type: 'currency' },
      { field: 'daysPending', header: 'Days Pending', type: 'number', riskCondition: (r) => (r['daysPending'] as number) > 30 },
      { field: 'status', header: 'Status', type: 'badge' },
    ],
    supportsChart: false,
  },
  {
    id: 'import-demurrage-risk',
    title: 'Demurrage Risk',
    category: 'import',
    description: 'Containers at demurrage risk',
    icon: 'alert',
    columns: [
      { field: 'containerNo', header: 'Container', type: 'string' },
      { field: 'terminal', header: 'Terminal', type: 'string' },
      { field: 'freeDaysLeft', header: 'Free Days Left', type: 'number', riskCondition: (r) => (r['freeDaysLeft'] as number) <= 0 },
      { field: 'estimatedDemurrage', header: 'Est. Demurrage', type: 'currency' },
    ],
    supportsChart: true,
    chartType: 'bar',
  },
  // EXPORT
  {
    id: 'export-stuffing-status',
    title: 'Stuffing Status',
    category: 'export',
    description: 'Export stuffing completion status',
    icon: 'box',
    columns: [
      { field: 'orderRef', header: 'Order Ref', type: 'string' },
      { field: 'client', header: 'Client', type: 'string' },
      { field: 'stuffingStatus', header: 'Status', type: 'badge' },
      { field: 'containers', header: 'Containers', type: 'number' },
    ],
    supportsChart: true,
    chartType: 'pie',
  },
  {
    id: 'export-gate-in',
    title: 'Gate-in Status',
    category: 'export',
    description: 'Gate-in completion by shipment',
    icon: 'truck',
    columns: [
      { field: 'orderRef', header: 'Order Ref', type: 'string' },
      { field: 'terminal', header: 'Terminal', type: 'string' },
      { field: 'gateInDate', header: 'Gate-in Date', type: 'date' },
      { field: 'status', header: 'Status', type: 'badge' },
    ],
    supportsChart: false,
  },
  {
    id: 'export-vessel-delay',
    title: 'Vessel Delay',
    category: 'export',
    description: 'Vessel delay impact analysis',
    icon: 'ship',
    columns: [
      { field: 'vessel', header: 'Vessel', type: 'string' },
      { field: 'delayDays', header: 'Delay (Days)', type: 'number', riskCondition: (r) => (r['delayDays'] as number) > 3 },
      { field: 'affectedShipments', header: 'Affected', type: 'number' },
    ],
    supportsChart: true,
    chartType: 'bar',
  },
  {
    id: 'export-doc-completion',
    title: 'Documentation Completion',
    category: 'export',
    description: 'Export document completion status',
    icon: 'file',
    columns: [
      { field: 'orderRef', header: 'Order Ref', type: 'string' },
      { field: 'completed', header: 'Completed %', type: 'number', riskCondition: (r) => (r['completed'] as number) < 100 },
      { field: 'pendingDocs', header: 'Pending', type: 'number' },
    ],
    supportsChart: true,
    chartType: 'bar',
  },
  // FINANCE
  {
    id: 'finance-shipment-profitability',
    title: 'Shipment Profitability',
    category: 'finance',
    description: 'Revenue vs cost per shipment',
    icon: 'wallet',
    columns: [
      { field: 'orderRef', header: 'Order Ref', type: 'string' },
      { field: 'revenue', header: 'Revenue', type: 'currency' },
      { field: 'cost', header: 'Cost', type: 'currency' },
      { field: 'margin', header: 'Margin %', type: 'number', riskCondition: (r) => (r['margin'] as number) < 0 },
    ],
    supportsChart: true,
    chartType: 'bar',
  },
  {
    id: 'finance-client-revenue',
    title: 'Client Revenue',
    category: 'finance',
    description: 'Revenue by client',
    icon: 'person',
    columns: [
      { field: 'client', header: 'Client', type: 'string' },
      { field: 'revenue', header: 'Revenue', type: 'currency' },
      { field: 'shipments', header: 'Shipments', type: 'number' },
    ],
    supportsChart: true,
    chartType: 'bar',
  },
  {
    id: 'finance-cost-leakage',
    title: 'Cost Leakage',
    category: 'finance',
    description: 'Unplanned cost analysis',
    icon: 'alert',
    columns: [
      { field: 'category', header: 'Category', type: 'string' },
      { field: 'amount', header: 'Amount', type: 'currency' },
      { field: 'count', header: 'Count', type: 'number' },
    ],
    supportsChart: true,
    chartType: 'doughnut',
  },
  {
    id: 'finance-outstanding-invoices',
    title: 'Outstanding Invoices',
    category: 'finance',
    description: 'Unpaid invoice aging',
    icon: 'file',
    columns: [
      { field: 'invoiceRef', header: 'Invoice', type: 'string' },
      { field: 'client', header: 'Client', type: 'string' },
      { field: 'amount', header: 'Amount', type: 'currency' },
      { field: 'daysOverdue', header: 'Days Overdue', type: 'number', riskCondition: (r) => (r['daysOverdue'] as number) > 30 },
    ],
    supportsChart: false,
  },
  {
    id: 'finance-monthly-margin',
    title: 'Monthly Margin Trend',
    category: 'finance',
    description: 'Margin trend over time',
    icon: 'chart',
    columns: [
      { field: 'month', header: 'Month', type: 'string' },
      { field: 'revenue', header: 'Revenue', type: 'currency' },
      { field: 'margin', header: 'Margin %', type: 'number' },
    ],
    supportsChart: true,
    chartType: 'line',
  },
  // OPERATIONS
  {
    id: 'ops-container-lifecycle',
    title: 'Container Lifecycle',
    category: 'operations',
    description: 'Container movement by stage',
    icon: 'clipboard',
    columns: [
      { field: 'containerNo', header: 'Container', type: 'string' },
      { field: 'stage', header: 'Stage', type: 'badge' },
      { field: 'daysInStage', header: 'Days', type: 'number' },
    ],
    supportsChart: true,
    chartType: 'bar',
  },
  {
    id: 'ops-driver-performance',
    title: 'Driver Performance',
    category: 'operations',
    description: 'Trip completion by driver',
    icon: 'truck',
    columns: [
      { field: 'driver', header: 'Driver', type: 'string' },
      { field: 'trips', header: 'Trips', type: 'number' },
      { field: 'onTimeRate', header: 'On-time %', type: 'number', riskCondition: (r) => (r['onTimeRate'] as number) < 80 },
    ],
    supportsChart: true,
    chartType: 'bar',
  },
  {
    id: 'ops-trip-duration',
    title: 'Trip Duration',
    category: 'operations',
    description: 'Average trip duration analysis',
    icon: 'clock',
    columns: [
      { field: 'route', header: 'Route', type: 'string' },
      { field: 'avgHours', header: 'Avg Hours', type: 'number' },
      { field: 'trips', header: 'Trips', type: 'number' },
    ],
    supportsChart: true,
    chartType: 'bar',
  },
  {
    id: 'ops-yard-occupancy',
    title: 'Yard Occupancy',
    category: 'operations',
    description: 'Yard utilization by terminal',
    icon: 'clipboard',
    columns: [
      { field: 'terminal', header: 'Terminal', type: 'string' },
      { field: 'occupancy', header: 'Occupancy %', type: 'number', riskCondition: (r) => (r['occupancy'] as number) > 90 },
      { field: 'containers', header: 'Containers', type: 'number' },
    ],
    supportsChart: true,
    chartType: 'bar',
  },
  // MANAGEMENT
  {
    id: 'mgmt-sla-breach',
    title: 'SLA Breach',
    category: 'management',
    description: 'SLA breach incidents',
    icon: 'alert',
    columns: [
      { field: 'orderRef', header: 'Order Ref', type: 'string' },
      { field: 'slaType', header: 'SLA Type', type: 'string' },
      { field: 'breachDays', header: 'Breach Days', type: 'number', riskCondition: () => true },
    ],
    supportsChart: true,
    chartType: 'bar',
  },
  {
    id: 'mgmt-top-clients',
    title: 'Top Profitable Clients',
    category: 'management',
    description: 'Highest margin clients',
    icon: 'person',
    columns: [
      { field: 'client', header: 'Client', type: 'string' },
      { field: 'revenue', header: 'Revenue', type: 'currency' },
      { field: 'margin', header: 'Margin %', type: 'number' },
    ],
    supportsChart: true,
    chartType: 'bar',
  },
  {
    id: 'mgmt-loss-making',
    title: 'Loss Making Shipments',
    category: 'management',
    description: 'Shipments with negative margin',
    icon: 'alert',
    columns: [
      { field: 'orderRef', header: 'Order Ref', type: 'string' },
      { field: 'loss', header: 'Loss', type: 'currency', riskCondition: () => true },
      { field: 'client', header: 'Client', type: 'string' },
    ],
    supportsChart: false,
  },
  {
    id: 'mgmt-cycle-time',
    title: 'Cycle Time Analysis',
    category: 'management',
    description: 'End-to-end cycle time',
    icon: 'clock',
    columns: [
      { field: 'phase', header: 'Phase', type: 'string' },
      { field: 'avgDays', header: 'Avg Days', type: 'number' },
      { field: 'targetDays', header: 'Target', type: 'number', riskCondition: (r) => (r['avgDays'] as number) > (r['targetDays'] as number) },
    ],
    supportsChart: true,
    chartType: 'bar',
  },
];

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor() {}

  getReportDefinitions(category?: string): ReportDefinition[] {
    if (category) {
      return REPORT_DEFINITIONS.filter((r) => r.category === category);
    }
    return REPORT_DEFINITIONS;
  }

  getReportById(id: string): ReportDefinition | undefined {
    return REPORT_DEFINITIONS.find((r) => r.id === id);
  }

  /** Run report with filters - returns rows for table + chart data */
  runReport(
    reportId: string,
    filters: Partial<ReportFilterState>
  ): Observable<{ rows: Record<string, unknown>[]; chartData?: unknown }> {
    return of(this.generateReportData(reportId, filters)).pipe(
      delay(300),
      map((data) => this.applyFilters(data, filters))
    );
  }

  private generateReportData(reportId: string, _filters: Partial<ReportFilterState>): { rows: Record<string, unknown>[]; chartData?: unknown } {
    const def = this.getReportById(reportId);
    if (!def) return { rows: [] };

    const rows: Record<string, unknown>[] = [];
    const count = randomInt(15, 45);

    switch (reportId) {
      case 'import-shipment-status':
        for (let i = 0; i < count; i++) {
          rows.push({
            orderRef: `ORD-2024-${String(i + 1).padStart(3, '0')}`,
            client: randomIn(MOCK_CLIENTS),
            status: randomIn(['At Port', 'Under Clearance', 'In Delivery', 'Delivered']),
            terminal: randomIn(MOCK_TERMINALS),
            daysAtPort: randomInt(1, 25),
          });
        }
        break;
      case 'import-paar-aging':
        for (let i = 0; i < count; i++) {
          rows.push({
            paarNumber: `PAAR-2024-${String(i + 1).padStart(3, '0')}`,
            orderRef: `ORD-2024-${String(i + 1).padStart(3, '0')}`,
            daysPending: randomInt(1, 15),
            status: randomIn(['Pending', 'Approved', 'In Progress']),
          });
        }
        break;
      case 'import-customs-timeline':
        rows.push(
          { phase: 'PAAR', avgDays: 5.2, files: 42, trend: 'down' },
          { phase: 'Customs', avgDays: 3.8, files: 38, trend: 'stable' },
          { phase: 'Terminal', avgDays: 2.1, files: 55, trend: 'down' }
        );
        break;
      case 'import-refund-tracking':
        for (let i = 0; i < count; i++) {
          rows.push({
            orderRef: `ORD-2024-${String(i + 1).padStart(3, '0')}`,
            amount: randomInt(50, 500) * 10000,
            daysPending: randomInt(5, 60),
            status: randomIn(['Pending', 'Processing', 'Completed']),
          });
        }
        break;
      case 'import-demurrage-risk':
        for (let i = 0; i < count; i++) {
          rows.push({
            containerNo: `CONT-${String(i + 1).padStart(4, '0')}`,
            terminal: randomIn(MOCK_TERMINALS),
            freeDaysLeft: randomInt(-5, 10),
            estimatedDemurrage: randomInt(0, 500) * 10000,
          });
        }
        break;
      case 'export-stuffing-status':
        for (let i = 0; i < count; i++) {
          rows.push({
            orderRef: `EXP-2024-${String(i + 1).padStart(3, '0')}`,
            client: randomIn(MOCK_CLIENTS),
            stuffingStatus: randomIn(['Pending', 'In Progress', 'Completed']),
            containers: randomInt(1, 4),
          });
        }
        break;
      case 'export-gate-in':
        for (let i = 0; i < count; i++) {
          rows.push({
            orderRef: `EXP-2024-${String(i + 1).padStart(3, '0')}`,
            terminal: randomIn(MOCK_TERMINALS),
            gateInDate: randomDate(30),
            status: randomIn(['Pending', 'Completed']),
          });
        }
        break;
      case 'export-vessel-delay':
        for (let i = 0; i < 8; i++) {
          rows.push({
            vessel: `MV ${randomIn(['Atlantic', 'Pacific', 'Indian'])} ${i + 1}`,
            delayDays: randomInt(0, 7),
            affectedShipments: randomInt(2, 15),
          });
        }
        break;
      case 'export-doc-completion':
        for (let i = 0; i < count; i++) {
          rows.push({
            orderRef: `EXP-2024-${String(i + 1).padStart(3, '0')}`,
            completed: randomInt(60, 100),
            pendingDocs: randomInt(0, 3),
          });
        }
        break;
      case 'finance-shipment-profitability':
        for (let i = 0; i < count; i++) {
          const rev = randomInt(500, 2000) * 10000;
          const cost = rev * (0.7 + Math.random() * 0.5);
          rows.push({
            orderRef: `ORD-2024-${String(i + 1).padStart(3, '0')}`,
            revenue: rev,
            cost: Math.round(cost),
            margin: Math.round(((rev - cost) / rev) * 100),
          });
        }
        break;
      case 'finance-client-revenue':
        MOCK_CLIENTS.forEach((c, i) => {
          rows.push({
            client: c,
            revenue: randomInt(5, 50) * 1000000,
            shipments: randomInt(3, 25),
          });
        });
        break;
      case 'finance-cost-leakage':
        rows.push(
          { category: 'Demurrage', amount: 12500000, count: 12 },
          { category: 'Storage', amount: 8500000, count: 8 },
          { category: 'Re-handling', amount: 3200000, count: 5 }
        );
        break;
      case 'finance-outstanding-invoices':
        for (let i = 0; i < count; i++) {
          rows.push({
            invoiceRef: `INV-2024-${String(i + 1).padStart(4, '0')}`,
            client: randomIn(MOCK_CLIENTS),
            amount: randomInt(100, 800) * 10000,
            daysOverdue: randomInt(0, 90),
          });
        }
        break;
      case 'finance-monthly-margin':
        ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].forEach((m, i) => {
          rows.push({
            month: m,
            revenue: randomInt(80, 150) * 1000000,
            margin: randomInt(8, 22),
          });
        });
        break;
      case 'ops-container-lifecycle':
        for (let i = 0; i < count; i++) {
          rows.push({
            containerNo: `CONT-${String(i + 1).padStart(4, '0')}`,
            stage: randomIn(['At Port', 'Clearance', 'Delivery', 'Returned']),
            daysInStage: randomInt(1, 12),
          });
        }
        break;
      case 'ops-driver-performance':
        for (let i = 0; i < 12; i++) {
          rows.push({
            driver: `Driver ${i + 1}`,
            trips: randomInt(15, 45),
            onTimeRate: randomInt(70, 98),
          });
        }
        break;
      case 'ops-trip-duration':
        ['Lagos-Apapa', 'Onne-Port Harcourt', 'Apapa-Ibadan'].forEach((r, i) => {
          rows.push({
            route: r,
            avgHours: randomInt(2, 8),
            trips: randomInt(20, 80),
          });
        });
        break;
      case 'ops-yard-occupancy':
        MOCK_TERMINALS.forEach((t) => {
          rows.push({
            terminal: t,
            occupancy: randomInt(65, 95),
            containers: randomInt(200, 800),
          });
        });
        break;
      case 'mgmt-sla-breach':
        for (let i = 0; i < count; i++) {
          rows.push({
            orderRef: `ORD-2024-${String(i + 1).padStart(3, '0')}`,
            slaType: randomIn(['Clearance', 'Delivery', 'Documentation']),
            breachDays: randomInt(1, 10),
          });
        }
        break;
      case 'mgmt-top-clients':
        MOCK_CLIENTS.slice(0, 5).forEach((c) => {
          rows.push({
            client: c,
            revenue: randomInt(20, 80) * 1000000,
            margin: randomInt(12, 28),
          });
        });
        break;
      case 'mgmt-loss-making':
        for (let i = 0; i < Math.min(count, 10); i++) {
          rows.push({
            orderRef: `ORD-2024-${String(i + 1).padStart(3, '0')}`,
            loss: randomInt(50, 300) * 10000,
            client: randomIn(MOCK_CLIENTS),
          });
        }
        break;
      case 'mgmt-cycle-time':
        rows.push(
          { phase: 'Order to Port', avgDays: 12, targetDays: 14 },
          { phase: 'Port to Clearance', avgDays: 8, targetDays: 7 },
          { phase: 'Clearance to Delivery', avgDays: 5, targetDays: 5 }
        );
        break;
      default:
        return { rows: [] };
    }

    const chartData = this.buildChartData(def, rows);
    return { rows, chartData };
  }

  private buildChartData(def: ReportDefinition, rows: Record<string, unknown>[]): unknown {
    if (!def.supportsChart || !def.chartType) return undefined;

    const labelField = def.chartLabelField || def.columns[0]?.field || 'label';
    const valueField = def.chartValueField || def.columns[1]?.field || 'value';

    const grouped = new Map<string, number>();
    rows.forEach((r) => {
      const key = String(r[labelField] ?? '');
      const val = typeof r[valueField] === 'number' ? (r[valueField] as number) : 1;
      grouped.set(key, (grouped.get(key) ?? 0) + val);
    });

    const labels = Array.from(grouped.keys());
    const data = Array.from(grouped.values());

    return {
      labels,
      datasets: [
        {
          label: def.title,
          data,
          backgroundColor: ['#0d6efd', '#198754', '#20c997', '#fd7e14', '#6f42c1', '#dc3545', '#0dcaf0', '#ffc107'].slice(0, labels.length),
          borderWidth: def.chartType === 'bar' ? 0 : 1,
        },
      ],
    };
  }

  private applyFilters(
    result: { rows: Record<string, unknown>[]; chartData?: unknown },
    filters: Partial<ReportFilterState>
  ): { rows: Record<string, unknown>[]; chartData?: unknown } {
    let rows = result.rows;
    if (filters.clients?.length) {
      rows = rows.filter((r) => r['client'] && filters.clients!.includes(r['client'] as string));
    }
    return { ...result, rows };
  }

  getFilterOptions(): Observable<{
    clients: string[];
    terminals: string[];
    shippingLines: string[];
    clearingAgents: string[];
    containerTypes: string[];
  }> {
    return of({
      clients: MOCK_CLIENTS,
      terminals: MOCK_TERMINALS,
      shippingLines: MOCK_SHIPPING_LINES,
      clearingAgents: MOCK_CLEARING_AGENTS,
      containerTypes: MOCK_CONTAINER_TYPES,
    });
  }
}
