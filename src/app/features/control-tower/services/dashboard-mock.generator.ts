/**
 * Dashboard Mock Data Generator
 * Produces deterministic control tower analytics from shipment/container data
 */

import type {
  ShipmentOverview,
  BottleneckTracker,
  FinancialExposure,
  ContainerMovement,
  ClientPerformance,
  AgentPerformance,
  DashboardAlert,
} from '../models/dashboard.model';

const CLIENTS = [
  'Magnifico Synergies Ltd',
  'Acme Industries Ltd',
  'Nigerian Petro Corp',
  'Lagos Trading Co',
  'West Africa Imports',
  'Delta Logistics Ltd',
];

const AGENTS = [
  { name: 'Chidi Okonkwo', avgDays: 4.2, queriesPct: 8 },
  { name: 'Amara Nwosu', avgDays: 3.8, queriesPct: 12 },
  { name: 'Obi Eze', avgDays: 5.1, queriesPct: 18 },
  { name: 'Ngozi Adeyemi', avgDays: 4.5, queriesPct: 6 },
  { name: 'Ibrahim Musa', avgDays: 4.8, queriesPct: 14 },
];

export function generateShipmentOverview(shipmentsCount: number): ShipmentOverview {
  const total = Math.max(shipmentsCount, 55);
  const importPct = 0.65;
  const exportPct = 0.35;
  return {
    totalActive: total,
    totalImport: Math.round(total * importPct),
    totalExport: Math.round(total * exportPct),
    arrivedAtPort: Math.round(total * 0.15),
    underClearance: Math.round(total * 0.22),
    inDelivery: Math.round(total * 0.12),
    sailed: Math.round(total * 0.28),
    readyForInvoice: Math.round(total * 0.09),
  };
}

export function generateBottlenecks(): BottleneckTracker {
  return {
    stuckInPaar: 4,
    stuckInCustoms: 6,
    stuckInRegulatory: 3,
    containersInTerminal: 9,
    exportWaitingForVessel: 2,
  };
}

export function generateFinancialExposure(shipmentsCount: number): FinancialExposure {
  const base = Math.max(shipmentsCount, 40);
  return {
    dutyUnpaidTotal: base * 3200000,
    refundPendingTotal: 45000000,
    demurrageRiskContainers: 7,
    invoicePendingAmount: 89000000,
    unbilledShipmentsCount: Math.round(base * 0.22),
  };
}

export function generateContainerMovement(containersCount: number): ContainerMovement {
  const total = Math.max(containersCount, 70);
  return {
    inPort: Math.round(total * 0.26),
    deliveredToday: 5,
    returnedToday: 3,
    stuffedToday: 4,
    sailedThisWeek: 12,
  };
}

export function generateClientPerformance(): ClientPerformance[] {
  return CLIENTS.map((client, i) => {
    const active = 4 + i * 2 + Math.floor(Math.random() * 4);
    const delayed = Math.floor(active * (0.1 + Math.random() * 0.2));
    const paymentDelay = Math.floor(Math.random() * 5);
    return {
      client,
      activeFiles: active,
      delayedFiles: delayed,
      paymentDelay,
      riskLevel: delayed < 2 ? 'green' : delayed <= 5 ? 'yellow' : 'red',
    };
  });
}

export function generateAgentPerformance(): AgentPerformance[] {
  return AGENTS.map((a, i) => ({
    agent: a.name,
    filesHandled: 12 + i * 4 + Math.floor(Math.random() * 6),
    avgClearanceTime: a.avgDays,
    queriesPercent: a.queriesPct,
  }));
}

export function generateAlerts(bottlenecks: BottleneckTracker): DashboardAlert[] {
  const now = new Date();
  const alerts: DashboardAlert[] = [];
  if (bottlenecks.stuckInPaar > 0) {
    alerts.push({
      id: 'paar',
      type: 'paar_delay',
      title: 'PAAR Delay',
      message: `${bottlenecks.stuckInPaar} shipments stuck in PAAR >3 days`,
      count: bottlenecks.stuckInPaar,
      severity: 'critical',
      timestamp: now,
    });
  }
  if (bottlenecks.stuckInCustoms > 0) {
    alerts.push({
      id: 'customs',
      type: 'customs_query',
      title: 'Customs Query Open >48h',
      message: `${bottlenecks.stuckInCustoms} shipments with open customs queries`,
      count: bottlenecks.stuckInCustoms,
      severity: 'warning',
      timestamp: now,
    });
  }
  alerts.push({
    id: 'demurrage',
    type: 'demurrage_risk',
    title: 'Container Demurrage Risk',
    message: '7 containers at demurrage risk',
    count: 7,
    severity: 'critical',
    timestamp: now,
  });
  if (bottlenecks.exportWaitingForVessel > 0) {
    alerts.push({
      id: 'export',
      type: 'export_docs',
      title: 'Export Docs Missing Before ETD',
      message: `${bottlenecks.exportWaitingForVessel} export shipments missing docs`,
      count: bottlenecks.exportWaitingForVessel,
      severity: 'warning',
      timestamp: now,
    });
  }
  alerts.push({
    id: 'invoice',
    type: 'invoice_pending',
    title: 'Invoice Pending >7 Days',
    message: '12 shipments with pending invoices',
    count: 12,
    severity: 'info',
    timestamp: now,
  });
  return alerts;
}
