import { Injectable } from '@angular/core';
import {
  ShipmentState,
  OperationalWindow,
  WINDOW_ORDER,
  ShipmentStateContext,
  StateTransitionGuard,
} from '../models/shipment-state-machine.model';
import type { ShipmentDetail, ShipmentStatus } from '../models/shipment-detail.model';

@Injectable({
  providedIn: 'root',
})
export class ShipmentStateMachineService {
  computeState(s: ShipmentDetail): ShipmentState {
    if (s.status === 'Closed') return 'Closed';

    const origin = s.originDetails;
    const preArrival = s.preArrival;
    const terminal = s.terminalShipping;
    const customs = s.customsRegulatory;
    const transport = s.transportDelivery;

    const originIncomplete =
      !origin ||
      !origin.etd ||
      !origin.atd ||
      !origin.readinessEstimatedDate ||
      !origin.goodsCollectionBy;
    if (originIncomplete) return 'Draft';

    const paarPending =
      !preArrival ||
      !preArrival.paarReceivedDate ||
      !preArrival.copyBLReceived ||
      !preArrival.blNo?.trim();
    if (paarPending) return 'PreArrival';

    const dutyUnpaid = s.dutyPaidStatus === 'Unpaid' || s.dutyPaidStatus === 'Partial';
    if (dutyUnpaid) return 'AwaitingPayment';

    const terminalIncomplete =
      !terminal ||
      !terminal.ata ||
      !terminal.terminalName ||
      !terminal.tdoReceived;
    if (terminalIncomplete) return 'Terminal';

    const customsNotReleased = !customs?.customReleaseDate;
    if (customsNotReleased) return 'Customs';

    const nafdacBlocked =
      customs?.nafdacApplicable &&
      (!customs.nafdacSecondStampingDate ||
        (customs.nafdacBlockDate && !customs.nafdacBlockResolvedDate));
    const sonBlocked =
      customs?.sonApplicable &&
      (!customs.sonSecondStampingDate ||
        (customs.sonBlockDate && !customs.sonBlockResolvedDate));
    const fecdIncomplete = !customs?.fecdSubmittedToOfficeDate;
    if (nafdacBlocked || sonBlocked || fecdIncomplete) return 'Compliance';

    const delivered =
      transport?.fileDeliveryCompleted === true || transport?.lastContainerDelivered != null;
    if (!delivered) return 'Transport';

    const terminalRefundPending =
      terminal?.refundApplicable &&
      (!terminal.refundAppliedDate || !terminal.refundAcknowledgementDate);
    const shippingRefundPending =
      terminal?.shippingRefundApplicable &&
      (!terminal.shippingRefundAppliedDate || !terminal.shippingRefundAckDate);
    if (terminalRefundPending || shippingRefundPending) return 'RefundPending';

    return 'Invoicing';
  }

  computeContext(s: ShipmentDetail): ShipmentStateContext {
    const state = this.computeState(s);
    const terminal = s.terminalShipping;
    const customs = s.customsRegulatory;

    const fecdComplete = !!(customs?.fecdSubmittedToOfficeDate);
    const refundTracked = this.isRefundTracked(s);
    const complianceComplete =
      !this.isNafdacBlocked(s) && !this.isSonBlocked(s) && fecdComplete;

    const nextRequiredWindow = this.getNextRequiredWindow(state, s);

    const stuckStates: ShipmentState[] = ['AwaitingPayment', 'Compliance', 'RefundPending'];
    const isStuck = stuckStates.includes(state);

    const canEditWindow = (window: OperationalWindow): boolean => {
      if (state === 'Closed') return false;
      const windowIndex = WINDOW_ORDER.indexOf(window);
      const currentIndex = this.getStateWindowIndex(state);
      if (windowIndex <= currentIndex) return true;
      if (isStuck) return false;
      return windowIndex === currentIndex + 1;
    };

    const isWindowLocked = (window: OperationalWindow): boolean => {
      if (state === 'Closed') return true;
      const windowIndex = WINDOW_ORDER.indexOf(window);
      const currentIndex = this.getStateWindowIndex(state);
      if (windowIndex <= currentIndex) return false;
      if (isStuck) return true;
      return windowIndex > currentIndex + 1;
    };

    return {
      state,
      canEditWindow,
      isWindowLocked,
      nextRequiredWindow,
      fecdComplete,
      refundTracked,
      complianceComplete,
    };
  }

  validateTransition(
    s: ShipmentDetail,
    update: {
      originDetails?: unknown;
      preArrival?: unknown;
      terminalShipping?: unknown;
      customsRegulatory?: unknown;
      transportDelivery?: unknown;
    }
  ): StateTransitionGuard {
    const state = this.computeState(s);

    if (state === 'Closed') {
      return { canTransition: false, reason: 'Shipment is closed' };
    }

    if (update.originDetails !== undefined) {
      if (state !== 'Draft' && state !== 'Origin') {
        return { canTransition: true };
      }
    }

    if (update.preArrival !== undefined) {
      if (state === 'Draft') {
        return { canTransition: false, reason: 'Complete Origin Details first' };
      }
    }

    if (update.terminalShipping !== undefined) {
      if (state === 'Draft' || state === 'Origin' || state === 'PreArrival') {
        return { canTransition: false, reason: 'Complete Pre-Arrival and pay duty first' };
      }
      if (state === 'AwaitingPayment') {
        return { canTransition: false, reason: 'Duty payment required before Terminal' };
      }
    }

    if (update.customsRegulatory !== undefined) {
      if (
        state === 'Draft' ||
        state === 'Origin' ||
        state === 'PreArrival' ||
        state === 'AwaitingPayment' ||
        state === 'Terminal'
      ) {
        return { canTransition: false, reason: 'Complete Terminal & Shipping first' };
      }
    }

    if (update.transportDelivery !== undefined) {
      if (
        state === 'Draft' ||
        state === 'Origin' ||
        state === 'PreArrival' ||
        state === 'AwaitingPayment' ||
        state === 'Terminal' ||
        state === 'Customs' ||
        state === 'Compliance'
      ) {
        return { canTransition: false, reason: 'Complete Customs & Regulatory compliance first' };
      }
    }

    return { canTransition: true };
  }

  mapStateToShipmentStatus(state: ShipmentState): ShipmentStatus {
    const map: Record<ShipmentState, ShipmentStatus> = {
      Draft: 'Draft',
      Origin: 'In Progress',
      PreArrival: 'Pre Arrival',
      AwaitingPayment: 'Awaiting Payment',
      Terminal: 'At Terminal',
      Customs: 'Cleared',
      Compliance: 'Compliance Pending',
      Transport: 'In Transit',
      Delivered: 'Delivered',
      RefundPending: 'Refund Pending',
      Invoicing: 'Invoicing',
      Closed: 'Closed',
    };
    return map[state];
  }

  private isRefundTracked(s: ShipmentDetail): boolean {
    const t = s.terminalShipping;
    if (!t) return true;
    const terminalOk =
      !t.refundApplicable || !!(t.refundAppliedDate && t.refundAcknowledgementDate);
    const shippingOk =
      !t.shippingRefundApplicable ||
      !!(t.shippingRefundAppliedDate && t.shippingRefundAckDate);
    return terminalOk && shippingOk;
  }

  private isNafdacBlocked(s: ShipmentDetail): boolean {
    const c = s.customsRegulatory;
    if (!c?.nafdacApplicable) return false;
    if (c.nafdacBlockDate && !c.nafdacBlockResolvedDate) return true;
    return !c.nafdacSecondStampingDate;
  }

  private isSonBlocked(s: ShipmentDetail): boolean {
    const c = s.customsRegulatory;
    if (!c?.sonApplicable) return false;
    if (c.sonBlockDate && !c.sonBlockResolvedDate) return true;
    return !c.sonSecondStampingDate;
  }

  private getStateWindowIndex(state: ShipmentState): number {
    const map: Record<ShipmentState, number> = {
      Draft: 0,
      Origin: 1,
      PreArrival: 2,
      AwaitingPayment: 2,
      Terminal: 3,
      Customs: 4,
      Compliance: 4,
      Transport: 5,
      Delivered: 5,
      RefundPending: 5,
      Invoicing: 6,
      Closed: 6,
    };
    return map[state];
  }

  private getNextRequiredWindow(
    state: ShipmentState,
    _s: ShipmentDetail
  ): OperationalWindow | null {
    if (state === 'Closed') return null;
    const next: Record<ShipmentState, OperationalWindow | null> = {
      Draft: 'Origin',
      Origin: 'PreArrival',
      PreArrival: 'PreArrival',
      AwaitingPayment: 'PreArrival',
      Terminal: 'Customs',
      Customs: 'Customs',
      Compliance: 'Customs',
      Transport: 'Transport',
      Delivered: 'Invoicing',
      RefundPending: 'Terminal',
      Invoicing: 'Invoicing',
      Closed: null,
    };
    return next[state];
  }
}
