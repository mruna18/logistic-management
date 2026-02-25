import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { QuoteCalculationResult } from './quote.service';

/** jsPDF instance with autoTable plugin (provides lastAutoTable.finalY) */
interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: { finalY: number };
}

/** Data passed to PDF generator (form raw value + meta) */
export interface QuotePdfData {
  companyName?: string;
  companyAddress?: string;
  clientName?: string;
  ourRef?: string;
  yourRef?: string;
  date?: Date | string;
  supplier?: string;
  country?: string;
  products?: string;
  quantity?: number;
  dutyRate?: number;
  exchangeRate?: number;
  exWorks?: number;
  fobCharges?: number;
  freight?: number;
  insuranceRate?: number;
  insuredPercent?: number;
  financeRate?: number;
  financeDays?: number;
  truckDemurrage?: number;
  sonCharges?: number;
  nafdacCharges?: number;
  telexCharges?: number;
  containerQuantities?: {
    clearing20Qty?: number;
    clearing40Qty?: number;
    terminal20Qty?: number;
    terminal40Qty?: number;
    shipping20Qty?: number;
    shipping40Qty?: number;
    transport20Qty?: number;
    transport40Qty?: number;
  };
  containerRates?: {
    clearing20?: number;
    clearing40?: number;
    terminal20?: number;
    terminal40?: number;
    shipping20?: number;
    shipping40?: number;
    transport20?: number;
    transport40?: number;
  };
  calculated: QuoteCalculationResult;
}

const N2 = (n: number): string =>
  (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** A4 width in mm (doc is created with format: 'a4') */
const A4_WIDTH_MM = 210;

/** Professional quotation colour palette - minimal & corporate */
const COLORS = {
  text: [45, 55, 72] as [number, number, number],
  textMuted: [100, 116, 139] as [number, number, number],
  accent: [71, 85, 105] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  headerBg: [248, 250, 252] as [number, number, number],
};

/** Default container rates when not provided */
const DEFAULT_RATES = {
  clearing20: 75000,
  clearing40: 95000,
  terminal20: 145000,
  terminal40: 225000,
  shipping20: 155000,
  shipping40: 275000,
  transport20: 500000,
  transport40: 600000,
};

@Injectable({
  providedIn: 'root',
})
export class QuotePdfService {
  generate(data: QuotePdfData, filename = 'quotation.pdf'): void {
    const doc: jsPDF = new jsPDF({ unit: 'mm', format: 'a4' });
    const getTableEndY = (fallbackY: number): number =>
      (doc as JsPDFWithAutoTable).lastAutoTable?.finalY ?? fallbackY;
    const pageW = A4_WIDTH_MM;
    const pageH = 297;
    const margin = 18;
    const colRight = pageW - margin;
    let y = 15;

    const dateStr = data.date
      ? (data.date instanceof Date ? data.date : new Date(data.date)).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const cr = data.containerRates ?? {};
    const r = {
      clearing20: Number(cr.clearing20) || DEFAULT_RATES.clearing20,
      clearing40: Number(cr.clearing40) || DEFAULT_RATES.clearing40,
      terminal20: Number(cr.terminal20) || DEFAULT_RATES.terminal20,
      terminal40: Number(cr.terminal40) || DEFAULT_RATES.terminal40,
      shipping20: Number(cr.shipping20) || DEFAULT_RATES.shipping20,
      shipping40: Number(cr.shipping40) || DEFAULT_RATES.shipping40,
      transport20: Number(cr.transport20) || DEFAULT_RATES.transport20,
      transport40: Number(cr.transport40) || DEFAULT_RATES.transport40,
    };

    const c = data.calculated;
    const cq = data.containerQuantities ?? {};
    const q = (n: number | undefined) => Math.max(0, Math.floor(Number(n) || 0));

    const tableBase = {
      margin: { left: margin, right: margin },
      theme: 'plain' as const,
      headStyles: {
        fillColor: COLORS.headerBg,
        textColor: COLORS.text,
        fontStyle: 'bold',
        fontSize: 8,
        lineWidth: 0.1,
        lineColor: COLORS.border,
      },
      bodyStyles: { fontSize: 8, textColor: COLORS.text, lineWidth: 0.1, lineColor: COLORS.border },
    };

    // ----- Two-column header: Company (left) | Quotation details (right) -----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.text);
    const company = data.companyName?.trim() || data.supplier || 'Logistics Company';
    doc.text(company, margin, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('QUOTATION', colRight, y, { align: 'right' });
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textMuted);
    if (data.companyAddress?.trim()) {
      doc.text(data.companyAddress.trim(), margin, y);
    }
    doc.text('Date: ' + dateStr, colRight, y, { align: 'right' });
    if (data.ourRef) {
      doc.text('Ref: ' + data.ourRef, colRight, y + 5, { align: 'right' });
    }
    y += data.companyAddress?.trim() ? 10 : 6;

    // ----- To: Client -----
    if (data.clientName) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text);
      doc.text('To:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(data.clientName), margin + 12, y);
      y += 8;
    } else {
      y += 4;
    }

    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.2);
    doc.line(margin, y, colRight, y);
    y += 8;

    // ----- Order Details -----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.accent);
    doc.text('Order Details', margin, y);
    y += 5;

    autoTable(doc, {
      ...tableBase,
      startY: y,
      head: [['Supplier', 'Country', 'Products', 'Qty', 'Duty %', 'Ex. Rate']],
      body: [
        [
          String(data.supplier ?? '—'),
          String(data.country ?? '—'),
          String(data.products ?? '—'),
          String(data.quantity ?? 0),
          String(data.dutyRate ?? 0),
          N2(Number(data.exchangeRate) || 0),
        ],
      ],
    });
    y = getTableEndY(y) + 6;

    // ----- Cost Summary -----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.accent);
    doc.text('Cost Summary', margin, y);
    y += 5;

    autoTable(doc, {
      ...tableBase,
      startY: y,
      head: [['Description', 'USD', 'Description', 'NGN']],
      body: [
        ['Ex Works', N2(data.exWorks ?? 0), 'CNF Naira', N2(c.cnfNaira)],
        ['FOB Charges', N2(data.fobCharges ?? 0), 'Insurance', N2(c.insurance)],
        ['Freight', N2(data.freight ?? 0), 'CIF Naira', N2(c.cif)],
        ['Total C&F', N2(c.totalCNF), '—', '—'],
      ],
      columnStyles: { 1: { halign: 'right' }, 3: { halign: 'right' } },
    });
    y = getTableEndY(y) + 6;

    // ----- LC, Finance, Customs -----
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.accent);
    doc.text('LC Commission, Finance & Customs', margin, y);
    y += 5;

    autoTable(doc, {
      ...tableBase,
      startY: y,
      head: [['Description', 'Amount (NGN)']],
      body: [
        ['LC Commission (Local + Offshore)', N2(c.lcLocal + c.lcOffshore)],
        ['Telex / Form M', N2(Number(data.telexCharges) || 0)],
        ['Finance Management', N2(c.financeManagement)],
        ['Finance Cost', N2(c.financeCost)],
        ['Duty', N2(c.duty)],
        ['Special Levy', N2(c.specialLevy)],
        ['Port Levy', N2(c.portLevy)],
        ['FCS (CISS)', N2(c.fcs)],
        ['TLS', N2(c.tls)],
        ['VAT on Duty', N2(c.vatOnDuty)],
      ],
      columnStyles: { 1: { halign: 'right' } },
    });
    y = getTableEndY(y) + 6;

    // ----- Container section -----
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.accent);
    doc.text('Container Charges', margin, y);
    y += 5;

    autoTable(doc, {
      ...tableBase,
      startY: y,
      head: [['Item', '20ft Rate', 'Qty', 'Total', '40ft Rate', 'Qty', 'Total']],
      body: [
        ['Clearing', N2(r.clearing20), String(q(cq.clearing20Qty)), N2(c.clearing20Total), N2(r.clearing40), String(q(cq.clearing40Qty)), N2(c.clearing40Total)],
        ['Terminal Rent', N2(r.terminal20), String(q(cq.terminal20Qty)), N2(c.terminal20Total), N2(r.terminal40), String(q(cq.terminal40Qty)), N2(c.terminal40Total)],
        ['Shipping Demurrage', N2(r.shipping20), String(q(cq.shipping20Qty)), N2(c.shipping20Total), N2(r.shipping40), String(q(cq.shipping40Qty)), N2(c.shipping40Total)],
        ['Local Transport', N2(r.transport20), String(q(cq.transport20Qty)), N2(c.transport20Total), N2(r.transport40), String(q(cq.transport40Qty)), N2(c.transport40Total)],
      ],
      headStyles: { ...tableBase.headStyles, fontSize: 7 },
      bodyStyles: { ...tableBase.bodyStyles, fontSize: 7 },
      columnStyles: {
        1: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        6: { halign: 'right' },
      },
    });
    y = getTableEndY(y) + 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('Truck Demurrage: ' + N2(Number(data.truckDemurrage) || 0) + ' NGN', margin, y);
    doc.text('Total Clearing: ' + N2(c.totalClearing) + ' NGN', colRight, y, { align: 'right' });
    y += 6;

    const sonVal = Number(data.sonCharges ?? c.sonCharges ?? 0) || 0;
    const nafdacVal = Number(data.nafdacCharges ?? c.nafdacCharges ?? 0) || 0;
    doc.text('SON: ' + (sonVal > 0 ? N2(sonVal) + ' NGN' : '—') + ' (To be invoiced as per receipts)', margin, y);
    y += 4;
    doc.text('NAFDAC: ' + (nafdacVal > 0 ? N2(nafdacVal) + ' NGN' : '—') + ' (To be invoiced as per receipts)', margin, y);
    y += 6;

    // ----- Disbursement & VAT -----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.accent);
    doc.text('Disbursement & VAT', margin, y);
    y += 5;

    autoTable(doc, {
      ...tableBase,
      startY: y,
      head: [['Description', 'Amount (NGN)']],
      body: [
        ['Disbursement', N2(c.disbursement)],
        ['GMT Management Fee', N2(c.gmtFee)],
        ['Subtotal', N2(c.subtotal)],
        ['Maintenance', N2(c.maintenance)],
        ['Total Before VAT', N2(c.totalBeforeVat)],
        ['Interest', N2(c.interest)],
        ['VAT on Total', N2(c.vatOnTotal)],
      ],
      columnStyles: { 1: { halign: 'right' } },
    });
    y = getTableEndY(y) + 8;

    // ----- Total quote (prominent) -----
    const totalBoxH = 14;
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, pageW - margin * 2, totalBoxH, 'FD');
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.rect(margin, y, pageW - margin * 2, totalBoxH, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.text);
    doc.text('Total Quote Value (Excl. Ex-Works)', margin + 4, y + 8);
    doc.text(N2(c.finalQuote) + ' NGN', colRight - 4, y + 8, { align: 'right' });
    y += totalBoxH + 8;

    // ----- Footer -----
    if (y > pageH - 25) {
      doc.addPage();
      y = 15;
    }
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.1);
    doc.line(margin, y, colRight, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.textMuted);
    const terms = 'Valid as per terms. Rates subject to change. Amounts in Nigerian Naira (NGN) unless stated.';
    doc.text(terms, margin, y, { maxWidth: pageW - margin * 2 });
    doc.text('Generated ' + new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), colRight, y + 4, { align: 'right' });

    doc.save(filename);
  }
}
