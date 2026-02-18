/**
 * Performance Control Matrix - per document Section 4
 * Each shipment records: Stage | Planned Date | Actual Date | Delay (Days) | Responsible Party | Remarks
 */
export type TimelineStageId =
  | 'formM_application'
  | 'formM_approval'
  | 'production_shipment'
  | 'paar_application'
  | 'duty_payment'
  | 'vessel_arrival'
  | 'inspection'
  | 'customs_release'
  | 'tdo_issued'
  | 'transport_assigned'
  | 'container_gate_out'
  | 'warehouse_delivery'
  | 'empty_return'
  | 'bank_closure';

export type ResponsibleParty = 'Importer' | 'ADB' | 'Exporter' | 'Clearing Agent' | 'Shipping Line' | 'Transporter' | 'Terminal' | 'Customs';

export interface PerformanceControlStage {
  id: TimelineStageId;
  stageName: string;
  phaseNumber: 1 | 2 | 3 | 4 | 5 | 6;
  plannedDate: string | null;
  actualDate: string | null;
  delayDays: number | null;
  responsibleParty: ResponsibleParty | null;
  remarks: string;
}

export const TIMELINE_STAGES: Omit<PerformanceControlStage, 'plannedDate' | 'actualDate' | 'delayDays' | 'responsibleParty' | 'remarks'>[] = [
  { id: 'formM_application', stageName: 'Form M Application', phaseNumber: 1 },
  { id: 'formM_approval', stageName: 'Form M Approval', phaseNumber: 1 },
  { id: 'production_shipment', stageName: 'Production & Shipment', phaseNumber: 2 },
  { id: 'paar_application', stageName: 'PAAR Application', phaseNumber: 3 },
  { id: 'duty_payment', stageName: 'Duty Payment', phaseNumber: 3 },
  { id: 'vessel_arrival', stageName: 'Vessel Arrival', phaseNumber: 4 },
  { id: 'inspection', stageName: 'Inspection Process', phaseNumber: 4 },
  { id: 'customs_release', stageName: 'Customs Release', phaseNumber: 4 },
  { id: 'tdo_issued', stageName: 'TDO Issued', phaseNumber: 4 },
  { id: 'transport_assigned', stageName: 'Transport Assigned', phaseNumber: 5 },
  { id: 'container_gate_out', stageName: 'Container Gate Out', phaseNumber: 5 },
  { id: 'warehouse_delivery', stageName: 'Warehouse Delivery', phaseNumber: 5 },
  { id: 'empty_return', stageName: 'Empty Container Return', phaseNumber: 5 },
  { id: 'bank_closure', stageName: 'Bank Closure', phaseNumber: 6 },
];

export function createEmptyPerformanceStages(): PerformanceControlStage[] {
  return TIMELINE_STAGES.map(s => ({
    ...s,
    plannedDate: null,
    actualDate: null,
    delayDays: null,
    responsibleParty: null,
    remarks: '',
  }));
}

export function calculateDelayDays(plannedDate: string | null, actualDate: string | null): number | null {
  if (!plannedDate || !actualDate) return null;
  const planned = new Date(plannedDate).getTime();
  const actual = new Date(actualDate).getTime();
  return Math.round((actual - planned) / (1000 * 60 * 60 * 24));
}
