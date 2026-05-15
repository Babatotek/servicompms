import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { AppraisalStatus } from '../types';
import { TemplateKRA } from '../lib/performanceTemplates';
import { appraisalApi } from '../lib/api';
import { useAuth } from './AuthContext';

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
  scores: { kpiTotal: number; competency: number; opsScore: number; grandTotal: number };
  comments: {
    appraiseeComments: string; supervisorComments: string;
    counterSupervisorComments: string;
    appraiseeSigned: boolean; supervisorSigned: boolean; counterSigned: boolean;
  };
  supervisorRating?: number;
  supervisorComment?: string;
  supervisorReviewedAt?: string;
  counterSignerComment?: string;
  counterSignedAt?: string;
}

interface AppraisalContextType {
  appraisals: AppraisalRecord[];
  submitAppraisal: (record: AppraisalRecord) => void;
  updateAppraisalStatus: (id: string, status: AppraisalStatus, supervisorComment?: string, supervisorRating?: number) => void;
  getAppraisalsForSupervisor: (supervisorId: string) => AppraisalRecord[];
  getAppraisalByUser: (userId: string, period: string) => AppraisalRecord | undefined;
  getAppraisalsForCounterSigner: (counterSignerId: string) => AppraisalRecord[];
  counterSignAppraisal: (id: string, comment: string) => void;
  returnFromCounterSigner: (id: string, comment: string) => void;
  getLatestAppraisalForUser: (userId: string) => AppraisalRecord | undefined;
  getScoreTrendForUser: (userId: string) => { name: string; score: number }[];
  getLeaderboard: () => { userId: string; userName: string; departmentId: string; score: number; grade: string }[];
  getDeptCompliance: (deptId: string) => { submitted: number; approved: number; total: number };
  getPendingCountForSupervisor: (supervisorId: string) => number;
  // API-backed loaders
  loadSupervisorQueue: () => Promise<void>;
  loadCounterQueue: () => Promise<void>;
}

const AppraisalContext = createContext<AppraisalContextType | undefined>(undefined);

const STORAGE_KEY = 'servicom_appraisals_v2';

const loadFromStorage = (): AppraisalRecord[] => {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; }
  catch { return []; }
};
const saveToStorage = (records: AppraisalRecord[]) => {
  setTimeout(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); }
    catch (e) { if (e instanceof DOMException && e.name === 'QuotaExceededError') console.warn('[AppraisalContext] quota exceeded'); }
  }, 0);
};

const scoreToGrade = (score: number): string => {
  if (score >= 100) return 'O'; if (score >= 90) return 'E'; if (score >= 80) return 'VG';
  if (score >= 70) return 'G'; if (score >= 60) return 'F'; return 'P';
};

/** Map backend appraisal payload → AppraisalRecord */
function mapAppraisal(raw: any): AppraisalRecord {
  const statusMap: Record<string, AppraisalStatus> = {
    draft:                AppraisalStatus.DRAFT,
    submitted:            AppraisalStatus.SUBMITTED,
    under_review:         AppraisalStatus.UNDER_REVIEW,
    approved:             AppraisalStatus.APPROVED,
    pending_counter_sign: AppraisalStatus.PENDING_COUNTER_SIGN,
    counter_signed:       AppraisalStatus.COUNTER_SIGNED,
    returned:             AppraisalStatus.RETURNED,
  };
  return {
    id:              String(raw.id),
    userId:          String(raw.user_id),
    ippisNo:         raw.user?.ippis_no ?? '',
    userName:        raw.user?.full_name ?? '',
    designation:     raw.user?.designation ?? '',
    departmentId:    raw.user?.department_id ?? '',
    supervisorId:    raw.supervisor_id ? String(raw.supervisor_id) : '',
    counterSignerId: raw.counter_signer_id ? String(raw.counter_signer_id) : '',
    contractId:      String(raw.contract_id),
    period:          raw.period?.label ?? String(raw.year),
    year:            raw.year,
    status:          statusMap[raw.status] ?? AppraisalStatus.DRAFT,
    submittedAt:     raw.submitted_at ?? new Date().toISOString(),
    kras:            raw.contract?.kras ?? [],
    achievements:    raw.kpi_scores
      ? Object.fromEntries(Object.entries(raw.kpi_scores).map(([k, v]: any) => [k, v.achievement]))
      : {},
    supervisorAchievements: {},
    scores: {
      kpiTotal:   raw.scores?.kpi_total   ?? 0,
      competency: raw.scores?.competency  ?? 0,
      opsScore:   raw.scores?.ops_score   ?? 0,
      grandTotal: raw.scores?.grand_total ?? 0,
    },
    comments: {
      appraiseeComments:        raw.comments?.appraisee?.comment ?? '',
      supervisorComments:       raw.comments?.supervisor?.comment ?? '',
      counterSupervisorComments:raw.comments?.counter_signer?.comment ?? '',
      appraiseeSigned:          !!raw.appraisee_signed_at,
      supervisorSigned:         !!raw.supervisor_signed_at,
      counterSigned:            !!raw.counter_signer_signed_at,
    },
    supervisorRating:      raw.supervisor_rating ?? undefined,
    supervisorComment:     raw.supervisor_comment ?? undefined,
    supervisorReviewedAt:  raw.supervisor_reviewed_at ?? undefined,
    counterSignerComment:  raw.counter_signer_comment ?? undefined,
    counterSignedAt:       raw.counter_signed_at ?? undefined,
  };
}

export const AppraisalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [appraisals, setAppraisals] = useState<AppraisalRecord[]>(loadFromStorage);

  const upsert = useCallback((record: AppraisalRecord) => {
    setAppraisals(prev => {
      const idx = prev.findIndex(a => a.id === record.id);
      const next = idx >= 0 ? prev.map((a, i) => i === idx ? record : a) : [...prev, record];
      saveToStorage(next);
      return next;
    });
  }, []);

  const submitAppraisal = useCallback((record: AppraisalRecord) => {
    setAppraisals(prev => {
      const exists = prev.findIndex(a => a.userId === record.userId && a.period === record.period);
      const next = exists >= 0 ? prev.map((a, i) => i === exists ? record : a) : [...prev, record];
      saveToStorage(next);
      return next;
    });
  }, []);

  const updateAppraisalStatus = useCallback((
    id: string, status: AppraisalStatus,
    supervisorComment?: string, supervisorRating?: number
  ) => {
    setAppraisals(prev => {
      const next = prev.map(a => {
        if (a.id !== id) return a;
        const effectiveStatus = status === AppraisalStatus.APPROVED && a.counterSignerId
          ? AppraisalStatus.PENDING_COUNTER_SIGN : status;
        return { ...a, status: effectiveStatus, supervisorComment: supervisorComment ?? a.supervisorComment,
          supervisorRating: supervisorRating ?? a.supervisorRating, supervisorReviewedAt: new Date().toISOString() };
      });
      saveToStorage(next);
      return next;
    });
    // Sync to backend
    const action = status === AppraisalStatus.APPROVED ? 'approve' : 'return';
    appraisalApi.review(Number(id), action, supervisorComment ?? '', supervisorRating).catch(console.error);
  }, []);

  const getAppraisalsForSupervisor = useCallback((supervisorId: string) =>
    appraisals.filter(a => a.supervisorId === supervisorId), [appraisals]);

  const getAppraisalByUser = useCallback((userId: string, period: string) =>
    appraisals.find(a => a.userId === userId && a.period === period), [appraisals]);

  const getAppraisalsForCounterSigner = useCallback((counterSignerId: string) =>
    appraisals.filter(a => a.counterSignerId === counterSignerId && a.status === AppraisalStatus.PENDING_COUNTER_SIGN),
  [appraisals]);

  const counterSignAppraisal = useCallback((id: string, comment: string) => {
    setAppraisals(prev => {
      const next = prev.map(a => a.id === id ? { ...a, status: AppraisalStatus.COUNTER_SIGNED,
        counterSignerComment: comment, counterSignedAt: new Date().toISOString() } : a);
      saveToStorage(next); return next;
    });
    appraisalApi.counterSign(Number(id), comment).catch(console.error);
  }, []);

  const returnFromCounterSigner = useCallback((id: string, comment: string) => {
    setAppraisals(prev => {
      const next = prev.map(a => a.id === id ? { ...a, status: AppraisalStatus.RETURNED,
        counterSignerComment: comment, counterSignedAt: new Date().toISOString() } : a);
      saveToStorage(next); return next;
    });
    appraisalApi.returnFromCounter(Number(id), comment).catch(console.error);
  }, []);

  const getLatestAppraisalForUser = useCallback((userId: string) =>
    appraisals.filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0],
  [appraisals]);

  const getScoreTrendForUser = useCallback((userId: string) =>
    appraisals.filter(a => a.userId === userId && a.scores.grandTotal > 0)
      .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
      .map(a => ({ name: a.period, score: Math.round(a.scores.grandTotal * 100) / 100 })),
  [appraisals]);

  const getLeaderboard = useCallback(() => {
    const byUser: Record<string, AppraisalRecord> = {};
    appraisals.filter(a => a.status === AppraisalStatus.APPROVED).forEach(a => {
      if (!byUser[a.userId] || a.scores.grandTotal > byUser[a.userId].scores.grandTotal) byUser[a.userId] = a;
    });
    return Object.values(byUser).sort((a, b) => b.scores.grandTotal - a.scores.grandTotal)
      .map(a => ({ userId: a.userId, userName: a.userName, departmentId: a.departmentId,
        score: Math.round(a.scores.grandTotal * 100) / 100, grade: scoreToGrade(a.scores.grandTotal) }));
  }, [appraisals]);

  const getDeptCompliance = useCallback((deptId: string) => {
    const deptRecords = appraisals.filter(a => a.departmentId === deptId);
    const submitted = deptRecords.filter(a => [AppraisalStatus.SUBMITTED, AppraisalStatus.UNDER_REVIEW, AppraisalStatus.APPROVED].includes(a.status)).length;
    const approved  = deptRecords.filter(a => a.status === AppraisalStatus.APPROVED).length;
    return { submitted, approved, total: deptRecords.length };
  }, [appraisals]);

  const getPendingCountForSupervisor = useCallback((supervisorId: string) =>
    appraisals.filter(a => a.supervisorId === supervisorId &&
      [AppraisalStatus.SUBMITTED, AppraisalStatus.UNDER_REVIEW].includes(a.status)).length,
  [appraisals]);

  /** Fetch supervisor queue from API and merge into local state */
  const loadSupervisorQueue = useCallback(async () => {
    try {
      const res = await appraisalApi.supervisorQueue();
      const mapped = (res?.data ?? []).map(mapAppraisal);
      setAppraisals(prev => {
        const ids = new Set(mapped.map((a: AppraisalRecord) => a.id));
        const next = [...prev.filter(a => !ids.has(a.id)), ...mapped];
        saveToStorage(next); return next;
      });
    } catch (e) { console.error(e); }
  }, []);

  /** Fetch counter-sign queue from API */
  const loadCounterQueue = useCallback(async () => {
    try {
      const res = await appraisalApi.counterQueue();
      const mapped = (res?.data ?? []).map(mapAppraisal);
      setAppraisals(prev => {
        const ids = new Set(mapped.map((a: AppraisalRecord) => a.id));
        const next = [...prev.filter(a => !ids.has(a.id)), ...mapped];
        saveToStorage(next); return next;
      });
    } catch (e) { console.error(e); }
  }, []);

  /** Fetch dashboard data from API (Redis cached) */
  const loadDashboardData = useCallback(async () => {
    try {
      const res = await appraisalApi.mine('Q2-2026'); // Example for current period
      if (res?.data) upsert(mapAppraisal(res.data));
    } catch (e) { console.error(e); }
  }, [upsert]);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [loadDashboardData, user?.id]);

  const value = useMemo(() => ({
    appraisals, submitAppraisal, updateAppraisalStatus,
    getAppraisalsForSupervisor, getAppraisalByUser,
    getAppraisalsForCounterSigner, counterSignAppraisal, returnFromCounterSigner,
    getLatestAppraisalForUser, getScoreTrendForUser, getLeaderboard,
    getDeptCompliance, getPendingCountForSupervisor,
    loadSupervisorQueue, loadCounterQueue,
  }), [appraisals, submitAppraisal, updateAppraisalStatus,
      getAppraisalsForSupervisor, getAppraisalByUser,
      getAppraisalsForCounterSigner, counterSignAppraisal, returnFromCounterSigner,
      getLatestAppraisalForUser, getScoreTrendForUser, getLeaderboard,
      getDeptCompliance, getPendingCountForSupervisor,
      loadSupervisorQueue, loadCounterQueue]);

  return <AppraisalContext.Provider value={value}>{children}</AppraisalContext.Provider>;
};

export const useAppraisals = () => {
  const ctx = useContext(AppraisalContext);
  if (!ctx) throw new Error('useAppraisals must be used within AppraisalProvider');
  return ctx;
};
