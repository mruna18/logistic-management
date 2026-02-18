import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Role } from '../enums/role.enum';

export type ShipmentSection =
  | 'overview'
  | 'origin'
  | 'preArrival'
  | 'terminal'
  | 'customs'
  | 'transport'
  | 'teamDocumentation'
  | 'approvals'
  | 'finance';

@Injectable({
  providedIn: 'root',
})
export class RoleAccessService {
  private currentRole = new BehaviorSubject<Role>(Role.OPERATIONS);

  readonly currentRole$ = this.currentRole.asObservable();

  setRole(role: Role): void {
    this.currentRole.next(role);
  }

  getRole(): Role {
    return this.currentRole.value;
  }

  canEditSection(section: ShipmentSection): boolean {
    const role = this.currentRole.value;
    if (role === Role.ADMIN) return true;
    if (role === Role.CLIENT_VIEW) return false;

    const editable: Record<Role, ShipmentSection[]> = {
      [Role.MANAGEMENT]: ['overview', 'origin', 'preArrival', 'terminal', 'customs', 'transport', 'teamDocumentation', 'approvals', 'finance'],
      [Role.FINANCE]: ['finance', 'approvals'],
      [Role.CLEARING_AGENT]: ['origin', 'preArrival', 'terminal', 'customs', 'transport', 'teamDocumentation'],
      [Role.OPERATIONS]: ['overview', 'origin', 'preArrival', 'terminal', 'customs', 'transport', 'teamDocumentation'],
      [Role.TRANSPORT]: ['transport'],
      [Role.CLIENT_VIEW]: [],
      [Role.ADMIN]: [],
    };

    return (editable[role] ?? []).includes(section);
  }

  canApprove(type: string): boolean {
    const role = this.currentRole.value;
    if (role === Role.ADMIN || role === Role.MANAGEMENT) return true;
    if (role === Role.FINANCE && (type === 'DUTY_DRAFT' || type === 'REFUND' || type === 'DEMURRAGE')) return true;
    return false;
  }

  canCloseFile(): boolean {
    const role = this.currentRole.value;
    return role === Role.ADMIN || role === Role.MANAGEMENT || role === Role.FINANCE;
  }
}
