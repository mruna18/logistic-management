/** Controlled state machine for file lifecycle */
export enum FileStatus {
  DRAFT = 'Draft',
  PENDING_APPROVAL = 'Pending Approval',
  APPROVED = 'Approved',
  IN_OPERATION = 'In Operation',
  DELIVERED = 'Delivered',
  POST_CLEARING = 'Post Clearing',
  CLOSED = 'Closed',
  /** Legacy / edge case */
  CANCELLED = 'Cancelled',
}

export enum ApprovalMode {
  APPROVED_QUOTE = 'Approved Quote',
  PURCHASE_ORDER = 'Purchase Order',
  ADVANCE_PAYMENT = 'Advance Payment'
}

export enum ShipmentMode {
  SEA = 'Sea',
  AIR = 'Air',
  ROAD = 'Road'
}

export enum ShipmentType {
  FCL = 'FCL (Full Container Load)',
  LCL = 'LCL (Less than Container Load)',
  BREAK_BULK = 'Break Bulk',
  CONSOLIDATION = 'Consolidation',
  AIR_FREIGHT = 'Air Freight'
}

export enum JobType {
  IMPORT = 'Import',
  EXPORT = 'Export'
}

export enum JobScope {
  END_TO_END = 'End to End',
  CLEARING = 'Clearing',
  TRUCKING = 'Trucking',
  DOCUMENTATION = 'Documentation',
  PROJECT = 'Project',
  BARGING = 'Barging',
  FOREX = 'Forex',
  VMI = 'VMI'
}

export enum DocumentParty {
  CLIENT = 'Client',
  AGENT = 'Agent'
}

export enum FormMType {
  VALID_FOR_FOREX = 'Valid for Forex',
  NOT_VALID_FOR_FOREX = 'Not Valid for Forex'
}

export enum PaymentMode {
  LETTER_OF_CREDIT = 'Letter of Credit',
  BILLS_FOR_COLLECTION = 'Bills for Collection',
  DIRECT_TRANSFER = 'Direct Transfer',
  OTHER = 'Other'
}


