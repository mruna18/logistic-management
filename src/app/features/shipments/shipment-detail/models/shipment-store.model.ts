import type { OriginDetailsModel } from '../../../import-orders/origin-details/origin-details.component';
import type { PreArrivalModel } from '../../../import-orders/pre-arrival/pre-arrival.component';
import type { TerminalShippingModel } from '../components/terminal-shipping/terminal-shipping.component';
import type { CustomsRegulatoryModel } from '../components/customs-regulatory/customs-regulatory.component';
import type { TransportDeliveryModel, ContainerModel } from '../components/transport-delivery/transport-delivery.component';
import type { TeamDocumentationData } from '../../team-documentation/models/team-documentation.model';
import type { PerformanceControlStage } from '../../../../core/models/performance-control-matrix.model';
import type { BankClosureModel } from '../components/bank-closure/bank-closure.component';
import type { ExportShipmentModel } from '../export/models/export-shipment.model';

export enum ShipmentStatus {
  DRAFT = 'DRAFT',
  IN_TRANSIT = 'IN_TRANSIT',
  ARRIVED = 'ARRIVED',
  UNDER_CLEARANCE = 'UNDER_CLEARANCE',
  DELIVERING = 'DELIVERING',
  COMPLETED = 'COMPLETED',
  READY_FOR_INVOICE = 'READY_FOR_INVOICE',
  CLOSED = 'CLOSED',
  ON_HOLD = 'ON_HOLD',
}

export type ShipmentSection =
  | 'origin'
  | 'preArrival'
  | 'terminal'
  | 'customs'
  | 'transport'
  | 'teamDocumentation'
  | 'performanceControl'
  | 'bankClosure';

export type ShipmentType = 'IMPORT' | 'EXPORT';

export interface Shipment {
  id: number;
  shipmentNo: string;
  clientName: string;
  logisticType: 'Import' | 'Export';
  shipmentMode: 'Sea' | 'Air' | 'Road';
  status: ShipmentStatus;
  eta: string | null;
  dutyPaidStatus: 'Paid' | 'Unpaid' | 'Partial';
  containerCount: number;
  riskLevel: 'Low' | 'Medium' | 'High';
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
  teamDocumentation: TeamDocumentationData | null;
  performanceControlStages: PerformanceControlStage[] | null;
  bankClosure: BankClosureModel | null;
  type?: ShipmentType;
  exportData?: ExportShipmentModel | null;
}

function createEmptyShipment(id: number): Shipment {
  return {
    id,
    shipmentNo: `SHP-${String(id).padStart(6, '0')}`,
    clientName: 'Acme Industries Ltd',
    logisticType: 'Import',
    shipmentMode: 'Sea',
    status: ShipmentStatus.DRAFT,
    eta: null,
    dutyPaidStatus: 'Unpaid',
    containerCount: 0,
    riskLevel: 'Medium',
    orderReference: `NG-IMP-2026-${String(id).padStart(3, '0')}`,
    productType: 'Chemical',
    containerInfo: '',
    allocationDate: '',
    shipmentType: 'FCL (Full Container Load)',
    currentStep: 0,
    etdIndia: null,
    etaNigeria: null,
    actualDeparture: null,
    actualArrival: null,
    vesselName: '',
    shippingLine: '',
    trackingNumber: '',
    freightCost: 0,
    clearingCost: 0,
    dutyPaid: 0,
    refunds: 0,
    totalLandedCost: 0,
    paymentMode: null,
    formMApprovedDate: null,
    originDetails: null,
    preArrival: null,
    terminalShipping: null,
    customsRegulatory: null,
    transportDelivery: null,
    teamDocumentation: null,
    performanceControlStages: null,
    bankClosure: null,
    type: 'IMPORT',
    exportData: null,
  };
}

export { createEmptyShipment };
