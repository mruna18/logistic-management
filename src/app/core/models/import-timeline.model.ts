export interface ImportTimelineStep {
  id: string;
  stepName: string;
  stepOrder: number;
  plannedDate: string | null;
  actualDate: string | null;
  remarks: string;
  slaHours: number | null;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
}

export interface FormMWorkflow {
  formMNumber: string;
  formMAppliedDate: string | null;
  bankSubmittedDate: string | null;
  bankApprovedDate: string | null;
  ncsSubmittedDate: string | null;
  ncsApprovedDate: string | null;
  status: string;
}

export interface PreShipmentDocs {
  pfiNumber: string;
  pfiDate: string | null;
  soncapNumber: string | null;
  soncapDate: string | null;
  nafdacNumber: string | null;
  nafdacDate: string | null;
  insuranceCertificateDate: string | null;
}
