import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ReportColumn } from '../../models/report.model';

@Component({
  selector: 'app-report-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-table.component.html',
  styleUrl: './report-table.component.css',
})
export class ReportTableComponent {
  @Input() rows: Record<string, unknown>[] = [];
  @Input() columns: ReportColumn[] = [];
  @Input() pageSize = 20;
  @Input() sortField = '';
  @Input() sortDirection: 'asc' | 'desc' = 'asc';

  @Output() sortChange = new EventEmitter<{ field: string; direction: 'asc' | 'desc' }>();

  currentPage = 1;

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.rows.length / this.pageSize));
  }

  get paginatedRows(): Record<string, unknown>[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.rows.slice(start, start + this.pageSize);
  }

  get startRow(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endRow(): number {
    return Math.min(this.currentPage * this.pageSize, this.rows.length);
  }

  isRiskRow(row: Record<string, unknown>): boolean {
    return this.columns.some((c) => c.riskCondition?.(row));
  }

  formatCell(row: Record<string, unknown>, col: ReportColumn): string {
    const v = row[col.field];
    if (v == null) return '-';
    if (col.type === 'currency') return this.formatCurrency(v as number);
    if (col.type === 'date') return new Date(v as Date).toLocaleDateString();
    return String(v);
  }

  formatCurrency(n: number): string {
    if (n >= 1e9) return `₦${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `₦${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `₦${(n / 1e3).toFixed(0)}K`;
    return `₦${n.toLocaleString()}`;
  }

  onSort(field: string): void {
    const dir = this.sortField === field && this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortChange.emit({ field, direction: dir });
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }
}
