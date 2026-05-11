import React, { createContext, useContext, useState, useCallback } from 'react';
import { PERFORMANCE_TEMPLATES, PerformanceTemplate, TemplateKRA, TemplateObjective, TemplateKPI } from '../lib/performanceTemplates';

export interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  staffCount: number;
  createdAt: string;
}

interface OrgContextType {
  departments: Department[];
  templates: PerformanceTemplate[];
  addDepartment: (dept: Omit<Department, 'id' | 'createdAt'>) => Department;
  addTemplate: (template: Omit<PerformanceTemplate, 'id'>) => PerformanceTemplate;
  updateTemplate: (id: string, template: Partial<PerformanceTemplate>) => void;
  deleteTemplate: (id: string) => void;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

const DEPT_KEY = 'servicom_departments';
const TMPL_KEY = 'servicom_templates';

const INITIAL_DEPTS: Department[] = [
  { id: 'd_nc',    name: 'National Coordinator', code: 'NC',   head: 'Oladimeji Funmilayo', staffCount: 2,  createdAt: '2026-01-01' },
  { id: 'd_pa',    name: 'Public Awareness',     code: 'PA',   head: 'Ututah Emmanuel',    staffCount: 2,  createdAt: '2026-01-01' },
  { id: 'd_acct',  name: 'Accounts & Finance',   code: 'ACCT', head: 'Odumu Godwin',       staffCount: 3,  createdAt: '2026-01-01' },
  { id: 'd_admin', name: 'Admin & HR',            code: 'AHR',  head: 'Nawabua Chinyere',   staffCount: 8,  createdAt: '2026-01-01' },
  { id: 'd_audit', name: 'Internal Audit',        code: 'AUDIT',head: 'Vacant',             staffCount: 2,  createdAt: '2026-01-01' },
  { id: 'd_ict',   name: 'ICT',                   code: 'ICT',  head: 'Vacant',             staffCount: 1,  createdAt: '2026-01-01' },
  { id: 'd_ops',   name: 'Operations',            code: 'OPS',  head: 'Akinbodewa Ngozi',   staffCount: 13, createdAt: '2026-01-01' },
];

const load = <T,>(key: string, fallback: T): T => {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
  catch { return fallback; }
};
const save = (key: string, val: unknown) => localStorage.setItem(key, JSON.stringify(val));

export const OrgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departments, setDepartments] = useState<Department[]>(() => load(DEPT_KEY, INITIAL_DEPTS));
  const [templates, setTemplates] = useState<PerformanceTemplate[]>(() => load(TMPL_KEY, PERFORMANCE_TEMPLATES));

  const addDepartment = useCallback((dept: Omit<Department, 'id' | 'createdAt'>) => {
    const newDept: Department = { ...dept, id: `d_${Date.now()}`, createdAt: new Date().toISOString() };
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

  return (
    <OrgContext.Provider value={{ departments, templates, addDepartment, addTemplate, updateTemplate, deleteTemplate }}>
      {children}
    </OrgContext.Provider>
  );
};

export const useOrg = () => {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error('useOrg must be used within OrgProvider');
  return ctx;
};
