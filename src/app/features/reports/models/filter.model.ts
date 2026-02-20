export interface FilterOption {
  value: string;
  label: string;
}

export const REPORT_CATEGORIES = [
  { value: 'import', label: 'Import' },
  { value: 'export', label: 'Export' },
  { value: 'finance', label: 'Finance' },
  { value: 'operations', label: 'Operations' },
  { value: 'management', label: 'Management' },
] as const;

export const SHIPMENT_TYPES = [
  { value: 'all', label: 'All' },
  { value: 'import', label: 'Import' },
  { value: 'export', label: 'Export' },
] as const;

export const STATUS_OPTIONS = [
  'Pending', 'In Progress', 'Completed', 'Delayed', 'At Port',
  'Under Clearance', 'In Delivery', 'Delivered', 'Sailed',
] as const;
