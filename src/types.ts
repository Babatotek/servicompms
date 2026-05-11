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
  RETURNED = 'Returned',
}

export enum ContractStatus {
  DRAFT = 'Draft',
  APPROVED = 'Approved',
  ACTIVE = 'Active',
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
  criteria: {
    O: number;
    E: number;
    VG: number;
    G: number;
    F: number;
    P: number;
  };
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
