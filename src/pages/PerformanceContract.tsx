import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Save, 
  Send, 
  Target,
  User,
  Users,
  UserCheck,
  CheckCircle2,
  FileText,
  Fingerprint,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Calendar,
  Layout,
  ChevronRight,
  Search,
  XCircle,
  Activity,
  Award
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { ContractStatus } from '../types';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

import { PERFORMANCE_TEMPLATES, PerformanceTemplate } from '../lib/performanceTemplates';
import { useOrg } from '../context/OrgContext';


export const PerformanceContract: React.FC = () => {
  const { user } = useAuth();
  const { templates } = useOrg(); // live templates including any created by admin
  const [status, setStatus] = useState<ContractStatus>(ContractStatus.DRAFT);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PerformanceTemplate>(templates[0] ?? PERFORMANCE_TEMPLATES[0]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const savedContract = localStorage.getItem(`active_contract_${user?.ippisNo}`);
    if (savedContract) {
       const contract = JSON.parse(savedContract);
       // Search live templates first, then fall back to hardcoded
       const template = templates.find(t => t.id === contract.templateId) ?? PERFORMANCE_TEMPLATES.find(t => t.id === contract.templateId);
       if (template) setSelectedTemplate(template);
       setStatus(ContractStatus.ACTIVE);
    }

    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [user]);

  const handleSubmit = () => {
    setIsSubmitted(true);
    setStatus(ContractStatus.APPROVED);
    
    // Snapshot the full KRA tree at approval time so the appraisal
    // is never affected by future template edits (Gap 1 fix)
    localStorage.setItem(`active_contract_${user?.ippisNo}`, JSON.stringify({
       id: `PC-2026-${Math.floor(Math.random() * 1000)}`,
       userId: user?.ippisNo,
       templateId: selectedTemplate.id,
       year: 2026,
       status: ContractStatus.ACTIVE,
       approvedAt: new Date().toISOString(),
       kras: selectedTemplate.kras,  // ← full snapshot, not just templateId
    }));
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] bg-white rounded-[40px] border border-slate-100 shadow-premium p-6 sm:p-12 text-center overflow-hidden relative">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-primary-600 rounded-[32px] flex items-center justify-center text-white mb-8 shadow-heavy shadow-primary-600/20"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase italic">Contract Submitted!</h2>
        <p className="text-slate-500 max-w-md mx-auto font-black uppercase text-[10px] tracking-[0.25em] leading-relaxed italic">
          Your Performance Contract for 2026 has been submitted for supervisor review. 
          You will be notified once it is approved and active.
        </p>
        <button 
          onClick={() => setIsSubmitted(false)}
          className="mt-12 px-12 py-4 bg-primary-950 text-white rounded-2xl font-black text-xs hover:translate-y-[-2px] transition-all shadow-heavy shadow-primary-950/20 active:scale-95 uppercase tracking-widest"
        >
          Return to Dashboard
        </button>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl -mr-48 -mt-48" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-4 pb-16">
      {/* Template Selector Modal */}
      <AnimatePresence>
        {showTemplateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-heavy p-6 space-y-4"
            >
              <div className="flex justify-between items-center">
                 <h2 className="text-base font-black text-slate-900 tracking-tighter uppercase italic">Select KRA Template</h2>
                 <button onClick={() => setShowTemplateModal(false)} className="p-1.5 hover:bg-slate-50 rounded-xl transition-colors">
                    <XCircle className="text-slate-400" size={18} />
                 </button>
              </div>
              <div className="space-y-2">
                  {templates.map((temp) => (
                    <button 
                     key={temp.id}
                     onClick={() => { setSelectedTemplate(temp); setShowTemplateModal(false); }}
                     className={cn(
                       "w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left group",
                       selectedTemplate.id === temp.id 
                         ? "bg-primary-950 border-primary-950 text-white" 
                         : "bg-white border-slate-100 hover:border-slate-300"
                     )}
                    >
                     <div className="flex items-center gap-3">
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", selectedTemplate.id === temp.id ? "bg-white/10" : "bg-slate-50")}>
                           <Layout size={16} className={selectedTemplate.id === temp.id ? "text-indigo-400" : "text-slate-400"} />
                        </div>
                        <div>
                           <p className="text-sm font-black tracking-tight">{temp.name}</p>
                           <p className={cn("text-[10px] font-bold uppercase", selectedTemplate.id === temp.id ? "text-slate-400" : "text-slate-500")}>{temp.description}</p>
                        </div>
                     </div>
                     <ChevronRight size={16} className={cn("transition-transform group-hover:translate-x-1", selectedTemplate.id === temp.id ? "text-white" : "text-slate-400")} />
                   </button>
                 ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contract Actions Toolbar */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 rounded-xl px-4 py-2 flex items-center gap-2">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Fiscal Cycle</p>
            <p className="text-sm font-black text-slate-900 font-mono tracking-tighter leading-none italic">2026</p>
          </div>
          <div className="bg-primary-600 rounded-xl px-4 py-2 shadow-lg shadow-primary-600/20 flex items-center gap-2">
            <p className="text-[9px] font-black text-primary-100 uppercase tracking-widest leading-none">Status</p>
            <p className="text-sm font-black text-white font-mono uppercase leading-none italic">DRAFT</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowTemplateModal(true)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-900 px-4 py-2 rounded-xl font-black text-[11px] hover:translate-y-[-1px] transition-all shadow-sm active:scale-95 uppercase tracking-widest">
            <Layout size={13} className="text-primary-600" />
            <span>Switch Template</span>
          </button>
          <button onClick={handleSubmit} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2 rounded-xl font-black text-[11px] transition-all shadow-lg shadow-primary-600/30 active:scale-95 uppercase tracking-widest">
            <Send size={13} />
            <span>Submit Contract</span>
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-4">
        {/* Left Column */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400"><User size={14} /></div>
              <h2 className="text-xs font-black text-slate-900 tracking-tighter uppercase italic">Staff Profile</h2>
            </div>
            <div className="space-y-1.5">
              {[
                { label: 'Full Legal Name', value: `${user?.surname} ${user?.firstname}`.toUpperCase(), icon: <User size={10} /> },
                { label: 'IPPIS Identifier', value: user?.ippisNo, icon: <Fingerprint size={10} /> },
                { label: 'Designation', value: user?.designation.toUpperCase(), icon: <Briefcase size={10} /> },
                { label: 'Functional Unit', value: 'ACCOUNTS & FINANCE', icon: <MapPin size={10} /> }
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-0.5 px-3 py-2 rounded-lg bg-slate-50/50 border border-transparent hover:border-slate-100 hover:bg-white transition-all group">
                  <span className="text-[8px] font-black text-slate-400 flex items-center gap-1.5 uppercase tracking-[0.15em] leading-none group-hover:text-primary-500 transition-colors">
                    {item.icon} {item.label}
                  </span>
                  <span className="text-[11px] font-black text-slate-900 truncate uppercase">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 space-y-3 overflow-hidden relative">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-7 h-7 bg-primary-50 text-primary-500 rounded-lg flex items-center justify-center"><Users size={14} /></div>
              <h2 className="text-xs font-black text-slate-900 tracking-tighter uppercase italic">Hierarchy</h2>
            </div>
            <div className="relative pl-6 space-y-4">
              <div className="absolute left-[2px] top-2 bottom-2 w-0.5 bg-slate-100" />
              <div className="relative">
                <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-primary-950 border-2 border-white shadow-sm z-10" />
                <p className="text-[8px] font-black text-primary-500 uppercase tracking-widest mb-0.5 italic">Direct Reviewer</p>
                <p className="text-xs font-black text-slate-900 uppercase italic tracking-tight">DR. JANE SMITH</p>
                <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest italic opacity-70">Director of Accounts</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-slate-300 border-2 border-white z-10" />
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 italic">Counter-Signing</p>
                <p className="text-xs font-black text-slate-900 uppercase italic tracking-tight">HON. ABUBAKAR IDRIS</p>
                <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest italic opacity-70">Chief Executive Officer</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-9">
          <Card className="p-4 lg:p-6">
            {loading ? (
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <Skeleton className="w-9 h-9 rounded-xl" />
                    <div className="space-y-1.5"><Skeleton className="h-4 w-40" /><Skeleton className="h-2.5 w-28" /></div>
                  </div>
                  <Skeleton className="w-24 h-10 rounded-xl" />
                </div>
                {[1,2].map(i => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2 items-center"><Skeleton className="w-7 h-7 rounded-lg" /><Skeleton className="h-4 w-48" /></div>
                      <Skeleton className="w-14 h-7 rounded-lg" />
                    </div>
                    <div className="ml-8 space-y-2">
                      <Skeleton className="h-12 w-full rounded-xl" />
                      <Skeleton className="h-14 w-full rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            <>
              {/* KRA Framework Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-950 rounded-xl flex items-center justify-center text-white shadow-md">
                    <Target size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 tracking-tighter uppercase italic">KRA Framework</h2>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5 italic">Template: {selectedTemplate.name}</p>
                  </div>
                </div>
                <div className="bg-primary-50/50 border border-primary-100 rounded-xl px-4 py-2 flex items-center gap-3">
                  <p className="text-[9px] font-black text-primary-500 uppercase tracking-widest italic">Composite Allocation</p>
                  <p className="text-xl font-black text-slate-900 font-mono tracking-tighter italic">100%</p>
                </div>
              </div>

              <div className="space-y-5">
                {selectedTemplate.kras.map((kra) => (
                  <div key={kra.id} className="space-y-3">
                    {/* KRA row */}
                    <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-7 h-7 bg-primary-950 rounded-lg flex items-center justify-center text-white font-mono text-xs font-black flex-shrink-0">
                        {kra.serialNo}
                      </div>
                      <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase italic flex-1">{kra.name}</h3>
                      <div className="bg-primary-950 text-white rounded-lg px-3 py-1 flex-shrink-0">
                        <span className="text-[8px] font-black text-primary-300 uppercase tracking-widest mr-1 italic">Weight</span>
                        <span className="text-sm font-black font-mono italic">{kra.weight}%</span>
                      </div>
                    </div>

                    {/* Objectives */}
                    <div className="space-y-3 pl-0 sm:pl-8 relative">
                      <div className="absolute left-0 sm:left-3 top-0 bottom-2 w-0.5 bg-gradient-to-b from-primary-400/30 to-transparent rounded-full hidden sm:block" />

                      {kra.objectives.map((obj) => (
                        <div key={obj.id} className="space-y-2 relative">
                          <div className="absolute -left-5 sm:-left-[35px] top-2 w-2 h-2 rounded-full bg-primary-500 border-2 border-white shadow-sm z-10 hidden sm:block" />

                          <div className="flex flex-col xl:flex-row justify-between xl:items-start gap-2">
                            <div className="flex-1">
                              <p className="text-[8px] font-black text-primary-500 uppercase tracking-widest flex items-center gap-1 italic mb-1">
                                <Activity size={9} /> Strategic Objective
                              </p>
                              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-200 transition-all">
                                <p className="text-xs font-semibold text-slate-700 leading-relaxed italic">"{obj.description}"</p>
                              </div>
                            </div>
                            <div className="xl:text-right px-3 py-2 bg-primary-50/30 rounded-xl border border-primary-100/20 flex-shrink-0 flex xl:flex-col items-center xl:items-end gap-2">
                              <p className="text-[8px] font-black text-primary-400 uppercase tracking-widest italic leading-none">Graded wt.</p>
                              <p className="text-xl font-black text-primary-950 font-mono tracking-tighter italic">{obj.gradedWeight}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-1.5">
                            {obj.kpis.length > 0 ? obj.kpis.map((kpi) => (
                              <Card key={kpi.id} className="p-3 hover:shadow-sm transition-all group">
                                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-3">
                                  <div className="flex-1 space-y-0.5">
                                    <div className="flex items-center gap-1 text-[8px] font-black text-slate-400 uppercase tracking-widest italic leading-none">
                                      <Layout size={9} className="text-primary-300" />
                                      Performance Indicator (KPI)
                                    </div>
                                    <p className="text-xs font-black text-slate-900 group-hover:text-primary-600 transition-colors leading-snug uppercase italic tracking-tight">{kpi.description}</p>
                                  </div>
                                  <div className="flex items-center gap-3 flex-shrink-0">
                                    <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Target</p>
                                      <p className="text-sm font-black text-slate-900 font-mono italic">{kpi.targetValue}{kpi.unit}</p>
                                    </div>
                                    <div className="w-px h-8 bg-slate-100 hidden lg:block" />
                                    <div className="grid grid-cols-6 gap-x-2 text-center">
                                      {['O', 'E', 'VG', 'G', 'F', 'P'].map((grade) => (
                                        <div key={grade} className="flex flex-col items-center">
                                          <span className={cn("text-[7px] font-black mb-0.5 px-0.5 w-full rounded text-center italic", grade === 'O' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-400')}>{grade}</span>
                                          <span className="text-[9px] font-black text-slate-700 font-mono">{kpi.criteria[grade as keyof typeof kpi.criteria]}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            )) : (
                              <div className="p-3 rounded-xl border border-dashed border-slate-200 flex items-center justify-center bg-slate-50/50">
                                <p className="text-slate-400 font-black uppercase text-[9px] tracking-[0.2em] italic">No KPIs defined for this objective yet.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
