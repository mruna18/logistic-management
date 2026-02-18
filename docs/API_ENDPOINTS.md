# API Endpoint Structure – Nigeria Import Logistics ERP

## Base URL
`/api/v1/`

## Authentication
- `POST /api/auth/login` – Returns JWT
- `POST /api/auth/refresh` – Refresh token
- `POST /api/auth/logout` – Invalidate token

---

## Companies
- `GET /api/companies` – List (filtered by user company)
- `GET /api/companies/{id}` – Detail
- `PUT /api/companies/{id}` – Update (ADMIN only)
- `GET /api/companies/{id}/terminals` – Terminals for company
- `GET /api/ports` – List ports

---

## Shipments
- `GET /api/shipments` – List (paginated, filterable by status, company)
- `GET /api/shipments/{id}` – Full detail (all sections)
- `POST /api/shipments` – Create
- `PUT /api/shipments/{id}` – Full update
- `PATCH /api/shipments/{id}` – Partial update (section-level)
- `PATCH /api/shipments/{id}/section/{section}` – Update single section (origin, preArrival, terminal, customs, transport, teamDocumentation)
- `POST /api/shipments/{id}/hold` – Set ON_HOLD
- `POST /api/shipments/{id}/close` – Set CLOSED

---

## Containers
- `GET /api/shipments/{id}/containers` – List containers for shipment
- `POST /api/shipments/{id}/containers` – Add container
- `PUT /api/shipments/{id}/containers/{containerId}` – Update container
- `DELETE /api/shipments/{id}/containers/{containerId}` – Remove container

---

## Approvals
- `GET /api/shipments/{id}/approvals` – List approvals (history)
- `POST /api/shipments/{id}/approvals` – Request approval
- `POST /api/approvals/{approvalId}/approve` – Approve
- `POST /api/approvals/{approvalId}/reject` – Reject
- `GET /api/approvals/pending` – Pending approvals (user/role)

---

## Documents
- `GET /api/shipments/{id}/documents` – List documents
- `POST /api/shipments/{id}/documents` – Upload (multipart)
- `PUT /api/shipments/{id}/documents/{docId}` – Replace version
- `GET /api/shipments/{id}/documents/{docId}/download` – Download file

---

## Import Orders
- `GET /api/import-orders` – List
- `GET /api/import-orders/{id}` – Detail
- `POST /api/import-orders` – Create
- `PUT /api/import-orders/{id}` – Update

---

## Dashboard
- `GET /api/dashboard/kpis` – KPIs (active shipments, containers, demurrage, refund, approval, revenue, avg clearance)
- `GET /api/dashboard/shipment-status` – Status distribution
- `GET /api/dashboard/terminal-performance` – Terminal performance
- `GET /api/dashboard/clearance-sla` – Clearance SLA
- `GET /api/dashboard/recent-shipments` – Recent shipments

---

## Finance
- `GET /api/shipments/{id}/finance` – Finance summary
- `GET /api/finance/payments` – Payments list
- `GET /api/finance/total-cost` – Total cost

---

## Activity Log
- `GET /api/shipments/{id}/activity` – Activity timeline

---

## Response Format
```json
{
  "data": { ... },
  "meta": { "page": 1, "perPage": 20, "total": 100 },
  "errors": []
}
```

## Error Format
```json
{
  "errors": [{ "code": "VALIDATION_ERROR", "message": "...", "field": "..." }]
}
```
