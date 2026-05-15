import React, { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  calculateRawScore, 
  calculateWeightedRawScore, 
  calculateSection4Composite,
  calculateAppraisalRating,
  calculateAppraiserScore 
} from '../lib/scoring';
import { useNotifications } from '../context/NotificationContext';
import { 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Send, 
  Info,
  Check,
  CheckCircle2,
  AlertCircle,
  FileText,
  Target,
  Brain,
  Zap,
  MessageSquare,
  User,
  Users,
  UserCheck,
  MapPin,
  Calendar,
  Briefcase,
  Phone,
  Upload,
  X,
  ImageIcon,
  Trash2 as TrashIcon,
  Mail,
  Fingerprint,
  BarChart3,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

import { PERFORMANCE_TEMPLATES, PerformanceTemplate, TemplateKRA } from '../lib/performanceTemplates';
import { useAuth } from '../context/AuthContext';
import { useAppraisals } from '../context/AppraisalContext';
import { AppraisalStatus } from '../types';
import { useOrg } from '../context/OrgContext';
import { 
  DEFAULT_COMPETENCIES, 
  DEFAULT_OPERATIONS_ITEMS, 
  OPERATIONS_MAX_TOTAL,
  SECTION_WEIGHTS
} from '../constants';

// ── Signature persistence hook ────────────────────────────────────────────────
const SIG_KEY = (ippisNo: string) => `sig_${ippisNo}`;

function useSignature(ippisNo: string) {
  const [sigDataUrl, setSigDataUrl] = React.useState<string | null>(() => {
    try { return localStorage.getItem(SIG_KEY(ippisNo)); } catch { return null; }
  });

  const save = useCallback((dataUrl: string) => {
    setSigDataUrl(dataUrl);
    try {
      localStorage.setItem(SIG_KEY(ippisNo), dataUrl);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.warn('[useSignature] localStorage quota exceeded — signature held in memory only.');
      }
    }
  }, [ippisNo]);

  const clear = useCallback(() => {
    setSigDataUrl(null);
    try { localStorage.removeItem(SIG_KEY(ippisNo)); } catch {}
  }, [ippisNo]);

  return { sigDataUrl, save, clear };
}

const STEPS = [
  { id: 1, label: 'Section 1: Employee Information', icon: <User size={18} /> },
  { id: 2, label: 'Section 2: Supervisor Info', icon: <Users size={18} /> },
  { id: 3, label: 'Section 3: Counter-Signing Info', icon: <UserCheck size={18} /> },
  { id: 4, label: 'Section 4: Tasks', icon: <Target size={18} /> },
  { id: 5, label: 'Section 5: Competencies', icon: <Brain size={18} /> },
  { id: 6, label: 'Section 6: Operations', icon: <Zap size={18} /> },
  { id: 7, label: 'Section 7: Comments', icon: <MessageSquare size={18} /> },
  { id: 8, label: 'Review & Submit', icon: <FileText size={18} /> },
];

export const AppraisalForm: React.FC = () => {
  const { user } = useAuth();
  const { addNotification, notifyUser } = useNotifications();
  const { submitAppraisal } = useAppraisals();
  const { templates } = useOrg();
  const { sigDataUrl, save: saveSig, clear: clearSig } = useSignature(user?.ippisNo ?? '');
  const sigInputRef = useRef<HTMLInputElement>(null);
  const [sigDragOver, setSigDragOver] = useState(false);

  const processSigFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      addNotification('error', 'Invalid File', 'Please upload an image file (PNG, JPG, or GIF).');
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
        addNotification('success', 'Signature Saved', 'Your signature has been saved and will be used for all future appraisals.');
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, [saveSig, addNotification]);
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [achievements, setAchievements] = useState<Record<string, number>>({});
  const [supervisorAchievements, setSupervisorAchievements] = useState<Record<string, number>>({});
  const [isSupervisorView, setIsSupervisorView] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const APPRAISAL_PERIODS = [
    { label: 'Q1 (January - March 2026)', value: 'Q1-2026' },
    { label: 'Q2 (April - June 2026)', value: 'Q2-2026' },
    { label: 'Q3 (July - September 2026)', value: 'Q3-2026' },
    { label: 'Q4 (October - December 2026)', value: 'Q4-2026' },
  ];
  const [selectedPeriod, setSelectedPeriod] = useState(APPRAISAL_PERIODS[1]);

  const [activeTemplate, setActiveTemplate] = useState<PerformanceTemplate>(templates[0] ?? PERFORMANCE_TEMPLATES[0]);

  React.useEffect(() => {
    const savedContract = localStorage.getItem(`active_contract_${user?.ippisNo}`);
    if (savedContract) {
       const contract = JSON.parse(savedContract);
       if (contract.kras) {
         setActiveTemplate(prev => ({ ...prev, kras: contract.kras }));
         addNotification('info', 'Contract Loaded', `Appraisal loaded from approved contract (ID: ${contract.id})`);
       } else if (contract.templateId) {
         const template = templates.find(t => t.id === contract.templateId) ?? PERFORMANCE_TEMPLATES.find(t => t.id === contract.templateId);
         if (template) setActiveTemplate(template);
       }
    }
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [user, addNotification]);
  
  const employeeInfo = {
    name: `${user?.surname ?? ''} ${user?.firstname ?? ''}`.trim(),
    ippisNo: user?.ippisNo ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    designation: user?.designation ?? '',
    department: user?.departmentId ?? '',
    period: selectedPeriod.label,
  };

  const SUPERVISOR_LOOKUP: Record<string, { name: string; designation: string; email: string }> = {
    'lead_1': { name: 'OLEH NNEKA', designation: 'Team Lead', email: 'lead@servicom.gov.ng' },
    'head_1': { name: 'NAWABUA CHINYERE', designation: 'Head of Department', email: 'head@servicom.gov.ng' },
    'dd_1':   { name: 'LAWAL OBEHI', designation: 'Deputy Director', email: 'dd@servicom.gov.ng' },
    'nc_1':   { name: 'OLADIMEJI FUNMILAYO', designation: 'National Coordinator', email: 'nc@servicom.gov.ng' },
  };
  const COUNTER_SIGNER_LOOKUP: Record<string, { name: string; designation: string; email: string }> = {
    'head_1': { name: 'NAWABUA CHINYERE', designation: 'Head of Department', email: 'head@servicom.gov.ng' },
    'dd_1':   { name: 'LAWAL OBEHI', designation: 'Deputy Director', email: 'dd@servicom.gov.ng' },
    'nc_1':   { name: 'OLADIMEJI FUNMILAYO', designation: 'National Coordinator', email: 'nc@servicom.gov.ng' },
  };
  const supervisorInfo = SUPERVISOR_LOOKUP[user?.supervisorId ?? ''] ?? { name: 'Not Assigned', designation: '—', email: '—' };
  const counterSigningInfo = COUNTER_SIGNER_LOOKUP[user?.counterSignerId ?? ''] ?? { name: 'Not Assigned', designation: '—', email: '—' };
  
  const [comments, setComments] = useState({
    appraiserRating: '',
    appraiseeComments: '',
    supervisorComments: '',
    counterSupervisorComments: '',
    staffAppeal: '',
    appraiseeSigned: false,
    supervisorSigned: false,
    counterSigned: false
  });

  const handleCommentChange = (field: string, value: string | boolean) => {
    setComments(prev => ({ ...prev, [field]: value }));
  };
  const [kpiConfigs, setKpiConfigs] = useState<Record<string, {
    target: number;
    unit: string;
    direction: 'higher' | 'lower';
    criteria: Record<string, number>;
  }>>(() => {
    const config: any = {};
    activeTemplate.kras.forEach(kra => {
      kra.objectives.forEach(obj => {
        obj.kpis.forEach(kpi => {
          config[kpi.id] = {
            target: kpi.targetValue,
            unit: kpi.unit,
            direction: kpi.direction || 'higher',
            criteria: { ...kpi.criteria }
          };
        });
      });
    });
    return config;
  });

  React.useEffect(() => {
    const config: any = {};
    activeTemplate.kras.forEach(kra => {
      kra.objectives.forEach(obj => {
        obj.kpis.forEach(kpi => {
          config[kpi.id] = {
            target: kpi.targetValue,
            unit: kpi.unit,
            direction: kpi.direction || 'higher',
            criteria: { ...kpi.criteria }
          };
        });
      });
    });
    setKpiConfigs(config);
    
    const w: Record<string, number> = {};
    activeTemplate.kras.forEach(kra => {
      w[kra.id] = kra.weight;
      kra.objectives.forEach(obj => {
        w[obj.id] = obj.weight;
      });
    });
    setKriWeights(w);
  }, [activeTemplate]);

  const handleKpiConfigChange = (id: string, field: string, value: string) => {
    setKpiConfigs(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: field === 'target' ? (parseFloat(value) || 0) : value
      }
    }));
  };

  const handleCriteriaChange = (id: string, grade: string, value: string) => {
    setKpiConfigs(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        criteria: {
          ...prev[id].criteria,
          [grade]: parseFloat(value) || 0
        }
      }
    }));
  };
  
  const [clusterWeights, setClusterWeights] = useState<Record<string, number>>({
    'Generic': 9,
    'Functional': 7,
    'Ethics & Values': 4,
  });
  const [compWeights, setCompWeights] = useState<Record<string, number>>(() => {
    const weights: Record<string, number> = {};
    DEFAULT_COMPETENCIES.forEach(cluster => {
      cluster.items.forEach(item => {
        weights[item.name] = item.target;
      });
    });
    return weights;
  });

  const COMPETENCY_ALLOCATION = 20;

  const competencyData = useMemo(() => DEFAULT_COMPETENCIES, []);

  const totalClusterWeight = useMemo(() => {
    return Object.values(clusterWeights).reduce((a: number, b: number) => a + b, 0);
  }, [clusterWeights]);

  const clusterValidation = useMemo(() => {
    const report: Record<string, { sum: number; target: number; valid: boolean }> = {};
    competencyData.forEach(c => {
      const sum = c.items.reduce((acc, item) => acc + (compWeights[item.name] || 0), 0);
      const target = clusterWeights[c.cluster] || 0;
      report[c.cluster] = { sum, target, valid: Math.abs(sum - target) < 0.01 };
    });
    return report;
  }, [competencyData, compWeights, clusterWeights]);

  const [kriWeights, setKriWeights] = useState<Record<string, number>>(() => {
    const w: Record<string, number> = {};
    activeTemplate.kras.forEach(kra => {
      w[kra.id] = kra.weight;
      kra.objectives.forEach(obj => {
        w[obj.id] = obj.weight;
      });
    });
    return w;
  });

  const parseCriteria = (criteriaVal: string | number): number => {
    if (typeof criteriaVal === 'number') return criteriaVal;
    const cleaned = criteriaVal.replace(/[><=]/g, '').trim();
    return parseFloat(cleaned) || 0;
  };

  const calculateScores = (targetAchievements: Record<string, number>) => {
    const kpiItems: Record<string, { raw: number; weighted: number; grade: string; gradedWeight: number }> = {};
    let section4RawTotal = 0;

    let totalSection4Weight = 0;
    activeTemplate.kras.forEach(kra => {
      kra.objectives.forEach(obj => {
        obj.kpis.forEach(kpi => {
          const kpiWt = (kpi as any).weight || (kriWeights[obj.id] / obj.kpis.length) || 0;
          totalSection4Weight += kpiWt;
        });
      });
    });

    const scaleFactor = totalSection4Weight > 0 ? (100 / totalSection4Weight) : 0;

    activeTemplate.kras.forEach(kra => {
      kra.objectives.forEach(obj => {
        obj.kpis.forEach(kpi => {
          const val = targetAchievements[kpi.id] || 0;
          const config = kpiConfigs[kpi.id];
          if (!config) return; 
          
          const criteria = config.criteria;
          const direction = config.direction || 'higher';
          
          let grade = 'P';
          let raw = 0;
          
          const oVal = parseCriteria(criteria.O);
          const eVal = parseCriteria(criteria.E);
          const vgVal = parseCriteria(criteria.VG);
          const gVal = parseCriteria(criteria.G);
          const fVal = parseCriteria(criteria.F);

          if (!val || val === 0) {
            grade = 'P';
            raw = 0;
          } else if (direction === 'higher') {
            if (val < fVal) { grade = 'P'; raw = 50; }
            else if (val < gVal) { grade = 'F'; raw = 60; }
            else if (val < vgVal) { grade = 'G'; raw = 70; }
            else if (val < eVal) { grade = 'VG'; raw = 80; }
            else {
              if (typeof criteria.O === 'number') {
                if (val < oVal) { grade = 'E'; raw = 90; } else { grade = 'O'; raw = 100; }
              } else {
                if (val === eVal) { grade = 'E'; raw = 90; } else { grade = 'O'; raw = 100; }
              }
            }
          } else {
            if (val > fVal) { grade = 'P'; raw = 50; }
            else if (val > gVal) { grade = 'F'; raw = 60; }
            else if (val > vgVal) { grade = 'G'; raw = 70; }
            else if (val > eVal) { grade = 'VG'; raw = 80; }
            else {
              if (typeof criteria.O === 'number') {
                if (val > oVal) { grade = 'E'; raw = 90; } else { grade = 'O'; raw = 100; }
              } else {
                if (val === eVal) { grade = 'E'; raw = 90; } else { grade = 'O'; raw = 100; }
              }
            }
          }
          
          const kpiWt = (kpi as any).weight || (kriWeights[obj.id] / obj.kpis.length) || 0;
          const gradedWeight = (kpi as any).gradedWeight || 
                             ((obj as any).gradedWeight ? ((obj as any).gradedWeight / obj.kpis.length) : (kpiWt * scaleFactor));
          
          const weighted = (gradedWeight * raw) / 100;
          
          kpiItems[kpi.id] = { raw, weighted, grade, gradedWeight };
          section4RawTotal += weighted;
        });
      });
    });

    const kpiTotal = (section4RawTotal / 100) * 70;

    let compTotal = 0;
    competencyData.forEach(cluster => {
      cluster.items.forEach(item => {
        const rating = targetAchievements[`comp_${item.name}`] || 0;
        const weight = compWeights[item.name] || 0;
        compTotal += (rating / 5) * weight;
      });
    });

    let opsPointsTotal = 0;
    DEFAULT_OPERATIONS_ITEMS.forEach(item => {
      opsPointsTotal += targetAchievements[`op_${item.name}`] || 0;
    });
    const opsScoreVal = (opsPointsTotal / OPERATIONS_MAX_TOTAL) * SECTION_WEIGHTS.operations;

    const grandTotal = kpiTotal + compTotal + opsScoreVal;

    return {
      kpi: { items: kpiItems, total: kpiTotal },
      competency: compTotal,
      ops: { points: opsPointsTotal, score: opsScoreVal },
      grandTotal: Math.min(100, grandTotal)
    };
  };

  const currentStaffData = {
    id: employeeInfo.ippisNo,
    name: employeeInfo.name,
    ippis: employeeInfo.ippisNo,
    department: employeeInfo.department,
    designation: employeeInfo.designation,
    score: 0,
    status: 'Submitted',
    lastUpdated: new Date().toLocaleDateString()
  };

  const handleSubmit = async () => {
    if (!comments.appraiseeSigned) {
      addNotification('warning', 'Signature Required', 'Please sign the appraisal before submitting.');
      return;
    }

    try {
      submitAppraisal({
        id: `APR-${user?.ippisNo}-${selectedPeriod.value}-${Date.now()}`,
        userId: user?.id ?? '',
        ippisNo: user?.ippisNo ?? '',
        userName: `${user?.surname} ${user?.firstname}`,
        designation: user?.designation ?? '',
        departmentId: user?.departmentId ?? '',
        supervisorId: user?.supervisorId ?? '',
        counterSignerId: user?.counterSignerId ?? '',
        contractId: `PC-2026-${user?.ippisNo}`,
        period: selectedPeriod.value,
        year: 2026,
        status: AppraisalStatus.SUBMITTED,
        submittedAt: new Date().toISOString(),
        kras: activeTemplate.kras,
        achievements,
        supervisorAchievements,
        scores: {
          kpiTotal: appraiseeScores.kpi.total,
          competency: appraiseeScores.competency,
          opsScore: appraiseeScores.ops.score,
          grandTotal: appraiseeScores.grandTotal,
        },
        comments,
      });

      setIsSubmitted(true);
      addNotification('success', 'Appraisal Submitted', `Your ${selectedPeriod.label} appraisal has been submitted to ${supervisorInfo.name}.`);
      if (user?.supervisorId) {
        notifyUser(
          user.supervisorId,
          'info',
          'New Appraisal Pending Review',
          `${user.surname} ${user.firstname} has submitted their ${selectedPeriod.label} appraisal for your review.`
        );
      }
    } catch (error) {
      addNotification('error', 'Submission Failed', 'An error occurred. Please try again.');
    }
  };

  const handleDownload = async () => {
    const finalScore = isSupervisorView ? supervisorScores.grandTotal : appraiseeScores.grandTotal;
    const fileName = `Appraisal_${employeeInfo.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
    addNotification('info', 'Generating PDF', 'Preparing your appraisal report...');
    try {
      const { generateAppraisalPDF } = await import('../lib/exportUtils');
      generateAppraisalPDF({ ...currentStaffData, score: finalScore }, fileName);
    } catch {
      addNotification('error', 'Export Failed', 'Could not generate the PDF report.');
    }
  };

  const appraiseeScores = useMemo(() => calculateScores(achievements), [achievements, kpiConfigs, kriWeights, compWeights, competencyData]);
  const supervisorScores = useMemo(() => calculateScores(supervisorAchievements), [supervisorAchievements, kpiConfigs, kriWeights, compWeights, competencyData]);

  const currentScores = isSupervisorView ? supervisorScores : appraiseeScores;

  const handleAchievementChange = (id: string, value: string) => {
    const num = parseFloat(value) || 0;
    if (isSupervisorView) {
      setSupervisorAchievements(prev => ({ ...prev, [id]: num }));
    } else {
      setAchievements(prev => ({ ...prev, [id]: num }));
    }
  };

  const handleWeightChange = (name: string, value: string) => {
    const num = parseFloat(value) || 0;
    setCompWeights(prev => ({ ...prev, [name]: num }));
  };

  const handleKriWeightChange = (id: string, value: string) => {
    const num = parseFloat(value) || 0;
    setKriWeights(prev => ({ ...prev, [id]: num }));
  };

  const quickFill = () => {
    const newAchievements: Record<string, number> = {};
    activeTemplate.kras.forEach(kra => {
      kra.objectives.forEach(obj => {
        obj.kpis.forEach(kpi => {
          newAchievements[kpi.id] = kpi.direction === 'lower' ? (kpi.criteria.O || 5) : (kpi.criteria.O || 95);
        });
      });
    });
    
    competencyData.forEach(cluster => {
      cluster.items.forEach(item => {
        newAchievements[`comp_${item.name}`] = 4;
      });
    });

    DEFAULT_OPERATIONS_ITEMS.forEach(item => {
      newAchievements[`op_${item.name}`] = item.target;
    });

    if (isSupervisorView) {
      setSupervisorAchievements(prev => ({ ...prev, ...newAchievements }));
    } else {
      setAchievements(prev => ({ ...prev, ...newAchievements }));
    }
  };

  return (
    <div className="w-full max-w-[1800px] mx-auto space-y-4 pb-24">
      <Card className="p-2 lg:p-3 sticky top-16 lg:top-[72px] z-40 overflow-hidden">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2 px-1">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-primary-600 rounded-full" />
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none uppercase">Appraisal Portal</h1>
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] leading-none mt-1">Performance Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-black mb-0.5 leading-none">Active Period</p>
              <p className="text-[13px] font-black text-slate-900 uppercase">Q2 2026 Appraisal</p>
            </div>
            
            <div className="flex items-center gap-1.5 border-l border-slate-100 pl-3">
                  <button 
                    onClick={quickFill}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 text-amber-600 rounded-lg font-bold text-[10px] hover:bg-amber-100 transition-all border border-amber-100 uppercase tracking-tight"
                  >
                    <Zap size={9} />
                    <span>Quick Fill</span>
                  </button>

                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50/50 rounded-full border border-slate-100/50">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">Supervisor</span>
                  <button 
                    onClick={() => setIsSupervisorView(!isSupervisorView)}
                    className={cn("w-6 h-3 rounded-full transition-all relative", isSupervisorView ? "bg-indigo-600" : "bg-slate-200")}
                  >
                    <div className={cn("absolute top-0.5 w-2 h-2 bg-white rounded-full shadow-sm transition-all", isSupervisorView ? "left-3.5" : "left-0.5")} />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50/50 rounded-full border border-slate-100/50">
                   <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">Admin</span>
                   <button 
                     onClick={() => setIsAdmin(!isAdmin)}
                     className={cn("w-6 h-3 rounded-full transition-all relative", isAdmin ? "bg-slate-900" : "bg-slate-200")}
                   >
                     <div className={cn("absolute top-0.5 w-2 h-2 bg-white rounded-full shadow-sm transition-all", isAdmin ? "left-3.5" : "left-0.5")} />
                   </button>
                </div>
               
               <button className="flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-lg font-black text-[11px] hover:bg-slate-800 transition-all shadow-sm active:scale-95 uppercase tracking-wider">
                  <Save size={10} />
                  <span>Save</span>
               </button>
            </div>
          </div>
        </div>

        <div className="px-1 mb-2">
           <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Step {activeStep + 1} / {STEPS.length}
              </span>
              <span className="text-[10px] font-black text-slate-900">
                {Math.round(((activeStep + 1) / STEPS.length) * 100)}%
              </span>
           </div>
           <div className="h-1 w-full bg-slate-100 rounded-full flex gap-0.5">
              {STEPS.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    i <= activeStep ? "bg-slate-900" : "bg-slate-200",
                    i === activeStep ? "flex-1" : "w-6"
                  )}
                />
              ))}
           </div>
        </div>

        <div className="relative">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">
            {STEPS.map((step, idx) => (
               <button
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={cn(
                  "min-w-[80px] sm:min-w-[110px] flex-1 h-14 sm:h-16 rounded-xl border flex-shrink-0 transition-all duration-300 snap-start flex items-center gap-2 sm:gap-2.5 px-2 sm:px-3 relative overflow-hidden group",
                  idx === activeStep
                    ? "bg-primary-950 border-primary-950 text-white shadow-heavy z-10"
                    : "bg-slate-50/50 border-slate-100/50 hover:bg-white hover:shadow-sm hover:border-slate-200 text-slate-700"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center transition-all duration-300",
                  idx === activeStep ? "bg-white/15" : "bg-white border border-slate-200 shadow-sm"
                )}>
                  {React.cloneElement(step.icon as React.ReactElement, { 
                    size: 14,
                    className: idx === activeStep ? "text-white" : "text-slate-400"
                  })}
                </div>
                <div className="flex flex-col items-start min-w-0">
                  <span className={cn(
                    "text-[11px] font-black leading-none truncate w-full uppercase tracking-tight",
                    idx === activeStep ? "text-white" : "text-slate-600"
                  )}>
                    {step.label.split(': ')[1]}
                  </span>
                  <span className={cn(
                    "text-[10px] font-black mt-0.5 leading-none",
                    idx === activeStep ? "text-primary-300" : "text-slate-400"
                  )}>
                    {idx + 1}/{STEPS.length}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Card>


      <Card className="p-0 overflow-hidden min-h-[400px] transition-all mb-20">
         {loading ? (
            <div className="p-12 xl:p-24 space-y-12 animate-pulse">
               <div className="flex items-center gap-6 mb-16">
                  <Skeleton className="w-16 h-16 rounded-[24px]" />
                  <div className="space-y-2">
                     <Skeleton className="h-8 w-64" />
                     <Skeleton className="h-4 w-96" />
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  {[1,2,3,4,5,6].map(i => (
                     <div key={i} className="space-y-4">
                        <Skeleton className="h-2 w-24" />
                        <Skeleton className="h-14 w-full rounded-3xl" />
                     </div>
                  ))}
               </div>
            </div>
         ) : (
         <AnimatePresence mode="wait">
            {activeStep === 0 && (
               <motion.div 
                  key="step-0"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  className="p-6 lg:p-8 space-y-6"
               >
                  <div className="max-w-7xl mx-auto space-y-6">
                     <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-md">
                              <User size={16} />
                           </div>
                           <div>
                              <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">Employee Information</h2>
                              <p className="text-xs text-slate-400 font-medium mt-1">Auto-populated from your staff profile — read only.</p>
                           </div>
                        </div>
                        <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg uppercase tracking-widest">Read Only</span>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                        {[
                           { label: 'Full Name', value: employeeInfo.name, icon: <User size={14} /> },
                           { label: 'IPPIS Number', value: employeeInfo.ippisNo, icon: <Fingerprint size={14} /> },
                           { label: 'Email Address', value: employeeInfo.email, icon: <Mail size={14} /> },
                           { label: 'Phone Number', value: employeeInfo.phone, icon: <Phone size={14} /> },
                           { label: 'Designation', value: employeeInfo.designation, icon: <Briefcase size={14} /> },
                           { label: 'Department ID', value: employeeInfo.department, icon: <MapPin size={14} /> },
                        ].map((item) => (
                           <div key={item.label} className="space-y-1.5">
                              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.12em] flex items-center gap-1.5">
                                 {item.icon} {item.label}
                              </label>
                              <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 uppercase tracking-tight">
                                 {item.value || <span className="text-slate-300 normal-case font-normal">Not set</span>}
                              </div>
                           </div>
                        ))}
                        <div className="md:col-span-2 space-y-1.5">
                           <label className="text-xs font-black text-slate-400 uppercase tracking-[0.12em] flex items-center gap-1.5">
                              <Calendar size={14} /> Appraisal Period
                           </label>
                           <select
                              value={selectedPeriod.value}
                              onChange={(e) => {
                                 const p = APPRAISAL_PERIODS.find(p => p.value === e.target.value);
                                 if (p) setSelectedPeriod(p);
                              }}
                              className="w-full bg-white border border-primary-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-900 outline-none focus:border-primary-500 transition-all cursor-pointer"
                           >
                              {APPRAISAL_PERIODS.map(p => (
                                 <option key={p.value} value={p.value}>{p.label}</option>
                              ))}
                           </select>
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}

            {activeStep === 1 && (
               <motion.div 
                  key="step-1"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  className="p-6 lg:p-8 space-y-6"
               >
                  <div className="max-w-6xl mx-auto space-y-6">
                     <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-md">
                              <Users size={16} />
                           </div>
                           <div>
                              <h2 className="text-base font-black text-slate-900 tracking-tight uppercase">Supervisor Information</h2>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Resolved from your org hierarchy — read only.</p>
                           </div>
                        </div>
                        <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg uppercase tracking-widest">Read Only</span>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                        {[
                           { label: 'Supervisor Name', value: supervisorInfo.name },
                           { label: 'Designation', value: supervisorInfo.designation },
                           { label: 'Email', value: supervisorInfo.email },
                        ].map((item) => (
                           <div key={item.label} className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em]">{item.label}</label>
                              <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 uppercase tracking-tight">
                                 {item.value || <span className="text-slate-300 normal-case font-normal">Not assigned</span>}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </motion.div>
            )}

            {activeStep === 2 && (
               <motion.div 
                  key="step-2"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  className="p-6 lg:p-8 space-y-6"
               >
                  <div className="max-w-6xl mx-auto space-y-6">
                     <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
                              <UserCheck size={16} />
                           </div>
                           <div>
                              <h2 className="text-base font-black text-slate-900 tracking-tight uppercase">Counter-Signing Officer</h2>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Resolved from your org hierarchy — read only.</p>
                           </div>
                        </div>
                        <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg uppercase tracking-widest">Read Only</span>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                        {[
                           { label: 'Officer Name', value: counterSigningInfo.name },
                           { label: 'Designation', value: counterSigningInfo.designation },
                           { label: 'Email', value: counterSigningInfo.email },
                        ].map((item) => (
                           <div key={item.label} className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em]">{item.label}</label>
                              <div className="w-full bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-2.5 text-sm font-semibold text-indigo-900 uppercase tracking-tight">
                                 {item.value || <span className="text-slate-300 normal-case font-normal">Not assigned</span>}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </motion.div>
            )}

            {activeStep === 3 && (
               <motion.div 
                  key="step-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 lg:p-6 space-y-4"
               >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 text-white p-4 rounded-2xl relative overflow-hidden">
                     <div className="relative z-10">
                        <h2 className="text-sm font-black tracking-tight uppercase">Section 4: Task Performance</h2>
                        <p className="text-slate-400 text-[10px] mt-0.5">Report progress against Key Result Areas and KPIs.</p>
                     </div>
                     <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl -mr-16 -mt-16" />
                  </div>

                  {activeTemplate.kras.map((kra) => (
                     <div key={kra.id} className="space-y-3">
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-2">
                           <div className="flex items-center gap-3">
                              <div className="w-12 h-7 bg-slate-900 rounded-lg flex items-center justify-center text-white font-mono text-xs uppercase font-black">
                                 KRA {kra.serialNo}
                              </div>
                              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{kra.name}</h3>
                           </div>
                        </div>
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="p-2 text-left">Description</th>
                                        <th className="p-2 w-24">Achievement</th>
                                        <th className="p-2 w-20">Raw</th>
                                        <th className="p-2 w-24">Weighted Raw</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {kra.objectives.flatMap(obj => obj.kpis).map(kpi => (
                                        <tr key={kpi.id} className="border-b border-slate-100">
                                            <td className="p-3">{kpi.description}</td>
                                            <td className="p-3 align-middle border-r border-slate-100 bg-slate-50/50">
                                                <input 
                                                    type="number"
                                                    value={achievements[kpi.id] || ''}
                                                    onChange={(e) => handleAchievementChange(kpi.id, e.target.value)}
                                                    className="w-full h-8 bg-white border border-slate-200 rounded px-2"
                                                />
                                            </td>
                                            <td className="p-3 text-center border-r border-slate-100 align-middle">
                                                {calculateRawScore(achievements[kpi.id] || 0, { o: 100, e: 80, vg: 75, g: 60, f: 50, p: 40 })}
                                            </td>
                                            <td className="p-3 text-center align-middle bg-indigo-50/30">
                                                {calculateWeightedRawScore((kpi as any).weight || 10, calculateRawScore(achievements[kpi.id] || 0, { o: 100, e: 80, vg: 75, g: 60, f: 50, p: 40 })).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                     </div>
                  ))}
               </motion.div>
            )}

            {activeStep === 4 && (
               <motion.div 
                  key="step-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 lg:p-6 space-y-4"
               >
                  <div className="bg-indigo-900 rounded-xl p-4 text-white flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden">
                     <div className="relative z-10 flex items-center gap-3">
                        <Brain size={20} className="text-indigo-400" />
                        <div>
                           <h3 className="text-sm font-black uppercase tracking-tight">Section 5: Competencies</h3>
                           <p className="text-indigo-300 text-[10px] mt-0.5">Assessed through observed behaviors and professional values.</p>
                        </div>
                     </div>
                     <div className="relative z-10 text-right">
                        <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">Score</p>
                        <span className="text-2xl font-black text-white">{currentScores.competency.toFixed(2)}<span className="text-sm text-indigo-400 ml-0.5">%</span></span>
                     </div>
                  </div>
                  <div className="space-y-6">
                     {competencyData.map((cluster) => (
                        <div key={cluster.cluster} className="space-y-3">
                           <div className="flex items-center gap-3">
                              <div className="h-px flex-1 bg-slate-100" />
                              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">{cluster.cluster}</h3>
                              <div className="h-px flex-1 bg-slate-100" />
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {cluster.items.map((item) => (
                                 <div key={item.name} className="bg-white p-4 rounded-xl border border-slate-100 hover:border-indigo-100 transition-all flex flex-col justify-between gap-3">
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight leading-tight">{item.name}</h4>
                                    <div className="flex gap-1">
                                       {[1, 2, 3, 4, 5].map((s) => (
                                          <button key={s} onClick={() => handleAchievementChange(`comp_${item.name}`, s.toString())}
                                             className={cn("flex-1 h-8 rounded-lg text-xs font-black transition-all border", (isSupervisorView ? supervisorAchievements[`comp_${item.name}`] : achievements[`comp_${item.name}`]) === s ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300 hover:text-slate-900")}>
                                             {s}
                                          </button>
                                       ))}
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     ))}
                  </div>
               </motion.div>
            )}

            {activeStep === 5 && (
                <motion.div 
                   key="step-5"
                   initial={{ opacity: 0, scale: 0.98 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 1.02 }}
                   transition={{ duration: 0.4 }}
                   className="p-4 lg:p-6 space-y-4"
                >
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {DEFAULT_OPERATIONS_ITEMS.map((item) => (
                         <div key={item.name} className="bg-white p-4 rounded-xl border border-slate-100 hover:border-indigo-100 transition-all">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight mb-3">{item.name}</h4>
                            <div className="flex gap-1">
                               {Array.from({ length: item.max + 1 }).map((_, s) => (
                                  <button key={s} onClick={() => handleAchievementChange(`op_${item.name}`, s.toString())}
                                     className={cn("flex-1 h-8 rounded-lg font-black text-xs transition-all border", (isSupervisorView ? supervisorAchievements[`op_${item.name}`] : achievements[`op_${item.name}`]) === s ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300 hover:text-slate-900")}>
                                     {s}
                                  </button>
                               ))}
                            </div>
                         </div>
                      ))}
                   </div>
                </motion.div>
            )}

            {activeStep === 6 && (
               <motion.div 
                  key="step-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 lg:p-6 space-y-4"
               >
                  <textarea 
                     placeholder="Add comments..."
                     value={comments.appraiseeComments}
                     onChange={(e) => handleCommentChange('appraiseeComments', e.target.value)}
                     className="w-full h-32 p-4 rounded-xl border border-slate-200"
                  />
                  <label className="flex items-center gap-2">
                     <input type="checkbox" checked={comments.appraiseeSigned} onChange={(e) => handleCommentChange('appraiseeSigned', e.target.checked)} />
                     Sign Digitally
                  </label>
               </motion.div>
            )}

            {activeStep === 7 && (
               <motion.div 
                  key="step-7"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 lg:p-6 space-y-4"
               >
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                     <div className="w-8 h-8 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><CheckCircle2 size={16} /></div>
                     <div>
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Review & Submit</h2>
                        <p className="text-[10px] text-slate-400 mt-0.5">Review your performance summary before final submission.</p>
                     </div>
                  </div>
                  
                  <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="space-y-3">
                           {[
                              { label: 'Section 4: Tasks (70%)', value: (currentScores.kpi.total * 0.7).toFixed(2) },
                              { label: 'Section 5: Competencies (20%)', value: currentScores.competency.toFixed(2) },
                              { label: 'Section 6: Operations (10%)', value: currentScores.ops.score.toFixed(2) },
                           ].map((row) => (
                              <div key={row.label} className="flex justify-between items-center py-2 border-b border-white/10">
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.label}</span>
                                 <span className="text-base font-black text-indigo-400">{row.value} Pts</span>
                              </div>
                           ))}
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 flex flex-col items-center justify-center gap-1 text-center border border-white/10">
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Appraisal Rate</p>
                           <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-black tracking-tighter text-white">{(currentScores.kpi.total * 0.7 + currentScores.competency + currentScores.ops.score).toFixed(2)}</span>
                              <span className="text-xs font-bold text-indigo-400">/ 100</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="bg-red-50 border border-red-100 rounded-xl p-6 space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                            <Activity size={16} />
                         </div>
                         <div>
                            <h3 className="text-xs font-black text-red-900 uppercase tracking-tight">Appraisal Appeal (Optional)</h3>
                            <p className="text-[9px] text-red-600 font-bold uppercase tracking-widest mt-0.5">Lodge an appeal if you disagree with the preliminary assessment.</p>
                         </div>
                      </div>
                      <div className="space-y-3">
                         <p className="text-[10px] text-red-800 leading-relaxed italic">
                            "If you believe your supervisor's scores do not accurately reflect your performance, you may lodge a formal appeal here. This will be reviewed by the Counter-Signing Officer."
                         </p>
                         <textarea 
                            placeholder="State your grounds for appeal here (optional)..."
                            className="w-full h-24 bg-white border border-red-200 rounded-lg p-3 text-[11px] font-semibold focus:ring-4 focus:ring-red-500/5 outline-none transition-all placeholder:text-red-200"
                            value={comments.staffAppeal || ''}
                            onChange={(e) => handleCommentChange('staffAppeal', e.target.value)}
                         />
                      </div>
                   </div>
               </motion.div>
            )}
          </AnimatePresence>
          )}
       </Card>

      {/* Footer Actions */}
      <footer className="fixed bottom-0 left-0 lg:left-80 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 p-6 z-50">
         <div className="max-w-[1800px] mx-auto flex justify-between items-center px-8">
            <button 
               onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
               disabled={activeStep === 0}
               className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all"
            >
               <ChevronLeft size={20} />
               Back
            </button>
            
            <div className="flex items-center gap-4">
               {isSubmitted ? (
                 <button 
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:shadow-xl transition-all active:scale-95"
                 >
                    <FileText size={18} />
                    Download Appraisal PDF
                 </button>
               ) : activeStep === 7 ? (
                  <button 
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:shadow-xl transition-all active:scale-95"
                  >
                     <Send size={18} />
                     Submit Appraisal
                  </button>
               ) : (
                  <button 
                     onClick={() => setActiveStep(prev => Math.min(STEPS.length - 1, prev + 1))}
                     className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:shadow-xl transition-all active:scale-95"
                  >
                     Next
                     <ChevronRight size={18} />
                  </button>
               )}
            </div>
         </div>
      </footer>
    </div>
  );
};
