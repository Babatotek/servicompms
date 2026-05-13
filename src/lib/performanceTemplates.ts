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
  targetValue: number | string;
  unit: string;
  direction: 'higher' | 'lower';
  criteria: { O: number|string; E: number|string; VG: number|string; G: number|string; F: number|string; P: number|string; };
}

export const PERFORMANCE_TEMPLATES: PerformanceTemplate[] = [
  {
    id: "temp_admin_staff",
    name: "Admin Staff",
    description: "Administration unit staff (registry, records)",
    departmentId: "dept_admin",
    kras: [
    {
      id: "temp_admin_staff_kra1", serialNo: 1, name: "PMS Compliance & Performance Management", weight: 2.15,
      objectives: [
        { id: "temp_admin_staff_kra1_o1", description: "Develop and submit personal performance contract with clearly defined (SMART) targets aligned to SERVICOM and unit objectives", weight: 0.43, gradedWeight: 1.62, kpis: [
          { id: "temp_admin_staff_kra1_o1_k1", description: "Timely submission of performance contract (within approved timeline)", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
        { id: "temp_admin_staff_kra1_o2", description: "Participate in PMS trainings and capacity-building sessions to enhance understanding of PMS processes", weight: 0.43, gradedWeight: 1.62, kpis: [
          { id: "temp_admin_staff_kra1_o2_k1", description: "% of assigned PMS trainings attended", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
        { id: "temp_admin_staff_kra1_o3", description: "Complete and submit quarterly self-appraisal reports within approved timelines", weight: 0.43, gradedWeight: 1.62, kpis: [
          { id: "temp_admin_staff_kra1_o3_k1", description: "% of quarterly appraisals submitted on time", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
        { id: "temp_admin_staff_kra1_o4", description: "Engage in periodic performance review discussions with supervisor and implement feedback", weight: 0.43, gradedWeight: 1.62, kpis: [
          { id: "temp_admin_staff_kra1_o4_k1", description: "Number of review sessions attended and feedback implemented", targetValue: 5, unit: "NUMBER", direction: 'higher', criteria: { O: ">5", E: 5, VG: 4, G: 3, F: 2, P: 1 } },
        ]},
        { id: "temp_admin_staff_kra1_o5", description: "Maintain accurate personal performance records and supporting evidence for appraisal", weight: 0.43, gradedWeight: 1.62, kpis: [
          { id: "temp_admin_staff_kra1_o5_k1", description: "Completeness of appraisal documentation (no gaps/errors)", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
      ],
    },
    {
      id: "temp_admin_staff_kra2", serialNo: 2, name: "Records & Workflow Digitization.", weight: 2.15,
      objectives: [
        { id: "temp_admin_staff_kra2_o1", description: "Scan and digitize physical records into electronic formats", weight: 1.07, gradedWeight: 4.05, kpis: [
          { id: "temp_admin_staff_kra2_o1_k1", description: "% of targeted records digitized", targetValue: 50, unit: "%", direction: 'higher', criteria: { O: ">50", E: 50, VG: 45, G: 40, F: 25, P: "<25" } },
        ]},
        { id: "temp_admin_staff_kra2_o2", description: "Ensure secure storage and backup of digitized records", weight: 1.07, gradedWeight: 4.05, kpis: [
          { id: "temp_admin_staff_kra2_o2_k1", description: "% of records backed up successfully", targetValue: 50, unit: "%", direction: 'higher', criteria: { O: ">50", E: 50, VG: 45, G: 40, F: 25, P: "<25" } },
        ]},
      ],
    },
    {
      id: "temp_admin_staff_kra3", serialNo: 3, name: "Records & Administrative Coordination", weight: 14.30,
      objectives: [
        { id: "temp_admin_staff_kra3_o1", description: "Supervise registry operations and ensure proper filing system", weight: 2.86, gradedWeight: 10.79, kpis: [
          { id: "temp_admin_staff_kra3_o1_k1", description: "% of files accurately classified and stored", targetValue: 80, unit: "%", direction: 'higher', criteria: { O: ">80", E: 80, VG: 75, G: 70, F: 50, P: "<50" } },
        ]},
        { id: "temp_admin_staff_kra3_o2", description: "Coordinate movement and tracking of files across units", weight: 2.86, gradedWeight: 10.79, kpis: [
          { id: "temp_admin_staff_kra3_o2_k1", description: "% of files delivered within stipulated timelines", targetValue: 80, unit: "%", direction: 'higher', criteria: { O: ">80", E: 80, VG: 75, G: 70, F: 50, P: "<50" } },
        ]},
        { id: "temp_admin_staff_kra3_o3", description: "Maintain updated records database/register", weight: 2.86, gradedWeight: 10.79, kpis: [
          { id: "temp_admin_staff_kra3_o3_k1", description: "% of records updated and retrievable within required time", targetValue: 80, unit: "%", direction: 'higher', criteria: { O: ">80", E: 80, VG: 75, G: 70, F: 50, P: "<50" } },
        ]},
        { id: "temp_admin_staff_kra3_o4", description: "Facilitate staff and nodal officers’ document access", weight: 2.86, gradedWeight: 10.79, kpis: [
          { id: "temp_admin_staff_kra3_o4_k1", description: "% of requests attended to within agreed timeframe", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
        { id: "temp_admin_staff_kra3_o5", description: "Generate periodic registry reports", weight: 2.86, gradedWeight: 10.79, kpis: [
          { id: "temp_admin_staff_kra3_o5_k1", description: "% of reports submitted on schedule", targetValue: 90, unit: "%", direction: 'higher', criteria: { O: ">90", E: 90, VG: 80, G: 70, F: 50, P: "<50" } },
        ]},
      ],
    },
    {
      id: "temp_admin_staff_kra4", serialNo: 4, name: "Service Innovation And Improvement", weight: 0.22,
      objectives: [
        { id: "temp_admin_staff_kra4_o1", description: "Identify gaps or inefficiencies in existing service delivery processes", weight: 0.11, gradedWeight: 0.42, kpis: [
          { id: "temp_admin_staff_kra4_o1_k1", description: "% of service processes reviewed vs total assigned", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
        { id: "temp_admin_staff_kra4_o2", description: "Identify areas for service improvement within the unit or agency", weight: 0.11, gradedWeight: 0.42, kpis: [
          { id: "temp_admin_staff_kra4_o2_k1", description: "Number of improvement opportunities identified", targetValue: 5, unit: "NUMBER", direction: 'higher', criteria: { O: ">5", E: 5, VG: 4, G: 3, F: 2, P: 1 } },
        ]},
      ],
    },
    {
      id: "temp_admin_staff_kra5", serialNo: 5, name: "Automated Service Delivery", weight: 0.90,
      objectives: [
        { id: "temp_admin_staff_kra5_o1", description: "Identify and prioritize routine processes for automation", weight: 0.45, gradedWeight: 1.69, kpis: [
          { id: "temp_admin_staff_kra5_o1_k1", description: "Number of Processes, Forms, and Tasks Identified for Automation", targetValue: 5, unit: "NUMBER", direction: 'higher', criteria: { O: ">5", E: 5, VG: 4, G: 3, F: 2, P: 1 } },
        ]},
        { id: "temp_admin_staff_kra5_o2", description: "Use official email for all formal communication, submission of media content, and correspondence", weight: 0.45, gradedWeight: 1.69, kpis: [
          { id: "temp_admin_staff_kra5_o2_k1", description: "% compliance with official email usage", targetValue: 0.5, unit: "%", direction: 'higher', criteria: { O: ">50", E: 50, VG: 45, G: 40, F: 25, P: "<25" } },
        ]},
      ],
    },
    {
      id: "temp_admin_staff_kra6", serialNo: 6, name: "Capacity Development & Professional Growth,", weight: 3.58,
      objectives: [
        { id: "temp_admin_staff_kra6_o1", description: "Participate actively in trainings, workshops, and seminars to enhance professional skills", weight: 3.58, gradedWeight: 13.50, kpis: [
          { id: "temp_admin_staff_kra6_o1_k1", description: "% of assigned training sessions attended", targetValue: 80, unit: "%", direction: 'higher', criteria: { O: ">80", E: 80, VG: 75, G: 70, F: 50, P: "<50" } },
        ]},
      ],
    },
    {
      id: "temp_admin_staff_kra7", serialNo: 7, name: "Staff Recognition", weight: 1.43,
      objectives: [
        { id: "temp_admin_staff_kra7_o1", description: "Participate in staff recognition programs, award ceremonies, and motivational events", weight: 1.43, gradedWeight: 5.40, kpis: [
          { id: "temp_admin_staff_kra7_o1_k1", description: "% of participation in all scheduled events per year", targetValue: 70, unit: "%", direction: 'higher', criteria: { O: ">70", E: 70, VG: 60, G: 50, F: 40, P: "<40" } },
        ]},
      ],
    },
    {
      id: "temp_admin_staff_kra8", serialNo: 8, name: "Wellness Programs", weight: 1.79,
      objectives: [
        { id: "temp_admin_staff_kra8_o1", description: "Attend wellness and health programs (fitness sessions, health checks, mental health workshops)", weight: 1.79, gradedWeight: 6.75, kpis: [
          { id: "temp_admin_staff_kra8_o1_k1", description: "% participation in wellness programs", targetValue: 50, unit: "%", direction: 'higher', criteria: { O: ">50", E: 50, VG: 45, G: 40, F: 25, P: "<25" } },
        ]},
      ],
    },
  ],
  },
  {
    id: "temp_account_head",
    name: "Account & Finance Head",
    description: "Finance and Account department head",
    departmentId: "dept_account",
    kras: [
    {
      id: "temp_account_head_kra1", serialNo: 1, name: "Governance & Service Delivery", weight: 0.43,
      objectives: [
        { id: "temp_account_head_kra1_o1", description: "Strengthen and institutionalize the effective utilization of the Performance Management System (PMS) to enhance accountability, performance tracking, and service delivery outcomes across SERVICOM.", weight: 0.07, gradedWeight: 0.75, kpis: [
          { id: "temp_account_head_kra1_o1_k1", description: "PMS Implementation Rate across Units", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_account_head_kra1_o1_k2", description: "% of staff with completed and approved performance contract aligned to SERVICOM objectives.", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_account_head_kra1_o1_k3", description: "% of performance reviews and appraisals completed within approved PMS timelines.", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
        { id: "temp_account_head_kra1_o2", description: "Initiate and institutionalize the digitization of records and work processes to improve information management, workflow efficiency, and readiness for the  adoption of an Enterprise Content Management (ECM) system.", weight: 0.08, gradedWeight: 0.90, kpis: [
          { id: "temp_account_head_kra1_o2_k1", description: "% of Staff Trained on Digital Records and Workflow Management", targetValue: 50, unit: "%", direction: 'higher', criteria: { O: ">50", E: 50, VG: 45, G: 40, F: 25, P: "<25" } },
          { id: "temp_account_head_kra1_o2_k2", description: "% increase in the use of digital documentation and approval processes compared to baseline.", targetValue: 50, unit: "%", direction: 'higher', criteria: { O: ">50", E: 50, VG: 45, G: 40, F: 25, P: "<25" } },
          { id: "temp_account_head_kra1_o2_k3", description: "% of Transactions Processed Digitally", targetValue: 75, unit: "%", direction: 'higher', criteria: { O: ">75", E: 75, VG: 70, G: 60, F: 50, P: "<50" } },
        ]},
      ],
    },
    {
      id: "temp_account_head_kra2", serialNo: 2, name: "Financial Management, Budgeting, and Accounting Services", weight: 5,
      objectives: [
        { id: "temp_account_head_kra2_o1", description: "Prepare and manage SERVICOM’s annual budget in line with approved financial regulations", weight: 0.50, gradedWeight: 5.61, kpis: [
          { id: "temp_account_head_kra2_o1_k1", description: "Timely preparation and submission of annual budget", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_account_head_kra2_o1_k2", description: "% of budget estimates prepared in line with approved guidelines", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
        { id: "temp_account_head_kra2_o2", description: "Ensure accurate financial record-keeping and proper retirement of advances", weight: 0.50, gradedWeight: 5.61, kpis: [
          { id: "temp_account_head_kra2_o2_k1", description: "% of advances retired within approved timelines", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_account_head_kra2_o2_k2", description: "% of vouchers with complete and accurate supporting documents", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
        { id: "temp_account_head_kra2_o3", description: "Ensure proper verification, processing, and payment of financial transactions", weight: 0.30, gradedWeight: 3.37, kpis: [
          { id: "temp_account_head_kra2_o3_k1", description: "% of payment vouchers verified and processed in line with approval", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_account_head_kra2_o3_k2", description: "% of payments effected based on duly approved memos", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_account_head_kra2_o3_k3", description: "Average turnaround time for processing payment vouchers", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
        { id: "temp_account_head_kra2_o4", description: "Strengthen financial reporting and compliance with IPSAS (Accrual Basis)", weight: 1, gradedWeight: 11.23, kpis: [
          { id: "temp_account_head_kra2_o4_k1", description: "Timely preparation and submission of annual financial statements", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_account_head_kra2_o4_k2", description: "Level of compliance with IPSAS (Accrual) requirements", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
      ],
    },
    {
      id: "temp_account_head_kra3", serialNo: 3, name: "Service Innovation And Improvement", weight: 0.25,
      objectives: [
        { id: "temp_account_head_kra3_o1", description: "Strengthen a culture of innovation and technology adoption within SERVICOM by identifying, piloting, and implementing service-improvement initiatives, while actively promoting staff participation in the OHCSF Innovation Challenge.", weight: 0.10, gradedWeight: 1.12, kpis: [
          { id: "temp_account_head_kra3_o1_k1", description: "Number of Innovation, Initiative, and Technology Ideas Generated", targetValue: 5, unit: "NUMBER", direction: 'higher', criteria: { O: ">5", E: 5, VG: 4, G: 3, F: 2, P: 1 } },
          { id: "temp_account_head_kra3_o1_k2", description: "% of Identified Innovations and Initiatives Implemented or Piloted", targetValue: 10, unit: "%", direction: 'higher', criteria: { O: ">10", E: 10, VG: 7, G: 6, F: 5, P: "<5" } },
          { id: "temp_account_head_kra3_o1_k3", description: "Number of SERVICOM Staff Participating in the OHCSF Innovation Challenge", targetValue: 2, unit: "NUMBER", direction: 'higher', criteria: { O: ">2", E: 2, VG: 1, G: 0, F: 0, P: 0 } },
        ]},
      ],
    },
    {
      id: "temp_account_head_kra4", serialNo: 4, name: "Automated Service Delivery", weight: 0.50,
      objectives: [
        { id: "temp_account_head_kra4_o1", description: "Identify, prioritize, and automate key service delivery processes, forms, and routine tasks, while standardizing the use of official email communication to improve efficiency, accuracy, transparency, and accountability across SERVICOM.", weight: 0.10, gradedWeight: 1.12, kpis: [
          { id: "temp_account_head_kra4_o1_k1", description: "Number of Processes, Forms, and Tasks Identified for Automation", targetValue: 5, unit: "NUMBER", direction: 'higher', criteria: { O: ">5", E: 5, VG: 4, G: 3, F: 2, P: 1 } },
          { id: "temp_account_head_kra4_o1_k2", description: "% of Identified Processes and Forms Automated or Digitized", targetValue: 20, unit: "%", direction: 'higher', criteria: { O: ">20", E: 20, VG: 15, G: 10, F: 5, P: "<5" } },
          { id: "temp_account_head_kra4_o1_k3", description: "% of Staff Actively Using Official Email for Work-Related Communication", targetValue: 80, unit: "%", direction: 'higher', criteria: { O: ">80", E: 80, VG: 75, G: 70, F: 50, P: "<50" } },
        ]},
      ],
    },
    {
      id: "temp_account_head_kra5", serialNo: 5, name: "Capacity Building", weight: 0.17,
      objectives: [
        { id: "temp_account_head_kra5_o1", description: "Enhance the skills, competencies, and knowledge of SERVICOM staff through training, induction, and orientation, ensuring excellent service delivery, adoption of best practices, and seamless integration of new, transferred, and promoted staff within their respective units.", weight: 0.10, gradedWeight: 1.12, kpis: [
          { id: "temp_account_head_kra5_o1_k1", description: "% of all staff trained on service delivery standards, best practices, and functional skills", targetValue: 80, unit: "%", direction: 'higher', criteria: { O: ">80", E: 80, VG: 75, G: 70, F: 50, P: "<50" } },
          { id: "temp_account_head_kra5_o1_k2", description: "% of new, transferred, and promoted staff successfully inducted/oriented within 30 days of joining, transfer, or promotion", targetValue: 80, unit: "%", direction: 'higher', criteria: { O: ">80", E: 80, VG: 75, G: 70, F: 50, P: "<50" } },
        ]},
      ],
    },
    {
      id: "temp_account_head_kra6", serialNo: 6, name: "Support For Service Delivery", weight: 2.43,
      objectives: [
        { id: "temp_account_head_kra6_o1", description: "Ensure the efficient and effective implementation of services and programmes within SERVICOM and streamline payment processes to guarantee that payments and staff claims are processed and disbursed within required timelines, thereby optimizing financial efficiency and reducing delays", weight: 1, gradedWeight: 11.23, kpis: [
          { id: "temp_account_head_kra6_o1_k1", description: "% of services and programmes implemented within approved timelines", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_account_head_kra6_o1_k2", description: "% of payments and staff claims processed within the required timeline", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
        { id: "temp_account_head_kra6_o2", description: "Strengthen regulatory compliance within the SERVICOM by implementing robust financial control measures to prevent and eliminate cases of fraud, irregularities, and non-adherence to financial regulations and government policies.", weight: 0.43, gradedWeight: 4.81, kpis: [
          { id: "temp_account_head_kra6_o2_k1", description: "% compliance with financial regulations and government policies", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
      ],
    },
    {
      id: "temp_account_head_kra7", serialNo: 7, name: "Staff Welfare", weight: 0.13,
      objectives: [
        { id: "temp_account_head_kra7_o1", description: "Promote staff welfare, motivation, and recognition", weight: 0.07, gradedWeight: 0.75, kpis: [
          { id: "temp_account_head_kra7_o1_k1", description: "Staff satisfaction level with welfare and recognition initiatives", targetValue: 0.7, unit: "%", direction: 'higher', criteria: { O: ">70", E: 70, VG: 60, G: 50, F: 40, P: "<40" } },
        ]},
        { id: "temp_account_head_kra7_o2", description: "Promote work-life balance, wellness, and staff health", weight: 0.07, gradedWeight: 0.75, kpis: [
          { id: "temp_account_head_kra7_o2_k1", description: "Number of wellness and fitness sessions conducted", targetValue: 5, unit: "NUMBER", direction: 'higher', criteria: { O: ">5", E: 5, VG: 4, G: 3, F: 2, P: 1 } },
        ]},
      ],
    },
  ],
  },
  {
    id: "temp_pa_head",
    name: "Public Awareness Head",
    description: "Public Awareness department head",
    departmentId: "dept_pa",
    kras: [
    {
      id: "temp_pa_head_kra1", serialNo: 1, name: "Governance & Service Delivery", weight: 2.03,
      objectives: [
        { id: "temp_pa_head_kra1_o1", description: "Strengthen and institutionalize the effective utilization of the Performance Management System (PMS) to enhance accountability, performance tracking, and service delivery outcomes across SERVICOM.", weight: 0.07, gradedWeight: 0.56, kpis: [
          { id: "temp_pa_head_kra1_o1_k1", description: "PMS Implementation Rate across Units", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_pa_head_kra1_o1_k2", description: "% of staff with completed and approved performance contract aligned to SERVICOM objectives.", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_pa_head_kra1_o1_k3", description: "% of performance reviews and appraisals completed within approved PMS timelines.", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
        { id: "temp_pa_head_kra1_o2", description: "Initiate and institutionalize the digitization of records and work processes to improve information management, workflow efficiency, and readiness for the  adoption of an Enterprise Content Management (ECM) system.", weight: 0.08, gradedWeight: 0.67, kpis: [
          { id: "temp_pa_head_kra1_o2_k1", description: "% of Staff Trained on Digital Records and Workflow Management", targetValue: 50, unit: "%", direction: 'higher', criteria: { O: ">50", E: 50, VG: 45, G: 40, F: 25, P: "<25" } },
          { id: "temp_pa_head_kra1_o2_k2", description: "% increase in the use of digital documentation and approval processes compared to baseline.", targetValue: 50, unit: "%", direction: 'higher', criteria: { O: ">50", E: 50, VG: 45, G: 40, F: 25, P: "<25" } },
          { id: "temp_pa_head_kra1_o2_k3", description: "% of Transactions Processed Digitally", targetValue: 75, unit: "%", direction: 'higher', criteria: { O: ">75", E: 75, VG: 70, G: 60, F: 50, P: "<50" } },
        ]},
        { id: "temp_pa_head_kra1_o3", description: "Initiate and implement quarterly citizens and stakeholder engagement sessions to communicate SERVICOM activities and serve as a feedback mechanism.", weight: 1.20, gradedWeight: 10.12, kpis: [
          { id: "temp_pa_head_kra1_o3_k1", description: "Total number of quarterly  engagement sessions held with citizens and stakeholders", targetValue: 4, unit: "NUMBER", direction: 'higher', criteria: { O: ">4", E: 4, VG: 3, G: 2, F: 1, P: 0 } },
        ]},
        { id: "temp_pa_head_kra1_o4", description: "Promote disability inclusion and accessibility awareness within SERVICOM to ensure inclusive internal service processes, communication, and staff conduct.", weight: 0.20, gradedWeight: 1.69, kpis: [
          { id: "temp_pa_head_kra1_o4_k1", description: "% of SERVICOM Staff Trained on Accessibility Practices and Disability Awareness", targetValue: 0.5, unit: "%", direction: 'higher', criteria: { O: ">50", E: 50, VG: 45, G: 40, F: 25, P: "<25" } },
          { id: "temp_pa_head_kra1_o4_k2", description: "% of SERVICOM public-facing information materials (service charters, feedback forms, website content, notices) available in accessible formats.", targetValue: 0.75, unit: "%", direction: 'higher', criteria: { O: ">75", E: 75, VG: 70, G: 60, F: 50, P: "<50" } },
        ]},
      ],
    },
    {
      id: "temp_pa_head_kra2", serialNo: 2, name: "Public Awareness, Advocacy, and Citizen Engagement", weight: 7,
      objectives: [
        { id: "temp_pa_head_kra2_o1", description: "Enhance public awareness and visibility of SERVICOM’s mandate, programmes, and achievements", weight: 1.50, gradedWeight: 12.65, kpis: [
          { id: "temp_pa_head_kra2_o1_k1", description: "Number of press interviews, media appearances, and programme features conducted (TV, radio, print)", targetValue: 20, unit: "NUMBER", direction: 'higher', criteria: { O: ">20", E: 20, VG: 15, G: 10, F: 5, P: "<5" } },
          { id: "temp_pa_head_kra2_o1_k2", description: "Number of documentaries, jingles, and awareness materials produced and disseminated", targetValue: 5, unit: "NUMBER", direction: 'higher', criteria: { O: ">5", E: 5, VG: 4, G: 3, F: 2, P: 1 } },
        ]},
        { id: "temp_pa_head_kra2_o2", description: "Leverage digital platforms and social media to expand SERVICOM’s outreach and impact", weight: 0.50, gradedWeight: 4.22, kpis: [
          { id: "temp_pa_head_kra2_o2_k1", description: "Growth rate of followers and engagement across SERVICOM social media platforms", targetValue: 0.2, unit: "%", direction: 'higher', criteria: { O: ">20", E: 20, VG: 15, G: 10, F: 5, P: "<5" } },
          { id: "temp_pa_head_kra2_o2_k2", description: "Number of audio-visual advocacy materials produced and shared online", targetValue: 20, unit: "%", direction: 'higher', criteria: { O: ">20", E: 20, VG: 15, G: 10, F: 5, P: "<5" } },
        ]},
        { id: "temp_pa_head_kra2_o3", description: "Promote transparency and accountability through publication of SERVICOM reports and evaluations", weight: 0.50, gradedWeight: 4.22, kpis: [
          { id: "temp_pa_head_kra2_o3_k1", description: "Number of SERVICOM evaluation reports published in national dailies", targetValue: 5, unit: "NUMBER", direction: 'higher', criteria: { O: ">5", E: 5, VG: 4, G: 3, F: 2, P: 1 } },
          { id: "temp_pa_head_kra2_o3_k2", description: "Timeliness of report dissemination", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
        { id: "temp_pa_head_kra2_o4", description: "Improve internal capacity and productivity for effective media and publicity operations", weight: 1, gradedWeight: 8.44, kpis: [
          { id: "temp_pa_head_kra2_o4_k1", description: "% Turnaround time for media coverage and content production", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_pa_head_kra2_o4_k2", description: "Availability and functionality of media and digital equipment", targetValue: 0.8, unit: "%", direction: 'higher', criteria: { O: ">80", E: 80, VG: 75, G: 70, F: 50, P: "<50" } },
        ]},
        { id: "temp_pa_head_kra2_o5", description: "Support national and global service delivery initiatives and campaigns", weight: 0.50, gradedWeight: 4.22, kpis: [
          { id: "temp_pa_head_kra2_o5_k1", description: "% of planned national and global service delivery campaigns successfully implemented", targetValue: 0.8, unit: "%", direction: 'higher', criteria: { O: ">80", E: 80, VG: 75, G: 70, F: 50, P: "<50" } },
          { id: "temp_pa_head_kra2_o5_k2", description: "% of MDAs that actively participated in Customer Service Week and related campaigns under SERVICOM’s coordination", targetValue: 0.3, unit: "%", direction: 'higher', criteria: { O: ">30", E: 30, VG: 25, G: 20, F: 10, P: "<10" } },
        ]},
      ],
    },
    {
      id: "temp_pa_head_kra3", serialNo: 3, name: "Service Innovation And Improvement", weight: 0.25,
      objectives: [
        { id: "temp_pa_head_kra3_o1", description: "Strengthen a culture of innovation and technology adoption within SERVICOM by identifying, piloting, and implementing service-improvement initiatives, while actively promoting staff participation in the OHCSF Innovation Challenge.", weight: 0.10, gradedWeight: 0.84, kpis: [
          { id: "temp_pa_head_kra3_o1_k1", description: "Number of Innovation, Initiative, and Technology Ideas Generated", targetValue: 5, unit: "NUMBER", direction: 'higher', criteria: { O: ">5", E: 5, VG: 4, G: 3, F: 2, P: 1 } },
          { id: "temp_pa_head_kra3_o1_k2", description: "% of Identified Innovations and Initiatives Implemented or Piloted", targetValue: 0.1, unit: "%", direction: 'higher', criteria: { O: ">10", E: 10, VG: 7, G: 6, F: 5, P: "<5" } },
          { id: "temp_pa_head_kra3_o1_k3", description: "Number of SERVICOM Staff Participating in the OHCSF Innovation Challenge", targetValue: 2, unit: "NUMBER", direction: 'higher', criteria: { O: ">2", E: 2, VG: 1, G: 0, F: 0, P: 0 } },
        ]},
      ],
    },
    {
      id: "temp_pa_head_kra4", serialNo: 4, name: "Stakeholder Engagement (MDA)", weight: 1.35,
      objectives: [
        { id: "temp_pa_head_kra4_o1", description: "Strengthen internal stakeholder engagement within SERVICOM by improving communication, collaboration, and coordination among units to enhance teamwork and organizational effectiveness.", weight: 0.75, gradedWeight: 6.33, kpis: [
          { id: "temp_pa_head_kra4_o1_k1", description: "Number of structured inter-unit meetings, workshops, or knowledge-sharing sessions held during the year.", targetValue: 2, unit: "NUMBER", direction: 'higher', criteria: { O: ">2", E: 2, VG: 1, G: 0, F: 0, P: 0 } },
          { id: "temp_pa_head_kra4_o1_k2", description: "Number of Cross-Unit Collaboration Initiatives Implemented", targetValue: 2, unit: "NUMBER", direction: 'higher', criteria: { O: ">2", E: 2, VG: 1, G: 0, F: 0, P: 0 } },
        ]},
      ],
    },
    {
      id: "temp_pa_head_kra5", serialNo: 5, name: "Automated Service Delivery", weight: 0.50,
      objectives: [
        { id: "temp_pa_head_kra5_o1", description: "Identify, prioritize, and automate key service delivery processes, forms, and routine tasks, while standardizing the use of official email communication to improve efficiency, accuracy, transparency, and accountability across SERVICOM.", weight: 0.10, gradedWeight: 0.84, kpis: [
          { id: "temp_pa_head_kra5_o1_k1", description: "Number of Processes, Forms, and Tasks Identified for Automation", targetValue: 2, unit: "NUMBER", direction: 'higher', criteria: { O: ">2", E: 2, VG: 1, G: 0, F: 0, P: 0 } },
          { id: "temp_pa_head_kra5_o1_k2", description: "% of Identified Processes and Forms Automated or Digitized", targetValue: 0.2, unit: "%", direction: 'higher', criteria: { O: ">20", E: 20, VG: 15, G: 10, F: 5, P: "<5" } },
          { id: "temp_pa_head_kra5_o1_k3", description: "% of Staff Actively Using Official Email for Work-Related Communication", targetValue: 0.8, unit: "%", direction: 'higher', criteria: { O: ">80", E: 80, VG: 75, G: 70, F: 50, P: "<50" } },
        ]},
      ],
    },
    {
      id: "temp_pa_head_kra6", serialNo: 6, name: "Capacity Building", weight: 0.17,
      objectives: [
        { id: "temp_pa_head_kra6_o1", description: "Enhance the skills, competencies, and knowledge of SERVICOM staff through training, induction, and orientation, ensuring excellent service delivery, adoption of best practices, and seamless integration of new, transferred, and promoted staff within their respective units.", weight: 0.10, gradedWeight: 0.84, kpis: [
          { id: "temp_pa_head_kra6_o1_k1", description: "% of all staff trained on service delivery standards, best practices, and functional skills", targetValue: 80, unit: "%", direction: 'higher', criteria: { O: ">80", E: 80, VG: 75, G: 70, F: 50, P: "<50" } },
          { id: "temp_pa_head_kra6_o1_k2", description: "% of new, transferred, and promoted staff successfully inducted/oriented within 30 days of joining, transfer, or promotion", targetValue: 80, unit: "%", direction: 'higher', criteria: { O: ">80", E: 80, VG: 75, G: 70, F: 50, P: "<50" } },
        ]},
      ],
    },
    {
      id: "temp_pa_head_kra7", serialNo: 7, name: "Support For Service Delivery", weight: 0.43,
      objectives: [
        { id: "temp_pa_head_kra7_o1", description: "Strengthen regulatory compliance within the SERVICOM by implementing robust financial control measures to prevent and eliminate cases of fraud, irregularities, and non-adherence to financial regulations and government policies.", weight: 0.43, gradedWeight: 3.62, kpis: [
          { id: "temp_pa_head_kra7_o1_k1", description: "% compliance with financial regulations and government policies", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
      ],
    },
    {
      id: "temp_pa_head_kra8", serialNo: 8, name: "Staff Welfare", weight: 0.13,
      objectives: [
        { id: "temp_pa_head_kra8_o1", description: "Promote staff welfare, motivation, and recognition", weight: 0.07, gradedWeight: 0.56, kpis: [
          { id: "temp_pa_head_kra8_o1_k1", description: "Staff satisfaction level with welfare and recognition initiatives", targetValue: 70, unit: "%", direction: 'higher', criteria: { O: ">70", E: 70, VG: 60, G: 50, F: 40, P: "<40" } },
        ]},
        { id: "temp_pa_head_kra8_o2", description: "Promote work-life balance, wellness, and staff health", weight: 0.07, gradedWeight: 0.56, kpis: [
          { id: "temp_pa_head_kra8_o2_k1", description: "Staff participation rate in wellness programmes", targetValue: 50, unit: "%", direction: 'higher', criteria: { O: ">50", E: 50, VG: 45, G: 40, F: 25, P: "<25" } },
        ]},
      ],
    },
  ],
  },
  {
    id: "temp_audit_head",
    name: "Internal Audit Head",
    description: "Internal Audit department head",
    departmentId: "dept_audit",
    kras: [
    {
      id: "temp_audit_head_kra1", serialNo: 1, name: "Governance & Service Delivery", weight: 0.43,
      objectives: [
        { id: "temp_audit_head_kra1_o1", description: "Strengthen and institutionalize the effective utilization of the Performance Management System (PMS) to enhance accountability, performance tracking, and service delivery outcomes across SERVICOM.", weight: 0.07, gradedWeight: 0.97, kpis: [
          { id: "temp_audit_head_kra1_o1_k1", description: "PMS Implementation Rate across Units", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_audit_head_kra1_o1_k2", description: "% of staff with completed and approved performance contract aligned to SERVICOM objectives.", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_audit_head_kra1_o1_k3", description: "% of performance reviews and appraisals completed within approved PMS timelines.", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
        { id: "temp_audit_head_kra1_o2", description: "Initiate and institutionalize the digitization of records and work processes to improve information management, workflow efficiency, and readiness for the  adoption of an Enterprise Content Management (ECM) system.", weight: 0.08, gradedWeight: 1.16, kpis: [
          { id: "temp_audit_head_kra1_o2_k1", description: "% of Staff Trained on Digital Records and Workflow Management", targetValue: 50, unit: "%", direction: 'higher', criteria: { O: ">50", E: 50, VG: 45, G: 40, F: 25, P: "<25" } },
          { id: "temp_audit_head_kra1_o2_k2", description: "% increase in the use of digital documentation and approval processes compared to baseline.", targetValue: 50, unit: "%", direction: 'higher', criteria: { O: ">50", E: 50, VG: 45, G: 40, F: 25, P: "<25" } },
          { id: "temp_audit_head_kra1_o2_k3", description: "% of Transactions Processed Digitally", targetValue: 75, unit: "%", direction: 'higher', criteria: { O: ">75", E: 75, VG: 70, G: 60, F: 50, P: "<50" } },
        ]},
      ],
    },
    {
      id: "temp_audit_head_kra2", serialNo: 2, name: "Internal Audit, Financial Control, and Compliance Assurance", weight: 3,
      objectives: [
        { id: "temp_audit_head_kra2_o1", description: "Ensure timely audit, certification, and reporting of SERVICOM financial statements", weight: 0.30, gradedWeight: 4.34, kpis: [
          { id: "temp_audit_head_kra2_o1_k1", description: "Timely submission of annual, half-yearly, quarterly, and monthly audit reports", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_audit_head_kra2_o1_k2", description: "% of statutory audit reports submitted within approved timelines", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_audit_head_kra2_o1_k3", description: "Compliance rate with reporting requirements of OAuGF and OAGF", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
        { id: "temp_audit_head_kra2_o2", description: "Strengthen pre-payment and post-payment audit controls", weight: 0.35, gradedWeight: 5.07, kpis: [
          { id: "temp_audit_head_kra2_o2_k1", description: "% of payment vouchers subjected to pre-payment audit", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_audit_head_kra2_o2_k2", description: "% of post-payment audits conducted as scheduled", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
        { id: "temp_audit_head_kra2_o3", description: "Conduct routine and periodic audit of financial records and transactions", weight: 0.20, gradedWeight: 2.90, kpis: [
          { id: "temp_audit_head_kra2_o3_k1", description: "% of monthly audits completed as planned", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_audit_head_kra2_o3_k2", description: "Number of quarterly audit reviews conducted across departments", targetValue: 4, unit: ">4", direction: 'higher', criteria: { O: 4, E: 3, VG: 2, G: 1, F: 0, P: 0 } },
        ]},
        { id: "temp_audit_head_kra2_o4", description: "Evaluate the effectiveness of internal controls and safeguard government assets", weight: 0.25, gradedWeight: 3.62, kpis: [
          { id: "temp_audit_head_kra2_o4_k1", description: "% of capital assets audited quarterly", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_audit_head_kra2_o4_k2", description: "% of audit recommendations implemented by management", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
        { id: "temp_audit_head_kra2_o5", description: "Ensure proper auditing of revenue collection and remittance", weight: 0.15, gradedWeight: 2.17, kpis: [
          { id: "temp_audit_head_kra2_o5_k1", description: "% of revenue collections audited", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_audit_head_kra2_o5_k2", description: "% of revenue remitted in full and on time", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
      ],
    },
    {
      id: "temp_audit_head_kra3", serialNo: 3, name: "Service Innovation And Improvement", weight: 0.25,
      objectives: [
        { id: "temp_audit_head_kra3_o1", description: "Strengthen a culture of innovation and technology adoption within SERVICOM by identifying, piloting, and implementing service-improvement initiatives, while actively promoting staff participation in the OHCSF Innovation Challenge.", weight: 0.10, gradedWeight: 1.45, kpis: [
          { id: "temp_audit_head_kra3_o1_k1", description: "Number of Innovation, Initiative, and Technology Ideas Generated", targetValue: 5, unit: "NUMBER", direction: 'higher', criteria: { O: ">5", E: 5, VG: 4, G: 3, F: 2, P: 1 } },
          { id: "temp_audit_head_kra3_o1_k2", description: "% of Identified Innovations and Initiatives Implemented or Piloted", targetValue: 0.1, unit: "%", direction: 'higher', criteria: { O: ">10", E: 10, VG: 7, G: 6, F: 5, P: "<5" } },
          { id: "temp_audit_head_kra3_o1_k3", description: "Number of SERVICOM Staff Participating in the OHCSF Innovation Challenge", targetValue: 2, unit: "NUMBER", direction: 'higher', criteria: { O: ">2", E: 2, VG: 1, G: 0, F: 0, P: 0 } },
        ]},
      ],
    },
    {
      id: "temp_audit_head_kra4", serialNo: 4, name: "Automated Service Delivery", weight: 0.50,
      objectives: [
        { id: "temp_audit_head_kra4_o1", description: "Identify, prioritize, and automate key service delivery processes, forms, and routine tasks, while standardizing the use of official email communication to improve efficiency, accuracy, transparency, and accountability across SERVICOM.", weight: 0.10, gradedWeight: 1.45, kpis: [
          { id: "temp_audit_head_kra4_o1_k1", description: "Number of Processes, Forms, and Tasks Identified for Automation", targetValue: 5, unit: "NUMBER", direction: 'higher', criteria: { O: ">5", E: 5, VG: 4, G: 3, F: 2, P: 1 } },
          { id: "temp_audit_head_kra4_o1_k2", description: "% of Identified Processes and Forms Automated or Digitized", targetValue: 0.2, unit: "%", direction: 'higher', criteria: { O: ">20", E: 20, VG: 15, G: 10, F: 5, P: "<5" } },
          { id: "temp_audit_head_kra4_o1_k3", description: "% of Staff Actively Using Official Email for Work-Related Communication", targetValue: 0.8, unit: "%", direction: 'higher', criteria: { O: ">80", E: 80, VG: 75, G: 70, F: 50, P: "<50" } },
        ]},
      ],
    },
    {
      id: "temp_audit_head_kra5", serialNo: 5, name: "Capacity Building", weight: 0.17,
      objectives: [
        { id: "temp_audit_head_kra5_o1", description: "Enhance the skills, competencies, and knowledge of SERVICOM staff through training, induction, and orientation, ensuring excellent service delivery, adoption of best practices, and seamless integration of new, transferred, and promoted staff within their respective units.", weight: 0.10, gradedWeight: 1.45, kpis: [
          { id: "temp_audit_head_kra5_o1_k1", description: "% of all staff trained on service delivery standards, best practices, and functional skills", targetValue: 0.8, unit: "%", direction: 'higher', criteria: { O: ">80", E: 80, VG: 75, G: 70, F: 50, P: "<50" } },
          { id: "temp_audit_head_kra5_o1_k2", description: "% of new, transferred, and promoted staff successfully inducted/oriented within 30 days of joining, transfer, or promotion", targetValue: 0.8, unit: "%", direction: 'higher', criteria: { O: ">80", E: 80, VG: 75, G: 70, F: 50, P: "<50" } },
        ]},
      ],
    },
    {
      id: "temp_audit_head_kra6", serialNo: 6, name: "Support For Service Delivery", weight: 2.43,
      objectives: [
        { id: "temp_audit_head_kra6_o1", description: "Ensure the efficient and effective implementation of services and programmes within SERVICOM and streamline payment processes to guarantee that payments and staff claims are processed and disbursed within required timelines, thereby optimizing financial efficiency and reducing delays", weight: 1, gradedWeight: 14.48, kpis: [
          { id: "temp_audit_head_kra6_o1_k1", description: "% of services and programmes implemented within approved timelines", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_audit_head_kra6_o1_k2", description: "% of payments and staff claims processed within the required timeline", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
        { id: "temp_audit_head_kra6_o2", description: "Strengthen regulatory compliance within the SERVICOM by implementing robust financial control measures to prevent and eliminate cases of fraud, irregularities, and non-adherence to financial regulations and government policies.", weight: 0.43, gradedWeight: 6.21, kpis: [
          { id: "temp_audit_head_kra6_o2_k1", description: "% compliance with financial regulations and government policies", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
      ],
    },
    {
      id: "temp_audit_head_kra7", serialNo: 7, name: "Staff Welfare", weight: 0.13,
      objectives: [
        { id: "temp_audit_head_kra7_o1", description: "Promote staff welfare, motivation, and recognition", weight: 0.07, gradedWeight: 0.97, kpis: [
          { id: "temp_audit_head_kra7_o1_k1", description: "Staff satisfaction level with welfare and recognition initiatives", targetValue: 70, unit: "%", direction: 'higher', criteria: { O: ">70", E: 70, VG: 60, G: 50, F: 40, P: "<40" } },
        ]},
        { id: "temp_audit_head_kra7_o2", description: "Promote work-life balance, wellness, and staff health", weight: 0.07, gradedWeight: 0.97, kpis: [
          { id: "temp_audit_head_kra7_o2_k1", description: "Staff participation rate in wellness programmes", targetValue: 50, unit: "%", direction: 'higher', criteria: { O: ">50", E: 50, VG: 45, G: 40, F: 25, P: "<25" } },
        ]},
      ],
    },
  ],
  },
  {
    id: "temp_ict_head",
    name: "ICT / Institute Head",
    description: "ICT and SERVICOM Institute head",
    departmentId: "dept_ict",
    kras: [
    {
      id: "temp_ict_head_kra1", serialNo: 1, name: "Governance & Service Delivery", weight: 2.27,
      objectives: [
        { id: "temp_ict_head_kra1_o1", description: "Strengthen and institutionalize the effective utilization of the Performance Management System (PMS) to enhance accountability, performance tracking, and service delivery outcomes across SERVICOM.", weight: 0.07, gradedWeight: 0.35, kpis: [
          { id: "temp_ict_head_kra1_o1_k1", description: "PMS Implementation Rate across Units", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_ict_head_kra1_o1_k2", description: "% of staff with completed and approved performance contract aligned to SERVICOM objectives.", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_ict_head_kra1_o1_k3", description: "% of performance reviews and appraisals completed within approved PMS timelines.", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
        { id: "temp_ict_head_kra1_o2", description: "Initiate and institutionalize the digitization of records and work processes to improve information management, workflow efficiency, and readiness for the  adoption of an Enterprise Content Management (ECM) system.", weight: 1, gradedWeight: 5.32, kpis: [
          { id: "temp_ict_head_kra1_o2_k1", description: "% of Staff Trained on Digital Records and Workflow Management", targetValue: 50, unit: "%", direction: 'higher', criteria: { O: ">50", E: 50, VG: 45, G: 40, F: 25, P: "<25" } },
          { id: "temp_ict_head_kra1_o2_k2", description: "% increase in the use of digital documentation and approval processes compared to baseline.", targetValue: 50, unit: "%", direction: 'higher', criteria: { O: ">50", E: 50, VG: 45, G: 40, F: 25, P: "<25" } },
          { id: "temp_ict_head_kra1_o2_k3", description: "% of Transactions Processed Digitally", targetValue: 75, unit: "%", direction: 'higher', criteria: { O: ">75", E: 75, VG: 70, G: 60, F: 50, P: "<50" } },
        ]},
      ],
    },
    {
      id: "temp_ict_head_kra2", serialNo: 2, name: "ICT Governance, Digital Transformation, & Information Security", weight: 5,
      objectives: [
        { id: "temp_ict_head_kra2_o1", description: "Strengthen ICT governance and policy alignment in line with national frameworks\r\n(NDES, NITDA Guidelines, NDPR, Civil Service Reform & e-Government Agenda)", weight: 0.30, gradedWeight: 1.60, kpis: [
          { id: "temp_ict_head_kra2_o1_k1", description: "Level of compliance with NITDA and NDPR requirements", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_ict_head_kra2_o1_k2", description: "% completion of ICT asset verification and inventory update", targetValue: 80, unit: "%", direction: 'higher', criteria: { O: ">80", E: 80, VG: 75, G: 70, F: 50, P: "<50" } },
          { id: "temp_ict_head_kra2_o1_k3", description: "% of ICT and data protection policies reviewed, updated, and approved", targetValue: 90, unit: "%", direction: 'higher', criteria: { O: ">90", E: 90, VG: 80, G: 70, F: 50, P: "<50" } },
        ]},
        { id: "temp_ict_head_kra2_o2", description: "Upgrade and maintain reliable ICT infrastructure to support operations\r\n(Networks, equipment, servers, power, backups)", weight: 0.50, gradedWeight: 2.66, kpis: [
          { id: "temp_ict_head_kra2_o2_k1", description: "System and network uptime %", targetValue: 75, unit: "%", direction: 'higher', criteria: { O: ">75", E: 75, VG: 70, G: 60, F: 50, P: "<50" } },
          { id: "temp_ict_head_kra2_o2_k2", description: "% of planned ICT infrastructure upgrades completed", targetValue: 90, unit: "%", direction: 'higher', criteria: { O: ">90", E: 90, VG: 80, G: 70, F: 50, P: "<50" } },
        ]},
        { id: "temp_ict_head_kra2_o3", description: "Enhance ICT service delivery and user support through an effective helpdesk", weight: 0.50, gradedWeight: 2.66, kpis: [
          { id: "temp_ict_head_kra2_o3_k1", description: "% of ICT service requests resolved within agreed SLA", targetValue: 80, unit: "%", direction: 'higher', criteria: { O: ">80", E: 80, VG: 75, G: 70, F: 50, P: "<50" } },
          { id: "temp_ict_head_kra2_o3_k2", description: "User satisfaction rate with ICT support services", targetValue: 90, unit: "%", direction: 'higher', criteria: { O: ">90", E: 90, VG: 80, G: 70, F: 50, P: "<50" } },
        ]},
        { id: "temp_ict_head_kra2_o4", description: "Strengthen cybersecurity and data protection compliance", weight: 0.50, gradedWeight: 2.66, kpis: [
          { id: "temp_ict_head_kra2_o4_k1", description: "% of cybersecurity audits and vulnerability assessments conducted", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_ict_head_kra2_o4_k2", description: "% compliance with NDPR requirements", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
        { id: "temp_ict_head_kra2_o5", description: "Monitor, evaluate, and sustain ICT performance", weight: 0.50, gradedWeight: 2.66, kpis: [
          { id: "temp_ict_head_kra2_o5_k1", description: "Timely production of annual ICT performance report", targetValue: 80, unit: "%", direction: 'higher', criteria: { O: ">80", E: 80, VG: 75, G: 70, F: 50, P: "<50" } },
          { id: "temp_ict_head_kra2_o5_k2", description: "% of ICT deliverables achieved against annual workplan", targetValue: 20, unit: "%", direction: 'higher', criteria: { O: ">20", E: 20, VG: 15, G: 10, F: 5, P: "<5" } },
        ]},
      ],
    },
    {
      id: "temp_ict_head_kra3", serialNo: 3, name: "MDA-wide Staff Development, Training, and Capacity Enhancement", weight: 5,
      objectives: [
        { id: "temp_ict_head_kra3_o1", description: "Identify capacity gaps and establish training priorities across SERVICOM and MDAs", weight: 0.70, gradedWeight: 3.72, kpis: [
          { id: "temp_ict_head_kra3_o1_k1", description: "% of MDAs/staff covered by the Training Needs Assessment (TNA)", targetValue: 80, unit: "%", direction: 'higher', criteria: { O: ">80", E: 80, VG: 75, G: 70, F: 50, P: "<50" } },
          { id: "temp_ict_head_kra3_o1_k2", description: "Timely completion of Annual Training Needs Assessment Report", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
        { id: "temp_ict_head_kra3_o2", description: "Strengthen foundational competencies and ensure compliance with public service standards", weight: 0.50, gradedWeight: 2.66, kpis: [
          { id: "temp_ict_head_kra3_o2_k1", description: "% of newly recruited or transferred MDA staff inducted", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_ict_head_kra3_o2_k2", description: "% of eligible officers completing supervisory/leadership training", targetValue: 80, unit: "%", direction: 'higher', criteria: { O: ">80", E: 80, VG: 75, G: 70, F: 50, P: "<50" } },
        ]},
        { id: "temp_ict_head_kra3_o3", description: "Build specialized, technical, and performance-driven competencies", weight: 0.50, gradedWeight: 2.66, kpis: [
          { id: "temp_ict_head_kra3_o3_k1", description: "Number of specialized and technical training programmes conducted across MDAs", targetValue: 10, unit: "NUMBER", direction: 'higher', criteria: { O: ">10", E: 10, VG: 8, G: 6, F: 5, P: "<5" } },
          { id: "temp_ict_head_kra3_o3_k2", description: "% of targeted MDA staff completing specialized/professional training", targetValue: 80, unit: "%", direction: 'higher', criteria: { O: ">80", E: 80, VG: 75, G: 70, F: 50, P: "<50" } },
        ]},
        { id: "temp_ict_head_kra3_o4", description: "Institutionalize learning, knowledge sharing, and best practice dissemination", weight: 0.50, gradedWeight: 2.66, kpis: [
          { id: "temp_ict_head_kra3_o4_k1", description: "Number of training manuals and learning materials developed or updated", targetValue: 5, unit: "NUMBER", direction: 'higher', criteria: { O: ">5", E: 5, VG: 4, G: 3, F: 2, P: 1 } },
          { id: "temp_ict_head_kra3_o4_k2", description: "Number of knowledge-sharing workshops conducted across MDAs", targetValue: 10, unit: "NUMBER", direction: 'higher', criteria: { O: ">10", E: 10, VG: 8, G: 6, F: 5, P: "<5" } },
        ]},
        { id: "temp_ict_head_kra3_o5", description: "Evaluate training impact and measure improvement in service delivery", weight: 0.80, gradedWeight: 4.26, kpis: [
          { id: "temp_ict_head_kra3_o5_k1", description: "% of training programmes evaluated post-delivery", targetValue: 80, unit: "%", direction: 'higher', criteria: { O: ">80", E: 80, VG: 75, G: 70, F: 50, P: "<50" } },
          { id: "temp_ict_head_kra3_o5_k2", description: "% improvement in staff performance indicators after training", targetValue: 20, unit: "%", direction: 'higher', criteria: { O: ">20", E: 20, VG: 15, G: 10, F: 5, P: "<5" } },
        ]},
      ],
    },
    {
      id: "temp_ict_head_kra4", serialNo: 4, name: "Service Innovation And Improvement", weight: 3.50,
      objectives: [
        { id: "temp_ict_head_kra4_o1", description: "Strengthen a culture of innovation and technology adoption within SERVICOM by identifying, piloting, and implementing service-improvement initiatives, while actively promoting staff participation in the OHCSF Innovation Challenge.", weight: 1.40, gradedWeight: 7.45, kpis: [
          { id: "temp_ict_head_kra4_o1_k1", description: "Number of Innovation, Initiative, and Technology Ideas Generated", targetValue: 5, unit: "NUMBER", direction: 'higher', criteria: { O: ">5", E: 5, VG: 4, G: 3, F: 2, P: 1 } },
          { id: "temp_ict_head_kra4_o1_k2", description: "% of Identified Innovations and Initiatives Implemented or Piloted", targetValue: 10, unit: "%", direction: 'higher', criteria: { O: ">10", E: 10, VG: 7, G: 6, F: 5, P: "<5" } },
          { id: "temp_ict_head_kra4_o1_k3", description: "Number of SERVICOM Staff Participating in the OHCSF Innovation Challenge", targetValue: 2, unit: "NUMBER", direction: 'higher', criteria: { O: ">2", E: 2, VG: 1, G: 0, F: 0, P: 0 } },
        ]},
      ],
    },
    {
      id: "temp_ict_head_kra5", serialNo: 5, name: "Stakeholders Engagement (MDA)", weight: 0.30,
      objectives: [
        { id: "temp_ict_head_kra5_o1", description: "Strengthen internal Stakeholders engagement within SERVICOM by improving communication, collaboration, and coordination among units to enhance teamwork and organizational effectiveness.", weight: 0.30, gradedWeight: 1.60, kpis: [
          { id: "temp_ict_head_kra5_o1_k1", description: "Number of structured inter-unit meetings, workshops, or knowledge-sharing sessions held during the year.", targetValue: 5, unit: "NUMBER", direction: 'higher', criteria: { O: ">5", E: 5, VG: 4, G: 3, F: 2, P: 1 } },
        ]},
      ],
    },
    {
      id: "temp_ict_head_kra6", serialNo: 6, name: "Automated Service Delivery", weight: 2,
      objectives: [
        { id: "temp_ict_head_kra6_o1", description: "Identify, prioritize, and automate key service delivery processes, forms, and routine tasks, while standardizing the use of official email communication to improve efficiency, accuracy, transparency, and accountability across SERVICOM.", weight: 0.40, gradedWeight: 2.13, kpis: [
          { id: "temp_ict_head_kra6_o1_k1", description: "Number of Processes, Forms, and Tasks Identified for Automation", targetValue: 5, unit: "NUMBER", direction: 'higher', criteria: { O: ">5", E: 5, VG: 4, G: 3, F: 2, P: 1 } },
          { id: "temp_ict_head_kra6_o1_k2", description: "% of Identified Processes and Forms Automated or Digitized", targetValue: 20, unit: "%", direction: 'higher', criteria: { O: ">20", E: 20, VG: 15, G: 10, F: 5, P: "<5" } },
          { id: "temp_ict_head_kra6_o1_k3", description: "% of Staff Actively Using Official Email for Work-Related Communication", targetValue: 80, unit: "%", direction: 'higher', criteria: { O: ">80", E: 80, VG: 75, G: 70, F: 50, P: "<50" } },
        ]},
      ],
    },
    {
      id: "temp_ict_head_kra7", serialNo: 7, name: "Capacity Building", weight: 0.17,
      objectives: [
        { id: "temp_ict_head_kra7_o1", description: "Enhance the skills, competencies, and knowledge of SERVICOM staff through training, induction, and orientation, ensuring excellent service delivery, adoption of best practices, and seamless integration of new, transferred, and promoted staff within their respective units.", weight: 0.10, gradedWeight: 0.53, kpis: [
          { id: "temp_ict_head_kra7_o1_k1", description: "% of all staff trained on service delivery standards, best practices, and functional skills", targetValue: 80, unit: "%", direction: 'higher', criteria: { O: ">80", E: 80, VG: 75, G: 70, F: 50, P: "<50" } },
          { id: "temp_ict_head_kra7_o1_k2", description: "% of new, transferred, and promoted staff successfully inducted/oriented within 30 days of joining, transfer, or promotion", targetValue: 80, unit: "%", direction: 'higher', criteria: { O: ">80", E: 80, VG: 75, G: 70, F: 50, P: "<50" } },
        ]},
      ],
    },
    {
      id: "temp_ict_head_kra8", serialNo: 8, name: "Support For Service Delivery", weight: 0.43,
      objectives: [
        { id: "temp_ict_head_kra8_o1", description: "Strengthen regulatory compliance within the SERVICOM by implementing robust financial control measures to prevent and eliminate cases of fraud, irregularities, and non-adherence to financial regulations and government policies.", weight: 0.43, gradedWeight: 2.28, kpis: [
          { id: "temp_ict_head_kra8_o1_k1", description: "% compliance with financial regulations and government policies", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
      ],
    },
    {
      id: "temp_ict_head_kra9", serialNo: 9, name: "Staff Welfare", weight: 0.13,
      objectives: [
        { id: "temp_ict_head_kra9_o1", description: "Promote staff welfare, motivation, and recognition", weight: 0.07, gradedWeight: 0.35, kpis: [
          { id: "temp_ict_head_kra9_o1_k1", description: "Staff satisfaction level with welfare and recognition initiatives", targetValue: 0.7, unit: "%", direction: 'higher', criteria: { O: ">70", E: 70, VG: 60, G: 50, F: 40, P: "<40" } },
        ]},
        { id: "temp_ict_head_kra9_o2", description: "Promote work-life balance, wellness, and staff health", weight: 0.07, gradedWeight: 0.35, kpis: [
          { id: "temp_ict_head_kra9_o2_k1", description: "Staff participation rate in wellness programmes", targetValue: 0.5, unit: "%", direction: 'higher', criteria: { O: ">50", E: 50, VG: 45, G: 40, F: 25, P: "<25" } },
        ]},
      ],
    },
  ],
  },
  {
    id: "temp_nc_staff",
    name: "NC Office Staff",
    description: "National Coordinator office support staff",
    departmentId: "dept_nc",
    kras: [
    {
      id: "temp_nc_staff_kra1", serialNo: 1, name: "PMS Implementation", weight: 0.27,
      objectives: [
        { id: "temp_nc_staff_kra1_o1", description: "Participation in PMS training", weight: 0.07, gradedWeight: 1.36, kpis: [
          { id: "temp_nc_staff_kra1_o1_k1", description: "% of scheduled training attended", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 99, VG: 98, G: 97, F: 96, P: 95 } },
        ]},
        { id: "temp_nc_staff_kra1_o2", description: "Completing and signing performance contracts", weight: 0.07, gradedWeight: 1.36, kpis: [
          { id: "temp_nc_staff_kra1_o2_k1", description: "% completion and signing of Performanc Contract", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 99, VG: 98, G: 97, F: 96, P: 95 } },
        ]},
        { id: "temp_nc_staff_kra1_o3", description: "Performing quarterly appraisals", weight: 0.13, gradedWeight: 2.72, kpis: [
          { id: "temp_nc_staff_kra1_o3_k1", description: "% of staff performance appraisals completed within the reporting period", targetValue: 100, unit: "NUMBER", direction: 'higher', criteria: { O: 100, E: 99, VG: 98, G: 97, F: 96, P: 95 } },
        ]},
      ],
    },
    {
      id: "temp_nc_staff_kra2", serialNo: 2, name: "ECM Operationalization", weight: 0.16,
      objectives: [
        { id: "temp_nc_staff_kra2_o1", description: "Deploy and operationalize Electronic Content Management System (ECM) in the Unit", weight: 0.16, gradedWeight: 3.26, kpis: [
          { id: "temp_nc_staff_kra2_o1_k1", description: "% of Transactions Processed Digitally", targetValue: 0.75, unit: "%", direction: 'higher', criteria: { O: ">75", E: 75, VG: 70, G: 60, F: 50, P: "<50" } },
        ]},
      ],
    },
    {
      id: "temp_nc_staff_kra3", serialNo: 3, name: "Executive Administration, Secretariat and Strategic Support", weight: 3,
      objectives: [
        { id: "temp_nc_staff_kra3_o1", description: "Provide effective administrative and secretarial support to the National Coordinator", weight: 0.50, gradedWeight: 10.19, kpis: [
          { id: "temp_nc_staff_kra3_o1_k1", description: "% of correspondence (incoming and outgoing) processed within approved timelines", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_nc_staff_kra3_o1_k2", description: "% of meetings supported with complete documentation (agenda, minutes, briefs)", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
        { id: "temp_nc_staff_kra3_o2", description: "Ensure efficient coordination and scheduling of the National Coordinator’s official activities", weight: 0.35, gradedWeight: 7.14, kpis: [
          { id: "temp_nc_staff_kra3_o2_k1", description: "% of official engagements properly scheduled and documented", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_nc_staff_kra3_o2_k2", description: "% of meetings/events attended as scheduled", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
        { id: "temp_nc_staff_kra3_o3", description: "Strengthen records management and document control for executive decisions", weight: 0.20, gradedWeight: 4.08, kpis: [
          { id: "temp_nc_staff_kra3_o3_k1", description: "% of executive files properly registered, tracked, and archived", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
          { id: "temp_nc_staff_kra3_o3_k2", description: "% of documents retrievable within agreed time standards", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
        { id: "temp_nc_staff_kra3_o4", description: "Support effective internal coordination between the National Coordinator and SERVICOM units", weight: 0.50, gradedWeight: 10.19, kpis: [
          { id: "temp_nc_staff_kra3_o4_k1", description: "% of directives from the National Coordinator communicated to relevant units within timelines", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
        { id: "temp_nc_staff_kra3_o5", description: "Provide clerical and logistical support for high-level meetings, engagements, and events", weight: 0.50, gradedWeight: 10.19, kpis: [
          { id: "temp_nc_staff_kra3_o5_k1", description: "% of high-level meetings/events supported without logistical lapses", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
      ],
    },
    {
      id: "temp_nc_staff_kra4", serialNo: 4, name: "Service Innovation And Improvement", weight: 0.25,
      objectives: [
        { id: "temp_nc_staff_kra4_o1", description: "Strengthen a culture of innovation and technology adoption within SERVICOM by identifying, piloting, and implementing service-improvement initiatives, while actively promoting staff participation in the OHCSF Innovation Challenge.", weight: 0.25, gradedWeight: 5.10, kpis: [
          { id: "temp_nc_staff_kra4_o1_k1", description: "Number of Innovation, Initiative, and Technology Ideas Generated", targetValue: 2, unit: "NUMBER", direction: 'higher', criteria: { O: ">2", E: 2, VG: 1, G: 1, F: 0, P: 0 } },
        ]},
      ],
    },
    {
      id: "temp_nc_staff_kra5", serialNo: 5, name: "Automated Service Delivery", weight: 0.50,
      objectives: [
        { id: "temp_nc_staff_kra5_o1", description: "Identify, prioritize, and automate key service delivery processes, forms, and routine tasks, while standardizing the use of official email communication to improve efficiency, accuracy, transparency, and accountability across SERVICOM.", weight: 0.50, gradedWeight: 10.19, kpis: [
          { id: "temp_nc_staff_kra5_o1_k1", description: "Number of Processes, Forms, and Tasks Identified for Automation", targetValue: 2, unit: "NUMBER", direction: 'higher', criteria: { O: ">2", E: 2, VG: 1, G: 1, F: 0, P: 0 } },
        ]},
      ],
    },
    {
      id: "temp_nc_staff_kra6", serialNo: 6, name: "Capacity Building", weight: 0.17,
      objectives: [
        { id: "temp_nc_staff_kra6_o1", description: "Participate in approved training programmes.", weight: 0.17, gradedWeight: 3.40, kpis: [
          { id: "temp_nc_staff_kra6_o1_k1", description: "% of assigned training programmes attended", targetValue: 80, unit: "%", direction: 'higher', criteria: { O: ">80", E: 80, VG: 75, G: 70, F: 50, P: "<50" } },
        ]},
      ],
    },
    {
      id: "temp_nc_staff_kra7", serialNo: 7, name: "Support For Service Delivery", weight: 0.43,
      objectives: [
        { id: "temp_nc_staff_kra7_o1", description: "Strengthen regulatory compliance within the SERVICOM by implementing robust financial control measures to prevent and eliminate cases of fraud, irregularities, and non-adherence to financial regulations and government policies.", weight: 0.43, gradedWeight: 8.74, kpis: [
          { id: "temp_nc_staff_kra7_o1_k1", description: "% compliance with financial regulations and government policies", targetValue: 100, unit: "%", direction: 'higher', criteria: { O: 100, E: 95, VG: 90, G: 85, F: 80, P: "<80" } },
        ]},
      ],
    },
    {
      id: "temp_nc_staff_kra8", serialNo: 8, name: "Staff Welfare", weight: 0.13,
      objectives: [
        { id: "temp_nc_staff_kra8_o1", description: "Promote staff welfare, motivation, and recognition", weight: 0.07, gradedWeight: 1.36, kpis: [
          { id: "temp_nc_staff_kra8_o1_k1", description: "Staff satisfaction level with welfare and recognition initiatives", targetValue: 70, unit: "%", direction: 'higher', criteria: { O: ">70", E: 70, VG: 60, G: 50, F: 40, P: "<40" } },
        ]},
        { id: "temp_nc_staff_kra8_o2", description: "Promote work-life balance, wellness, and staff health", weight: 0.07, gradedWeight: 1.36, kpis: [
          { id: "temp_nc_staff_kra8_o2_k1", description: "Staff participation rate in wellness programmes", targetValue: 50, unit: "%", direction: 'higher', criteria: { O: ">50", E: 50, VG: 45, G: 40, F: 25, P: "<25" } },
        ]},
      ],
    },
  ],
  },
];
