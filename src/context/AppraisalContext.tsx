import React, { createContext, useContext, useState, useCallback } from 'react';
import { AppraisalStatus } from '../types';
import { TemplateKRA } from '../lib/performanceTemplates';

// The full appraisal record stored per submission
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
  // Snapshotted KRA tree from the approved contract
  kras: TemplateKRA[];
  // Achievement values keyed by kpiId / comp_name / op_name
  achievements: Record<string, number>;
  supervisorAchievements: Record<string, number>;
  // Computed scores
  scores: {
    kpiTotal: number;
    competency: number;
    opsScore: number;
    grandTotal: number;
  };
  // Section 7 comments
  comments: {
    appraiseeComments: string;
    supervisorComments: string;
    counterSupervisorComments: string;
    appraiseeSigned: boolean;
    supervisorSigned: boolean;
    counterSigned: boolean;
  };
  // Supervisor review
  supervisorRating?: number;
  supervisorComment?: string;
  supervisorReviewedAt?: string;
}

interface AppraisalContextType {
  appraisals: AppraisalRecord[];
  submitAppraisal: (record: AppraisalRecord) => void;
  updateAppraisalStatus: (id: string, status: AppraisalStatus, supervisorComment?: string, supervisorRating?: number) => void;
  getAppraisalsForSupervisor: (supervisorId: string) => AppraisalRecord[];
  getAppraisalByUser: (userId: string, period: string) => AppraisalRecord | undefined;
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

export const AppraisalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appraisals, setAppraisals] = useState<AppraisalRecord[]>(loadFromStorage);

  const submitAppraisal = useCallback((record: AppraisalRecord) => {
    setAppraisals(prev => {
      // Replace if same user+period already exists, otherwise append
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
      const next = prev.map(a => a.id === id ? {
        ...a,
        status,
        supervisorComment: supervisorComment ?? a.supervisorComment,
        supervisorRating: supervisorRating ?? a.supervisorRating,
        supervisorReviewedAt: new Date().toISOString(),
      } : a);
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

  return (
    <AppraisalContext.Provider value={{
      appraisals,
      submitAppraisal,
      updateAppraisalStatus,
      getAppraisalsForSupervisor,
      getAppraisalByUser,
    }}>
      {children}
    </AppraisalContext.Provider>
  );
};

export const useAppraisals = () => {
  const ctx = useContext(AppraisalContext);
  if (!ctx) throw new Error('useAppraisals must be used within AppraisalProvider');
  return ctx;
};
