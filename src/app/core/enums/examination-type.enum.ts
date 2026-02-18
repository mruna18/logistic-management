export enum ExaminationType {
  FAST_TRACK = 'FAST_TRACK',
  SCANNING = 'SCANNING',
  EXAMINATION = 'EXAMINATION',
  AEO = 'AEO',
}

export const EXAMINATION_TYPE_LABELS: Record<ExaminationType, string> = {
  [ExaminationType.FAST_TRACK]: 'Fast Track',
  [ExaminationType.SCANNING]: 'Scanning',
  [ExaminationType.EXAMINATION]: 'Examination',
  [ExaminationType.AEO]: 'AEO (Authorised Economic Operator)',
};
