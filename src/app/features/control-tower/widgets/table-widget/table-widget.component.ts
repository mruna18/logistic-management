import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  field: string;
  header: string;
  type?: 'text' | 'number' | 'badge';
  badgeClass?: (row: any) => string;
}

@Component({
  selector: 'app-table-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card h-100">
      <div class="card-header py-2 px-3 bg-transparent border-0">
        <h6 class="mb-0 fw-semibold small">{{ title }}</h6>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-sm table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th *ngFor="let col of columns" class="small">{{ col.header }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of data">
                <td *ngFor="let col of columns" class="small align-middle">
                  <ng-container [ngSwitch]="col.type">
                    <span *ngSwitchCase="'badge'" [class]="getBadgeClass(row, col)">
                      {{ getValue(row, col.field) }}
                    </span>
                    <span *ngSwitchCase="'number'">{{ getValue(row, col.field) | number }}</span>
                    <span *ngSwitchDefault>{{ getValue(row, col.field) }}</span>
                  </ng-container>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class TableWidgetComponent {
  @Input() title = '';
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];

  getValue(row: any, field: string): any {
    return field.split('.').reduce((o, k) => o?.[k], row) ?? '—';
  }

  getBadgeClass(row: any, col: TableColumn): string {
    if (col.badgeClass) return col.badgeClass(row);
    return 'badge bg-secondary';
  }
}
