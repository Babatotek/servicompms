import React, { useState, useMemo } from 'react';
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
  Zap,
  TrendingUp,
  Clock,
  Filter
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { ContractStatus, AppraisalStatus } from '../types';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { useNotifications } from '../context/NotificationContext';

import { PERFORMANCE_TEMPLATES, PerformanceTemplate } from '../lib/performanceTemplates';
import { useOrg } from '../context/OrgContext';
import { DEFAULT_COMPETENCIES, DEFAULT_OPERATIONS_ITEMS } from '../constants';

const TABS = [
  { id: 'info', label: 'Section 1: My Info', icon: <User size={18} /> },
  { id: 'supervisor', label: 'Section 2: Supervisor', icon: <Users size={18} /> },
  { id: 'countersign', label: 'Section 3: Oversight', icon: <UserCheck size={18} /> },
  { id: 'tasks', label: 'Section 4: KPIs', icon: <Target size={18} /> },
  { id: 'competencies', label: 'Section 5: Competencies', icon: <Brain size={18} /> },
  { id: 'ops', label: 'Section 6: Operations', icon: <Zap size={18} /> },
  { id: 'sign', label: 'Section 7: Comments', icon: <MessageSquare size={18} /> },
  { id: 'review', label: 'Monthly Summary', icon: <TrendingUp size={18} /> },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

import { 
  calculateRawScore, 
  calculateWeightedRawScore, 
  calculateSection4Composite,
  calculateAppraisalRating,
  calculateAppraiserScore 
} from '../lib/scoring';

export const MonthlyEvaluation: React.FC = () => {
  const { user } = useAuth();
  const { templates } = useOrg();
  const { addNotification } = useNotifications();
  
  const [activeTab, setActiveTab] = useState('info');
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [selectedTemplate, setSelectedTemplate] = useState<PerformanceTemplate>(templates[0] ?? PERFORMANCE_TEMPLATES[0]);
  const [loading, setLoading] = useState(true);
  
  const [achievements, setAchievements] = useState<Record<string, number>>({});
  const [comments, setComments] = useState({
    staffComments: '',
    supervisorComments: '',
    staffSigned: false
  });

  React.useEffect(() => {
    // Load approved contract snapshot if it exists
    const savedContract = localStorage.getItem(`active_contract_${user?.ippisNo}`);
    if (savedContract) {
      try {
        const contract = JSON.parse(savedContract);
        if (contract.kras) {
          setSelectedTemplate(prev => ({ ...prev, kras: contract.kras }));
          addNotification('info', 'Contract Synchronized', 'Monthly targets loaded from your approved performance contract.');
        }
      } catch (e) {
        console.error('Failed to parse contract', e);
      }
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [user, addNotification]);

  const handleAchievementChange = (id: string, value: string) => {
    setAchievements(prev => ({ ...prev, [id]: parseFloat(value) || 0 }));
  };

  const handleSubmit = () => {
    if (!comments.staffSigned) {
      addNotification('warning', 'Signature Required', 'Please apply your digital signature before submitting the evaluation.');
      return;
    }
    
    addNotification('success', 'Evaluation Submitted', `Your ${selectedMonth} evaluation has been sent to your supervisor for review.`);
  };

  const getScores = useMemo(() => {
    const kpiWeightedScores: number[] = [];
    
    selectedTemplate.kras.forEach(kra => {
      kra.objectives.forEach(obj => {
        obj.kpis.forEach(kpi => {
          const achievement = Number(achievements[kpi.id] || 0);
          const criteria = {
            o: 100, e: 80, vg: 75, g: 60, f: 50, p: 40 // Fallback criteria
          };
          const rawScore = calculateRawScore(achievement, criteria);
          // Safety cast for weights
          const gradedWeight = (Number(kpi.weight) || 0) * 4;
          const weightedScore = calculateWeightedRawScore(gradedWeight, rawScore);
          kpiWeightedScores.push(weightedScore);
        });
      });
    });

    const sec4Score = calculateSection4Composite(kpiWeightedScores) || 0;
    
    // Competencies (Section 5) - Max 20
    let sec5TotalPoints = 0;
    let compCount = 0;
    Object.entries(achievements).forEach(([key, val]) => {
       if (key.startsWith('comp_')) {
          sec5TotalPoints += (Number(val) || 0);
          compCount++;
       }
    });
    // Section 5 logic: Each item is out of 5 stars.
    const totalCompItems = DEFAULT_COMPETENCIES.reduce((acc, cluster) => acc + cluster.items.length, 0);
    const maxCompPoints = totalCompItems * 5; 
    const sec5Score = (sec5TotalPoints > 0 && maxCompPoints > 0) ? (sec5TotalPoints / maxCompPoints) * 20 : 0;

    // Operations (Section 6) - Max 10
    let sec6TotalPoints = 0;
    DEFAULT_OPERATIONS_ITEMS.forEach(item => {
       sec6TotalPoints += (Number(achievements[`op_${item.name}`]) || 0);
    });
    // Max total is 3 items * 100 points each = 300
    const sec6Score = (sec6TotalPoints / 300) * 10;

    const rating = calculateAppraisalRating(sec4Score, sec5Score, sec6Score) || 0;
    const appraiserScore = calculateAppraiserScore(rating) || 0;

    return { sec4Score, sec5Score, sec6Score, rating, appraiserScore };
  }, [achievements, selectedTemplate]);

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic flex items-center gap-3">
            <Clock className="text-primary-600" />
            Monthly Performance Progress
          </h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Submit your monthly achievements against institutional targets.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
             <div className="px-3 text-[9px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 mr-1 flex items-center gap-2">
                <Calendar size={12} /> Reporting Period
             </div>
             <select 
               value={selectedMonth}
               onChange={(e) => setSelectedMonth(e.target.value)}
               className="bg-transparent border-none outline-none text-xs font-black text-slate-900 uppercase italic pr-4 cursor-pointer"
             >
                {MONTHS.map(m => <option key={m} value={m}>{m} 2026</option>)}
             </select>
          </div>

          <button className="btn btn-primary gap-2 text-xs font-black uppercase tracking-widest px-6 py-3 rounded-2xl shadow-heavy shadow-primary-950/20">
            <Save className="w-4 h-4" /> Save Draft
          </button>
        </div>
      </div>

      {/* Navigation Stepper */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-sm sticky top-[72px] z-40 overflow-hidden">
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide snap-x snap-mandatory">
          {TABS.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "min-w-[140px] flex-1 h-16 rounded-xl border flex-shrink-0 transition-all duration-300 snap-start flex items-center gap-3 px-4 relative overflow-hidden group",
                activeTab === tab.id
                  ? "bg-primary-950 border-primary-950 text-white shadow-heavy z-10"
                  : "bg-slate-50/50 border-slate-100/50 hover:bg-white hover:shadow-sm hover:border-slate-200 text-slate-700"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center transition-all duration-300",
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
                  "text-[9px] font-black mt-1 leading-none",
                  activeTab === tab.id ? "text-primary-300" : "text-slate-400"
                )}>
                  Step {idx + 1}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <Card className="min-h-[500px] border-slate-200 shadow-premium overflow-hidden bg-white rounded-[40px]">
        {loading ? (
          <div className="p-12 space-y-8 animate-pulse">
             <Skeleton className="h-10 w-64 rounded-xl" />
             <div className="grid grid-cols-2 gap-8">
               <Skeleton className="h-20 w-full rounded-2xl" />
               <Skeleton className="h-20 w-full rounded-2xl" />
             </div>
             <Skeleton className="h-96 w-full rounded-3xl" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
             {activeTab === 'info' && (
                <motion.div key="info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-10 space-y-10">
                   <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                      <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 font-black text-lg italic shadow-sm border border-primary-100/50">1</div>
                      <div>
                        <h3 className="font-black text-xl text-slate-900 uppercase tracking-tighter italic">Staff Under Evaluation</h3>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Personal details and institutional identity of the appraisee.</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {[
                        { label: 'Full Name', value: `${user?.surname} ${user?.firstname}`.trim(), icon: <User size={14} /> },
                        { label: 'IPPIS Number', value: user?.ippisNo, icon: <Fingerprint size={14} /> },
                        { label: 'Designation', value: user?.designation, icon: <Briefcase size={14} /> },
                        { label: 'Functional Unit', value: user?.department, icon: <MapPin size={14} /> }
                      ].map(field => (
                        <div key={field.label} className="space-y-2">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                             {field.icon} {field.label}
                           </label>
                           <div className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-black text-xs uppercase italic tracking-tight">
                              {field.value}
                           </div>
                        </div>
                      ))}
                   </div>
                </motion.div>
             )}

             {activeTab === 'supervisor' && (
                <motion.div key="supervisor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-10 space-y-10">
                   <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                      <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 font-black text-lg italic shadow-sm border border-primary-100/50">2</div>
                      <div>
                        <h3 className="font-black text-xl text-slate-900 uppercase tracking-tighter italic">Supervisor Details</h3>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Official reviewer assigned to this staff member.</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {[
                        { label: 'Reviewer Name', value: 'AKINBODEWA NGOZI', icon: <User size={14} /> },
                        { label: 'Designation', value: 'DEPUTY DIRECTOR', icon: <Briefcase size={14} /> },
                        { label: 'Email', value: 'akinbodewa@gmail.com', icon: <MessageSquare size={14} /> },
                        { label: 'Department', value: 'OPERATION B UNIT', icon: <MapPin size={14} /> }
                      ].map(field => (
                        <div key={field.label} className="space-y-2">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                             {field.icon} {field.label}
                           </label>
                           <div className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-black text-xs uppercase italic tracking-tight">
                              {field.value}
                           </div>
                        </div>
                      ))}
                   </div>
                </motion.div>
             )}

             {activeTab === 'countersign' && (
                <motion.div key="countersign" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-10 space-y-10">
                   <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                      <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 font-black text-lg italic shadow-sm border border-primary-100/50">3</div>
                      <div>
                        <h3 className="font-black text-xl text-slate-900 uppercase tracking-tighter italic">Oversight Authority</h3>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Counter-signing officer for final validation.</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {[
                        { label: 'Officer Name', value: 'AKAJEMELI NNENNA', icon: <User size={14} /> },
                        { label: 'Official Role', value: 'NATIONAL COORDINATOR/CEO', icon: <Award size={14} /> },
                        { label: 'IPPIS ID', value: '80733', icon: <Fingerprint size={14} /> }
                      ].map(field => (
                        <div key={field.label} className="space-y-2">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                             {field.icon} {field.label}
                           </label>
                           <div className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-black text-xs uppercase italic tracking-tight">
                              {field.value}
                           </div>
                        </div>
                      ))}
                   </div>
                </motion.div>
             )}

             {activeTab === 'tasks' && (
                <motion.div key="tasks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="animate-in fade-in duration-500 overflow-hidden">
                   <div className="p-10 pb-2 flex justify-between items-end">
                      <div>
                         <h3 className="font-black text-xl text-slate-900 uppercase tracking-tighter italic flex items-center gap-3">
                           <Target className="text-primary-600" />
                           Section 4: Task Performance
                         </h3>
                         <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Reviewing Key Result Areas for {selectedMonth} 2026.</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Running Monthly Score</p>
                         <p className="text-3xl font-black text-primary-600 italic tracking-tighter">{getScores.rating.toFixed(1)}%</p>
                      </div>
                   </div>
                   
                   <div className="overflow-x-auto p-10 pt-4 custom-scrollbar">
                      <table className="w-full text-xs border-collapse table-fixed min-w-[1200px] rounded-3xl overflow-hidden border border-slate-100">
                        <thead>
                          <tr className="bg-primary-950 text-white">
                            <th className="p-4 w-12 font-black uppercase tracking-widest text-[9px] text-center italic border-r border-white/10">S/N</th>
                            <th className="p-4 w-64 font-black uppercase tracking-widest text-[9px] text-left italic border-r border-white/10">Key Result Area & Objectives</th>
                            <th className="p-4 w-64 font-black uppercase tracking-widest text-[9px] text-left italic border-r border-white/10">Performance Indicators (KPIs)</th>
                            <th className="p-4 w-24 font-black uppercase tracking-widest text-[9px] text-center italic border-r border-white/10">Target</th>
                            <th className="p-4 w-32 font-black uppercase tracking-widest text-[9px] text-center italic border-r border-white/10">Achievement</th>
                            <th className="p-4 w-24 font-black uppercase tracking-widest text-[9px] text-center italic border-r border-white/10">Raw Score</th>
                            <th className="p-4 w-24 font-black uppercase tracking-widest text-[9px] text-center italic">Weighted</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {selectedTemplate.kras.map((kra, kIdx) => (
                             <React.Fragment key={kra.id}>
                               {kra.objectives.map((obj, oIdx) => (
                                 <React.Fragment key={obj.id}>
                                   {obj.kpis.map((kpi, kpiIdx) => (
                                     <tr key={kpi.id} className="align-top hover:bg-slate-50 transition-colors group">
                                        {(oIdx === 0 && kpiIdx === 0) && (
                                          <td className="p-4 text-center font-black text-slate-400 bg-slate-50/50" rowSpan={kra.objectives.reduce((acc, o) => acc + o.kpis.length, 0)}>
                                            {kra.serialNo}
                                          </td>
                                        )}
                                        {kpiIdx === 0 && (
                                          <td className="p-4 border-r border-slate-50" rowSpan={obj.kpis.length}>
                                            <p className="font-black text-slate-900 text-[10px] uppercase italic leading-tight mb-2">{kra.name}</p>
                                            <p className="text-[9px] font-bold text-slate-500 italic leading-relaxed">"{obj.description}"</p>
                                          </td>
                                        )}
                                        <td className="p-4 border-r border-slate-50">
                                           <div className="flex items-start gap-2">
                                              <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 mt-0.5 rounded-md border-primary-200 text-primary-600 font-black">KPI</Badge>
                                              <p className="font-black text-slate-700 text-[10px] leading-snug uppercase italic">{kpi.description}</p>
                                           </div>
                                        </td>
                                        <td className="p-4 text-center border-r border-slate-50 align-middle">
                                           <div className="bg-slate-50 rounded-lg p-2">
                                              <p className="text-xs font-black text-slate-900 italic">{kpi.targetValue}</p>
                                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{kpi.unit}</p>
                                           </div>
                                        </td>
                                        <td className="p-4 align-middle border-r border-slate-50">
                                           <div className="flex items-center gap-2">
                                              <input 
                                                type="number" 
                                                min="0" max="100"
                                                value={achievements[kpi.id] || ''}
                                                onChange={(e) => handleAchievementChange(kpi.id, e.target.value)}
                                                placeholder="0"
                                                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-[11px] font-black text-slate-900 outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-center" 
                                              />
                                              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-[8px] font-black text-primary-600">%</div>
                                           </div>
                                        </td>
                                        <td className="p-4 text-center border-r border-slate-50 align-middle">
                                           <div className="text-xs font-black text-slate-900 italic">
                                              {calculateRawScore(Number(achievements[kpi.id] || 0), { o: 100, e: 80, vg: 75, g: 60, f: 50, p: 40 })}
                                           </div>
                                        </td>
                                        <td className="p-4 text-center align-middle bg-slate-50/30">
                                           <div className="text-xs font-black text-primary-600 italic">
                                              {calculateWeightedRawScore((Number(kpi.weight) || 0) * 4, calculateRawScore(Number(achievements[kpi.id] || 0), { o: 100, e: 80, vg: 75, g: 60, f: 50, p: 40 })).toFixed(2)}
                                           </div>
                                        </td>
                                     </tr>
                                   ))}
                                 </React.Fragment>
                               ))}
                             </React.Fragment>
                           ))}
                        </tbody>
                      </table>
                   </div>
                </motion.div>
             )}

             {activeTab === 'competencies' && (
                <motion.div key="competencies" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-10 space-y-10">
                   <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                      <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 font-black text-lg italic shadow-sm border border-primary-100/50">5</div>
                      <div>
                        <h3 className="font-black text-xl text-slate-900 uppercase tracking-tighter italic flex items-center gap-3">
                           <Brain className="text-primary-600" />
                           Section 5: Generic & Functional Competencies
                        </h3>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Measuring behavioral and professional standards for {selectedMonth}.</p>
                      </div>
                   </div>

                   <div className="space-y-8">
                      {[
                        { 
                          category: 'Generic Competencies', 
                          items: ['Leadership Skill', 'Managing & Developing People', 'Effective Communication'] 
                        },
                        { 
                          category: 'Functional Competencies', 
                          items: ['Strategic thinking', 'Drive for results', 'Transparency and Accountability'] 
                        },
                        { 
                          category: 'Ethics and Value', 
                          items: ['Integrity', 'Citizen focus', 'Courage'] 
                        }
                      ].map((cat, cIdx) => (
                        <div key={cat.category} className="space-y-4">
                           <h4 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.25em] flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                              {cat.category}
                           </h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {cat.items.map((item, iIdx) => (
                                <div key={item} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4 hover:bg-white hover:shadow-sm transition-all group">
                                   <p className="text-[10px] font-black text-slate-900 uppercase italic tracking-tight leading-tight h-8">{item}</p>
                                   <div className="flex items-center gap-2">
                                      {[1, 2, 3, 4, 5].map(score => (
                                        <button 
                                          key={score}
                                          onClick={() => setAchievements(prev => ({ ...prev, [`comp_${cIdx}_${iIdx}`]: score * 20 }))}
                                          className={cn(
                                            "flex-1 h-10 rounded-xl text-[10px] font-black transition-all",
                                            (achievements[`comp_${cIdx}_${iIdx}`] || 0) >= score * 20
                                              ? "bg-primary-950 text-white shadow-md"
                                              : "bg-white border border-slate-200 text-slate-400 hover:bg-slate-50"
                                          )}
                                        >
                                          {score}
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

             {activeTab === 'ops' && (
                <motion.div key="ops" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-10 space-y-10">
                   <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                      <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 font-black text-lg italic shadow-sm border border-primary-100/50">6</div>
                      <div>
                        <h3 className="font-black text-xl text-slate-900 uppercase tracking-tighter italic flex items-center gap-3">
                           <Zap className="text-primary-600" />
                           Section 6: Operations & Processes
                        </h3>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Reviewing daily operational efficiency and workplace discipline.</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {[
                        { id: 'punctuality', label: 'Punctuality/Attendance', desc: 'Get to work at the specified time and days' },
                        { id: 'turnaround', label: 'Work turn around time', desc: 'Display efficiency and effectiveness in service delivery' },
                        { id: 'innovation', label: 'Innovation on the job', desc: 'Introduce improvements in work processes as may be required' }
                      ].map(item => (
                        <div key={item.id} className="p-8 bg-slate-50 border border-slate-100 rounded-[40px] space-y-6 hover:bg-white hover:shadow-premium transition-all group">
                           <div className="space-y-1">
                              <p className="text-xs font-black text-slate-900 uppercase italic tracking-tight">{item.label}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.desc}</p>
                           </div>
                           <div className="flex items-center gap-3">
                              <input 
                                type="range" min="0" max="100" step="10"
                                value={achievements[item.id] || 0}
                                onChange={(e) => handleAchievementChange(item.id, e.target.value)}
                                className="flex-1 accent-primary-600 cursor-pointer"
                              />
                              <div className="w-16 h-10 rounded-2xl bg-primary-950 flex items-center justify-center text-xs font-black text-white italic">
                                 {achievements[item.id] || 0}%
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </motion.div>
             )}

             {activeTab === 'sign' && (
                <motion.div key="sign" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-10 space-y-10">
                   <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                      <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 font-black text-lg italic shadow-sm border border-primary-100/50">7</div>
                      <div>
                        <h3 className="font-black text-xl text-slate-900 uppercase tracking-tighter italic">Evaluator's Observations</h3>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Formal comments and feedback regarding monthly performance.</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <MessageSquare className="w-3 h-3 text-primary-500" />
                          Supervisor's Feedback
                        </label>
                        <textarea 
                           placeholder="Enter your detailed observations for the staff's performance this month..."
                           className="w-full h-48 bg-slate-50 border border-slate-200 rounded-3xl p-6 text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-primary-500/5 outline-none transition-all placeholder:text-slate-300 resize-none italic shadow-inner"
                           value={comments.supervisorComments}
                           onChange={(e) => setComments(prev => ({ ...prev, supervisorComments: e.target.value }))}
                        />
                      </div>

                      <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-heavy border border-slate-800">
                         <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10">
                                  <Fingerprint size={20} />
                               </div>
                               <h4 className="text-sm font-black uppercase tracking-widest italic">Digital Certification</h4>
                            </div>

                            <div className="space-y-4">
                               <p className="text-xs font-semibold text-slate-400 leading-relaxed italic border-l-2 border-primary-500 pl-4 py-1">
                                  "I hereby certify that I have reviewed the performance of {user?.firstname} {user?.surname} for the period of {selectedMonth} 2026 and provided honest feedback based on institutional benchmarks."
                               </p>
                               <div className="flex justify-between items-center py-4 border-t border-white/5">
                                  <div>
                                     <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Evaluator ID</p>
                                     <p className="text-xs font-black font-mono tracking-tighter text-white">{user?.ippisNo}</p>
                                  </div>
                                  <div className="text-right">
                                     <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Evaluation Date</p>
                                     <p className="text-xs font-black text-white italic uppercase">{new Date().toLocaleDateString('en-GB')}</p>
                                  </div>
                               </div>
                            </div>

                            <label className={cn(
                               "flex items-start gap-4 p-5 rounded-3xl border transition-all cursor-pointer group",
                               comments.supervisorSigned ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/5 border-white/10 hover:bg-white/10"
                            )}>
                               <input 
                                 type="checkbox" 
                                 checked={comments.supervisorSigned}
                                 onChange={(e) => setComments(prev => ({ ...prev, supervisorSigned: e.target.checked }))}
                                 className="w-5 h-5 rounded border-2 border-primary-500 text-primary-600 focus:ring-primary-600 mt-0.5" 
                               />
                               <div>
                                  <p className="text-xs font-black text-white uppercase tracking-widest">Apply Digital Signature</p>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-1 leading-relaxed">Sign off on this month's interim progress report.</p>
                               </div>
                            </label>
                         </div>
                         <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary-600/10 rounded-full blur-3xl" />
                      </div>
                   </div>
                </motion.div>
             )}

             {activeTab === 'review' && (
                <motion.div key="review" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-10 space-y-10">
                   <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-lg italic shadow-sm border border-emerald-100/50">8</div>
                      <div>
                        <h3 className="font-black text-xl text-slate-900 uppercase tracking-tighter italic">Evaluation Summary</h3>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Final overview of monthly performance indicators.</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="md:col-span-2 bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden">
                         <div className="relative z-10 space-y-10">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <TrendingUp className="text-primary-500" />
                                  <h4 className="text-sm font-black uppercase tracking-widest italic">Performance Analysis</h4>
                               </div>
                               <Badge className="bg-primary-500 text-white border-none font-black px-4 py-1.5 uppercase italic text-[10px] tracking-widest">2026 Fiscal Cycle</Badge>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pb-8 border-b border-white/5">
                               <div>
                                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Section 4 (70%)</p>
                                  <p className="text-xl font-black italic text-white uppercase">{getScores.sec4Score.toFixed(2)}</p>
                               </div>
                               <div>
                                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Section 5 (20%)</p>
                                  <p className="text-xl font-black italic text-white uppercase">{getScores.sec5Score.toFixed(2)}</p>
                               </div>
                               <div>
                                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Section 6 (10%)</p>
                                  <p className="text-xl font-black italic text-white uppercase">{getScores.sec6Score.toFixed(2)}</p>
                               </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-center gap-10">
                               <div className="space-y-2">
                                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Appraisal Rating (100%)</p>
                                  <div className="flex items-baseline gap-2">
                                     <span className="text-5xl font-black italic tracking-tighter text-white">{getScores.rating.toFixed(2)}</span>
                                     <span className="text-xl font-black text-primary-500">Pts</span>
                                  </div>
                               </div>
                               <div className="text-center sm:text-right bg-white/5 px-8 py-6 rounded-[32px] border border-white/10 shadow-heavy">
                                  <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] mb-2">Appraiser Score (20%)</p>
                                  <div className="flex items-baseline justify-center sm:justify-end gap-2">
                                     <span className="text-5xl font-black italic tracking-tighter text-white">{getScores.appraiserScore.toFixed(2)}</span>
                                  </div>
                               </div>
                            </div>
                         </div>
                         <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full blur-3xl -mr-32 -mt-32" />
                      </div>

                      <div className="bg-slate-50 border border-slate-100 rounded-[40px] p-8 flex flex-col justify-center items-center text-center space-y-6">
                         <div className="w-16 h-16 rounded-[24px] bg-primary-950 text-white flex items-center justify-center shadow-lg shadow-primary-950/20">
                            <Send size={24} />
                         </div>
                         <div className="space-y-2">
                            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter italic">Finalize Evaluation</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 leading-relaxed">This will log your interim performance data for {selectedMonth} 2026.</p>
                         </div>
                         <button 
                           onClick={handleSubmit}
                           className="w-full py-5 bg-primary-950 text-white rounded-[24px] font-black text-xs hover:translate-y-[-2px] transition-all shadow-heavy shadow-primary-950/20 active:scale-95 uppercase tracking-widest"
                         >
                           Finalize & Save
                         </button>
                      </div>
                   </div>
                </motion.div>
             )}
          </AnimatePresence>
        )}
      </Card>

      {/* Footer Navigation Bar */}
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
          <ChevronLeft className="w-4 h-4" /> Previous
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
              className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[11px] hover:translate-y-[-1px] transition-all active:scale-95 uppercase tracking-[0.2em] shadow-heavy shadow-emerald-600/20"
            >
              <CheckCircle2 className="w-4 h-4" /> Finalize Evaluation
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
      `}</style>
    </div>
  );
};
