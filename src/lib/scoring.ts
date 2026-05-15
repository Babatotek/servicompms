/**
 * Scoring Logic Utility
 * Based on the Institutional Performance Management System Excel Master Template (2026)
 */

export interface CriteriaValues {
  o: number; // Outstanding (100)
  e: number; // Excellent (90)
  vg: number; // Very Good (80)
  g: number; // Good (70)
  f: number; // Fair (60)
  p: number; // Poor (50)
}

/**
 * Calculates the Raw Score based on achievement and criteria thresholds.
 * Mapping: O=100, E=90, VG=80, G=70, F=60, P=50, <P=0
 */
export const calculateRawScore = (achievement: number, criteria: CriteriaValues): number => {
  if (achievement === 0) return 0;
  
  // Standard Higher-is-Better Logic
  if (achievement >= criteria.o) return 100;
  if (achievement >= criteria.e) return 90;
  if (achievement >= criteria.vg) return 80;
  if (achievement >= criteria.g) return 70;
  if (achievement >= criteria.f) return 60;
  if (achievement >= criteria.p) return 50;
  
  return 0;
};

/**
 * Calculates the Weighted Raw Score for a single KPI.
 * Formula: Graded Weight * Raw Score / 100
 */
export const calculateWeightedRawScore = (gradedWeight: number, rawScore: number): number => {
  return (gradedWeight * rawScore) / 100;
};

/**
 * Calculates the Section 4 Composite Score (70% weight).
 * Formula: Sum of Weighted Raw Scores * 0.7
 */
export const calculateSection4Composite = (weightedScores: number[]): number => {
  const sum = weightedScores.reduce((acc, val) => acc + val, 0);
  return sum * 0.7;
};

/**
 * Calculates the Final Appraisal Rating.
 * Formula: Section 4 (70%) + Section 5 (20%) + Section 6 (10%)
 */
export const calculateAppraisalRating = (sec4: number, sec5: number, sec6: number): number => {
  return sec4 + sec5 + sec6;
};

/**
 * Calculates the final Appraiser Score (20% weight of total).
 * Formula: Appraisal Rating / 100 * 20
 */
export const calculateAppraiserScore = (rating: number): number => {
  return (rating / 100) * 20;
};
