import { ContainerType, Status } from '../enums/status.enum';

export interface Container {
  id: string;
  containerNo: string;
  type: ContainerType;
  sealNo: string;
  arrivalDate: Date;
  freeDays: number;
  gateOutDate?: Date;
  emptyReturn?: Date;
  demurrage: number;
  status: Status;
  shipmentId: string;
}

