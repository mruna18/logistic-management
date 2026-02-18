export enum FormMStatus {
  DRAFT = 'DRAFT',
  APPLIED_TO_BANK = 'APPLIED_TO_BANK',
  BANK_REVIEWED = 'BANK_REVIEWED',
  SUBMITTED_TO_NCS = 'SUBMITTED_TO_NCS',
  NCS_APPROVED = 'NCS_APPROVED',
  REJECTED = 'REJECTED',
}

export const FORM_M_STATUS_LABELS: Record<FormMStatus, string> = {
  [FormMStatus.DRAFT]: 'Draft',
  [FormMStatus.APPLIED_TO_BANK]: 'Applied to Bank',
  [FormMStatus.BANK_REVIEWED]: 'Bank Reviewed',
  [FormMStatus.SUBMITTED_TO_NCS]: 'Submitted to NCS',
  [FormMStatus.NCS_APPROVED]: 'NCS Approved',
  [FormMStatus.REJECTED]: 'Rejected',
};
