import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityLogEntry } from '../../models/shipment-detail.model';

@Component({
  selector: 'app-activity-log-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-log-panel.component.html',
  styleUrl: './activity-log-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityLogPanelComponent {
  @Input() activities: ActivityLogEntry[] = [];
  @Input() collapsed = false;
  @Input() panelId = 'activityLogCollapse';

  trackByActivityId(_index: number, a: ActivityLogEntry): string {
    return a.id;
  }
}
