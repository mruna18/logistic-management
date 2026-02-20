import { Injectable } from '@angular/core';
import type { ReportColumn } from '../models/report.model';

export type ExportFormat = 'csv' | 'excel' | 'pdf';

@Injectable({ providedIn: 'root' })
export class ReportExportService {
  /** Export table data to CSV */
  exportToCsv(
    rows: Record<string, unknown>[],
    columns: ReportColumn[],
    filename: string
  ): void {
    const headers = columns.map((c) => c.header);
    const lines = [headers.join(',')];
    rows.forEach((row) => {
      const values = columns.map((c) => {
        const v = row[c.field];
        if (v == null) return '';
        if (typeof v === 'number') return v;
        if (v instanceof Date) return v.toISOString().split('T')[0];
        const s = String(v);
        return s.includes(',') ? `"${s}"` : s;
      });
      lines.push(values.join(','));
    });
    this.downloadFile(lines.join('\n'), `${filename}.csv`, 'text/csv');
  }

  /** Export to Excel (CSV with BOM for Excel compatibility) */
  exportToExcel(
    rows: Record<string, unknown>[],
    columns: ReportColumn[],
    filename: string
  ): void {
    const headers = columns.map((c) => c.header);
    const lines = [headers.join('\t')];
    rows.forEach((row) => {
      const values = columns.map((c) => {
        const v = row[c.field];
        if (v == null) return '';
        if (typeof v === 'number') return v;
        if (v instanceof Date) return v.toISOString().split('T')[0];
        return String(v);
      });
      lines.push(values.join('\t'));
    });
    const bom = '\uFEFF';
    this.downloadFile(bom + lines.join('\n'), `${filename}.xls`, 'application/vnd.ms-excel');
  }

  /** Export to PDF - structure for backend/PDF library integration */
  exportToPdf(
    _rows: Record<string, unknown>[],
    _columns: ReportColumn[],
    _filename: string,
    _title?: string
  ): void {
    // Production: Use jsPDF, pdfmake, or backend PDF generation
    // For now, open print dialog as fallback
    window.print();
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
