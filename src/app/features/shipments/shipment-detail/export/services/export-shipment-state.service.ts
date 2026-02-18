import { Injectable } from '@angular/core';
import { ExportShipmentStatus, EXPORT_STATUS_LABELS } from '../export-state.enum';
import type { ExportShipmentModel } from '../models/export-shipment.model';

/**
 * Export State Machine - computes status from dates and events
 * Backend-ready: transitions can be validated server-side
 */
@Injectable({ providedIn: 'root' })
export class ExportShipmentStateService {
  computeStatus(exportData: ExportShipmentModel | null): ExportShipmentStatus {
    if (!exportData) return ExportShipmentStatus.DRAFT;

    const order = exportData.orderCommercial;
    const team = exportData.teamDocumentation;
    const transport = exportData.transportStuffing;
    const customs = exportData.inspectionsCustoms;
    const terminal = exportData.terminalShipping;
    const closing = exportData.documentsClosing;

    if (closing?.allCompleteDocsSubmittedToInvoicingDateTime && team?.fileCloseSubmittedForInvoicingDate) {
      return ExportShipmentStatus.CLOSED;
    }
    if (closing?.allCompleteDocsSubmittedToInvoicingDateTime) {
      return ExportShipmentStatus.READY_FOR_INVOICE;
    }
    if (terminal?.oblSubmittedToInvoicingDateTime) {
      return ExportShipmentStatus.SAILED;
    }
    if (customs?.exportReleaseDocsToShippingLineDateTime) {
      return ExportShipmentStatus.CLEARED_FOR_LOADING;
    }
    if (customs?.applicationForInspectionByCustomsDateTime || customs?.dtiPrepareSgdDateTime) {
      return ExportShipmentStatus.UNDER_CUSTOMS;
    }
    const lastGateIn = transport?.lastStuffedGatedInPol;
    if (lastGateIn) {
      return ExportShipmentStatus.AT_PORT;
    }
    const firstStuffed = transport?.firstEmptyStuffedAtClient;
    if (firstStuffed) {
      return ExportShipmentStatus.STUFFING_IN_PROGRESS;
    }
    if (this.hasPlanningDocs(team)) {
      return ExportShipmentStatus.PLANNING;
    }
    if (order?.orderNo) {
      return ExportShipmentStatus.DRAFT;
    }

    return ExportShipmentStatus.DRAFT;
  }

  private hasPlanningDocs(team: ExportShipmentModel['teamDocumentation']): boolean {
    if (!team) return false;
    return !!(
      team.nxpNo ||
      team.bookingNo ||
      team.shippingLineName ||
      team.emptyPickupYard ||
      team.inspectionAgencyName
    );
  }

  getStatusLabel(status: ExportShipmentStatus): string {
    return EXPORT_STATUS_LABELS[status] ?? String(status);
  }

  getStatusBadgeClass(status: ExportShipmentStatus): string {
    switch (status) {
      case ExportShipmentStatus.DRAFT:
        return 'bg-secondary';
      case ExportShipmentStatus.PLANNING:
        return 'bg-info';
      case ExportShipmentStatus.STUFFING_IN_PROGRESS:
        return 'bg-warning text-dark';
      case ExportShipmentStatus.AT_PORT:
        return 'bg-primary';
      case ExportShipmentStatus.UNDER_CUSTOMS:
        return 'bg-warning text-dark';
      case ExportShipmentStatus.CLEARED_FOR_LOADING:
        return 'bg-info';
      case ExportShipmentStatus.SAILED:
        return 'bg-success';
      case ExportShipmentStatus.DOCUMENTATION_PENDING:
        return 'bg-warning text-dark';
      case ExportShipmentStatus.READY_FOR_INVOICE:
        return 'bg-success';
      case ExportShipmentStatus.CLOSED:
        return 'bg-dark';
      case ExportShipmentStatus.ON_HOLD:
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
}
