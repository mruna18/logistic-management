export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  type?: 'text' | 'date' | 'number' | 'status' | 'link' | 'jobType';
  width?: string;
  linkPath?: string;
  linkIdField?: string;
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc' | null;
}

export interface FilterState {
  [key: string]: string;
}

