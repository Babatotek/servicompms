/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  STAFF = 'Staff',
  TEAM_LEAD = 'Team Lead',
  DEPT_HEAD = 'Dept Head',
  DEPUTY_DIRECTOR = 'Deputy Director',
  NC = 'National Coordinator',
  SUPER_ADMIN = 'Super Admin',
}

export enum AppraisalStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  UNDER_REVIEW = 'Under Review',
  APPROVED = 'Approved',
  PENDING_COUNTER_SIGN = 'Pending Counter-Sign',
  COUNTER_SIGNED = 'Counter-Signed',
  RETURNED = 'Returned',
}

export enum ContractStatus {
  DRAFT = 'Draft',
  PENDING_APPROVAL = 'Pending Approval',
  APPROVED = 'Approved',
  ACTIVE = 'Active',
  RETURNED = 'Returned',
}

export interface User {
  id: string;
  ippisNo: string;
  surname: string;
  firstname: string;
  othername?: string;
  email: string;
  phone: string;
  designation: string;
  departmentId: string;
  role: UserRole;
  supervisorId?: string;
  counterSignerId?: string;
  isActive: boolean;
  avatarUrl?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headUserId?: string;
  unitWeight: number; // Sheet8 weight (total 50)
  isActive: boolean;
}

export interface Team {
  id: string;
  departmentId: string;
  name: string;
  leadUserId?: string;
}

export interface PerformanceContract {
  id: string;
  userId: string;
  year: number;
  status: ContractStatus;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface KRA {
  id: string;
  contractId: string;
  serialNo: number;
  name: string;
  weight: number;
}

export interface Objective {
  id: string;
  kraId: string;
  description: string;
  weight: number;
  gradedWeight: number;
}

export interface KPI {
  id: string;
  objectiveId: string;
  description: string;
  targetValue: number;
  unit: string;
  direction: 'higher' | 'lower';
  criteria: {
    O: number;
    E: number;
    VG: number;
    G: number;
    F: number;
    P: number;
  };
  mpmsKpiId?: string; // Links individual KPI to MPMS source
  weight?: number;    // Absolute weight from individual's contract
  gradedWeight?: number; // Normalized weight out of 100
}

// ── MPMS (Institutional) Structures ──────────────────────────────────────────

export enum MPMSCategoryCode {
  PRESIDENTIAL = 'PRESIDENTIAL',
  MDA_OPERATIONAL = 'MDA_OPERATIONAL',
  SERVICE_WIDE = 'SERVICE_WIDE',
}

export interface MPMSCategory {
  id: string;
  code: MPMSCategoryCode;
  name: string;
  weight: number; // e.g., 13, 25, 37
}

export interface MPMSKRA {
  id: string;
  categoryId: string;
  serialNo: number;
  name: string;
  weight: number;
}

export interface MPMSObjective {
  id: string;
  kraId: string;
  description: string;
  weight: number;
}

export interface MPMSKPI {
  id: string;
  objectiveId: string;
  description: string;
  annualTarget: number;
  unitOfMeasurement: string;
  leadUnitId: string; // Department ID
  supportUnitIds: string[]; // Department IDs
  weight?: number; // Added for institutional weighting library
}

export interface MPMSAchievement {
  id: string;
  kpiId: string;
  year: number;
  achievementValue: number;
  status: 'draft' | 'submitted' | 'approved';
  submittedBy: string;
  submittedAt: string;
}

export interface Appraisal {
  id: string;
  userId: string;
  contractId: string;
  periodId: string;
  year: number;
  status: AppraisalStatus;
  submittedAt?: string;
  supervisorId?: string;
  counterSignerId?: string;
}

export interface KPIScore {
  id: string;
  appraisalId: string;
  kpiId: string;
  achievement: number;
  rawScore: number;
  weightedRawScore: number;
}

export interface CompetencyScore {
  id: string;
  appraisalId: string;
  competencyId: string;
  score: number;
}

export interface OperationsScore {
  id: string;
  appraisalId: string;
  itemId: string;
  score: number;
}

export interface AppraisalTotal {
  appraisalId: string;
  section4Score: number;
  section5Score: number;
  section6Score: number;
  finalScore: number;
  gradeKey: string;
}

export interface Comment {
  id: string;
  appraisalId: string;
  role: 'appraisee' | 'supervisor' | 'counter_signer';
  comment: string;
  strengths?: string;
  improvementAreas?: string;
  signatureDate: string;
}

export interface AppraisalPeriod {
  id: string;
  year: number;
  label: string;
  coverageStart: string;
  coverageEnd: string;
  submissionOpens: string;
  submissionCloses: string;
  isActive: boolean;
}

export interface GradeScale {
  id: string;
  key: string;
  label: string;
  threshold: number;
  color: string;
}
