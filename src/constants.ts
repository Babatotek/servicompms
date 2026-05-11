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

export const DEFAULT_COMPETENCIES = [
  { cluster: 'Generic', items: [
    { name: 'Drive for Results', target: 4 },
    { name: 'Collaborating & Partnering', target: 2 },
    { name: 'Effective Communication', target: 2 },
  ]},
  { cluster: 'Functional', items: [
    { name: 'Policy Management', target: 2 },
    { name: 'Public Relations Management', target: 2 },
    { name: 'Information & Records Management', target: 2 },
  ]},
  { cluster: 'Ethics & Values', items: [
    { name: 'Integrity', target: 2 },
    { name: 'Inclusiveness', target: 2 },
    { name: 'Transparency & Accountability', target: 2 },
  ]},
];

export const DEFAULT_OPERATIONS_ITEMS = [
  { name: 'Punctuality / Attendance', target: 4, max: 4 },
  { name: 'Work Turnaround Time', target: 3, max: 5 },
  { name: 'Innovation on the Job', target: 3, max: 5 },
];

export const APPRAISAL_PERIOD_DEFAULTS = [
  { label: 'Q1', coverage: 'Jan–Mar', submissionOpens: '04-01', submissionCloses: '04-15' },
  { label: 'Q2', coverage: 'Apr–Jun', submissionOpens: '07-01', submissionCloses: '07-15' },
  { label: 'Q3', coverage: 'Jul–Sep', submissionOpens: '10-01', submissionCloses: '10-15' },
  { label: 'Q4', coverage: 'Oct–Dec', submissionOpens: '01-01', submissionCloses: '01-15' },
];

export const DEPARTMENTS = [
  { id: 'dept_account', name: 'Account', code: 'ACC' },
  { id: 'dept_admin', name: 'Admin', code: 'ADM' },
  { id: 'dept_audit', name: 'Audit', code: 'AUD' },
  { id: 'dept_ict', name: 'ICT', code: 'ICT' },
  { id: 'dept_nc', name: 'NC', code: 'NC' },
  { id: 'dept_operations', name: 'Operations', code: 'OPS' },
  { id: 'dept_pa', name: 'PA', code: 'PA' },
];
