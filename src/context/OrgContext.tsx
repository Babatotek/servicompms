import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { PERFORMANCE_TEMPLATES, PerformanceTemplate, TemplateKRA, TemplateObjective, TemplateKPI } from '../lib/performanceTemplates';
import { Department, MPMSCategory, MPMSKRA, MPMSObjective, MPMSKPI, MPMSAchievement } from '../types';
import { DEPARTMENTS } from '../constants';
import { MPMS_CATEGORIES, MPMS_KRAS, MPMS_OBJECTIVES, MPMS_KPIS } from '../lib/mpmsSeed';

interface OrgContextType {
  departments: Department[];
  templates: PerformanceTemplate[];
  
  // MPMS Library
  mpmsCategories: MPMSCategory[];
  mpmsKRAs: MPMSKRA[];
  mpmsObjectives: MPMSObjective[];
  mpmsKPIs: MPMSKPI[];
  mpmsAchievements: MPMSAchievement[];

  addDepartment: (dept: Omit<Department, 'id'>) => Department;
  addTemplate: (template: Omit<PerformanceTemplate, 'id'>) => PerformanceTemplate;
  updateTemplate: (id: string, partial: Partial<PerformanceTemplate>) => void;
  deleteTemplate: (id: string) => void;
  
  // MPMS Methods
  updateMPMSAchievement: (achievement: MPMSAchievement) => void;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

const DEPT_KEY = 'servicom_departments_v3';
const TMPL_KEY = 'servicom_templates_v3';
const MPMS_ACHIEVE_KEY = 'servicom_mpms_achievements_v2';

const INITIAL_DEPTS: Department[] = DEPARTMENTS.map(d => ({
  ...d,
  isActive: true
}));

const load = <T,>(key: string, fallback: T): T => {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
  catch { return fallback; }
};

// Async write — yields to main thread, catches QuotaExceededError.
const save = (key: string, val: unknown) => {
  setTimeout(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.warn(`[OrgContext] localStorage quota exceeded for key "${key}" — held in memory only.`);
      }
    }
  }, 0);
};

export const OrgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departments, setDepartments] = useState<Department[]>(() => load(DEPT_KEY, INITIAL_DEPTS));
  const [templates, setTemplates] = useState<PerformanceTemplate[]>(() => load(TMPL_KEY, PERFORMANCE_TEMPLATES));
  
  // MPMS State (Library is currently read-only seed, achievements are persistent)
  const [mpmsCategories] = useState<MPMSCategory[]>(MPMS_CATEGORIES);
  const [mpmsKRAs] = useState<MPMSKRA[]>(MPMS_KRAS);
  const [mpmsObjectives] = useState<MPMSObjective[]>(MPMS_OBJECTIVES);
  const [mpmsKPIs] = useState<MPMSKPI[]>(MPMS_KPIS);
  const [mpmsAchievements, setMpmsAchievements] = useState<MPMSAchievement[]>(() => load(MPMS_ACHIEVE_KEY, []));

  const addDepartment = useCallback((dept: Omit<Department, 'id'>) => {
    const newDept: Department = { ...dept, id: `d_${Date.now()}` };
    setDepartments(prev => { const next = [...prev, newDept]; save(DEPT_KEY, next); return next; });
    return newDept;
  }, []);

  const addTemplate = useCallback((tmpl: Omit<PerformanceTemplate, 'id'>) => {
    const newTmpl: PerformanceTemplate = { ...tmpl, id: `tmpl_${Date.now()}` };
    setTemplates(prev => { const next = [...prev, newTmpl]; save(TMPL_KEY, next); return next; });
    return newTmpl;
  }, []);

  const updateTemplate = useCallback((id: string, partial: Partial<PerformanceTemplate>) => {
    setTemplates(prev => {
      const next = prev.map(t => t.id === id ? { ...t, ...partial } : t);
      save(TMPL_KEY, next); return next;
    });
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => { const next = prev.filter(t => t.id !== id); save(TMPL_KEY, next); return next; });
  }, []);

  const updateMPMSAchievement = useCallback((achievement: MPMSAchievement) => {
    setMpmsAchievements(prev => {
      const existing = prev.findIndex(a => a.kpiId === achievement.kpiId && a.year === achievement.year);
      let next;
      if (existing >= 0) {
        next = [...prev];
        next[existing] = achievement;
      } else {
        next = [...prev, achievement];
      }
      save(MPMS_ACHIEVE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    departments,
    templates,
    mpmsCategories,
    mpmsKRAs,
    mpmsObjectives,
    mpmsKPIs,
    mpmsAchievements,
    addDepartment,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    updateMPMSAchievement,
  }), [
    departments, templates, mpmsCategories, mpmsKRAs, mpmsObjectives, mpmsKPIs, 
    mpmsAchievements, addDepartment, addTemplate, updateTemplate, deleteTemplate, 
    updateMPMSAchievement
  ]);

  return (
    <OrgContext.Provider value={value}>
      {children}
    </OrgContext.Provider>
  );
};

export const useOrg = () => {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error('useOrg must be used within OrgProvider');
  return ctx;
};
