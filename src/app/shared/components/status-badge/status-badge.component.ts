import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Status } from '../../enums/status.enum';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="getBadgeClass()">{{ status }}</span>
  `,
  styles: [`
    span {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
    }
  `]
})
export class StatusBadgeComponent {
  @Input() status!: Status;

  getBadgeClass(): string {
    const baseClass = 'badge';
    switch (this.status) {
      case Status.PENDING:
        return `${baseClass} bg-secondary`;
      case Status.IN_PROGRESS:
        return `${baseClass} bg-warning text-dark`;
      case Status.COMPLETED:
        return `${baseClass} bg-success`;
      case Status.DELAYED:
        return `${baseClass} bg-danger`;
      default:
        return `${baseClass} bg-secondary`;
    }
  }
}

