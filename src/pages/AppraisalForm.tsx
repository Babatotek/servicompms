import React, { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications } from '../context/NotificationContext';
import { generateAppraisalPDF } from '../lib/exportUtils';
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
  Fingerprint
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

// ── Signature persistence hook ────────────────────────────────────────────────
// Stores the user's signature as a base64 data URL in localStorage keyed by IPPIS.
// Once uploaded it is reused across all future appraisals automatically.
const SIG_KEY = (ippisNo: string) => `sig_${ippisNo}`;

function useSignature(ippisNo: string) {
  const [sigDataUrl, setSigDataUrl] = React.useState<string | null>(() => {
    try { return localStorage.getItem(SIG_KEY(ippisNo)); } catch { return null; }
  });

  const save = useCallback((dataUrl: string) => {
    setSigDataUrl(dataUrl);
    try { localStorage.setItem(SIG_KEY(ippisNo), dataUrl); } catch {}
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
  const { addNotification } = useNotifications();
  const { submitAppraisal } = useAppraisals();
  const { templates } = useOrg();
  const { sigDataUrl, save: saveSig, clear: clearSig } = useSignature(user?.ippisNo ?? '');
  const sigInputRef = useRef<HTMLInputElement>(null);
  const [sigDragOver, setSigDragOver] = useState(false);

  // Process uploaded file → base64, crop whitespace via canvas, store
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
        // Draw onto canvas with white background, then export as PNG
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        saveSig(canvas.toDataURL('image/png'));
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

  // Available appraisal periods — in production these come from AdminSettings config
  const APPRAISAL_PERIODS = [
    { label: 'Q1 (January - March 2026)', value: 'Q1-2026' },
    { label: 'Q2 (April - June 2026)', value: 'Q2-2026' },
    { label: 'Q3 (July - September 2026)', value: 'Q3-2026' },
    { label: 'Q4 (October - December 2026)', value: 'Q4-2026' },
  ];
  const [selectedPeriod, setSelectedPeriod] = useState(APPRAISAL_PERIODS[1]); // default Q2

  const [activeTemplate, setActiveTemplate] = useState<PerformanceTemplate>(templates[0] ?? PERFORMANCE_TEMPLATES[0]);

  React.useEffect(() => {
    // Gap 1 fix: load from snapshotted KRAs, not live template
    const savedContract = localStorage.getItem(`active_contract_${user?.ippisNo}`);
    if (savedContract) {
       const contract = JSON.parse(savedContract);
       if (contract.kras) {
         // Use the locked snapshot — immune to template edits
         setActiveTemplate(prev => ({ ...prev, kras: contract.kras }));
         addNotification('info', 'Contract Loaded', `Appraisal loaded from approved contract (ID: ${contract.id})`);
       } else if (contract.templateId) {
         // Fallback for old contracts saved before snapshot fix — search live templates first
         const template = templates.find(t => t.id === contract.templateId) ?? PERFORMANCE_TEMPLATES.find(t => t.id === contract.templateId);
         if (template) setActiveTemplate(template);
       }
    }
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [user, addNotification]);
  
  // Section 1: Employee Info — read-only, derived from auth context (Gap 2 fix)
  const employeeInfo = {
    name: `${user?.surname ?? ''} ${user?.firstname ?? ''}`.trim(),
    ippisNo: user?.ippisNo ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    designation: user?.designation ?? '',
    department: user?.departmentId ?? '',
    period: selectedPeriod.label,
  };

  // Section 2: Supervisor Info — read-only from org hierarchy
  // In production resolved via API from user.supervisorId; using mock lookup here
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
  
  // Section 7: Comments State
  const [comments, setComments] = useState({
    appraiserRating: '',
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

  // Effect to update configs when template changes (on sync)
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
    
    // Also update weights
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
  
  // Gap 6 fix: separate cluster-level weights from item-level weights
  // Cluster weights must sum to 20 (the Section 5 allocation)
  const [clusterWeights, setClusterWeights] = useState<Record<string, number>>({
    'Generic Competencies': 8,
    'Functional Competencies': 8,
    'Ethics & Values': 4,
  });
  // Item weights must sum to their parent cluster weight
  const [compWeights, setCompWeights] = useState<Record<string, number>>({
    'Drive for Results': 4,
    'Collaborating & Partnering': 2,
    'Effective Communication': 2,
    'Policy Management': 3,
    'Public Relations Management': 3,
    'Information & Records Management': 2,
    'Integrity': 2,
    'Inclusiveness': 1,
    'Transparency & Accountability': 1,
  });

  const COMPETENCY_ALLOCATION = 20;

  const competencyData = useMemo(() => [
    { 
       cluster: 'Generic Competencies', 
       items: [
          { name: 'Drive for Results', target: 4 },
          { name: 'Collaborating & Partnering', target: 2 },
          { name: 'Effective Communication', target: 2 }
       ] 
    },
    { 
       cluster: 'Functional Competencies', 
       items: [
          { name: 'Policy Management', target: 2 },
          { name: 'Public Relations Management', target: 2 },
          { name: 'Information & Records Management', target: 2 }
       ] 
    },
    { 
       cluster: 'Ethics & Values', 
       items: [
          { name: 'Integrity', target: 2 },
          { name: 'Inclusiveness', target: 2 },
          { name: 'Transparency & Accountability', target: 2 }
       ] 
    }
  ], []);

  // Validation: cluster weights must sum to 20
  const totalClusterWeight = useMemo(() => {
    return Object.values(clusterWeights).reduce((a: number, b: number) => a + b, 0);
  }, [clusterWeights]);

  // Validation: each cluster's item weights must sum to the cluster weight
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

  const calculateScores = (targetAchievements: Record<string, number>) => {
    /* ... existing calculateScores ... */
    const kpiItems: Record<string, { raw: number; weighted: number; grade: string; gradedWeight: number }> = {};
    let kpiTotal = 0;
    
    // ... logic same ...
    const sectionWeightTotal = 70;
    const maxRaw = 5;
    const targetGradedSum = sectionWeightTotal / maxRaw; 

    let totalObjWeight = 0;
    activeTemplate.kras.forEach(kra => {
      kra.objectives.forEach(obj => {
        totalObjWeight += kriWeights[obj.id] || 0;
      });
    });

    activeTemplate.kras.forEach(kra => {
      kra.objectives.forEach(obj => {
        const objWeight = kriWeights[obj.id] || 0;
        const numKpis = obj.kpis.length;
        const objGradedWeight = (totalObjWeight > 0) ? (objWeight / totalObjWeight) * targetGradedSum : 0;
        const kpiGradedWeight = numKpis > 0 ? objGradedWeight / numKpis : 0;

        obj.kpis.forEach(kpi => {
          const val = targetAchievements[kpi.id] || 0;
          const config = kpiConfigs[kpi.id];
          if (!config) return; // Guard for sync state
          const criteria = config.criteria;
          const direction = config.direction || 'higher';
          
          let grade = 'P';
          let raw = 0;
          
          if (direction === 'higher') {
            if (val >= criteria.O) { grade = 'O'; raw = 5; }
            else if (val >= criteria.E) { grade = 'E'; raw = 4; }
            else if (val >= criteria.VG) { grade = 'VG'; raw = 3; }
            else if (val >= criteria.G) { grade = 'G'; raw = 2; }
            else if (val >= criteria.F) { grade = 'F'; raw = 1; }
          } else {
            if (val <= criteria.O) { grade = 'O'; raw = 5; }
            else if (val <= criteria.E) { grade = 'E'; raw = 4; }
            else if (val <= criteria.VG) { grade = 'VG'; raw = 3; }
            else if (val <= criteria.G) { grade = 'G'; raw = 2; }
            else if (val <= criteria.F) { grade = 'F'; raw = 1; }
          }
          
          const weighted = raw * kpiGradedWeight;
          kpiItems[kpi.id] = { raw, weighted, grade, gradedWeight: kpiGradedWeight };
          kpiTotal += weighted;
        });
      });
    });

    // Competency Score
    let compTotal = 0;
    competencyData.forEach(cluster => {
      cluster.items.forEach(item => {
        const rating = targetAchievements[`comp_${item.name}`] || 0;
        const weight = compWeights[item.name] || 0;
        compTotal += (rating / 5) * weight;
      });
    });

    // Ops Score
    const opsItems = [
      { name: 'Punctuality / Attendance', target: 4 },
      { name: 'Work Turnaround Time', target: 3 },
      { name: 'Innovation on the Job', target: 3 },
      { name: 'Professional Ethics & Integrity', target: 4 },
    ];
    let opsPointsTotal = 0;
    opsItems.forEach(item => {
      opsPointsTotal += targetAchievements[`op_${item.name}`] || 0;
    });
    const opsScoreVal = (opsPointsTotal / 20) * 10;

    return {
      kpi: { items: kpiItems, total: kpiTotal },
      competency: compTotal,
      ops: { points: opsPointsTotal, score: opsScoreVal },
      grandTotal: kpiTotal + compTotal + opsScoreVal
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
      // Gap 3 fix: write to shared AppraisalContext so TeamReview can read it
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
    } catch (error) {
      addNotification('error', 'Submission Failed', 'An error occurred. Please try again.');
    }
  };

  const handleDownload = () => {
    const finalScore = isSupervisorView ? supervisorScores.grandTotal : appraiseeScores.grandTotal;
    const fileName = `Appraisal_${employeeInfo.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
    generateAppraisalPDF({ ...currentStaffData, score: finalScore }, fileName);
    addNotification('Generating PDF report...', 'info');
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

    const opsItems = ['Punctuality / Attendance', 'Work Turnaround Time', 'Innovation on the Job', 'Professional Ethics & Integrity'];
    opsItems.forEach(name => {
      newAchievements[`op_${name}`] = 4;
    });

    if (isSupervisorView) {
      setSupervisorAchievements(prev => ({ ...prev, ...newAchievements }));
    } else {
      setAchievements(prev => ({ ...prev, ...newAchievements }));
    }
  };

  return (
    <div className="w-full max-w-[1800px] mx-auto space-y-4 pb-24">
      {/* Header & Stepper Section - Significantly More Compact */}
      <Card className="p-2 lg:p-3 sticky top-16 lg:top-[72px] z-40 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2 px-1">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-primary-600 rounded-full" />
            <div>
              <h1 className="text-sm font-black text-slate-900 tracking-tighter leading-none uppercase italic">Appraisal Portal</h1>
              <p className="text-slate-400 font-black text-[8px] uppercase tracking-[0.2em] leading-none mt-0.5 italic">Performance Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-[7px] uppercase tracking-widest text-slate-400 font-black mb-0.5 leading-none">Active Period</p>
              <p className="text-[11px] font-black text-slate-900 uppercase italic">Q2 2026 Appraisal</p>
            </div>
            
            <div className="flex items-center gap-1.5 border-l border-slate-100 pl-3">
                <button 
                  onClick={quickFill}
                  className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded-lg font-bold text-[8px] hover:bg-amber-100 transition-all border border-amber-100 uppercase tracking-tight"
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
               
               <button className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg font-black text-[9px] hover:bg-slate-800 transition-all shadow-sm active:scale-95 uppercase tracking-wider">
                  <Save size={10} />
                  <span>Save</span>
               </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-1 mb-2">
           <div className="flex justify-between items-center mb-1">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                Step {activeStep + 1} / {STEPS.length}
              </span>
              <span className="text-[8px] font-black text-slate-900">
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

        {/* Stepper Cards - Compact Horizontal Style */}
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
                    "text-[10px] font-black leading-none truncate w-full uppercase tracking-tight",
                    idx === activeStep ? "text-white" : "text-slate-600"
                  )}>
                    {step.label.split(': ')[1]}
                  </span>
                  <span className={cn(
                    "text-[9px] font-black mt-0.5 leading-none",
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


      {/* Form Area */}
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
                              <h2 className="text-base font-black text-slate-900 tracking-tight uppercase italic">Employee Information</h2>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Auto-populated from your staff profile — read only.</p>
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
                           <div key={item.label} className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] flex items-center gap-1.5">
                                 {item.icon} {item.label}
                              </label>
                              <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 uppercase tracking-tight">
                                 {item.value || <span className="text-slate-300 italic normal-case font-normal">Not set</span>}
                              </div>
                           </div>
                        ))}
                        {/* Period selector — Gap 4 fix */}
                        <div className="md:col-span-2 space-y-1">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] flex items-center gap-1.5">
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
                              <h2 className="text-base font-black text-slate-900 tracking-tight uppercase italic">Supervisor Information</h2>
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
                                 {item.value || <span className="text-slate-300 italic normal-case font-normal">Not assigned</span>}
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
                              <h2 className="text-base font-black text-slate-900 tracking-tight uppercase italic">Counter-Signing Officer</h2>
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
                                 {item.value || <span className="text-slate-300 italic normal-case font-normal">Not assigned</span>}
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
                        <h2 className="text-sm font-black tracking-tight uppercase italic">Section 4: Task Performance</h2>
                        <p className="text-slate-400 text-[10px] mt-0.5">Report progress against Key Result Areas and KPIs.</p>
                     </div>
                     {/* Grade legend — shown once here, not repeated per KPI */}
                     <div className="relative z-10 flex items-center gap-1.5">
                        {[
                          { g: 'O', label: 'Outstanding', color: 'bg-green-500' },
                          { g: 'E', label: 'Excellent', color: 'bg-blue-500' },
                          { g: 'VG', label: 'Very Good', color: 'bg-violet-500' },
                          { g: 'G', label: 'Good', color: 'bg-amber-500' },
                          { g: 'F', label: 'Fair', color: 'bg-orange-500' },
                          { g: 'P', label: 'Poor', color: 'bg-red-500' },
                        ].map(({ g, label, color }) => (
                          <div key={g} title={label} className="flex items-center gap-1 px-1.5 py-0.5 bg-white/10 rounded-md">
                            <div className={cn("w-1.5 h-1.5 rounded-full", color)} />
                            <span className="text-[9px] font-black text-white/80 uppercase tracking-wide">{g}</span>
                          </div>
                        ))}
                     </div>
                     <div className="flex items-center gap-3 relative z-10">
                        <div className="text-right">
                           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Composite Score</p>
                           <p className="text-2xl font-black text-indigo-400">{currentScores.kpi.total.toFixed(1)}%</p>
                        </div>
                        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                           <Target size={18} />
                        </div>
                     </div>
                     <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl -mr-16 -mt-16" />
                  </div>

                  {activeTemplate.kras.map((kra) => (
                     <div key={kra.id} className="space-y-3">
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-2">
                           <div className="flex items-center gap-3">
                              <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center text-white font-mono text-xs">
                                 {kra.serialNo}
                              </div>
                              <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-tight">{kra.name}</h3>
                           </div>
                           <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500">
                              KRA Weight: 
                              <input 
                                 type="number"
                                 value={kriWeights[kra.id] || 0}
                                 onChange={(e) => handleKriWeightChange(kra.id, e.target.value)}
                                 disabled={!isAdmin}
                                 className={cn("w-10 bg-transparent text-center outline-none border-b border-dashed ml-1", isAdmin ? "border-indigo-300 text-indigo-600" : "border-transparent")}
                              />
                           </span>
                        </div>

                        {kra.objectives.map((obj) => (
                           <div key={obj.id} className="ml-0 sm:ml-6 pl-4 border-l-2 border-slate-100 space-y-3">
                              <div className="flex flex-col lg:flex-row justify-between items-start gap-2">
                                 <div className="flex-1">
                                    <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mb-1 block">Objective</span>
                                    <p className="text-xs font-semibold text-slate-700 leading-relaxed italic">"{obj.description}"</p>
                                 </div>
                                 <div className="flex gap-2 flex-shrink-0">
                                    <div className="px-2 py-1 bg-slate-50 rounded-lg text-[9px] font-bold text-slate-400">
                                       Wt: <input type="number" value={kriWeights[obj.id] || 0} onChange={(e) => handleKriWeightChange(obj.id, e.target.value)} disabled={!isAdmin} className={cn("w-8 bg-transparent text-center outline-none border-b border-dashed", isAdmin ? "border-indigo-300 text-indigo-600" : "border-transparent")} />
                                    </div>
                                    <div className="px-2 py-1 bg-indigo-50 rounded-lg text-[9px] font-bold text-indigo-500">
                                       Graded: {(() => { const firstKpiId = obj.kpis[0]?.id; const kpiScore = currentScores.kpi.items[firstKpiId]; return (kpiScore?.gradedWeight * obj.kpis.length || 0).toFixed(2); })()}
                                    </div>
                                 </div>
                              </div>

                              <div className="space-y-2">
                                 {obj.kpis.map((kpi) => {
                                    const config = kpiConfigs[kpi.id];
                                    const currentScore = currentScores.kpi.items[kpi.id];
                                    return (
                                       <div key={kpi.id} className="bg-white border border-slate-100 rounded-xl p-4 hover:border-indigo-100 transition-all">
                                          <div className="flex flex-col xl:flex-row gap-4">
                                             <div className="flex-1 space-y-3">
                                                <div className="flex items-start gap-2">
                                                   <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                                                   <p className="text-xs font-semibold text-slate-900 leading-normal">{kpi.description}</p>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                   <div className="space-y-1">
                                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Target</p>
                                                      <div className="flex items-center gap-1">
                                                         <input type="number" value={config.target} onChange={(e) => handleKpiConfigChange(kpi.id, 'target', e.target.value)} disabled={!isAdmin} className={cn("w-12 bg-transparent border-b border-dashed text-sm font-black outline-none", isAdmin ? "border-indigo-300 text-indigo-700" : "border-transparent text-slate-700 cursor-not-allowed")} />
                                                         <input type="text" value={config.unit} onChange={(e) => handleKpiConfigChange(kpi.id, 'unit', e.target.value)} disabled={!isAdmin} className={cn("w-10 bg-transparent border-b border-dashed text-[10px] outline-none", isAdmin ? "border-indigo-300 text-indigo-400" : "border-transparent text-slate-400 cursor-not-allowed")} />
                                                      </div>
                                                   </div>
                                                   <div className="sm:col-span-2 space-y-1">
                                                      <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">Actual Achievement</p>
                                                      <input type="number" value={(isSupervisorView ? supervisorAchievements[kpi.id] : achievements[kpi.id]) || ''} onChange={(e) => handleAchievementChange(kpi.id, e.target.value)} placeholder="Enter value..." className="w-full bg-indigo-50/50 border border-indigo-100 rounded-lg px-3 py-2 text-sm font-black text-indigo-700 outline-none focus:border-indigo-400 focus:bg-white transition-all" />
                                                   </div>
                                                </div>
                                             </div>

                                             <div className="xl:w-px xl:h-auto h-px w-full bg-slate-100" />

                                             <div className="flex items-center gap-4 px-2">
                                                <div className="text-center">
                                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Grade</p>
                                                   <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm border", currentScore?.grade === 'O' ? "bg-green-50 text-green-600 border-green-200" : currentScore?.grade === 'P' ? "bg-red-50 text-red-600 border-red-200" : "bg-indigo-50 text-indigo-600 border-indigo-200")}>
                                                      {currentScore?.grade || '—'}
                                                   </div>
                                                </div>
                                                <div className="text-center">
                                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Weighted</p>
                                                   <p className="text-lg font-black text-slate-900">{currentScore?.weighted.toFixed(2) || '0.00'}</p>
                                                </div>
                                             </div>
                                          </div>

                                       </div>
                                    );
                                 })}
                              </div>
                           </div>
                        ))}
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
                           <h3 className="text-sm font-black uppercase italic tracking-tight">Section 5: Competencies</h3>
                           <p className="text-indigo-300 text-[10px] mt-0.5">Assessed through observed behaviors and professional values.</p>
                        </div>
                     </div>
                     <div className="relative z-10 text-right">
                        <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">Score</p>
                        <span className="text-2xl font-black text-white">{currentScores.competency.toFixed(1)}<span className="text-sm text-indigo-400 ml-0.5">%</span></span>
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
                                    <div className="flex justify-between items-start">
                                       <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight leading-tight flex-1 pr-2">{item.name}</h4>
                                       <div className="text-right flex-shrink-0">
                                          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Wt</div>
                                          <input type="number" value={compWeights[item.name] || 0} onChange={(e) => handleWeightChange(item.name, e.target.value)} disabled={!isAdmin} className={cn("w-8 bg-transparent border-b border-dashed text-right text-xs font-bold outline-none", isAdmin ? "border-indigo-300 text-indigo-600" : "border-transparent text-slate-400 cursor-not-allowed")} />
                                       </div>
                                    </div>
                                    <div className="space-y-1">
                                       <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                          <span>Target</span><span>{item.target}/5</span>
                                       </div>
                                       <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                          <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${(item.target / 5) * 100}%` }} />
                                       </div>
                                    </div>
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
                  <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-xl">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600"><Zap size={16} /></div>
                        <div>
                           <h3 className="text-sm font-black text-slate-900 italic uppercase tracking-tight">Section 6: Operations & Processes</h3>
                           <p className="text-[10px] text-slate-500 mt-0.5">Rating adherence to organizational standards.</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Score</p>
                        <p className="text-xl font-black text-amber-600">{currentScores.ops.score.toFixed(1)}%</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {[
                        { name: 'Punctuality / Attendance', target: 4, desc: 'Adherence to official working hours and attendance.', icon: <Calendar size={14} /> },
                        { name: 'Work Turnaround Time', target: 3, desc: 'Efficiency in completing tasks within deadlines.', icon: <Zap size={14} /> },
                        { name: 'Innovation on the Job', target: 3, desc: 'Creative solutions and workflow improvements.', icon: <Brain size={14} /> },
                        { name: 'Professional Ethics & Integrity', target: 4, desc: 'Commitment to transparency and accountability.', icon: <CheckCircle2 size={14} /> },
                     ].map((item) => (
                        <div key={item.name} className="bg-white p-4 rounded-xl border border-slate-100 hover:border-indigo-100 transition-all">
                           <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex items-center gap-2">
                                 <div className="text-indigo-500 flex-shrink-0">{item.icon}</div>
                                 <div>
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{item.name}</h4>
                                    <p className="text-[9px] text-slate-400 mt-0.5">{item.desc}</p>
                                 </div>
                              </div>
                              <span className="text-[9px] font-bold text-slate-400 flex-shrink-0">Target: {item.target}</span>
                           </div>
                           <div className="flex gap-1.5">
                              {[1, 2, 3, 4, 5].map((s) => (
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
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                     <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><MessageSquare size={16} /></div>
                     <div>
                        <h2 className="text-sm font-black text-slate-900 uppercase italic tracking-tight">Section 7: Appraisee Comments</h2>
                        <p className="text-[10px] text-slate-400 mt-0.5">Add your personal reflections on your performance this period, then sign digitally.</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     {/* Appraisee comment — editable */}
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                           Your Performance Reflections
                        </label>
                        <textarea 
                           placeholder="Briefly describe your key achievements, challenges faced, and areas you intend to improve..."
                           value={comments.appraiseeComments}
                           onChange={(e) => handleCommentChange('appraiseeComments', e.target.value)}
                           className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900/5 outline-none transition-all placeholder:text-slate-300 resize-none"
                        />
                        <div className="flex items-center justify-between">
                           <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">
                              This comment will be visible to your supervisor and counter-signing officer.
                           </p>
                           <label className="flex items-center gap-2 cursor-pointer group">
                              <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-900 transition-colors uppercase tracking-widest">Sign Digitally</span>
                              <input type="checkbox" checked={comments.appraiseeSigned} onChange={(e) => handleCommentChange('appraiseeSigned', e.target.checked)} className="w-4 h-4 rounded border-2 border-slate-200 text-slate-900 focus:ring-slate-900" />
                           </label>
                        </div>
                     </div>

                     {/* Supervisor & counter-signer — locked, read-only info */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <Users size={12} className="text-slate-300" />
                              Supervisor Comment
                              <span className="ml-auto text-[8px] bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">Pending</span>
                           </label>
                           <div className="h-20 bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 flex items-center justify-center">
                              <p className="text-[10px] font-bold text-slate-300 italic text-center">Filled by your supervisor after review</p>
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <UserCheck size={12} className="text-slate-300" />
                              Counter-Signing Officer
                              <span className="ml-auto text-[8px] bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">Pending</span>
                           </label>
                           <div className="h-20 bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 flex items-center justify-center">
                              <p className="text-[10px] font-bold text-slate-300 italic text-center">Filled by the counter-signing officer</p>
                           </div>
                        </div>
                     </div>
                  </div>
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
                        <h2 className="text-sm font-black text-slate-900 uppercase italic tracking-tight">Review & Submit</h2>
                        <p className="text-[10px] text-slate-400 mt-0.5">Review your performance summary before final submission.</p>
                     </div>
                  </div>
                  
                  <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="space-y-3">
                           {[
                              { label: 'Section 4: Tasks (70%)', value: currentScores.kpi.total.toFixed(1) },
                              { label: 'Section 5: Competencies (20%)', value: currentScores.competency.toFixed(1) },
                              { label: 'Section 6: Operations (10%)', value: currentScores.ops.score.toFixed(1) },
                           ].map((row) => (
                              <div key={row.label} className="flex justify-between items-center py-2 border-b border-white/10">
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.label}</span>
                                 <span className="text-base font-black text-indigo-400">{row.value}%</span>
                              </div>
                           ))}
                        </div>
                        <div className="bg-white/5 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-center border border-white/10">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Aggregate Score</p>
                           <div className="flex items-baseline gap-1">
                              <span className="text-5xl font-black tracking-tighter text-white">{currentScores.grandTotal.toFixed(1)}</span>
                              <span className="text-lg font-bold text-indigo-400">%</span>
                           </div>
                           <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/30">
                              {currentScores.grandTotal >= 90 ? 'Outstanding' : currentScores.grandTotal >= 70 ? 'Excellent' : 'Good'}
                           </span>
                        </div>
                     </div>
                     <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl -mr-24 -mt-24" />
                  </div>

                  <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-100">
                     <AlertCircle size={16} className="flex-shrink-0" />
                     <p className="text-xs font-bold leading-relaxed">By submitting, you finalize your Q2 2026 appraisal. This record will be immutable once supervisor review begins.</p>
                  </div>

                  {/* Signature block — required before submission per PDA Section 7 */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                     {/* Header */}
                     <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Appraisee Declaration & Signature</p>
                        <p className="text-[9px] text-slate-400 font-bold">Section 7 — Required</p>
                     </div>

                     <div className="p-4 space-y-4">
                        {/* Declaration text */}
                        <p className="text-[11px] text-slate-600 leading-relaxed font-medium italic border-l-2 border-slate-200 pl-3">
                           "I hereby certify that the information provided in this appraisal is true and accurate to the best of my knowledge, and that I have reviewed all sections before submission."
                        </p>

                        {/* Signature row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                           {/* Name */}
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Full Name</p>
                              <div className="h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 flex items-center">
                                 <p className="text-xs font-black text-slate-700 uppercase italic tracking-tight">{employeeInfo.name}</p>
                              </div>
                           </div>
                           {/* IPPIS */}
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">IPPIS No.</p>
                              <div className="h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 flex items-center">
                                 <p className="text-xs font-black text-slate-700 font-mono">{employeeInfo.ippisNo}</p>
                              </div>
                           </div>
                           {/* Date */}
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                              <div className="h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 flex items-center">
                                 <p className="text-xs font-black text-slate-700">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                              </div>
                           </div>
                        </div>

                        {/* ── Signature image upload ── */}
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                           <div className="flex items-center justify-between">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                 Handwritten Signature Image
                                 {sigDataUrl && <span className="ml-2 text-green-600">✓ On file</span>}
                              </p>
                              {sigDataUrl && (
                                 <button
                                    onClick={clearSig}
                                    className="flex items-center gap-1 text-[9px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors"
                                 >
                                    <TrashIcon size={10} /> Remove
                                 </button>
                              )}
                           </div>

                           {sigDataUrl ? (
                              /* Signature preview */
                              <div className="relative h-20 bg-white border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center group">
                                 <img
                                    src={sigDataUrl}
                                    alt="Your signature"
                                    className="max-h-16 max-w-full object-contain"
                                 />
                                 <button
                                    onClick={() => sigInputRef.current?.click()}
                                    className="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest"
                                 >
                                    <Upload size={14} /> Replace
                                 </button>
                              </div>
                           ) : (
                              /* Drop zone */
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
                                    "h-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all",
                                    sigDragOver
                                       ? "border-primary-400 bg-primary-50"
                                       : "border-slate-200 hover:border-primary-300 hover:bg-slate-50"
                                 )}
                              >
                                 <ImageIcon size={20} className="text-slate-300" />
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {sigDragOver ? 'Drop to upload' : 'Upload signature image'}
                                 </p>
                                 <p className="text-[9px] text-slate-300 font-bold">PNG, JPG — saved once, reused forever</p>
                              </div>
                           )}

                           {/* Hidden file input */}
                           <input
                              ref={sigInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                 const file = e.target.files?.[0];
                                 if (file) processSigFile(file);
                                 e.target.value = '';
                              }}
                           />
                        </div>

                        {/* Confirmation checkbox */}
                        {comments.appraiseeSigned ? (
                           <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                              <div className="flex items-center gap-2">
                                 <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                                 <div>
                                    <p className="text-xs font-black text-green-700 uppercase tracking-widest">Signed & Confirmed</p>
                                    <p className="text-[9px] text-green-600 font-bold mt-0.5">This appraisal has been digitally acknowledged by the appraisee.</p>
                                 </div>
                              </div>
                              {/* Show uploaded sig or initials fallback */}
                              <div className="flex-shrink-0 ml-4 text-right">
                                 {sigDataUrl ? (
                                    <img src={sigDataUrl} alt="signature" className="h-10 max-w-[120px] object-contain border-b-2 border-green-400" />
                                 ) : (
                                    <p className="font-mono text-xl font-black italic text-green-700 border-b-2 border-green-400 pb-0.5 tracking-widest">
                                       {employeeInfo.name.split(' ').map(n => n[0]).join('.')}
                                    </p>
                                 )}
                                 <p className="text-[8px] text-green-500 font-bold uppercase tracking-widest mt-0.5">Digital Signature</p>
                              </div>
                           </div>
                        ) : (
                           <label className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer group hover:bg-amber-100 transition-colors">
                              <input
                                 type="checkbox"
                                 checked={comments.appraiseeSigned}
                                 onChange={(e) => handleCommentChange('appraiseeSigned', e.target.checked)}
                                 className="w-5 h-5 mt-0.5 rounded border-2 border-amber-400 text-primary-950 focus:ring-primary-950 cursor-pointer flex-shrink-0"
                              />
                              <div>
                                 <p className="text-xs font-black text-amber-800 uppercase tracking-widest">I confirm and sign this appraisal</p>
                                 <p className="text-[9px] text-amber-600 font-bold mt-0.5 leading-relaxed">
                                    By ticking this box, you are digitally signing this document. This is equivalent to a handwritten signature and is required before submission.
                                 </p>
                              </div>
                           </label>
                        )}
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
