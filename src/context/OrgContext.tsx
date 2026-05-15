import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { PERFORMANCE_TEMPLATES, PerformanceTemplate } from '../lib/performanceTemplates';
import { Department, MPMSCategory, MPMSKRA, MPMSObjective, MPMSKPI, MPMSAchievement } from '../types';
import { DEPARTMENTS } from '../constants';
import { MPMS_CATEGORIES, MPMS_KRAS, MPMS_OBJECTIVES, MPMS_KPIS } from '../lib/mpmsSeed';
import { adminApi, mpmsApi } from '../lib/api';
import { useAuth } from './AuthContext';

interface OrgContextType {
  departments: Department[];
  templates: PerformanceTemplate[];
  mpmsCategories: MPMSCategory[];
  mpmsKRAs: MPMSKRA[];
  mpmsObjectives: MPMSObjective[];
  mpmsKPIs: MPMSKPI[];
  mpmsAchievements: MPMSAchievement[];
  addDepartment: (dept: Omit<Department, 'id'>) => Department;
  addTemplate: (template: Omit<PerformanceTemplate, 'id'>) => PerformanceTemplate;
  updateTemplate: (id: string, partial: Partial<PerformanceTemplate>) => void;
  deleteTemplate: (id: string) => void;
  updateMPMSAchievement: (achievement: MPMSAchievement) => void;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

// Fallback to seed data while API loads
const INITIAL_DEPTS: Department[] = DEPARTMENTS.map(d => ({ ...d, isActive: true, staffCount: 0 }));

export const OrgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth(); // re-fetch when user logs in/out
  const [departments, setDepartments]           = useState<Department[]>(INITIAL_DEPTS);
  const [templates, setTemplates]               = useState<PerformanceTemplate[]>(PERFORMANCE_TEMPLATES);
  const [mpmsAchievements, setMpmsAchievements] = useState<MPMSAchievement[]>([]);

  // MPMS library is static seed data
  const mpmsCategories = MPMS_CATEGORIES;
  const mpmsKRAs       = MPMS_KRAS;
  const mpmsObjectives = MPMS_OBJECTIVES;
  const mpmsKPIs       = MPMS_KPIS;

  // Load departments from API — only when authenticated, keyed on user ID not object reference
  useEffect(() => {
    if (!user?.id) return;
    adminApi.departments()
      .then(res => {
        if (res?.data?.length) {
          setDepartments(res.data.map((d: any) => ({
            id:          d.id,
            name:        d.name,
            code:        d.code,
            headUserId:  d.head_user_id ? String(d.head_user_id) : undefined,
            unitWeight:  d.unit_weight,
            staffCount:  d.staff_count ?? 0,
            isActive:    d.is_active,
          })));
        }
      })
      .catch(() => { /* keep seed fallback */ });
  }, [user?.id]); // stable primitive — won't re-fire on every render

  const addDepartment = useCallback((dept: Omit<Department, 'id'>) => {
    const newDept: Department = { ...dept, id: `d_${Date.now()}` };
    setDepartments(prev => [...prev, newDept]);
    adminApi.createDepartment({
      id:           newDept.id,
      name:         newDept.name,
      code:         newDept.code,
      unit_weight:  newDept.unitWeight,
      staff_count:  (newDept as any).staffCount ?? 0,
    }).catch(console.error);
    return newDept;
  }, []);

  const addTemplate = useCallback((tmpl: Omit<PerformanceTemplate, 'id'>) => {
    const newTmpl: PerformanceTemplate = { ...tmpl, id: `tmpl_${Date.now()}` };
    setTemplates(prev => [...prev, newTmpl]);
    return newTmpl;
  }, []);

  const updateTemplate = useCallback((id: string, partial: Partial<PerformanceTemplate>) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...partial } : t));
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateMPMSAchievement = useCallback((achievement: MPMSAchievement) => {
    setMpmsAchievements(prev => {
      const idx = prev.findIndex(a => a.kpiId === achievement.kpiId && a.year === achievement.year);
      return idx >= 0
        ? prev.map((a, i) => i === idx ? achievement : a)
        : [...prev, achievement];
    });
    // Sync to backend
    mpmsApi.storeAchievement({
      kpi_id:            achievement.kpiId,
      year:              achievement.year,
      achievement_value: achievement.achievementValue,
    }).catch(console.error);
  }, []);

  const value = useMemo(() => ({
    departments, templates,
    mpmsCategories, mpmsKRAs, mpmsObjectives, mpmsKPIs, mpmsAchievements,
    addDepartment, addTemplate, updateTemplate, deleteTemplate, updateMPMSAchievement,
  }), [
    departments, templates, mpmsAchievements,
    addDepartment, addTemplate, updateTemplate, deleteTemplate, updateMPMSAchievement,
  ]);

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
};

export const useOrg = () => {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error('useOrg must be used within OrgProvider');
  return ctx;
};
