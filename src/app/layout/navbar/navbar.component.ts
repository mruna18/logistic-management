import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LayoutStateService } from '../services/layout-state.service';
import { AuthService } from '../../services/auth.service';

export interface NavItem {
  path: string;
  label: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  private readonly layoutState = inject(LayoutStateService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly layoutMode = this.layoutState.layoutMode;

  get userName(): string {
    return this.auth.getCurrentUser()?.name ?? 'Admin';
  }
  title = 'Nigerian Import Logistics Management System';

  getCurrentModule(): string {
    const url = this.router.url;
    const item = this.navItems.find((n) => url.startsWith(n.path));
    return item?.label ?? 'Control Tower';
  }

  navItems: NavItem[] = [
    { path: '/dashboard', label: 'Control Tower' },
    { path: '/import-orders', label: 'Orders' },
    { path: '/shipments', label: 'Shipments' },
    { path: '/containers', label: 'Containers' },
    { path: '/clearance', label: 'Clearance' },
    { path: '/delivery', label: 'Delivery' },
    { path: '/finance', label: 'Finance' },
    { path: '/documents', label: 'Documents' },
  ];

  setLayoutMode(mode: 'sidebar' | 'header'): void {
    this.layoutState.setLayoutMode(mode);
  }

  logout(): void {
    this.auth.logout();
  }
}
