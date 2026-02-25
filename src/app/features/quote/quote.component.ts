import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { QuoteService, QUOTE_CONTAINER_RATES } from './quote.service';
import type { QuoteCalculationInputs, QuoteCalculationResult } from './quote.service';
import { QuotePdfService } from './quote-pdf.service';
import type { QuotePdfData } from './quote-pdf.service';
import { ImportOrderService } from '../../core/services/import-order.service';

@Component({
  selector: 'app-quote',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  providers: [DecimalPipe],
  templateUrl: './quote.component.html',
  styleUrl: './quote.component.scss',
})
export class QuoteComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly quoteService = inject(QuoteService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly importOrderService = inject(ImportOrderService);
  private readonly decimalPipe = inject(DecimalPipe);
  private readonly quotePdfService = inject(QuotePdfService);

  form!: FormGroup;
  today = new Date();

  /** Format number for display in quote (2 decimal places, thousands separator) */
  formatNum(value: number | null | undefined): string {
    return this.decimalPipe.transform(value ?? 0, '1.2-2') ?? '0.00';
  }
  orderId: string | null = null;
  orderRef: string | null = null;
  clientName: string | null = null;
  readonly containerRates = QUOTE_CONTAINER_RATES;

  ngOnInit(): void {
    this.buildForm();
    this.orderId = this.route.snapshot.paramMap.get('id');
    if (this.orderId) {
      this.importOrderService.getById(this.orderId).subscribe((order) => {
        if (order) {
          this.orderRef = order.orderReference ?? null;
          this.clientName = order.buyerName ?? order.orderReference ?? null;
          this.prefillFromOrder(order as unknown as Record<string, unknown>);
        }
      });
    }
    this.registerValueChanges();
    this.recalculate();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      supplier: [''],
      country: [''],
      products: [''],
      quantity: [0, [Validators.required, Validators.min(0)]],
      dutyRate: [20, [Validators.required, Validators.min(0)]],
      exchangeRate: [1450, [Validators.required, Validators.min(0)]],
      exchangeRateForDuty: [null as number | null],
      cifForDutyOverride: [null as number | null],

      exWorks: [0, [Validators.required, Validators.min(0)]],
      fobCharges: [0, [Validators.required, Validators.min(0)]],
      freight: [0, [Validators.required, Validators.min(0)]],
      totalFOB: [{ value: 0, disabled: true }],
      totalCNF: [{ value: 0, disabled: true }],

      cnfNaira: [{ value: 0, disabled: true }],
      insuranceRate: [0.35],
      insuredPercent: [110],
      insurance: [{ value: 0, disabled: true }],
      cif: [{ value: 0, disabled: true }],

      lcLocal: [{ value: 0, disabled: true }],
      lcOffshore: [{ value: 0, disabled: true }],
      telexCharges: [20000],

      financeRate: [30],
      financeDays: [30],
      financeManagementRate: [1],
      financeManagement: [{ value: 0, disabled: true }],
      financeCost: [{ value: 0, disabled: true }],

      duty: [{ value: 0, disabled: true }],
      specialLevy: [{ value: 0, disabled: true }],
      portLevy: [{ value: 0, disabled: true }],
      fcs: [{ value: 0, disabled: true }],
      tls: [{ value: 0, disabled: true }],
      vatOnDuty: [{ value: 0, disabled: true }],

      container20: [0, Validators.min(0)],
      container40: [0, Validators.min(0)],
      clearing20Total: [{ value: 0, disabled: true }],
      clearing40Total: [{ value: 0, disabled: true }],
      terminal20Total: [{ value: 0, disabled: true }],
      terminal40Total: [{ value: 0, disabled: true }],
      shipping20Total: [{ value: 0, disabled: true }],
      shipping40Total: [{ value: 0, disabled: true }],
      transport20Total: [{ value: 0, disabled: true }],
      transport40Total: [{ value: 0, disabled: true }],
      truckDemurrage: [0],
      totalClearing: [{ value: 0, disabled: true }],

      disbursement: [{ value: 0, disabled: true }],
      gmtFee: [{ value: 0, disabled: true }],
      subtotal: [{ value: 0, disabled: true }],
      maintenance: [{ value: 0, disabled: true }],
      totalBeforeVat: [{ value: 0, disabled: true }],
      interest: [{ value: 0, disabled: true }],
      vatOnTotal: [{ value: 0, disabled: true }],
      finalQuote: [{ value: 0, disabled: true }],
    });
  }

  private prefillFromOrder(order: Record<string, unknown>): void {
    const patch: Record<string, unknown> = {};
    if (order['supplierName']) patch['supplier'] = order['supplierName'];
    if (order['productDescription']) patch['products'] = order['productDescription'];
    if (order['quantity'] != null) patch['quantity'] = order['quantity'];
    if (order['exWorks'] != null) patch['exWorks'] = order['exWorks'];
    if (order['fob'] != null) patch['fobCharges'] = order['fob'];
    if (order['freight'] != null) patch['freight'] = order['freight'];
    const containerCount = Number(order['containerCount'] ?? order['numberOfContainers'] ?? 1);
    const type = String(order['containerType'] ?? '').toLowerCase();
    if (type.includes('40')) {
      patch['container40'] = containerCount;
      patch['container20'] = 0;
    } else {
      patch['container20'] = containerCount;
      patch['container40'] = 0;
    }
    this.form.patchValue(patch, { emitEvent: false });
    this.recalculate();
  }

  private registerValueChanges(): void {
    const sourceControls = [
      'exWorks', 'fobCharges', 'freight', 'exchangeRate', 'exchangeRateForDuty', 'cifForDutyOverride',
      'insuranceRate', 'insuredPercent', 'dutyRate', 'financeRate', 'financeDays', 'financeManagementRate',
      'container20', 'container40',
    ];
    sourceControls.forEach((name) => {
      const ctrl = this.form.get(name);
      if (ctrl) {
        ctrl.valueChanges.subscribe(() => this.recalculate());
      }
    });
  }

  private recalculate(): void {
    const raw = this.form.getRawValue();
    const inputs: QuoteCalculationInputs = {
      exWorks: Number(raw.exWorks) || 0,
      fobCharges: Number(raw.fobCharges) || 0,
      freight: Number(raw.freight) || 0,
      exchangeRate: Number(raw.exchangeRate) || 0,
      insuranceRate: Number(raw.insuranceRate) ?? 0.35,
      insuredPercent: Number(raw.insuredPercent) ?? 110,
      dutyRate: Number(raw.dutyRate) || 0,
      exchangeRateForDuty: raw.exchangeRateForDuty != null && raw.exchangeRateForDuty !== '' ? Number(raw.exchangeRateForDuty) : undefined,
      cifForDutyOverride: raw.cifForDutyOverride != null && raw.cifForDutyOverride !== '' ? Number(raw.cifForDutyOverride) : undefined,
      financeRate: Number(raw.financeRate) || 0,
      financeDays: Number(raw.financeDays) || 0,
      financeManagementRate: Number(raw.financeManagementRate) ?? 1,
      container20: Number(raw.container20) || 0,
      container40: Number(raw.container40) || 0,
      truckDemurrage: Number(raw.truckDemurrage) || 0,
      telexCharges: Number(raw.telexCharges) || 0,
    };
    const result = this.quoteService.calculate(inputs);
    this.patchCalculated(result);
  }

  private patchCalculated(r: QuoteCalculationResult): void {
    this.form.patchValue({
      totalFOB: r.totalFOB,
      totalCNF: r.totalCNF,
      cnfNaira: r.cnfNaira,
      insurance: r.insurance,
      cif: r.cif,
      lcLocal: r.lcLocal,
      lcOffshore: r.lcOffshore,
      financeManagement: r.financeManagement,
      financeCost: r.financeCost,
      duty: r.duty,
      specialLevy: r.specialLevy,
      portLevy: r.portLevy,
      fcs: r.fcs,
      tls: r.tls,
      vatOnDuty: r.vatOnDuty,
      clearing20Total: r.clearing20Total,
      clearing40Total: r.clearing40Total,
      terminal20Total: r.terminal20Total,
      terminal40Total: r.terminal40Total,
      shipping20Total: r.shipping20Total,
      shipping40Total: r.shipping40Total,
      transport20Total: r.transport20Total,
      transport40Total: r.transport40Total,
      totalClearing: r.totalClearing,
      disbursement: r.disbursement,
      gmtFee: r.gmtFee,
      subtotal: r.subtotal,
      maintenance: r.maintenance,
      totalBeforeVat: r.totalBeforeVat,
      interest: r.interest,
      vatOnTotal: r.vatOnTotal,
      finalQuote: r.finalQuote,
    }, { emitEvent: false });
  }

  downloadPdf(): void {
    const raw = this.form.getRawValue();
    const data: QuotePdfData = {
      companyName: 'MAGNIFICO SYNERGIES LIMITED',
      companyAddress: 'Logistics & Clearing Services',
      clientName: this.clientName ?? raw.supplier ?? undefined,
      ourRef: this.orderRef ?? undefined,
      yourRef: undefined,
      date: this.today,
      supplier: raw.supplier,
      country: raw.country,
      products: raw.products,
      quantity: raw.quantity,
      dutyRate: raw.dutyRate,
      exchangeRate: raw.exchangeRate,
      exWorks: raw.exWorks,
      fobCharges: raw.fobCharges,
      freight: raw.freight,
      insuranceRate: raw.insuranceRate,
      insuredPercent: raw.insuredPercent,
      financeRate: raw.financeRate,
      financeDays: raw.financeDays,
      container20: raw.container20,
      container40: raw.container40,
      truckDemurrage: raw.truckDemurrage,
      telexCharges: raw.telexCharges,
      calculated: {
        totalFOB: raw.totalFOB,
        totalCNF: raw.totalCNF,
        cnfNaira: raw.cnfNaira,
        insurance: raw.insurance,
        cif: raw.cif,
        lcLocal: raw.lcLocal,
        lcOffshore: raw.lcOffshore,
        financeManagement: raw.financeManagement,
        financeCost: raw.financeCost,
        duty: raw.duty,
        specialLevy: raw.specialLevy,
        portLevy: raw.portLevy,
        fcs: raw.fcs,
        tls: raw.tls,
        vatOnDuty: raw.vatOnDuty,
        clearing20Total: raw.clearing20Total,
        clearing40Total: raw.clearing40Total,
        terminal20Total: raw.terminal20Total,
        terminal40Total: raw.terminal40Total,
        shipping20Total: raw.shipping20Total,
        shipping40Total: raw.shipping40Total,
        transport20Total: raw.transport20Total,
        transport40Total: raw.transport40Total,
        totalClearing: raw.totalClearing,
        disbursement: raw.disbursement,
        gmtFee: raw.gmtFee,
        subtotal: raw.subtotal,
        maintenance: raw.maintenance,
        totalBeforeVat: raw.totalBeforeVat,
        interest: raw.interest,
        vatOnTotal: raw.vatOnTotal,
        finalQuote: raw.finalQuote,
      },
    };
    const ref = (this.orderRef || String(this.today.getTime())).replace(/[/\\?*:|"]/g, '-');
    const name = `quotation-${ref}.pdf`;
    this.quotePdfService.generate(data, name);
  }

  back(): void {
    if (this.orderId) {
      this.router.navigate(['/import-orders', this.orderId]);
    } else {
      this.router.navigate(['/import-orders']);
    }
  }
}
