/** Report category for grouping */
export type ReportCategory = 'import' | 'export' | 'finance' | 'operations' | 'management';

/** Report definition metadata */
export interface ReportDefinition {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  icon: string;
  /** Column definitions for table view */
  columns: ReportColumn[];
  /** Whether this report supports chart view */
  supportsChart: boolean;
  /** Chart type: bar, line, doughnut, pie */
  chartType?: 'bar' | 'line' | 'doughnut' | 'pie';
  /** Field to use for chart labels */
  chartLabelField?: string;
  /** Field to use for chart values */
  chartValueField?: string;
  /** Role required to view (empty = all) */
  requiredRole?: string;
}

export interface ReportColumn {
  field: string;
  header: string;
  type: 'string' | 'number' | 'currency' | 'date' | 'badge';
  sortable?: boolean;
  /** Highlight row in red when condition met */
  riskCondition?: (row: Record<string, unknown>) => boolean;
  /** Group by this column */
  groupable?: boolean;
  width?: string;
}

/** Dynamic filter state */
export interface ReportFilterState {
  dateFrom: Date | null;
  dateTo: Date | null;
  clients: string[];
  shipmentType: 'all' | 'import' | 'export';
  statuses: string[];
  terminals: string[];
  shippingLines: string[];
  clearingAgents: string[];
  containerTypes: string[];
}

/** Saved report template */
export interface ReportTemplate {
  id: string;
  name: string;
  reportId: string;
  filters: ReportFilterState;
  columns: string[];
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  createdAt: Date;
}

/** Pagination state */
export interface PaginationState {
  page: number;
  pageSize: number;
  totalRows: number;
}

/** Row types for report data */
export interface OrderSummaryRow {
  status: string;
  import: number;
  export: number;
  total: number;
}

export interface ShipmentStatusRow {
  stage: string;
  count: number;
  percentage: number;
}

export interface FinancialSummaryRow {
  category: string;
  amount: number;
  count?: number;
}

export interface ClearancePerformanceRow {
  phase: string;
  avgDays: number;
  files: number;
  trend: string;
}

export interface ClientActivityRow {
  client: string;
  activeFiles: number;
  completedThisMonth: number;
  avgClearanceDays: number;
}
