-- =============================================================================
-- SERVICOM ePMS — Competency Dedup & Cleanup
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Step 1: Fix the Ethics_Values typo on the old row before we delete it
--         (in case any appraisal_competency_scores already reference id=6)
UPDATE competencies
  SET cluster = 'Ethics & Values',
      cluster_id = (SELECT id FROM competency_clusters WHERE name = 'Ethics & Values')
  WHERE id = 6;

-- Step 2: Re-point any appraisal_competency_scores that reference old IDs 1-6
--         to their matching new IDs 7-15 so we don't orphan score rows
UPDATE appraisal_competency_scores SET competency_id = 7  WHERE competency_id = 1;  -- Leadership Skill
UPDATE appraisal_competency_scores SET competency_id = 8  WHERE competency_id = 2;  -- Managing & Developing People
UPDATE appraisal_competency_scores SET competency_id = 9  WHERE competency_id = 3;  -- Effective Communication
UPDATE appraisal_competency_scores SET competency_id = 10 WHERE competency_id = 4;  -- Strategic Thinking
UPDATE appraisal_competency_scores SET competency_id = 11 WHERE competency_id = 5;  -- Drive for Results
UPDATE appraisal_competency_scores SET competency_id = 13 WHERE competency_id = 6;  -- Integrity

-- Step 3: Delete the 6 original duplicate rows
DELETE FROM competencies WHERE id IN (1, 2, 3, 4, 5, 6);

-- Step 4: Verify — should be exactly 9 rows, all with cluster_id set
SELECT id, name, cluster, cluster_id, default_target, sort_order
FROM competencies
ORDER BY sort_order;

-- Step 5: Verify cluster weights sum to 20
SELECT SUM(weight) AS total_cluster_weight FROM competency_clusters;

-- Step 6: Verify no orphaned competency scores
SELECT COUNT(*) AS orphaned_scores
FROM appraisal_competency_scores acs
LEFT JOIN competencies c ON acs.competency_id = c.id
WHERE c.id IS NULL;

SET FOREIGN_KEY_CHECKS = 1;
