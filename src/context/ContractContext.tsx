import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { ContractStatus } from '../types';
import { TemplateKRA } from '../lib/performanceTemplates';

export interface ContractRecord {
  id: string;
  userId: string;
  ippisNo: string;
  userName: string;
  designation: string;
  departmentId: string;
  supervisorId: string;
  templateId: string;
  year: number;
  status: ContractStatus;
  kras: TemplateKRA[];
  submittedAt: string;
  supervisorComment?: string;
  supervisorId_reviewer?: string;
  reviewedAt?: string;
}

interface ContractContextType {
  contracts: ContractRecord[];
  submitContract: (record: ContractRecord) => void;
  approveContract: (id: string, comment?: string) => void;
  returnContract: (id: string, comment: string) => void;
  getContractByUser: (userId: string, year: number) => ContractRecord | undefined;
  getContractsForSupervisor: (supervisorId: string) => ContractRecord[];
  getPendingContractCount: (supervisorId: string) => number;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

const STORAGE_KEY = 'servicom_contracts';

const load = (): ContractRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const persist = (records: ContractRecord[]) => {
  setTimeout(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); }
    catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError')
        console.warn('[ContractContext] localStorage quota exceeded.');
    }
  }, 0);
};

export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contracts, setContracts] = useState<ContractRecord[]>(load);

  const submitContract = useCallback((record: ContractRecord) => {
    setContracts(prev => {
      const idx = prev.findIndex(c => c.userId === record.userId && c.year === record.year);
      const next = idx >= 0 ? prev.map((c, i) => i === idx ? record : c) : [...prev, record];
      persist(next);
      // Also write the active_contract snapshot so AppraisalForm can read it
      if (record.status === ContractStatus.ACTIVE) {
        localStorage.setItem(`active_contract_${record.ippisNo}`, JSON.stringify({
          id: record.id,
          userId: record.ippisNo,
          templateId: record.templateId,
          year: record.year,
          status: ContractStatus.ACTIVE,
          approvedAt: record.reviewedAt ?? new Date().toISOString(),
          kras: record.kras,
        }));
      }
      return next;
    });
  }, []);

  const approveContract = useCallback((id: string, comment?: string) => {
    setContracts(prev => {
      const next = prev.map(c => {
        if (c.id !== id) return c;
        const updated: ContractRecord = {
          ...c,
          status: ContractStatus.ACTIVE,
          supervisorComment: comment,
          reviewedAt: new Date().toISOString(),
        };
        // Write active_contract snapshot for AppraisalForm
        localStorage.setItem(`active_contract_${c.ippisNo}`, JSON.stringify({
          id: updated.id,
          userId: c.ippisNo,
          templateId: c.templateId,
          year: c.year,
          status: ContractStatus.ACTIVE,
          approvedAt: updated.reviewedAt,
          kras: c.kras,
        }));
        return updated;
      });
      persist(next);
      return next;
    });
  }, []);

  const returnContract = useCallback((id: string, comment: string) => {
    setContracts(prev => {
      const next = prev.map(c => c.id !== id ? c : {
        ...c,
        status: ContractStatus.RETURNED,
        supervisorComment: comment,
        reviewedAt: new Date().toISOString(),
      });
      persist(next);
      return next;
    });
  }, []);

  const getContractByUser = useCallback((userId: string, year: number) =>
    contracts.find(c => c.userId === userId && c.year === year),
  [contracts]);

  const getContractsForSupervisor = useCallback((supervisorId: string) =>
    contracts.filter(c => c.supervisorId === supervisorId),
  [contracts]);

  const getPendingContractCount = useCallback((supervisorId: string) =>
    contracts.filter(c => c.supervisorId === supervisorId && c.status === ContractStatus.PENDING_APPROVAL).length,
  [contracts]);

  const value = useMemo(() => ({
    contracts,
    submitContract,
    approveContract,
    returnContract,
    getContractByUser,
    getContractsForSupervisor,
    getPendingContractCount,
  }), [contracts, submitContract, approveContract, returnContract, getContractByUser, getContractsForSupervisor, getPendingContractCount]);

  return <ContractContext.Provider value={value}>{children}</ContractContext.Provider>;
};

export const useContracts = () => {
  const ctx = useContext(ContractContext);
  if (!ctx) throw new Error('useContracts must be used within ContractProvider');
  return ctx;
};
