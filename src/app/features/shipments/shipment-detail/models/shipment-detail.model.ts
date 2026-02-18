import { OriginDetailsModel } from '../../../import-orders/origin-details/origin-details.component';
import { PreArrivalModel } from '../../../import-orders/pre-arrival/pre-arrival.component';
import type { TerminalShippingModel } from '../components/terminal-shipping/terminal-shipping.component';
import type { CustomsRegulatoryModel } from '../components/customs-regulatory/customs-regulatory.component';
import type { TransportDeliveryModel } from '../components/transport-delivery/transport-delivery.component';

export type ShipmentStatus =
  | 'Draft'
  | 'In Progress'
  | 'Pre Arrival'
  | 'Awaiting Payment'
  | 'At Terminal'
  | 'Cleared'
  | 'Compliance Pending'
  | 'In Transit'
  | 'Delivered'
  | 'Refund Pending'
  | 'Invoicing'
  | 'Closed';

export type RiskLevel = 'Low' | 'Medium' | 'High';

export type ShipmentDetailType = 'IMPORT' | 'EXPORT';

export interface ShipmentDetail {
  id: number;
  shipmentNo: string;
  clientName: string;
  logisticType: 'Import' | 'Export';
  type?: ShipmentDetailType;
  shipmentMode: 'Sea' | 'Air' | 'Road';
  status: ShipmentStatus;
  eta: string | null;
  dutyPaidStatus: 'Paid' | 'Unpaid' | 'Partial';
  containerCount: number;
  riskLevel: RiskLevel;
  orderReference: string;
  productType: string;
  containerInfo: string;
  allocationDate: string;
  shipmentType: string;
  currentStep: number;
  etdIndia: string | null;
  etaNigeria: string | null;
  actualDeparture: string | null;
  actualArrival: string | null;
  vesselName: string;
  shippingLine: string;
  trackingNumber: string;
  freightCost: number;
  clearingCost: number;
  dutyPaid: number;
  refunds: number;
  totalLandedCost: number;
  paymentMode: string | null;
  formMApprovedDate: string | null;
  originDetails: OriginDetailsModel | null;
  preArrival: PreArrivalModel | null;
  terminalShipping: TerminalShippingModel | null;
  customsRegulatory: CustomsRegulatoryModel | null;
  transportDelivery: TransportDeliveryModel | null;
  performanceControlStages?: import('../../../../core/models/performance-control-matrix.model').PerformanceControlStage[] | null;
  bankClosure?: import('../components/bank-closure/bank-closure.component').BankClosureModel | null;
}

export type { TerminalShippingModel };
export type { CustomsRegulatoryModel };
export type { TransportDeliveryModel };

export interface ShipmentDocument {
  id: string;
  documentName: string;
  uploadedBy: string;
  date: string;
  type: string;
  url?: string;
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  description: string;
  performedBy: string;
  timestamp: string;
  eventType: 'duty_assessed' | 'payment_done' | 'container_delivered' | 'file_closed' | 'status_change' | 'other';
}

export interface Attachment {
  id: string;
  fileName: string;
  type: string;
  uploadedBy: string;
  date: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  date: string;
  remarks: string;
}

export interface StatusStep {
  label: string;
  stepNumber: number;
}
