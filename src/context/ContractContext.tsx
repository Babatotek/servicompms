import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { ContractStatus } from '../types';
import { TemplateKRA } from '../lib/performanceTemplates';
import { contractApi } from '../lib/api';

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
  appraiseeComments?: string;
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
  // API-backed actions
  loadContractsForSupervisor: () => Promise<void>;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

/** Map backend contract payload → ContractRecord */
function mapContract(raw: any): ContractRecord {
  const statusMap: Record<string, ContractStatus> = {
    draft:           ContractStatus.DRAFT,
    submitted:       ContractStatus.DRAFT,
    pending_approval:ContractStatus.PENDING_APPROVAL,
    approved:        ContractStatus.APPROVED,
    active:          ContractStatus.ACTIVE,
    returned:        ContractStatus.RETURNED,
  };
  return {
    id:              String(raw.id),
    userId:          String(raw.user_id),
    ippisNo:         raw.user?.ippis_no ?? '',
    userName:        raw.user?.full_name ?? '',
    designation:     raw.user?.designation ?? '',
    departmentId:    raw.user?.department_id ?? '',
    supervisorId:    raw.supervisor_id ? String(raw.supervisor_id) : '',
    templateId:      String(raw.template_id),
    year:            raw.year,
    status:          statusMap[raw.status] ?? ContractStatus.DRAFT,
    kras:            raw.kras ?? [],
    submittedAt:     raw.submitted_at ?? new Date().toISOString(),
    appraiseeComments: raw.appraisee_comments ?? undefined,
    supervisorComment: raw.supervisor_comment ?? undefined,
    reviewedAt:      raw.reviewed_at ?? undefined,
  };
}

export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contracts, setContracts] = useState<ContractRecord[]>([]);

  const upsert = (record: ContractRecord) => {
    setContracts(prev => {
      const idx = prev.findIndex(c => c.id === record.id);
      return idx >= 0 ? prev.map((c, i) => i === idx ? record : c) : [...prev, record];
    });
  };

  const submitContract = useCallback((record: ContractRecord) => {
    upsert(record);
    // Persist active contract snapshot for AppraisalForm (keep localStorage bridge)
    if (record.status === ContractStatus.ACTIVE) {
      localStorage.setItem(`active_contract_${record.ippisNo}`, JSON.stringify({
        id: record.id, userId: record.ippisNo, templateId: record.templateId,
        year: record.year, status: ContractStatus.ACTIVE,
        approvedAt: record.reviewedAt ?? new Date().toISOString(), kras: record.kras,
      }));
    }
    // Submit to backend
    contractApi.submit(Number(record.id)).catch(console.error);
  }, []);

  const approveContract = useCallback((id: string, comment?: string) => {
    setContracts(prev => prev.map(c => c.id !== id ? c : {
      ...c, status: ContractStatus.ACTIVE,
      supervisorComment: comment, reviewedAt: new Date().toISOString(),
    }));
    contractApi.approve(Number(id), comment).catch(console.error);
  }, []);

  const returnContract = useCallback((id: string, comment: string) => {
    setContracts(prev => prev.map(c => c.id !== id ? c : {
      ...c, status: ContractStatus.RETURNED,
      supervisorComment: comment, reviewedAt: new Date().toISOString(),
    }));
    contractApi.return(Number(id), comment).catch(console.error);
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

  /** Fetch pending contracts from API for the supervisor queue */
  const loadContractsForSupervisor = useCallback(async () => {
    try {
      const res = await contractApi.pending();
      const mapped = (res?.data ?? []).map(mapContract);
      setContracts(prev => {
        const ids = new Set(mapped.map((c: ContractRecord) => c.id));
        return [...prev.filter(c => !ids.has(c.id)), ...mapped];
      });
    } catch (e) { console.error(e); }
  }, []);

  const value = useMemo(() => ({
    contracts, submitContract, approveContract, returnContract,
    getContractByUser, getContractsForSupervisor, getPendingContractCount,
    loadContractsForSupervisor,
  }), [contracts, submitContract, approveContract, returnContract,
      getContractByUser, getContractsForSupervisor, getPendingContractCount,
      loadContractsForSupervisor]);

  return <ContractContext.Provider value={value}>{children}</ContractContext.Provider>;
};

export const useContracts = () => {
  const ctx = useContext(ContractContext);
  if (!ctx) throw new Error('useContracts must be used within ContractProvider');
  return ctx;
};
