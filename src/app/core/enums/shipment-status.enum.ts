export enum ShipmentStatusEnum {
  DRAFT = 'DRAFT',
  ORIGIN_IN_PROGRESS = 'ORIGIN_IN_PROGRESS',
  IN_TRANSIT = 'IN_TRANSIT',
  PRE_ARRIVAL_PROCESSING = 'PRE_ARRIVAL_PROCESSING',
  ARRIVED_AT_PORT = 'ARRIVED_AT_PORT',
  UNDER_CLEARANCE = 'UNDER_CLEARANCE',
  DELIVERING = 'DELIVERING',
  PORT_CYCLE_COMPLETED = 'PORT_CYCLE_COMPLETED',
  READY_FOR_INVOICE = 'READY_FOR_INVOICE',
  INVOICED = 'INVOICED',
  CLOSED = 'CLOSED',
  ON_HOLD = 'ON_HOLD',
}

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatusEnum, string> = {
  [ShipmentStatusEnum.DRAFT]: 'Draft',
  [ShipmentStatusEnum.ORIGIN_IN_PROGRESS]: 'Origin In Progress',
  [ShipmentStatusEnum.IN_TRANSIT]: 'In Transit',
  [ShipmentStatusEnum.PRE_ARRIVAL_PROCESSING]: 'Pre-Arrival Processing',
  [ShipmentStatusEnum.ARRIVED_AT_PORT]: 'Arrived at Port',
  [ShipmentStatusEnum.UNDER_CLEARANCE]: 'Under Clearance',
  [ShipmentStatusEnum.DELIVERING]: 'Delivering',
  [ShipmentStatusEnum.PORT_CYCLE_COMPLETED]: 'Port Cycle Completed',
  [ShipmentStatusEnum.READY_FOR_INVOICE]: 'Ready for Invoice',
  [ShipmentStatusEnum.INVOICED]: 'Invoiced',
  [ShipmentStatusEnum.CLOSED]: 'Closed',
  [ShipmentStatusEnum.ON_HOLD]: 'On Hold',
};
