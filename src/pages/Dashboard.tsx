import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Target,
  Award,
  Trophy,
  FileText,
  Users,
  UserCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Flame,
  LayoutGrid,
  PlusSquare,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

const MOCK_TREND_DATA = [
  { name: 'Q1 2025', score: 72 },
  { name: 'Q2 2025', score: 78 },
  { name: 'Q3 2025', score: 75 },
  { name: 'Q4 2025', score: 85 },
  { name: 'Q1 2026', score: 88 },
];

const MOCK_DEPT_DATA = [
  { name: 'Admin', score: 82 },
  { name: 'Accounts', score: 88 },
  { name: 'Operations', score: 85 },
  { name: 'ICT', score: 78 },
  { name: 'Audit', score: 84 },
  { name: 'NC Unit', score: 92 },
];

const MOCK_HEATMAP_DATA = [
  { name: 'Oleh Nneka', kra1: 90, kra2: 85, kra3: 88, kra4: 75 },
  { name: 'Shittu Oyelude', kra1: 85, kra2: 92, kra3: 80, kra4: 85 },
  { name: 'Onche Ben', kra1: 78, kra2: 80, kra3: 85, kra4: 90 },
  { name: 'Sesugh Duruba', kra1: 92, kra2: 88, kra3: 90, kra4: 95 },
  { name: 'Tubi Tolulope', kra1: 80, kra2: 75, kra3: 78, kra4: 82 },
];

const StatCard: React.FC<{ 
  label: string; 
  value: string | number; 
  icon: React.ReactNode; 
  trend?: { value: string; positive: boolean };
  color: string;
  subValue?: string;
  loading?: boolean;
}> = ({ label, value, icon, trend, color, subValue, loading }) => {
  if (loading) {
    return (
      <Card className="h-[150px] flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="w-12 h-5 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-2 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-[150px] flex flex-col justify-between relative overflow-hidden group">
      <div className="flex justify-between items-start">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110", color)}>
          {React.cloneElement(icon as React.ReactElement, { size: 20 })}
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black tracking-tight",
            trend.positive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
          )}>
            {trend.positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {trend.value}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <h4 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{value}</h4>
          {subValue && <span className="text-[10px] font-black text-slate-300 uppercase tracking-tight">{subValue}</span>}
        </div>
      </div>
    </Card>
  );
};

const ProgressBar: React.FC<{
  label: string;
  value: number;
  max: number;
  colorClass?: string;
  subtext?: string;
  showValues?: boolean;
}> = ({ label, value, max, colorClass = "bg-slate-900", subtext, showValues = true }) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs font-bold text-slate-900 tracking-tight">{label}</p>
          {subtext && <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{subtext}</p>}
        </div>
        {showValues && <span className="text-[10px] font-black text-slate-900 font-mono tracking-widest">{value}/{max}</span>}
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", colorClass)}
        />
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);
  
  const isSupervisor = user && [
    UserRole.TEAM_LEAD, 
    UserRole.DEPT_HEAD, 
    UserRole.DEPUTY_DIRECTOR, 
    UserRole.NC
  ].includes(user.role);
  
  const isDeptHead = user?.role === UserRole.DEPT_HEAD;
  const isExec = [UserRole.DEPUTY_DIRECTOR, UserRole.NC, UserRole.SUPER_ADMIN].includes(user?.role as UserRole);
  const isManagement = isSupervisor || isExec;

  // Personal Stats (Appraisee Context)
  const personalStats = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        label="Quarterly Score" 
        value="88.4" 
        subValue="/ 100" 
        icon={<Target />} 
        trend={{ value: "+3.4%", positive: true }}
        color="bg-primary-500"
        loading={loading}
      />
      <StatCard 
        label="Projected Grade" 
        value="Excellent" 
        icon={<Award />} 
        color="bg-excellent"
        loading={loading}
      />
      <StatCard 
        label="Current Status" 
        value="In Progress" 
        icon={<Activity />} 
        color="bg-good"
        loading={loading}
      />
      <StatCard 
        label="Org Ranking" 
        value="#12" 
        subValue="OF 184" 
        icon={<Trophy />} 
        color="bg-verygood"
        loading={loading}
      />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Welcome Bar */}
      <section className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
           <div className="w-1 h-4 bg-primary-600 rounded-full" />
           <p className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Good Morning, {user?.firstname}</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="bg-white border border-slate-100 p-2 pl-3 sm:pl-4 pr-1 rounded-2xl flex items-center gap-3 sm:gap-4 shadow-premium">
              <div className="text-right">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Deadline In</p>
                 <p className="text-xs font-black text-slate-900">12 Days Remaining</p>
              </div>
              <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
                 <Clock size={18} />
              </div>
           </div>
        </div>
      </section>

      <div className="space-y-5">
         {/* KPI Cards Row */}
         {personalStats}

         {/* Primary Data Grid */}
         <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* Score Trend (2/3 width) */}
            <Card className="xl:col-span-2 p-4 sm:p-6 lg:p-8 flex flex-col h-[280px] sm:h-[340px] lg:h-[400px]">
               <CardHeader 
                  title="Score Trend" 
                  subtitle="Historical performance trajectory"
                  icon={
                    <div className="flex items-center gap-2 bg-primary-50 px-3 py-1.5 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-primary-600" />
                      <span className="text-[9px] font-black text-primary-600 uppercase tracking-widest">My Score</span>
                    </div>
                  }
               />

               <div className="h-[300px] w-full">
                  {loading ? (
                    <div className="w-full h-full flex flex-col gap-4">
                      <Skeleton className="flex-1 rounded-2xl" />
                      <div className="flex justify-between">
                        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-2 w-10" />)}
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                       <AreaChart data={MOCK_TREND_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                          <defs>
                             <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }} />
                          <YAxis domain={[60, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }} />
                          <Tooltip cursor={{ stroke: '#6366F1', strokeWidth: 1 }} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                          <Area type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={3} fill="url(#colorScore)" dot={{ fill: '#6366F1', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                       </AreaChart>
                    </ResponsiveContainer>
                  )}
               </div>
            </Card>

            {/* Completion Track (1/3 width) */}
            <Card className="xl:col-span-1 p-4 sm:p-6 lg:p-8 flex flex-col h-[280px] sm:h-[340px] lg:h-[400px]">
               <CardHeader title="Completion Track" />

               <div className="flex-1 space-y-8">
                  {loading ? (
                    <div className="space-y-8">
                      {[1, 2].map(i => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between"><Skeleton className="h-3 w-32" /><Skeleton className="h-3 w-8" /></div>
                          <Skeleton className="h-1.5 w-full rounded-full" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <ProgressBar 
                         label="Current Quarter Completion" 
                         value={18} 
                         max={24} 
                         colorClass="bg-primary-500"
                         subtext="KPIs filled for Q2 2026"
                         showValues={true}
                      />
                      <ProgressBar 
                         label="Annual Cycle Progress" 
                         value={2} 
                         max={4} 
                         colorClass="bg-green-500"
                         subtext="Approved assessment periods"
                      />
                    </>
                  )}

                  <div className="pt-2">
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 leading-none">Target Completion</p>
                     <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-3">
                           <Calendar size={16} className="text-primary-600" />
                           <span className="text-[11px] font-bold text-slate-600 leading-none">Q2 Close: 15 July 2026</span>
                        </div>
                        <Link to="/my-appraisal" className="text-[10px] font-black uppercase text-primary-600 hover:text-primary-900 transition-colors">Fill Now</Link>
                     </div>
                  </div>
               </div>
            </Card>
         </div>

         {/* Secondary Insights & Actions Row */}
         <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* Performance Insights (1/3 width) */}
            <div className="xl:col-span-1 bg-primary-900 rounded-3xl p-5 sm:p-8 text-white relative overflow-hidden shadow-heavy flex flex-col justify-between h-[240px] sm:h-[300px]">
               <div className="relative z-10">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-primary-400 mb-6">
                     <Activity size={24} />
                  </div>
                  <h3 className="text-xl font-black tracking-tighter uppercase italic mb-4">Performance Insights</h3>
                  <p className="text-sm text-primary-100/70 font-medium leading-relaxed">
                     Your current productivity is 12% higher than last quarter. Maintaining this trend will qualify you for the Elite Corps bonus.
                  </p>
               </div>
               <button className="relative z-10 mt-8 w-full bg-white/10 border border-white/20 hover:bg-white/20 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all">
                  View Detailed Analysis
               </button>
               <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl -mr-24 -mt-24" />
            </div>

            {/* Quick Actions Action Center (2/3 width) */}
            <div className="xl:col-span-2 bg-blue-600 rounded-2xl p-5 sm:p-8 text-white flex flex-col justify-between h-[240px] sm:h-[300px] relative overflow-hidden">
               <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 h-full">
                  <div className="flex-1 space-y-4">
                     <div>
                        <h3 className="text-xl font-black tracking-tighter uppercase italic">Action Center</h3>
                        <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mt-1">Priority Operations</p>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                        {[
                           { label: 'New Task', to: '/appraisal/new' },
                           { label: 'Performance Contract', to: '/my-contract' },
                           { label: 'Leaderboard', to: '/leaderboard' },
                           { label: 'Analytics', to: '/analytics' },
                        ].map((action) => (
                           <Link 
                              key={action.label}
                              to={action.to}
                              className="bg-white text-blue-700 h-12 rounded-xl flex items-center px-6 font-black text-xs hover:bg-blue-50 transition-all shadow-lg uppercase tracking-tight"
                           >
                              {action.label}
                           </Link>
                        ))}
                     </div>
                  </div>
                  <div className="hidden lg:flex items-center justify-center px-8 border-l border-white/10">
                     <div className="text-center">
                        <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2">Service Status</p>
                        <div className="text-4xl font-black tracking-tighter italic">ACTIVE</div>
                     </div>
                  </div>
               </div>
               <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mb-32" />
            </div>
         </div>
      </div>

      {/* SUPERVISOR VIEW (Appraiser Context) */}
      {(isSupervisor || isExec) && (
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 mt-16"
        >
           <div className="flex items-center gap-2 mb-2">
              <Users size={18} className="text-slate-600" />
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Team / Appraiser Context</h3>
           </div>

           {/* Team Review Queue Hero */}
           <Card className="p-5 sm:p-8 text-slate-900 relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 sm:gap-8">
                 <div className="max-w-xl">
                    <div className="flex items-center gap-3 mb-4">
                       <div className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
                       <Badge variant="primary">Attention Required</Badge>
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter leading-tight text-slate-900 uppercase italic">Team Review Queue</h2>
                    <p className="text-slate-500 mt-2 font-medium leading-relaxed text-sm">
                       You have 3 staff appraisals in your department awaiting supervisor rating and final counter-signing. Use the bulk review tool to accelerate approval.
                    </p>
                 </div>
                 <Link 
                    to="/team" 
                    className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-primary-900 transition-all flex items-center gap-3 group shadow-lg shadow-primary-600/20"
                 >
                    Enter Review Suite
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                 </Link>
              </div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary-50 rounded-full blur-3xl -mr-48 -mt-48" />
           </Card>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
              {/* Dept Compliance PROGRESS */}
              {(isDeptHead || isExec) && (
                 <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6 sm:space-y-10">
                    <div className="flex justify-between items-end">
                       <div>
                          <h3 className="font-black text-slate-900 text-lg sm:text-xl uppercase tracking-tight">Compliance Tracking</h3>
                          <p className="text-xs text-slate-500 font-medium">Unit-wide appraisal completion status</p>
                       </div>
                       <PieChartIcon size={24} className="text-slate-300" />
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                       {[
                          { name: 'Accounts Unit', completed: 8, total: 8, color: 'bg-green-600' },
                          { name: 'Admin Registry', completed: 6, total: 8, color: 'bg-amber-500' },
                          { name: 'Operations Team A', completed: 3, total: 9, color: 'bg-red-500' },
                       ].map((team) => (
                          <ProgressBar 
                             key={team.name}
                             label={team.name}
                             value={team.completed}
                             max={team.total}
                             colorClass={team.color}
                             subtext={`${team.completed} of ${team.total} Appraisals Approved`}
                          />
                       ))}
                    </div>
                 </div>
              )}

              {/* KPI HEATMAP */}
              {(isDeptHead || isExec) && (
                 <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6 sm:space-y-8">
                    <div className="flex justify-between items-center">
                       <div>
                          <h3 className="font-black text-slate-900 text-lg sm:text-xl uppercase tracking-tight">Performance Heatmap</h3>
                          <p className="text-xs text-slate-500 font-medium">Direct reports KRA achievement</p>
                       </div>
                       <LayoutGrid size={24} className="text-slate-300" />
                    </div>

                    <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
                       <table className="w-full">
                          <thead>
                             <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                <th className="text-left pb-4 font-black">Staff Member</th>
                                <th className="pb-4 font-black">KRA 1</th>
                                <th className="pb-4 font-black">KRA 2</th>
                                <th className="pb-4 font-black">KRA 3</th>
                                <th className="pb-4 font-black">SCORE</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                             {MOCK_HEATMAP_DATA.map((row) => (
                                <tr key={row.name} className="group hover:bg-slate-50/50 transition-colors">
                                   <td className="py-4">
                                      <p className="text-xs font-black text-slate-900">{row.name}</p>
                                   </td>
                                   <td className="py-4 px-2">
                                      <div className="h-1 w-12 bg-slate-100 rounded-full mx-auto">
                                         <div className="h-full bg-green-500 rounded-full" style={{ width: `${row.kra1}%` }} />
                                      </div>
                                   </td>
                                   <td className="py-4 px-2">
                                      <div className="h-1 w-12 bg-slate-100 rounded-full mx-auto">
                                         <div className="h-full bg-blue-500 rounded-full" style={{ width: `${row.kra2}%` }} />
                                      </div>
                                   </td>
                                   <td className="py-4 px-2">
                                      <div className="h-1 w-12 bg-slate-100 rounded-full mx-auto">
                                         <div className="h-full bg-purple-500 rounded-full" style={{ width: `${row.kra3}%` }} />
                                      </div>
                                   </td>
                                   <td className="py-4 text-center">
                                      <span className="text-[10px] font-black px-2 py-1 bg-slate-100 rounded text-slate-600">
                                         {Math.round((row.kra1 + row.kra2 + row.kra3) / 3)}%
                                      </span>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
              )}
           </div>

           {/* EXECUTIVE ORG-WIDE */}
           {isExec && (
              <div className="space-y-8 mt-8">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
                    <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6 sm:space-y-8">
                       <div className="flex justify-between items-center">
                          <div>
                             <h3 className="font-black text-slate-900 text-2xl tracking-tight uppercase">Compliance tracking</h3>
                             <p className="text-sm text-slate-500 font-medium">Monthly submission rates across departments</p>
                          </div>
                          <PieChartIcon size={32} className="text-indigo-400" />
                       </div>
                       <div className="h-[250px] w-full">
                          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                             <AreaChart data={MOCK_TREND_DATA}>
                                <defs>
                                   <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                   </linearGradient>
                                </defs>
                                <XAxis dataKey="name" hide />
                                <YAxis hide domain={[70, 100]} />
                                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none' }} />
                                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorComp)" />
                             </AreaChart>
                          </ResponsiveContainer>
                       </div>
                    </div>

                    <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-100 text-slate-900 shadow-sm space-y-6 sm:space-y-8 relative overflow-hidden">
                       <div className="relative z-10">
                          <h3 className="font-black text-xl sm:text-2xl tracking-tighter uppercase text-indigo-900 italic">Strategic Alerts</h3>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Immediate Actions Required</p>
                          <div className="space-y-4 mt-8">
                             {[
                                { label: 'Operations Dept.', issue: 'Submission Deadline Lapse', level: 'High' },
                                { label: 'Admin Unit', issue: 'Incomplete KRA Template', level: 'Medium' },
                             ].map((alert, i) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white transition-all group">
                                   <div className="flex items-center gap-4">
                                      <div className={cn(
                                         "w-2.5 h-2.5 rounded-full animate-pulse",
                                         alert.level === 'High' ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                                      )} />
                                      <div>
                                         <p className="text-xs font-black">{alert.label}</p>
                                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{alert.issue}</p>
                                      </div>
                                   </div>
                                   <ChevronRight size={18} className="text-slate-600 transition-transform group-hover:translate-x-1" />
                                </div>
                             ))}
                          </div>
                       </div>
                       <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                    </div>
                 </div>

                 <div className="bg-white p-5 sm:p-8 lg:p-10 rounded-2xl border border-slate-100 shadow-sm space-y-6 sm:space-y-10">
                    <div className="flex justify-between items-center">
                       <div>
                          <h3 className="font-black text-slate-900 text-xl sm:text-2xl tracking-tight uppercase">Organisation performance overview</h3>
                          <p className="text-sm text-slate-500 font-medium">Departmental average score comparison</p>
                       </div>
                       <BarChart3 size={32} className="text-indigo-400" />
                    </div>

                    <div className="h-[350px] w-full">
                       <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                          <BarChart data={MOCK_DEPT_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                             <YAxis domain={[60, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                             <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                             <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={45}>
                                {MOCK_DEPT_DATA.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.score > 90 ? '#16A34A' : '#07152f'} />
                                ))}
                             </Bar>
                          </BarChart>
                       </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 pt-6 sm:pt-8 border-t border-slate-50">
                       {[
                          { label: 'Top Department', value: 'NC Unit', icon: <Flame className="text-orange-500" /> },
                          { label: 'Org Participation', value: '94%', icon: <Activity className="text-green-500" /> },
                          { label: 'Critical Alarms', value: '2 Units', icon: <AlertCircle className="text-red-500" /> },
                       ].map((stat) => (
                          <div key={stat.label} className="bg-slate-50 p-6 rounded-3xl flex items-center gap-6">
                             <div className="p-4 bg-white rounded-2xl shadow-sm">{stat.icon}</div>
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-xl font-black text-slate-900">{stat.value}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           )}
        </motion.section>
      )}
    </div>
  );
};
