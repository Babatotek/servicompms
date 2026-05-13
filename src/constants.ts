import { UserRole } from "./types";

export const DEFAULT_GRADE_SCALE = [
  { id: '1', key: 'O', label: 'Outstanding', threshold: 100, color: '#16A34A' },
  { id: '2', key: 'E', label: 'Excellent', threshold: 90, color: '#2563EB' },
  { id: '3', key: 'VG', label: 'Very Good', threshold: 80, color: '#7C3AED' },
  { id: '4', key: 'G', label: 'Good', threshold: 70, color: '#D97706' },
  { id: '5', key: 'F', label: 'Fair', threshold: 60, color: '#EA580C' },
  { id: '6', key: 'P', label: 'Poor', threshold: 50, color: '#DC2626' },
];

export const SECTION_WEIGHTS = {
  taskPerformance: 70,
  competencies: 20,
  operations: 10,
};

// ── VERIFIED COMPETENCY PROFILE (confirmed from CONTRACT files — PRD §5) ─────
// All staff use a single profile regardless of designation.
// Legacy items (Policy Management, PR Management, Inclusiveness) have been removed.
export const DEFAULT_COMPETENCIES = [
  { cluster: 'Generic', items: [
    { name: 'Leadership Skill', target: 3 },
    { name: 'Managing & Developing People', target: 3 },
    { name: 'Effective Communication', target: 3 },
  ]},
  { cluster: 'Functional', items: [
    { name: 'Strategic Thinking', target: 3 },
    { name: 'Drive for Results', target: 2 },
    { name: 'Transparency and Accountability', target: 2 },
  ]},
  { cluster: 'Ethics & Values', items: [
    { name: 'Integrity', target: 2 },
    { name: 'Citizen Focus', target: 1 },
    { name: 'Courage', target: 1 },
  ]},
];

// ── VERIFIED OPERATIONS ITEMS (confirmed from CONTRACT/ACCOUNT/ACCOUNT.xlsx — PRD §6) ─
// PDA v1.1 claimed 20 pts total — this was incorrect. Excel shows 10 pts total.
export const DEFAULT_OPERATIONS_ITEMS = [
  { name: 'Punctuality / Attendance', target: 4, max: 4 },
  { name: 'Work Turnaround Time',     target: 4, max: 4 },
  { name: 'Innovation on the Job',    target: 2, max: 2 },
];
export const OPERATIONS_MAX_TOTAL = 10;

export const APPRAISAL_PERIOD_DEFAULTS = [
  { label: 'Q1', coverage: 'Jan–Mar', submissionOpens: '04-01', submissionCloses: '04-15' },
  { label: 'Q2', coverage: 'Apr–Jun', submissionOpens: '07-01', submissionCloses: '07-15' },
  { label: 'Q3', coverage: 'Jul–Sep', submissionOpens: '10-01', submissionCloses: '10-15' },
  { label: 'Q4', coverage: 'Oct–Dec', submissionOpens: '01-01', submissionCloses: '01-15' },
];

// ── VERIFIED DEPARTMENTS (confirmed from Excel files — PRD §2.1) ──────────────
// Folder Name → Actual Department Name | Unit Weight (Sheet8, total = 50)
export const DEPARTMENTS = [
  { id: 'dept_acct',    name: 'Finance and Account',   code: 'ACCT',  unitWeight: 5  },
  { id: 'dept_admin',   name: 'Admin',                 code: 'ADM',   unitWeight: 7  },
  { id: 'dept_audit',   name: 'Internal Audit',        code: 'AUD',   unitWeight: 3  },
  { id: 'dept_ict',     name: 'ICT',                   code: 'ICT',   unitWeight: 5  },
  { id: 'dept_nc',      name: 'NC Office',             code: 'NC',    unitWeight: 3  },
  { id: 'dept_ops',     name: 'Operations',            code: 'OPS',   unitWeight: 10 },
  { id: 'dept_pa',      name: 'Public Awareness',      code: 'PA',    unitWeight: 7  },
  { id: 'dept_si',      name: 'Servicom Institute',    code: 'SI',    unitWeight: 5  },
  { id: 'dept_proc',    name: 'Procurement',           code: 'PROC',  unitWeight: 3  },
  { id: 'dept_legal',   name: 'Legal',                 code: 'LGL',   unitWeight: 2  },
];
