import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FinanceService } from '../../core/services/finance.service';
import { Payment } from '../../shared/models/shipment.model';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './finance.component.html',
  styleUrl: './finance.component.css'
})
export class FinanceComponent implements OnInit {
  payments: Payment[] = [];
  totalCost: number = 0;
  totalPaymentsAmount = 0;

  constructor(private financeService: FinanceService) {}

  ngOnInit() {
    this.loadPayments();
    this.loadTotalCost();
  }

  loadPayments() {
    this.financeService.getAll().subscribe(payments => {
      this.payments = payments;
      this.totalPaymentsAmount = payments.reduce((sum, p) => sum + (p.amount ?? 0), 0);
    });
  }

  loadTotalCost() {
    this.financeService.getTotalCost().subscribe(total => {
      this.totalCost = total;
    });
  }
}

