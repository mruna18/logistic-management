import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusStep } from '../models/shipment-detail.model';

@Component({
  selector: 'app-shipment-status-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shipment-status-tracker.component.html',
  styles: [`
    .step-indicator {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: #e9ecef;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      z-index: 2;
      border: 2px solid #fff;
    }
    .step-indicator.active {
      background-color: #0d6efd;
      color: #fff;
    }
    .step-indicator.completed {
      background-color: #198754;
      color: #fff;
    }
    .progress-line {
      position: absolute;
      top: 12px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: #e9ecef;
      z-index: 1;
    }
    .progress-line-fill {
      height: 100%;
      background-color: #198754;
      transition: width 0.3s ease;
    }
    .step-label {
      font-size: 10px;
      margin-top: 4px;
      text-align: center;
      font-weight: 500;
    }
  `]
})
export class ShipmentStatusTrackerComponent {
  @Input() currentStep: number = 1;

  steps: StatusStep[] = [
    { label: 'Draft', stepNumber: 1 },
    { label: 'Form M Approved', stepNumber: 2 },
    { label: 'Production', stepNumber: 3 },
    { label: 'Ready to Ship', stepNumber: 4 },
    { label: 'Shipment Departed', stepNumber: 5 },
    { label: 'Arrived Nigeria', stepNumber: 6 },
    { label: 'Clearing In Progress', stepNumber: 7 },
    { label: 'Delivered', stepNumber: 8 },
    { label: 'File Closed', stepNumber: 9 }
  ];

  getProgressWidth(): string {
    return ((this.currentStep - 1) / (this.steps.length - 1)) * 100 + '%';
  }
}
