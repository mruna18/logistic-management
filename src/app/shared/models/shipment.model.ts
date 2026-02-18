import { Status, ProductType, ServiceScope } from '../enums/status.enum';
import { Container } from './container.model';

export interface Shipment {
  id: string;
  orderReference: string;
  shipmentReference: string;
  productType: ProductType;
  serviceScope: ServiceScope;
  status: Status;
  origin: Origin;
  transit: Transit;
  clearance: Clearance;
  containers: Container[];
  delivery: Delivery;
  finance: Finance;
  documents: Document[];
  history: HistoryItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Origin {
  port: string;
  country: string;
  etd: Date;
  actualDeparture?: Date;
}

export interface Transit {
  vessel: string;
  voyage: string;
  estimatedArrival: Date;
  actualArrival?: Date;
  currentLocation?: string;
}

export interface Clearance {
  paarNumber?: string;
  dutyAmount?: number;
  dutyPaid?: boolean;
  dutyPaymentDate?: Date;
  customsRelease?: boolean;
  customsReleaseDate?: Date;
  terminalRelease?: boolean;
  terminalReleaseDate?: Date;
}

export interface Delivery {
  deliveryAddress: string;
  deliveryDate?: Date;
  delivered: boolean;
  deliveryNotes?: string;
}

export interface Finance {
  totalCost: number;
  payments: Payment[];
}

export interface Payment {
  id: string;
  type: string;
  amount: number;
  date: Date;
  reference: string;
  shipmentId: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: Date;
  url?: string;
}

export interface HistoryItem {
  id: string;
  action: string;
  description: string;
  timestamp: Date;
  user: string;
}

