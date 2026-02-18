export enum OrderPhase {
  DRAFT = 'DRAFT',
  FORM_M_APPROVED = 'FORM_M_APPROVED',
  PRODUCTION = 'PRODUCTION',
  READY_TO_SHIP = 'READY_TO_SHIP',
}

export const ORDER_PHASE_LABELS: Record<OrderPhase, string> = {
  [OrderPhase.DRAFT]: 'Draft',
  [OrderPhase.FORM_M_APPROVED]: 'Form M Approved',
  [OrderPhase.PRODUCTION]: 'Production',
  [OrderPhase.READY_TO_SHIP]: 'Ready to Ship',
};

export const ORDER_PHASE_STEPS: { label: string; stepNumber: number }[] = [
  { label: 'Draft', stepNumber: 1 },
  { label: 'Form M Approved', stepNumber: 2 },
  { label: 'Production', stepNumber: 3 },
  { label: 'Ready to Ship', stepNumber: 4 },
];
