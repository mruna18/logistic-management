import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../services/analytics.service';
import { ReportExportService } from '../services/report-export.service';
import { ReportTemplateService } from '../services/report-template.service';
import { ReportFilterComponent } from '../components/report-filter/report-filter.component';
import { ReportTableComponent } from '../components/report-table/report-table.component';
import { ReportChartComponent } from '../components/report-chart/report-chart.component';
import { SidebarIconComponent } from '../../../layout/sidebar/sidebar-icons';
import type { ReportDefinition, ReportFilterState } from '../models/report.model';
import { REPORT_CATEGORIES } from '../models/filter.model';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReportFilterComponent,
    ReportTableComponent,
    ReportChartComponent,
    SidebarIconComponent,
  ],
  templateUrl: './reports-dashboard.component.html',
  styleUrl: './reports-dashboard.component.css',
})
export class ReportsDashboardComponent implements OnInit {
  categories = REPORT_CATEGORIES;
  activeCategory = 'import';
  reports: ReportDefinition[] = [];
  selectedReport: ReportDefinition | null = null;

  filterState: Partial<ReportFilterState> = {};
  filterOptions: {
    clients: string[];
    terminals: string[];
    shippingLines: string[];
    clearingAgents: string[];
    containerTypes: string[];
  } = {
    clients: [],
    terminals: [],
    shippingLines: [],
    clearingAgents: [],
    containerTypes: [],
  };

  reportData: { rows: Record<string, unknown>[]; chartData?: unknown } = { rows: [] };
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  isLoading = false;

  showSaveTemplateModal = false;
  templateName = '';

  constructor(
    private analytics: AnalyticsService,
    private exportService: ReportExportService,
    private templateService: ReportTemplateService
  ) {}

  ngOnInit(): void {
    this.analytics.getFilterOptions().subscribe((opts) => (this.filterOptions = opts));
    this.onCategoryChange(this.activeCategory);
  }

  onCategoryChange(cat: string): void {
    this.activeCategory = cat;
    this.reports = this.analytics.getReportDefinitions(cat);
    this.selectedReport = null;
    this.reportData = { rows: [] };
  }

  selectReport(report: ReportDefinition): void {
    this.selectedReport = report;
    this.loadReport();
  }

  loadReport(): void {
    if (!this.selectedReport) return;
    this.isLoading = true;
    this.analytics.runReport(this.selectedReport.id, this.filterState).subscribe({
      next: (data) => {
        this.reportData = data;
        this.applySort();
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  onFilterChange(f: Partial<ReportFilterState>): void {
    this.filterState = { ...this.filterState, ...f };
  }

  onApplyFilter(): void {
    this.loadReport();
  }

  onSortChange(event: { field: string; direction: 'asc' | 'desc' }): void {
    this.sortField = event.field;
    this.sortDirection = event.direction;
    this.applySort();
  }

  private applySort(): void {
    if (!this.sortField) return;
    this.reportData.rows.sort((a, b) => {
      const va = a[this.sortField] as string | number | Date;
      const vb = b[this.sortField] as string | number | Date;
      const cmp = va === vb ? 0 : va < vb ? -1 : 1;
      return this.sortDirection === 'asc' ? cmp : -cmp;
    });
  }

  export(format: 'csv' | 'excel' | 'pdf'): void {
    if (!this.selectedReport) return;
    const name = this.selectedReport.title.replace(/\s+/g, '-');
    if (format === 'csv') {
      this.exportService.exportToCsv(this.reportData.rows, this.selectedReport.columns, name);
    } else if (format === 'excel') {
      this.exportService.exportToExcel(this.reportData.rows, this.selectedReport.columns, name);
    } else {
      this.exportService.exportToPdf(this.reportData.rows, this.selectedReport.columns, name, this.selectedReport.title);
    }
  }

  openSaveTemplate(): void {
    this.templateName = '';
    this.showSaveTemplateModal = true;
  }

  hasChartDatasets(d: unknown): d is { labels: string[]; datasets: unknown[] } {
    return !!d && typeof d === 'object' && 'datasets' in d && Array.isArray((d as { datasets: unknown[] }).datasets);
  }

  saveTemplate(): void {
    if (!this.templateName.trim() || !this.selectedReport) return;
    const filters: ReportFilterState = {
      dateFrom: this.filterState.dateFrom ?? null,
      dateTo: this.filterState.dateTo ?? null,
      clients: this.filterState.clients ?? [],
      shipmentType: this.filterState.shipmentType ?? 'all',
      statuses: this.filterState.statuses ?? [],
      terminals: this.filterState.terminals ?? [],
      shippingLines: this.filterState.shippingLines ?? [],
      clearingAgents: this.filterState.clearingAgents ?? [],
      containerTypes: this.filterState.containerTypes ?? [],
    };
    this.templateService.saveTemplate({
      name: this.templateName.trim(),
      reportId: this.selectedReport.id,
      filters,
      columns: this.selectedReport.columns.map((c) => c.field),
      sortField: this.sortField || undefined,
      sortDirection: this.sortDirection,
    });
    this.showSaveTemplateModal = false;
  }
}
