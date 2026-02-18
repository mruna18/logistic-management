import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import type { ExportShipmentModel } from '../models/export-shipment.model';

export type ExportSection =
  | 'orderCommercial'
  | 'teamDocumentation'
  | 'transportStuffing'
  | 'inspectionsCustoms'
  | 'terminalShipping'
  | 'documentsClosing';

@Injectable({ providedIn: 'root' })
export class ExportStoreService {
  private readonly dataSubject = new BehaviorSubject<ExportShipmentModel>({
    orderCommercial: null,
    teamDocumentation: null,
    transportStuffing: null,
    inspectionsCustoms: null,
    terminalShipping: null,
    documentsClosing: null,
  });

  readonly exportData$ = this.dataSubject.asObservable();

  private shipmentId = 0;

  loadExportShipment(id: number): void {
    this.shipmentId = id;
    const mock = this.getMockExportData(id);
    this.dataSubject.next(mock);
  }

  /** Load export data from an existing order (e.g. when editing) */
  loadFromData(data: Partial<ExportShipmentModel>): void {
    const current = this.dataSubject.value;
    this.dataSubject.next({ ...current, ...data });
  }

  getExportData(): ExportShipmentModel {
    return this.dataSubject.value;
  }

  updateSection(section: ExportSection, data: unknown): void {
    const current = this.dataSubject.value;
    const patch: Partial<ExportShipmentModel> = { [section]: data };
    this.dataSubject.next({ ...current, ...patch });
  }

  persist(): void {
    const data = this.dataSubject.value;
    // Backend-ready: POST/PUT to /api/shipments/:id/export
    console.log('Export persist (mock):', this.shipmentId, data);
  }

  private getMockExportData(id: number): ExportShipmentModel {
    const now = new Date();
    const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    return {
      orderCommercial: {
        orderNo: `CLE-${ym}-CLI-${String(id).padStart(3, '0')}`,
        fileStatus: 'Quoted',
        fileStatusDate: null,
        approvalMode: 'Approved Quote',
        approvalDate: null,
        pfiNumber: '',
        pfiDate: null,
        supplierName: '',
        buyerName: '',
        containerCount: 1,
        containerType: '',
        productDescription: '',
        hsCode: '',
        quantity: 0,
        value: 0,
        exWorks: 0,
        fob: 0,
        freight: 0,
        cnf: 0,
        marineInsurance: 0,
        totalCif: 0,
        shipmentMode: 'Sea',
        jobType: 'Export',
        scope: [],
        additionalFileDetails: '',
      },
      teamDocumentation: null,
      transportStuffing: {
        stuffingProjected: null,
        shippingLine: '',
        containerType: '',
        stuffingAddress: '',
        transportersAllocated: [],
        firstEmptyLoadedOut: null,
        lastEmptyLoadedOut: null,
        firstEmptyDeliveredToClient: null,
        lastEmptyDeliveredToClient: null,
        firstEmptyStuffedAtClient: null,
        lastEmptyStuffedAtClient: null,
        firstStuffedDepartedFromClient: null,
        lastStuffedDepartedFromClient: null,
        firstStuffedGatedInPol: null,
        lastStuffedGatedInPol: null,
        completeWaybillsReceived: null,
        completeEirReceived: null,
        indemnityApplicable: false,
        indemnityReceivedDate: null,
        docsSubmittedToInvoicingDate: null,
        containers: [],
      },
      inspectionsCustoms: null,
      terminalShipping: null,
      documentsClosing: null,
    };
  }
}
