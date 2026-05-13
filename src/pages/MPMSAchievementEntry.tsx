import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Target, 
  Save, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  TrendingUp,
  FileText,
  Search,
  Filter
} from 'lucide-react';
import { useOrg } from '../context/OrgContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';
import { useNotifications } from '../context/NotificationContext';
import { MPMSAchievement } from '../types';

export const MPMSAchievementEntry: React.FC = () => {
  const { user } = useAuth();
  const { mpmsKPIs, mpmsAchievements, updateMPMSAchievement, departments } = useOrg();
  const { addNotification } = useNotifications();
  
  const [year] = useState(2026);
  const [searchTerm, setSearchTerm] = useState('');

  // Only show KPIs where the user's department is the Lead Unit
  // In a real system, we'd also check user role (Dept Head)
  const myKPIs = useMemo(() => {
    return mpmsKPIs.filter(kpi => kpi.leadUnitId === user?.departmentId);
  }, [mpmsKPIs, user]);

  const filteredKPIs = useMemo(() => {
    if (!searchTerm) return myKPIs;
    const term = searchTerm.toLowerCase();
    return myKPIs.filter(kpi => kpi.description.toLowerCase().includes(term));
  }, [myKPIs, searchTerm]);

  const handleUpdate = (kpiId: string, value: string) => {
    const num = parseFloat(value) || 0;
    // In a real system, score calculation logic (e.g. against criteria) would live here
    // or in the context. For now, we'll store the raw achievement.
    const achievement: MPMSAchievement = {
      id: `mpms_${kpiId}_${year}_${Date.now()}`,
      kpiId,
      year,
      achievementValue: num,
      submittedBy: user?.id || '',
      submittedAt: new Date().toISOString(),
      status: 'submitted',
    };
    updateMPMSAchievement(achievement);
    addNotification('success', 'Update Saved', 'Institutional achievement data updated.');
  };

  return (
    <div className="space-y-6 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">MPMS Achievement Entry</h1>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">
            Institutional KPI Reporting Portal • Performance Year {year}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-slate-100 text-slate-600 border-slate-200 uppercase tracking-widest font-black px-4 py-1.5 h-10">
            {departments.find(d => d.id === user?.departmentId)?.name || 'Department'}
          </Badge>
          <button className="bg-primary-950 text-white px-6 py-1.5 h-10 rounded-xl font-black text-[11px] uppercase tracking-widest italic hover:shadow-heavy transition-all flex items-center gap-2">
            <Send size={14} /> Submit Final Report
          </button>
        </div>
      </header>

      <Card className="p-1 px-4 overflow-hidden border-slate-100/50">
        <div className="flex items-center gap-4 h-16">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search institutional KPIs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm font-bold uppercase tracking-tight text-slate-900 placeholder:text-slate-300"
          />
          <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {filteredKPIs.length > 0 ? filteredKPIs.map((kpi, i) => {
          const achieve = mpmsAchievements.find(a => a.kpiId === kpi.id && a.year === year);
          return (
            <motion.div
              key={kpi.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-0 overflow-hidden hover:border-primary-200 transition-all group">
                <div className="flex flex-col lg:flex-row items-stretch">
                  <div className="flex-1 p-6 lg:p-8 space-y-4">
                    <div className="flex items-start justify-between">
                       <div className="space-y-1">
                          <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em]">Institutional KPI #{i+1}</span>
                          <h4 className="text-sm font-black text-slate-900 leading-relaxed max-w-2xl">{kpi.description}</h4>
                       </div>
                       <div className="flex flex-col items-end gap-1">
                          <Badge className="bg-slate-50 text-slate-400 border-slate-100 uppercase tracking-widest text-[9px] h-6">
                            Target: {kpi.annualTarget}{kpi.unitOfMeasurement}
                          </Badge>
                       </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                       <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                          <TrendingUp size={12} className="text-slate-400" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Direction: Higher is better</span>
                       </div>
                       <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                          <Target size={12} className="text-slate-400" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Unit: {kpi.unitOfMeasurement}</span>
                       </div>
                    </div>
                  </div>

                  <div className="w-full lg:w-[400px] bg-slate-50/50 border-l border-slate-100 p-6 lg:p-8 flex flex-col justify-center gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Actual Achievement</label>
                        <div className="relative group/input">
                           <input 
                              type="number" 
                              defaultValue={achieve?.achievementValue || ''}
                              onBlur={(e) => handleUpdate(kpi.id, e.target.value)}
                              placeholder="Enter value..."
                              className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-xl font-black text-slate-900 outline-none focus:border-primary-500 transition-all"
                           />
                           <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-black text-lg">
                              {kpi.unitOfMeasurement}
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center justify-between">
                        <p className="text-[9px] font-bold text-slate-400 italic">Last Updated: {achieve?.submittedAt ? new Date(achieve.submittedAt).toLocaleDateString() : 'Never'}</p>
                        {achieve && (
                          <div className="flex items-center gap-1.5 text-green-600">
                             <CheckCircle2 size={12} />
                             <span className="text-[9px] font-black uppercase tracking-widest">Saved</span>
                          </div>
                        )}
                     </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        }) : (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 border border-slate-100">
               <FileText size={32} />
            </div>
            <div>
               <h3 className="text-sm font-black text-slate-900 uppercase italic">No lead KPIs found</h3>
               <p className="text-[10px] text-slate-400 font-medium max-w-xs mt-1">
                 Your department is not currently assigned as a Lead Unit for any Institutional KPIs.
               </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-100 p-6 rounded-[32px] flex items-start gap-4">
        <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
          <AlertCircle size={20} />
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-black text-amber-900 uppercase tracking-widest leading-none">Institutional Accountability Clause</p>
          <p className="text-[10px] text-amber-700 font-medium leading-relaxed italic">
            Achievement data entered here will be consolidated into the institutional score and submitted to the National Coordinator for final approval. Ensure all figures are verified by unit records.
          </p>
        </div>
      </div>
    </div>
  );
};
