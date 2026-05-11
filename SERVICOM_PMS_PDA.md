# SERVICOM Performance Management System (PMS)
## Product Design Artifact (PDA)

**Version:** 1.1  
**Date:** May 2026  
**Organization:** SERVICOM (Service Compact with All Nigerians)  
**Prepared by:** Kiro AI — based on analysis of APPRAISAL and CONTRACT Excel templates

**Revision History**

| Version | Date | Description |
|---------|------|-------------|
| 1.0 | May 2026 | Initial release |
| 1.1 | May 2026 | Introduced configuration-driven architecture for scoring weights, grade scale, competencies, operations items, appraisal periods, approval workflow, and KRA/KPI template library. Added KRA/KPI template display specification. All system parameters ship with values derived from the existing Excel templates as system defaults. |

---

## 1. EXECUTIVE SUMMARY

SERVICOM currently manages staff performance through a manual Excel-based system spanning 7 departments (Account, Admin, Audit, ICT, NC, Operations, PA) with 30+ staff members. Each staff member has individual appraisal and contract workbooks with 4 quarterly sheets. The proposed digital PMS will replace this with a web-based, role-driven platform that automates scoring, surfaces analytics, and provides a real-time leaderboard — while preserving the exact KRA/KPI/scoring logic already embedded in the templates.

---

## 2. TEMPLATE ANALYSIS FINDINGS

### 2.1 Document Types Identified

| Type | Folder | Purpose |
|------|--------|---------|
| Performance Appraisal | `APPRAISAL/` | Quarterly self-assessment + supervisor rating |
| Performance Contract | `CONTRACT/` | Annual targets agreed at start of year |

Both share identical structure — the Contract sets targets; the Appraisal records achievement against those targets.

### 2.2 Organizational Structure (from templates)

```
SERVICOM
├── NC (National Coordinator)
├── PA (Personal Assistant)
├── ACCOUNT
│   ├── HEAD (ODUMU GODWIN — PEOI)
│   ├── OLADIMEJI FUNMILAYO
│   └── OMEGO HILARY
├── ADMIN
│   ├── HEAD (NWABUA CHINYERE — Asst. Chief Confidential Secretary)
│   ├── ABDULLAHI ISAH (AO II)
│   ├── AMOS OBINNA
│   ├── DANABUYI SAMSON
│   ├── KAURA ISAIAH
│   ├── MOHAMMED MUSA
│   ├── NWACHUKWU THANKGOD
│   └── YUNUSA GAMBO
├── AUDIT
│   ├── HEAD
│   └── OMAKWU PETER
├── ICT
│   └── HEAD
└── OPERATIONS
    ├── HEAD (AKINBODEWA NGOZI — Deputy Director)
    ├── Team A: OLEH NNEKA, SHITTU OYELUDE
    ├── Team B: ONCHE BEN, SESUGH DURUBA, TUBI-TOLULOPE
    ├── Team C: IGWILO ESTHER, OBE NAT, OCHELEBE ANTHONY, OLANIYAN KIKELOMO
    └── Team D: MAGAJI MEDINATU, NASIR MOHAMMED, NNANNA ROSE, ZACK-UKOH LUCY
```

**Supervisor Hierarchy:**
- Deputy Director (HELEN LAWAL OBEHI, IPPIS: 60529) — top-level supervisor
- Department Heads — mid-level supervisors
- Team Leads (e.g., SHITTU OYELUDE in Operations A) — direct supervisors

### 2.3 Appraisal Form Structure (7 Sections)

| Section | Content |
|---------|---------|
| Section 1 | Employee Information (Name, IPPIS No., Email, Phone, Designation, Department) |
| Section 2 | Supervisor Information |
| Section 3 | Counter-Signing Officer Information |
| Section 4 | Employee Tasks — KRAs, Objectives, KPIs, Targets, Scoring |
| Section 5 | Competencies (Generic, Functional, Ethics & Values) |
| Section 6 | Operations & Processes (Punctuality, Turnaround Time, Innovation) |
| Section 7 | Comments (Appraiser rating, Appraisee/Supervisor/Counter-Supervisor comments, Signatures) |

### 2.3.1 Section 4 — Three-Level Task Hierarchy

Section 4 is structured as a strict three-level hierarchy, exactly as presented in the source templates. Each level must be fully visible in both the Performance Contract and the Appraisal form:

```
KRA (Key Result Area)
 └── Objective
      └── KPI 1  [Target | Unit | Criteria Values | Achievement | Raw Score | Weighted Score]
      └── KPI 2
      └── KPI n
 └── Objective
      └── KPI ...
```

**Level 1 — Key Result Area (KRA)**
A broad performance domain assigned a serial number and an overall weight. Example:
> *"2 — Financial Management, Budgeting, and Accounting Services | Weight: 5.00"*

**Level 2 — Objective**
A full descriptive statement of what the staff member is expected to achieve within the KRA. The Objective carries its own weight and graded weight, and may contain one or more KPIs. The complete Objective text must be displayed in full — it must not be truncated or collapsed. Example:
> *"Ensure accurate financial record-keeping and proper retirement of advances | Weight: 0.50 | Graded Weight: 5.61"*

**Level 3 — KPI (Key Performance Indicator)**
A measurable indicator tied to the Objective, with the following fields displayed in a tabular row:

| Field | Description |
|-------|-------------|
| KPI Description | Full text of the indicator |
| Target Set | The expected achievement value (e.g., 100%, 5, >30) |
| Unit of Measurement | PERCENTAGE, NUMBER, etc. |
| Criteria Values | Six columns: O, E, VG, G, F, P with their respective threshold values |
| Achievement | Entered by the staff member during appraisal |
| Raw Score | Auto-computed grade score based on achievement vs. criteria |
| Weighted Raw Score | Raw Score × Graded Weight, auto-computed |

### 2.4 Scoring Model

The scoring model below reflects the structure established in the existing Excel templates. All parameters — section weights, grade labels, score thresholds, and competency targets — are system defaults that may be modified by an authorised Administrator through the System Configuration module without requiring application redeployment.

**Section 4 — Task Performance (Default: 70% of total score)**

| Grade Key | Label | Default Threshold |
|-----------|-------|-------------------|
| O | Outstanding | 100% |
| E | Excellent | 90% |
| VG | Very Good | 80% |
| G | Good | 70% |
| F | Fair | 60% |
| P | Poor | 50% |

- Each KPI carries a **Raw Score** and a **Weighted Raw Score** (Raw Score × Graded Weight).
- The Section 4 Composite Score is the sum of all Weighted Raw Scores, converted to the configured Section 4 percentage weight.

**Section 5 — Competencies (Default: 20% of total score)**

Three competency clusters with the following default items and targets:

1. Generic Competencies: Drive for Results (target: 4), Collaborating & Partnering (target: 2), Effective Communication (target: 2)
2. Functional Competencies: Policy Management (target: 2), Public Relations Management (target: 2), Information & Records Management (target: 2)
3. Ethics & Values: Integrity (target: 2), Inclusiveness (target: 2), Transparency & Accountability (target: 2)

**Section 6 — Operations & Processes (Default: 10% of total score)**

| Item | Default Target |
|------|---------------|
| Punctuality / Attendance | 4 |
| Work Turnaround Time | 3 |
| Innovation on the Job | 3 |
| **Total** | **20 points** |

**Final Score Composition**

| Component | Default Weight |
|-----------|---------------|
| Section 4 — Task Performance | 70% |
| Section 5 — Competencies | 20% |
| Section 6 — Operations & Processes | 10% |
| **Total** | **100%** |

The system enforces that the sum of all section weights equals 100% at the point of configuration. The scoring engine resolves all weights and thresholds from the configuration tables at runtime.

### 2.5 Key Result Areas by Department

**Common KRAs (all departments):**
- Governance & Service Delivery
- Service Innovation & Improvement
- Automated Service Delivery
- Capacity Building
- Staff Welfare
- Wellness Programs
- Staff Recognition

**Department-Specific KRAs:**

| Department | Unique KRAs |
|------------|-------------|
| Account | Financial Management & Budgeting, Support for Service Delivery |
| Admin | Administrative Services & Office Support, Stakeholders Engagement, Records & Workflow Digitization |
| Operations | Service Delivery Monitoring & Evaluation, Legal Advisory, Procurement & Contract Management |
| Audit | Internal Audit & Compliance |
| ICT | ICT Infrastructure & Support |

### 2.6 Quarterly Cycle

The system defaults to four appraisal periods per year, aligned to calendar quarters:

- **Q1:** January – March
- **Q2:** April – June
- **Q3:** July – September
- **Q4:** October – December

Each period has its own appraisal record. The annual performance score is the weighted average across all completed periods. The number of periods, their labels, and date ranges are configurable by an authorised Administrator.

---

## 3. SYSTEM ROLES

Every user in the system — regardless of seniority — operates in two distinct contexts:

- **As an Appraisee:** submitting their own quarterly appraisal and performance contract
- **As an Appraiser:** reviewing, rating, and approving the appraisals of those who report to them

The only exceptions are the Super Admin (system management role, not part of the appraisal hierarchy) and the NC/top executive whose appraisal is managed outside the system or at the highest approval level. Every other role holds both contexts simultaneously.

| Role | Appraisee Context | Appraiser Context |
|------|-------------------|-------------------|
| **Super Admin** | System administrator — not part of the appraisal hierarchy | Full system access, user management, configuration |
| **NC (National Coordinator)** | Appraised at the executive level; counter-signed by the highest authority | Views all dashboards; approves final scores org-wide |
| **Deputy Director** | Has own performance contract and quarterly appraisals; appraised by NC or counter-signing authority | Counter-signs appraisals escalated from Department Heads; accesses org-wide analytics |
| **Department Head** | Has own performance contract and quarterly appraisals; appraised by Deputy Director | Reviews and approves appraisals of all staff within their department; acts as supervisor or counter-signer depending on hierarchy |
| **Team Lead / Supervisor** | Has own performance contract and quarterly appraisals; appraised by Department Head | Rates and approves appraisals of direct reports; submits supervisor comments |
| **Staff** | Has own performance contract and quarterly appraisals; appraised by Team Lead or Supervisor | No appraiser responsibilities |

### 3.1 Dual-Context Behaviour

When a user with a supervisory role logs in, the system presents both contexts through separate navigation paths:

- **My Appraisal** — the user's own appraisal and contract (appraisee context)
- **Team / Unit** — the appraisals of their direct reports awaiting review (appraiser context)

The system determines which appraisals a user can review based solely on the `supervisor_id` and `counter_signer_id` relationships in the user record. A user can never review their own appraisal, and a user can never access the appraisal of someone who does not report to them.

---

## 4. FUNCTIONAL REQUIREMENTS

### 4.1 Core Modules

#### Module 1: User & Organization Management
- Staff profile management (IPPIS No., name, email, phone, designation, department)
- Org chart with supervisor-subordinate mapping
- Role assignment and access control
- Department and team configuration

#### Module 2: Performance Contract Management
- Create annual performance contracts per staff
- Define KRAs, Objectives, KPIs, Targets, Weights per role
- Template library per department (pre-loaded from existing templates)
- Contract approval workflow (Staff → Supervisor → Counter-Signer)
- Contract versioning and history

#### Module 3: Quarterly Appraisal

The quarterly appraisal form is pre-populated from the employee's approved Performance Contract. The employee does not re-enter any KRA, Objective, or KPI information. The employee's sole input responsibility is limited to the following:

| Section | Employee Input | System Action |
|---------|---------------|---------------|
| Sections 1–3 | None — auto-populated from user profile and org hierarchy | Displays employee, supervisor, and counter-signing officer details as read-only |
| Section 4 | **One achievement value per KPI** — a numeric entry representing actual performance for the quarter in the KPI's unit of measurement | Compares achievement against the KPI's configured criteria values, assigns a grade, computes Raw Score and Weighted Raw Score automatically |
| Section 5 | **One score per competency item** — selected from the configured grade scale | Computes the Section 5 sub-total |
| Section 6 | **One score per operations item** — a numeric entry up to the item's maximum | Computes the Section 6 sub-total |
| Section 7 | **Free-text comments** — strengths, areas for improvement, appraisee remarks, and signature date | No computation; stored as narrative record |

Additional system behaviours:
- Composite score updates in real time as achievement values are entered
- Form auto-saves every 30 seconds
- Submission workflow status tracking: Draft → Submitted → Under Review → Approved

#### Module 4: Scoring Engine
- Resolves all scoring parameters — section weights, grade thresholds, competency targets, and operations item targets — from the configuration tables at runtime
- Automatic grade assignment based on achievement against configured criteria values per KPI
- Weighted score computation per KPI
- Section 4 composite score (default: 70%)
- Section 5 competency score (default: 20%)
- Section 6 operations score (default: 10%)
- System validation: section weights must sum to 100% prior to saving any configuration change
- Final quarterly score computation
- Annual score aggregation as a weighted average across all configured appraisal periods

#### Module 5: Dashboard (Role-Based)
- **Staff Dashboard:** Personal score trend, current quarter status, pending actions, competency radar chart
- **Team Lead Dashboard:** Team performance summary, pending reviews, individual comparisons
- **Department Head Dashboard:** Unit KPI heatmap, completion rates, top/bottom performers
- **Deputy Director / NC Dashboard:** Org-wide performance overview, department comparisons, trend analysis, alerts

#### Module 6: Leaderboard
- Quarterly and annual rankings
- Filter by department, team, quarter, year
- Top performers highlight (Outstanding/Excellent)
- Anonymous mode option (show rank without name for non-supervisors)
- Performance badges/awards display

#### Module 7: Performance Analytics
- Individual performance trend (4 quarters)
- KRA-level performance breakdown
- Competency gap analysis
- Department vs. department comparison
- Year-on-year comparison
- Underperformance alerts
- Export to PDF/Excel

#### Module 8: Notifications & Workflow
- Email and in-app notifications for the following events:
  - Appraisal period open and close announcements
  - Pending supervisor review alerts
  - Appraisal approval and return notifications
  - Configurable deadline reminders (defaults: 7 days, 3 days, and 1 day before submission close)
- Escalation alerts for appraisals that remain unreviewed beyond the configured supervisor deadline
- All notification types, reminder intervals, and escalation thresholds are configurable by an authorised Administrator

#### Module 9: Reports
- Individual appraisal report (PDF, matching Excel template layout)
- Department performance summary
- Org-wide annual performance report
- Leaderboard report
- Compliance report (% of staff with completed appraisals)

#### Module 10: System Configuration
This module is the control centre for all configurable defaults. All values listed below ship pre-loaded from the existing Excel templates and can be changed by Admin without any code deployment.

**10.1 Scoring Configuration**
- Section weights (Section 4 / 5 / 6 percentages; must sum to 100%)
- Grade scale: add/edit/remove grade labels, score thresholds, and display colours
- Default grade scale (pre-loaded):

| Key | Label | Threshold | Colour |
|-----|-------|-----------|--------|
| O | Outstanding | 100% | #16A34A |
| E | Excellent | 90% | #2563EB |
| VG | Very Good | 80% | #7C3AED |
| G | Good | 70% | #D97706 |
| F | Fair | 60% | #EA580C |
| P | Poor | 50% | #DC2626 |

**10.2 Competency Configuration**
- Add/edit/remove competency clusters and individual competencies
- Set default target score per competency per designation or globally
- Default competencies (pre-loaded from templates):
  - Generic: Drive for Results (4), Collaborating & Partnering (2), Effective Communication (2)
  - Functional: Policy Management (2), Public Relations Management (2), Information & Records Management (2)
  - Ethics & Values: Integrity (2), Inclusiveness (2), Transparency & Accountability (2)

**10.3 Operations & Processes Configuration**
- Add/edit/remove operations items
- Set target score per item
- Default items (pre-loaded): Punctuality/Attendance (4), Work Turnaround Time (3), Innovation on the Job (3)

**10.4 Appraisal Period Configuration**
- Define number of periods per year (default: 4 quarters)
- Set label, start date, end date, submission open date, and submission close date per period
- Default periods (pre-loaded):

| Label | Coverage | Submission Opens | Submission Closes |
|-------|----------|-----------------|-------------------|
| Q1 | Jan–Mar | 1 April | 15 April |
| Q2 | Apr–Jun | 1 July | 15 July |
| Q3 | Jul–Sep | 1 October | 15 October |
| Q4 | Oct–Dec | 1 January (next yr) | 15 January |

**10.5 Notification & Reminder Configuration**
- Enable/disable each notification type
- Set reminder intervals before deadlines (default: 7 days, 3 days, 1 day)
- Configure escalation delay (default: 2 working days after supervisor deadline)
- Set email sender name and address

**10.6 Approval Workflow Configuration**
- Set number of approval levels (default: 2 — Supervisor + Counter-Signer)
- Toggle Counter-Signing Officer requirement on/off per department
- Configure escalation fallback (who approves if primary approver is inactive)

**10.7 KRA/KPI Template Library**
- Create, edit, clone, and archive department-level KRA templates
- Each template preserves the full three-level hierarchy: KRA → Objective → KPI
- The full Objective text is stored and displayed in the template editor exactly as it appears in the source documents — it is a mandatory field and cannot be left blank
- Assign templates to departments or individual staff
- All existing department templates are pre-loaded as system defaults (see Section 11)
- Templates are versioned; modifications to a template do not affect Performance Contracts that are already active or approved

**10.8 Organisation Structure Configuration**
- Add/edit/remove departments and teams dynamically
- Assign department heads and team leads
- Configure supervisor-subordinate relationships
- Default structure pre-loaded from existing templates (see Section 2.2)

---

## 5. NON-FUNCTIONAL REQUIREMENTS

| Category | Requirement |
|----------|-------------|
| **Performance** | Page load < 2s; score calculation < 500ms |
| **Security** | Role-based access control; data encrypted at rest and in transit; audit logs |
| **Availability** | 99.5% uptime; graceful offline mode for form drafts |
| **Scalability** | Support 200+ staff; extensible to other MDAs |
| **Accessibility** | WCAG 2.1 AA compliant; mobile-responsive |
| **Data Integrity** | Immutable approved appraisals; change history tracked |
| **Compliance** | Aligned with OHCSF PMS guidelines and IPPIS integration-ready |

---

## 6. USER STORIES

> All roles from Staff through to Deputy Director hold dual responsibilities — as an appraisee submitting their own appraisal, and as an appraiser reviewing the appraisals of those who report to them. User stories are organised accordingly.

### All Appraisees (Staff, Team Lead, Supervisor, Department Head, Deputy Director)
- As an appraisee, I can log in and see my current quarter's appraisal status on my dashboard.
- As an appraisee, I can create my annual performance contract, which is pre-populated from the KRA/KPI template assigned to my department.
- As an appraisee, I can enter one achievement value per KPI in my quarterly appraisal and see my score computed automatically in real time.
- As an appraisee, I can enter my competency scores and operations scores for the quarter.
- As an appraisee, I can add my comments, strengths, and areas for improvement in Section 7.
- As an appraisee, I can submit my appraisal and track its approval status through the workflow.
- As an appraisee, I can view my performance trend across all quarters and years.
- As an appraisee, I can see my position on the leaderboard for my department.
- As an appraisee, I can download a PDF copy of any of my approved appraisals.

### Supervisor / Team Lead — Appraiser Context
- As a supervisor, I can see all pending appraisal submissions from my direct reports.
- As a supervisor, I can enter my supervisor rating and comments for each appraisee's quarterly appraisal.
- As a supervisor, I can approve or return an appraisal for revision with a mandatory comment.
- As a supervisor, I can compare my direct reports' performance side by side.
- As a supervisor, I can open the Performance Overview tab to see all my direct reports' quarterly scores, annual scores, trend sparklines, and current appraisal status in a single view.
- As a supervisor, I can click on any direct report in the Performance Overview to open their full KRA breakdown and competency scores in a side panel.

### Department Head — Appraiser Context
- As a department head, I can view and approve all appraisals within my unit.
- As a department head, I can act as counter-signing officer for appraisals escalated from Team Leads within my department.
- As a department head, I can see a KPI heatmap showing where my unit is strong or weak.
- As a department head, I can generate a department performance report.
- As a department head, I can open the Performance Overview tab to see all employees in my department — their quarterly scores, annual scores, trend sparklines, and appraisal status — in a single scrollable view.
- As a department head, I can filter the Performance Overview by team, period, year, or grade within my department.
- As a department head, I can click on any employee to open their full performance detail in a side panel without leaving the overview.

### Deputy Director / NC — Appraiser Context
- As a Deputy Director, I can counter-sign appraisals escalated to me from Department Heads.
- As a Deputy Director, I can view performance across all departments.
- As a Deputy Director, I can access the org-wide leaderboard and analytics.
- As the NC, I can view executive summary dashboards and export reports.
- As a Deputy Director or NC, I can open the Performance Overview tab and see every employee's quarterly scores, annual score, trend sparkline, and current appraisal status in a single scrollable view.
- As a Deputy Director or NC, I can filter the Performance Overview by department, team, period, year, or grade to focus on a specific cohort.
- As a Deputy Director or NC, I can click on any employee in the Performance Overview to open a side panel showing their full KRA breakdown, competency scores, and appraisal history without leaving the page.

### Admin
- As an admin, I can create and manage user accounts.
- As an admin, I can configure appraisal periods and deadlines.
- As an admin, I can load department-specific KRA/KPI templates.
- As an admin, I can manage the org chart and supervisor assignments.
- As an admin, I can adjust scoring weights (Section 4/5/6 percentages) and the system validates they sum to 100%.
- As an admin, I can add, edit, or remove grade labels and thresholds.
- As an admin, I can configure competency items and their default targets per designation.
- As an admin, I can configure operations items and their targets.
- As an admin, I can set reminder intervals before appraisal deadlines.
- As an admin, I can toggle the counter-signing requirement on or off per department.
- As an admin, I can clone an existing KRA template, modify it, and assign it to a different department or staff group.

---

## 7. SYSTEM ARCHITECTURE

### 7.1 Technology Stack (Recommended)

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js + TypeScript, Tailwind CSS, Recharts / Chart.js |
| **Backend** | Laravel (PHP) — REST API |
| **Database** | MySQL / PostgreSQL |
| **Auth** | Laravel Sanctum (token-based) + role middleware |
| **File Storage** | Local disk / S3-compatible (for PDF exports) |
| **Notifications** | Laravel Queues + Mail (SMTP) + database notifications |
| **PDF Export** | Laravel DomPDF / Snappy |

### 7.2 Data Models

**Core Entities:**

```
users
  id, ippis_no, surname, firstname, othername, email, phone,
  designation, department_id, role_id, supervisor_id,
  counter_signer_id, is_active, created_at

departments
  id, name, code, head_user_id

teams
  id, department_id, name, lead_user_id

performance_contracts
  id, user_id, year, status (draft|approved|active),
  approved_by, approved_at, created_at

kras  -- Level 1
  id, contract_id, serial_no, name, weight

objectives  -- Level 2: full descriptive statement, mandatory
  id, kra_id, description, weight, graded_weight
  -- 'description' stores the complete Objective text as authored in the source template
  -- e.g. "Ensure accurate financial record-keeping and proper retirement of advances"

kpis  -- Level 3: measurable indicators under each Objective
  id, objective_id, description, target_value,
  unit_of_measurement,
  criteria_O, criteria_E, criteria_VG, criteria_G, criteria_F, criteria_P

appraisals
  id, user_id, contract_id, period_id, year,
  status (draft|submitted|under_review|approved|returned),
  submitted_at, supervisor_id, counter_signer_id

appraisal_kpi_scores
  id, appraisal_id, kpi_id, achievement, raw_score, weighted_raw_score

appraisal_competency_scores
  id, appraisal_id, competency_id, score

appraisal_operations_scores
  id, appraisal_id, operations_item_id, score

appraisal_scores  -- computed totals
  id, appraisal_id,
  section4_score, section5_score, section6_score, final_score,
  grade_key (references grade_scales.key)

appraisal_comments
  id, appraisal_id, role (appraisee|supervisor|counter_signer),
  comment, strengths, improvement_areas, signature_date

notifications
  id, user_id, type, message, read_at, created_at

audit_logs
  id, user_id, action, model, model_id, old_values, new_values, created_at
```

**Configuration Tables:**

```
system_settings
  id, key, value, description, updated_by, updated_at

grade_scales
  id, key, label, threshold_percent, colour_hex, sort_order, is_active

competency_clusters
  id, name, sort_order, is_active

competencies
  id, cluster_id, name, default_target, sort_order, is_active

operations_items
  id, name, default_target, max_score, sort_order, is_active

appraisal_periods
  id, year, label, coverage_start, coverage_end,
  submission_opens, submission_closes, is_active

kra_templates
  id, name, department_id (nullable = global), version,
  is_active, created_by, created_at

kra_template_items  -- Level 1 within a template
  id, template_id, serial_no, kra_name, weight

objective_template_items  -- Level 2 within a template: full Objective text is mandatory
  id, kra_template_item_id, description, weight, graded_weight
  -- 'description' must contain the complete Objective statement

kpi_template_items  -- Level 3 within a template
  id, objective_template_item_id, description, target_value,
  unit_of_measurement,
  criteria_O, criteria_E, criteria_VG, criteria_G, criteria_F, criteria_P

workflow_approval_steps
  id, department_id (nullable = global), step_order,
  approver_role, is_required, fallback_user_id
```

### 7.3 API Structure

```
Auth
  POST   /api/auth/login
  POST   /api/auth/logout
  GET    /api/auth/me

Users
  GET    /api/users
  POST   /api/users
  GET    /api/users/{id}
  PUT    /api/users/{id}
  GET    /api/users/{id}/appraisals

Departments & Teams
  GET    /api/departments
  GET    /api/departments/{id}/staff
  GET    /api/teams

Performance Contracts
  GET    /api/contracts
  POST   /api/contracts
  GET    /api/contracts/{id}
  PUT    /api/contracts/{id}
  POST   /api/contracts/{id}/approve

Appraisals
  GET    /api/appraisals
  POST   /api/appraisals
  GET    /api/appraisals/{id}
  PUT    /api/appraisals/{id}
  POST   /api/appraisals/{id}/submit
  POST   /api/appraisals/{id}/approve
  POST   /api/appraisals/{id}/return
  GET    /api/appraisals/{id}/score

Analytics & Reports
  GET    /api/analytics/dashboard
  GET    /api/analytics/leaderboard
  GET    /api/analytics/department/{id}
  GET    /api/analytics/trends/{user_id}
  GET    /api/analytics/performance-overview        -- paginated, filterable employee list with scores and trend data
  GET    /api/analytics/performance-overview/{id}   -- single employee side-panel detail
  GET    /api/reports/appraisal/{id}/pdf
  GET    /api/reports/department/{id}
  GET    /api/reports/annual

System Configuration (Admin only)
  GET    /api/settings
  PUT    /api/settings                        -- batch update key/value pairs
  GET    /api/settings/grade-scales
  POST   /api/settings/grade-scales
  PUT    /api/settings/grade-scales/{id}
  DELETE /api/settings/grade-scales/{id}
  GET    /api/settings/competencies
  POST   /api/settings/competencies
  PUT    /api/settings/competencies/{id}
  GET    /api/settings/operations-items
  POST   /api/settings/operations-items
  PUT    /api/settings/operations-items/{id}
  GET    /api/settings/appraisal-periods
  POST   /api/settings/appraisal-periods
  PUT    /api/settings/appraisal-periods/{id}
  GET    /api/settings/workflow
  PUT    /api/settings/workflow
  GET    /api/kra-templates
  POST   /api/kra-templates
  GET    /api/kra-templates/{id}
  PUT    /api/kra-templates/{id}
  POST   /api/kra-templates/{id}/clone
  DELETE /api/kra-templates/{id}
```

---

## 8. UI/UX DESIGN SPECIFICATIONS

### 8.1 Navigation Structure

```
Sidebar Navigation
├── Dashboard (role-specific home)
├── My Appraisal
│   ├── Current Quarter
│   ├── History
│   └── My Contract
├── Team / Unit (supervisors only)
│   ├── Pending Reviews
│   ├── Team Performance
│   └── Approve Appraisals
├── Performance Overview (Deputy Director / NC / Department Head / Supervisor)
├── Leaderboard
├── Analytics
│   ├── Performance Trends
│   ├── KRA Breakdown
│   └── Competency Analysis
├── Reports
└── Admin (admin only)
    ├── Users
    ├── Departments & Teams
    ├── KRA/KPI Templates
    ├── Appraisal Periods
    └── System Settings
        ├── Scoring Weights
        ├── Grade Scale
        ├── Competencies
        ├── Operations Items
        ├── Approval Workflow
        └── Notification Settings
```

### 8.2 Key Screens

**1. Staff / Appraisee Dashboard** *(visible to all roles that are subject to appraisal — Staff, Team Lead, Supervisor, Department Head, Deputy Director)*
- Welcome banner with current quarter and deadline countdown
- Score card: Current quarter score (gauge chart), trend sparkline
- **Appraisal Completion Progress Bar:** Displays the number of KPIs filled in the current quarter's appraisal out of the total, expressed as a percentage (e.g. "18 of 24 KPIs completed — 75%"). Bar fills left to right; colour transitions from amber to green as completion approaches 100%.
- **Annual Period Progress Bar:** Shows how many appraisal periods have been approved out of the total configured periods for the year (e.g. "2 of 4 quarters approved"). Each segment represents one period and is filled solid on approval.
- Status tracker: Contract → Q1 → Q2 → Q3 → Q4 (progress steps)
- Quick actions: "Start Q1 Appraisal", "View Leaderboard"
- For supervisory roles: a **Pending Reviews** counter badge linking directly to the Team / Unit review queue, so the user can switch between their own appraisal and their review responsibilities from a single screen
- Notifications panel

**2. Appraisal Form / Performance Contract Form**
- **Section Progress Bar:** A horizontal step-progress bar fixed at the top of the form showing the five stages — Section 4 | Section 5 | Section 6 | Section 7 | Review & Submit. The current active section is highlighted; completed sections are marked with a check indicator. The bar also displays the overall form completion percentage numerically (e.g. "Step 2 of 5 — 40% complete").
- Stepper: Section 4 → Section 5 → Section 6 → Section 7 → Review & Submit
- **Section 4 — Three-Level Display:**
  - Each KRA is rendered as a titled, collapsible panel showing its serial number, name, and total weight
  - Within each KRA panel, each Objective is displayed as a distinct sub-section with its full descriptive text rendered in its entirety (no truncation), along with its weight and graded weight
  - Under each Objective, KPIs are presented in a structured table with the following columns: KPI Description | Target Set | Unit of Measurement | O | E | VG | G | F | P | Achievement | Raw Score | Weighted Raw Score
  - The **Achievement column is the only editable field in Section 4**. The employee enters a single numeric value per KPI representing their actual result for the quarter in the KPI's stated unit of measurement (e.g. a percentage, a count). No other column requires or accepts input from the employee.
  - The system automatically compares the entered Achievement against the KPI's six criteria values, assigns the corresponding grade, and computes the Raw Score and Weighted Raw Score without further action from the employee
  - A running composite score panel is displayed as a sticky sidebar, updating in real time as achievement values are entered
- **Section 5:** Competency rating grid — one row per competency item, with target displayed and score selectable via the configured grade scale
- **Section 6:** Operations items table — one row per item, with target displayed and score entry field
- **Section 7:** Text areas for Appraisee Comments, Supervisor Comments, and Counter-Signing Officer Comments; signature date fields for each party
- Form auto-saves every 30 seconds; unsaved changes are indicated visually

**3. Supervisor Review Screen**
- Side-by-side view: Staff self-rating vs. Supervisor rating
- Override capability with mandatory comment
- Approve / Return for Revision buttons
- Batch review list for multiple direct reports

**4. Department Head Dashboard**
- KPI Heatmap: Rows = staff, Columns = KRAs, each cell displays a mini progress bar representing achievement percentage against the KRA weighted target, coloured by grade
- **Department Compliance Progress Bar:** One bar per team showing the percentage of staff whose appraisals have been approved for the current period (e.g. "Team A: 2/2 — 100%", "Team B: 1/3 — 33%")
- Completion rate donut chart
- Top 3 performers cards
- Pending approvals count with quick-link

**5. Org-Wide Dashboard (Deputy Director / NC)**
- Department performance bar chart (average scores)
- Quarterly trend line chart (all departments)
- **Organisation Compliance Progress Bars:** One horizontal progress bar per department showing the percentage of staff with approved appraisals for the current period (e.g. "Admin: 6/8 — 75%"). Bars are colour-coded: red below 50%, amber 50–79%, green 80% and above.
- Compliance table (% appraisals submitted/approved per department)
- Alert panel: overdue appraisals, underperformers

**6. Performance Overview (Deputy Director / NC / Department Head / Supervisor)**

A dedicated full-page tab presenting employees in a single, continuously scrollable master view. The dataset is automatically scoped to the authenticated user's reporting hierarchy — each role sees only the employees within their span of authority. This screen enables any supervisory role to monitor the performance state and progress of their reportees without navigating into individual profiles.

*Toolbar Controls:*
- Search by name or IPPIS number
- Filter by Department, Team, Appraisal Period, Year, and Grade
- Sort by: Name, Department, Current Score (ascending/descending), or Trend (improving/declining)
- Toggle between Table View and Card View

*Table View — one row per employee:*

| Column | Content |
|--------|---------|
| Employee | Avatar, full name, designation |
| Department / Team | Department name and team label |
| Contract Status | Active / Pending / Not Submitted — colour-coded badge |
| Q1 | Score and grade badge (or "—" if period not yet due) |
| Q2 | Score and grade badge |
| Q3 | Score and grade badge |
| Q4 | Score and grade badge |
| Annual Score | Computed average with grade badge |
| Score Bar | Horizontal progress bar filled to the annual score percentage, coloured by grade — provides instant visual comparison across all rows |
| Trend | Sparkline chart showing score movement across all completed periods |
| Appraisal Status | Current period status: Draft / Submitted / Under Review / Approved — colour-coded badge |
| Action | "View" button — opens the employee's full performance profile in a side panel without leaving the page |

*Card View — one card per employee:*
- Employee photo, name, designation, and department
- Mini trend sparkline across completed periods
- Current period score displayed prominently with grade colour
- Appraisal status badge
- Click anywhere on the card to open the side panel

*Side Panel (opens on row click or "View" button):*
- Employee profile header (Sections 1–3 data: name, IPPIS, designation, department, supervisor)
- Quarter-by-quarter score breakdown with KRA-level detail
- Competency radar chart
- Section 4, 5, and 6 sub-scores per period
- Strengths and areas for improvement from the most recent approved appraisal
- Direct link to open the full appraisal record

*Access Control:*

The Performance Overview tab is accessible to all supervisory roles. The data scope is automatically restricted based on the authenticated user's position in the organisational hierarchy — no manual filtering is required to enforce this boundary.

| Role | Visible Scope |
|------|--------------|
| NC / Deputy Director | All employees across all departments and teams |
| Department Head | All employees within their department |
| Team Lead / Supervisor | Only direct reports assigned to them via the `supervisor_id` relationship |
| Staff | Tab not accessible |

In all cases the screen layout, columns, filters, and side panel are identical. The difference is solely in the dataset returned by the API, which is scoped server-side based on the authenticated user's role and reporting relationships. A supervisor cannot access or view any employee who does not report to them, directly or indirectly through the hierarchy.

**7. Leaderboard**
- Tabs: Current Quarter | Annual | By Department
- Ranked list with avatar, name, department, score, grade badge
- **Score Progress Bar:** Each ranked entry displays a horizontal progress bar filled to the employee's score out of 100, coloured by their grade. This makes relative performance immediately visible across all entries without reading individual numbers.
- Medal icons for top 3 (Gold, Silver, Bronze)
- Search and filter controls
- "My Rank" highlight — the authenticated user's row is visually distinguished with a highlight band

**8. Analytics — Individual Trend**
- Line chart: Final score across Q1–Q4 per year
- Radar chart: Competency scores vs. targets
- **KRA Achievement Progress Bars:** One horizontal bar per KRA showing the employee's achieved weighted score as a percentage of the KRA's maximum possible weighted score, coloured by the corresponding grade. Displayed alongside the bar chart for quick reference.
- KRA breakdown bar chart
- Year selector

### 8.3 Color & Grade System

| Grade | Label | Color |
|-------|-------|-------|
| O | Outstanding | #16A34A (Green) |
| E | Excellent | #2563EB (Blue) |
| VG | Very Good | #7C3AED (Purple) |
| G | Good | #D97706 (Amber) |
| F | Fair | #EA580C (Orange) |
| P | Poor | #DC2626 (Red) |

### 8.4 Progress Bar Design System

Progress bars are used consistently across the application to communicate completion, achievement, and compliance at a glance. The following table defines each progress bar type, its location, what it measures, and its colour behaviour.

| Bar Type | Location | Measures | Colour Behaviour |
|----------|----------|----------|-----------------|
| Appraisal Completion | Staff Dashboard | KPIs filled ÷ total KPIs in current appraisal | Amber below 50%, transitions to green at 100% |
| Annual Period Progress | Staff Dashboard | Periods approved ÷ total configured periods | Each segment fills solid green on approval; unfilled segments are grey |
| Section Progress | Appraisal Form (top) | Current step ÷ total form steps | Active step highlighted; completed steps marked with check; percentage shown numerically |
| KRA Achievement | Department Head Dashboard (heatmap cells) | KRA weighted score achieved ÷ KRA maximum weighted score | Coloured by the grade earned for that KRA |
| Department Compliance | Department Head Dashboard | Staff with approved appraisals ÷ total staff in team | Red below 50%, amber 50–79%, green 80% and above |
| Organisation Compliance | Org-Wide Dashboard | Staff with approved appraisals ÷ total staff per department | Red below 50%, amber 50–79%, green 80% and above |
| Employee Score Bar | Performance Overview (table column) | Annual score ÷ 100 | Coloured by the employee's current grade |
| Leaderboard Score Bar | Leaderboard | Quarterly or annual score ÷ 100 | Coloured by the employee's current grade |
| KRA Achievement Bars | Analytics — Individual Trend | Achieved weighted score ÷ maximum weighted score per KRA | Coloured by the grade earned for that KRA |

**General Design Rules:**
- All progress bars use a rounded pill shape with a light grey track and a filled foreground
- Bar height is consistent within each screen context (thin bars in table rows, thicker bars in dashboard cards)
- Percentage labels are displayed inside or adjacent to the bar where space permits
- Bars animate on page load with a left-to-right fill transition (duration: 600ms, ease-out)
- Zero-value bars display a minimal visible sliver rather than disappearing entirely, to confirm the bar is present and the value is genuinely zero

---

## 9. WORKFLOW DIAGRAMS

### 9.1 Appraisal Lifecycle

```
[Appraisal Period Opens]
        ↓
[Staff: Fill Self-Appraisal] → [Save Draft] ←→ [Auto-save]
        ↓
[Staff: Submit Appraisal]
        ↓
[Supervisor: Notified] → [Supervisor: Review & Rate]
        ↓
[Supervisor: Approve] OR [Supervisor: Return for Revision]
        ↓ (if approved)
[Counter-Signer: Notified] → [Counter-Signer: Review]
        ↓
[Counter-Signer: Approve] → [Appraisal LOCKED & Scored]
        ↓
[Score Published to Dashboard & Leaderboard]
```

### 9.2 Performance Contract Workflow

```
[Admin: Opens Contract Period]
        ↓
[Staff: Create Contract (KRAs/KPIs pre-loaded from template)]
        ↓
[Staff: Submit Contract]
        ↓
[Supervisor: Review & Approve]
        ↓
[Contract ACTIVE — used as basis for all 4 quarterly appraisals]
```

---

## 10. TEMPLATE USAGE USER FLOW

This section defines the end-to-end journey from template creation by the Administrator through to an employee completing a quarterly appraisal against that template. The flow is sequential and spans five stages within a single performance year.

Every user subject to appraisal — including Team Leads, Supervisors, Department Heads, and the Deputy Director — follows this same flow as an appraisee. Their seniority determines who their supervisor and counter-signing officer are, but the appraisal process, form structure, and input model are identical across all levels.

---

### Stage 1 — Administrator Creates or Manages Templates

The Administrator is responsible for building and maintaining the KRA/KPI template library before any performance contract can be initiated.

```
Admin logs in
        ↓
Admin navigates to: Admin → KRA/KPI Templates
        ↓
Admin selects: [Create New Template] OR [Clone Existing Template]
        ↓
Admin enters template metadata:
  - Template name (e.g. "Operations Staff 2026")
  - Scope: assign to a specific Department or set as Global
        ↓
Admin constructs the three-level hierarchy:

  Level 1 — KRA
    Admin enters: KRA serial number, KRA name, KRA weight
        ↓
  Level 2 — Objective (under each KRA)
    Admin enters: full Objective descriptive text (mandatory, no truncation),
                  Objective weight, Graded weight
        ↓
  Level 3 — KPI (under each Objective)
    Admin enters: KPI description, Target value, Unit of measurement,
                  Criteria values for each grade (O / E / VG / G / F / P)
        ↓
  Admin repeats for all KRAs, Objectives, and KPIs
        ↓
Admin saves and activates the template
Template is now available for assignment to staff contracts
```

> A template may be cloned from an existing one and modified. Modifications to a template do not affect Performance Contracts that are already active or approved.

---

### Stage 2 — Administrator Opens the Contract Period

```
Admin navigates to: Admin → Appraisal Periods
        ↓
Admin configures the contract creation window:
  - Sets open date and close date for contract submission
  - Assigns the relevant appraisal year
        ↓
Admin activates the period
        ↓
System dispatches notifications to all active staff:
  "Your Performance Contract for [Year] is now open for submission.
   Deadline: [Close Date]."
```

---

### Stage 3 — Staff Creates Their Performance Contract

```
Staff logs in → receives notification that contract period is open
        ↓
Staff navigates to: My Appraisal → My Contract → [Create Contract]
        ↓
System identifies the KRA/KPI template assigned to the staff member's
department and loads it into the contract form
        ↓
Contract form pre-populates with:
  ┌─────────────────────────────────────────────────────────┐
  │ Section 1  Employee information — auto-populated        │
  │            from user profile (read-only)                │
  │ Section 2  Supervisor information — auto-populated      │
  │            from supervisor_id relationship (read-only)  │
  │ Section 3  Counter-Signing Officer information —        │
  │            auto-populated from counter_signer_id        │
  │            relationship (read-only)                     │
  │ Section 4  KRAs, Objectives, KPIs — loaded from        │
  │            the assigned template (read-only)            │
  └─────────────────────────────────────────────────────────┘
        ↓
Staff reviews the pre-populated contract in full
        ↓
Staff submits the contract for approval
```

> Sections 1, 2, and 3 are never manually entered by the staff member. They are resolved automatically from the user profile and organisational hierarchy at the point the contract or appraisal is opened.

---

### Stage 4 — Contract Approval

```
Supervisor receives notification: "A performance contract awaits your review"
        ↓
Supervisor opens the contract → reviews KRAs, Objectives, KPIs, and targets
        ↓
        ├── [Approve] → contract proceeds to Counter-Signing Officer (if enabled)
        │                       ↓
        │           Counter-Signing Officer reviews → [Approve]
        │                       ↓
        │           Contract status → ACTIVE
        │
        └── [Return for Revision] → Staff notified → Staff amends → resubmits
        ↓
Contract status: ACTIVE
Contract is locked and becomes the immutable basis for all quarterly appraisals
in the current performance year. No further edits are permitted.
```

---

### Stage 5 — Quarterly Appraisal Cycle (Repeated Each Quarter)

Each quarter is an independent appraisal. Achievements are entered for that quarter only — they are not cumulative. The same approved contract feeds all four quarters.

```
Admin opens the appraisal period for the quarter (e.g. Q1)
        ↓
System notifies staff: "Q1 Appraisal is now open. Deadline: [Date]."
        ↓
Staff navigates to: My Appraisal → Current Quarter → [Start Appraisal]
        ↓
System creates a new appraisal record linked to the staff member's
ACTIVE contract for the current year
        ↓
Appraisal form loads:

  ┌─────────────────────────────────────────────────────────────────┐
  │ Sections 1–3  Auto-populated from user profiles (read-only)    │
  ├─────────────────────────────────────────────────────────────────┤
  │ Section 4     KRAs, Objectives, KPIs drawn from the approved   │
  │               contract (read-only)                             │
  │                                                                 │
  │               Employee input: ONE ACHIEVEMENT VALUE PER KPI    │
  │               — a single numeric entry in the KPI's unit of    │
  │               measurement representing actual performance for   │
  │               the quarter only (not cumulative)                │
  │                                                                 │
  │               System auto-computes on each entry:              │
  │               • Grade (by comparing achievement vs. criteria)  │
  │               • Raw Score                                       │
  │               • Weighted Raw Score                              │
  │               • Running Composite Score (real-time sidebar)    │
  ├─────────────────────────────────────────────────────────────────┤
  │ Section 5     Competency items from system configuration       │
  │               Targets displayed (read-only)                    │
  │               Employee input: ONE SCORE PER COMPETENCY ITEM    │
  │               — selected from the configured grade scale       │
  ├─────────────────────────────────────────────────────────────────┤
  │ Section 6     Operations items from system configuration       │
  │               Targets displayed (read-only)                    │
  │               Employee input: ONE SCORE PER OPERATIONS ITEM    │
  │               — a numeric entry up to the item's maximum       │
  ├─────────────────────────────────────────────────────────────────┤
  │ Section 7     Employee input: FREE-TEXT COMMENTS               │
  │               — strengths, areas for improvement,              │
  │                 appraisee remarks, and signature date          │
  └─────────────────────────────────────────────────────────────────┘
        ↓
Staff enters achievement values for the current quarter
  - Progress bars update in real time as KPIs are filled
  - Composite score panel updates in real time
  - Form auto-saves every 30 seconds
        ↓
Staff submits the appraisal
        ↓
Supervisor reviews, enters supervisor rating, approves or returns
        ↓
Counter-Signing Officer reviews and approves (if enabled)
        ↓
Appraisal status → APPROVED and LOCKED
Score published to: Staff Dashboard, Performance Overview, Leaderboard, Analytics
        ↓
Process repeats independently for Q2, Q3, and Q4
        ↓
Annual Score = weighted average of all approved quarterly scores
```

---

### Summary of Key Rules

| Rule | Detail |
|------|--------|
| All supervisory roles are also appraisees | Team Leads, Supervisors, Department Heads, and the Deputy Director each have their own performance contract and quarterly appraisals. Seniority determines who their supervisor is, not whether they are appraised. |
| One contract per staff per year | The same approved contract feeds all quarterly appraisals for that year |
| Template changes do not affect active contracts | Once a contract is approved and locked, it is immutable |
| Each quarter is independent | Achievement values are entered fresh each quarter; they are not cumulative |
| Sections 1–3 are never re-entered | Always auto-populated from the user profile and organisational hierarchy |
| KRAs, Objectives, and KPIs are never re-entered during appraisal | They are drawn from the approved contract and displayed read-only |
| Employee input in Section 4 | One numeric achievement value per KPI only — no questionnaire, no selection, no description writing |
| Employee input in Section 5 | One score per competency item, selected from the configured grade scale |
| Employee input in Section 6 | One numeric score per operations item |
| Employee input in Section 7 | Free-text comments, strengths, areas for improvement, and signature date |
| Score computation is fully automatic | Grade, Raw Score, Weighted Raw Score, and Composite Score are all calculated by the system upon Achievement entry — the employee never computes or enters a score |
| A user cannot review their own appraisal | The system enforces this through the supervisor_id relationship — a user's own appraisal record is never surfaced in their reviewer queue |

---

## 11. APPRAISAL PERIOD CONFIGURATION

Appraisal periods are fully managed by Admin in System Settings → Appraisal Periods. The number of periods, their labels, coverage dates, and submission windows are all configurable. The system ships with the following defaults pre-loaded:

| Label | Coverage | Submission Opens | Submission Closes |
|-------|----------|-----------------|-------------------|
| Q1 | Jan–Mar | 1 April | 15 April |
| Q2 | Apr–Jun | 1 July | 15 July |
| Q3 | Jul–Sep | 1 October | 15 October |
| Q4 | Oct–Dec | 1 January (next yr) | 15 January |

**Configurable options per period:**
- Label (e.g. "Q1", "First Half", "Annual")
- Coverage start and end dates
- Submission open and close dates
- Active/inactive toggle (deactivating a period hides it from staff)

**Reminder schedule** (configurable in System Settings → Notification Settings, defaults shown):
- 7 days before submission close
- 3 days before submission close
- 1 day before submission close
- Escalation alert: 2 working days after supervisor deadline passes without action

---

## 12. DEPARTMENT KRA TEMPLATES (Pre-loaded Defaults)

These templates are seeded into the KRA Template Library on first install. Each template preserves the full three-level hierarchy — KRA, Objective, and KPI — exactly as structured in the source Excel documents. The complete Objective text is stored and displayed in full at all times. All weights, Objective statements, KPI descriptions, and criteria values may be modified by an authorised Administrator without affecting Performance Contracts that are already active or approved.

The following illustrates the structure for selected departments. The full KPI detail (criteria values, units of measurement) for each entry is as extracted from the source templates.

---

### Account Department — HEAD Template

**KRA 1: Governance & Service Delivery** | Weight: 0.43

- **Objective:** Strengthen and institutionalize the effective utilization of the Performance Management System (PMS) to enhance accountability, performance tracking, and service delivery outcomes across SERVICOM. | Weight: 0.07 | Graded Weight: 0.75
  - KPI: PMS Implementation Rate across Units | Target: 100% | Unit: Percentage
  - KPI: Percentage of staff with completed and approved performance contract aligned to SERVICOM objectives | Target: 100% | Unit: Percentage
  - KPI: Percentage of performance reviews and appraisals completed within approved PMS timelines | Target: 100% | Unit: Percentage

- **Objective:** Initiate and institutionalize the digitization of records and work processes to improve information management, workflow efficiency, and readiness for the adoption of an Enterprise Content Management (ECM) system. | Weight: 0.08 | Graded Weight: 0.90
  - KPI: Percentage of Staff Trained on Digital Records and Workflow Management | Target: 50% | Unit: Percentage
  - KPI: Percentage increase in the use of digital documentation and approval processes compared to baseline | Target: 50% | Unit: Percentage
  - KPI: Percentage of Transactions Processed Digitally | Target: 75% | Unit: Percentage

**KRA 2: Financial Management, Budgeting, and Accounting Services** | Weight: 5.00

- **Objective:** Prepare and manage SERVICOM's annual budget in line with approved financial regulations. | Weight: 0.50 | Graded Weight: 5.61
  - KPI: Timely preparation and submission of annual budget | Target: 100% | Unit: Percentage
  - KPI: Percentage of budget estimates prepared in line with approved guidelines | Target: 100% | Unit: Percentage

- **Objective:** Ensure accurate financial record-keeping and proper retirement of advances. | Weight: 0.50 | Graded Weight: 5.61
  - KPI: Percentage of advances retired within approved timelines | Target: 100% | Unit: Percentage
  - KPI: Percentage of vouchers with complete and accurate supporting documents | Target: 100% | Unit: Percentage

- **Objective:** Ensure proper verification, processing, and payment of financial transactions. | Weight: 0.30 | Graded Weight: 3.37
  - KPI: Percentage of payment vouchers verified and processed in line with approval | Target: 100% | Unit: Percentage
  - KPI: Percentage of payments effected based on duly approved memos | Target: 100% | Unit: Percentage
  - KPI: Average turnaround time for processing payment vouchers | Target: 100% | Unit: Percentage

- **Objective:** Strengthen financial reporting and compliance with IPSAS (Accrual Basis). | Weight: 1.00 | Graded Weight: 11.23
  - KPI: Timely preparation and submission of annual financial statements | Target: 100% | Unit: Percentage
  - KPI: Level of compliance with IPSAS (Accrual) requirements | Target: 100% | Unit: Percentage

**KRA 3: Service Innovation and Improvement** | Weight: 0.25

- **Objective:** Strengthen a culture of innovation and technology adoption within SERVICOM by identifying, piloting, and implementing service-improvement initiatives, while actively promoting staff participation in the OHCSF Innovation Challenge. | Weight: 0.10 | Graded Weight: 1.12
  - KPI: Number of Innovation, Initiative, and Technology Ideas Generated | Target: 5 | Unit: Number
  - KPI: Percentage of Identified Innovations and Initiatives Implemented or Piloted | Target: 10% | Unit: Percentage
  - KPI: Number of SERVICOM Staff Participating in the OHCSF Innovation Challenge | Target: 2 | Unit: Number

**KRA 4: Automated Service Delivery** | Weight: 0.50

- **Objective:** Identify, prioritize, and automate key service delivery processes, forms, and routine tasks, while standardizing the use of official email communication to improve efficiency, accuracy, transparency, and accountability across SERVICOM. | Weight: 0.10 | Graded Weight: 1.12
  - KPI: Number of Processes, Forms, and Tasks Identified for Automation | Target: 5 | Unit: Number
  - KPI: Percentage of Identified Processes and Forms Automated or Digitized | Target: 20% | Unit: Percentage
  - KPI: Percentage of Staff Actively Using Official Email for Work-Related Communication | Target: 80% | Unit: Percentage

**KRA 5: Capacity Building** | Weight: 0.17

- **Objective:** Enhance the skills, competencies, and knowledge of SERVICOM staff through training, induction, and orientation, ensuring excellent service delivery, adoption of best practices, and seamless integration of new, transferred, and promoted staff within their respective units. | Weight: 0.10 | Graded Weight: 1.12
  - KPI: Percentage of all staff trained on service delivery standards, best practices, and functional skills | Target: 80% | Unit: Percentage
  - KPI: Percentage of new, transferred, and promoted staff successfully inducted/oriented within 30 days | Target: 80% | Unit: Percentage

**KRA 6: Support for Service Delivery** | Weight: 2.43

- **Objective:** Ensure the efficient and effective implementation of services and programmes within SERVICOM and streamline payment processes to guarantee that payments and staff claims are processed and disbursed within required timelines. | Weight: 1.00 | Graded Weight: 11.23
  - KPI: Percentage of services and programmes implemented within approved timelines | Target: 100% | Unit: Percentage
  - KPI: Percentage of payments and staff claims processed within the required timeline | Target: 100% | Unit: Percentage

- **Objective:** Strengthen regulatory compliance within SERVICOM by implementing robust financial control measures to prevent and eliminate cases of fraud, irregularities, and non-adherence to financial regulations and government policies. | Weight: 0.43 | Graded Weight: 4.81
  - KPI: Percentage compliance with financial regulations and government policies | Target: 100% | Unit: Percentage

**KRA 7: Staff Welfare** | Weight: 0.13

- **Objective:** Promote staff welfare, motivation, and recognition. | Weight: 0.07 | Graded Weight: 0.75
  - KPI: Staff satisfaction level with welfare and recognition initiatives | Target: 70% | Unit: Percentage

- **Objective:** Promote work-life balance, wellness, and staff health. | Weight: 0.07 | Graded Weight: 0.75
  - KPI: Number of wellness and fitness sessions conducted | Target: 5 | Unit: Number

---

### Admin Department — HEAD Template

**KRA 1: Governance & Service Delivery** | Weight: 5.20

- **Objective:** Strengthen and institutionalize the effective utilization of the Performance Management System (PMS) to enhance accountability, performance tracking, and service delivery outcomes across SERVICOM. | Weight: 0.60 | Graded Weight: 2.15
  - KPI: PMS Implementation Rate across Units | Target: 100% | Unit: Percentage
  - KPI: Percentage of staff with completed and approved performance contract aligned to SERVICOM objectives | Target: 100% | Unit: Percentage
  - KPI: Percentage of performance reviews and appraisals completed within approved PMS timelines | Target: 100% | Unit: Percentage

- **Objective:** Initiate and institutionalize the digitization of records and work processes to improve information management, workflow efficiency, and readiness for the adoption of an Enterprise Content Management (ECM) system. | Weight: 0.60 | Graded Weight: 2.15
  - KPI: Percentage of Staff Trained on Digital Records and Workflow Management | Target: 50% | Unit: Percentage
  - KPI: Percentage increase in the use of digital documentation and approval processes compared to baseline | Target: 50% | Unit: Percentage
  - KPI: Percentage of Transactions Processed Digitally | Target: 75% | Unit: Percentage

- **Objective:** Initiate and implement quarterly citizens and stakeholders engagement sessions to communicate SERVICOM activities and serve as a feedback mechanism. | Weight: 1.20 | Graded Weight: 4.30
  - KPI: Total number of quarterly engagement sessions held with citizens and stakeholders | Target: 4 | Unit: Number

- **Objective:** Promote disability inclusion and accessibility awareness within SERVICOM to ensure inclusive internal service processes, communication, and staff conduct. | Weight: 0.20 | Graded Weight: 0.72
  - KPI: Percentage of SERVICOM Staff Trained on Accessibility Practices and Disability Awareness | Target: 50% | Unit: Percentage
  - KPI: Percentage of SERVICOM public-facing information materials available in accessible formats | Target: 75% | Unit: Percentage

**KRA 2: Administrative Services, Staff Welfare, and Office Support** | Weight: 7.00

- **Objective:** Strengthen staff and nodal officers' engagements, planning, and organizational alignment. | Weight: 1.00 | Graded Weight: 3.58
  - KPI: Percentage of scheduled staff retreat conducted annually | Target: 80% | Unit: Percentage
  - KPI: Percentage of nodal officers' meetings held as scheduled | Target: 80% | Unit: Percentage

- **Objective:** Ensure availability and effective management of office logistics and assets. | Weight: 0.67 | Graded Weight: 2.39
  - KPI: Percentage of office vehicles in functional condition | Target: 80% | Unit: Percentage
  - KPI: Percentage of office equipment serviceable as at when due | Target: 80% | Unit: Percentage
  - KPI: Average response time to maintenance requests | Target: 80% | Unit: Percentage

- **Objective:** Ensure efficient records management and file movement. | Weight: 0.50 | Graded Weight: 1.79
  - KPI: Percentage of file requests attended to without delay | Target: 80% | Unit: Percentage
  - KPI: Accuracy of file tracking and movement records | Target: 100% | Unit: Percentage

- **Objective:** Ensure effective handling of office correspondence and mail dispatch. | Weight: 0.50 | Graded Weight: 1.79
  - KPI: Percentage of incoming correspondence received and registered same day | Target: 90% | Unit: Percentage
  - KPI: Percentage of outgoing correspondence dispatched within timelines | Target: 80% | Unit: Percentage

- **Objective:** Ensure efficient, transparent, and timely management of stores and inventory through proper custody, issuance, and replenishment of consumables and assets in support of uninterrupted administrative and operational activities within SERVICOM. | Weight: 0.50 | Graded Weight: 1.79
  - KPI: Percentage of store items accurately recorded in the store ledger/inventory system | Target: 100% | Unit: Percentage
  - KPI: Percentage of items restocked within approved timelines after reaching reorder level | Target: 80% | Unit: Percentage
  - KPI: Percentage of store items with updated bin cards or inventory records | Target: 100% | Unit: Percentage

---

### Operations Department — HEAD Template

**KRA 1: Governance & Service Delivery** | Weight: 2.23

- **Objective:** Strengthen and institutionalize the effective utilization of the Performance Management System (PMS) to enhance accountability, performance tracking, and service delivery outcomes across SERVICOM. | Weight: 0.07 | Graded Weight: 0.32
  - KPI: PMS Implementation Rate across Units | Target: 100% | Unit: Percentage
  - KPI: Percentage of staff with completed and approved performance contract aligned to SERVICOM objectives | Target: 100% | Unit: Percentage
  - KPI: Percentage of performance reviews and appraisals completed within approved PMS timelines | Target: 100% | Unit: Percentage

- **Objective:** Initiate and implement quarterly citizens and stakeholders engagement sessions to communicate SERVICOM activities and serve as a feedback mechanism. | Weight: 1.60 | Graded Weight: 7.73
  - KPI: Total number of quarterly engagement sessions held with citizens and stakeholders | Target: 4 | Unit: Number

- **Objective:** Promote disability inclusion and accessibility awareness within SERVICOM. | Weight: 0.10 | Graded Weight: 0.48
  - KPI: Percentage of SERVICOM Staff Trained on Accessibility Practices and Disability Awareness | Target: 50% | Unit: Percentage
  - KPI: Percentage of SERVICOM public-facing information materials available in accessible formats | Target: 75% | Unit: Percentage

**KRA 2: Service Delivery Monitoring, Evaluation, and Compliance** | Weight: 10.00

- **Objective:** Conduct SERVICOM Compliance Evaluations (SCE) across MDAs to assess service delivery performance. | Weight: 0.50 | Graded Weight: 2.41
  - KPI: Number of MDAs evaluated through SCE annually | Target: 30 | Unit: Number
  - KPI: Percentage of planned SCE exercises conducted as scheduled | Target: 100% | Unit: Percentage
  - KPI: Timeliness of completion of SCE assessments and reports | Target: 90% | Unit: Percentage

- **Objective:** Present evaluation findings to MDAs to drive service improvement. | Weight: 0.50 | Graded Weight: 2.41
  - KPI: Percentage of SCE reports presented to evaluated MDAs | Target: 100% | Unit: Percentage
  - KPI: Timeliness of presentation after completion of evaluations | Target: 90% | Unit: Percentage

- **Objective:** Promote continuous performance improvement and accountability through engagement platforms. | Weight: 1.00 | Graded Weight: 4.83
  - KPI: Number of breakfast meetings and networking seminars held | Target: 4 | Unit: Number
  - KPI: Level of participation by MDAs and service heads | Target: 90% | Unit: Percentage

- **Objective:** Assess functionality and effectiveness of SERVICOM structures within MDAs. | Weight: 1.00 | Graded Weight: 4.83
  - KPI: Number of MSU functionality evaluations conducted | Target: 20 | Unit: Number
  - KPI: Percentage of evaluated MSUs meeting minimum functionality standards | Target: 80% | Unit: Percentage

- **Objective:** Sensitize MDAs and stakeholders on grievance redress and service standards. | Weight: 0.50 | Graded Weight: 2.41
  - KPI: Number of GRM sensitization programmes conducted | Target: 6 | Unit: Number
  - KPI: Level of MDA participation in Customer Service Week | Target: 100% | Unit: Percentage

- **Objective:** Support year-end performance review and institutional learning. | Weight: 0.75 | Graded Weight: 3.62
  - KPI: Timely completion of end-of-year operational reports | Target: 100% | Unit: Percentage
  - KPI: Percentage of operational activities reviewed and documented | Target: 100% | Unit: Percentage

- **Objective:** Facilitate Service Charter development. | Weight: 1.00 | Graded Weight: 4.83
  - KPI: Percentage of MDAs with implementable Service Charters | Target: 90% | Unit: Percentage

**KRA 3: Legal Advisory and Compliance Services** | Weight: 2.00

- **Objective:** Provide legal advisory services and ensure compliance with applicable laws and regulations to safeguard SERVICOM's operations and interests. | Weight: 0.25 per KPI | Graded Weight: 1.21 per KPI
  - KPI: Percentage of requests for legal advice responded to within specified timelines | Target: 100%
  - KPI: Percentage of contracts and agreements reviewed before execution | Target: 100%
  - KPI: Percentage of SERVICOM activities compliant with applicable legal and regulatory requirements | Target: 90%
  - KPI: Percentage of legal documents prepared accurately and within required timelines | Target: 90%
  - KPI: Percentage of legal records properly maintained and easily retrievable | Target: 80%
  - KPI: Percentage of procurement and administrative processes reviewed for legal compliance | Target: 100%
  - KPI: Percentage of identified legal risks addressed with appropriate legal advice | Target: 100%
  - KPI: Percentage of legal issues handled in accordance with legal procedures and timelines | Target: 100%

**KRA 4: Procurement and Contract Management** | Weight: 3.00

- **Objective:** Ensure transparent, efficient, and compliant procurement processes that support timely acquisition of goods, works, and services to enhance effective service delivery in SERVICOM. | Weight: 0.38 per KPI | Graded Weight: 1.81 per KPI
  - KPI: Percentage of annual procurement plan developed and approved within first quarter | Target: 100%
  - KPI: Percentage of procurement processes compliant with procurement regulations | Target: 100%
  - KPI: Percentage of procurement requests processed within approved timelines | Target: 90%
  - KPI: Percentage of procurement processes conducted using approved procurement methods | Target: 90%
  - KPI: Percentage of procurement records properly documented and retrievable | Target: 80%
  - KPI: Percentage of contracts executed in accordance with agreed terms and timelines | Target: 100%
  - KPI: Percentage of procurement requests supported with appropriate procurement guidance | Target: 100%
  - KPI: Percentage of procurement activities conducted without audit queries or compliance issues | Target: 100%

---

### Admin Department — Staff Template (ABDULLAHI ISAH)

**KRA 1: PMS Compliance & Performance Management** | Weight: 2.15

- **Objective:** Develop and submit personal performance contract with clearly defined (SMART) targets aligned to SERVICOM and unit objectives. | Weight: 0.43 | Graded Weight: 1.62
  - KPI: Timely submission of performance contract (within approved timeline) | Target: 100%

- **Objective:** Participate in PMS trainings and capacity-building sessions to enhance understanding of PMS processes. | Weight: 0.43 | Graded Weight: 1.62
  - KPI: Percentage of assigned PMS trainings attended | Target: 100%

- **Objective:** Complete and submit quarterly self-appraisal reports within approved timelines. | Weight: 0.43 | Graded Weight: 1.62
  - KPI: Percentage of quarterly appraisals submitted on time | Target: 100%

- **Objective:** Engage in periodic performance review discussions with supervisor and implement feedback. | Weight: 0.43 | Graded Weight: 1.62
  - KPI: Number of review sessions attended and feedback implemented | Target: 5

- **Objective:** Maintain accurate personal performance records and supporting evidence for appraisal. | Weight: 0.43 | Graded Weight: 1.62
  - KPI: Completeness of appraisal documentation (no gaps/errors) | Target: 100%

**KRA 2: Records & Workflow Digitization** | Weight: 2.15

- **Objective:** Scan and digitize physical records into electronic formats. | Weight: 1.07 | Graded Weight: 4.05
  - KPI: Percentage of targeted records digitized | Target: 50%

- **Objective:** Ensure secure storage and backup of digitized records. | Weight: 1.07 | Graded Weight: 4.05
  - KPI: Percentage of records backed up successfully | Target: 50%

**KRA 3: Records & Administrative Coordination** | Weight: 14.30

- **Objective:** Supervise registry operations and ensure proper filing system. | Weight: 2.86 | Graded Weight: 10.79
  - KPI: Percentage of files accurately classified and stored | Target: 80%

- **Objective:** Coordinate movement and tracking of files across units. | Weight: 2.86 | Graded Weight: 10.79
  - KPI: Percentage of files delivered within stipulated timelines | Target: 80%

- **Objective:** Maintain updated records database/register. | Weight: 2.86 | Graded Weight: 10.79
  - KPI: Percentage of records updated and retrievable within required time | Target: 80%

- **Objective:** Facilitate staff and nodal officers' document access. | Weight: 2.86 | Graded Weight: 10.79
  - KPI: Percentage of requests attended to within agreed timeframe | Target: 100%

- **Objective:** Generate periodic registry reports. | Weight: 2.86 | Graded Weight: 10.79
  - KPI: Percentage of reports submitted on schedule | Target: 90%

---

### Operations Department — Staff Template (OLEH NNEKA)

**KRA 1: PMS Compliance & Performance Management** | Weight: 1.70

- **Objective:** Develop and submit personal performance contract with clearly defined (SMART) targets aligned to SERVICOM and unit objectives. | Weight: 0.34
  - KPI: Timely submission of performance contract (within approved timeline) | Target: 100%

- **Objective:** Participate in PMS trainings and capacity-building sessions to enhance understanding of PMS processes. | Weight: 0.34
  - KPI: Percentage of assigned PMS trainings attended | Target: 100%

- **Objective:** Complete and submit quarterly self-appraisal reports within approved timelines. | Weight: 0.34
  - KPI: Percentage of quarterly appraisals submitted on time | Target: 100%

- **Objective:** Engage in periodic performance review discussions with supervisor and implement feedback. | Weight: 0.34
  - KPI: Number of review sessions attended and feedback implemented | Target: 5

- **Objective:** Maintain accurate personal performance records and supporting evidence for appraisal. | Weight: 0.34
  - KPI: Completeness of appraisal documentation (no gaps/errors) | Target: 100%

**KRA 2: Digital Records & Workflow Support** | Weight: 1.02

- **Objective:** Digitize and electronically file physical records. | Weight: 1.02
  - KPI: Percentage of assigned records digitized | Target: 50%

**KRA 3: Service Delivery Evaluation Support** | Weight: 90.60

- **Objective:** Participate in SERVICOM Compliance Evaluations (SCE). | Weight: 9.06
  - KPI: Percentage of assigned evaluations completed | Target: 80%

- **Objective:** Collect and document data during evaluations. | Weight: 9.06
  - KPI: Percentage of data collected accurately and completely | Target: 100%

- **Objective:** Support analysis of service delivery performance in MDAs. | Weight: 9.06
  - KPI: Percentage of analysis completed and submitted on time | Target: 90%

- **Objective:** Assist in preparation of evaluation reports. | Weight: 9.06
  - KPI: Percentage of reports prepared without errors | Target: 80%

- **Objective:** Assist in assessing SERVICOM structures in MDAs. | Weight: 9.06
  - KPI: Percentage of assessments conducted as assigned | Target: 90%

- **Objective:** Support development of Service Charters. | Weight: 9.06
  - KPI: Percentage of charter documents supported and completed | Target: 80%

- **Objective:** Track implementation of recommendations by MDAs. | Weight: 9.06
  - KPI: Percentage of follow-up activities completed | Target: 90%

- **Objective:** Maintain proper documentation of evaluation activities. | Weight: 9.06
  - KPI: Percentage of records properly filed and retrievable | Target: 80%

- **Objective:** Provide field reports and feedback to Team Lead. | Weight: 9.06
  - KPI: Percentage of reports submitted on time | Target: 80%

- **Objective:** Support year-end review and lessons learned documentation. | Weight: 9.06
  - KPI: Percentage of inputs submitted as required | Target: 80%

---

## 13. IMPLEMENTATION ROADMAP

### Phase 1 — Foundation (Weeks 1–4)
- [ ] Project setup (Laravel API + React frontend)
- [ ] Database schema implementation (core + all configuration tables)
- [ ] Authentication & role-based access control
- [ ] User and department management
- [ ] Org chart configuration
- [ ] **Seed all defaults** (grade scale, competencies, operations items, appraisal periods, KRA templates, scoring weights) from existing Excel templates

### Phase 2 — Core PMS (Weeks 5–10)
- [ ] Performance contract module
- [ ] KRA/KPI template library (pre-load all department templates)
- [ ] Quarterly appraisal form (Sections 1–7)
- [ ] **Config-driven scoring engine** (reads weights, grade scale, competencies, operations items from DB at runtime)
- [ ] Approval workflow (config-driven steps from `workflow_approval_steps`)
- [ ] **System Configuration UI** (Admin settings for all configurable defaults)

### Phase 3 — Dashboard & Analytics (Weeks 11–14)
- [ ] Role-based dashboards (Staff, Supervisor, Head, Director, NC)
- [ ] Leaderboard module
- [ ] Performance analytics (trends, KRA breakdown, competency radar)
- [ ] Notification system (email + in-app)

### Phase 4 — Reports & Polish (Weeks 15–17)
- [ ] PDF report generation (matching Excel template layout)
- [ ] Excel export
- [ ] Compliance reports
- [ ] Mobile responsiveness
- [ ] Accessibility audit

### Phase 5 — Testing & Launch (Weeks 18–20)
- [ ] User acceptance testing with SERVICOM staff
- [ ] Data migration (import existing staff records)
- [ ] Staff training
- [ ] Go-live

---

## 14. RISKS & MITIGATIONS

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Staff resistance to digital adoption | Medium | High | Training sessions; intuitive UI; parallel run with Excel for Q1 |
| KPI weight inconsistencies across templates | High | Medium | Admin can adjust weights per staff; audit log tracks changes |
| Supervisor bottleneck in approvals | Medium | High | Escalation alerts; deputy approval fallback |
| Data loss during migration | Low | High | Backup before migration; staged rollout |
| IPPIS number mismatches | Medium | Medium | Validation on import; manual override with audit trail |

---

## 15. SUCCESS METRICS

| Metric | Target |
|--------|--------|
| Appraisal completion rate | ≥ 95% per quarter |
| Average time to supervisor approval | ≤ 5 working days |
| Staff satisfaction with PMS tool | ≥ 80% positive |
| Score calculation accuracy | 100% (vs. Excel baseline) |
| System uptime | ≥ 99.5% |
| Report generation time | ≤ 10 seconds |

---

## 16. GLOSSARY

| Term | Definition |
|------|-----------|
| KRA | Key Result Area — broad performance domain |
| KPI | Key Performance Indicator — measurable metric within an objective |
| PMS | Performance Management System |
| SCE | SERVICOM Compliance Evaluation |
| MSU | Ministerial SERVICOM Unit |
| IPPIS | Integrated Payroll and Personnel Information System |
| GRM | Grievance Redress Mechanism |
| MDA | Ministry, Department, or Agency |
| OHCSF | Office of the Head of the Civil Service of the Federation |
| IPSAS | International Public Sector Accounting Standards |
| NC | National Coordinator |
| PA | Personal Assistant |

---

*End of Product Design Artifact — SERVICOM PMS v1.1*
