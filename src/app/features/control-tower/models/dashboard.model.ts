/**
 * Control Tower Dashboard Models
 * Unified analytics for Import & Export workflows
 */

export interface ShipmentOverview {
  totalActive: number;
  totalImport: number;
  totalExport: number;
  arrivedAtPort: number;
  underClearance: number;
  inDelivery: number;
  sailed: number;
  readyForInvoice: number;
}

export interface BottleneckTracker {
  stuckInPaar: number;
  stuckInCustoms: number;
  stuckInRegulatory: number;
  containersInTerminal: number;
  exportWaitingForVessel: number;
}

export interface FinancialExposure {
  dutyUnpaidTotal: number;
  refundPendingTotal: number;
  demurrageRiskContainers: number;
  invoicePendingAmount: number;
  unbilledShipmentsCount: number;
}

export interface ContainerMovement {
  inPort: number;
  deliveredToday: number;
  returnedToday: number;
  stuffedToday: number;
  sailedThisWeek: number;
}

export interface ClientPerformance {
  client: string;
  activeFiles: number;
  delayedFiles: number;
  paymentDelay: number;
  riskLevel: 'green' | 'yellow' | 'red';
}

export interface AgentPerformance {
  agent: string;
  filesHandled: number;
  avgClearanceTime: number;
  queriesPercent: number;
}

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface DashboardAlert {
  id: string;
  type: string;
  title: string;
  message: string;
  count: number;
  severity: AlertSeverity;
  timestamp: Date;
}
