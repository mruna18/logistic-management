import { ProductType, LogisticType, MovementType, ServiceScope, ClearingType, Status } from '../enums/status.enum';
import { JobType } from '../enums/import-process.enum';

export interface ImportOrder {
  id: string;
  orderReference: string;
  /** Import or Export */
  jobType?: JobType;
  /** Client / Buyer name */
  buyerName?: string;
  /** Supplier name */
  supplierName?: string;
  /** File status: Quoted, Approved, Cancelled, etc. */
  fileStatus?: string;
  /** PFI number */
  pfiNumber?: string;
  /** Container type: 20ft, 40ft, Reefer, etc. */
  containerType?: string;
  /** Product description */
  productDescription?: string;
  productType: ProductType;
  logisticType: LogisticType;
  movementType: MovementType;
  serviceScope: ServiceScope;
  containerCount: number;
  containerDescription: string;
  clearingType: ClearingType;
  /** Mode of shipment: Sea, Air, Road */
  shipmentMode?: string;
  allocationDate: Date;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
  /** Export-specific data (when jobType = Export) */
  exportData?: unknown;
}

