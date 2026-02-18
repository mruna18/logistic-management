import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { DashboardAlert } from '../../models/dashboard.model';

@Component({
  selector: 'app-alert-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card h-100">
      <div class="card-header py-2 px-3 bg-transparent border-0">
        <h6 class="mb-0 fw-semibold small">Alerts & Risks</h6>
      </div>
      <div class="card-body p-2">
        @for (alert of alerts; track alert.id) {
          <div class="alert py-2 px-2 mb-2 small d-flex align-items-start" [ngClass]="getAlertClass(alert)">
            <span class="me-2">{{ getIcon(alert) }}</span>
            <div class="flex-grow-1">
              <strong>{{ alert.title }}</strong>
              <span class="text-muted"> — {{ alert.message }}</span>
            </div>
            <span class="badge bg-dark ms-1">{{ alert.count }}</span>
          </div>
        }
        @empty {
          <p class="text-muted small mb-0">No active alerts</p>
        }
      </div>
    </div>
  `,
})
export class AlertWidgetComponent {
  @Input() alerts: DashboardAlert[] = [];

  getAlertClass(alert: DashboardAlert): string {
    switch (alert.severity) {
      case 'critical': return 'alert-danger';
      case 'warning': return 'alert-warning';
      default: return 'alert-info';
    }
  }

  getIcon(alert: DashboardAlert): string {
    switch (alert.severity) {
      case 'critical': return '⚠️';
      case 'warning': return '⚡';
      default: return 'ℹ️';
    }
  }
}
