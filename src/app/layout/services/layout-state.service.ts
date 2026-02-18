import { Injectable, signal, computed } from '@angular/core';

export type LayoutMode = 'sidebar' | 'header';

const STORAGE_LAYOUT = 'layout-mode';
const STORAGE_SIDEBAR = 'sidebar-collapsed';

@Injectable({ providedIn: 'root' })
export class LayoutStateService {
  readonly layoutMode = signal<LayoutMode>('sidebar');
  readonly sidebarCollapsed = signal(false);

  readonly isHeaderMode = computed(() => this.layoutMode() === 'header');
  readonly isSidebarMode = computed(() => this.layoutMode() === 'sidebar');

  constructor() {
    const savedLayout = localStorage.getItem(STORAGE_LAYOUT) as LayoutMode | null;
    if (savedLayout === 'header' || savedLayout === 'sidebar') {
      this.layoutMode.set(savedLayout);
    }
    const savedSidebar = localStorage.getItem(STORAGE_SIDEBAR);
    if (savedSidebar !== null) {
      this.sidebarCollapsed.set(savedSidebar === 'true');
    }
  }

  setLayoutMode(mode: LayoutMode): void {
    this.layoutMode.set(mode);
    localStorage.setItem(STORAGE_LAYOUT, mode);
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this.sidebarCollapsed.set(collapsed);
    localStorage.setItem(STORAGE_SIDEBAR, String(collapsed));
  }

  toggleLayoutMode(): void {
    const next = this.layoutMode() === 'sidebar' ? 'header' : 'sidebar';
    this.setLayoutMode(next);
  }
}
