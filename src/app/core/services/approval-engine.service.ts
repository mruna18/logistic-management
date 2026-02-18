import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Approval, ApprovalRequest } from '../models/approval.model';
import { ApprovalType } from '../enums/approval-type.enum';

@Injectable({
  providedIn: 'root',
})
export class ApprovalEngineService {
  private readonly approvalsByShipment = new Map<number, Approval[]>();
  private readonly pendingSubject = new BehaviorSubject<Approval[]>([]);

  readonly pendingApprovals$ = this.pendingSubject.asObservable();

  requestApproval(request: ApprovalRequest): Observable<Approval> {
    const approval: Approval = {
      id: Date.now(),
      shipmentId: request.shipmentId,
      type: request.type,
      status: 'PENDING',
      requestedBy: 1,
      requestedAt: new Date().toISOString(),
      approvedBy: null,
      approvedAt: null,
      rejectedBy: null,
      rejectedAt: null,
      remarks: null,
      metadata: request.metadata ?? {},
    };

    const list = this.approvalsByShipment.get(request.shipmentId) ?? [];
    list.push(approval);
    this.approvalsByShipment.set(request.shipmentId, list);
    this.emitPending();
    return of(approval);
  }

  getApprovalsForShipment(shipmentId: number): Approval[] {
    return this.approvalsByShipment.get(shipmentId) ?? [];
  }

  getPendingForShipment(shipmentId: number): Approval[] {
    return this.getApprovalsForShipment(shipmentId).filter((a) => a.status === 'PENDING');
  }

  hasPendingApproval(shipmentId: number, type?: ApprovalType): boolean {
    const pending = this.getPendingForShipment(shipmentId);
    return type ? pending.some((a) => a.type === type) : pending.length > 0;
  }

  approve(approvalId: number, remarks?: string): Observable<Approval | null> {
    const approval = this.findApproval(approvalId);
    if (!approval || approval.status !== 'PENDING') return of(null);

    approval.status = 'APPROVED';
    approval.approvedBy = 1;
    approval.approvedAt = new Date().toISOString();
    approval.remarks = remarks ?? null;
    this.emitPending();
    return of(approval);
  }

  reject(approvalId: number, remarks: string): Observable<Approval | null> {
    const approval = this.findApproval(approvalId);
    if (!approval || approval.status !== 'PENDING') return of(null);

    approval.status = 'REJECTED';
    approval.rejectedBy = 1;
    approval.rejectedAt = new Date().toISOString();
    approval.remarks = remarks;
    this.emitPending();
    return of(approval);
  }

  getApprovalHistory(shipmentId: number): Approval[] {
    return [...(this.approvalsByShipment.get(shipmentId) ?? [])].sort(
      (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );
  }

  private findApproval(id: number): Approval | undefined {
    for (const list of this.approvalsByShipment.values()) {
      const found = list.find((a) => a.id === id);
      if (found) return found;
    }
    return undefined;
  }

  private emitPending(): void {
    const all: Approval[] = [];
    for (const list of this.approvalsByShipment.values()) {
      all.push(...list.filter((a) => a.status === 'PENDING'));
    }
    this.pendingSubject.next(all);
  }
}
