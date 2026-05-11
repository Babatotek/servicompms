import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { AppraisalStatus } from '../types';
import { TemplateKRA } from '../lib/performanceTemplates';

export interface AppraisalRecord {
  id: string;
  userId: string;
  ippisNo: string;
  userName: string;
  designation: string;
  departmentId: string;
  supervisorId: string;
  counterSignerId: string;
  contractId: string;
  period: string;
  year: number;
  status: AppraisalStatus;
  submittedAt: string;
  kras: TemplateKRA[];
  achievements: Record<string, number>;
  supervisorAchievements: Record<string, number>;
  scores: {
    kpiTotal: number;
    competency: number;
    opsScore: number;
    grandTotal: number;
  };
  comments: {
    appraiseeComments: string;
    supervisorComments: string;
    counterSupervisorComments: string;
    appraiseeSigned: boolean;
    supervisorSigned: boolean;
    counterSigned: boolean;
  };
  supervisorRating?: number;
  supervisorComment?: string;
  supervisorReviewedAt?: string;
  // Counter-signer review
  counterSignerComment?: string;
  counterSignedAt?: string;
}

interface AppraisalContextType {
  appraisals: AppraisalRecord[];
  submitAppraisal: (record: AppraisalRecord) => void;
  updateAppraisalStatus: (
    id: string,
    status: AppraisalStatus,
    supervisorComment?: string,
    supervisorRating?: number
  ) => void;
  getAppraisalsForSupervisor: (supervisorId: string) => AppraisalRecord[];
  getAppraisalByUser: (userId: string, period: string) => AppraisalRecord | undefined;
  // Counter-signer queue
  getAppraisalsForCounterSigner: (counterSignerId: string) => AppraisalRecord[];
  counterSignAppraisal: (id: string, comment: string) => void;
  returnFromCounterSigner: (id: string, comment: string) => void;
  // ── derived selectors consumed by Dashboard, Analytics, Leaderboard ──
  getLatestAppraisalForUser: (userId: string) => AppraisalRecord | undefined;
  getScoreTrendForUser: (userId: string) => { name: string; score: number }[];
  getLeaderboard: () => { userId: string; userName: string; departmentId: string; score: number; grade: string }[];
  getDeptCompliance: (deptId: string) => { submitted: number; approved: number; total: number };
  getPendingCountForSupervisor: (supervisorId: string) => number;
}

const AppraisalContext = createContext<AppraisalContextType | undefined>(undefined);

const STORAGE_KEY = 'servicom_appraisals';

const loadFromStorage = (): AppraisalRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (records: AppraisalRecord[]) => {
  setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.warn('[AppraisalContext] localStorage quota exceeded — data held in memory only.');
      }
    }
  }, 0);
};

// Map grandTotal score to grade key
const scoreToGrade = (score: number): string => {
  if (score >= 90) return 'O';
  if (score >= 80) return 'E';
  if (score >= 70) return 'VG';
  if (score >= 60) return 'G';
  if (score >= 50) return 'F';
  return 'P';
};

export const AppraisalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appraisals, setAppraisals] = useState<AppraisalRecord[]>(loadFromStorage);

  const submitAppraisal = useCallback((record: AppraisalRecord) => {
    setAppraisals(prev => {
      const exists = prev.findIndex(a => a.userId === record.userId && a.period === record.period);
      const next = exists >= 0
        ? prev.map((a, i) => i === exists ? record : a)
        : [...prev, record];
      saveToStorage(next);
      return next;
    });
  }, []);

  const updateAppraisalStatus = useCallback((
    id: string,
    status: AppraisalStatus,
    supervisorComment?: string,
    supervisorRating?: number
  ) => {
    setAppraisals(prev => {
      const next = prev.map(a => {
        if (a.id !== id) return a;
        // When supervisor approves and a counter-signer is assigned,
        // route to PENDING_COUNTER_SIGN instead of APPROVED directly
        const effectiveStatus =
          status === AppraisalStatus.APPROVED && a.counterSignerId
            ? AppraisalStatus.PENDING_COUNTER_SIGN
            : status;
        return {
          ...a,
          status: effectiveStatus,
          supervisorComment: supervisorComment ?? a.supervisorComment,
          supervisorRating: supervisorRating ?? a.supervisorRating,
          supervisorReviewedAt: new Date().toISOString(),
        };
      });
      saveToStorage(next);
      return next;
    });
  }, []);

  const getAppraisalsForSupervisor = useCallback((supervisorId: string) => {
    return appraisals.filter(a => a.supervisorId === supervisorId);
  }, [appraisals]);

  const getAppraisalByUser = useCallback((userId: string, period: string) => {
    return appraisals.find(a => a.userId === userId && a.period === period);
  }, [appraisals]);

  // Counter-signer queue: appraisals awaiting counter-sign by this user
  const getAppraisalsForCounterSigner = useCallback((counterSignerId: string) => {
    return appraisals.filter(a => a.counterSignerId === counterSignerId &&
      a.status === AppraisalStatus.PENDING_COUNTER_SIGN
    );
  }, [appraisals]);

  // Counter-signer finalises — moves to COUNTER_SIGNED (fully complete)
  const counterSignAppraisal = useCallback((id: string, comment: string) => {
    setAppraisals(prev => {
      const next = prev.map(a => a.id === id ? {
        ...a,
        status: AppraisalStatus.COUNTER_SIGNED,
        counterSignerComment: comment,
        counterSignedAt: new Date().toISOString(),
      } : a);
      saveToStorage(next);
      return next;
    });
  }, []);

  // Counter-signer returns to supervisor for re-review
  const returnFromCounterSigner = useCallback((id: string, comment: string) => {
    setAppraisals(prev => {
      const next = prev.map(a => a.id === id ? {
        ...a,
        status: AppraisalStatus.RETURNED,
        counterSignerComment: comment,
        counterSignedAt: new Date().toISOString(),
      } : a);
      saveToStorage(next);
      return next;
    });
  }, []);

  // Most recent approved appraisal for a user
  const getLatestAppraisalForUser = useCallback((userId: string) => {
    const userRecords = appraisals
      .filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    return userRecords[0];
  }, [appraisals]);

  // Score trend: one point per submitted period, sorted chronologically
  const getScoreTrendForUser = useCallback((userId: string) => {
    return appraisals
      .filter(a => a.userId === userId && a.scores.grandTotal > 0)
      .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
      .map(a => ({ name: a.period, score: Math.round(a.scores.grandTotal * 10) / 10 }));
  }, [appraisals]);

  // Leaderboard: latest approved record per user, sorted by grandTotal desc
  const getLeaderboard = useCallback(() => {
    const byUser: Record<string, AppraisalRecord> = {};
    appraisals
      .filter(a => a.status === AppraisalStatus.APPROVED)
      .forEach(a => {
        if (!byUser[a.userId] || a.scores.grandTotal > byUser[a.userId].scores.grandTotal) {
          byUser[a.userId] = a;
        }
      });
    return Object.values(byUser)
      .sort((a, b) => b.scores.grandTotal - a.scores.grandTotal)
      .map(a => ({
        userId: a.userId,
        userName: a.userName,
        departmentId: a.departmentId,
        score: Math.round(a.scores.grandTotal * 10) / 10,
        grade: scoreToGrade(a.scores.grandTotal),
      }));
  }, [appraisals]);

  // Dept compliance: how many staff in a dept have submitted / been approved
  const getDeptCompliance = useCallback((deptId: string) => {
    const deptRecords = appraisals.filter(a => a.departmentId === deptId);
    const submitted = deptRecords.filter(a =>
      a.status === AppraisalStatus.SUBMITTED ||
      a.status === AppraisalStatus.UNDER_REVIEW ||
      a.status === AppraisalStatus.APPROVED
    ).length;
    const approved = deptRecords.filter(a => a.status === AppraisalStatus.APPROVED).length;
    return { submitted, approved, total: deptRecords.length };
  }, [appraisals]);

  // Count pending reviews for a supervisor (for badge / dashboard hero)
  const getPendingCountForSupervisor = useCallback((supervisorId: string) => {
    return appraisals.filter(a =>
      a.supervisorId === supervisorId &&
      (a.status === AppraisalStatus.SUBMITTED || a.status === AppraisalStatus.UNDER_REVIEW)
    ).length;
  }, [appraisals]);

  const value = useMemo(() => ({
    appraisals,
    submitAppraisal,
    updateAppraisalStatus,
    getAppraisalsForSupervisor,
    getAppraisalByUser,
    getAppraisalsForCounterSigner,
    counterSignAppraisal,
    returnFromCounterSigner,
    getLatestAppraisalForUser,
    getScoreTrendForUser,
    getLeaderboard,
    getDeptCompliance,
    getPendingCountForSupervisor,
  }), [
    appraisals,
    submitAppraisal,
    updateAppraisalStatus,
    getAppraisalsForSupervisor,
    getAppraisalByUser,
    getAppraisalsForCounterSigner,
    counterSignAppraisal,
    returnFromCounterSigner,
    getLatestAppraisalForUser,
    getScoreTrendForUser,
    getLeaderboard,
    getDeptCompliance,
    getPendingCountForSupervisor,
  ]);

  return (
    <AppraisalContext.Provider value={value}>
      {children}
    </AppraisalContext.Provider>
  );
};

export const useAppraisals = () => {
  const ctx = useContext(AppraisalContext);
  if (!ctx) throw new Error('useAppraisals must be used within AppraisalProvider');
  return ctx;
};
