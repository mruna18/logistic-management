# Nigeria Import Logistics ERP – Architecture

## 1. Angular Folder Structure

```
src/app/
├── core/
│   ├── enums/
│   │   ├── role.enum.ts
│   │   ├── approval-type.enum.ts
│   │   ├── shipment-status.enum.ts
│   │   └── document-type.enum.ts
│   ├── models/
│   │   ├── company.model.ts
│   │   ├── user.model.ts
│   │   ├── approval.model.ts
│   │   └── document.model.ts
│   ├── services/
│   │   ├── approval-engine.service.ts
│   │   ├── role-access.service.ts
│   │   ├── company.service.ts
│   │   ├── document-mock.service.ts
│   │   ├── dashboard.service.ts
│   │   └── mock-data.service.ts
│   ├── guards/
│   │   └── role.guard.ts (future)
│   └── utils/
│       └── date.utils.ts (future)
├── features/
│   ├── dashboard/
│   ├── companies/
│   ├── import-orders/
│   ├── shipments/
│   │   ├── shipment-detail/
│   │   │   ├── components/
│   │   │   │   ├── overview/
│   │   │   │   ├── origin-details/
│   │   │   │   ├── pre-arrival/
│   │   │   │   ├── terminal-shipping/
│   │   │   │   ├── customs-regulatory/
│   │   │   │   ├── transport-delivery/
│   │   │   │   ├── team-documentation/
│   │   │   │   ├── approval/
│   │   │   │   └── activity-log-panel/
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   │   ├── shipment-store.service.ts
│   │   │   │   ├── shipment-status-engine.service.ts
│   │   │   │   └── shipment-state-machine.service.ts
│   │   │   └── shipment-detail.component.ts
│   │   └── shipment-list/
│   ├── finance/
│   ├── documents/
│   ├── clearance/
│   └── delivery/
└── shared/
    ├── components/
    ├── pipes/
    └── directives/
```

## 2. Shipment Store Architecture

**ShipmentStoreService** – Centralized BehaviorSubject store.

- `shipment$: Observable<Shipment | null>`
- `getShipment(): Shipment | null`
- `loadShipment(id): void`
- `loadFromDetail(detail): void`
- `updateSection(section, data): void`
- `recalculateState(): void`
- `computeDerivedFields(shipment): void`
- `setOnHold(flag): void`
- `setClosed(): void`

**Data flow:** Child form emits → `updateSection()` → `computeDerivedFields()` → `computeShipmentStatus()` → push to `shipment$` → all windows update.

## 3. State Machine

**States:** DRAFT, ORIGIN_IN_PROGRESS, IN_TRANSIT, PRE_ARRIVAL_PROCESSING, ARRIVED_AT_PORT, UNDER_CLEARANCE, DELIVERING, PORT_CYCLE_COMPLETED, READY_FOR_INVOICE, INVOICED, CLOSED, ON_HOLD

**Transitions:**
- Origin ATD → IN_TRANSIT
- Terminal ATA → ARRIVED_AT_PORT
- Customs release → UNDER_CLEARANCE / DELIVERING
- First container gated out → DELIVERING
- All containers empty returned → PORT_CYCLE_COMPLETED
- Documents submitted → READY_FOR_INVOICE
- Approval pending → ON_HOLD

## 4. Approval Engine

**ApprovalEngineService** – Frontend-only approval simulation.

- `requestApproval(request): Observable<Approval>`
- `getApprovalsForShipment(id): Approval[]`
- `getPendingForShipment(id): Approval[]`
- `hasPendingApproval(id, type?): boolean`
- `approve(id, remarks?): Observable<Approval | null>`
- `reject(id, remarks): Observable<Approval | null>`
- `getApprovalHistory(id): Approval[]`

**Types:** DUTY_DRAFT, REFUND, DEMURRAGE, FILE_CLOSE

## 5. Role & Access (Simulation)

**RoleAccessService** – Section-level edit and approval rights.

- `setRole(role): void`
- `canEditSection(section): boolean`
- `canApprove(type): boolean`
- `canCloseFile(): boolean`

**Roles:** ADMIN, MANAGEMENT, FINANCE, CLEARING_AGENT, OPERATIONS, TRANSPORT, CLIENT_VIEW
