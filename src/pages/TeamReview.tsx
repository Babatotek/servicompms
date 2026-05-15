import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, CheckCircle2, XCircle, Clock, MessageSquare,
  Search, Activity, Award, ChevronRight, AlertTriangle, FileText,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { useAppraisals } from '../context/AppraisalContext';
import { useContracts, ContractRecord } from '../context/ContractContext';
import { AppraisalStatus, ContractStatus } from '../types';
import { useNotifications } from '../context/NotificationContext';

export const TeamReview: React.FC = () => {
  const { user } = useAuth();
  const { getAppraisalsForSupervisor, getAppraisalsForCounterSigner, updateAppraisalStatus, counterSignAppraisal, returnFromCounterSigner, loadSupervisorQueue, loadCounterQueue } = useAppraisals();
  const { getContractsForSupervisor, approveContract, returnContract, loadContractsForSupervisor } = useContracts();
  const { addNotification, notifyUser } = useNotifications();

  // Load queues from API on mount
  useEffect(() => {
    loadSupervisorQueue();
    loadCounterQueue();
    loadContractsForSupervisor();
  }, []);

  const [selectedAppraisal, setSelectedAppraisal] = useState<any>(null);
  const [selectedContract, setSelectedContract] = useState<ContractRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [supervisorComment, setSupervisorComment] = useState('');
  const [supervisorRating, setSupervisorRating] = useState(0);
  const [counterComment, setCounterComment] = useState('');
  const [contractComment, setContractComment] = useState('');
  const [activeTab, setActiveTab] = useState<'supervisor' | 'counter' | 'contracts'>('supervisor');

  const allAppraisals = getAppraisalsForSupervisor(user?.id ?? '');
  const pendingAppraisals = allAppraisals.filter(a => a.status === AppraisalStatus.SUBMITTED || a.status === AppraisalStatus.UNDER_REVIEW);
  const counterQueue = getAppraisalsForCounterSigner(user?.id ?? '');
  const allContracts = getContractsForSupervisor(user?.id ?? '');
  const pendingContracts = allContracts.filter(c => c.status === ContractStatus.PENDING_APPROVAL);

  const filteredPending = pendingAppraisals.filter(a => a.userName.toLowerCase().includes(searchQuery.toLowerCase()) || a.departmentId.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredCounter = counterQueue.filter(a => a.userName.toLowerCase().includes(searchQuery.toLowerCase()) || a.departmentId.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredContracts = pendingContracts.filter(c => c.userName.toLowerCase().includes(searchQuery.toLowerCase()) || c.departmentId.toLowerCase().includes(searchQuery.toLowerCase()));

  // ── Appraisal handlers ────────────────────────────────────────────────────
  const handleApprove = (id: string) => {
    if (!supervisorComment.trim()) { addNotification('warning', 'Comment Required', 'Please enter a supervisor comment before approving.'); return; }
    updateAppraisalStatus(id, AppraisalStatus.APPROVED, supervisorComment, supervisorRating);
    addNotification('success', 'Appraisal Approved', 'Approved and forwarded to counter-signing officer.');
    notifyUser(selectedAppraisal.userId, 'success', 'Appraisal Approved', 'Your appraisal has been approved and forwarded for counter-signing.');
    if (selectedAppraisal.counterSignerId) notifyUser(selectedAppraisal.counterSignerId, 'info', 'Counter-Sign Required', `${selectedAppraisal.userName}'s appraisal awaits your counter-signature.`);
    setSelectedAppraisal(null); setSupervisorComment(''); setSupervisorRating(0);
  };

  const handleReturn = (id: string) => {
    if (!supervisorComment.trim()) { addNotification('warning', 'Comment Required', 'Please state the reason for returning.'); return; }
    updateAppraisalStatus(id, AppraisalStatus.RETURNED, supervisorComment);
    addNotification('info', 'Appraisal Returned', 'Returned to staff for revision.');
    notifyUser(selectedAppraisal.userId, 'warning', 'Appraisal Returned', 'Your appraisal was returned. Review comments and resubmit.');
    setSelectedAppraisal(null); setSupervisorComment('');
  };

  const handleCounterSign = (id: string) => {
    if (!counterComment.trim()) { addNotification('warning', 'Comment Required', 'Please enter counter-signing remarks.'); return; }
    counterSignAppraisal(id, counterComment);
    addNotification('success', 'Appraisal Counter-Signed', 'Fully counter-signed and complete.');
    notifyUser(selectedAppraisal.userId, 'success', 'Appraisal Fully Approved', 'Your appraisal has been counter-signed. Final grade recorded.');
    notifyUser(selectedAppraisal.supervisorId, 'info', 'Counter-Sign Complete', `${selectedAppraisal.userName}'s appraisal has been finalised.`);
    setSelectedAppraisal(null); setCounterComment('');
  };

  const handleReturnFromCounter = (id: string) => {
    if (!counterComment.trim()) { addNotification('warning', 'Comment Required', 'Please state the reason for returning.'); return; }
    returnFromCounterSigner(id, counterComment);
    addNotification('info', 'Appraisal Returned', 'Returned to supervisor for revision.');
    notifyUser(selectedAppraisal.supervisorId, 'warning', 'Returned by Counter-Signer', `${selectedAppraisal.userName}'s appraisal was returned. Please review and resubmit.`);
    setSelectedAppraisal(null); setCounterComment('');
  };

  // ── Contract handlers ─────────────────────────────────────────────────────
  const handleApproveContract = (id: string) => {
    approveContract(id, contractComment || undefined);
    addNotification('success', 'Contract Approved', 'Performance contract is now active.');
    if (selectedContract) notifyUser(selectedContract.userId, 'success', 'Contract Approved', 'Your 2026 performance contract has been approved and is now active.');
    setSelectedContract(null); setContractComment('');
  };

  const handleReturnContract = (id: string) => {
    if (!contractComment.trim()) { addNotification('warning', 'Comment Required', 'Please state the reason for returning this contract.'); return; }
    returnContract(id, contractComment);
    addNotification('info', 'Contract Returned', 'Contract returned to staff for revision.');
    if (selectedContract) notifyUser(selectedContract.userId, 'warning', 'Contract Returned', `Your performance contract was returned: ${contractComment}`);
    setSelectedContract(null); setContractComment('');
  };

  const switchTab = (tab: 'supervisor' | 'counter' | 'contracts') => {
    setActiveTab(tab); setSelectedAppraisal(null); setSelectedContract(null); setSearchQuery('');
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Submissions',       value: `${allAppraisals.length} Staff`,    icon: <Users size={20} />,     color: 'bg-primary-50 text-primary-600', hover: 'hover:border-primary-100', accent: 'text-slate-900' },
          { label: 'Pending Review',    value: `${pendingAppraisals.length} New`,  icon: <Clock size={20} />,     color: 'bg-amber-50 text-amber-600',   hover: 'hover:border-amber-100',   accent: pendingAppraisals.length > 0 ? 'text-amber-600' : 'text-slate-900' },
          { label: 'Counter-Sign',      value: `${counterQueue.length} Pending`,   icon: <CheckCircle2 size={20}/>,color: 'bg-green-50 text-green-600',   hover: 'hover:border-green-100',   accent: counterQueue.length > 0 ? 'text-green-600' : 'text-slate-900' },
          { label: 'Contracts Pending', value: `${pendingContracts.length} New`,   icon: <FileText size={20} />,  color: 'bg-indigo-50 text-indigo-600', hover: 'hover:border-indigo-100',  accent: pendingContracts.length > 0 ? 'text-indigo-600' : 'text-slate-900' },
        ].map((s, i) => (
          <div key={i} className={cn('bg-white border border-slate-100 rounded-2xl p-3 sm:p-4 flex items-center gap-3 transition-all', s.hover)}>
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', s.color)}>{s.icon}</div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
              <p className={cn('text-base sm:text-xl font-black tracking-tighter uppercase italic leading-none truncate', s.accent)}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex flex-wrap gap-2 bg-white border border-slate-100 rounded-xl p-1.5 w-fit shadow-sm">
        {([
          { key: 'supervisor', label: 'Supervisor Queue',  icon: <Users size={13} />,       badge: pendingAppraisals.length, badgeColor: 'bg-amber-100 text-amber-700' },
          { key: 'counter',    label: 'Counter-Sign',      icon: <CheckCircle2 size={13} />, badge: counterQueue.length,      badgeColor: 'bg-green-100 text-green-700' },
          { key: 'contracts',  label: 'Contracts',         icon: <FileText size={13} />,     badge: pendingContracts.length,  badgeColor: 'bg-indigo-100 text-indigo-700' },
        ] as const).map(t => (
          <button key={t.key} onClick={() => switchTab(t.key)}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all',
              activeTab === t.key ? 'bg-primary-950 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50')}>
            {t.icon} {t.label}
            {t.badge > 0 && (
              <span className={cn('px-1.5 py-0.5 rounded-full text-[9px] font-black', activeTab === t.key ? 'bg-white/20 text-white' : t.badgeColor)}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Sidebar queue */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
              {activeTab === 'supervisor' ? 'Review Queue' : activeTab === 'counter' ? 'Counter-Sign Queue' : 'Contract Queue'}
            </p>
            <Badge variant="primary" size="sm">
              {activeTab === 'supervisor' ? pendingAppraisals.length : activeTab === 'counter' ? counterQueue.length : pendingContracts.length} Pending
            </Badge>
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search staff..."
              className="w-full bg-white border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-[11px] font-black text-slate-900 placeholder:text-slate-400 focus:border-primary-200 focus:outline-none transition-all uppercase tracking-widest"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="space-y-2">
            {activeTab === 'contracts' ? (
              filteredContracts.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center">
                  <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest italic">No contracts pending approval.</p>
                </div>
              ) : filteredContracts.map(c => (
                <motion.div key={c.id} whileHover={{ x: 4 }}
                  onClick={() => { setSelectedContract(c); setContractComment(''); }}
                  className={cn('p-4 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden',
                    selectedContract?.id === c.id ? 'bg-primary-950 border-primary-950 text-white shadow-lg' : 'bg-white border-slate-100 hover:border-primary-200 hover:shadow-sm')}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0 flex-1 pr-2">
                      <h4 className="font-black text-sm tracking-tight uppercase italic leading-none truncate">{c.userName}</h4>
                      <p className={cn('text-[9px] font-black uppercase tracking-widest mt-1 opacity-60 truncate', selectedContract?.id === c.id ? 'text-white' : 'text-slate-500')}>
                        {c.departmentId.replace('dept_', '')} &middot; {c.year}
                      </p>
                    </div>
                    <Badge variant={selectedContract?.id === c.id ? 'primary' : 'default'} size="sm"
                      className={selectedContract?.id === c.id ? 'bg-white/20 text-white border-transparent flex-shrink-0' : 'flex-shrink-0'}>
                      {c.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest opacity-50">
                    <Clock size={11} /> {new Date(c.submittedAt).toLocaleDateString()}
                  </div>
                  {selectedContract?.id === c.id && <div className="absolute top-0 right-0 p-3 opacity-[0.05]"><FileText size={80} /></div>}
                </motion.div>
              ))
            ) : (
              (activeTab === 'supervisor' ? filteredPending : filteredCounter).length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center">
                  <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest italic">
                    {activeTab === 'supervisor' ? (allAppraisals.length === 0 ? 'No appraisals submitted yet.' : 'No pending reviews.') : 'No appraisals awaiting counter-signature.'}
                  </p>
                </div>
              ) : (activeTab === 'supervisor' ? filteredPending : filteredCounter).map(item => (
                <motion.div key={item.id} whileHover={{ x: 4 }}
                  onClick={() => { setSelectedAppraisal(item); setSupervisorComment(''); setSupervisorRating(0); setCounterComment(''); }}
                  className={cn('p-4 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden',
                    selectedAppraisal?.id === item.id ? 'bg-primary-950 border-primary-950 text-white shadow-lg' : 'bg-white border-slate-100 hover:border-primary-200 hover:shadow-sm')}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="min-w-0 flex-1 pr-2">
                      <h4 className="font-black text-sm tracking-tight uppercase italic leading-none truncate">{item.userName}</h4>
                      <p className={cn('text-[9px] font-black uppercase tracking-widest mt-1 opacity-60 truncate', selectedAppraisal?.id === item.id ? 'text-white' : 'text-slate-500')}>
                        {item.departmentId} &middot; {item.period}
                      </p>
                    </div>
                    <Badge variant={selectedAppraisal?.id === item.id ? 'primary' : 'default'} size="sm"
                      className={selectedAppraisal?.id === item.id ? 'bg-white/20 text-white border-transparent flex-shrink-0' : 'flex-shrink-0'}>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest opacity-50">
                      <Clock size={11} /> {new Date(item.submittedAt).toLocaleDateString()}
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-40 italic">Score</p>
                      <p className="text-xl font-black font-mono leading-none italic">{item.scores.grandTotal.toFixed(1)}%</p>
                    </div>
                  </div>
                  {selectedAppraisal?.id === item.id && <div className="absolute top-0 right-0 p-3 opacity-[0.05]"><Award size={80} /></div>}
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {/* ── Contract detail ── */}
            {activeTab === 'contracts' && selectedContract ? (
              <motion.div key="contract-detail" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                <Card className="p-0 overflow-hidden flex flex-col rounded-2xl border-slate-100">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-950 flex items-center justify-center text-white font-black text-xl italic shadow-lg flex-shrink-0">
                        {selectedContract.userName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-black text-slate-900 tracking-tight uppercase italic leading-none">{selectedContract.userName}</h3>
                          <Badge variant="primary" size="sm">{selectedContract.status}</Badge>
                        </div>
                        <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-1 italic">2026 Performance Contract</p>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5 italic">
                          {selectedContract.designation} &middot; {selectedContract.departmentId.replace('dept_', '').toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="bg-slate-100 rounded-xl px-4 py-2 text-center flex-shrink-0">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">KRAs</p>
                      <p className="text-xl font-black text-slate-900 font-mono tracking-tighter italic">{selectedContract.kras.length}</p>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-420px)]">
                    {/* KRA summary */}
                    <div className="space-y-2">
                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">
                        <Activity size={12} className="text-indigo-500" /> KRA Framework
                      </h4>
                      {selectedContract.kras.map(kra => (
                        <div key={kra.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-xs font-black text-slate-700 uppercase italic tracking-tight">{kra.name}</span>
                          <span className="text-sm font-black text-slate-900 font-mono">{kra.weight}%</span>
                        </div>
                      ))}
                    </div>

                    {/* Supervisor comment input */}
                    <section className="p-4 rounded-2xl bg-indigo-950 text-white space-y-3 relative overflow-hidden">
                      <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 italic">
                        <Activity size={14} /> Supervisor Review
                      </h4>
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-black text-indigo-200 uppercase tracking-widest opacity-70">Comments (optional)</p>
                        <textarea placeholder="Enter any feedback for the staff member..."
                          value={contractComment} onChange={e => setContractComment(e.target.value)} rows={3}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-medium text-white focus:bg-white/10 focus:outline-none transition-all placeholder:text-slate-600 resize-none" />
                      </div>
                      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
                    </section>
                  </div>

                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <button onClick={() => handleReturnContract(selectedContract.id)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-red-600 rounded-xl font-black text-[10px] hover:bg-red-50 hover:border-red-200 transition-all uppercase tracking-widest">
                      <XCircle size={15} /> Return for Revision
                    </button>
                    <button onClick={() => handleApproveContract(selectedContract.id)}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-700 text-white rounded-xl font-black text-[10px] hover:bg-indigo-800 transition-all shadow-lg active:scale-95 uppercase tracking-widest group">
                      <CheckCircle2 size={15} className="text-indigo-300" />
                      Approve Contract
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ) : activeTab !== 'contracts' && selectedAppraisal ? (
              /* ── Appraisal detail ── */
              <motion.div key="appraisal-detail" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                <Card className="p-0 overflow-hidden flex flex-col rounded-2xl border-slate-100">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary-950 flex items-center justify-center text-white font-black text-xl italic shadow-lg flex-shrink-0">
                        {selectedAppraisal.userName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-black text-slate-900 tracking-tight uppercase italic leading-none">{selectedAppraisal.userName}</h3>
                          <Badge variant="primary" size="sm">{selectedAppraisal.status}</Badge>
                        </div>
                        <p className="text-[10px] text-primary-600 font-black uppercase tracking-widest mt-1 italic">{selectedAppraisal.period} Appraisal</p>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5 italic">
                          IPPIS: {selectedAppraisal.ippisNo} &middot; {selectedAppraisal.designation}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <div className="bg-white border border-slate-100 rounded-xl px-4 py-2 text-center shadow-sm">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Self Score</p>
                        <p className="text-xl font-black text-slate-900 font-mono tracking-tighter italic">{selectedAppraisal.scores.grandTotal.toFixed(1)}%</p>
                      </div>
                      <div className="bg-primary-950 rounded-xl px-4 py-2 text-center shadow-lg">
                        <p className="text-[8px] font-black text-primary-300 uppercase tracking-widest leading-none mb-1 opacity-70">Tasks</p>
                        <p className="text-xl font-black text-white font-mono tracking-tighter italic">{selectedAppraisal.scores.kpiTotal.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-380px)]">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      <section className="space-y-2">
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">
                          <MessageSquare size={12} className="text-primary-400" /> Self-Appraisal Comments
                        </h4>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 min-h-[80px]">
                          <p className="text-xs text-slate-600 leading-relaxed italic">
                            {selectedAppraisal.comments?.appraiseeComments
                              ? `"${selectedAppraisal.comments.appraiseeComments}"`
                              : <span className="text-slate-400 not-italic">No comments provided.</span>}
                          </p>
                        </div>
                      </section>
                      <section className="space-y-2">
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">
                          <Activity size={12} className="text-indigo-500" /> Score Breakdown
                        </h4>
                        <div className="space-y-1.5">
                          {[
                            { label: 'Section 4 — Tasks (70%)',        value: selectedAppraisal.scores.kpiTotal.toFixed(1) + '%',    color: 'bg-indigo-50 border-indigo-100 text-indigo-700' },
                            { label: 'Section 5 — Competencies (20%)', value: selectedAppraisal.scores.competency.toFixed(1) + '%',  color: 'bg-green-50 border-green-100 text-green-700' },
                            { label: 'Section 6 — Operations (10%)',   value: selectedAppraisal.scores.opsScore.toFixed(1) + '%',    color: 'bg-amber-50 border-amber-100 text-amber-700' },
                            { label: 'Grand Total',                     value: selectedAppraisal.scores.grandTotal.toFixed(1) + '%', color: 'bg-primary-950 border-primary-900 text-white' },
                          ].map(row => (
                            <div key={row.label} className={cn('flex items-center justify-between px-3 py-2 rounded-xl border', row.color)}>
                              <span className="text-[9px] font-black uppercase tracking-widest">{row.label}</span>
                              <span className="text-sm font-black font-mono">{row.value}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>

                    {selectedAppraisal.supervisorComment && (
                      <section className="space-y-2">
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">
                          <Activity size={12} className="text-primary-400" /> Supervisor Commentary
                        </h4>
                        <div className="p-4 rounded-xl bg-primary-50 border border-primary-100">
                          <p className="text-xs text-primary-900 leading-relaxed italic">"{selectedAppraisal.supervisorComment}"</p>
                          {selectedAppraisal.supervisorRating && (
                            <p className="text-[9px] font-black text-primary-500 uppercase tracking-widest mt-2">Rating: {selectedAppraisal.supervisorRating}/5</p>
                          )}
                        </div>
                      </section>
                    )}

                    {activeTab === 'supervisor' ? (
                      <section className="p-4 rounded-2xl bg-primary-950 text-white space-y-4 relative overflow-hidden">
                        <h4 className="text-[9px] font-black text-primary-400 uppercase tracking-widest flex items-center gap-2 italic"><Activity size={14} /> Supervisor Validation</h4>
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <p className="text-[9px] font-black text-primary-200 uppercase tracking-widest opacity-70">Recommendation Commentary *</p>
                            <textarea placeholder="Enter mandatory professional feedback..." value={supervisorComment} onChange={e => setSupervisorComment(e.target.value)} rows={3}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-medium text-white focus:bg-white/10 focus:outline-none transition-all placeholder:text-slate-600 resize-none" />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <p className="text-[9px] font-black text-primary-200 uppercase tracking-widest opacity-70">Supervisor Rating (1-5)</p>
                              <div className="flex gap-2">
                                {[1,2,3,4,5].map(num => (
                                  <button key={num} onClick={() => setSupervisorRating(num)}
                                    className={cn('w-10 h-10 rounded-xl border flex items-center justify-center font-black text-sm transition-all active:scale-90',
                                      supervisorRating === num ? 'bg-primary-600 border-primary-500 text-white' : 'bg-white/5 border-white/10 hover:bg-primary-600')}>
                                    {num}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <p className="text-[9px] font-black text-primary-200 uppercase tracking-widest opacity-70">Promotability Index</p>
                              <select className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-black text-white focus:outline-none appearance-none cursor-pointer uppercase tracking-widest">
                                <option>High Potential</option><option>Steady Performer</option><option>Needs Guidance</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary-600/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
                      </section>
                    ) : (
                      <section className="p-4 rounded-2xl bg-green-950 text-white space-y-4 relative overflow-hidden">
                        <h4 className="text-[9px] font-black text-green-400 uppercase tracking-widest flex items-center gap-2 italic"><CheckCircle2 size={14} /> Counter-Signing Officer Validation</h4>
                        <div className="space-y-1.5">
                          <p className="text-[9px] font-black text-green-200 uppercase tracking-widest opacity-70">Counter-Sign Commentary *</p>
                          <textarea placeholder="Enter your counter-signing remarks..." value={counterComment} onChange={e => setCounterComment(e.target.value)} rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-medium text-white focus:bg-white/10 focus:outline-none transition-all placeholder:text-slate-600 resize-none" />
                        </div>
                        <div className="absolute top-0 right-0 w-48 h-48 bg-green-600/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
                      </section>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                    {activeTab === 'supervisor' ? (
                      <>
                        <button onClick={() => handleReturn(selectedAppraisal.id)}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-red-600 rounded-xl font-black text-[10px] hover:bg-red-50 hover:border-red-200 transition-all uppercase tracking-widest">
                          <XCircle size={15} /> Return for Revision
                        </button>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-black text-[10px] hover:border-primary-950 hover:text-primary-950 transition-all uppercase tracking-widest">
                            <AlertTriangle size={15} className="text-amber-500" /> Flag for NC
                          </button>
                          <button onClick={() => handleApprove(selectedAppraisal.id)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-950 text-white rounded-xl font-black text-[10px] hover:bg-primary-900 transition-all shadow-lg active:scale-95 uppercase tracking-widest group">
                            <CheckCircle2 size={15} className="text-green-400" /> Validate & Approve
                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleReturnFromCounter(selectedAppraisal.id)}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-red-600 rounded-xl font-black text-[10px] hover:bg-red-50 hover:border-red-200 transition-all uppercase tracking-widest">
                          <XCircle size={15} /> Return to Supervisor
                        </button>
                        <button onClick={() => handleCounterSign(selectedAppraisal.id)}
                          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-700 text-white rounded-xl font-black text-[10px] hover:bg-green-800 transition-all shadow-lg active:scale-95 uppercase tracking-widest group">
                          <CheckCircle2 size={15} className="text-green-300" /> Counter-Sign & Finalise
                          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </>
                    )}
                  </div>
                </Card>
              </motion.div>
            ) : (
              /* ── Empty state ── */
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center p-10 text-center min-h-[400px] group">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 mb-4 shadow-sm relative group-hover:scale-105 transition-transform">
                    {activeTab === 'contracts' ? <FileText size={32} /> : <Users size={32} />}
                    {(activeTab === 'supervisor' ? pendingAppraisals.length : activeTab === 'counter' ? counterQueue.length : pendingContracts.length) > 0 && (
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-black text-sm animate-bounce shadow-lg border-2 border-white">!</div>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2 tracking-tight uppercase italic">
                    {activeTab === 'contracts' ? 'Select a Contract' : 'Select a Review'}
                  </h3>
                  <p className="text-[10px] text-slate-400 max-w-xs font-black uppercase italic tracking-widest leading-relaxed opacity-70">
                    {activeTab === 'supervisor' ? 'Choose a team member from the queue to review their appraisal.'
                      : activeTab === 'counter' ? 'Choose an appraisal from the counter-sign queue to finalise.'
                      : 'Choose a contract from the queue to approve or return.'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
