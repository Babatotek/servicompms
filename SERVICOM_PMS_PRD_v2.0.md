# SERVICOM ePMS — Product Requirements Document v2.0
## Authoritative Reference Document

**Version:** 2.0
**Date:** May 2026
**Organisation:** SERVICOM (Service Compact with All Nigerians)
**Basis:** Direct analysis of `final_SERVICOM_2026_MPMS.xlsx`, `CONTRACT/` workbooks, and `APPRAISAL/` workbooks

---

## REVISION HISTORY

| Version | Date | Description |
|---------|------|-------------|
| 1.0 | May 2026 | Initial PDA from Excel template analysis |
| 1.1 | May 2026 | Configuration-driven architecture added |
| 1.2 | May 2026 | MPMS two-tier architecture added; department name corrections |
| 2.0 | May 2026 | Full rewrite grounded in direct Excel file reading. Corrects MPMS cascade relationship, competency profiles, department names, and eliminates all ambiguity in user operation flow. |

---

## 1. EXECUTIVE SUMMARY

SERVICOM manages performance through a single integrated Excel-based system with two expression layers:

1. **Institutional MPMS** (`final_SERVICOM_2026_MPMS.xlsx`) — SERVICOM's organisational performance plan submitted annually to the Presidency/OHCSF. This is the **master document**. It defines all KRAs, Objectives, and KPIs at the organisational level, structured across three OHCSF priority categories and six sheets.

2. **Individual Staff PMS** (`CONTRACT/` and `APPRAISAL/` workbooks) — Each staff member's annual performance contract and quarterly appraisals. The KRAs and KPIs in every individual contract are **directly cascaded from the MPMS**. Individual contracts add role-specific KRAs on top of the MPMS base but never contradict it.

The digital ePMS replaces both layers with a single web application. The MPMS KPI library is the seed source for all department templates. Individual contracts are built from those templates. Quarterly appraisal achievements roll back up to feed the MPMS institutional score.

---

## 2. VERIFIED ORGANISATIONAL STRUCTURE

### 2.1 Departments (confirmed from Excel files)

| Folder Name | Actual Department Name | Unit Weight (Sheet8) |
|---|---|---|
| ACCOUNT | FINANCE AND ACCOUNT | 5 |
| ADMIN | ADMIN | 7 |
| AUDIT | INTERNAL AUDIT | 3 |
| ICT | ICT | 5 |
| NC | NC OFFICE | 3 |
| OPERATIONS | OPERATIONS | 10 |
| PA | PUBLIC AWARENESS | 7 |
| — | SERVICOM INSTITUTE | 5 |
| — | PROCUREMENT | 3 |
| — | LEGAL | 2 |
| **TOTAL** | | **50** |


### 2.2 Staff Hierarchy (confirmed from contract files)

```
DEPUTY DIRECTOR: HELEN LAWAL OBEHI (IPPIS: 60529)
  — top-level supervisor and counter-signing officer for all departments

NC OFFICE
  └── [staff TBC]

PUBLIC AWARENESS
  ├── HEAD: OKOKON HENRIETTA (IPPIS: 168083, Asst. Director)
  └── UTUTAH EMMANUEL (IPPIS: 359823, CCO)

FINANCE AND ACCOUNT
  ├── HEAD: ODUMU GODWIN (IPPIS: 371546, PEOI)
  ├── OLADIMEJI FUNMILAYO
  └── OMEGO HILARY

ADMIN
  ├── HEAD: NWABUA CHINYERE (IPPIS: 64218, Asst. Chief Confidential Secretary)
  ├── ABDULLAHI ISAH (IPPIS: 88717, AO II)
  ├── AMOS OBINNA
  ├── DANABUYI SAMSON
  ├── KAURA ISAIAH
  ├── MOHAMMED MUSA
  ├── NWACHUKWU THANKGOD
  └── YUNUSA GAMBO

INTERNAL AUDIT
  ├── HEAD
  └── OMAKWU PETER

ICT
  └── HEAD

OPERATIONS
  ├── HEAD: AKINBODEWA NGOZI (Deputy Director)
  ├── Team A: OLEH NNEKA (Lead), SHITTU OYELUDE
  ├── Team B: ONCHE BEN (Lead), SESUGH DURUBA, TUBI-TOLULOPE
  ├── Team C: IGWILO ESTHER, OBE NAT, OCHELEBE ANTHONY, OLANIYAN KIKELOMO
  └── Team D: MAGAJI MEDINATU, NASIR MOHAMMED, NNANNA ROSE, ZACK-UKOH LUCY

SERVICOM INSTITUTE  [staff TBC — MPMS only]
PROCUREMENT         [staff TBC — MPMS only]
LEGAL               [staff TBC — MPMS only]
```

---

## 3. THE MPMS CASCADE — HOW DOCUMENTS RELATE

This is the single most important architectural fact confirmed by direct file reading:

```
MPMS (final_SERVICOM_2026_MPMS.xlsx)
  — Master document. Defines all institutional KRAs, Objectives, KPIs.
  — Structured across 3 OHCSF priority categories + 2 unit-specific sheets.
  — Each KPI has a Lead Unit and Support Unit(s).
        ↓  CASCADES DOWN INTO
Department KRA Templates
  — Admin builds these from the MPMS KPI library.
  — Every MPMS KRA appears verbatim in the relevant department template.
  — Department-specific KRAs (e.g. "Records & Administrative Coordination"
    for Admin staff) are ADDITIONS on top of the MPMS base.
        ↓  PRE-LOADED INTO
Individual Performance Contract (per staff, per year)
  — Staff contract = MPMS-derived KRAs + role-specific KRAs.
  — Sections 1–3 auto-populated from user profile.
  — Section 4 KRAs/Objectives/KPIs loaded from department template.
  — Contract is submitted → approved → LOCKED.
        ↓  DRIVES
Quarterly Appraisal (Q1–Q4, per staff)
  — Staff enters ONE achievement value per KPI.
  — System auto-computes grade, raw score, weighted score.
  — Approved appraisal is immutable.
        ↓  SCORES ROLL UP INTO
Department Aggregate Score
        ↓  FEEDS BACK INTO
MPMS Achievement Reporting
  — Department Heads enter actual achievement values for their Lead Unit KPIs.
  — System computes weighted institutional score per priority category.
        ↓
Institutional MPMS Export
  — NC/Deputy Director approves and triggers export.
  — Output: exact replica of final_SERVICOM_2026_MPMS.xlsx with Achievement column filled.
  — Submitted to Presidency / OHCSF.
```

---

## 4. MPMS STRUCTURE (verified from Excel)

### 4.1 Priority Categories (fixed — cannot be renamed or reweighted by Admin)

| Category | Sheet | Weight |
|---|---|---|
| Presidential Priorities | PRESIDENTIAL | 13% |
| MDA Operational Priorities | MDA OPERATIONAL | 25% |
| Service-Wide Priorities | SERVICE WIDE | 37% |
| Unit Contributions | Sheet8 | 25% |


### 4.2 MPMS KRAs by Sheet (verified from Excel)

**PRESIDENTIAL (13%)**
- KRA 1: Governance & Service Delivery (weight: 13)
  - Objectives: PMS utilisation, Records digitisation, Citizen engagement, Disability inclusion
  - Lead Units: Administration (60%), ICT (50%), Operations (40%)

**MDA OPERATIONAL (25%)**
- KRA 1: Service Delivery Monitoring, Evaluation & Compliance (weight: 10) — Lead: OPERATIONS
- KRA 2: Administrative Services, Staff Welfare & Office Support (weight: 7) — Lead: ADMIN
- KRA 3: Public Awareness, Advocacy & Citizen Engagement (weight: 7) — Lead: PUBLIC AWARENESS
- KRA 4: Financial Management, Budgeting & Accounting Services (weight: 5) — Lead: FINANCE AND ACCOUNT
- KRA 5: Internal Audit, Financial Control & Compliance Assurance (weight: 3) — Lead: INTERNAL AUDIT
- KRA 6: ICT Governance, Digital Transformation & Information Security (weight: 5) — Lead: ICT
- KRA 7: MDA-wide Staff Development, Training & Capacity Enhancement (weight: 5) — Lead: SERVICOM INSTITUTE
- KRA 8: Executive Administration, Secretariat & Strategic Support (weight: 3) — Lead: OPERATIONS

**SERVICE WIDE (37%)**
- KRA 1: Service Innovation And Improvement (weight: 5) — Lead: ICT 70%
- KRA 2: Stakeholder Engagement MDA (weight: 5) — Lead: Operations 40%
- KRA 3: Automated Service Delivery (weight: 5) — Lead: ICT 40%
- KRA 4: Capacity Building (weight: 5) — Lead: Administration 80%
- KRA 5: Support For Service Delivery (weight: 7) — Lead: FINANCE AND ACCOUNT
- KRA 6: Staff Welfare (weight: 10) — Lead: Administration 100%

**PROCUREMENT sheet (MDA Operational)**
- KRA 1: Procurement and Contract Management (weight: 3) — Lead: PROCUREMENT

**LEGAL sheet (MDA Operational)**
- KRA 1: Legal Advisory and Compliance Services (weight: 2) — Lead: LEGAL

### 4.3 How Individual Contracts Map to MPMS

Every KRA in an individual staff contract traces directly to an MPMS KRA. Confirmed by comparing ACCOUNT HEAD contract with MPMS:

| Individual Contract KRA | Source MPMS KRA | MPMS Sheet |
|---|---|---|
| Governance & Service Delivery | KRA 1 | PRESIDENTIAL |
| Financial Management, Budgeting & Accounting | KRA 4 | MDA OPERATIONAL |
| Service Innovation And Improvement | KRA 1 | SERVICE WIDE |
| Automated Service Delivery | KRA 3 | SERVICE WIDE |
| Capacity Building | KRA 4 | SERVICE WIDE |
| Support For Service Delivery | KRA 5 | SERVICE WIDE |
| Staff Welfare | KRA 6 | SERVICE WIDE |

Role-specific KRAs added on top (not in MPMS):
- ADMIN staff: Records & Administrative Coordination, PMS Compliance & Performance Management
- OPERATIONS staff: Service Delivery Evaluation Support, Digital Records & Workflow Support

---

## 5. COMPETENCY PROFILES (verified from Excel)

Direct reading of CONTRACT files confirms **one competency profile used across all staff** — both Heads and junior staff use the same items. The v1.2 PRD claim of two profiles was incorrect.

**Single Competency Profile (all designations — confirmed from HEAD and ABDULLAHI_ISAH contracts):**

| Cluster | Item | Target |
|---|---|---|
| Generic | Leadership Skill | 3 |
| Generic | Managing & Developing People | 3 |
| Generic | Effective Communication | 3 |
| Functional | Strategic Thinking | 3 |
| Functional | Drive for Results | 2 |
| Functional | Transparency and Accountability | 2 |
| Ethics & Values | Integrity | 2 |
| Ethics & Values | Citizen Focus | 1 |
| Ethics & Values | Courage | 1 |

**Note:** The APPRAISAL/ACCOUNT/HEAD.xlsx quarterly appraisal form uses a different set (Drive for Results, Collaborating & Partnering, Policy Management, etc.). This appears to be a legacy appraisal form that was not updated when the contract was revised. The CONTRACT files are the authoritative source. The system should use the CONTRACT-derived competency profile.

---

## 6. SECTION 6 — OPERATIONS & PROCESSES (verified from Excel)

Confirmed from CONTRACT/ACCOUNT/ACCOUNT.xlsx (HEAD sheet):

| Item | Target | Max |
|---|---|---|
| Punctuality / Attendance | 4 | 4 |
| Work Turnaround Time | 4 | 4 |
| Innovation on the Job | 2 | 2 |
| **Total** | **10** | **10** |

Note: The PDA v1.1 stated totals of 20 points. The actual Excel files show a total of 10. The system must use the values from the CONTRACT files, not the PDA.

---

## 7. SCORING MODEL (verified from Excel)

### 7.1 Section Weights

| Section | Weight |
|---|---|
| Section 4 — Task Performance (KRAs/KPIs) | 70% |
| Section 5 — Competencies | 20% |
| Section 6 — Operations & Processes | 10% |

### 7.2 Grade Scale (confirmed from CONTRACT files)

| Key | Label | Criteria |
|---|---|---|
| O | Outstanding | 100% (or >threshold) |
| E | Excellent | 90–99% |
| VG | Very Good | 80–89% |
| G | Good | 70–79% |
| F | Fair | 60–69% |
| P | Poor | 50–59% |

### 7.3 KPI Scoring Mechanics

Each KPI row in Section 4 contains:
- Target Set (numeric)
- Unit of Measurement (PERCENTAGE or NUMBER)
- Criteria Values: O, E, VG, G, F, P (six threshold columns)
- Achievement (entered by staff — one value per KPI per quarter)
- Raw Score (auto-computed: 5=O, 4=E, 3=VG, 2=G, 1=F, 0=P)
- Weighted Raw Score = Raw Score × Graded Weight

The Graded Weight is pre-computed in the contract from the formula:
`Graded Weight = (Objective Weight / Total Objective Weights) × (70 / Max Raw Score)`

---

## 8. USER ROLES

Every user except Super Admin holds two simultaneous contexts.

| Role | Appraisee | Appraiser | MPMS |
|---|---|---|---|
| Super Admin | No | Full system access | Manages MPMS library, unit weights |
| NC | Yes — appraised at executive level | Counter-signs all | Approves institutional score, triggers export |
| Deputy Director | Yes | Counter-signs escalated appraisals | Reviews consolidated MPMS score |
| Department Head | Yes | Reviews all dept staff appraisals | Enters achievement for Lead Unit KPIs |
| Team Lead | Yes | Rates direct reports | None |
| Staff | Yes | None | None |


---

## 9. COMPLETE USER OPERATION FLOW

This section defines the exact sequence of operations every user type performs, in order. There is no ambiguity — each step has one owner and one outcome.

### 9.1 Admin Setup Flow (once per year, before anything else)

```
Step 1 — Seed / Update MPMS KPI Library
  Admin → MPMS → KPI Library
  Admin reviews the three priority category sheets (PRESIDENTIAL, MDA OPERATIONAL, SERVICE WIDE)
  plus PROCUREMENT and LEGAL sheets.
  Admin adds/edits KRAs, Objectives, KPIs, targets, Lead Units, Support Units.
  The three priority categories are fixed labels — Admin cannot rename or reweight them.
  Unit weights (Sheet8) are configurable per year.
  OUTPUT: MPMS KPI library is current for the performance year.

Step 2 — Build / Update Department KRA Templates
  Admin → Admin Settings → KRA Template Library
  For each department, Admin creates or updates the template by:
    a) Pulling the relevant MPMS KRAs that apply to that department
       (based on Lead Unit and Support Unit assignments)
    b) Adding any department-specific KRAs not in the MPMS
       (e.g. "Records & Administrative Coordination" for Admin staff)
  Templates are versioned. Changes do not affect already-active contracts.
  OUTPUT: One template per department/role type, ready for contract creation.

Step 3 — Configure Appraisal Periods
  Admin → Admin Settings → Appraisal Periods
  Admin sets Q1–Q4 coverage dates, submission open/close dates for the year.
  OUTPUT: Four active appraisal periods for the year.

Step 4 — Open Performance Contract Period
  Admin → Admin Settings → Appraisal Periods → Open Contract Window
  System sends notification to all active staff:
  "Your Performance Contract for [Year] is now open. Deadline: [Date]."
  OUTPUT: Staff can now create their contracts.
```

### 9.2 Individual Staff Flow — Performance Contract (once per year)

Every staff member from Staff through Deputy Director follows this flow as an appraisee.

```
Step 1 — Receive notification that contract period is open.

Step 2 — Navigate to: My Appraisal → My Contract → [Create Contract]
  System identifies the KRA template assigned to the staff member's department.
  System pre-populates the contract form:
    Section 1: Employee info — auto-populated from user profile (READ ONLY)
    Section 2: Supervisor info — auto-populated from supervisor_id (READ ONLY)
    Section 3: Counter-Signing Officer — auto-populated from counter_signer_id (READ ONLY)
    Section 4: KRAs, Objectives, KPIs — loaded from department template (READ ONLY)
  Staff reviews the pre-populated contract. No data entry required in Sections 1–4.

Step 3 — Staff submits the contract.
  Status: DRAFT → SUBMITTED

Step 4 — Supervisor receives notification: "Contract awaiting your review."
  Supervisor opens Team / Unit → Pending Reviews
  Supervisor reviews KRAs, Objectives, KPIs, targets.
  Supervisor either:
    [Approve] → contract routes to Counter-Signing Officer (if configured)
    [Return]  → staff notified, staff amends and resubmits

Step 5 — Counter-Signing Officer reviews and approves.
  Status: SUBMITTED → APPROVED → ACTIVE
  Contract is now LOCKED. No further edits permitted.
  This locked contract is the immutable basis for all four quarterly appraisals.
```

### 9.3 Individual Staff Flow — Quarterly Appraisal (four times per year)

Each quarter is independent. Achievements are for that quarter only — not cumulative.

```
Step 1 — Admin opens the appraisal period for the quarter (e.g. Q1).
  System notifies all staff: "Q1 Appraisal is now open. Deadline: [Date]."

Step 2 — Staff navigates to: My Appraisal → Current Quarter → [Start Appraisal]
  System creates a new appraisal record linked to the staff member's ACTIVE contract.
  Appraisal form loads:

  ┌─────────────────────────────────────────────────────────────────┐
  │ Sections 1–3  Auto-populated from user profile (READ ONLY)     │
  ├─────────────────────────────────────────────────────────────────┤
  │ Section 4     KRAs, Objectives, KPIs from locked contract      │
  │               (READ ONLY — no re-entry)                        │
  │                                                                 │
  │               STAFF INPUT: ONE achievement value per KPI       │
  │               — numeric, in the KPI's unit of measurement      │
  │               — represents actual performance this quarter only │
  │                                                                 │
  │               SYSTEM AUTO-COMPUTES on each entry:              │
  │               • Grade (O/E/VG/G/F/P vs criteria thresholds)    │
  │               • Raw Score (5/4/3/2/1/0)                        │
  │               • Weighted Raw Score (Raw × Graded Weight)       │
  │               • Running Section 4 composite (real-time)        │
  ├─────────────────────────────────────────────────────────────────┤
  │ Section 5     Competency items (from system config)            │
  │               Targets displayed (READ ONLY)                    │
  │               STAFF INPUT: one score per competency item       │
  ├─────────────────────────────────────────────────────────────────┤
  │ Section 6     Operations items (from system config)            │
  │               Targets displayed (READ ONLY)                    │
  │               STAFF INPUT: one numeric score per item          │
  ├─────────────────────────────────────────────────────────────────┤
  │ Section 7     STAFF INPUT: free-text comments, strengths,      │
  │               areas for improvement, signature date            │
  └─────────────────────────────────────────────────────────────────┘

  Form auto-saves every 30 seconds.
  Composite score updates in real time as achievement values are entered.

Step 3 — Staff submits the appraisal.
  Status: DRAFT → SUBMITTED

Step 4 — Supervisor receives notification: "Appraisal awaiting your review."
  Supervisor opens Team / Unit → Supervisor Queue
  Supervisor reviews staff self-rating and KPI achievements.
  Supervisor enters mandatory comment and optional rating (1–5).
  Supervisor either:
    [Approve] → routes to Counter-Signing Officer
    [Return]  → staff notified, staff revises and resubmits

Step 5 — Counter-Signing Officer receives notification.
  Counter-Signer opens Team / Unit → Counter-Sign Queue
  Counter-Signer reviews full appraisal including supervisor comment.
  Counter-Signer either:
    [Counter-Sign & Finalise] → appraisal LOCKED, status = COUNTER_SIGNED
    [Return to Supervisor]    → supervisor notified to re-review

Step 6 — Appraisal is LOCKED and APPROVED.
  Final score published to:
    — Staff Dashboard (personal score card)
    — Performance Overview (visible to supervisors)
    — Leaderboard
    — Analytics

Step 7 — Repeat independently for Q2, Q3, Q4.
  Annual Score = weighted average of all approved quarterly scores.
```

### 9.4 Supervisory Appraiser Flow (runs in parallel with 9.3)

All supervisory roles (Team Lead, Dept Head, Deputy Director) perform this alongside their own appraisee flow.

```
Supervisor Dashboard shows:
  — Pending Reviews badge (count of submitted appraisals awaiting action)
  — My Appraisal status (their own appraisee context)

Supervisor → Team / Unit → Supervisor Queue
  — Lists all SUBMITTED or UNDER_REVIEW appraisals from direct reports
  — Select an appraisal → review KPI achievements, self-comments, scores
  — Enter supervisor comment (mandatory) and rating
  — [Approve] or [Return for Revision]

Counter-Sign Queue (for those with counter-signer role):
  — Lists all PENDING_COUNTER_SIGN appraisals assigned to this user
  — Review full appraisal + supervisor comment
  — [Counter-Sign & Finalise] or [Return to Supervisor]
```

### 9.5 Department Head — MPMS Achievement Entry Flow (once per year, end of year)

```
Step 1 — NC/Deputy Director opens the MPMS achievement entry window.
  System notifies all Department Heads:
  "MPMS achievement entry is now open. Deadline: [Date]."

Step 2 — Department Head navigates to: MPMS → KPI Achievement Entry
  System displays only the MPMS KPIs where this department is the Lead Unit.
  Department Head enters actual achievement value per KPI.
  System computes weighted score per KPI.

Step 3 — Support Unit Heads navigate to: MPMS → Support Unit Contributions
  System displays MPMS KPIs where this department is a Support Unit.
  Support Unit Head enters their contribution percentage.

Step 4 — NC/Deputy Director navigates to: MPMS → Institutional Dashboard
  Reviews consolidated institutional score per priority category:
    — Presidential Priorities (13%)
    — MDA Operational Priorities (25%)
    — Service-Wide Priorities (37%)
  Reviews Lead Unit vs Support Unit contribution breakdown.

Step 5 — NC/Deputy Director approves the consolidated score.
  Triggers MPMS Export.
  System generates the MPMS workbook in the exact format of
  final_SERVICOM_2026_MPMS.xlsx with the Achievement column populated.
  Export is timestamped and immutable.
  Submitted to Presidency / OHCSF.
```

---

## 10. SYSTEM MODULES

| # | Module | Owner | Depends On |
|---|---|---|---|
| 1 | User & Organisation Management | Admin | — |
| 2 | MPMS KPI Library | Admin | Module 1 |
| 3 | Department KRA Template Library | Admin | Module 2 |
| 4 | Performance Contract Management | All staff | Module 3 |
| 5 | Quarterly Appraisal | All staff | Module 4 |
| 6 | Scoring Engine | System | Module 5 |
| 7 | Approval Workflow | Supervisors | Module 5 |
| 8 | Role-Based Dashboards | All | Module 6 |
| 9 | Performance Overview | Supervisors | Module 6 |
| 10 | Leaderboard | All | Module 6 |
| 11 | Analytics | All | Module 6 |
| 12 | MPMS Achievement Entry | Dept Heads | Module 5 |
| 13 | MPMS Institutional Dashboard | NC/DD | Module 12 |
| 14 | MPMS Export | NC/DD | Module 13 |
| 15 | Reports & PDF Export | All | Module 6 |
| 16 | System Configuration | Admin | — |
| 17 | Notifications & Workflow | System | All |


---

## 11. DATA MODEL

### 11.1 Core Tables

```
users
  id, ippis_no, surname, firstname, othername,
  email, phone, designation, department_id,
  role (staff|team_lead|dept_head|deputy_director|nc|super_admin),
  supervisor_id → users.id,
  counter_signer_id → users.id,
  is_active, avatar_url, created_at

departments
  id, name, code, head_user_id → users.id, unit_weight, is_active

teams
  id, department_id → departments.id, name, lead_user_id → users.id
```

### 11.2 MPMS Tables (master — seeded first)

```
mpms_priority_categories
  id, code (PRESIDENTIAL|MDA_OPERATIONAL|SERVICE_WIDE),
  name, weight_percent, sort_order
  -- 3 rows, seeded and locked. Admin cannot delete or rename.

mpms_kras
  id, category_id → mpms_priority_categories.id,
  serial_no, name, weight, year, is_active

mpms_objectives
  id, kra_id → mpms_kras.id,
  description, weight

mpms_kpis
  id, objective_id → mpms_objectives.id,
  description, annual_target, unit_of_measurement,
  lead_unit_id → departments.id,
  year, is_active

mpms_kpi_support_units
  id, kpi_id → mpms_kpis.id,
  department_id → departments.id,
  contribution_percent

mpms_unit_weights
  id, department_id → departments.id,
  weight, year, updated_by, updated_at

mpms_achievements
  id, kpi_id → mpms_kpis.id, year,
  achievement_value, lead_unit_score,
  submitted_by → users.id, submitted_at,
  approved_by → users.id, approved_at,
  status (draft|submitted|approved)

mpms_support_achievements
  id, kpi_id → mpms_kpis.id,
  department_id → departments.id,
  year, contribution_value,
  submitted_by → users.id, submitted_at

mpms_exports
  id, year, generated_by → users.id,
  generated_at, file_path, is_final
```

### 11.3 KRA Template Tables (built from MPMS)

```
kra_templates
  id, name, department_id → departments.id (null = global),
  version, is_active, created_by → users.id, created_at

kra_template_items          -- Level 1: KRA
  id, template_id → kra_templates.id,
  serial_no, kra_name, weight,
  mpms_kra_id → mpms_kras.id (null if dept-specific KRA)

objective_template_items    -- Level 2: Objective (full text, mandatory)
  id, kra_template_item_id → kra_template_items.id,
  description, weight, graded_weight,
  mpms_objective_id → mpms_objectives.id (null if dept-specific)

kpi_template_items          -- Level 3: KPI
  id, objective_template_item_id → objective_template_items.id,
  description, target_value, unit_of_measurement,
  direction (higher|lower),
  criteria_O, criteria_E, criteria_VG,
  criteria_G, criteria_F, criteria_P,
  mpms_kpi_id → mpms_kpis.id (null if dept-specific)
```

### 11.4 Performance Contract Tables

```
performance_contracts
  id, user_id → users.id, year,
  template_id → kra_templates.id,
  status (draft|submitted|approved|active),
  approved_by → users.id, approved_at, created_at

contract_kras               -- snapshot of template at contract creation
  id, contract_id → performance_contracts.id,
  serial_no, name, weight

contract_objectives
  id, kra_id → contract_kras.id,
  description, weight, graded_weight

contract_kpis
  id, objective_id → contract_objectives.id,
  description, target_value, unit_of_measurement,
  direction (higher|lower),
  criteria_O, criteria_E, criteria_VG,
  criteria_G, criteria_F, criteria_P
  -- Full snapshot. Template changes after this point have no effect.
```

### 11.5 Appraisal Tables

```
appraisals
  id, user_id → users.id,
  contract_id → performance_contracts.id,
  period_id → appraisal_periods.id,
  year, quarter (Q1|Q2|Q3|Q4),
  status (draft|submitted|under_review|pending_counter_sign|
          counter_signed|approved|returned),
  submitted_at, supervisor_id → users.id,
  counter_signer_id → users.id

appraisal_kpi_scores
  id, appraisal_id → appraisals.id,
  kpi_id → contract_kpis.id,
  achievement, raw_score, weighted_raw_score, grade_key

appraisal_competency_scores
  id, appraisal_id → appraisals.id,
  competency_id → competencies.id, score

appraisal_operations_scores
  id, appraisal_id → appraisals.id,
  item_id → operations_items.id, score

appraisal_totals
  id, appraisal_id → appraisals.id,
  section4_score, section5_score, section6_score,
  final_score, grade_key

appraisal_comments
  id, appraisal_id → appraisals.id,
  role (appraisee|supervisor|counter_signer),
  comment, strengths, improvement_areas,
  rating (1-5, supervisor only), signature_date

appraisal_workflow_log
  id, appraisal_id → appraisals.id,
  action, actor_id → users.id,
  from_status, to_status, comment, created_at
```

### 11.6 Configuration Tables

```
appraisal_periods
  id, year, label, quarter,
  coverage_start, coverage_end,
  submission_opens, submission_closes, is_active

grade_scales
  id, key, label, threshold_percent,
  colour_hex, sort_order, is_active

competencies
  id, cluster (Generic|Functional|Ethics_Values),
  name, default_target, sort_order, is_active

operations_items
  id, name, description, default_target,
  max_score, sort_order, is_active

section_weights
  id, section (4|5|6), weight_percent, updated_by, updated_at

workflow_approval_steps
  id, department_id (null = global), step_order,
  approver_role, is_required, fallback_user_id → users.id

notifications
  id, user_id → users.id, type, title,
  message, read_at, created_at

audit_logs
  id, user_id → users.id, action, model,
  model_id, old_values, new_values, created_at
```

---

## 12. FRONTEND DATA FLOW

### 12.1 Context Architecture

```
AuthContext
  — current user, role, department, supervisor chain

OrgContext
  — departments, teams, users
  — kra templates (built from MPMS)

MpmsContext
  — priority categories (seeded, read-only labels)
  — mpms KRAs, objectives, KPIs per year
  — unit weights per year
  — achievements (dept head entries)

AppraisalContext
  — performance contracts per user
  — appraisals per user per period
  — kpi scores, competency scores, ops scores
  — approval workflow state

SettingsContext
  — grade scale, section weights
  — competency items, operations items
  — appraisal periods
  — notification config
```

### 12.2 Page → Context Dependency Map

| Page | Reads From | Writes To |
|---|---|---|
| Dashboard | AuthContext, AppraisalContext, OrgContext | — |
| My Contract | AuthContext, OrgContext (templates) | AppraisalContext (contract) |
| Appraisal Form | AuthContext, AppraisalContext (contract snapshot) | AppraisalContext (scores) |
| Team Review | AuthContext, AppraisalContext | AppraisalContext (status, comments) |
| Performance Overview | AuthContext, AppraisalContext, OrgContext | — |
| Leaderboard | AppraisalContext, OrgContext | — |
| Analytics | AppraisalContext, OrgContext | — |
| MPMS Achievement | AuthContext, MpmsContext | MpmsContext (achievements) |
| MPMS Dashboard | MpmsContext, AppraisalContext | — |
| Admin Settings | All contexts | All contexts |

---

## 13. NAVIGATION STRUCTURE

```
Sidebar
├── Dashboard                          (all roles)
├── My Appraisal                       (all roles)
│   ├── Current Quarter
│   ├── History
│   └── My Contract
├── Team / Unit                        (Team Lead and above)
│   ├── Supervisor Queue
│   └── Counter-Sign Queue
├── Performance Overview               (Team Lead and above)
├── Leaderboard                        (all roles)
├── Analytics                          (all roles)
├── Reports                            (all roles)
├── MPMS                               (Dept Head, Deputy Director, NC, Admin)
│   ├── KPI Achievement Entry          (Dept Head — Lead Unit KPIs only)
│   ├── Support Unit Contributions     (Dept Head — Support Unit KPIs only)
│   ├── Institutional Dashboard        (Deputy Director, NC)
│   └── MPMS Export                    (NC, Deputy Director)
└── Admin                              (Super Admin only)
    ├── Staff & Organisation
    ├── MPMS KPI Library
    ├── KRA Template Library
    ├── Appraisal Periods
    └── System Settings
        ├── Scoring Weights
        ├── Grade Scale
        ├── Competencies
        ├── Operations Items
        ├── Approval Workflow
        ├── Unit Weights (MPMS)
        └── Notification Settings
```

---

## 14. KEY BUSINESS RULES

| Rule | Detail |
|---|---|
| MPMS is the master | All department KRA templates must trace to an MPMS KRA or be explicitly marked as department-specific additions |
| One contract per staff per year | The same approved contract feeds all four quarterly appraisals |
| Contract snapshot is immutable | When a contract is approved, all KRAs/Objectives/KPIs are snapshotted into contract_kras/contract_objectives/contract_kpis. Template changes after this point have zero effect |
| Each quarter is independent | Achievement values are entered fresh each quarter — not cumulative |
| Sections 1–3 are never re-entered | Always auto-populated from user profile and org hierarchy |
| Section 4 employee input | One numeric achievement value per KPI only |
| Section 5 employee input | One score per competency item |
| Section 6 employee input | One numeric score per operations item |
| Section 7 employee input | Free-text comments, strengths, improvement areas, signature date |
| Score computation is fully automatic | Grade, Raw Score, Weighted Raw Score, Composite Score — all system-computed |
| A user cannot review their own appraisal | Enforced server-side via supervisor_id relationship |
| Approved appraisals are immutable | Once counter-signed, no field can be edited |
| Section weights must sum to 100% | Validated at save time in Admin Settings |
| MPMS priority category labels are fixed | Presidential, MDA Operational, Service-Wide cannot be renamed |
| MPMS export is final | Once generated by NC/Deputy Director, the export record is immutable |
| Competency profile is single | All staff use the same competency items (confirmed from Excel). No designation-based split. |

---

## 15. IMPLEMENTATION GAPS IN CURRENT CODEBASE

These are the specific gaps between the current frontend implementation and this PRD.

### Gap 1 — Department Names Wrong
`constants.ts` and `OrgContext.tsx` use old names (PA, Account, Audit).
Fix: Update to PUBLIC AWARENESS, FINANCE AND ACCOUNT, INTERNAL AUDIT, NC OFFICE.
Add 3 missing departments: SERVICOM INSTITUTE, PROCUREMENT, LEGAL.

### Gap 2 — Competency Profile Incorrect
`AppraisalForm.tsx` hardcodes the wrong competency list (Drive for Results, Collaborating & Partnering, Policy Management, Inclusiveness).
Fix: Replace with the single verified profile from CONTRACT files:
Leadership Skill (3), Managing & Developing People (3), Effective Communication (3),
Strategic Thinking (3), Drive for Results (2), Transparency and Accountability (2),
Integrity (2), Citizen Focus (1), Courage (1).

### Gap 3 — Operations Items Total Wrong
PDA v1.1 stated 20 points total. Excel files show 10 points total.
Fix: Punctuality/Attendance (4), Work Turnaround Time (4), Innovation on the Job (2). Total = 10.

### Gap 4 — No MPMS Module
Entire MPMS layer (Modules 12–14) is absent. No MpmsContext, no MPMS pages, no MPMS nav items.
Fix: Implement MpmsContext, seed MPMS data from Excel, build MPMS pages.

### Gap 5 — PerformanceOverview Uses Mock Data
`PerformanceOverview.tsx` renders a hardcoded MOCK_STAFF array.
Fix: Wire to AppraisalContext + OrgContext with role-scoped filtering.

### Gap 6 — Reports Page Uses Mock Data
`Reports.tsx` renders MOCK_REPORTS with no connection to real appraisal data.
Fix: Generate report list dynamically from AppraisalContext.

### Gap 7 — AdminSettings Inputs Are Uncontrolled
Section weights, grade scale, competency items — all use defaultValue (uncontrolled).
Changes are never persisted. handleSave is a visual-only toggle.
Fix: Convert to controlled state, wire to SettingsContext with 100% sum validation.

### Gap 8 — No MPMS Admin Tabs
AdminSettings has no MPMS KPI Library tab and no Unit Weights tab.
Fix: Add both tabs to TAB_CONFIG and implement their UIs.

### Gap 9 — Leaderboard Missing Tabs and Grade-Coloured Bars
No Current Quarter / Annual / By Department tab switcher.
Score bars use hardcoded colours instead of grade-based colours.
No "My Rank" row highlight.
Fix: Add tab switcher, grade-colour mapping, highlight band.

### Gap 10 — Analytics Is Individual-Only
No role-based branching. Deputy Director / NC should see org-wide view.
Fix: Add role check — exec roles see department comparison charts.

### Gap 11 — Contract Snapshot Not Enforced
`AppraisalForm.tsx` loads from live template, not a locked contract snapshot.
A partial fix exists (localStorage `active_contract_` key) but it is not reliable.
Fix: Implement proper contract_kpis snapshot in AppraisalContext.

---

## 16. IMPLEMENTATION PRIORITY ORDER

Phase 1 — Data Foundation
  1a. Fix constants.ts (department names, competency profile, ops items)
  1b. Fix OrgContext.tsx (correct INITIAL_DEPTS, add 3 missing departments)
  1c. Fix types.ts (add MPMS types, remove CompetencyProfile type)
  1d. Create MpmsContext.tsx (seed from MPMS Excel data)

Phase 2 — Fix Existing Pages
  2a. AppraisalForm.tsx — correct competency profile, ops items total
  2b. PerformanceOverview.tsx — wire to real data, role-scoped filtering
  2c. Reports.tsx — wire to real appraisal data
  2d. AdminSettings.tsx — controlled inputs, persistence, MPMS tabs
  2e. Leaderboard.tsx — tabs, grade colours, My Rank highlight
  2f. Analytics.tsx — role-based branching for exec view

Phase 3 — MPMS Module (new)
  3a. MPMS KPI Achievement Entry page (Dept Heads)
  3b. MPMS Support Unit Contributions page
  3c. MPMS Institutional Dashboard (NC/Deputy Director)
  3d. MPMS Export trigger
  3e. Wire MPMS nav into Layout.tsx and App.tsx

Phase 4 — Polish
  4a. Contract snapshot enforcement in AppraisalContext
  4b. Notification persistence (survive page refresh)
  4c. PDF export matching Excel template layout
  4d. Mobile responsiveness audit

---

## 17. GLOSSARY

| Term | Definition |
|---|---|
| MPMS | Ministerial Performance Management System — the institutional performance plan submitted to the Presidency. The master document from which all individual contracts cascade. |
| Lead Unit | The department primarily responsible for achieving a specific MPMS KPI |
| Support Unit | A department that contributes to an MPMS KPI owned by another department |
| KRA | Key Result Area — broad performance domain |
| KPI | Key Performance Indicator — measurable metric within an objective |
| Graded Weight | Pre-computed weight per KPI = (Objective Weight / Total Objective Weights) × (70 / Max Raw Score) |
| Contract Snapshot | The immutable copy of KRAs/Objectives/KPIs stored at contract approval time |
| Presidential Priorities | Fixed OHCSF MPMS category — weight 13% |
| MDA Operational Priorities | Fixed OHCSF MPMS category — weight 25% |
| Service-Wide Priorities | Fixed OHCSF MPMS category — weight 37% |
| IPPIS | Integrated Payroll and Personnel Information System — staff ID number |
| OHCSF | Office of the Head of the Civil Service of the Federation |
| SCE | SERVICOM Compliance Evaluation |
| MSU | Ministerial SERVICOM Unit |
| GRM | Grievance Redress Mechanism |
| MDA | Ministry, Department, or Agency |

---

*End of SERVICOM ePMS PRD v2.0*
*This document supersedes SERVICOM_PMS_PDA.md (v1.0, v1.1) and secondPRD_v1.2_updates.md*
*All implementation decisions must reference this document as the single source of truth*
