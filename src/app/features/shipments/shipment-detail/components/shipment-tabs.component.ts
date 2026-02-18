import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shipment-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shipment-tabs.component.html'
})
export class ShipmentTabsComponent {
  @Input() activeTab: string = 'Overview';
  @Output() tabChange = new EventEmitter<string>();

  tabs = [
    'Overview',
    'Team & Documentation',
    'Shipment Timeline',
    'Financials',
    'Attachments',
    'Audit Logs'
  ];

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.tabChange.emit(tab);
  }
}
