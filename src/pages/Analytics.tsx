import React from 'react';
import { motion } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  Award, 
  Activity,
  Calendar,
  ChevronDown,
  Filter,
  Download
} from 'lucide-react';
import { cn } from '../lib/utils';
import { exportToExcel, exportToPDF } from '../lib/exportUtils';
import { useNotifications } from '../context/NotificationContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';

const SCORE_HISTORY = [
  { period: 'Q1 2025', score: 72 },
  { period: 'Q2 2025', score: 78 },
  { period: 'Q3 2025', score: 75 },
  { period: 'Q4 2025', score: 85 },
  { period: 'Q1 2026', score: 88 },
  { period: 'Q2 2026', score: 89 },
];

const COMPETENCY_DATA = [
  { subject: 'Drive for Results', A: 100, B: 80, fullMark: 100 },
  { subject: 'Collaborating', A: 90, B: 70, fullMark: 100 },
  { subject: 'Communication', A: 85, B: 90, fullMark: 100 },
  { subject: 'Policy Mgmt', A: 70, B: 60, fullMark: 100 },
  { subject: 'Public Relations', A: 80, B: 75, fullMark: 100 },
  { subject: 'Integrity', A: 100, B: 100, fullMark: 100 },
];

const KRA_ACHIEVEMENT = [
  { name: 'Governance', score: 92, weight: 10, color: '#16A34A' },
  { name: 'Financial Mgmt', score: 85, weight: 50, color: '#2563EB' },
  { name: 'Innovation', score: 78, weight: 15, color: '#7C3AED' },
  { name: 'Automation', score: 88, weight: 15, color: '#D97706' },
  { name: 'Support', score: 95, weight: 10, color: '#16A34A' },
];

const StatBadge: React.FC<{ label: string; value: string; color: string; loading?: boolean }> = ({ label, value, color, loading }) => {
  if (loading) {
    return (
      <Card className="p-5 flex flex-col justify-between h-[100px] relative overflow-hidden">
        <Skeleton className="absolute left-0 top-0 bottom-0 w-1" />
        <Skeleton className="h-2 w-16" />
        <Skeleton className="h-6 w-24" />
      </Card>
    );
  }
  return (
    <Card className="p-5 flex flex-col justify-between h-[100px] relative overflow-hidden group">
      <div className={cn("absolute left-0 top-0 bottom-0 w-1 transition-all group-hover:w-2", color.replace('text-', 'bg-'))} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
      <div className={cn("text-2xl font-black tracking-tighter leading-none", color)}>{value}</div>
    </Card>
  );
};

export const Analytics: React.FC = () => {
  const { addNotification } = useNotifications();
  const [isExporting, setIsExporting] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleExport = async (format: 'pdf' | 'excel') => {
    setIsExporting(true);
    addNotification('info', 'Export Started', `Preparing your ${format.toUpperCase()} analysis report...`);
    
    try {
      if (format === 'excel') {
        const data = [
          ...SCORE_HISTORY.map(s => ({ Type: 'Score Trajectory', Period: s.period, Value: s.score })),
          ...KRA_ACHIEVEMENT.map(k => ({ Type: 'KRA Achievement', Area: k.name, Score: k.score, Weight: k.weight }))
        ];
        exportToExcel(data, 'servicom_analytics_report');
      } else {
        await exportToPDF('analytics-content', 'servicom_performance_analytics');
      }
      addNotification('success', 'Export Complete', `Analytics report has been downloaded successfully.`);
    } catch (error) {
      addNotification('error', 'Export Failed', 'An error occurred while generating the report.');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-8 pb-32" id="analytics-content">
      {/* Toolbar */}
      <section className="flex justify-end items-center gap-4 no-export">
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 cursor-pointer hover:bg-slate-50">
           <Calendar size={16} />
           <span>Full Year 2026</span>
           <ChevronDown size={14} />
        </div>
        <div className="relative group/export">
           <button 
             disabled={isExporting}
             className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-slate-900/10 active:scale-95 transition-all disabled:opacity-50"
           >
             <Download size={16} />
             <span>{isExporting ? 'Exporting...' : 'Export Analysis'}</span>
           </button>
           <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-50">
             <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2.5 text-xs font-black text-slate-600 hover:bg-slate-50 rounded-xl transition-all">Download PDF</button>
             <button onClick={() => handleExport('excel')} className="w-full text-left px-4 py-2.5 text-xs font-black text-slate-600 hover:bg-slate-50 rounded-xl transition-all">Download Excel (XLSX)</button>
           </div>
        </div>
      </section>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBadge label="Annual Average" value="84.2%" color="text-slate-900" loading={loading} />
        <StatBadge label="Score Projecting" value="Excellent" color="text-primary-600" loading={loading} />
        <StatBadge label="Growth Rate" value="+12.4%" color="text-green-600" loading={loading} />
        <StatBadge label="Competency Gap" value="-4.2%" color="text-amber-600" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
        {/* Score Trend Card */}
        <Card className="p-6 lg:p-8 flex flex-col">
          <CardHeader 
            title="Score Trajectory" 
            subtitle="Quarterly performance over time"
            icon={
              <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100/50">
                 <TrendingUp size={12} className="text-green-500" />
                 <Badge variant="default" size="sm">Improving</Badge>
              </div>
            }
          />

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={SCORE_HISTORY}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="period" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  domain={[60, 100]} 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                  itemStyle={{ fontWeight: '900', color: '#0f172a' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#0f172a" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#0f172a', strokeWidth: 3, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          </Card>

        {/* Competency Radar Card */}
        <Card 
          className="p-6 lg:p-8 flex flex-col overflow-hidden relative"
        >
          <CardHeader 
            title="Competency Radar" 
            subtitle="Evaluation vs Goal Target"
            icon={
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Self</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Target</span>
                 </div>
              </div>
            }
          />

          <div className="h-[300px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <RadarChart data={COMPETENCY_DATA}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                />
                <Radar
                  name="Achievement"
                  dataKey="A"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.5}
                />
                <Radar
                  name="Target"
                  dataKey="B"
                  stroke="#475569"
                  fill="transparent"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
          </Card>

        {/* KRA Breakdown Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8 shadow-sm space-y-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Result Area Breakdown</h3>
              <p className="text-[10px] text-slate-500 font-medium">Performance per result area</p>
            </div>
          </div>

          <div className="space-y-6">
            {KRA_ACHIEVEMENT.map((kra) => (
              <div key={kra.name} className="space-y-2">
                <div className="flex justify-between items-end px-1">
                  <div>
                    <span className="text-xs font-black text-slate-900">{kra.name}</span>
                    <span className="ml-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Weight: {kra.weight}%</span>
                  </div>
                  <span className="text-xs font-black text-slate-900 font-mono">{kra.score}%</span>
                </div>
                <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${kra.score}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: kra.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actionable Insights */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="bg-slate-950 rounded-2xl p-6 lg:p-8 shadow-2xl text-white flex flex-col justify-between"
        >
           <div>
              <h3 className="text-2xl font-black tracking-tight mb-8">Performance Insights</h3>
              <div className="space-y-4">
                 {/* icon change if needed, otherwise just spacing */}
                 {[
                   { icon: <Activity className="text-green-400" size={16} />, text: 'Score is trending upwards by 12% compared to Q4 2025.' },
                   { icon: <Target className="text-indigo-400" size={16} />, text: 'Exceptional performance in Governance & Service Delivery (92%).' },
                   { icon: <AlertCircleIcon className="text-amber-400" size={16} />, text: 'Improvement suggested for Policy Management competencies.' },
                 ].map((insight, i) => (
                   <div key={i} className="flex gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/10 items-start">
                      <div className="mt-0.5">{insight.icon}</div>
                      <p className="text-[13px] font-medium text-slate-200 leading-relaxed">{insight.text}</p>
                   </div>
                 ))}
              </div>
           </div>
           
           <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
              <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Standing</p>
                 <p className="text-xl font-black text-white">Top 15% Org-wide</p>
              </div>
              <button className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all active:scale-95">
                 View Leaderboard
              </button>
           </div>
        </motion.div>
      </div>
    </div>
  );
};

const AlertCircleIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
