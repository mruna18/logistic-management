import {
  FileStatus,
  ApprovalMode,
  ShipmentMode,
  JobType,
  JobScope,
  DocumentParty,
  FormMType,
  PaymentMode
} from '../enums/import-process.enum';

/**
 * Window 1 - Creation of Order (Commercial & Shipment data)
 */
export interface ImportOrderHeader {
  id: string;
  /** Auto-generated unique order number composed from client, type, date, etc. */
  orderReference: string;

  clientName: string;
  fileStatus: FileStatus;
  fileStatusDate?: Date;

  approvalMode: ApprovalMode;
  approvalDate?: Date;

  pfiNumber: string;
  supplierName: string;
  buyerName: string;

  numberOfContainers: number;
  containerType: string;

  productDescription: string;
  hsCode: string;
  quantity: number;

  exWorksValue: number;
  fobValue: number;
  freightValue: number;

  /** C&F = Ex-works + FOB + Freight */
  cnfValue: number;

  /** Marine Insurance calculated on C&F value */
  marineInsuranceValue: number;

  /** Total CIF = C&F + Insurance */
  totalCifValue: number;

  shipmentMode: ShipmentMode;
  jobType: JobType;

  /** Multiple scopes can be selected for a single file */
  jobScopes: JobScope[];

  additionalDetails?: string;
}

/**
 * Window 2 - Team & Documentation
 */
export interface ImportOrderTeamAndDocs {
  // Team
  salesOwner?: string;
  customerServiceOwner?: string;
  clearingAgent?: string;
  fileClosedForInvoicingDate?: Date;

  // Initial documentation matrix
  msds: DocumentRequirement;
  coa: DocumentRequirement;
  cria: DocumentRequirement;
  nafdacPermit: DocumentRequirement;
  soncapPermit: DocumentRequirement;
  nercPermit: DocumentRequirement;
  quarantinePermit: DocumentRequirement;
  marineInsurance: DocumentRequirement;

  documentationVettingDone: boolean;
  documentationVettingDate?: Date;
  documentationVettingCheckedBy?: string;

  formMBank?: string;
  formMType?: FormMType;
  paymentMode?: PaymentMode;

  formMAppliedDate?: Date;
  formMApprovedDate?: Date;
  formMNumber?: string;
  baNumber?: string;

  formMSpecialRemarks?: string;
}

export interface DocumentRequirement {
  required: boolean;
  processedDate?: Date;
  receivedDate?: Date;
  processedBy?: DocumentParty;
}


