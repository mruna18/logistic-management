import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card h-100" [class.border-danger]="highlight">
      <div class="card-body py-3 px-3">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <p class="text-muted small mb-1">{{ label }}</p>
            <h4 class="mb-0 fw-bold" [class.text-danger]="highlight">{{ isNumber ? (value | number) : value }}</h4>
          </div>
          @if (icon) {
            <span class="badge bg-light text-dark fs-6">{{ icon }}</span>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card { transition: box-shadow 0.2s; }
    .card:hover { box-shadow: 0 0.25rem 0.5rem rgba(0,0,0,0.08); }
  `],
})
export class KpiCardComponent {
  @Input() label = '';
  @Input() value: number | string = 0;
  @Input() icon = '';
  @Input() highlight = false;

  get isNumber(): boolean {
    return typeof this.value === 'number';
  }
}
