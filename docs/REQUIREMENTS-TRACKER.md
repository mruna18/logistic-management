# Nigerian Logistics ERP – Requirements Tracker

This document tracks the 12 major requirement areas from the product specification.

---

## 1. Client Source & Approval Logic

| Requirement | Status | Notes |
|-------------|--------|-------|
| Client from `companies` table only | Pending | Need companies/Client Master module |
| Status: Pending → Management approval → Active | Pending | Approval workflow |
| Only Active clients in File Creation dropdown | Pending | Dropdown driven by approved clients |
| Prevent duplicates, unapproved files, typing errors | Pending | Validation rules |

**Implementation:** Create `companies` / Client Master, approval workflow, and wire client dropdown to approved clients only.

---

## 2. File Status (Controlled State Machine)

| Status | Meaning |
|--------|---------|
| Draft | File created but incomplete |
| Pending Approval | Waiting for management approval |
| Approved | Commercially approved |
| In Operation | Handed to operations |
| Delivered | Shipment delivered |
| Post Clearing | FECD, refund, audit stage |
| Closed | Invoicing completed |

**Current:** `FileStatus` enum has Quoted, Approved, Cancelled.  
**Target:** Replace with above 7-state machine.

---

## 3. File Code Innovation (Brand Identity)

**Format:** `[ClientShort]-[LogisticType]-[ScopeCode]-[YY]-[Sequence]`

**Examples:**
- `DAB-IMP-CLT-25-001`
- `JUB-IMP-D2D-25-002`
- `MAG-IMP-TRK-25-003`

**Scope codes:**

| Code | Meaning |
|------|---------|
| IMP | Import |
| EXP | Export |
| D2D | Door to Door |
| CLT | Clearing + Trucking |
| TRK | Only Trucking |
| DOC | Documentation |
| WRH | Warehouse |

**Implementation:** File code generator service, sequence per client/year.

---

## 4. Service Selection = Operational Instruction

**Service options:** Import, Export, Air Freight, Transport, Bonded, Project Cargo, Documentation

**Logic:** Service selection drives UI and workflow:

- **Trucking only:** Hide shipping, PAAR, duty; show only transport module
- **Door to Door:** Enable all modules

**Implementation:** Dynamic module visibility based on selected services.

---

## 5. Multi-File Dashboard (Client View)

**Client view:** 20+ files status in one view

| File Code | BL | ETA | Current Stage | Delay | Responsible | Remarks |
|-----------|----|-----|---------------|-------|-------------|---------|

**Current Stage:** Auto-calculated from PAAR, duty, customs, delivery status.

**Implementation:** Client dashboard with file summary table.

---

## 6. Automated Morning Email Report

**Schedule:** Every day 5:00–7:00 AM

**For each active client:**
- Fetch all open files
- Pull latest milestone
- Pull delay reason
- Generate summarized table
- Email automatically

**Implementation:** Backend cron job or scheduled task.

---

## 7. KPI Engine (Performance Monitoring)

**Per file:**
- ETA Date
- Document Received Date
- PAAR Date
- Duty Paid Date
- Customs Release Date
- Delivery Date

**Calculations:**
```
Clearance Days = Release Date - ATA
Delivery Days = Delivery Date - Release Date
Total File Days = Delivery Date - ETA
Client Delay = Doc Received - Required Doc Date
```

**Monthly KPI report:**
| Client | Total Files | Avg Clearance | Avg Delivery | Client Delay % |

---

## 8. Nigeria-Specific Post Audit Control

**Per file:**
- Audit Risk Status
- Document Retention Status
- Soft Copy Storage Path
- Hard Copy Location

**Retention:** Form M, PAAR, SGD, FECD, Duty Receipt (10+ years).

**Implementation:** Compliance-grade document archive.

---

## 9. User Roles (RBAC)

| Role | Capabilities |
|------|--------------|
| Management | Approve client, approve file, view margin, view KPIs |
| Sales | Create client, create file, view commercial summary |
| Key Account Manager | Create file, select services, control documentation deadlines, add remarks |
| Operations | Update shipment stages, customs, delivery, delay reasons |
| Finance | Duty payments, invoice creation, payment tracking |

**Constraint:** Operations must NOT see margin or selling price.

---

## 10. Operational vs Commercial Separation

| Module | Content | Visibility |
|--------|---------|------------|
| Operational | Dates, documents, status, milestones | Operations, KAM |
| Commercial | Client selling rate, cost sheet, margin, transport cost, duty advance, refund | Management, Finance, Sales |

**Implementation:** Permission-based access to commercial modules.

---

## 11. Timeline Engine (Future Upgrade)

**Per milestone:**
- Expected Duration
- Actual Duration
- Delay Reason (Client / Customs / Terminal / Shipping)

**Output:** Performance analytics.

**Current:** Performance Control Matrix exists; can extend with delay reasons.

---

## 12. System Identity

**Not:** Simple clearing software

**Is:**
- Logistics workflow engine
- Compliance archive system
- KPI reporting system
- Client reporting automation
- Operational accountability tracker
- Nigeria-optimized logistics ERP

---

## Implementation Priority

| Phase | Priority | Items |
|-------|----------|-------|
| 1 | High | Client Master, File Status state machine, File code generator |
| 2 | High | Service-based workflow, Multi-file dashboard |
| 3 | Medium | KPI engine, RBAC, Operational vs Commercial separation |
| 4 | Medium | Morning email report, Post-audit document control |
| 5 | Future | Timeline engine enhancements |
