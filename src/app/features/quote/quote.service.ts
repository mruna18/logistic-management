import { Injectable } from '@angular/core';

/** Container rates (Naira) */
export const QUOTE_CONTAINER_RATES = {
  clearing20: 75000,
  clearing40: 95000,
  terminal20: 145000,
  terminal40: 225000,
  shipping20: 155000,
  shipping40: 275000,
  transport20: 500000,
  transport40: 600000,
} as const;

/** Inputs required for quote calculations */
export interface QuoteCalculationInputs {
  exWorks: number;
  fobCharges: number;
  freight: number;
  exchangeRate: number;
  insuranceRate: number;
  insuredPercent: number;
  dutyRate: number;
  /** Optional: exchange rate for "For Duty/insurance Calculation" box. When set, duty CIF = Total CNF × this rate + Insurance. */
  exchangeRateForDuty?: number;
  /** Optional: CIF for duty (₦) from the duty box. When set and > 0, used for Duty and Special Levy instead of computed cifForDuty. */
  cifForDutyOverride?: number;
  financeRate: number;
  financeDays: number;
  /** Finance Management fee rate % (default 1) = CIF Naira × rate % */
  financeManagementRate?: number;
  /** Per-row quantities (Excel: each charge type can have different 20ft/40ft counts) */
  clearing20Qty: number;
  clearing40Qty: number;
  terminal20Qty: number;
  terminal40Qty: number;
  shipping20Qty: number;
  shipping40Qty: number;
  transport20Qty: number;
  transport40Qty: number;
  truckDemurrage?: number;
  /** SON - Standards Organisation of Nigeria. To be invoiced as per receipts. */
  sonCharges?: number;
  /** NAFDAC - National Agency for Food and Drug Administration. To be invoiced as per receipts. */
  nafdacCharges?: number;
  telexCharges?: number;
  /** Optional: override container rates. When omitted, uses QUOTE_CONTAINER_RATES. */
  containerRates?: Partial<Record<keyof typeof QUOTE_CONTAINER_RATES, number>>;
}

/** All calculated outputs */
export interface QuoteCalculationResult {
  totalFOB: number;
  totalCNF: number;
  cnfNaira: number;
  insurance: number;
  cif: number;
  lcLocal: number;
  lcOffshore: number;
  financeManagement: number;
  financeCost: number;
  duty: number;
  specialLevy: number;
  portLevy: number;
  fcs: number;
  tls: number;
  vatOnDuty: number;
  clearing20Total: number;
  clearing40Total: number;
  terminal20Total: number;
  terminal40Total: number;
  shipping20Total: number;
  shipping40Total: number;
  transport20Total: number;
  transport40Total: number;
  totalClearing: number;
  sonCharges: number;
  nafdacCharges: number;
  disbursement: number;
  gmtFee: number;
  subtotal: number;
  maintenance: number;
  totalBeforeVat: number;
  interest: number;
  vatOnTotal: number;
  finalQuote: number;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

@Injectable({
  providedIn: 'root',
})
export class QuoteService {
  /**
   * Compute all quote values from current form inputs.
   * Formulas as per specification; all amounts rounded to 2 decimal places.
   */
  calculate(inputs: QuoteCalculationInputs): QuoteCalculationResult {
    const cr = inputs.containerRates ?? {};
    const r = {
      clearing20: Number(cr.clearing20) || QUOTE_CONTAINER_RATES.clearing20,
      clearing40: Number(cr.clearing40) || QUOTE_CONTAINER_RATES.clearing40,
      terminal20: Number(cr.terminal20) || QUOTE_CONTAINER_RATES.terminal20,
      terminal40: Number(cr.terminal40) || QUOTE_CONTAINER_RATES.terminal40,
      shipping20: Number(cr.shipping20) || QUOTE_CONTAINER_RATES.shipping20,
      shipping40: Number(cr.shipping40) || QUOTE_CONTAINER_RATES.shipping40,
      transport20: Number(cr.transport20) || QUOTE_CONTAINER_RATES.transport20,
      transport40: Number(cr.transport40) || QUOTE_CONTAINER_RATES.transport40,
    };
    const exWorks = Number(inputs.exWorks) || 0;
    const fobCharges = Number(inputs.fobCharges) || 0;
    const freight = Number(inputs.freight) || 0;
    const exchangeRate = Number(inputs.exchangeRate) || 0;
    const insuranceRate = Number(inputs.insuranceRate) ?? 0.35;
    const insuredPercent = Number(inputs.insuredPercent) ?? 110;
    const dutyRate = Number(inputs.dutyRate) || 0;
    const financeRate = Number(inputs.financeRate) || 0;
    const financeDays = Number(inputs.financeDays) || 0;
    const q = (n: number) => Math.max(0, Math.floor(Number(n) || 0));
    const truckDemurrage = Number(inputs.truckDemurrage) || 0;
    const sonCharges = round2(Number(inputs.sonCharges) || 0);
    const nafdacCharges = round2(Number(inputs.nafdacCharges) || 0);
    const telexCharges = Number(inputs.telexCharges) || 0;

    const totalFOB = round2(exWorks + fobCharges);
    const totalCNF = round2(totalFOB + freight);
    const cnfNaira = round2(totalCNF * exchangeRate);
    const insurance = round2(cnfNaira * (insuranceRate / 100) * (insuredPercent / 100));
    // CIF for Duty/insurance Calculation (separate box). When cifForDutyOverride provided, use it; else use exchangeRateForDuty (or main rate). Duty = duty rate % of this CIF.
    const cifOverride = Number(inputs.cifForDutyOverride) > 0 ? Number(inputs.cifForDutyOverride) : 0;
    const rateForDuty = Number(inputs.exchangeRateForDuty) > 0 ? Number(inputs.exchangeRateForDuty) : exchangeRate;
    const cnfNairaForDuty = round2(totalCNF * rateForDuty);
    const cifForDuty = cifOverride > 0 ? cifOverride : round2(cnfNairaForDuty + insurance);
    const cif = round2(cnfNaira + insurance);

    const lcLocal = round2(cnfNaira * 0.005);
    const lcOffshore = round2(cnfNaira * 0.005);

    // Finance Management (₦) = CIF Naira × rate %
    const financeManagementRatePct = Number(inputs.financeManagementRate) ?? 1;
    const financeManagement = round2(cif * (financeManagementRatePct / 100));
    // Finance Cost = ((CIF Naira + D33 + D34 + D35 + D36) × rate %) × (days/365); D33=LC Local, D34=LC Offshore, D35=Telex, D36=Finance Mgmt
    const financeCostBase = cif + lcLocal + lcOffshore + telexCharges + financeManagement;
    const financeCost = round2((financeCostBase * (financeRate / 100)) * (financeDays / 365));

    // Duty = CIF for Duty × duty rate % (e.g. 20%). Uses "For Duty/insurance Calculation" CIF only. Same CIF for Special Levy (₦).
    const duty = round2(cifForDuty * (dutyRate / 100));
    const specialLevy = round2(cifForDuty * 0.2);
    const portLevy = round2(duty * 0.07);
    const fobNaira = totalFOB * exchangeRate;
    const fcs = round2(fobNaira * 0.04);
    const tls = round2(cif * 0.005);
    const vatOnDuty = round2(duty * 0.075);

    const clearing20Total = round2(r.clearing20 * q(inputs.clearing20Qty));
    const clearing40Total = round2(r.clearing40 * q(inputs.clearing40Qty));
    const terminal20Total = round2(r.terminal20 * q(inputs.terminal20Qty));
    const terminal40Total = round2(r.terminal40 * q(inputs.terminal40Qty));
    const shipping20Total = round2(r.shipping20 * q(inputs.shipping20Qty));
    const shipping40Total = round2(r.shipping40 * q(inputs.shipping40Qty));
    const transport20Total = round2(r.transport20 * q(inputs.transport20Qty));
    const transport40Total = round2(r.transport40 * q(inputs.transport40Qty));
    // totalClearing = sum of container section (clearing + terminal + shipping + transport only)
    const totalClearing = round2(
      clearing20Total + clearing40Total +
      terminal20Total + terminal40Total +
      shipping20Total + shipping40Total +
      transport20Total + transport40Total
    );

    // 10) Disbursement = 30% on Duty + Clearing
    const disbursement = round2((duty + totalClearing) * 0.3);
    // 11) GMT Management = 1% of C&F Value
    const gmtFee = round2(cnfNaira * 0.01);

    // 12) Subtotal = cif + duty + levies + clearing + disbursement + gmtFee (incl. truck demurrage, SON, NAFDAC)
    const subtotal = round2(
      cif + duty + specialLevy + portLevy +
      fcs + tls + vatOnDuty +
      totalClearing + truckDemurrage + sonCharges + nafdacCharges + disbursement + gmtFee
    );
    const maintenance = round2(subtotal * 0.002);
    const totalBeforeVat = round2(subtotal + maintenance);
    const interest = round2((totalBeforeVat * (financeRate / 100)) * (financeDays / 360));
    const vatOnTotal = round2(totalBeforeVat * 0.075);
    const finalQuote = round2(totalBeforeVat + interest + vatOnTotal);

    return {
      totalFOB,
      totalCNF,
      cnfNaira,
      insurance,
      cif,
      lcLocal,
      lcOffshore,
      financeManagement,
      financeCost,
      duty,
      specialLevy,
      portLevy,
      fcs,
      tls,
      vatOnDuty,
      clearing20Total,
      clearing40Total,
      terminal20Total,
      terminal40Total,
      shipping20Total,
      shipping40Total,
      transport20Total,
      transport40Total,
      totalClearing,
      sonCharges,
      nafdacCharges,
      disbursement,
      gmtFee,
      subtotal,
      maintenance,
      totalBeforeVat,
      interest,
      vatOnTotal,
      finalQuote,
    };
  }

  /** Get container rates for display */
  getContainerRates(): typeof QUOTE_CONTAINER_RATES {
    return { ...QUOTE_CONTAINER_RATES };
  }
}
