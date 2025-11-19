# Process & Compliance Backlog

_Last updated: 2025-11-19_

## P0 – Platform Plumbing (Closed)
These items are now enforced in code and infra. Keep them on the radar for regression tests:

- **Secrets & Env Controls:** Runtime now refuses to boot without `JWT_SECRET`, `AWS_REGION`, and `AWS_S3_BUCKET`. Frontend build requires explicit auth config.
- **Persistence:** UI is routed exclusively through the API + Postgres stack (see `useRFP` + `RFPList`/`RealRFPProcess`). No Firebase or mock queues remain.

## Process Lifecycle Backlog
| Epic | Description | Acceptance Criteria | Owners |
|------|-------------|---------------------|--------|
| **Pre-Qualification** | Auto questionnaires, scoring, and guard-rail gating before intake. | Weighted scorecards, dynamic questionnaires per vertical, `no-bid` gating API. | Sales Ops + Presales |
| **Risk Assessment Workflow** | Inline legal/finance/tech risk capture tied to go/no-go. | Stage-specific risk register, risk labels stored in Postgres, dashboards in UI. | Legal, Finance, Tech SMEs |
| **Bid/No-Bid Committee** | Voting workflow with quorum, delegation, and audit log. | Committee roster per tenant, rule-based quorum, escalation and reminders. | Sales Leadership |
| **Iterative Proposal Reviews** | Multi-round review cycles w/ version diffs and comments. | Proposal versions, structured feedback threads, approvals per round. | Proposal Office |
| **Client Communication Tracking** | Timeline of emails/calls and action items. | API hooks for CRM/email integrations, UI timeline, SLA reminders. | RevOps |
| **Contract Negotiation & Win/Loss** | Extend lifecycle through negotiation + structured retros. | Negotiation stage data model, win/loss templates, analytics feed. | Legal + PMO |

## Compliance & Governance Backlog
| Capability | Scope | Definition of Done |
|------------|-------|--------------------|
| **Audit Trail** | Capture every stage change, approval, file action. | Append-only audit tables, API filters, export to CSV/Splunk. |
| **Retention & Data Residency** | Policy-based deletion/anonymization. | Tenant-level retention policies, background janitor jobs, residency metadata. |
| **GDPR/Privacy Controls** | Export + erase workflows. | Self-service data export, DSR tracking, automated redaction flows. |
| **Consent & Regulatory Reporting** | Capture consent + generate compliance packs. | Consent ledger, templated regulatory exports (SOC2/GDPR/CCPA). |
| **Advanced Approvals** | Multi-level, conditional, delegated approvals w/ expirations. | Rule engine for approvals, delegation assignments, SLA + escalation notifications. |
| **Collaboration Suite** | Comments, @mentions, threads, activity feeds, diffing. | Real-time comment service, mention notifications, version diff viewer, audit tie-in. |
| **Integration Fabric** | CRM (SFDC/HubSpot), email (O365/Gmail), calendar, chat, DocuSign, ERP. | Connector framework, per-tenant OAuth storage, sync jobs, observability dashboards. |

## P1/P2 Execution Sequencing
| Priority | Theme | Backlog Items |
|----------|-------|---------------|
| **P1** | **AI Assistants** | Externalize prompt templates, add OpenAI/Claude provider module, persistence for AI outputs, guardrails + bias logging. |
| **P1** | **Realtime & Presence** | WebSocket service (Socket.io/Nest), presence channels per RFP, live notification center, optimistic UI helpers. |
| **P1** | **Validation & Forms** | Zod schema library (`src/schemas`), react-hook-form adapters, shared error messaging + translations, API contract validators. |
| **P1** | **Telemetry & Monitoring** | Sentry for FE/BE, request logging middleware, performance budgets, incident dashboards (PagerDuty/New Relic). |
| **P2** | **Testing Infrastructure** | Vitest unit harness, RTL component tests, Playwright e2e flows for intake→submission, CI gates in GitHub Actions. |
| **P2** | **Analytics & Reporting** | KPI dashboards backed by materialized views, export scheduler, anomaly detection alerts. |

### Immediate Next Sprint
1. Finalize detailed specs for **Pre-Qualification**, **Risk Assessment**, and **Audit Trail** with UX + data contracts.
2. Stand up **AI platform abstraction** (provider drivers + prompt registry) so individual bots plug in without duplicate code.
3. Kick off **Realtime service spike** to validate infra choice and cost envelope.
4. Create **Zod schema package** (`src/schemas`) and convert Intake + Go/No-Go forms as reference implementations.
5. Scaffold **Vitest + Playwright** configs with sample tests to unblock future story work.
6. Wire **Sentry** (frontend + API) with environment-aware DSNs and deploy health checks.
