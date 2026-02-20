import { Injectable } from '@angular/core';
import type { ReportTemplate, ReportFilterState } from '../models/report.model';

const STORAGE_KEY = 'report-templates';

@Injectable({ providedIn: 'root' })
export class ReportTemplateService {
  getTemplates(): ReportTemplate[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw) as ReportTemplate[];
      return arr.map((t) => ({
        ...t,
        filters: this.rehydrateFilters(t.filters),
        createdAt: new Date(t.createdAt),
      }));
    } catch {
      return [];
    }
  }

  saveTemplate(template: Omit<ReportTemplate, 'id' | 'createdAt'>): ReportTemplate {
    const templates = this.getTemplates();
    const newTemplate: ReportTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      createdAt: new Date(),
    };
    templates.push(newTemplate);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    return newTemplate;
  }

  deleteTemplate(id: string): void {
    const templates = this.getTemplates().filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }

  private rehydrateFilters(f: Partial<ReportFilterState>): ReportFilterState {
    return {
      dateFrom: f.dateFrom ? new Date(f.dateFrom) : null,
      dateTo: f.dateTo ? new Date(f.dateTo) : null,
      clients: f.clients ?? [],
      shipmentType: f.shipmentType ?? 'all',
      statuses: f.statuses ?? [],
      terminals: f.terminals ?? [],
      shippingLines: f.shippingLines ?? [],
      clearingAgents: f.clearingAgents ?? [],
      containerTypes: f.containerTypes ?? [],
    };
  }
}
