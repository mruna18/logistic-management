import type { ShipmentDetail } from './shipment-detail.model';

export const SHIPMENT_STATES = [
  'Draft',
  'Origin',
  'PreArrival',
  'AwaitingPayment',
  'Terminal',
  'Customs',
  'Compliance',
  'Transport',
  'Delivered',
  'RefundPending',
  'Invoicing',
  'Closed',
] as const;

export type ShipmentState = (typeof SHIPMENT_STATES)[number];

export type OperationalWindow =
  | 'Setup'
  | 'Origin'
  | 'PreArrival'
  | 'Terminal'
  | 'Customs'
  | 'Transport'
  | 'Invoicing';

export const WINDOW_ORDER: OperationalWindow[] = [
  'Setup',
  'Origin',
  'PreArrival',
  'Terminal',
  'Customs',
  'Transport',
  'Invoicing',
];

export interface StateTransitionGuard {
  canTransition: boolean;
  reason?: string;
}

export interface ShipmentStateContext {
  state: ShipmentState;
  canEditWindow: (window: OperationalWindow) => boolean;
  isWindowLocked: (window: OperationalWindow) => boolean;
  nextRequiredWindow: OperationalWindow | null;
  fecdComplete: boolean;
  refundTracked: boolean;
  complianceComplete: boolean;
}
