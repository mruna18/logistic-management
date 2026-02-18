import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { TableColumn, SortState, FilterState } from '../../models/table-column.model';
import { Status } from '../../enums/status.enum';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css'
})
export class DataTableComponent implements OnInit, OnChanges {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];
  @Input() totalRecords?: number;
  @Input() rowLinkPath = '';
  @Input() rowIdField = 'id';

  filteredData: any[] = [];
  displayedData: any[] = [];
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  // Search
  searchTerm: string = '';
  private searchSubject = new Subject<string>();

  // Sorting
  sortState: SortState = { field: '', direction: null };

  // Filtering
  filterForm!: FormGroup;
  filterStates: FilterState = {};
  activeFilters: { [key: string]: boolean } = {};

  constructor(private fb: FormBuilder, private router: Router) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.applyFilters();
    });
  }

  ngOnInit() {
    this.initializeFilterForm();
    this.applyFilters();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] || changes['columns']) {
      this.initializeFilterForm();
      this.applyFilters();
    }
  }

  initializeFilterForm() {
    const formControls: { [key: string]: FormControl } = {};
    this.columns.forEach(col => {
      if (col.filterable) {
        formControls[col.field] = this.fb.control('');
      }
    });
    this.filterForm = this.fb.group(formControls);
    
    this.filterForm.valueChanges.subscribe(() => {
      this.updateFilterStates();
      this.applyFilters();
    });
  }

  updateFilterStates() {
    this.columns.forEach(col => {
      if (col.filterable) {
        const value = this.filterForm.get(col.field)?.value || '';
        this.filterStates[col.field] = value;
        this.activeFilters[col.field] = !!value;
      }
    });
  }

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  applyFilters() {
    let result = [...this.data];

    // Apply global search
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      result = result.filter(item => {
        return this.columns.some(col => {
          const value = this.getFieldValue(item, col.field);
          return value && value.toString().toLowerCase().includes(searchLower);
        });
      });
    }

    // Apply column filters
    this.columns.forEach(col => {
      if (col.filterable && this.filterStates[col.field]) {
        const filterValue = this.filterStates[col.field].toLowerCase();
        result = result.filter(item => {
          const value = this.getFieldValue(item, col.field);
          return value && value.toString().toLowerCase().includes(filterValue);
        });
      }
    });

    // Apply sorting
    if (this.sortState.field && this.sortState.direction) {
      result = this.sortData(result, this.sortState.field, this.sortState.direction);
    }

    this.filteredData = result;
    this.totalPages = Math.ceil(result.length / this.pageSize);
    this.updateDisplayedData();
  }

  sortData(data: any[], field: string, direction: 'asc' | 'desc'): any[] {
    return [...data].sort((a, b) => {
      const aValue = this.getFieldValue(a, field);
      const bValue = this.getFieldValue(b, field);
      
      const column = this.columns.find(col => col.field === field);
      
      if (column?.type === 'number') {
        return direction === 'asc' 
          ? (Number(aValue) || 0) - (Number(bValue) || 0)
          : (Number(bValue) || 0) - (Number(aValue) || 0);
      }
      
      if (column?.type === 'date') {
        const aDate = aValue ? new Date(aValue).getTime() : 0;
        const bDate = bValue ? new Date(bValue).getTime() : 0;
        return direction === 'asc' ? aDate - bDate : bDate - aDate;
      }
      
      // Text sorting
      const aStr = aValue?.toString().toLowerCase() || '';
      const bStr = bValue?.toString().toLowerCase() || '';
      return direction === 'asc' 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }

  onSort(field: string) {
    if (this.sortState.field === field) {
      // Cycle: asc -> desc -> none
      if (this.sortState.direction === 'asc') {
        this.sortState.direction = 'desc';
      } else if (this.sortState.direction === 'desc') {
        this.sortState.direction = null;
        this.sortState.field = '';
      }
    } else {
      this.sortState.field = field;
      this.sortState.direction = 'asc';
    }
    this.applyFilters();
  }

  getSortIcon(field: string): string {
    if (this.sortState.field !== field) return '';
    if (this.sortState.direction === 'asc') return '▲';
    if (this.sortState.direction === 'desc') return '▼';
    return '';
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedData();
    }
  }

  updateDisplayedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedData = this.filteredData.slice(start, end);
  }

  getFieldValue(item: any, field: string): any {
    return field.split('.').reduce((obj, key) => obj?.[key], item);
  }

  getDisplayValue(item: any, column: TableColumn): any {
    const value = this.getFieldValue(item, column.field);
    
    if (value === null || value === undefined) {
      return 'N/A';
    }
    
    if (column.type === 'date' && value) {
      try {
        return new Date(value).toLocaleDateString();
      } catch {
        return value;
      }
    }
    
    if (column.type === 'number' && value !== null && value !== undefined) {
      return Number(value).toLocaleString();
    }
    
    return value;
  }

  clearColumnFilter(field: string) {
    this.filterForm.get(field)?.setValue('');
    this.activeFilters[field] = false;
    this.applyFilters();
  }

  onRowClick(row: unknown): void {
    if (!this.rowLinkPath) return;
    const id = this.getFieldValue(row, this.rowIdField);
    if (id != null) {
      this.router.navigate([this.rowLinkPath, String(id)]);
    }
  }

  getStatusBadgeClass(value: string): string {
    const status = value as Status;
    switch (status) {
      case Status.PENDING:
        return 'bg-secondary';
      case Status.IN_PROGRESS:
        return 'bg-warning text-dark';
      case Status.COMPLETED:
        return 'bg-success';
      case Status.DELAYED:
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getJobTypeBadgeClass(value: string): string {
    if (value === 'Import') return 'bg-info';
    if (value === 'Export') return 'bg-primary';
    return 'bg-secondary';
  }

  get startRecord(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endRecord(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredData.length);
  }

  getPageNumbers(): (number | any)[] {
    const pages: (number | string)[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (current > 3) {
        pages.push('...');
      }
      
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== total) {
          pages.push(i);
        }
      }
      
      if (current < total - 2) {
        pages.push('...');
      }
      
      pages.push(total);
    }
    
    return pages;
  }
}

