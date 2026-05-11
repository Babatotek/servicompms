import { KRA, Objective, KPI } from '../types';

export interface PerformanceTemplate {
  id: string;
  name: string;
  description: string;
  departmentId: string;
  kras: TemplateKRA[];
}

export interface TemplateKRA {
  id: string;
  serialNo: number;
  name: string;
  weight: number;
  objectives: TemplateObjective[];
}

export interface TemplateObjective {
  id: string;
  description: string;
  weight: number;
  gradedWeight: number;
  kpis: TemplateKPI[];
}

export interface TemplateKPI {
  id: string;
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
}

export const PERFORMANCE_TEMPLATES: PerformanceTemplate[] = [
  {
    id: 'temp_account_head',
    name: 'Account & Finance Head',
    description: 'Standardized targets for accounting unit heads',
    departmentId: 'dept_account',
    kras: [
      {
        id: 'kra_1',
        serialNo: 1,
        name: 'Governance & Service Delivery',
        weight: 43,
        objectives: [
          {
            id: 'obj_1_1',
            description: 'Strengthen and institutionalize the effective utilization of the Performance Management System (PMS) to enhance accountability, performance tracking, and service delivery outcomes across SERVICOM.',
            weight: 7,
            gradedWeight: 2.0,
            kpis: [
              { 
                id: 'kpi_1_1_1', 
                description: 'PMS Implementation Rate across Units', 
                targetValue: 100, 
                unit: '%', 
                direction: 'higher',
                criteria: { O: 100, E: 90, VG: 80, G: 70, F: 60, P: 50 } 
              },
              { 
                id: 'kpi_1_1_2', 
                description: 'Percentage of staff with completed and approved performance contract', 
                targetValue: 100, 
                unit: '%', 
                direction: 'higher',
                criteria: { O: 100, E: 90, VG: 80, G: 70, F: 60, P: 50 } 
              },
            ]
          }
        ]
      },
      {
        id: 'kra_2',
        serialNo: 2,
        name: 'Financial Management, Budgeting, and Accounting Services',
        weight: 57,
        objectives: [
          {
            id: 'obj_2_1',
            description: 'Prepare and manage SERVICOM\'s annual budget in line with approved financial regulations.',
            weight: 50,
            gradedWeight: 6.0,
            kpis: [
              { 
                id: 'kpi_2_1_1', 
                description: 'Timely preparation and submission of annual budget', 
                targetValue: 100, 
                unit: '%', 
                direction: 'higher',
                criteria: { O: 100, E: 90, VG: 80, G: 70, F: 60, P: 50 } 
              },
              { 
                id: 'kpi_2_1_2', 
                description: 'Percentage of budget estimates prepared in line with approved guidelines', 
                targetValue: 100, 
                unit: '%', 
                direction: 'higher',
                criteria: { O: 100, E: 90, VG: 80, G: 70, F: 60, P: 50 } 
              },
            ]
          },
          {
            id: 'obj_2_2',
            description: 'Ensure accurate financial record-keeping and proper retirement of advances.',
            weight: 50,
            gradedWeight: 6.0,
            kpis: [
              { 
                id: 'kpi_2_2_1', 
                description: 'Percentage of advances retired within approved timelines', 
                targetValue: 100, 
                unit: '%', 
                direction: 'higher',
                criteria: { O: 100, E: 90, VG: 80, G: 70, F: 60, P: 50 } 
              },
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'temp_admin_head',
    name: 'Admin & Human Resources Head',
    description: 'Focus on staffing, facility management, and registry',
    departmentId: 'dept_admin',
    kras: [
      {
        id: 'kra_a1',
        serialNo: 1,
        name: 'Personnel Management',
        weight: 60,
        objectives: [
           { 
             id: 'oa1', 
             description: 'Ensure timely processing of staff benefits and promotions', 
             weight: 30, 
             gradedWeight: 4.0, 
             kpis: [
               { 
                 id: 'kpi_a1_1', 
                 description: 'Processing turnaround time for benefits (Days)', 
                 targetValue: 5, 
                 unit: 'Days', 
                 direction: 'lower',
                 criteria: { O: 3, E: 5, VG: 7, G: 10, F: 14, P: 21 } 
               }
             ] 
           }
        ]
      }
    ]
  }
];

// ─── Additional department templates (Gaps 5 fix) ───────────────────────────
// Built from PDA spec Section 2.5 KRA list. Each template covers the
// common KRAs shared across all departments plus the department-specific ones.

const COMMON_KRAS_SUFFIX = (prefix: string): TemplateKRA[] => [
  {
    id: `${prefix}_kra_gov`,
    serialNo: 1,
    name: 'Governance & Service Delivery',
    weight: 20,
    objectives: [
      {
        id: `${prefix}_obj_gov_1`,
        description: 'Strengthen and institutionalize the effective utilization of the Performance Management System (PMS) to enhance accountability, performance tracking, and service delivery outcomes across SERVICOM.',
        weight: 50,
        gradedWeight: 2.0,
        kpis: [
          { id: `${prefix}_kpi_gov_1`, description: 'PMS Implementation Rate across Units', targetValue: 100, unit: '%', direction: 'higher', criteria: { O: 100, E: 90, VG: 80, G: 70, F: 60, P: 50 } },
          { id: `${prefix}_kpi_gov_2`, description: 'Percentage of staff with completed and approved performance contract', targetValue: 100, unit: '%', direction: 'higher', criteria: { O: 100, E: 90, VG: 80, G: 70, F: 60, P: 50 } },
        ]
      }
    ]
  },
  {
    id: `${prefix}_kra_innov`,
    serialNo: 2,
    name: 'Service Innovation & Improvement',
    weight: 15,
    objectives: [
      {
        id: `${prefix}_obj_innov_1`,
        description: 'Identify and implement at least one process improvement or innovation initiative within the unit per quarter.',
        weight: 100,
        gradedWeight: 2.0,
        kpis: [
          { id: `${prefix}_kpi_innov_1`, description: 'Number of innovation/improvement initiatives implemented', targetValue: 1, unit: 'No.', direction: 'higher', criteria: { O: 4, E: 3, VG: 2, G: 1, F: 1, P: 0 } },
        ]
      }
    ]
  },
  {
    id: `${prefix}_kra_cap`,
    serialNo: 3,
    name: 'Capacity Building',
    weight: 10,
    objectives: [
      {
        id: `${prefix}_obj_cap_1`,
        description: 'Participate in and facilitate training programmes to enhance staff competencies and professional development.',
        weight: 100,
        gradedWeight: 1.5,
        kpis: [
          { id: `${prefix}_kpi_cap_1`, description: 'Number of training sessions attended or facilitated', targetValue: 2, unit: 'No.', direction: 'higher', criteria: { O: 4, E: 3, VG: 2, G: 1, F: 1, P: 0 } },
        ]
      }
    ]
  },
];

PERFORMANCE_TEMPLATES.push(
  // ── OPERATIONS HEAD ──────────────────────────────────────────────────────
  {
    id: 'temp_operations_head',
    name: 'Operations Head',
    description: 'Service delivery monitoring, legal advisory, procurement',
    departmentId: 'dept_operations',
    kras: [
      ...COMMON_KRAS_SUFFIX('ops'),
      {
        id: 'ops_kra_sdme',
        serialNo: 4,
        name: 'Service Delivery Monitoring & Evaluation',
        weight: 30,
        objectives: [
          {
            id: 'ops_obj_sdme_1',
            description: 'Monitor and evaluate service delivery standards across all SERVICOM units to ensure compliance with the Service Charter.',
            weight: 60,
            gradedWeight: 4.0,
            kpis: [
              { id: 'ops_kpi_sdme_1', description: 'Percentage of service units monitored per quarter', targetValue: 100, unit: '%', direction: 'higher', criteria: { O: 100, E: 90, VG: 80, G: 70, F: 60, P: 50 } },
              { id: 'ops_kpi_sdme_2', description: 'Number of service delivery reports submitted on time', targetValue: 4, unit: 'No.', direction: 'higher', criteria: { O: 4, E: 3, VG: 2, G: 1, F: 1, P: 0 } },
            ]
          },
          {
            id: 'ops_obj_sdme_2',
            description: 'Manage procurement and contract processes in line with Public Procurement Act guidelines.',
            weight: 40,
            gradedWeight: 3.0,
            kpis: [
              { id: 'ops_kpi_proc_1', description: 'Percentage of procurements completed within approved timelines', targetValue: 100, unit: '%', direction: 'higher', criteria: { O: 100, E: 90, VG: 80, G: 70, F: 60, P: 50 } },
            ]
          }
        ]
      },
      {
        id: 'ops_kra_auto',
        serialNo: 5,
        name: 'Automated Service Delivery',
        weight: 25,
        objectives: [
          {
            id: 'ops_obj_auto_1',
            description: 'Drive the digitization and automation of service delivery processes to reduce manual intervention and improve turnaround time.',
            weight: 100,
            gradedWeight: 3.5,
            kpis: [
              { id: 'ops_kpi_auto_1', description: 'Percentage of service processes digitized', targetValue: 80, unit: '%', direction: 'higher', criteria: { O: 100, E: 90, VG: 80, G: 70, F: 60, P: 50 } },
              { id: 'ops_kpi_auto_2', description: 'Average service turnaround time (Days)', targetValue: 3, unit: 'Days', direction: 'lower', criteria: { O: 1, E: 2, VG: 3, G: 5, F: 7, P: 10 } },
            ]
          }
        ]
      }
    ]
  },

  // ── AUDIT HEAD ───────────────────────────────────────────────────────────
  {
    id: 'temp_audit_head',
    name: 'Internal Audit Head',
    description: 'Internal audit, compliance, and risk management',
    departmentId: 'dept_audit',
    kras: [
      ...COMMON_KRAS_SUFFIX('audit'),
      {
        id: 'audit_kra_compliance',
        serialNo: 4,
        name: 'Internal Audit & Compliance',
        weight: 55,
        objectives: [
          {
            id: 'audit_obj_1',
            description: 'Conduct quarterly internal audits of financial transactions, procurement processes, and operational activities to ensure compliance with regulations.',
            weight: 60,
            gradedWeight: 5.0,
            kpis: [
              { id: 'audit_kpi_1', description: 'Percentage of planned audit assignments completed per quarter', targetValue: 100, unit: '%', direction: 'higher', criteria: { O: 100, E: 90, VG: 80, G: 70, F: 60, P: 50 } },
              { id: 'audit_kpi_2', description: 'Number of audit reports submitted on schedule', targetValue: 4, unit: 'No.', direction: 'higher', criteria: { O: 4, E: 3, VG: 2, G: 1, F: 1, P: 0 } },
            ]
          },
          {
            id: 'audit_obj_2',
            description: 'Track and follow up on implementation of audit recommendations to ensure corrective actions are taken.',
            weight: 40,
            gradedWeight: 3.5,
            kpis: [
              { id: 'audit_kpi_3', description: 'Percentage of prior audit recommendations implemented', targetValue: 80, unit: '%', direction: 'higher', criteria: { O: 100, E: 90, VG: 80, G: 70, F: 60, P: 50 } },
            ]
          }
        ]
      }
    ]
  },

  // ── ICT HEAD ─────────────────────────────────────────────────────────────
  {
    id: 'temp_ict_head',
    name: 'ICT Head',
    description: 'ICT infrastructure, support, and digital transformation',
    departmentId: 'dept_ict',
    kras: [
      ...COMMON_KRAS_SUFFIX('ict'),
      {
        id: 'ict_kra_infra',
        serialNo: 4,
        name: 'ICT Infrastructure & Support',
        weight: 55,
        objectives: [
          {
            id: 'ict_obj_1',
            description: 'Maintain and improve ICT infrastructure to ensure system availability, security, and performance across all SERVICOM units.',
            weight: 50,
            gradedWeight: 4.5,
            kpis: [
              { id: 'ict_kpi_1', description: 'System uptime percentage', targetValue: 99, unit: '%', direction: 'higher', criteria: { O: 99, E: 97, VG: 95, G: 90, F: 85, P: 80 } },
              { id: 'ict_kpi_2', description: 'Average IT support ticket resolution time (Hours)', targetValue: 4, unit: 'Hrs', direction: 'lower', criteria: { O: 2, E: 4, VG: 8, G: 12, F: 24, P: 48 } },
            ]
          },
          {
            id: 'ict_obj_2',
            description: 'Implement and maintain cybersecurity protocols to protect organizational data and systems.',
            weight: 50,
            gradedWeight: 4.0,
            kpis: [
              { id: 'ict_kpi_3', description: 'Number of security incidents reported and resolved', targetValue: 0, unit: 'No.', direction: 'lower', criteria: { O: 0, E: 1, VG: 2, G: 3, F: 5, P: 7 } },
            ]
          }
        ]
      }
    ]
  },

  // ── NC (NATIONAL COORDINATOR) ─────────────────────────────────────────────
  {
    id: 'temp_nc',
    name: 'National Coordinator',
    description: 'Strategic leadership, org-wide performance oversight',
    departmentId: 'dept_nc',
    kras: [
      ...COMMON_KRAS_SUFFIX('nc'),
      {
        id: 'nc_kra_strategic',
        serialNo: 4,
        name: 'Strategic Leadership & Stakeholder Engagement',
        weight: 55,
        objectives: [
          {
            id: 'nc_obj_1',
            description: 'Provide strategic direction for SERVICOM operations and ensure alignment with the Federal Government Service Compact mandate.',
            weight: 50,
            gradedWeight: 5.0,
            kpis: [
              { id: 'nc_kpi_1', description: 'Number of strategic initiatives implemented per quarter', targetValue: 2, unit: 'No.', direction: 'higher', criteria: { O: 4, E: 3, VG: 2, G: 1, F: 1, P: 0 } },
              { id: 'nc_kpi_2', description: 'Percentage of MDAs engaged on service delivery compliance', targetValue: 80, unit: '%', direction: 'higher', criteria: { O: 100, E: 90, VG: 80, G: 70, F: 60, P: 50 } },
            ]
          },
          {
            id: 'nc_obj_2',
            description: 'Oversee and validate the annual performance appraisal cycle for all SERVICOM staff.',
            weight: 50,
            gradedWeight: 4.5,
            kpis: [
              { id: 'nc_kpi_3', description: 'Percentage of appraisals completed and approved within the cycle', targetValue: 100, unit: '%', direction: 'higher', criteria: { O: 100, E: 90, VG: 80, G: 70, F: 60, P: 50 } },
            ]
          }
        ]
      }
    ]
  },

  // ── PUBLIC AWARENESS HEAD ─────────────────────────────────────────────────
  {
    id: 'temp_pa_head',
    name: 'Public Awareness Head',
    description: 'Public sensitization, media, and stakeholder communications',
    departmentId: 'dept_pa',
    kras: [
      ...COMMON_KRAS_SUFFIX('pa'),
      {
        id: 'pa_kra_comms',
        serialNo: 4,
        name: 'Public Sensitization & Communications',
        weight: 55,
        objectives: [
          {
            id: 'pa_obj_1',
            description: 'Design and execute public awareness campaigns to sensitize citizens on their rights to quality service delivery.',
            weight: 60,
            gradedWeight: 5.0,
            kpis: [
              { id: 'pa_kpi_1', description: 'Number of public awareness campaigns executed per quarter', targetValue: 2, unit: 'No.', direction: 'higher', criteria: { O: 4, E: 3, VG: 2, G: 1, F: 1, P: 0 } },
              { id: 'pa_kpi_2', description: 'Estimated public reach per campaign (Persons)', targetValue: 500, unit: 'Persons', direction: 'higher', criteria: { O: 1000, E: 750, VG: 500, G: 300, F: 200, P: 100 } },
            ]
          },
          {
            id: 'pa_obj_2',
            description: 'Manage SERVICOM\'s media presence and ensure timely publication of service delivery reports and updates.',
            weight: 40,
            gradedWeight: 3.5,
            kpis: [
              { id: 'pa_kpi_3', description: 'Number of media publications/press releases per quarter', targetValue: 4, unit: 'No.', direction: 'higher', criteria: { O: 6, E: 5, VG: 4, G: 3, F: 2, P: 1 } },
            ]
          }
        ]
      }
    ]
  }
);
