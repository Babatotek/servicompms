import React from 'react';
import { motion } from 'motion/react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  BarChart, Bar, Cell
} from 'recharts';
import { TrendingUp, Target, Activity, AlertCircle, Calendar, ChevronDown, Download, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useAppraisals } from '../context/AppraisalContext';
import { useOrg } from '../context/OrgContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { DEFAULT_COMPETENCIES } from '../constants';
import { UserRole, AppraisalStatus } from '../types';

const StatBadge: React.FC<{ label: string; value: string; color: string; loading?: boolean }> = ({ label, value, color, loading }) => {
  if (loading) return (
    <Card className="p-5 flex flex-col justify-between h-[100px] relative overflow-hidden">
      <Skeleton className="absolute left-0 top-0 bottom-0 w-1" />
      <Skeleton className="h-2 w-16" /><Skeleton className="h-6 w-24" />
    </Card>
  );
  return (
    <Card className="p-5 flex flex-col justify-between h-[100px] relative overflow-hidden group">
      <div className={cn("absolute left-0 top-0 bottom-0 w-1 transition-all group-hover:w-2", color.replace('text-', 'bg-'))} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
      <div className={cn("text-2xl font-black tracking-tighter leading-none", color)}>{value}</div>
    </Card>
  );
};

export const Analytics: React.FC = () => {
  const { user } = useAuth();
  const { getScoreTrendForUser, getLatestAppraisalForUser, appraisals } = useAppraisals();
  const { departments } = useOrg();
  const { addNotification } = useNotifications();
  const [isExporting, setIsExporting] = React.useState(false);
  const loading = false;

  const isExec = user?.role === UserRole.DEPUTY_DIRECTOR ||
                 user?.role === UserRole.NC ||
                 user?.role === UserRole.SUPER_ADMIN;

  // ── Org-wide dept comparison data (exec only) ─────────────────────────────
  const deptComparisonData = React.useMemo(() => {
    if (!isExec) return [];
    const COLORS = ['#16A34A','#2563EB','#7C3AED','#D97706','#EA580C','#DC2626','#0891B2','#7C3AED','#059669','#D97706'];
    return departments.map((dept, i) => {
      const deptAppraisals = appraisals.filter(a =>
        a.departmentId === dept.id && a.scores.grandTotal > 0
      );
      const avg = deptAppraisals.length > 0
        ? Math.round((deptAppraisals.reduce((s, a) => s + a.scores.grandTotal, 0) / deptAppraisals.length) * 10) / 10
        : 0;
      return { name: dept.code, score: avg, color: COLORS[i % COLORS.length], count: deptAppraisals.length };
    }).filter(d => d.count > 0);
  }, [isExec, departments, appraisals]);

  const orgCompliance = React.useMemo(() => {
    if (!isExec) return [];
    return departments.map(dept => {
      const total = appraisals.filter(a => a.departmentId === dept.id).length;
      const approved = appraisals.filter(a =>
        a.departmentId === dept.id &&
        (a.status === AppraisalStatus.APPROVED || a.status === AppraisalStatus.COUNTER_SIGNED)
      ).length;
      return { name: dept.name, code: dept.code, total, approved, pct: total > 0 ? Math.round((approved / total) * 100) : 0 };
    }).filter(d => d.total > 0);
  }, [isExec, departments, appraisals]);

  const scoreTrend = getScoreTrendForUser(user?.id ?? '');
  const latest = getLatestAppraisalForUser(user?.id ?? '');

  // Competency radar: map stored achievements to radar format
  const competencyData = React.useMemo(() => {
    if (!latest) return [];
    return DEFAULT_COMPETENCIES.flatMap(cluster => cluster.items).map(item => {
      const achieved = latest.achievements[`comp_${item.name}`] ?? 0;
      return {
        subject: item.name.length > 14 ? item.name.slice(0, 14) + '…' : item.name,
        A: Math.round((achieved / 5) * 100),   // self score as %
        B: Math.round((item.target / 5) * 100), // target as %
        fullMark: 100,
      };
    });
  }, [latest]);

  // KRA breakdown from latest appraisal
  const kraData = React.useMemo(() => {
    if (!latest) return [];
    const COLORS = ['#16A34A', '#2563EB', '#7C3AED', '#D97706', '#EA580C'];
    return latest.kras.map((kra, i) => {
      const kraKpis = kra.objectives.flatMap(o => o.kpis);
      const achieved = kraKpis.reduce((s, kpi) => s + (latest.achievements[kpi.id] ?? 0), 0);
      const max = kraKpis.reduce((s, kpi) => s + kpi.targetValue, 0);
      return {
        name: kra.name.length > 18 ? kra.name.slice(0, 18) + '…' : kra.name,
        score: max > 0 ? Math.round((achieved / max) * 100) : 0,
        weight: kra.weight,
        color: COLORS[i % COLORS.length],
      };
    });
  }, [latest]);

  // Summary stats
  const avgScore = scoreTrend.length > 0
    ? (scoreTrend.reduce((s, p) => s + p.score, 0) / scoreTrend.length).toFixed(1) + '%'
    : '—';
  const latestScore = latest ? latest.scores.grandTotal.toFixed(1) + '%' : '—';
  const growthRate = scoreTrend.length >= 2
    ? ((scoreTrend[scoreTrend.length - 1].score - scoreTrend[0].score) >= 0 ? '+' : '') +
      (scoreTrend[scoreTrend.length - 1].score - scoreTrend[0].score).toFixed(1) + '%'
    : '—';
  const gradeLabel = latest
    ? latest.scores.grandTotal >= 90 ? 'Outstanding'
      : latest.scores.grandTotal >= 80 ? 'Excellent'
      : latest.scores.grandTotal >= 70 ? 'Very Good'
      : latest.scores.grandTotal >= 60 ? 'Good'
      : latest.scores.grandTotal >= 50 ? 'Fair' : 'Poor'
    : '—';

  const handleExport = async (format: 'pdf' | 'excel') => {
    setIsExporting(true);
    addNotification('info', 'Export Started', `Preparing your ${format.toUpperCase()} analysis report...`);
    try {
      const { exportToExcel, exportToPDF } = await import('../lib/exportUtils');
      if (format === 'excel') {
        const data = [
          ...scoreTrend.map(s => ({ Type: 'Score Trajectory', Period: s.name, Value: s.score })),
          ...kraData.map(k => ({ Type: 'KRA Achievement', Area: k.name, Score: k.score, Weight: k.weight })),
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
      <section className="flex justify-between items-center gap-4 no-export flex-wrap">
        <div className="flex items-center gap-2">
          {isExec && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-primary-50 border border-primary-100 rounded-xl">
              <Users size={14} className="text-primary-600" />
              <span className="text-[10px] font-black text-primary-700 uppercase tracking-widest">Org-Wide View Active</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 cursor-pointer hover:bg-slate-50">
          <Calendar size={16} /><span>Full Year 2026</span><ChevronDown size={14} />
        </div>
        <div className="relative group/export">
          <button disabled={isExporting}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-slate-900/10 active:scale-95 transition-all disabled:opacity-50">
            <Download size={16} />
            <span>{isExporting ? 'Exporting...' : 'Export Analysis'}</span>
          </button>
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-50">
            <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2.5 text-xs font-black text-slate-600 hover:bg-slate-50 rounded-xl transition-all">Download PDF</button>
            <button onClick={() => handleExport('excel')} className="w-full text-left px-4 py-2.5 text-xs font-black text-slate-600 hover:bg-slate-50 rounded-xl transition-all">Download Excel (XLSX)</button>
          </div>
        </div>
        </div>
      </section>

      {/* Exec Org-Wide Section */}
      {isExec && deptComparisonData.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-primary-600 rounded-full" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Organisation-Wide Performance</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Dept avg bar chart */}
            <Card className="p-6 flex flex-col">
              <CardHeader title="Department Averages" subtitle="Average score per unit" />
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptComparisonData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {deptComparisonData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Compliance progress bars */}
            <Card className="p-6 space-y-5">
              <CardHeader title="Appraisal Compliance" subtitle="Approved appraisals per department" />
              <div className="space-y-4">
                {orgCompliance.map(dept => {
                  const barColor = dept.pct >= 80 ? 'bg-green-600' : dept.pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
                  return (
                    <div key={dept.code} className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-700 uppercase italic">{dept.name}</span>
                        <span className="text-[10px] font-black text-slate-500 font-mono">{dept.approved}/{dept.total}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full transition-all duration-700', barColor)} style={{ width: `${dept.pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBadge label="Annual Average" value={avgScore} color="text-slate-900" loading={loading} />
        <StatBadge label="Latest Grade" value={gradeLabel} color="text-primary-600" loading={loading} />
        <StatBadge label="Growth Rate" value={growthRate} color="text-green-600" loading={loading} />
        <StatBadge label="Latest Score" value={latestScore} color="text-amber-600" loading={loading} />
      </div>

      {!latest && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
          <p className="text-sm font-black text-amber-900">No appraisal data yet — submit your first appraisal to see analytics.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
        {/* Score Trend */}
        <Card className="p-6 lg:p-8 flex flex-col">
          <CardHeader title="Score Trajectory" subtitle="Quarterly performance over time"
            icon={<div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100/50">
              <TrendingUp size={12} className="text-green-500" />
              <Badge variant="default" size="sm">{scoreTrend.length > 1 ? 'Tracking' : 'Pending'}</Badge>
            </div>}
          />
          <div className="h-[300px] w-full">
            {scoreTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No submissions yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={scoreTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }} dy={10} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }} />
                  <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }} itemStyle={{ fontWeight: '900', color: '#0f172a' }} />
                  <Line type="monotone" dataKey="score" stroke="#0f172a" strokeWidth={4}
                    dot={{ r: 6, fill: '#0f172a', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Competency Radar */}
        <Card className="p-6 lg:p-8 flex flex-col overflow-hidden relative">
          <CardHeader title="Competency Radar" subtitle="Self score vs target"
            icon={<div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary-500" /><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Self</span></div>
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-500" /><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Target</span></div>
            </div>}
          />
          <div className="h-[300px] w-full relative z-10">
            {competencyData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No competency data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <RadarChart data={competencyData}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                  <Radar name="Achievement" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
                  <Radar name="Target" dataKey="B" stroke="#475569" fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        </Card>

        {/* KRA Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8 shadow-sm space-y-8">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Result Area Breakdown</h3>
            <p className="text-[10px] text-slate-500 font-medium">Performance per KRA</p>
          </div>
          {kraData.length === 0 ? (
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center py-8">No KRA data yet</p>
          ) : (
            <div className="space-y-6">
              {kraData.map(kra => (
                <div key={kra.name} className="space-y-2">
                  <div className="flex justify-between items-end px-1">
                    <div>
                      <span className="text-xs font-black text-slate-900">{kra.name}</span>
                      <span className="ml-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Weight: {kra.weight}%</span>
                    </div>
                    <span className="text-xs font-black text-slate-900 font-mono">{kra.score}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${kra.score}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full" style={{ backgroundColor: kra.color }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Insights */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-slate-950 rounded-2xl p-6 lg:p-8 shadow-2xl text-white flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-black tracking-tight mb-8">Performance Insights</h3>
            <div className="space-y-4">
              {[
                { icon: <Activity className="text-green-400" size={16} />, text: scoreTrend.length >= 2 ? `Score ${growthRate} since first submission.` : 'Submit more appraisals to track your trend.' },
                { icon: <Target className="text-indigo-400" size={16} />, text: kraData.length > 0 ? `Top KRA: ${kraData.sort((a, b) => b.score - a.score)[0]?.name} at ${kraData.sort((a, b) => b.score - a.score)[0]?.score}%.` : 'Complete your appraisal to see KRA breakdown.' },
                { icon: <AlertCircle className="text-amber-400" size={16} />, text: kraData.length > 0 ? `Lowest KRA: ${kraData.sort((a, b) => a.score - b.score)[0]?.name} — focus area for improvement.` : 'KRA insights will appear after submission.' },
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
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Grade</p>
              <p className="text-xl font-black text-white">{gradeLabel}</p>
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

