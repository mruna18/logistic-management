import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutStateService } from '../../layout/services/layout-state.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  readonly layoutState = inject(LayoutStateService);

  onLayoutModeChange(mode: 'sidebar' | 'header'): void {
    this.layoutState.setLayoutMode(mode);
  }

  onSidebarCollapsedChange(collapsed: boolean): void {
    this.layoutState.setSidebarCollapsed(collapsed);
  }
}
