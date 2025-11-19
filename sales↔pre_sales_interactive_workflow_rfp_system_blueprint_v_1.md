# 🎯 Goal
Design a **standard, interactive operating model** between **Sales** and **Pre‑Sales** inside the RFP system, covering: workflow, SLAs/KPIs, backend configuration (workflow & forms), and frontend UX patterns. Bilingual labels (EN/AR) provided where relevant.

---

## 1) Roles & RBAC (Who does what?)
| Role | Core Responsibilities | Key Permissions (RBAC Scopes) |
|---|---|---|
| **Sales Rep** (مندوب المبيعات) | Lead intake, tender discovery, initial go/no‑go | `rfp.read`, `rfp.create`, `go_no_go.submit`, `clarification.raise`, `proposal.view` |
| **Sales Manager** (مدير المبيعات) | Approvals, margin guardrails, resource assignment | `approval.sales.sign`, `pricing.guardrail.set`, `team.assign` |
| **Pre‑Sales Lead** (قائد ما قبل البيع) | Solution strategy, task orchestration, final technical signoff | `solution.plan`, `task.assign`, `proposal.tech_signoff` |
| **Solution Architect** | Architecture, BoQ, compliance mapping | `boq.edit`, `arch.review`, `compliance.map` |
| **Pricing/Finance** (المالية) | Costing, price book, discounts | `pricing.model`, `discount.request`, `approval.finance.sign` |
| **Legal/Contracts** (العقود) | Ts&Cs, deviations, redlines | `legal.clauses`, `deviation.register`, `approval.legal.sign` |
| **Compliance/GRC** | PDPL/NCA/SAMA alignment | `compliance.review`, `evidence.attach`, `approval.grc.sign` |
| **PMO** | SLA monitoring, dashboards | `kpi.view`, `sla.override`, `report.publish` |

> Map these scopes to your IdP groups (AAD/Keycloak/Okta). Use role‑based UI to show/hide actions.

---

## 2) End‑to‑End Process (Swimlanes)
**Swimlanes:** Sales → Pre‑Sales → Finance → Legal → Compliance → PMO

1) **Intake** (Sales)
- Create RFP → attach notice/docs → pick category/BU → auto‑create timeline
- Trigger **Go/No‑Go** questionnaire (weighted scoring)

2) **Team & Plan** (Sales Manager + Pre‑Sales Lead)
- Assign Pre‑Sales, SA, Writer → define work‑packages & deadlines
- Generate **RACI** & share kick‑off notes

3) **Solutioning** (Pre‑Sales)
- Architecture draft → Compliance mapping → BoQ/Options
- Raise **Clarifications** to buyer with SLA

4) **Pricing** (Finance)
- Cost model → margin → discount request → approval if threshold

5) **Proposal Build** (Pre‑Sales + Writer)
- Compose technical + commercial volumes → versioning → checklists

6) **Reviews & Approvals**
- Technical signoff → Commercial signoff → Legal redlines → Compliance signoff → Sales manager final

7) **Submission & Post‑Bid**
- Package & submit → log receipt → manage Q&A/BAFO → decision → **Handover** if won → **Win/Loss** analysis if lost

---

## 3) State Machine (RFP.status)
| State | Allowed Transitions | Guards/Notes |
|---|---|---|
| `intake` | → `go_no_go` | Tender created, basic metadata present |
| `go_no_go` | → `planning` or `abandoned` | Score ≥ threshold to proceed |
| `planning` | → `solutioning` | Team assigned, timeline set |
| `solutioning` | → `pricing` | Architecture & compliance draft complete |
| `pricing` | → `proposal_build` | BoQ costed, target price set |
| `proposal_build` | → `approvals` | Volumes compiled, complete checklist |
| `approvals` | → `submission` | All required signoffs captured |
| `submission` | → `post_bid` | Proof of submission attached |
| `post_bid` | → `won` / `lost` / `cancelled` | Outcome recorded |

**Transition Rules (examples):**
- `approvals → submission` requires `approval.tech=Y` `approval.finance=Y` `approval.legal=Y` `approval.grc=Y`.
- SLA timers auto‑escalate to PMO if overdue.

---

## 4) SLAs & KPIs
**SLAs (per RFP):**
- Clarification response ≤ **48h**
- Internal review per volume ≤ **24h**
- Legal turnaround ≤ **72h** unless deviations
- Compliance evidence mapping ≤ **48h**

**Core KPIs (org level):** Cycle Time, Prep Time, On‑Time %, Compliance %, Participation, Single‑Bid %, Clarification SLA Met, Evaluation SLA Met, Savings %, Eval Consistency, Local Supplier % (كما تم تعريفها سابقًا).

---

## 5) Backend Workflow Configuration (YAML)
```yaml
version: 1
workflows:
  rfp_standard:
    entity: rfp
    states:
      intake:
        on_enter: [create_timeline, notify.pmo]
        transitions:
          go_no_go: { guard: has_required_fields }
      go_no_go:
        form: go_no_go_form
        transitions:
          planning: { guard: score >= 70 }
          abandoned: {}
      planning:
        actions: [assign_team, generate_raci]
        transitions:
          solutioning: { guard: team_assigned }
      solutioning:
        tasks: [arch_draft, compliance_map, boq_build]
        transitions:
          pricing: { guard: deliverables.arch && deliverables.compliance && deliverables.boq }
      pricing:
        tasks: [cost_model, margin_check, discount_request]
        transitions:
          proposal_build: { guard: price_set }
      proposal_build:
        tasks: [compile_volumes, qa_checklist]
        transitions:
          approvals: { guard: checklist_complete }
      approvals:
        approvals:
          - { role: pre_sales_lead, key: tech }
          - { role: finance, key: finance }
          - { role: legal, key: legal }
          - { role: compliance, key: grc }
        transitions:
          submission: { guard: approvals.all == true }
      submission:
        actions: [package_docs, submit_portal, attach_receipt]
        transitions:
          post_bid: {}
      post_bid:
        transitions:
          won: { guard: outcome == 'won' }
          lost: { guard: outcome == 'lost' }
          cancelled: {}
```

---

## 6) Dynamic Forms (JSON Schema)
### a) Go/No‑Go
```json
{
  "$id": "go_no_go_form",
  "title": "Go/No-Go",
  "type": "object",
  "required": ["strategic_fit", "competitiveness", "timeline_feasibility"],
  "properties": {
    "strategic_fit": {"type":"integer","minimum":0,"maximum":10},
    "competitiveness": {"type":"integer","minimum":0,"maximum":10},
    "timeline_feasibility": {"type":"integer","minimum":0,"maximum":10},
    "risk_flags": {"type":"array","items":{"type":"string"}},
    "notes": {"type":"string"}
  },
  "scoring": {
    "formula": "(strategic_fit*0.4)+(competitiveness*0.4)+(timeline_feasibility*0.2)",
    "threshold": 7.0
  }
}
```

### b) Clarification
```json
{
  "$id": "clarification_form",
  "title": "Clarification",
  "type": "object",
  "required": ["question"],
  "properties": {
    "question": {"type":"string"},
    "priority": {"type":"string","enum":["low","medium","high"]},
    "buyer_contact": {"type":"string"},
    "due_at": {"type":"string","format":"date-time"}
  }
}
```

---

## 7) Data Model (Add‑ons for collaboration)
```sql
-- Collaboration primitives
CREATE TABLE IF NOT EXISTS task (
  task_id UUID PRIMARY KEY,
  rfp_id UUID NOT NULL,
  title TEXT,
  assignee_id UUID,
  due_at TIMESTAMP,
  status VARCHAR(24) CHECK (status IN ('todo','in_progress','blocked','done')),
  labels TEXT[],
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comment (
  comment_id UUID PRIMARY KEY,
  entity_type VARCHAR(32), -- rfp|submission|proposal|question
  entity_id UUID,
  author_id UUID,
  body TEXT,
  mentions UUID[],
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS approval (
  approval_id UUID PRIMARY KEY,
  rfp_id UUID,
  key VARCHAR(32), -- tech|finance|legal|grc
  role VARCHAR(64),
  approver_id UUID,
  decision VARCHAR(16) CHECK (decision IN ('approved','rejected','waived')),
  decided_at TIMESTAMP,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS proposal_version (
  version_id UUID PRIMARY KEY,
  rfp_id UUID,
  version_no INT,
  file_ref TEXT,
  created_by UUID,
  created_at TIMESTAMP DEFAULT now(),
  checksum VARCHAR(64)
);

CREATE TABLE IF NOT EXISTS clarification (
  clar_id UUID PRIMARY KEY,
  rfp_id UUID,
  question TEXT,
  answer TEXT,
  priority VARCHAR(8),
  raised_at TIMESTAMP,
  answered_at TIMESTAMP,
  sla_hours INT
);
```

---

## 8) API Contract (OpenAPI excerpt)
```yaml
openapi: 3.0.3
info: { title: RFP Collaboration API, version: 1.0.0 }
paths:
  /rfp/{id}/transition:
    post:
      summary: Transition RFP state
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                to: { type: string }
                payload: { type: object }
      responses: { '200': { description: OK } }

  /rfp/{id}/tasks:
    post: { summary: Create task }
    get:  { summary: List tasks }

  /rfp/{id}/approvals:
    post: { summary: Record approval }

  /rfp/{id}/clarifications:
    post: { summary: Raise clarification }
    get:  { summary: List clarifications }

  /proposal/{id}/versions:
    post: { summary: Upload new version }
    get:  { summary: List versions }
```

---

## 9) Event Bus (for interactivity & automations)
- **Topics**: `rfp.state.changed`, `task.created`, `task.overdue`, `approval.requested`, `approval.completed`, `clarification.raised`, `clarification.answered`, `proposal.versioned`
- **Example Payload** (`rfp.state.changed`):
```json
{
  "event":"rfp.state.changed",
  "rfp_id":"<uuid>",
  "from":"pricing",
  "to":"proposal_build",
  "by":"<user_id>",
  "at":"2025-10-29T12:00:00Z",
  "sla": {"next_deadline":"2025-11-01T12:00:00Z"}
}
```

---

## 10) Frontend UX Patterns (React/Tailwind)
**Pages:**
- `/rfp/:id/board` (Kanban: Intake → … → Post‑Bid)
- `/rfp/:id/plan` (RACI, work‑packages, Gantt)
- `/rfp/:id/proposal` (versions, diff, checklist)
- `/rfp/:id/approvals` (matrix, status, audit)
- `/rfp/:id/clarifications` (Q&A, SLA timers)
- `/inbox` (My Tasks, My Approvals, Mentions)

**Widgets:**
- **Presence & Co‑editing** (avatars, real‑time cursors)
- **@Mentions & Threads** inside proposal sections
- **SLA chips** (green/amber/red) with countdown
- **Checklist builder** (per volume) with templates
- **Arabic/English toggle**, **Hijri date** optional

**Accessibility/Guardrails:**
- Actions only render if user has scope; soft‑disabled shows reason/owner
- Autosave drafts; version seal on “Submit for review”

---

## 11) Notifications & Escalations
- DM on `task.assigned`, `approval.requested`, `task.overdue`
- Daily digest per user; weekly PMO report
- Escalate to Sales Manager when SLA T‑4h remains

---

## 12) Implementation Steps (90‑Min Cutover)
1. Deploy DB migrations for collaboration tables (above)
2. Load workflow YAML & form schemas
3. Wire transitions → API + guards
4. Enable event bus consumers (notifications, SLA timers)
5. Ship UI routes with minimal widgets (Kanban, Approvals, Clarifications)
6. Import RBAC scopes to IdP & map groups
7. Pilot on one active RFP; iterate thresholds & forms

---

## 13) Governance & Audit
- Every transition → immutable audit log (who/when/why)
- Proposal sealing (hash) on approved version
- PDPL controls: data minimization, retention per RFP class

---

### Ready‑to‑use
Copy the YAML/JSON/SQL into your configs/migrations. If you need, I can generate **migrations + seeded forms + OpenAPI** as files tailored to your current codebase (FastAPI/Node).

