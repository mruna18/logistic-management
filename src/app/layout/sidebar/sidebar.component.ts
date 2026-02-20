import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutStateService } from '../services/layout-state.service';
import { AuthService } from '../../services/auth.service';
import { SidebarIconComponent } from './sidebar-icons';

export interface SidebarItem {
  path: string;
  label: string;
  icon: string;
  /** Optional badge (e.g. count) */
  badge?: string | number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarIconComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  private readonly layoutState = inject(LayoutStateService);
  private readonly auth = inject(AuthService);

  get userName(): string {
    return this.auth.getCurrentUser()?.name ?? 'Admin';
  }

  menuItems: SidebarItem[] = [
    { path: '/dashboard', label: 'Control Tower', icon: 'chart' },
    { path: '/import-orders', label: 'Orders', icon: 'box' },
    { path: '/shipments', label: 'Shipments', icon: 'ship' },
    { path: '/containers', label: 'Containers', icon: 'clipboard' },
    { path: '/clearance', label: 'Clearance', icon: 'check' },
    { path: '/delivery', label: 'Delivery', icon: 'truck' },
    { path: '/finance', label: 'Finance', icon: 'wallet' },
    { path: '/documents', label: 'Documents', icon: 'file' },
    { path: '/reports', label: 'Reports', icon: 'reports' },
  ];

  toggle(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  setLayoutMode(mode: 'sidebar' | 'header'): void {
    this.layoutState.setLayoutMode(mode);
  }

  logout(): void {
    this.auth.logout();
  }
}
