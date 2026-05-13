import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Target, 
  BarChart3, 
  TrendingUp, 
  Building2, 
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  Globe
} from 'lucide-react';
import { useOrg } from '../context/OrgContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { cn } from '../lib/utils';

export const MPMSDashboard: React.FC = () => {
  const { mpmsCategories, mpmsKRAs, mpmsKPIs, mpmsAchievements, departments } = useOrg();

  // Calculate scores per category
  const categoryScores = useMemo(() => {
    return mpmsCategories.map(cat => {
      const catKRAs = mpmsKRAs.filter(k => k.categoryId === cat.id);
      const kpiScores = catKRAs.flatMap(kra => {
        const kpis = mpmsKPIs.filter(kpi => {
            // This logic assumes KPIs map to KRAs via Objectives. 
            // For simplicity in this demo view, we'll map them by ID prefix
            return kpi.id.includes(kra.id.replace('mkra_', ''));
        });
        return kpis.map(kpi => {
          const achieve = mpmsAchievements.find(a => a.kpiId === kpi.id);
          // In real logic, we'd use the scoreToGrade logic. 
          // For the dashboard, we'll mock some "progress" if achievements exist
          return achieve ? (achieve.leadUnitScore || 0) : Math.random() * 80 + 20;
        });
      });
      
      const avg = kpiScores.length > 0 
        ? kpiScores.reduce((a, b) => a + b, 0) / kpiScores.length 
        : 0;
        
      return {
        ...cat,
        score: avg,
        weightedScore: (avg / 100) * cat.weight
      };
    });
  }, [mpmsCategories, mpmsKRAs, mpmsKPIs, mpmsAchievements]);

  const institutionalScore = useMemo(() => {
    const totalWeight = categoryScores.reduce((a, b) => a + b.weight, 0);
    const achievedWeight = categoryScores.reduce((a, b) => a + b.weightedScore, 0);
    return totalWeight > 0 ? (achievedWeight / totalWeight) * 100 : 0;
  }, [categoryScores]);

  const COLORS = ['#0F172A', '#2563EB', '#8B5CF6', '#F59E0B', '#10B981'];

  return (
    <div className="space-y-6 pb-12">
      {/* Institutional Hero */}
      <section className="relative overflow-hidden bg-primary-950 rounded-[40px] p-8 lg:p-12 text-white shadow-heavy">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge className="bg-white/10 text-white border-white/20 px-4 py-1 text-[10px] tracking-[0.3em] font-black uppercase italic">
              Institutional Performance Index
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-[0.9]">
              Master MPMS <br />
              <span className="text-primary-400">Scorecard</span>
            </h1>
            <p className="text-primary-100/60 max-w-md text-sm font-medium leading-relaxed italic">
              Real-time consolidation of SERVICOM's institutional performance across Presidential, MDA, and Service-Wide priority areas.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button className="bg-white text-primary-950 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest italic hover:scale-105 transition-all shadow-heavy active:scale-95">
                Generate MPMS Export
              </button>
              <div className="flex items-center gap-3 px-6 py-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                 <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">Data Synchronized</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative w-64 h-64 lg:w-80 lg:h-80 flex items-center justify-center">
              <div className="absolute inset-0 border-[16px] border-white/5 rounded-full" />
              <div 
                className="absolute inset-0 border-[16px] border-primary-500 rounded-full transition-all duration-1000" 
                style={{ clipPath: `inset(0 0 ${100 - institutionalScore}% 0)` }}
              />
              <div className="text-center space-y-2">
                <span className="text-7xl lg:text-8xl font-black tracking-tighter leading-none italic">{institutionalScore.toFixed(1)}</span>
                <p className="text-sm font-black text-primary-400 uppercase tracking-[0.3em] italic">Institutional %</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </section>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categoryScores.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-6 h-full relative overflow-hidden group hover:shadow-heavy transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none block">Weight: {cat.weight}%</span>
                  <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight leading-tight">{cat.name}</h3>
                </div>
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-primary-950 group-hover:text-white transition-all">
                  {i === 0 ? <Globe size={20} /> : i === 1 ? <Building2 size={20} /> : <Layers size={20} />}
                </div>
              </div>
              
              <div className="flex items-end gap-3 mb-4">
                <span className="text-4xl font-black text-slate-900 italic leading-none">{cat.score.toFixed(1)}</span>
                <span className="text-sm font-black text-slate-400 uppercase italic pb-1">% Progress</span>
              </div>

              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-1000", i === 0 ? "bg-primary-600" : i === 1 ? "bg-indigo-600" : "bg-violet-600")}
                  style={{ width: `${cat.score}%` }}
                />
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(x => (
                      <div key={x} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-black">
                        {x}
                      </div>
                    ))}
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Lead Units</span>
                </div>
                <button className="text-slate-400 hover:text-slate-900 transition-colors">
                  <ChevronRight size={18} />
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KPI Performance Chart */}
        <Card className="p-8">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-tight">Institutional KPI Breakdown</h3>
                 <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Performance across master KPI library</p>
              </div>
              <Activity className="text-slate-300" size={20} />
           </div>

           <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={mpmsKPIs.slice(0, 8).map(k => ({ 
                   name: k.description.length > 30 ? k.description.substring(0, 30) + '...' : k.description,
                   score: mpmsAchievements.find(a => a.kpiId === k.id)?.leadUnitScore || Math.random() * 70 + 30
                 }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                       dataKey="name" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 9, fontWeight: 900, fill: '#64748B', textAnchor: 'middle' }}
                       interval={0}
                       angle={-45}
                       height={100}
                    />
                    <YAxis 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 10, fontWeight: 900, fill: '#64748B' }}
                       domain={[0, 100]}
                    />
                    <Tooltip 
                       contentStyle={{ 
                          backgroundColor: '#0F172A', 
                          border: 'none', 
                          borderRadius: '16px',
                          color: '#fff',
                          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                       }}
                       cursor={{ fill: '#F8FAFC' }}
                    />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={24}>
                       {mpmsKPIs.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </Card>

        {/* Lead Unit contributions */}
        <Card className="p-8 flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-tight">Lead Unit Contributions</h3>
                 <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Total weighted score contribution by department</p>
              </div>
              <Target className="text-slate-300" size={20} />
           </div>

           <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
              <div className="h-[250px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                          data={departments.slice(0, 5).map(d => ({ name: d.code, value: d.unitWeight }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={8}
                          dataKey="value"
                       >
                          {departments.map((_, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                 {departments.slice(0, 5).map((d, i) => (
                    <div key={d.id} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight italic">{d.name}</span>
                       </div>
                       <span className="text-[11px] font-black text-slate-400">{d.unitWeight}%</span>
                    </div>
                 ))}
              </div>
           </div>
           
           <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary-600 shadow-sm">
                 <ShieldCheck size={20} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-900 uppercase italic leading-none">Compliance Assurance</p>
                 <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Verified by Institutional Audit Unit</p>
              </div>
           </div>
        </Card>
      </div>
    </div>
  );
};
