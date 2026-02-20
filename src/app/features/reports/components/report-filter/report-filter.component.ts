import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { ReportFilterState } from '../../models/report.model';

@Component({
  selector: 'app-report-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-filter.component.html',
  styleUrl: './report-filter.component.css',
})
export class ReportFilterComponent {
  @Input() filterState: Partial<ReportFilterState> = {};
  @Input() clients: string[] = [];
  @Input() terminals: string[] = [];
  @Input() shippingLines: string[] = [];
  @Input() clearingAgents: string[] = [];
  @Input() containerTypes: string[] = [];
  @Input() compact = false;

  @Output() filterChange = new EventEmitter<Partial<ReportFilterState>>();
  @Output() apply = new EventEmitter<void>();

  onDateFromChange(v: string): void {
    this.filterChange.emit({ dateFrom: v ? new Date(v) : null });
  }

  onDateToChange(v: string): void {
    this.filterChange.emit({ dateTo: v ? new Date(v) : null });
  }

  onShipmentTypeChange(v: 'all' | 'import' | 'export'): void {
    this.filterChange.emit({ shipmentType: v });
  }

  onClientSelect(client: string): void {
    this.filterChange.emit({ clients: client ? [client] : [] });
  }

  getDateStr(d: Date | null | undefined): string {
    if (!d) return '';
    const dt = d instanceof Date ? d : new Date(d);
    return dt.toISOString().slice(0, 10);
  }

  clearFilters(): void {
    this.filterChange.emit({
      dateFrom: null,
      dateTo: null,
      clients: [],
      shipmentType: 'all',
      statuses: [],
      terminals: [],
      shippingLines: [],
      clearingAgents: [],
      containerTypes: [],
    });
  }
}
