-- =============================================================================
-- SERVICOM ePMS — Database Optimisation & Fix Script
-- Run against: servicom_epms (XAMPP MySQL)
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = '';

-- =============================================================================
-- FIX 1: performance_contracts
--   Missing: supervisor_id, submitted_at, supervisor_comment, reviewed_at
--   Missing enum value: 'pending_approval', 'returned'
-- =============================================================================

ALTER TABLE performance_contracts
  ADD COLUMN supervisor_id      BIGINT UNSIGNED NULL          AFTER user_id,
  ADD COLUMN submitted_at       TIMESTAMP       NULL          AFTER status,
  ADD COLUMN supervisor_comment TEXT            NULL          AFTER approved_at,
  ADD COLUMN reviewed_at        TIMESTAMP       NULL          AFTER supervisor_comment;

ALTER TABLE performance_contracts
  MODIFY COLUMN status ENUM(
    'draft',
    'submitted',
    'pending_approval',
    'approved',
    'active',
    'returned'
  ) NOT NULL DEFAULT 'draft';

ALTER TABLE performance_contracts
  ADD CONSTRAINT fk_pc_supervisor
    FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE SET NULL;

-- =============================================================================
-- FIX 2: departments
--   Missing: head_user_id, staff_count
-- =============================================================================

ALTER TABLE departments
  ADD COLUMN head_user_id BIGINT UNSIGNED NULL          AFTER code,
  ADD COLUMN staff_count  SMALLINT UNSIGNED NOT NULL DEFAULT 0 AFTER unit_weight;

ALTER TABLE departments
  ADD CONSTRAINT fk_dept_head
    FOREIGN KEY (head_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- =============================================================================
-- FIX 3: appraisals
--   Missing: supervisor_comment, supervisor_rating, supervisor_reviewed_at,
--            counter_signer_comment, counter_signed_at
-- =============================================================================

ALTER TABLE appraisals
  ADD COLUMN supervisor_comment      TEXT            NULL AFTER counter_signer_id,
  ADD COLUMN supervisor_rating       TINYINT UNSIGNED NULL AFTER supervisor_comment,
  ADD COLUMN supervisor_reviewed_at  TIMESTAMP       NULL AFTER supervisor_rating,
  ADD COLUMN counter_signer_comment  TEXT            NULL AFTER supervisor_reviewed_at,
  ADD COLUMN counter_signed_at       TIMESTAMP       NULL AFTER counter_signer_comment;

-- =============================================================================
-- FIX 4: contract_kpis
--   Missing: weight, graded_weight, mpms_kpi_id
-- =============================================================================

ALTER TABLE contract_kpis
  ADD COLUMN weight        DECIMAL(10,4) NULL AFTER criteria_P,
  ADD COLUMN graded_weight DECIMAL(10,4) NULL AFTER weight,
  ADD COLUMN mpms_kpi_id   BIGINT UNSIGNED NULL AFTER graded_weight;

ALTER TABLE contract_kpis
  ADD CONSTRAINT fk_ckpi_mpms
    FOREIGN KEY (mpms_kpi_id) REFERENCES mpms_kpis(id) ON DELETE SET NULL;

-- =============================================================================
-- FIX 5: appraisal_periods — unique constraint on (year, label)
-- =============================================================================

ALTER TABLE appraisal_periods
  ADD UNIQUE KEY uq_period_year_label (year, label);

-- =============================================================================
-- FIX 6: competency_clusters table + link competencies to it
-- =============================================================================

CREATE TABLE IF NOT EXISTS competency_clusters (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)   NOT NULL,
  weight     DECIMAL(5,2)   NOT NULL DEFAULT 0.00
               COMMENT 'Must sum to 20 across all clusters (Section 5 allocation)',
  sort_order INT            NOT NULL DEFAULT 0,
  is_active  TINYINT(1)     NOT NULL DEFAULT 1,
  created_at TIMESTAMP      NULL,
  updated_at TIMESTAMP      NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE competencies
  ADD COLUMN cluster_id BIGINT UNSIGNED NULL AFTER cluster;

ALTER TABLE competencies
  ADD CONSTRAINT fk_comp_cluster
    FOREIGN KEY (cluster_id) REFERENCES competency_clusters(id) ON DELETE SET NULL;

-- =============================================================================
-- FIX 7: kra_templates — missing description column
-- =============================================================================

ALTER TABLE kra_templates
  ADD COLUMN description VARCHAR(500) NULL AFTER name;

-- =============================================================================
-- FIX 8: users — drop redundant Laravel default 'name' column
-- =============================================================================

ALTER TABLE users DROP COLUMN name;

-- =============================================================================
-- FIX 9: COMPOSITE INDEXES — all hot query paths
-- =============================================================================

-- appraisals: supervisor queue (TeamReview page)
ALTER TABLE appraisals
  ADD INDEX idx_supervisor_status     (supervisor_id, status),
  ADD INDEX idx_counter_status        (counter_signer_id, status),
  ADD INDEX idx_user_period           (user_id, period_id),
  ADD INDEX idx_year_status           (year, status),
  ADD INDEX idx_user_year_status      (user_id, year, status);

-- performance_contracts: contract lookup + supervisor queue
ALTER TABLE performance_contracts
  ADD INDEX idx_pc_user_year          (user_id, year),
  ADD INDEX idx_pc_supervisor_status  (supervisor_id, status);

-- mpms_achievements: category score aggregation (MPMSDashboard)
ALTER TABLE mpms_achievements
  ADD INDEX idx_mpms_kpi_year         (kpi_id, year),
  ADD INDEX idx_mpms_year_status      (year, status);

-- appraisal_kpi_scores: scoring service bulk read
ALTER TABLE appraisal_kpi_scores
  ADD INDEX idx_aks_appraisal_kpi     (appraisal_id, kpi_id);

-- appraisal_competency_scores
ALTER TABLE appraisal_competency_scores
  ADD INDEX idx_acs_appraisal         (appraisal_id, competency_id);

-- appraisal_operations_scores
ALTER TABLE appraisal_operations_scores
  ADD INDEX idx_aos_appraisal         (appraisal_id, item_id);

-- appraisal_totals: leaderboard + analytics (most-read table)
ALTER TABLE appraisal_totals
  ADD UNIQUE KEY uq_at_appraisal      (appraisal_id),
  ADD INDEX idx_at_grade              (final_grade),
  ADD INDEX idx_at_grand_total        (grand_total DESC);

-- contract_kras / objectives / kpis: eager-load chain
ALTER TABLE contract_kras
  ADD INDEX idx_ckra_contract         (contract_id, serial_no);

ALTER TABLE contract_objectives
  ADD INDEX idx_cobj_kra              (kra_id);

ALTER TABLE contract_kpis
  ADD INDEX idx_ckpi_objective        (objective_id);

-- mpms hierarchy: dashboard aggregation
ALTER TABLE mpms_kpis
  ADD INDEX idx_mkpi_objective_year   (objective_id, year);

ALTER TABLE mpms_kras
  ADD INDEX idx_mkra_category_year    (category_id, year);

-- workflow log: audit trail queries
ALTER TABLE appraisal_workflow_log
  ADD INDEX idx_awl_appraisal_created (appraisal_id, created_at);

-- =============================================================================
-- FIX 10: SEED competency_clusters with correct weights from frontend constants
--   Generic=9, Functional=7, Ethics & Values=4  (total=20)
-- =============================================================================

INSERT INTO competency_clusters (name, weight, sort_order, is_active, created_at, updated_at) VALUES
  ('Generic',         9.00, 1, 1, NOW(), NOW()),
  ('Functional',      7.00, 2, 1, NOW(), NOW()),
  ('Ethics & Values', 4.00, 3, 1, NOW(), NOW());

-- Link existing competency rows to their clusters
UPDATE competencies SET cluster_id = (SELECT id FROM competency_clusters WHERE name = 'Generic')
  WHERE cluster = 'Generic';

UPDATE competencies SET cluster_id = (SELECT id FROM competency_clusters WHERE name = 'Functional')
  WHERE cluster = 'Functional';

UPDATE competencies SET cluster_id = (SELECT id FROM competency_clusters WHERE name = 'Ethics & Values')
  WHERE cluster = 'Ethics & Values';

-- =============================================================================
-- FIX 11: SEED grade_scales if empty (matches frontend DEFAULT_GRADE_SCALE)
-- =============================================================================

INSERT IGNORE INTO grade_scales (id, `key`, label, threshold_percent, colour_hex, sort_order, is_active, created_at, updated_at) VALUES
  (1, 'O',  'Outstanding', 100.00, '#16A34A', 1, 1, NOW(), NOW()),
  (2, 'E',  'Excellent',    90.00, '#2563EB', 2, 1, NOW(), NOW()),
  (3, 'VG', 'Very Good',    80.00, '#7C3AED', 3, 1, NOW(), NOW()),
  (4, 'G',  'Good',         70.00, '#D97706', 4, 1, NOW(), NOW()),
  (5, 'F',  'Fair',         60.00, '#EA580C', 5, 1, NOW(), NOW()),
  (6, 'P',  'Poor',         50.00, '#DC2626', 6, 1, NOW(), NOW());

-- =============================================================================
-- FIX 12: SEED operations_items if empty (matches frontend DEFAULT_OPERATIONS_ITEMS)
-- =============================================================================

INSERT IGNORE INTO operations_items (id, name, default_target, max_score, sort_order, is_active, created_at, updated_at) VALUES
  (1, 'Punctuality / Attendance', 4, 4, 1, 1, NOW(), NOW()),
  (2, 'Work Turnaround Time',     4, 4, 2, 1, NOW(), NOW()),
  (3, 'Innovation on the Job',    2, 2, 3, 1, NOW(), NOW());

-- =============================================================================
-- FIX 13: SEED departments if empty (matches frontend DEPARTMENTS constant)
-- =============================================================================

INSERT IGNORE INTO departments (id, name, code, unit_weight, staff_count, is_active, created_at, updated_at) VALUES
  ('dept_acct',  'Finance and Account',  'ACCT',  5,  0, 1, NOW(), NOW()),
  ('dept_admin', 'Admin',                'ADM',   7,  0, 1, NOW(), NOW()),
  ('dept_audit', 'Internal Audit',       'AUD',   3,  0, 1, NOW(), NOW()),
  ('dept_ict',   'ICT',                  'ICT',   5,  0, 1, NOW(), NOW()),
  ('dept_nc',    'NC Office',            'NC',    3,  0, 1, NOW(), NOW()),
  ('dept_ops',   'Operations',           'OPS',   10, 0, 1, NOW(), NOW()),
  ('dept_pa',    'Public Awareness',     'PA',    7,  0, 1, NOW(), NOW()),
  ('dept_si',    'Servicom Institute',   'SI',    5,  0, 1, NOW(), NOW()),
  ('dept_proc',  'Procurement',          'PROC',  3,  0, 1, NOW(), NOW()),
  ('dept_legal', 'Legal',               'LGL',   2,  0, 1, NOW(), NOW());

-- =============================================================================
-- FIX 14: SEED appraisal_periods (Q1–Q4 2026)
-- =============================================================================

INSERT IGNORE INTO appraisal_periods (year, label, quarter, coverage_start, coverage_end, submission_opens, submission_closes, is_active, created_at, updated_at) VALUES
  (2026, 'Q1-2026', 'Q1', '2026-01-01', '2026-03-31', '2026-04-01 00:00:00', '2026-04-15 23:59:59', 1, NOW(), NOW()),
  (2026, 'Q2-2026', 'Q2', '2026-04-01', '2026-06-30', '2026-07-01 00:00:00', '2026-07-15 23:59:59', 1, NOW(), NOW()),
  (2026, 'Q3-2026', 'Q3', '2026-07-01', '2026-09-30', '2026-10-01 00:00:00', '2026-10-15 23:59:59', 1, NOW(), NOW()),
  (2026, 'Q4-2026', 'Q4', '2026-10-01', '2026-12-31', '2027-01-01 00:00:00', '2027-01-15 23:59:59', 1, NOW(), NOW());

-- =============================================================================
-- FIX 15: SEED mpms_priority_categories if empty
-- =============================================================================

INSERT IGNORE INTO mpms_priority_categories (id, code, name, weight_percent, sort_order, created_at, updated_at) VALUES
  (1, 'PRESIDENTIAL',    'Presidential Priorities',    13, 1, NOW(), NOW()),
  (2, 'MDA_OPERATIONAL', 'MDA Operational Priorities', 25, 2, NOW(), NOW()),
  (3, 'SERVICE_WIDE',    'Service-Wide Priorities',    37, 3, NOW(), NOW());

-- =============================================================================
-- FIX 16: SEED competencies if empty (matches frontend DEFAULT_COMPETENCIES)
-- =============================================================================

INSERT IGNORE INTO competencies (cluster, cluster_id, name, default_target, sort_order, is_active, created_at, updated_at)
SELECT 'Generic', id, 'Leadership Skill',              3, 1, 1, NOW(), NOW() FROM competency_clusters WHERE name='Generic'
UNION ALL
SELECT 'Generic', id, 'Managing & Developing People',  3, 2, 1, NOW(), NOW() FROM competency_clusters WHERE name='Generic'
UNION ALL
SELECT 'Generic', id, 'Effective Communication',       3, 3, 1, NOW(), NOW() FROM competency_clusters WHERE name='Generic'
UNION ALL
SELECT 'Functional', id, 'Strategic Thinking',         3, 4, 1, NOW(), NOW() FROM competency_clusters WHERE name='Functional'
UNION ALL
SELECT 'Functional', id, 'Drive for Results',          2, 5, 1, NOW(), NOW() FROM competency_clusters WHERE name='Functional'
UNION ALL
SELECT 'Functional', id, 'Transparency and Accountability', 2, 6, 1, NOW(), NOW() FROM competency_clusters WHERE name='Functional'
UNION ALL
SELECT 'Ethics & Values', id, 'Integrity',             2, 7, 1, NOW(), NOW() FROM competency_clusters WHERE name='Ethics & Values'
UNION ALL
SELECT 'Ethics & Values', id, 'Citizen Focus',         1, 8, 1, NOW(), NOW() FROM competency_clusters WHERE name='Ethics & Values'
UNION ALL
SELECT 'Ethics & Values', id, 'Courage',               1, 9, 1, NOW(), NOW() FROM competency_clusters WHERE name='Ethics & Values';

-- =============================================================================
-- RE-ENABLE FK CHECKS
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- VERIFICATION QUERIES — run these to confirm everything applied correctly
-- =============================================================================

SELECT 'performance_contracts columns' AS check_name,
  COUNT(*) AS col_count FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA='servicom_epms' AND TABLE_NAME='performance_contracts';

SELECT 'appraisals columns' AS check_name,
  COUNT(*) AS col_count FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA='servicom_epms' AND TABLE_NAME='appraisals';

SELECT 'contract_kpis columns' AS check_name,
  COUNT(*) AS col_count FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA='servicom_epms' AND TABLE_NAME='contract_kpis';

SELECT 'competency_clusters rows' AS check_name,
  COUNT(*) AS row_count FROM competency_clusters;

SELECT 'competencies rows' AS check_name,
  COUNT(*) AS row_count FROM competencies;

SELECT 'grade_scales rows' AS check_name,
  COUNT(*) AS row_count FROM grade_scales;

SELECT 'operations_items rows' AS check_name,
  COUNT(*) AS row_count FROM operations_items;

SELECT 'departments rows' AS check_name,
  COUNT(*) AS row_count FROM departments;

SELECT 'appraisal_periods rows' AS check_name,
  COUNT(*) AS row_count FROM appraisal_periods;

SELECT 'mpms_priority_categories rows' AS check_name,
  COUNT(*) AS row_count FROM mpms_priority_categories;

SELECT 'Total indexes on appraisals' AS check_name,
  COUNT(*) AS idx_count FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA='servicom_epms' AND TABLE_NAME='appraisals';
