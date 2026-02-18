export interface User {
  id: string;
  name: string;
  role: 'Sales' | 'Customer Service' | 'Agent';
}

export interface Bank {
  id: string;
  name: string;
}

export interface DocumentType {
  id: string;
  name: string;
}

export interface TeamAssignment {
  salesPersonId: string;
  customerServiceId: string;
  clearingAgentId: string;
}

export interface FileClosure {
  fecdUpdated: boolean;
  eirDate: string | null;
  waybillDate: string | null;
  terminalRefundDate: string | null;
  shippingRefundDate: string | null;
  fileClosedDate: string | null;
}

export type DocumentStatus = 'Pending' | 'Submitted' | 'Approved' | 'Rejected';

export interface ShipmentDocument {
  documentName: string;
  required: boolean;
  dateProcessed: string | null;
  dateReceived: string | null;
  processedBy: 'Client' | 'Agent';
  status: DocumentStatus;
}

export interface FormMDetails {
  bankId: string;
  type: 'Valid for Forex' | 'Not Valid for Forex';
  paymentMode: 'LC' | 'Bills for Collection' | 'Direct Transfer' | 'Other' | null;
  appliedDate: string | null;
  approvedDate: string | null;
  formMNumber: string;
  /** HS Code on Form M – used for mismatch checks vs Order/PAAR */
  hsCode?: string;
  baNumber: string;
  specialRemarks: string;
}

export interface TeamDocumentationData {
  teamAssignment: TeamAssignment;
  fileClosure: FileClosure;
  documents: ShipmentDocument[];
  formMDetails: FormMDetails;
}
