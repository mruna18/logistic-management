# Scalability Strategy – Nigeria Import Logistics ERP

## Frontend

### Architecture
- **Lazy loading**: Shipment detail, Import orders, Finance, Documents
- **OnPush**: All components
- **trackBy**: All *ngFor (container tables, lists)
- **Section-level updates**: No full object replacement; patch only changed sections
- **Debounce**: Auto recalculation (100ms)

### State Management
- **Current**: BehaviorSubject + RxJS
- **Future**: NgRx if complexity grows (approvals, multi-company, real-time)
- **Adapter pattern**: ShipmentStoreAdapterService for API ↔ Store conversion

### Performance
- Virtual scrolling for large container lists (CDK)
- Pagination for shipment list, dashboard
- Indexed DB for offline caching (future)

---

## Backend

### Database
- **PostgreSQL**: ACID, JSON, full-text search
- **Indexes**: status, company_id, created_at on all list queries
- **Partitioning**: ActivityLog by month (future)

### API
- **Pagination**: Cursor or offset
- **Filtering**: Query params (status, company, date range)
- **Section PATCH**: `/shipments/{id}/section/{section}` – atomic updates

### Caching
- **Redis**: Session, KPI cache (5 min TTL)
- **ETag**: Conditional GET for shipment detail

### Async
- **Celery**: Document processing, email notifications, report generation
- **Webhooks**: Status change notifications

---

## Multi-Tenant

### Phase 1
- Row-level: `company_id` on all models
- Middleware: Inject company from JWT

### Phase 2
- Schema-per-tenant (PostgreSQL)
- Connection pool per tenant

### Phase 3
- Database-per-tenant for large clients

---

## Deployment

- **Frontend**: CDN, static hosting (Vercel, Netlify, S3+CloudFront)
- **Backend**: Container (Docker), orchestration (K8s, ECS)
- **Database**: Managed PostgreSQL (RDS, Cloud SQL)
- **Files**: S3 / GCS for documents

---

## Monitoring

- **APM**: Application performance monitoring
- **Logging**: Structured logs (JSON)
- **Alerts**: Demurrage risk, approval pending, SLA breach
