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
  ChevronLeft,
  Search,
  XCircle,
  Activity,
  Award,
  Printer,
  Plus,
  Trash2,
  Info,
  MessageSquare,
  Upload,
  Brain,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { ContractStatus } from '../types';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

import { PERFORMANCE_TEMPLATES, PerformanceTemplate } from '../lib/performanceTemplates';
import { useOrg } from '../context/OrgContext';
import { useNotifications } from '../context/NotificationContext';
import { useContracts } from '../context/ContractContext';

// ── Signature persistence hook ────────────────────────────────────────────────
const SIG_KEY = (ippisNo: string) => `sig_${ippisNo}`;

function useSignature(ippisNo: string) {
  const [sigDataUrl, setSigDataUrl] = React.useState<string | null>(() => {
    try { return localStorage.getItem(SIG_KEY(ippisNo)); } catch { return null; }
  });

  const save = React.useCallback((dataUrl: string) => {
    setSigDataUrl(dataUrl);
    try {
      localStorage.setItem(SIG_KEY(ippisNo), dataUrl);
    } catch (e) {
      console.warn('[useSignature] localStorage quota exceeded.');
    }
  }, [ippisNo]);

  const clear = React.useCallback(() => {
    setSigDataUrl(null);
    try { localStorage.removeItem(SIG_KEY(ippisNo)); } catch {}
  }, [ippisNo]);

  return { sigDataUrl, save, clear };
}

const TABS = [
  { id: 'info', label: 'Section 1: Employee Info', icon: <User size={18} /> },
  { id: 'supervisor', label: 'Section 2: Supervisor Info', icon: <Users size={18} /> },
  { id: 'countersign', label: 'Section 3: Counter-Signing', icon: <UserCheck size={18} /> },
  { id: 'tasks', label: 'Section 4: Performance Contract', icon: <Target size={18} /> },
  { id: 'competencies', label: 'Section 5: Competencies', icon: <Brain size={18} /> },
  { id: 'ops', label: 'Section 6: Ops & Processes', icon: <Zap size={18} /> },
  { id: 'sign', label: 'Section 7: Comments', icon: <MessageSquare size={18} /> },
  { id: 'review', label: 'Review & Submit', icon: <FileText size={18} /> },
];

export const PerformanceContract: React.FC = () => {
  const { user } = useAuth();
  const { templates } = useOrg();
  const { addNotification } = useNotifications();
  const { submitContract } = useContracts();
  
  const { sigDataUrl, save: saveSig, clear: clearSig } = useSignature(user?.ippisNo ?? '');
  const sigInputRef = React.useRef<HTMLInputElement>(null);
  const [sigDragOver, setSigDragOver] = useState(false);
  
  const [activeTab, setActiveTab] = useState('info');
  const [status, setStatus] = useState<ContractStatus>(ContractStatus.DRAFT);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PerformanceTemplate>(templates[0] ?? PERFORMANCE_TEMPLATES[0]);
  const [loading, setLoading] = useState(true);

  // Comments and Signature state
  const [comments, setComments] = useState({
    appraiseeComments: '',
    supervisorComments: '',
    counterSupervisorComments: '',
    appraiseeSigned: false,
    supervisorSigned: false,
    counterSigned: false
  });

  const handleCommentChange = (field: string, value: string | boolean) => {
    setComments(prev => ({ ...prev, [field]: value }));
  };

  const processSigFile = React.useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      addNotification('error', 'Invalid File', 'Please upload an image file (PNG or JPG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        saveSig(canvas.toDataURL('image/jpeg', 0.7));
        addNotification('success', 'Signature Saved', 'Handwritten signature applied successfully.');
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, [saveSig, addNotification]);

  // Mocked state for Section 5 & 6 as seen in the reference file
  const [competencies] = useState([
    { label: 'Leadership Skill', category: 'Generic Competencies', score: 3 },
    { label: 'Managing & Developing People', category: 'Generic Competencies', score: 3 },
    { label: 'Effective Communication', category: 'Generic Competencies', score: 3 },
    { label: 'Strategic Thinking', category: 'Functional Competencies', score: 3 },
    { label: 'Drive for results', category: 'Functional Competencies', score: 3 },
    { label: 'Transparency and Accountability', category: 'Functional Competencies', score: 3 },
    { label: 'Integrity', category: 'Ethic and value', score: 3 },
    { label: 'Citizen focus', category: 'Ethic and value', score: 3 },
    { label: 'Courage', category: 'Ethic and value', score: 3 }
  ]);

  const [opsMetrics] = useState([
    { label: 'Punctuality/Attendance', desc: 'Get to work at the specified time and days', target: 4 },
    { label: 'Work turn around time', desc: 'Display efficiency and effectiveness in service delivery', target: 4 },
    { label: 'Innovation on the job', desc: 'Introduce improvements in work processes as may be required', target: 2 }
  ]);

  React.useEffect(() => {
    const savedContract = localStorage.getItem(`active_contract_${user?.ippisNo}`);
    if (savedContract) {
       const contract = JSON.parse(savedContract);
       const template = templates.find(t => t.id === contract.templateId) ?? PERFORMANCE_TEMPLATES.find(t => t.id === contract.templateId);
       if (template) setSelectedTemplate(template);
       setStatus(ContractStatus.ACTIVE);
    }

    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [user, templates]);

  const handleSubmit = () => {
    if (!comments.appraiseeSigned) {
      addNotification('warning', 'Signature Required', 'Please apply your digital signature before final submission.');
      return;
    }
    
    try {
      submitContract({
        id: `PC-2026-${user?.ippisNo}-${Date.now()}`,
        userId: user?.id ?? '',
        ippisNo: user?.ippisNo ?? '',
        userName: `${user?.surname} ${user?.firstname}`,
        designation: user?.designation ?? '',
        departmentId: user?.departmentId ?? '',
        supervisorId: user?.supervisorId ?? '',
        templateId: selectedTemplate.id,
        year: 2026,
        status: ContractStatus.PENDING_APPROVAL,
        kras: selectedTemplate.kras,
        submittedAt: new Date().toISOString(),
        appraiseeComments: comments.appraiseeComments,
      });

      setIsSubmitted(true);
      setStatus(ContractStatus.APPROVED);
      addNotification('success', 'Contract Submitted', 'Your performance contract has been sent to your supervisor for approval.');
    } catch (error) {
      addNotification('error', 'Submission Failed', 'An error occurred while submitting your contract.');
    }
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
    <div className="w-full max-w-[1600px] mx-auto space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Template Selector Modal */}
      <AnimatePresence>
        {showTemplateModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
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
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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

      {/* Header & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">Performance Contract</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Official performance and accountability document for the 2026 cycle.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 mr-2">
            <div className="bg-slate-100 rounded-xl px-4 py-2 flex items-center gap-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Fiscal Cycle</p>
              <p className="text-sm font-black text-slate-900 font-mono tracking-tighter leading-none italic">2026</p>
            </div>
            <div className="bg-primary-600 rounded-xl px-4 py-2 shadow-lg shadow-primary-600/20 flex items-center gap-2">
              <p className="text-[9px] font-black text-primary-100 uppercase tracking-widest leading-none">Status</p>
              <p className="text-sm font-black text-white font-mono uppercase leading-none italic">{status}</p>
            </div>
          </div>
          <button className="btn btn-secondary gap-2 bg-white border-slate-200 text-xs font-black uppercase tracking-widest">
            <Printer className="w-4 h-4" /> Print PDF
          </button>
          <button onClick={() => setShowTemplateModal(true)} className="btn btn-secondary gap-2 bg-white border-slate-200 text-xs font-black uppercase tracking-widest">
            <Layout className="w-4 h-4 text-primary-600" /> Switch Template
          </button>
        </div>
      </div>

      {/* Navigation Tabs - Synchronized with Appraisal portal feel */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-sm sticky top-[72px] z-40 overflow-hidden">
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide snap-x snap-mandatory">
          {TABS.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "min-w-[120px] flex-1 h-16 rounded-xl border flex-shrink-0 transition-all duration-300 snap-start flex items-center gap-2.5 px-3 relative overflow-hidden group",
                activeTab === tab.id
                  ? "bg-primary-950 border-primary-950 text-white shadow-heavy z-10"
                  : "bg-slate-50/50 border-slate-100/50 hover:bg-white hover:shadow-sm hover:border-slate-200 text-slate-700"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center transition-all duration-300",
                activeTab === tab.id ? "bg-white/15" : "bg-white border border-slate-200 shadow-sm"
              )}>
                {React.cloneElement(tab.icon as React.ReactElement, { 
                  size: 14,
                  className: activeTab === tab.id ? "text-white" : "text-slate-400"
                })}
              </div>
              <div className="flex flex-col items-start min-w-0">
                <span className={cn(
                  "text-[10px] font-black leading-none truncate w-full uppercase tracking-tight",
                  activeTab === tab.id ? "text-white" : "text-slate-600"
                )}>
                  {tab.label.split(': ').length > 1 ? tab.label.split(': ')[1] : tab.label}
                </span>
                <span className={cn(
                  "text-[9px] font-black mt-0.5 leading-none",
                  activeTab === tab.id ? "text-primary-300" : "text-slate-400"
                )}>
                  {idx + 1}/{TABS.length}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="min-h-[500px] border-slate-200 shadow-premium overflow-hidden bg-white rounded-[32px]">
        {activeTab === 'info' && (
          <div className="p-8 lg:p-12 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 font-black text-lg shadow-sm border border-primary-100/50 italic">1</div>
              <div>
                 <h3 className="font-black text-xl text-slate-900 uppercase tracking-tighter italic">Section 1: Employee Information</h3>
                 <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Verify your primary institutional identity.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'IPPIS Number', value: user?.ippisNo, icon: <Fingerprint size={12} />, mono: true },
                { label: 'Full Legal Name', value: `${user?.surname} ${user?.firstname}`.toUpperCase(), icon: <User size={12} /> },
                { label: 'Email Address', value: user?.email, icon: <Mail size={12} /> },
                { label: 'Designation', value: user?.designation.toUpperCase(), icon: <Briefcase size={12} /> }
              ].map((field) => (
                <div key={field.label} className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    {field.icon} {field.label}
                  </label>
                  <div className={cn(
                    "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-black text-xs uppercase tracking-tight",
                    field.mono && "font-mono"
                  )}>
                    {field.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'supervisor' && (
          <div className="p-8 lg:p-12 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 font-black text-lg shadow-sm border border-primary-100/50 italic">2</div>
              <div>
                 <h3 className="font-black text-xl text-slate-900 uppercase tracking-tighter italic">Section 2: Supervisor Information</h3>
                 <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Designated officer for performance review.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Reviewer Name', value: 'DR. JANE SMITH', icon: <User size={12} /> },
                { label: 'Designation', value: 'DIRECTOR OF ACCOUNTS', icon: <Briefcase size={12} /> },
                { label: 'Functional Unit', value: 'ACCOUNTS & FINANCE', icon: <MapPin size={12} /> }
              ].map((field) => (
                <div key={field.label} className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    {field.icon} {field.label}
                  </label>
                  <div className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-black text-xs uppercase tracking-tight">
                    {field.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'countersign' && (
          <div className="p-8 lg:p-12 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 font-black text-lg shadow-sm border border-primary-100/50 italic">3</div>
              <div>
                 <h3 className="font-black text-xl text-slate-900 uppercase tracking-tighter italic">Section 3: Counter-Signing Officer</h3>
                 <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Final approving authority for the contract.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Officer Name', value: 'HON. ABUBAKAR IDRIS', icon: <User size={12} /> },
                { label: 'Official Role', value: 'CHIEF EXECUTIVE OFFICER', icon: <Award size={12} /> }
              ].map((field) => (
                <div key={field.label} className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    {field.icon} {field.label}
                  </label>
                  <div className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-black text-xs uppercase tracking-tight">
                    {field.value}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100 mt-8">
              <div className="flex gap-4">
                <Info className="w-6 h-6 text-amber-500 shrink-0" />
                <p className="text-[11px] font-bold text-amber-800 leading-relaxed uppercase tracking-tight">
                  Ensure all reporting lines are accurate before proceeding. Any discrepancy will require administrative correction.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="animate-in fade-in duration-500 overflow-hidden">
            {loading ? (
              <div className="p-10 space-y-6">
                <Skeleton className="h-10 w-64 rounded-xl" />
                <div className="space-y-3">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto overflow-y-hidden custom-scrollbar">
                <table className="w-full text-xs border-collapse table-fixed min-w-[1200px]">
                  <thead>
                    <tr className="bg-primary-950 text-white divide-x divide-white/10">
                      <th className="p-4 w-12 font-black uppercase tracking-widest text-[9px] text-center italic" rowSpan={2}>S/N</th>
                      <th className="p-4 w-48 font-black uppercase tracking-widest text-[9px] text-left italic" rowSpan={2}>Key Result Area (KRA)</th>
                      <th className="p-4 w-20 font-black uppercase tracking-widest text-[9px] text-center italic" rowSpan={2}>KRA Weight</th>
                      <th className="p-4 w-64 font-black uppercase tracking-widest text-[9px] text-left italic" rowSpan={2}>Strategic Objectives</th>
                      <th className="p-4 w-24 font-black uppercase tracking-widest text-[9px] text-center italic" rowSpan={2}>Graded Weight</th>
                      <th className="p-4 w-80 font-black uppercase tracking-widest text-[9px] text-left italic" rowSpan={2}>Performance Indicators (KPIs)</th>
                      <th className="p-4 w-24 font-black uppercase tracking-widest text-[9px] text-center italic" rowSpan={2}>Target Value</th>
                      <th className="p-4 w-20 font-black uppercase tracking-widest text-[9px] text-center italic" rowSpan={2}>Unit</th>
                      <th className="p-2 font-black uppercase tracking-widest text-[9px] text-center italic" colSpan={6}>Scoring Criteria</th>
                    </tr>
                    <tr className="bg-primary-900 text-white divide-x divide-white/10">
                      {['O', 'E', 'VG', 'G', 'F', 'P'].map(grade => (
                        <th key={grade} className="p-2 w-12 font-black text-[9px] text-center italic">{grade}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedTemplate.kras.map((kra) => (
                      <React.Fragment key={kra.id}>
                        {kra.objectives.map((obj, objIdx) => (
                          <React.Fragment key={obj.id}>
                            {obj.kpis.map((kpi, kpiIdx) => {
                              const isFirstInKRA = objIdx === 0 && kpiIdx === 0;
                              const isFirstInObj = kpiIdx === 0;
                              
                              // Calculate rowspans
                              const totalKPIsInObj = obj.kpis.length;
                              const totalKPIsInKRA = kra.objectives.reduce((acc, o) => acc + o.kpis.length, 0);

                              return (
                                <tr key={kpi.id} className="align-top hover:bg-slate-50/50 group/row divide-x divide-slate-100">
                                  {isFirstInKRA && (
                                    <>
                                      <td className="p-4 font-black text-slate-400 text-center align-middle bg-slate-50/30" rowSpan={totalKPIsInKRA}>
                                        {kra.serialNo}
                                      </td>
                                      <td className="p-4 bg-slate-50/20 font-black text-slate-900 align-middle uppercase italic text-[11px] leading-tight" rowSpan={totalKPIsInKRA}>
                                        {kra.name}
                                      </td>
                                      <td className="p-4 text-center font-black text-primary-600 align-middle bg-primary-50/10 text-sm italic" rowSpan={totalKPIsInKRA}>
                                        {kra.weight}%
                                      </td>
                                    </>
                                  )}
                                  
                                  {isFirstInObj && (
                                    <>
                                      <td className="p-4 text-slate-700 align-middle text-left font-semibold italic text-[11px] leading-relaxed" rowSpan={totalKPIsInObj}>
                                        {obj.description}
                                      </td>
                                      <td className="p-4 text-center font-black text-emerald-600 align-middle bg-emerald-50/10 text-sm italic" rowSpan={totalKPIsInObj}>
                                        {obj.gradedWeight}
                                      </td>
                                    </>
                                  )}

                                  <td className="p-4 text-slate-800 font-black uppercase italic text-[10px] leading-snug">
                                    {kpi.description}
                                  </td>
                                  <td className="p-4 text-center font-black text-slate-900 text-[11px] italic">
                                    {kpi.targetValue}
                                  </td>
                                  <td className="p-4 text-center font-black text-slate-400 text-[9px] uppercase tracking-widest">
                                    {kpi.unit}
                                  </td>
                                  
                                  {['O', 'E', 'VG', 'G', 'F', 'P'].map((grade) => (
                                    <td key={grade} className="p-1 align-middle bg-slate-50/10">
                                      <div className="w-full py-2 bg-white border border-slate-100 text-center font-black text-slate-700 text-[10px] rounded-lg shadow-sm font-mono italic">
                                        {kpi.criteria[grade as keyof typeof kpi.criteria]}
                                      </div>
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Validation & Total Bar */}
            <div className="p-8 bg-slate-900 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 text-white overflow-hidden relative">
                <div className="flex items-center gap-4 z-10">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                    <Target size={20} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Selected Framework</h4>
                    <p className="text-sm font-black text-white uppercase italic tracking-tight">{selectedTemplate.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-12 z-10">
                   <div className="flex flex-col items-end">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Composite Weight</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white font-mono italic tracking-tighter">100.00</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">/ 100%</span>
                      </div>
                   </div>
                   <div className="w-px h-12 bg-slate-800"></div>
                   <div className="flex flex-col items-end">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Total Graded Scale</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-emerald-400 font-mono italic tracking-tighter">100.00</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">/ 100.00</span>
                      </div>
                   </div>
                </div>
                
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full blur-3xl -mr-32 -mt-32" />
            </div>
          </div>
        )}

        {activeTab === 'competencies' && (
          <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-500">
             <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 font-black text-lg shadow-sm border border-primary-100/50 italic">5</div>
                <div>
                   <h3 className="font-black text-xl text-slate-900 uppercase tracking-tighter italic">Section 5: Competencies</h3>
                   <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Behavioral and functional skills assessment framework.</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {competencies.map((item, i) => (
                 <div key={i} className="card p-6 bg-slate-50/50 flex flex-col border-slate-100 group hover:border-primary-200 hover:bg-white transition-all shadow-sm hover:shadow-md rounded-2xl">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="text-[8px] font-black text-primary-500 uppercase tracking-[0.2em] block mb-1">{item.category}</span>
                            <h5 className="font-black text-slate-900 text-sm uppercase italic tracking-tight">{item.label}</h5>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-xs font-black text-primary-600 shadow-sm">
                          {item.score}
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-1">
                       {[1, 2, 3, 4, 5].map(score => (
                         <button key={score} className={cn(
                           "flex-1 h-10 rounded-xl text-[11px] font-black border transition-all shadow-sm uppercase",
                           score === item.score 
                            ? "bg-primary-950 border-primary-950 text-white scale-105 z-10" 
                            : "bg-white border-slate-100 text-slate-300 hover:border-primary-200 hover:text-primary-400"
                         )}>
                           {score}
                         </button>
                       ))}
                    </div>
                 </div>
               ))}
             </div>
             
             <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-heavy relative overflow-hidden">
                <div className="flex items-center gap-4 z-10">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                    <Award size={20} />
                  </div>
                  <div>
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Competency Average</h4>
                    <p className="text-xl font-black italic tracking-tighter">3.0 / 5.0</p>
                  </div>
                </div>
                <p className="text-[9px] font-bold text-slate-400 max-w-sm uppercase tracking-widest text-right leading-relaxed z-10">
                  This section evaluates behavioral standards required for effective performance in the current role.
                </p>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
             </div>
          </div>
        )}

        {activeTab === 'ops' && (
          <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-500">
             <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 font-black text-lg shadow-sm border border-primary-100/50 italic">6</div>
                <div>
                   <h3 className="font-black text-xl text-slate-900 uppercase tracking-tighter italic">Section 6: Operations & Processes</h3>
                   <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Assessment of daily workflow adherence and professional conduct.</p>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-4">
                {opsMetrics.map((op, i) => (
                  <div key={i} className="flex flex-col lg:flex-row items-center justify-between p-8 bg-slate-50/50 rounded-[32px] border border-slate-100 hover:border-primary-200 hover:bg-white transition-all group shadow-sm hover:shadow-md">
                    <div className="flex-1 mb-6 lg:mb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-primary-500" />
                        <h4 className="font-black text-slate-900 uppercase italic tracking-tight">{op.label}</h4>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 italic mb-4">"{op.desc}"</p>
                      <div className="flex items-center gap-3">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Expected Performance Level:</span>
                         <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-100 font-black text-[9px] px-3 py-1 uppercase italic tracking-widest rounded-lg">Scale {op.target}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                      {[1, 2, 3, 4].map(score => (
                        <button key={score} className={cn(
                          "flex-1 lg:w-16 lg:h-16 h-12 rounded-2xl flex items-center justify-center font-black transition-all border-2 shadow-sm text-sm uppercase",
                          score === op.target 
                            ? "bg-primary-950 border-primary-950 text-white scale-110 shadow-lg shadow-primary-950/20 z-10" 
                            : "bg-white border-slate-100 text-slate-300 hover:border-primary-200 hover:text-primary-400"
                        )}>
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
             </div>
             
             <div className="bg-primary-50/50 border border-primary-100 p-6 rounded-3xl flex items-start gap-4">
               <Info className="w-5 h-5 text-primary-500 mt-0.5" />
               <div className="space-y-1">
                 <h5 className="text-[10px] font-black text-primary-900 uppercase tracking-widest italic">Operational Standards</h5>
                 <p className="text-[10px] font-bold text-primary-700 uppercase tracking-tight leading-relaxed">
                   Scores in this section reflect sustained professional conduct and operational efficiency throughout the fiscal cycle. 
                   Expected levels are set based on unit-specific benchmarks.
                 </p>
               </div>
             </div>
          </div>
        )}

        {activeTab === 'sign' && (
          <div className="p-8 lg:p-12 space-y-10 animate-in fade-in duration-500">
             <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 font-black text-lg shadow-sm border border-primary-100/50 italic">7</div>
                <div>
                   <h3 className="font-black text-xl text-slate-900 uppercase tracking-tighter italic">Section 7: Comments & Signature</h3>
                   <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Final declaration and accountability signature.</p>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Comments */}
                <div className="lg:col-span-7 space-y-8">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare className="w-3 h-3 text-primary-500" />
                        Officer Reflections & Comments
                      </label>
                      <textarea 
                         placeholder="Enter your personal comments or reflections regarding this performance contract..."
                         value={comments.appraiseeComments}
                         onChange={(e) => handleCommentChange('appraiseeComments', e.target.value)}
                         className="w-full h-48 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-primary-500/5 outline-none transition-all placeholder:text-slate-300 resize-none italic shadow-inner"
                      />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                      <div className="space-y-3">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Users size={12} className="text-slate-300" />
                            Supervisor Review
                            <span className="ml-auto text-[8px] bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded font-black uppercase tracking-widest italic">Pending</span>
                         </label>
                         <div className="h-24 bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4 flex items-center justify-center">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center">Awaiting Reviewer Input</p>
                         </div>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <UserCheck size={12} className="text-slate-300" />
                            Counter-Signing
                            <span className="ml-auto text-[8px] bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded font-black uppercase tracking-widest italic">Pending</span>
                         </label>
                         <div className="h-24 bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4 flex items-center justify-center">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center">Awaiting Final Approval</p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Right: Formal Signature Block */}
                <div className="lg:col-span-5 space-y-6">
                   <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-heavy border border-slate-800">
                      <div className="relative z-10 space-y-6">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10">
                               <Fingerprint size={20} />
                            </div>
                            <h4 className="text-sm font-black uppercase tracking-widest italic">Formal Declaration</h4>
                         </div>
                         
                         <p className="text-xs font-semibold text-slate-400 leading-relaxed italic border-l-2 border-primary-500 pl-4 py-1">
                            "I hereby certify that I have participated in the development of this performance contract and I am committed to achieving the targets set forth herein for the 2026 fiscal cycle."
                         </p>

                         <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-1">
                                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">IPPIS Identifier</p>
                                  <p className="text-xs font-black font-mono tracking-tighter text-white">{user?.ippisNo}</p>
                               </div>
                               <div className="space-y-1">
                                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Fiscal Year</p>
                                  <p className="text-xs font-black font-mono tracking-tighter text-white">2026</p>
                               </div>
                            </div>
                            <div className="space-y-1">
                               <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Certified Date</p>
                               <p className="text-xs font-black text-white uppercase italic">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                            </div>
                         </div>

                         {/* Signature Area */}
                         <div className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                               <p className="text-[9px] font-black text-primary-400 uppercase tracking-[0.2em]">Handwritten Signature</p>
                               {sigDataUrl && (
                                  <button onClick={clearSig} className="text-[9px] font-black text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest">Remove</button>
                               )}
                            </div>
                            
                            {sigDataUrl ? (
                               <div className="relative h-24 bg-white rounded-2xl flex items-center justify-center group overflow-hidden border border-white/10">
                                  <img src={sigDataUrl} alt="Signature" className="max-h-20 max-w-[80%] object-contain" />
                                  <div className="absolute inset-0 bg-primary-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                     <button onClick={() => sigInputRef.current?.click()} className="px-4 py-2 bg-white text-primary-950 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">Replace</button>
                                  </div>
                               </div>
                            ) : (
                               <div 
                                  onClick={() => sigInputRef.current?.click()}
                                  onDragOver={(e) => { e.preventDefault(); setSigDragOver(true); }}
                                  onDragLeave={() => setSigDragOver(false)}
                                  onDrop={(e) => {
                                     e.preventDefault();
                                     setSigDragOver(false);
                                     const file = e.dataTransfer.files[0];
                                     if (file) processSigFile(file);
                                  }}
                                  className={cn(
                                     "h-24 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
                                     sigDragOver ? "bg-primary-500/10 border-primary-500" : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                  )}
                               >
                                  <Upload size={18} className="text-slate-500" />
                                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Upload signature image</p>
                               </div>
                            )}
                            <input ref={sigInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                               const file = e.target.files?.[0];
                               if (file) processSigFile(file);
                               e.target.value = '';
                            }} />
                         </div>

                         {/* Checkbox Confirmation */}
                         <label className={cn(
                            "flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer group mt-4",
                            comments.appraiseeSigned 
                               ? "bg-emerald-500/10 border-emerald-500/20" 
                               : "bg-white/5 border-white/10 hover:bg-white/10"
                         )}>
                            <input 
                               type="checkbox" 
                               checked={comments.appraiseeSigned} 
                               onChange={(e) => handleCommentChange('appraiseeSigned', e.target.checked)}
                               className="w-5 h-5 rounded border-2 border-primary-500 text-primary-600 focus:ring-primary-600 mt-0.5"
                            />
                            <div>
                               <p className="text-xs font-black text-white uppercase tracking-widest">Acknowledge & Sign</p>
                               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-1 leading-relaxed">By ticking this box, you apply your digital signature and certify this contract for review.</p>
                            </div>
                         </label>
                      </div>
                      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary-600/10 rounded-full blur-3xl" />
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'review' && (
          <div className="p-8 lg:p-12 space-y-10 animate-in fade-in duration-500">
             <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-lg shadow-sm border border-emerald-100/50 italic">8</div>
                <div>
                   <h3 className="font-black text-xl text-slate-900 uppercase tracking-tighter italic">Final Review & Submission</h3>
                   <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Review your performance framework before certification.</p>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card p-8 bg-slate-900 text-white rounded-[32px] relative overflow-hidden shadow-heavy border border-slate-800">
                   <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10">
                            <Target size={20} />
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-widest italic">Framework Summary</h4>
                      </div>
                      
                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Template</span>
                          <span className="text-xs font-black text-white italic">{selectedTemplate.name}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total KRAs</span>
                          <span className="text-xs font-black text-white">{selectedTemplate.kras.length} Units</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Composite Weight</span>
                          <span className="text-sm font-black text-emerald-400">100%</span>
                        </div>
                      </div>

                      <div className="pt-4 flex items-center gap-3 bg-white/5 p-4 rounded-2xl">
                         <Info size={16} className="text-amber-400" />
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed">
                            Upon submission, this contract will be sent to your supervisor for formal approval.
                         </p>
                      </div>
                   </div>
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-full blur-3xl -mr-16 -mt-16" />
                </div>

                <div className="card p-8 bg-slate-50 border border-slate-100 rounded-[32px] flex flex-col justify-center items-center text-center space-y-4">
                   <div className="w-16 h-16 rounded-[24px] bg-primary-950 text-white flex items-center justify-center shadow-lg shadow-primary-950/20">
                      <Send size={24} />
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter italic">Ready to Finalize?</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Ensure you have applied your signature in Section 7.</p>
                   </div>
                   <button 
                     onClick={handleSubmit}
                     className="w-full py-4 bg-primary-950 text-white rounded-2xl font-black text-xs hover:translate-y-[-2px] transition-all shadow-heavy shadow-primary-950/20 active:scale-95 uppercase tracking-widest mt-4"
                   >
                     Submit to Supervisor
                   </button>
                </div>
             </div>
          </div>
        )}
      </Card>

      {/* Persistence Bar / Footer Navigation */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-200/50 flex justify-between items-center z-50 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.1)] px-8 sm:px-12">
        <button 
          onClick={() => {
            const idx = TABS.findIndex(t => t.id === activeTab);
            if (idx > 0) setActiveTab(TABS[idx - 1].id);
          }}
          className={cn(
            "flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-[11px] hover:translate-y-[-1px] transition-all active:scale-95 uppercase tracking-[0.2em] shadow-sm",
            activeTab === TABS[0].id && "opacity-0 pointer-events-none"
          )}
        >
          <ChevronLeft className="w-4 h-4" /> Previous Section
        </button>
        
        <div className="hidden sm:flex items-center gap-2">
          {TABS.map((tab, idx) => (
            <React.Fragment key={tab.id}>
              <div className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                activeTab === tab.id ? "bg-primary-600 w-6" : "bg-slate-200"
              )} />
              {idx < TABS.length - 1 && <div className="w-4 h-[1px] bg-slate-100" />}
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden md:flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-sm cursor-not-allowed">
            <Save className="w-4 h-4" /> Draft Saved
          </button>
          
          {activeTab !== TABS[TABS.length - 1].id ? (
            <button 
              onClick={() => {
                const idx = TABS.findIndex(t => t.id === activeTab);
                if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].id);
              }}
              className="flex items-center gap-2 px-8 py-3 bg-primary-950 text-white rounded-2xl font-black text-[11px] hover:translate-y-[-1px] transition-all active:scale-95 uppercase tracking-[0.2em] shadow-heavy shadow-primary-950/20"
            >
              Proceed <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[11px] hover:translate-y-[-1px] transition-all active:scale-95 uppercase tracking-[0.2em] shadow-heavy shadow-emerald-600/20 animate-pulse-slow"
            >
              <CheckCircle2 className="w-4 h-4" /> Finalize Contract
            </button>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};
