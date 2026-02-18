import type { ApprovalType } from '../enums/approval-type.enum';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Approval {
  id: number;
  shipmentId: number;
  type: ApprovalType;
  status: ApprovalStatus;
  requestedBy: number;
  requestedAt: string;
  approvedBy: number | null;
  approvedAt: string | null;
  rejectedBy: number | null;
  rejectedAt: string | null;
  remarks: string | null;
  metadata: Record<string, unknown>;
}

export interface ApprovalRequest {
  shipmentId: number;
  type: ApprovalType;
  metadata?: Record<string, unknown>;
}
