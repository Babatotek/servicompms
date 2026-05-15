import { MPMSCategory, MPMSKRA, MPMSObjective, MPMSKPI, MPMSCategoryCode } from '../types';

// ── Categories ────────────────────────────────────────────────────────────────
export const MPMS_CATEGORIES: MPMSCategory[] = [
  { id: 'cat_pres', code: MPMSCategoryCode.PRESIDENTIAL,    name: 'Presidential Priorities',    weight: 13 },
  { id: 'cat_mda',  code: MPMSCategoryCode.MDA_OPERATIONAL, name: 'MDA Operational Priorities', weight: 25 },
  { id: 'cat_sw',   code: MPMSCategoryCode.SERVICE_WIDE,    name: 'Service-Wide Priorities',    weight: 37 },
];

// ── KRAs ──────────────────────────────────────────────────────────────────────
export const MPMS_KRAS: MPMSKRA[] = [
  // Presidential
  { id: 'mkra_p1',  categoryId: 'cat_pres', serialNo: 1,  name: 'Governance & Service Delivery',                                    weight: 13 },
  // MDA Operational
  { id: 'mkra_m1',  categoryId: 'cat_mda',  serialNo: 1,  name: 'Service Delivery Monitoring, Evaluation & Compliance',             weight: 10 },
  { id: 'mkra_m2',  categoryId: 'cat_mda',  serialNo: 2,  name: 'Administrative Services, Staff Welfare & Office Support',          weight: 7  },
  { id: 'mkra_m3',  categoryId: 'cat_mda',  serialNo: 3,  name: 'Public Awareness, Advocacy & Citizen Engagement',                  weight: 7  },
  { id: 'mkra_m4',  categoryId: 'cat_mda',  serialNo: 4,  name: 'Financial Management, Budgeting & Accounting Services',            weight: 5  },
  { id: 'mkra_m5',  categoryId: 'cat_mda',  serialNo: 5,  name: 'Internal Audit, Financial Control & Compliance Assurance',         weight: 3  },
  { id: 'mkra_m6',  categoryId: 'cat_mda',  serialNo: 6,  name: 'ICT Governance, Digital Transformation & Information Security',    weight: 5  },
  { id: 'mkra_m7',  categoryId: 'cat_mda',  serialNo: 7,  name: 'MDA-wide Staff Development, Training & Capacity Enhancement',     weight: 5  },
  { id: 'mkra_m8',  categoryId: 'cat_mda',  serialNo: 8,  name: 'Executive Administration, Secretariat & Strategic Support',       weight: 3  },
  { id: 'mkra_m9',  categoryId: 'cat_mda',  serialNo: 9,  name: 'Procurement and Contract Management',                             weight: 3  },
  { id: 'mkra_m10', categoryId: 'cat_mda',  serialNo: 10, name: 'Legal Advisory and Compliance Services',                          weight: 2  },
  // Service Wide
  { id: 'mkra_s1',  categoryId: 'cat_sw',   serialNo: 1,  name: 'Service Innovation And Improvement',                              weight: 5  },
  { id: 'mkra_s2',  categoryId: 'cat_sw',   serialNo: 2,  name: 'Stakeholder Engagement (MDA)',                                    weight: 5  },
  { id: 'mkra_s3',  categoryId: 'cat_sw',   serialNo: 3,  name: 'Automated Service Delivery',                                      weight: 5  },
  { id: 'mkra_s4',  categoryId: 'cat_sw',   serialNo: 4,  name: 'Capacity Building',                                               weight: 5  },
  { id: 'mkra_s5',  categoryId: 'cat_sw',   serialNo: 5,  name: 'Support For Service Delivery',                                    weight: 7  },
  { id: 'mkra_s6',  categoryId: 'cat_sw',   serialNo: 6,  name: 'Staff Welfare',                                                   weight: 10 },
];

// ── Objectives ────────────────────────────────────────────────────────────────
export const MPMS_OBJECTIVES: MPMSObjective[] = [
  // Presidential — Governance & Service Delivery
  { id: 'mobj_p1_1', kraId: 'mkra_p1', weight: 4, description: 'Strengthen and institutionalize the effective utilization of the Performance Management System (PMS) to enhance accountability, performance tracking, and service delivery outcomes across SERVICOM.' },
  { id: 'mobj_p1_2', kraId: 'mkra_p1', weight: 4, description: 'Initiate and institutionalize the digitization of records and work processes to improve information management, workflow efficiency, and readiness for the adoption of an Enterprise Content Management (ECM) system.' },
  { id: 'mobj_p1_3', kraId: 'mkra_p1', weight: 4, description: 'Initiate and implement quarterly citizens and stakeholder engagement sessions to communicate SERVICOM activities and serve as a feedback mechanism.' },
  { id: 'mobj_p1_4', kraId: 'mkra_p1', weight: 1, description: 'Promote disability inclusion and accessibility awareness within SERVICOM to ensure inclusive internal service processes, communication, and staff conduct.' },

  // MDA — Service Delivery Monitoring
  { id: 'mobj_m1_1', kraId: 'mkra_m1', weight: 1.5, description: 'Conduct SERVICOM Compliance Evaluations (SCE) across MDAs to assess service delivery performance.' },
  { id: 'mobj_m1_2', kraId: 'mkra_m1', weight: 1,   description: 'Present evaluation findings to MDAs to drive service improvement.' },
  { id: 'mobj_m1_3', kraId: 'mkra_m1', weight: 2,   description: 'Promote continuous performance improvement and accountability through engagement platforms.' },
  { id: 'mobj_m1_4', kraId: 'mkra_m1', weight: 2,   description: 'Assess functionality and effectiveness of SERVICOM structures within MDAs.' },
  { id: 'mobj_m1_5', kraId: 'mkra_m1', weight: 1,   description: 'Sensitize MDAs and stakeholders on grievance redress and service standards.' },
  { id: 'mobj_m1_6', kraId: 'mkra_m1', weight: 1.5, description: 'Support year-end performance review and institutional learning.' },
  { id: 'mobj_m1_7', kraId: 'mkra_m1', weight: 1,   description: 'Facilitate Service Charter development.' },

  // MDA — Admin Services
  { id: 'mobj_m2_1', kraId: 'mkra_m2', weight: 2,   description: "Strengthen staff and nodal officers' engagements, planning, and organizational alignment." },
  { id: 'mobj_m2_2', kraId: 'mkra_m2', weight: 2,   description: 'Ensure availability and effective management of office logistics and assets.' },
  { id: 'mobj_m2_3', kraId: 'mkra_m2', weight: 1,   description: 'Ensure efficient records management and file movement.' },
  { id: 'mobj_m2_4', kraId: 'mkra_m2', weight: 1,   description: 'Ensure effective handling of office correspondence and mail dispatch.' },
  { id: 'mobj_m2_5', kraId: 'mkra_m2', weight: 1,   description: 'Ensure efficient, transparent, and timely management of stores and inventory through proper custody, issuance, and replenishment of consumables and assets.' },

  // MDA — Public Awareness
  { id: 'mobj_m3_1', kraId: 'mkra_m3', weight: 2.5, description: "Enhance public awareness and visibility of SERVICOM's mandate, programmes, and achievements." },
  { id: 'mobj_m3_2', kraId: 'mkra_m3', weight: 1,   description: "Leverage digital platforms and social media to expand SERVICOM's outreach and impact." },
  { id: 'mobj_m3_3', kraId: 'mkra_m3', weight: 1,   description: 'Promote transparency and accountability through publication of SERVICOM reports and evaluations.' },
  { id: 'mobj_m3_4', kraId: 'mkra_m3', weight: 1.5, description: 'Improve internal capacity and productivity for effective media and publicity operations.' },
  { id: 'mobj_m3_5', kraId: 'mkra_m3', weight: 1,   description: 'Support national and global service delivery initiatives and campaigns.' },

  // MDA — Finance
  { id: 'mobj_m4_1', kraId: 'mkra_m4', weight: 1,   description: "Prepare and manage SERVICOM's annual budget in line with approved financial regulations." },
  { id: 'mobj_m4_2', kraId: 'mkra_m4', weight: 1,   description: 'Ensure accurate financial record-keeping and proper retirement of advances.' },
  { id: 'mobj_m4_3', kraId: 'mkra_m4', weight: 1,   description: 'Ensure proper verification, processing, and payment of financial transactions.' },
  { id: 'mobj_m4_4', kraId: 'mkra_m4', weight: 2,   description: 'Strengthen financial reporting and compliance with IPSAS (Accrual Basis).' },

  // MDA — Audit
  { id: 'mobj_m5_1', kraId: 'mkra_m5', weight: 1,   description: 'Ensure timely audit, certification, and reporting of SERVICOM financial statements.' },
  { id: 'mobj_m5_2', kraId: 'mkra_m5', weight: 0.7, description: 'Strengthen pre-payment and post-payment audit controls.' },
  { id: 'mobj_m5_3', kraId: 'mkra_m5', weight: 0.5, description: 'Conduct routine and periodic audit of financial records and transactions.' },
  { id: 'mobj_m5_4', kraId: 'mkra_m5', weight: 0.5, description: 'Evaluate the effectiveness of internal controls and safeguard government assets.' },
  { id: 'mobj_m5_5', kraId: 'mkra_m5', weight: 0.3, description: 'Ensure proper auditing of revenue collection and remittance.' },

  // MDA — ICT
  { id: 'mobj_m6_1', kraId: 'mkra_m6', weight: 1,   description: 'Strengthen ICT governance and policy alignment in line with national frameworks (NDES, NITDA Guidelines, NDPR, Civil Service Reform & e-Government Agenda).' },
  { id: 'mobj_m6_2', kraId: 'mkra_m6', weight: 1,   description: 'Upgrade and maintain reliable ICT infrastructure to support operations (Networks, equipment, servers, power, backups).' },
  { id: 'mobj_m6_3', kraId: 'mkra_m6', weight: 1,   description: 'Enhance ICT service delivery and user support through an effective helpdesk.' },
  { id: 'mobj_m6_4', kraId: 'mkra_m6', weight: 1,   description: 'Strengthen cybersecurity and data protection compliance.' },
  { id: 'mobj_m6_5', kraId: 'mkra_m6', weight: 1,   description: 'Monitor, evaluate, and sustain ICT performance.' },

  // MDA — Servicom Institute
  { id: 'mobj_m7_1', kraId: 'mkra_m7', weight: 1,   description: 'Identify capacity gaps and establish training priorities across SERVICOM and MDAs.' },
  { id: 'mobj_m7_2', kraId: 'mkra_m7', weight: 1,   description: 'Strengthen foundational competencies and ensure compliance with public service standards.' },
  { id: 'mobj_m7_3', kraId: 'mkra_m7', weight: 0.5, description: 'Build specialized, technical, and performance-driven competencies.' },
  { id: 'mobj_m7_4', kraId: 'mkra_m7', weight: 1,   description: 'Institutionalize learning, knowledge sharing, and best practice dissemination.' },
  { id: 'mobj_m7_5', kraId: 'mkra_m7', weight: 1,   description: 'Evaluate training impact and measure improvement in service delivery.' },

  // MDA — Executive Administration
  { id: 'mobj_m8_1', kraId: 'mkra_m8', weight: 1,   description: 'Provide effective administrative and secretarial support to the National Coordinator.' },
  { id: 'mobj_m8_2', kraId: 'mkra_m8', weight: 0.7, description: "Ensure efficient coordination and scheduling of the National Coordinator's official activities." },
  { id: 'mobj_m8_3', kraId: 'mkra_m8', weight: 0.3, description: 'Strengthen records management and document control for executive decisions.' },
  { id: 'mobj_m8_4', kraId: 'mkra_m8', weight: 0.5, description: 'Support effective internal coordination between the National Coordinator and SERVICOM units.' },
  { id: 'mobj_m8_5', kraId: 'mkra_m8', weight: 0.5, description: 'Provide clerical and logistical support for high-level meetings, engagements, and events.' },

  // MDA — Procurement
  { id: 'mobj_m9_1', kraId: 'mkra_m9', weight: 3,   description: 'Ensure transparent, efficient, and compliant procurement processes that support timely acquisition of goods, works, and services to enhance effective service delivery in SERVICOM.' },

  // MDA — Legal
  { id: 'mobj_m10_1', kraId: 'mkra_m10', weight: 2, description: "Provide legal advisory services and ensure compliance with applicable laws and regulations to safeguard SERVICOM's operations and interests." },

  // Service Wide
  { id: 'mobj_s1_1', kraId: 'mkra_s1', weight: 5,   description: 'Strengthen a culture of innovation and technology adoption within SERVICOM by identifying, piloting, and implementing service-improvement initiatives, while actively promoting staff participation in the OHCSF Innovation Challenge.' },
  { id: 'mobj_s2_1', kraId: 'mkra_s2', weight: 5,   description: 'Strengthen internal stakeholder engagement within SERVICOM by improving communication, collaboration, and coordination among units to enhance teamwork and organizational effectiveness.' },
  { id: 'mobj_s3_1', kraId: 'mkra_s3', weight: 5,   description: 'Identify, prioritize, and automate key service delivery processes, forms, and routine tasks, while standardizing the use of official email communication to improve efficiency, accuracy, transparency, and accountability across SERVICOM.' },
  { id: 'mobj_s4_1', kraId: 'mkra_s4', weight: 5,   description: 'Enhance the skills, competencies, and knowledge of SERVICOM staff through training, induction, and orientation, ensuring excellent service delivery, adoption of best practices, and seamless integration of new, transferred, and promoted staff within their respective units.' },
  { id: 'mobj_s5_1', kraId: 'mkra_s5', weight: 4,   description: 'Ensure the efficient and effective implementation of services and programmes within SERVICOM and streamline payment processes to guarantee that payments and staff claims are processed and disbursed within required timelines.' },
  { id: 'mobj_s5_2', kraId: 'mkra_s5', weight: 3,   description: 'Strengthen regulatory compliance within SERVICOM by implementing robust financial control measures to prevent and eliminate cases of fraud, irregularities, and non-adherence to financial regulations and government policies.' },
  { id: 'mobj_s6_1', kraId: 'mkra_s6', weight: 6,   description: 'Promote staff welfare, motivation, and recognition.' },
  { id: 'mobj_s6_2', kraId: 'mkra_s6', weight: 4,   description: 'Promote work-life balance, wellness, and staff health.' },
];

// ── KPIs (complete — verified against mpms_file.txt) ─────────────────────────
export const MPMS_KPIS: MPMSKPI[] = [
  // ── Presidential: Governance & Service Delivery ───────────────────────────
  // Obj p1_1 — PMS utilization
  { id: 'mkpi_p1_1_1', objectiveId: 'mobj_p1_1', description: 'PMS Implementation Rate across Units', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_admin', supportUnitIds: ['dept_ops'] },
  { id: 'mkpi_p1_1_2', objectiveId: 'mobj_p1_1', description: '% of staff with completed and approved performance contract aligned to SERVICOM objectives', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_admin', supportUnitIds: [] },
  { id: 'mkpi_p1_1_3', objectiveId: 'mobj_p1_1', description: '% of performance reviews and appraisals completed within approved PMS timelines', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_admin', supportUnitIds: [] },
  // Obj p1_2 — Digitization
  { id: 'mkpi_p1_2_1', objectiveId: 'mobj_p1_2', description: '% of Staff Trained on Digital Records and Workflow Management', annualTarget: 50, unitOfMeasurement: '%', leadUnitId: 'dept_ict', supportUnitIds: ['dept_admin'] },
  { id: 'mkpi_p1_2_2', objectiveId: 'mobj_p1_2', description: '% increase in the use of digital documentation and approval processes compared to baseline', annualTarget: 50, unitOfMeasurement: '%', leadUnitId: 'dept_ict', supportUnitIds: ['dept_admin'] },
  { id: 'mkpi_p1_2_3', objectiveId: 'mobj_p1_2', description: '% of Transactions Processed Digitally', annualTarget: 75, unitOfMeasurement: '%', leadUnitId: 'dept_ict', supportUnitIds: ['dept_admin'] },
  // Obj p1_3 — Citizen engagement
  { id: 'mkpi_p1_3_1', objectiveId: 'mobj_p1_3', description: 'Total number of quarterly engagement sessions held with citizens and stakeholders', annualTarget: 4, unitOfMeasurement: 'Number', leadUnitId: 'dept_ops', supportUnitIds: ['dept_admin', 'dept_pa'] },
  // Obj p1_4 — Disability inclusion
  { id: 'mkpi_p1_4_1', objectiveId: 'mobj_p1_4', description: '% of SERVICOM Staff Trained on Accessibility Practices and Disability Awareness', annualTarget: 50, unitOfMeasurement: '%', leadUnitId: 'dept_admin', supportUnitIds: ['dept_pa', 'dept_ops'] },
  { id: 'mkpi_p1_4_2', objectiveId: 'mobj_p1_4', description: '% of SERVICOM public-facing information materials available in accessible formats', annualTarget: 75, unitOfMeasurement: '%', leadUnitId: 'dept_admin', supportUnitIds: ['dept_pa'] },

  // ── MDA: Service Delivery Monitoring ─────────────────────────────────────
  // Obj m1_1 — SCE evaluations
  { id: 'mkpi_m1_1_1', objectiveId: 'mobj_m1_1', description: 'Number of MDAs evaluated through SCE annually', annualTarget: 30, unitOfMeasurement: 'Number', leadUnitId: 'dept_ops', supportUnitIds: [] },
  { id: 'mkpi_m1_1_2', objectiveId: 'mobj_m1_1', description: '% of planned SCE exercises conducted as scheduled', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_ops', supportUnitIds: [] },
  { id: 'mkpi_m1_1_3', objectiveId: 'mobj_m1_1', description: 'Timeliness of completion of SCE assessments and reports', annualTarget: 90, unitOfMeasurement: '%', leadUnitId: 'dept_ops', supportUnitIds: [] },
  // Obj m1_2 — Present findings
  { id: 'mkpi_m1_2_1', objectiveId: 'mobj_m1_2', description: '% of SCE reports presented to evaluated MDAs', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_ops', supportUnitIds: [] },
  { id: 'mkpi_m1_2_2', objectiveId: 'mobj_m1_2', description: 'Timeliness of presentation after completion of evaluations', annualTarget: 90, unitOfMeasurement: '%', leadUnitId: 'dept_ops', supportUnitIds: [] },
  // Obj m1_3 — Engagement platforms
  { id: 'mkpi_m1_3_1', objectiveId: 'mobj_m1_3', description: 'Number of breakfast meetings and networking seminars held', annualTarget: 4, unitOfMeasurement: 'Number', leadUnitId: 'dept_ops', supportUnitIds: [] },
  { id: 'mkpi_m1_3_2', objectiveId: 'mobj_m1_3', description: 'Level of participation by MDAs and service heads', annualTarget: 90, unitOfMeasurement: '%', leadUnitId: 'dept_ops', supportUnitIds: [] },
  // Obj m1_4 — MSU functionality
  { id: 'mkpi_m1_4_1', objectiveId: 'mobj_m1_4', description: 'Number of MSU functionality evaluations conducted', annualTarget: 20, unitOfMeasurement: 'Number', leadUnitId: 'dept_ops', supportUnitIds: [] },
  { id: 'mkpi_m1_4_2', objectiveId: 'mobj_m1_4', description: '% of evaluated MSUs meeting minimum functionality standards', annualTarget: 80, unitOfMeasurement: '%', leadUnitId: 'dept_ops', supportUnitIds: [] },
  // Obj m1_5 — GRM sensitization
  { id: 'mkpi_m1_5_1', objectiveId: 'mobj_m1_5', description: 'Number of GRM sensitization programmes conducted', annualTarget: 6, unitOfMeasurement: 'Number', leadUnitId: 'dept_ops', supportUnitIds: [] },
  { id: 'mkpi_m1_5_2', objectiveId: 'mobj_m1_5', description: 'Level of MDA participation in Customer Service Week', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_ops', supportUnitIds: [] },
  // Obj m1_6 — Year-end review
  { id: 'mkpi_m1_6_1', objectiveId: 'mobj_m1_6', description: 'Timely completion of end-of-year operational reports', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_ops', supportUnitIds: [] },
  { id: 'mkpi_m1_6_2', objectiveId: 'mobj_m1_6', description: '% of operational activities reviewed and documented', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_ops', supportUnitIds: [] },
  // Obj m1_7 — Service charters
  { id: 'mkpi_m1_7_1', objectiveId: 'mobj_m1_7', description: '% of MDAs with implementable Service Charters', annualTarget: 90, unitOfMeasurement: '%', leadUnitId: 'dept_ops', supportUnitIds: [] },

  // ── MDA: Admin Services ──────────────────────────────────────────────────
  // Obj m2_1 — Staff engagements
  { id: 'mkpi_m2_1_1', objectiveId: 'mobj_m2_1', description: '% of scheduled staff retreat conducted annually', annualTarget: 80, unitOfMeasurement: '%', leadUnitId: 'dept_admin', supportUnitIds: [] },
  { id: 'mkpi_m2_1_2', objectiveId: 'mobj_m2_1', description: "% of nodal officers' meetings held as scheduled", annualTarget: 80, unitOfMeasurement: '%', leadUnitId: 'dept_admin', supportUnitIds: [] },
  // Obj m2_2 — Logistics & assets
  { id: 'mkpi_m2_2_1', objectiveId: 'mobj_m2_2', description: '% of office vehicles in functional condition', annualTarget: 80, unitOfMeasurement: '%', leadUnitId: 'dept_admin', supportUnitIds: [] },
  { id: 'mkpi_m2_2_2', objectiveId: 'mobj_m2_2', description: '% of office equipment serviceable as at when due', annualTarget: 80, unitOfMeasurement: '%', leadUnitId: 'dept_admin', supportUnitIds: [] },
  { id: 'mkpi_m2_2_3', objectiveId: 'mobj_m2_2', description: 'Average response time to maintenance requests', annualTarget: 80, unitOfMeasurement: '%', leadUnitId: 'dept_admin', supportUnitIds: [] },
  // Obj m2_3 — Records management
  { id: 'mkpi_m2_3_1', objectiveId: 'mobj_m2_3', description: '% of file requests attended to without delay', annualTarget: 80, unitOfMeasurement: '%', leadUnitId: 'dept_admin', supportUnitIds: [] },
  { id: 'mkpi_m2_3_2', objectiveId: 'mobj_m2_3', description: 'Accuracy of file tracking and movement records', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_admin', supportUnitIds: [] },
  // Obj m2_4 — Correspondence
  { id: 'mkpi_m2_4_1', objectiveId: 'mobj_m2_4', description: '% of incoming correspondence received and registered same day', annualTarget: 90, unitOfMeasurement: '%', leadUnitId: 'dept_admin', supportUnitIds: [] },
  { id: 'mkpi_m2_4_2', objectiveId: 'mobj_m2_4', description: '% of outgoing correspondence dispatched within timelines', annualTarget: 80, unitOfMeasurement: '%', leadUnitId: 'dept_admin', supportUnitIds: [] },
  // Obj m2_5 — Stores & inventory
  { id: 'mkpi_m2_5_1', objectiveId: 'mobj_m2_5', description: '% of store items accurately recorded in the store ledger/inventory system', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_admin', supportUnitIds: [] },
  { id: 'mkpi_m2_5_2', objectiveId: 'mobj_m2_5', description: '% of items restocked within approved timelines after reaching reorder level', annualTarget: 80, unitOfMeasurement: '%', leadUnitId: 'dept_admin', supportUnitIds: [] },
  { id: 'mkpi_m2_5_3', objectiveId: 'mobj_m2_5', description: '% of store items with updated bin cards or inventory records', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_admin', supportUnitIds: [] },

  // ── MDA: Public Awareness ────────────────────────────────────────────────
  // Obj m3_1 — Visibility
  { id: 'mkpi_m3_1_1', objectiveId: 'mobj_m3_1', description: 'Number of press interviews, media appearances, and programme features conducted (TV, radio, print)', annualTarget: 20, unitOfMeasurement: 'Number', leadUnitId: 'dept_pa', supportUnitIds: [] },
  { id: 'mkpi_m3_1_2', objectiveId: 'mobj_m3_1', description: 'Number of documentaries, jingles, and awareness materials produced and disseminated', annualTarget: 5, unitOfMeasurement: 'Number', leadUnitId: 'dept_pa', supportUnitIds: [] },
  // Obj m3_2 — Digital/social media
  { id: 'mkpi_m3_2_1', objectiveId: 'mobj_m3_2', description: 'Growth rate of followers and engagement across SERVICOM social media platforms', annualTarget: 20, unitOfMeasurement: '%', leadUnitId: 'dept_pa', supportUnitIds: [] },
  { id: 'mkpi_m3_2_2', objectiveId: 'mobj_m3_2', description: 'Number of audio-visual advocacy materials produced and shared online', annualTarget: 20, unitOfMeasurement: 'Number', leadUnitId: 'dept_pa', supportUnitIds: [] },
  // Obj m3_3 — Reports publication
  { id: 'mkpi_m3_3_1', objectiveId: 'mobj_m3_3', description: 'Number of SERVICOM evaluation reports published in national dailies', annualTarget: 5, unitOfMeasurement: 'Number', leadUnitId: 'dept_pa', supportUnitIds: [] },
  { id: 'mkpi_m3_3_2', objectiveId: 'mobj_m3_3', description: 'Timeliness of report dissemination', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_pa', supportUnitIds: [] },
  // Obj m3_4 — Internal capacity
  { id: 'mkpi_m3_4_1', objectiveId: 'mobj_m3_4', description: '% Turnaround time for media coverage and content production', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_pa', supportUnitIds: [] },
  { id: 'mkpi_m3_4_2', objectiveId: 'mobj_m3_4', description: 'Availability and functionality of media and digital equipment', annualTarget: 80, unitOfMeasurement: '%', leadUnitId: 'dept_pa', supportUnitIds: [] },
  // Obj m3_5 — National/global campaigns
  { id: 'mkpi_m3_5_1', objectiveId: 'mobj_m3_5', description: '% of planned national and global service delivery campaigns successfully implemented', annualTarget: 80, unitOfMeasurement: '%', leadUnitId: 'dept_pa', supportUnitIds: [] },
  { id: 'mkpi_m3_5_2', objectiveId: 'mobj_m3_5', description: "% of MDAs that actively participated in Customer Service Week and related campaigns under SERVICOM's coordination", annualTarget: 30, unitOfMeasurement: '%', leadUnitId: 'dept_pa', supportUnitIds: [] },

  // ── MDA: Finance ─────────────────────────────────────────────────────────
  { id: 'mkpi_m4_1_1', objectiveId: 'mobj_m4_1', description: 'Timely preparation and submission of annual budget', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_acct', supportUnitIds: [] },
  { id: 'mkpi_m4_1_2', objectiveId: 'mobj_m4_1', description: '% of budget estimates prepared in line with approved guidelines', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_acct', supportUnitIds: [] },
  { id: 'mkpi_m4_2_1', objectiveId: 'mobj_m4_2', description: '% of advances retired within approved timelines', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_acct', supportUnitIds: [] },
  { id: 'mkpi_m4_2_2', objectiveId: 'mobj_m4_2', description: '% of vouchers with complete and accurate supporting documents', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_acct', supportUnitIds: [] },
  { id: 'mkpi_m4_3_1', objectiveId: 'mobj_m4_3', description: '% of payment vouchers verified and processed in line with approval', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_acct', supportUnitIds: [] },
  { id: 'mkpi_m4_3_2', objectiveId: 'mobj_m4_3', description: '% of payments effected based on duly approved memos', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_acct', supportUnitIds: [] },
  { id: 'mkpi_m4_3_3', objectiveId: 'mobj_m4_3', description: 'Average turnaround time for processing payment vouchers', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_acct', supportUnitIds: [] },
  { id: 'mkpi_m4_4_1', objectiveId: 'mobj_m4_4', description: 'Timely preparation and submission of annual financial statements', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_acct', supportUnitIds: [] },
  { id: 'mkpi_m4_4_2', objectiveId: 'mobj_m4_4', description: 'Level of compliance with IPSAS (Accrual) requirements', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_acct', supportUnitIds: [] },

  // ── MDA: Internal Audit ──────────────────────────────────────────────────
  { id: 'mkpi_m5_1_1', objectiveId: 'mobj_m5_1', description: 'Timely submission of annual, half-yearly, quarterly, and monthly audit reports', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_audit', supportUnitIds: [] },
  { id: 'mkpi_m5_1_2', objectiveId: 'mobj_m5_1', description: '% of statutory audit reports submitted within approved timelines', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_audit', supportUnitIds: [] },
  { id: 'mkpi_m5_1_3', objectiveId: 'mobj_m5_1', description: 'Compliance rate with reporting requirements of OAuGF and OAGF', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_audit', supportUnitIds: [] },
  { id: 'mkpi_m5_2_1', objectiveId: 'mobj_m5_2', description: '% of payment vouchers subjected to pre-payment audit', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_audit', supportUnitIds: [] },
  { id: 'mkpi_m5_2_2', objectiveId: 'mobj_m5_2', description: '% of post-payment audits conducted as scheduled', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_audit', supportUnitIds: [] },
  { id: 'mkpi_m5_3_1', objectiveId: 'mobj_m5_3', description: '% of monthly audits completed as planned', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_audit', supportUnitIds: [] },
  { id: 'mkpi_m5_3_2', objectiveId: 'mobj_m5_3', description: 'Number of quarterly audit reviews conducted across departments', annualTarget: 4, unitOfMeasurement: 'Number', leadUnitId: 'dept_audit', supportUnitIds: [] },
  { id: 'mkpi_m5_4_1', objectiveId: 'mobj_m5_4', description: '% of capital assets audited quarterly', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_audit', supportUnitIds: [] },
  { id: 'mkpi_m5_4_2', objectiveId: 'mobj_m5_4', description: '% of audit recommendations implemented by management', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_audit', supportUnitIds: [] },
  { id: 'mkpi_m5_5_1', objectiveId: 'mobj_m5_5', description: '% of revenue collections audited', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_audit', supportUnitIds: [] },
  { id: 'mkpi_m5_5_2', objectiveId: 'mobj_m5_5', description: '% of revenue remitted in full and on time', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_audit', supportUnitIds: [] },

  // ── MDA: ICT ─────────────────────────────────────────────────────────────
  { id: 'mkpi_m6_1_1', objectiveId: 'mobj_m6_1', description: 'Level of compliance with NITDA and NDPR requirements', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_ict', supportUnitIds: [] },
  { id: 'mkpi_m6_1_2', objectiveId: 'mobj_m6_1', description: '% completion of ICT asset verification and inventory update', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_ict', supportUnitIds: [] },
  { id: 'mkpi_m6_1_3', objectiveId: 'mobj_m6_1', description: '% of ICT and data protection policies reviewed, updated, and approved', annualTarget: 80, unitOfMeasurement: '%', leadUnitId: 'dept_ict', supportUnitIds: [] },
  { id: 'mkpi_m6_2_1', objectiveId: 'mobj_m6_2', description: 'System and network uptime %', annualTarget: 90, unitOfMeasurement: '%', leadUnitId: 'dept_ict', supportUnitIds: [] },
  { id: 'mkpi_m6_2_2', objectiveId: 'mobj_m6_2', description: '% of planned ICT infrastructure upgrades completed', annualTarget: 75, unitOfMeasurement: '%', leadUnitId: 'dept_ict', supportUnitIds: [] },
  { id: 'mkpi_m6_3_1', objectiveId: 'mobj_m6_3', description: '% of ICT service requests resolved within agreed SLA', annualTarget: 90, unitOfMeasurement: '%', leadUnitId: 'dept_ict', supportUnitIds: [] },
  { id: 'mkpi_m6_3_2', objectiveId: 'mobj_m6_3', description: 'User satisfaction rate with ICT support services', annualTarget: 80, unitOfMeasurement: '%', leadUnitId: 'dept_ict', supportUnitIds: [] },
  { id: 'mkpi_m6_4_1', objectiveId: 'mobj_m6_4', description: '% of cybersecurity audits and vulnerability assessments conducted', annualTarget: 90, unitOfMeasurement: '%', leadUnitId: 'dept_ict', supportUnitIds: [] },
  { id: 'mkpi_m6_4_2', objectiveId: 'mobj_m6_4', description: '% compliance with NDPR requirements', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_ict', supportUnitIds: [] },
  { id: 'mkpi_m6_5_1', objectiveId: 'mobj_m6_5', description: 'Timely production of annual ICT performance report', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_ict', supportUnitIds: [] },
  { id: 'mkpi_m6_5_2', objectiveId: 'mobj_m6_5', description: '% of ICT deliverables achieved against annual workplan', annualTarget: 80, unitOfMeasurement: '%', leadUnitId: 'dept_ict', supportUnitIds: [] },

  // ── MDA: Servicom Institute ───────────────────────────────────────────────
  { id: 'mkpi_m7_1_1', objectiveId: 'mobj_m7_1', description: '% of MDAs/staff covered by the Training Needs Assessment (TNA)', annualTarget: 80, unitOfMeasurement: '%', leadUnitId: 'dept_si', supportUnitIds: [] },
  { id: 'mkpi_m7_1_2', objectiveId: 'mobj_m7_1', description: 'Timely completion of Annual Training Needs Assessment Report', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_si', supportUnitIds: [] },
  { id: 'mkpi_m7_2_1', objectiveId: 'mobj_m7_2', description: '% of newly recruited or transferred MDA staff inducted', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_si', supportUnitIds: [] },
  { id: 'mkpi_m7_2_2', objectiveId: 'mobj_m7_2', description: '% of eligible officers completing supervisory/leadership training', annualTarget: 80, unitOfMeasurement: '%', leadUnitId: 'dept_si', supportUnitIds: [] },
  { id: 'mkpi_m7_3_1', objectiveId: 'mobj_m7_3', description: 'Number of specialized and technical training programmes conducted across MDAs', annualTarget: 10, unitOfMeasurement: 'Number', leadUnitId: 'dept_si', supportUnitIds: [] },
  { id: 'mkpi_m7_3_2', objectiveId: 'mobj_m7_3', description: '% of targeted MDA staff completing specialized/professional training', annualTarget: 80, unitOfMeasurement: '%', leadUnitId: 'dept_si', supportUnitIds: [] },
  { id: 'mkpi_m7_4_1', objectiveId: 'mobj_m7_4', description: 'Number of training manuals and learning materials developed or updated', annualTarget: 5, unitOfMeasurement: 'Number', leadUnitId: 'dept_si', supportUnitIds: [] },
  { id: 'mkpi_m7_4_2', objectiveId: 'mobj_m7_4', description: 'Number of knowledge-sharing workshops conducted across MDAs', annualTarget: 10, unitOfMeasurement: 'Number', leadUnitId: 'dept_si', supportUnitIds: [] },
  { id: 'mkpi_m7_5_1', objectiveId: 'mobj_m7_5', description: '% of training programmes evaluated post-delivery', annualTarget: 80, unitOfMeasurement: '%', leadUnitId: 'dept_si', supportUnitIds: [] },
  { id: 'mkpi_m7_5_2', objectiveId: 'mobj_m7_5', description: '% improvement in staff performance indicators after training', annualTarget: 20, unitOfMeasurement: '%', leadUnitId: 'dept_si', supportUnitIds: [] },

  // ── MDA: Executive Administration ────────────────────────────────────────
  { id: 'mkpi_m8_1_1', objectiveId: 'mobj_m8_1', description: '% of correspondence (incoming and outgoing) processed within approved timelines', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_ops', supportUnitIds: [] },
  { id: 'mkpi_m8_1_2', objectiveId: 'mobj_m8_1', description: '% of meetings supported with complete documentation (agenda, minutes, briefs)', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_ops', supportUnitIds: [] },
  { id: 'mkpi_m8_2_1', objectiveId: 'mobj_m8_2', description: '% of official engagements properly scheduled and documented', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_ops', supportUnitIds: [] },
  { id: 'mkpi_m8_2_2', objectiveId: 'mobj_m8_2', description: '% of meetings/events attended as scheduled', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_ops', supportUnitIds: [] },
  { id: 'mkpi_m8_3_1', objectiveId: 'mobj_m8_3', description: '% of executive files properly registered, tracked, and archived', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_ops', supportUnitIds: [] },
  { id: 'mkpi_m8_3_2', objectiveId: 'mobj_m8_3', description: '% of documents retrievable within agreed time standards', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_ops', supportUnitIds: [] },
  { id: 'mkpi_m8_4_1', objectiveId: 'mobj_m8_4', description: '% of directives from the National Coordinator communicated to relevant units within timelines', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_ops', supportUnitIds: [] },
  { id: 'mkpi_m8_5_1', objectiveId: 'mobj_m8_5', description: '% of high-level meetings/events supported without logistical lapses', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_ops', supportUnitIds: [] },

  // ── MDA: Procurement ─────────────────────────────────────────────────────
  { id: 'mkpi_m9_1_1', objectiveId: 'mobj_m9_1', description: '% of annual procurement plan developed and approved within first quarter', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_proc', supportUnitIds: [] },
  { id: 'mkpi_m9_1_2', objectiveId: 'mobj_m9_1', description: '% of procurement processes compliant with procurement regulations', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_proc', supportUnitIds: [] },
  { id: 'mkpi_m9_1_3', objectiveId: 'mobj_m9_1', description: '% of procurement requests processed within approved timelines', annualTarget: 90, unitOfMeasurement: '%', leadUnitId: 'dept_proc', supportUnitIds: [] },
  { id: 'mkpi_m9_1_4', objectiveId: 'mobj_m9_1', description: '% of procurement processes conducted using approved procurement methods', annualTarget: 90, unitOfMeasurement: '%', leadUnitId: 'dept_proc', supportUnitIds: [] },
  { id: 'mkpi_m9_1_5', objectiveId: 'mobj_m9_1', description: '% of procurement records properly documented and retrievable', annualTarget: 80, unitOfMeasurement: '%', leadUnitId: 'dept_proc', supportUnitIds: [] },
  { id: 'mkpi_m9_1_6', objectiveId: 'mobj_m9_1', description: '% of contracts executed in accordance with agreed terms and timelines', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_proc', supportUnitIds: [] },
  { id: 'mkpi_m9_1_7', objectiveId: 'mobj_m9_1', description: '% of procurement requests supported with appropriate procurement guidance', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_proc', supportUnitIds: [] },
  { id: 'mkpi_m9_1_8', objectiveId: 'mobj_m9_1', description: '% of procurement activities conducted without audit queries or compliance issues', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_proc', supportUnitIds: [] },

  // ── MDA: Legal ───────────────────────────────────────────────────────────
  { id: 'mkpi_m10_1_1', objectiveId: 'mobj_m10_1', description: '% of requests for legal advice responded to within specified timelines', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_legal', supportUnitIds: [] },
  { id: 'mkpi_m10_1_2', objectiveId: 'mobj_m10_1', description: '% of contracts and agreements reviewed before execution', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_legal', supportUnitIds: [] },
  { id: 'mkpi_m10_1_3', objectiveId: 'mobj_m10_1', description: '% of SERVICOM activities compliant with applicable legal and regulatory requirements', annualTarget: 90, unitOfMeasurement: '%', leadUnitId: 'dept_legal', supportUnitIds: [] },
  { id: 'mkpi_m10_1_4', objectiveId: 'mobj_m10_1', description: '% of legal documents prepared accurately and within required timelines', annualTarget: 90, unitOfMeasurement: '%', leadUnitId: 'dept_legal', supportUnitIds: [] },
  { id: 'mkpi_m10_1_5', objectiveId: 'mobj_m10_1', description: '% of legal records properly maintained and easily retrievable', annualTarget: 80, unitOfMeasurement: '%', leadUnitId: 'dept_legal', supportUnitIds: [] },
  { id: 'mkpi_m10_1_6', objectiveId: 'mobj_m10_1', description: '% of procurement and administrative processes reviewed for legal compliance', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_legal', supportUnitIds: [] },
  { id: 'mkpi_m10_1_7', objectiveId: 'mobj_m10_1', description: '% of identified legal risks addressed with appropriate legal advice', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_legal', supportUnitIds: [] },
  { id: 'mkpi_m10_1_8', objectiveId: 'mobj_m10_1', description: '% of legal issues handled in accordance with legal procedures and timelines', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_legal', supportUnitIds: [] },

  // ── Service Wide: Innovation ──────────────────────────────────────────────
  { id: 'mkpi_s1_1_1', objectiveId: 'mobj_s1_1', description: 'Number of Innovation, Initiative, and Technology Ideas Generated', annualTarget: 5, unitOfMeasurement: 'Number', leadUnitId: 'dept_ict', supportUnitIds: ['dept_ops', 'dept_admin', 'dept_pa'] },
  { id: 'mkpi_s1_1_2', objectiveId: 'mobj_s1_1', description: '% of Identified Innovations and Initiatives Implemented or Piloted', annualTarget: 10, unitOfMeasurement: '%', leadUnitId: 'dept_ict', supportUnitIds: ['dept_ops'] },
  { id: 'mkpi_s1_1_3', objectiveId: 'mobj_s1_1', description: 'Number of SERVICOM Staff Participating in the OHCSF Innovation Challenge', annualTarget: 2, unitOfMeasurement: 'Number', leadUnitId: 'dept_ict', supportUnitIds: [] },

  // ── Service Wide: Stakeholder Engagement ─────────────────────────────────
  { id: 'mkpi_s2_1_1', objectiveId: 'mobj_s2_1', description: 'Number of structured inter-unit meetings, workshops, or knowledge-sharing sessions held during the year', annualTarget: 5, unitOfMeasurement: 'Number', leadUnitId: 'dept_ops', supportUnitIds: ['dept_admin', 'dept_pa', 'dept_ict'] },
  { id: 'mkpi_s2_1_2', objectiveId: 'mobj_s2_1', description: 'Number of Cross-Unit Collaboration Initiatives Implemented', annualTarget: 5, unitOfMeasurement: 'Number', leadUnitId: 'dept_ops', supportUnitIds: ['dept_admin', 'dept_pa'] },

  // ── Service Wide: Automated Service Delivery ──────────────────────────────
  { id: 'mkpi_s3_1_1', objectiveId: 'mobj_s3_1', description: 'Number of Processes, Forms, and Tasks Identified for Automation', annualTarget: 5, unitOfMeasurement: 'Number', leadUnitId: 'dept_ict', supportUnitIds: ['dept_ops', 'dept_admin', 'dept_pa', 'dept_acct', 'dept_audit', 'dept_nc', 'dept_si', 'dept_proc', 'dept_legal'] },
  { id: 'mkpi_s3_1_2', objectiveId: 'mobj_s3_1', description: '% of Identified Processes and Forms Automated or Digitized', annualTarget: 20, unitOfMeasurement: '%', leadUnitId: 'dept_ict', supportUnitIds: ['dept_ops', 'dept_admin'] },
  { id: 'mkpi_s3_1_3', objectiveId: 'mobj_s3_1', description: '% of Staff Actively Using Official Email for Work-Related Communication', annualTarget: 80, unitOfMeasurement: '%', leadUnitId: 'dept_ict', supportUnitIds: ['dept_admin'] },

  // ── Service Wide: Capacity Building ──────────────────────────────────────
  { id: 'mkpi_s4_1_1', objectiveId: 'mobj_s4_1', description: '% of all staff trained on service delivery standards, best practices, and functional skills', annualTarget: 80, unitOfMeasurement: '%', leadUnitId: 'dept_admin', supportUnitIds: ['dept_ops', 'dept_pa', 'dept_ict', 'dept_acct', 'dept_audit', 'dept_nc', 'dept_si', 'dept_proc', 'dept_legal'] },
  { id: 'mkpi_s4_1_2', objectiveId: 'mobj_s4_1', description: '% of new, transferred, and promoted staff successfully inducted/oriented within 30 days', annualTarget: 80, unitOfMeasurement: '%', leadUnitId: 'dept_admin', supportUnitIds: [] },

  // ── Service Wide: Support for Service Delivery ────────────────────────────
  { id: 'mkpi_s5_1_1', objectiveId: 'mobj_s5_1', description: '% of services and programmes implemented within approved timelines', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_acct', supportUnitIds: ['dept_audit'] },
  { id: 'mkpi_s5_1_2', objectiveId: 'mobj_s5_1', description: '% of payments and staff claims processed within the required timeline', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_acct', supportUnitIds: ['dept_audit'] },
  { id: 'mkpi_s5_2_1', objectiveId: 'mobj_s5_2', description: '% compliance with financial regulations and government policies', annualTarget: 100, unitOfMeasurement: '%', leadUnitId: 'dept_acct', supportUnitIds: ['dept_audit', 'dept_ops', 'dept_admin', 'dept_pa', 'dept_ict', 'dept_nc', 'dept_si', 'dept_proc', 'dept_legal'] },

  // ── Service Wide: Staff Welfare ───────────────────────────────────────────
  { id: 'mkpi_s6_1_1', objectiveId: 'mobj_s6_1', description: '% of staff benefiting from welfare packages', annualTarget: 80, unitOfMeasurement: '%', leadUnitId: 'dept_admin', supportUnitIds: [] },
  { id: 'mkpi_s6_1_2', objectiveId: 'mobj_s6_1', description: 'Timely delivery of welfare items and cash tokens', annualTarget: 80, unitOfMeasurement: '%', leadUnitId: 'dept_admin', supportUnitIds: [] },
  { id: 'mkpi_s6_1_3', objectiveId: 'mobj_s6_1', description: 'Number of recognition and award programmes conducted', annualTarget: 5, unitOfMeasurement: 'Number', leadUnitId: 'dept_admin', supportUnitIds: [] },
  { id: 'mkpi_s6_1_4', objectiveId: 'mobj_s6_1', description: 'Staff satisfaction level with welfare and recognition initiatives', annualTarget: 70, unitOfMeasurement: '%', leadUnitId: 'dept_admin', supportUnitIds: [] },
  { id: 'mkpi_s6_2_1', objectiveId: 'mobj_s6_2', description: 'Staff participation rate in wellness programmes', annualTarget: 50, unitOfMeasurement: '%', leadUnitId: 'dept_admin', supportUnitIds: [] },
  { id: 'mkpi_s6_2_2', objectiveId: 'mobj_s6_2', description: 'Number of wellness and fitness sessions conducted', annualTarget: 5, unitOfMeasurement: 'Number', leadUnitId: 'dept_admin', supportUnitIds: [] },
];
