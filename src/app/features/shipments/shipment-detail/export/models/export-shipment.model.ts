/**
 * Export Shipment Models - Backend-ready structure
 * All 6 windows per Export Process Flow Clearing Agent spec
 */

export type ExportFileStatus = 'Quoted' | 'Approved' | 'Cancelled';
export type ExportApprovalMode = 'Approved Quote' | 'PO' | 'Advance Payment';
export type ExportShipmentMode = 'Sea' | 'Air' | 'Road';
export type ExportJobType = 'Import' | 'Export';
export type DocumentProcessedBy = 'Client' | 'Agent';
export type FreightPaidBy = 'Client' | 'Agent';

/** Window 1 — Order Creation (Commercial) */
export interface ExportOrderCommercialModel {
  orderNo: string;
  fileStatus: ExportFileStatus;
  fileStatusDate: string | null;
  approvalMode: ExportApprovalMode;
  approvalDate: string | null;
  pfiNumber: string;
  pfiDate: string | null;
  supplierName: string;
  buyerName: string;
  containerCount: number;
  containerType: string;
  productDescription: string;
  hsCode: string;
  quantity: number;
  value: number;
  exWorks: number;
  fob: number;
  freight: number;
  cnf: number;
  marineInsurance: number;
  totalCif: number;
  shipmentMode: ExportShipmentMode;
  jobType: ExportJobType;
  scope: string[];
  additionalFileDetails: string;
}

/** Window 2 — Planning doc row */
export interface ExportPlanningDocRow {
  required: boolean;
  dateProcessed: string | null;
  dateReceived: string | null;
  processedBy: DocumentProcessedBy;
}

export interface ExportTeamDocumentationModel {
  salesOwner: string;
  customerServiceOwner: string;
  clearingAgent: string;
  fileCloseSubmittedForInvoicingDate: string | null;
  nxpRequired: boolean;
  nxpDateProcessed: string | null;
  nxpDateReceived: string | null;
  nxpProcessedBy: DocumentProcessedBy;
  nxpNo: string | null;
  bookingRequired: boolean;
  bookingDateProcessed: string | null;
  bookingDateReceived: string | null;
  bookingProcessedBy: DocumentProcessedBy;
  bookingNo: string | null;
  shippingLineName: string;
  equipmentReleaseRequired: boolean;
  equipmentReleaseDateProcessed: string | null;
  equipmentReleaseDateReceived: string | null;
  equipmentReleaseProcessedBy: DocumentProcessedBy;
  emptyPickupYard: string | null;
  inspectionAgencyName: string;
  inspectionAgencyRequired: boolean;
  inspectionAgencyDateProcessed: string | null;
  inspectionAgencyDateReceived: string | null;
  inspectionAgencyProcessedBy: DocumentProcessedBy;
  federalProduceRequired: boolean;
  federalProduceDateProcessed: string | null;
  federalProduceDateReceived: string | null;
  federalProduceProcessedBy: DocumentProcessedBy;
  quarantineRequired: boolean;
  quarantineDateProcessed: string | null;
  quarantineDateReceived: string | null;
  quarantineProcessedBy: DocumentProcessedBy;
}

/** Window 3 — Container level */
export interface ExportContainerModel {
  containerNumber: string;
  transporterNames: string[];
  allocationDate: string | null;
  stuffingLocationAddress: string;
  allocationToTransporterDateTime: string | null;
  mode: 'Empty from Yard' | 'Triangulation';
  truckGatedInEmptyYardDateTime: string | null;
  emptyLoadedInTerminalDateTime: string | null;
  emptyGatedOutOfTerminalDateTime: string | null;
  emptyArrivedAtDeliveryLocationDateTime: string | null;
  stuffingStartedDateTime: string | null;
  stuffingCompleteDateTime: string | null;
  signedWaybillReceivedDateTime: string | null;
  stuffedGateOutFromWarehouseDateTime: string | null;
  stuffedGatedInPolLocation: string;
  stuffedGatedInPolDateTime: string | null;
  eirReceivedDateTime: string | null;
  waybillEirSubmittedToInvoicingDateTime: string | null;
  demurrageCharged: boolean;
  demurrageDays: number | null;
  demurrageReason: string;
  debitToTransporter: boolean;
  debitToTransporterReasons: string;
}

/** Window 3 — Transport & Stuffing */
export interface ExportTransportStuffingModel {
  stuffingProjected: string | null;
  shippingLine: string;
  containerType: string;
  stuffingAddress: string;
  transportersAllocated: string[];
  firstEmptyLoadedOut: string | null;
  lastEmptyLoadedOut: string | null;
  firstEmptyDeliveredToClient: string | null;
  lastEmptyDeliveredToClient: string | null;
  firstEmptyStuffedAtClient: string | null;
  lastEmptyStuffedAtClient: string | null;
  firstStuffedDepartedFromClient: string | null;
  lastStuffedDepartedFromClient: string | null;
  firstStuffedGatedInPol: string | null;
  lastStuffedGatedInPol: string | null;
  completeWaybillsReceived: string | null;
  completeEirReceived: string | null;
  indemnityApplicable: boolean;
  indemnityReceivedDate: string | null;
  docsSubmittedToInvoicingDate: string | null;
  containers: ExportContainerModel[];
}

/** Window 4 — Inspections & Customs */
export interface ExportInspectionsCustomsModel {
  vgmIssuedDate: string | null;
  vgmSubmittedToShippingLineDate: string | null;
  packingListInvoiceReceivedDate: string | null;
  packingListInvoiceUploadedDate: string | null;
  cciProcessedDateTime: string | null;
  cciReceivedDateTime: string | null;
  nessDnReceivedDate: string | null;
  nessDnProcessedBy: DocumentProcessedBy | '';
  nessDnPaidDate: string | null;
  nessPaymentReceiptUploadedDate: string | null;
  applicationForInspectionByCustomsDateTime: string | null;
  dtiPrepareSgdDateTime: string | null;
  examinationWithCustomsAgencyDateTime: string | null;
  releaseByCustomsAgencyDateTime: string | null;
  exportReleaseDocsToShippingLineDateTime: string | null;
  shippingInstructionToShippingLineDateTime: string | null;
  remarks: string;
}

/** Window 5 — Terminal & Shipping */
export interface ExportTerminalShippingModel {
  terminalName: string;
  terminalDnReceived: string | null;
  terminalDnPaid: string | null;
  terminalValidTill: string | null;
  additionalTerminalDnReceived: string | null;
  additionalTerminalDnPaid: string | null;
  additionalTerminalValidTill: string | null;
  lastContainerGatedIn: string | null;
  shippingLine: string;
  vesselName: string;
  etd: string | null;
  atd: string | null;
  shippingFreightPaidBy: FreightPaidBy | '';
  shippingFreightDnReceived: string | null;
  shippingFreightDnPaid: string | null;
  shippingLineLocalDnReceived: string | null;
  shippingLineLocalDnPaid: string | null;
  shippingLineLocalDnValidTill: string | null;
  vesselPlanningSubmitted: string | null;
  additionalShippingDnReceived: string | null;
  additionalShippingDnPaid: string | null;
  additionalShippingValidTill: string | null;
  draftOblReceivedDateTime: string | null;
  draftOblSentToClientDateTime: string | null;
  draftOblApprovedByClientDateTime: string | null;
  oblCollectionDateTime: string | null;
  oblSubmittedToInvoicingDateTime: string | null;
}

/** Window 6 — Third Party Documents */
export interface ExportDocumentsClosingModel {
  fumigationCertificateCollectedDateTime: string | null;
  phytosanitaryCertificateCollectedDateTime: string | null;
  customsFinalClosingDocsCollectedDateTime: string | null;
  inspectionActDateTime: string | null;
  stampedSgdDateTime: string | null;
  stampedNxpDateTime: string | null;
  allCompleteDocsSubmittedToInvoicingDateTime: string | null;
}

/** Unified Export Shipment Data */
export interface ExportShipmentModel {
  orderCommercial: ExportOrderCommercialModel | null;
  teamDocumentation: ExportTeamDocumentationModel | null;
  transportStuffing: ExportTransportStuffingModel | null;
  inspectionsCustoms: ExportInspectionsCustomsModel | null;
  terminalShipping: ExportTerminalShippingModel | null;
  documentsClosing: ExportDocumentsClosingModel | null;
}
