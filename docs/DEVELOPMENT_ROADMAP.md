# Nigeria Import Logistics ERP – Development Roadmap

## Phase 1: Frontend Shipment Lifecycle (Current)
- [x] Shipment store with BehaviorSubject
- [x] 7-window shipment detail (Overview, Origin, Pre-Arrival, Terminal, Customs, Transport, Team & Documentation)
- [x] State engine (computeShipmentStatus)
- [x] Container aggregation
- [x] Auto field connections (BL No, TDO Projected, last loaded out, last empty return)
- [x] Refund eligibility logic
- [x] Final invoice trigger
- [x] Approval engine (frontend simulation)
- [x] Role access service (simulation)
- [x] Dashboard with KPIs and charts

## Phase 2: Finance + Refund + Dashboard Enhancement
- [ ] Finance module: duty draft, DN received, DN paid, validity dates
- [ ] Refund tracking UI (terminal + shipping)
- [ ] Demurrage approval flow
- [ ] File close approval flow
- [ ] Dashboard: approval pending widget, refund pending widget
- [ ] Company management UI (settings, terminal mapping)
- [ ] Document management UI (upload, replace, list)

## Phase 3: Django Backend Implementation
- [ ] Django project setup
- [ ] PostgreSQL + migrations
- [ ] JWT authentication
- [ ] Company, User, Role models
- [ ] Shipment, Container, TerminalInfo, CustomsInfo, TransportInfo models
- [ ] DRF serializers and viewsets
- [ ] API endpoints (per API_ENDPOINTS.md)
- [ ] Replace mock services with HTTP client
- [ ] NgRx or keep BehaviorSubject + HTTP

## Phase 4: Multi-Company SaaS
- [ ] Tenant isolation (company_id or schema)
- [ ] Subscription / billing logic
- [ ] Company onboarding flow
- [ ] Role-based API filtering
- [ ] Audit logging

## Milestones
- **M1**: Phase 1 complete – Full frontend mock
- **M2**: Phase 2 complete – Finance, approval, document UI
- **M3**: Phase 3 complete – Backend live, API integrated
- **M4**: Phase 4 complete – Multi-tenant SaaS
