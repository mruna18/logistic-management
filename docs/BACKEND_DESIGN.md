# Django Backend Design – Nigeria Import Logistics ERP

## Model Structure

### Company
- id, name, code, address, city, state, country, phone, email
- default_terminal_id (FK), default_port_id (FK)
- regulatory_defaults (JSON: nafdac_required, son_required, default_hs_code_prefix)
- approval_matrix_id (FK)
- is_active, created_at, updated_at

### User
- id, email, password_hash, name, role (enum), company_id (FK)
- is_active, created_at, updated_at

### Role (enum)
ADMIN, MANAGEMENT, FINANCE, CLEARING_AGENT, OPERATIONS, TRANSPORT, CLIENT_VIEW

### ImportOrder
- id, company_id (FK), order_reference, product_type, hs_code, quantity
- container_count, form_m_number, form_m_approved_date, payment_mode (LC/BILLS/DIRECT)
- created_at, updated_at

### Shipment
- id, company_id (FK), import_order_id (FK, nullable)
- shipment_no, client_name, logistic_type, shipment_mode, status (enum)
- eta, etd_india, eta_nigeria, actual_departure, actual_arrival
- vessel_name, shipping_line, tracking_number
- duty_paid_status, container_count, risk_level
- freight_cost, clearing_cost, duty_paid, refunds, total_landed_cost
- created_at, updated_at

### Container
- id, shipment_id (FK), container_number, transporter_names (JSON array)
- allocation_date, delivery_location
- tdo_picked_datetime, truck_gated_in_datetime, loaded_at_terminal_datetime
- gated_out_terminal_datetime, escort_name
- arrived_delivery_location_datetime, offloading_started_datetime, offloading_completed_datetime
- waybill_received_datetime, empty_gate_out_datetime, empty_returned_to_location
- empty_return_datetime, eir_received_datetime, waybill_eir_submitted_datetime
- demurrage_charged, demurrage_days, demurrage_reason
- debit_to_transporter, debit_reason
- created_at, updated_at

### TerminalInfo (shipment-level)
- id, shipment_id (FK), terminal_name, shipping_line, bl_no
- ata, tdo_received, tdo_projected, terminal_valid_till, shipping_valid_till
- last_container_loaded_out, last_empty_return
- refund_applicable, shipping_refund_applicable, refund_applied_date, refund_acknowledgement_date
- shipping_refund_applied_date, shipping_refund_ack_date
- final_invoice_to_be_processed
- created_at, updated_at

### CustomsInfo
- id, shipment_id (FK), custom_release_date
- nafdac_applicable, nafdac_second_stamping_date, nafdac_block_date, nafdac_block_resolved_date
- son_applicable, son_second_stamping_date, son_block_date, son_block_resolved_date
- fecd_submitted_to_office_date
- created_at, updated_at

### RegulatoryInfo
- id, shipment_id (FK), paar_number, paar_received_date
- copy_bl_received, bl_no
- created_at, updated_at

### TransportInfo
- id, shipment_id (FK), tdo_projected, terminal_name, shipping_line, delivery_address
- transporters_allocated (JSON), tdo_received_date
- first_container_loaded_out, last_container_loaded_out
- first_container_delivered, last_container_delivered
- first_empty_return, last_empty_return, complete_eir_received, complete_waybills_received
- indemnity_applicable, indemnity_received_date, docs_submitted_to_invoicing_date
- file_delivery_completed
- created_at, updated_at

### Approval
- id, shipment_id (FK), type (enum), status (PENDING/APPROVED/REJECTED)
- requested_by (FK), requested_at
- approved_by (FK, nullable), approved_at (nullable)
- rejected_by (FK, nullable), rejected_at (nullable)
- remarks, metadata (JSON)
- created_at, updated_at

### Document
- id, shipment_id (FK), type (enum), file_name, file_size, mime_type
- uploaded_by (FK), uploaded_at, version, replaced_at (nullable)
- storage_path (for future S3/local)

### Invoice
- id, shipment_id (FK), invoice_number, amount, status
- created_at, updated_at

### Refund
- id, shipment_id (FK), type (TERMINAL/SHIPPING), amount
- applied_date, acknowledgement_date
- created_at, updated_at

### ActivityLog
- id, shipment_id (FK), user_id (FK), action, description
- section, metadata (JSON), created_at

### Terminal (master)
- id, name, code, port_id (FK), company_id (FK)

### Port (master)
- id, name, code, country

---

## Indexes

- Shipment: status, company_id, created_at
- Container: shipment_id, container_number
- Approval: shipment_id, status, type
- Document: shipment_id, type
- ActivityLog: shipment_id, created_at

---

## Multi-Tenant

- company_id on all tenant-scoped models
- Row-level security: filter by company_id from user session
- Future: tenant schema isolation for SaaS
