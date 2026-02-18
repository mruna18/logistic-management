/**
 * Export Shipment State Machine
 * Transitions automatic based on dates and events
 */

export enum ExportShipmentStatus {
  DRAFT = 'DRAFT',
  PLANNING = 'PLANNING',
  STUFFING_IN_PROGRESS = 'STUFFING_IN_PROGRESS',
  AT_PORT = 'AT_PORT',
  UNDER_CUSTOMS = 'UNDER_CUSTOMS',
  CLEARED_FOR_LOADING = 'CLEARED_FOR_LOADING',
  SAILED = 'SAILED',
  DOCUMENTATION_PENDING = 'DOCUMENTATION_PENDING',
  READY_FOR_INVOICE = 'READY_FOR_INVOICE',
  CLOSED = 'CLOSED',
  ON_HOLD = 'ON_HOLD',
}

export const EXPORT_STATUS_LABELS: Record<ExportShipmentStatus, string> = {
  [ExportShipmentStatus.DRAFT]: 'Draft',
  [ExportShipmentStatus.PLANNING]: 'Planning',
  [ExportShipmentStatus.STUFFING_IN_PROGRESS]: 'Stuffing In Progress',
  [ExportShipmentStatus.AT_PORT]: 'At Port',
  [ExportShipmentStatus.UNDER_CUSTOMS]: 'Under Customs',
  [ExportShipmentStatus.CLEARED_FOR_LOADING]: 'Cleared for Loading',
  [ExportShipmentStatus.SAILED]: 'Sailed',
  [ExportShipmentStatus.DOCUMENTATION_PENDING]: 'Documentation Pending',
  [ExportShipmentStatus.READY_FOR_INVOICE]: 'Ready for Invoice',
  [ExportShipmentStatus.CLOSED]: 'Closed',
  [ExportShipmentStatus.ON_HOLD]: 'On Hold',
};
