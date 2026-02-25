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
  container20?: number;
  container40?: number;
  truckDemurrage?: number;
  telexCharges?: number;
  calculated: QuoteCalculationResult;
}

const N2 = (n: number): string =>
  (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** A4 width in mm (doc is created with format: 'a4') */
const A4_WIDTH_MM = 210;

@Injectable({
  providedIn: 'root',
})
export class QuotePdfService {
  private readonly primaryColor: [number, number, number] = [13, 110, 253]; // Bootstrap primary
  private readonly darkColor: [number, number, number] = [33, 37, 41];
  private readonly lightGray: [number, number, number] = [248, 249, 250];

  generate(data: QuotePdfData, filename = 'quotation.pdf'): void {
    const doc: jsPDF = new jsPDF({ unit: 'mm', format: 'a4' });
    const getTableEndY = (fallbackY: number): number =>
      (doc as JsPDFWithAutoTable).lastAutoTable?.finalY ?? fallbackY;
    const pageW = A4_WIDTH_MM;
    let y = 18;

    // ----- Header -----
    doc.setFontSize(22);
    doc.setTextColor(...this.primaryColor);
    doc.setFont('helvetica', 'bold');
    const company = data.companyName?.toUpperCase() || 'LOGISTICS QUOTATION';
    doc.text(company, pageW / 2, y, { align: 'center' });
    y += 6;

    doc.setFontSize(14);
    doc.setTextColor(...this.darkColor);
    doc.text('QUOTATION', pageW / 2, y, { align: 'center' });
    y += 4;

    if (data.companyAddress) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(data.companyAddress, pageW / 2, y, { align: 'center' });
      y += 5;
    } else {
      y += 2;
    }

    // ----- Client & ref block (two columns) -----
    y += 2;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...this.darkColor);

    const leftCol = 20;
    const rightCol = 110;
    if (data.clientName) {
      doc.setFont('helvetica', 'bold');
      doc.text('Client:', leftCol, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(data.clientName), leftCol + 22, y);
      y += 6;
    }
    if (data.ourRef) {
      doc.setFont('helvetica', 'bold');
      doc.text('Our ref:', leftCol, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(data.ourRef), leftCol + 22, y);
      y += 5;
    }
    if (data.yourRef) {
      doc.setFont('helvetica', 'bold');
      doc.text('Your ref:', leftCol, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(data.yourRef), leftCol + 22, y);
      y += 5;
    }
    const dateStr = data.date
      ? (data.date instanceof Date ? data.date : new Date(data.date)).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', rightCol, y - (data.yourRef ? 0 : 5));
    doc.setFont('helvetica', 'normal');
    doc.text(dateStr, rightCol + 15, (y -= data.yourRef ? 0 : 5));
    y += 8;

    // ----- General information -----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...this.primaryColor);
    doc.text('1. General information', 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [['Supplier', 'Country', 'Products', 'Quantity', 'Duty %', 'Rate N/$']],
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
      theme: 'grid',
      headStyles: { fillColor: this.primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
      margin: { left: 14, right: 14 },
    });
    y = getTableEndY(y) + 6;

    // ----- USD Costing -----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...this.primaryColor);
    doc.text('2. USD costing', 14, y);
    y += 6;

    const c = data.calculated;
    autoTable(doc, {
      startY: y,
      head: [['Description', 'Amount (USD)']],
      body: [
        ['Ex Works', N2(data.exWorks ?? 0)],
        ['FOB Charges', N2(data.fobCharges ?? 0)],
        ['Freight', N2(data.freight ?? 0)],
        ['Total FOB', N2(c.totalFOB)],
        ['Total C&F', N2(c.totalCNF)],
      ],
      theme: 'grid',
      headStyles: { fillColor: this.primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'right' } },
      margin: { left: 14, right: 14 },
    });
    y = getTableEndY(y) + 6;

    // ----- Naira conversion, Insurance, CIF -----
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...this.primaryColor);
    doc.text('3–5. Naira conversion, Insurance & CIF', 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [['Description', 'Amount (₦)']],
      body: [
        ['CNF Naira', N2(c.cnfNaira)],
        ['Insurance', N2(c.insurance)],
        ['CIF Naira', N2(c.cif)],
      ],
      theme: 'grid',
      headStyles: { fillColor: this.primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'right' } },
      margin: { left: 14, right: 14 },
    });
    y = getTableEndY(y) + 6;

    // ----- LC, Finance, Customs -----
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...this.primaryColor);
    doc.text('6–8. LC Commission, Finance & Customs', 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [['Description', 'Amount (₦)']],
      body: [
        ['LC Commission Local', N2(c.lcLocal)],
        ['LC Commission Offshore', N2(c.lcOffshore)],
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
      theme: 'grid',
      headStyles: { fillColor: this.primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'right' } },
      margin: { left: 14, right: 14 },
    });
    y = getTableEndY(y) + 6;

    // ----- Container section -----
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...this.primaryColor);
    doc.text('9. Container section', 14, y);
    y += 6;

    const c20 = Number(data.container20) || 0;
    const c40 = Number(data.container40) || 0;
    autoTable(doc, {
      startY: y,
      head: [['Item', '20ft Rate', '20ft Qty', '20ft Total', '40ft Rate', '40ft Qty', '40ft Total']],
      body: [
        ['Clearing', '75,000.00', String(c20), N2(c.clearing20Total), '95,000.00', String(c40), N2(c.clearing40Total)],
        ['Terminal Rent', '145,000.00', String(c20), N2(c.terminal20Total), '225,000.00', String(c40), N2(c.terminal40Total)],
        ['Shipping Demurrage', '155,000.00', String(c20), N2(c.shipping20Total), '275,000.00', String(c40), N2(c.shipping40Total)],
        ['Local Transport', '500,000.00', String(c20), N2(c.transport20Total), '600,000.00', String(c40), N2(c.transport40Total)],
      ],
      theme: 'grid',
      headStyles: { fillColor: this.primaryColor, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        1: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        6: { halign: 'right' },
      },
      margin: { left: 14, right: 14 },
    });
    y = getTableEndY(y) + 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Truck Demurrage: ' + N2(Number(data.truckDemurrage) || 0) + ' ₦', 14, y);
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Total Clearing: ' + N2(c.totalClearing) + ' ₦', 14, y);
    y += 8;

    // ----- Disbursement, GMT, Subtotal, Maintenance, Totals -----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...this.primaryColor);
    doc.text('10–16. Disbursement to VAT', 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [['Description', 'Amount (₦)']],
      body: [
        ['Disbursement', N2(c.disbursement)],
        ['GMT Management Fee', N2(c.gmtFee)],
        ['Sub Total', N2(c.subtotal)],
        ['Maintenance', N2(c.maintenance)],
        ['Total Before VAT', N2(c.totalBeforeVat)],
        ['Interest', N2(c.interest)],
        ['VAT on Total', N2(c.vatOnTotal)],
      ],
      theme: 'grid',
      headStyles: { fillColor: this.primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'right' } },
      margin: { left: 14, right: 14 },
    });
    y = getTableEndY(y) + 8;

    // ----- Final quote (highlighted) -----
    doc.setFillColor(...this.lightGray);
    doc.rect(14, y - 2, pageW - 28, 14, 'F');
    doc.setDrawColor(...this.primaryColor);
    doc.setLineWidth(0.5);
    doc.rect(14, y - 2, pageW - 28, 14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...this.primaryColor);
    doc.text('Total Quote Value (Excl. Ex-Works)', 20, y + 4);
    doc.text(N2(c.finalQuote) + ' ₦', pageW - 20, y + 4, { align: 'right' });
    y += 16;

    // ----- Footer -----
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      'This quotation is valid as per terms. Rates subject to change. All amounts in Nigerian Naira (₦) unless stated.',
      14,
      y + 4
    );
    doc.text('Generated on ' + new Date().toLocaleString(), pageW / 2, y + 8, { align: 'center' });

    doc.save(filename);
  }
}
