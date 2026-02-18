export enum ApprovalType {
  DUTY_DRAFT = 'DUTY_DRAFT',
  REFUND = 'REFUND',
  DEMURRAGE = 'DEMURRAGE',
  FILE_CLOSE = 'FILE_CLOSE',
}

export const APPROVAL_TYPE_LABELS: Record<ApprovalType, string> = {
  [ApprovalType.DUTY_DRAFT]: 'Duty Draft Approval',
  [ApprovalType.REFUND]: 'Refund Approval',
  [ApprovalType.DEMURRAGE]: 'Demurrage Approval',
  [ApprovalType.FILE_CLOSE]: 'File Close Approval',
};
