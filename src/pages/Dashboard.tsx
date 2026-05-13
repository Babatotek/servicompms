import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle,
  ArrowRight, Target, Award, Trophy, Users, BarChart3,
  PieChart as PieChartIcon, Activity, LayoutGrid, Calendar, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppraisals } from '../context/AppraisalContext';
import { useOrg } from '../context/OrgContext';
import { UserRole, AppraisalStatus } from '../types';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { DEFAULT_GRADE_SCALE } from '../constants';

// ── helpers ──────────────────────────────────────────────────────────────────
const scoreToGrade = (score: number) => {
  if (score >= 90) return { key: 'O', label: 'Outstanding' };
  if (score >= 80) return { key: 'E', label: 'Excellent' };
  if (score >= 70) return { key: 'VG', label: 'Very Good' };
  if (score >= 60) return { key: 'G', label: 'Good' };
  if (score >= 50) return { key: 'F', label: 'Fair' };
  return { key: 'P', label: 'Poor' };
};

const gradeColor: Record<string, string> = {
  O: 'bg-green-600', E: 'bg-blue-600', VG: 'bg-purple-600',
  G: 'bg-amber-500', F: 'bg-orange-500', P: 'bg-red-600',
};

// ── sub-components ────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  label: string; value: string | number; icon: React.ReactNode;
  trend?: { value: string; positive: boolean }; color: string;
  subValue?: string; loading?: boolean;
}> = ({ label, value, icon, trend, color, subValue, loading }) => {
  if (loading) return (
    <Card className="h-[150px] flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-12 h-5 rounded-full" />
      </div>
      <div className="space-y-2"><Skeleton className="h-2 w-16" /><Skeleton className="h-6 w-24" /></div>
    </Card>
  );
  return (
    <Card className="h-[150px] flex flex-col justify-between relative overflow-hidden group">
      <div className="flex justify-between items-start">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110", color)}>
          {React.cloneElement(icon as React.ReactElement, { size: 20 })}
        </div>
        {trend && (
          <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black tracking-tight",
            trend.positive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600")}>
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
  label: string; value: number; max: number;
  colorClass?: string; subtext?: string; showValues?: boolean;
}> = ({ label, value, max, colorClass = 'bg-slate-900', subtext, showValues = true }) => {
  const pct = Math.min((value / max) * 100, 100);
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
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn('h-full rounded-full', colorClass)}
        />
      </div>
    </div>
  );
};

// ── main component ────────────────────────────────────────────────────────────
export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    appraisals, getScoreTrendForUser, getLatestAppraisalForUser,
    getAppraisalsForSupervisor, getPendingCountForSupervisor, getLeaderboard,
  } = useAppraisals();
  const { departments } = useOrg();

  const isSupervisor = user && [
    UserRole.TEAM_LEAD, UserRole.DEPT_HEAD, UserRole.DEPUTY_DIRECTOR, UserRole.NC,
  ].includes(user.role);
  const isDeptHead = user?.role === UserRole.DEPT_HEAD;
  const isExec = [UserRole.DEPUTY_DIRECTOR, UserRole.NC, UserRole.SUPER_ADMIN].includes(user?.role as UserRole);

  // ── personal stats ──────────────────────────────────────────────────────────
  const latestAppraisal = getLatestAppraisalForUser(user?.id ?? '');
  const scoreTrend = getScoreTrendForUser(user?.id ?? '');
  const latestScore = latestAppraisal?.scores.grandTotal ?? 0;
  const grade = scoreToGrade(latestScore);
  const status = latestAppraisal?.status ?? 'No Submission';

  // Trend delta vs previous period
  const trendDelta = useMemo(() => {
    if (scoreTrend.length < 2) return null;
    const diff = scoreTrend[scoreTrend.length - 1].score - scoreTrend[scoreTrend.length - 2].score;
    return { value: `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`, positive: diff >= 0 };
  }, [scoreTrend]);

  // KPI completion: count filled achievements vs total KPIs in active contract
  const kpiCompletion = useMemo(() => {
    if (!latestAppraisal) return { filled: 0, total: 0 };
    const total = latestAppraisal.kras.flatMap(k => k.objectives.flatMap(o => o.kpis)).length;
    const filled = Object.values(latestAppraisal.achievements).filter(v => (v as number) > 0).length;
    return { filled, total };
  }, [latestAppraisal]);

  // Org ranking from leaderboard
  const leaderboard = getLeaderboard();
  const myRank = leaderboard.findIndex(e => e.userId === user?.id) + 1;
  const orgTotal = leaderboard.length;

  // ── supervisor stats ────────────────────────────────────────────────────────
  const pendingCount = getPendingCountForSupervisor(user?.id ?? '');
  const teamAppraisals = getAppraisalsForSupervisor(user?.id ?? '');
  const approvedCount = teamAppraisals.filter(a => a.status === AppraisalStatus.APPROVED).length;

  // Heatmap: direct reports with their latest scores per KRA
  const heatmapData = useMemo(() => {
    return teamAppraisals
      .filter(a => a.scores.grandTotal > 0)
      .slice(0, 5)
      .map(a => {
        const kraScores: Record<string, number> = {};
        a.kras.slice(0, 3).forEach((kra, i) => {
          const kraKpis = kra.objectives.flatMap(o => o.kpis);
          const kraAchieved = kraKpis.reduce((sum, kpi) => sum + (a.achievements[kpi.id] ?? 0), 0);
          const kraMax = kraKpis.reduce((sum, kpi) => sum + kpi.targetValue, 0);
          kraScores[`kra${i + 1}`] = kraMax > 0 ? Math.round((kraAchieved / kraMax) * 100) : 0;
        });
        return { name: a.userName, ...kraScores };
      });
  }, [teamAppraisals]);

  // ── exec org-wide stats ─────────────────────────────────────────────────────
  const deptChartData = useMemo(() => {
    return departments.map(dept => {
      const deptRecords = appraisals.filter(a =>
        a.departmentId === dept.id && a.status === AppraisalStatus.APPROVED
      );
      const avg = deptRecords.length > 0
        ? deptRecords.reduce((s, a) => s + a.scores.grandTotal, 0) / deptRecords.length
        : 0;
      return { name: dept.code, score: Math.round(avg * 10) / 10 };
    }).filter(d => d.score > 0);
  }, [appraisals, departments]);

  // Compliance trend: approved count per period across org
  const complianceTrend = useMemo(() => {
    const byPeriod: Record<string, number> = {};
    appraisals.forEach(a => {
      byPeriod[a.period] = (byPeriod[a.period] ?? 0) + 1;
    });
    return Object.entries(byPeriod)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, count]) => ({ name, score: count }));
  }, [appraisals]);

  const hasSubmission = !!latestAppraisal;

  return (
    <div className="space-y-5">
      {/* Welcome Bar */}
      <section className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-1 h-4 bg-primary-600 rounded-full" />
          <p className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Good Morning, {user?.firstname}
          </p>
        </div>
        <div className="bg-white border border-slate-100 p-2 pl-3 sm:pl-4 pr-1 rounded-2xl flex items-center gap-3 sm:gap-4 shadow-premium">
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Q2 Deadline</p>
            <p className="text-xs font-black text-slate-900">15 July 2026</p>
          </div>
          <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
            <Clock size={18} />
          </div>
        </div>
      </section>

      {/* No submission banner */}
      {!hasSubmission && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
          <AlertCircle size={20} className="text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-black text-amber-900">No appraisal submitted yet</p>
            <p className="text-xs text-amber-700 mt-0.5">Complete your performance contract first, then fill your appraisal.</p>
          </div>
          <Link to="/my-contract" className="text-[10px] font-black uppercase text-amber-700 hover:text-amber-900 transition-colors shrink-0">
            Start Now →
          </Link>
        </div>
      )}

      <div className="space-y-5">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Latest Score" value={hasSubmission ? `${latestScore.toFixed(1)}` : '—'}
            subValue={hasSubmission ? '/ 100' : undefined}
            icon={<Target />} trend={trendDelta ?? undefined}
            color="bg-primary-500"
          />
          <StatCard
            label="Projected Grade" value={hasSubmission ? grade.label : '—'}
            icon={<Award />} color={hasSubmission ? gradeColor[grade.key] : 'bg-slate-400'}
          />
          <StatCard
            label="Appraisal Status" value={status}
            icon={<Activity />} color="bg-good"
          />
          <StatCard
            label="Org Ranking" value={myRank > 0 ? `#${myRank}` : '—'}
            subValue={orgTotal > 0 ? `OF ${orgTotal}` : undefined}
            icon={<Trophy />} color="bg-verygood"
          />
        </div>

        {/* Score Trend + Completion */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
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
            <div className="flex-1 w-full">
              {scoreTrend.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No data yet — submit your first appraisal</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={scoreTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }} />
                    <Tooltip cursor={{ stroke: '#6366F1', strokeWidth: 1 }} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={3} fill="url(#colorScore)" dot={{ fill: '#6366F1', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card className="xl:col-span-1 p-4 sm:p-6 lg:p-8 flex flex-col h-[280px] sm:h-[340px] lg:h-[400px]">
            <CardHeader title="Completion Track" />
            <div className="flex-1 space-y-8">
              <ProgressBar
                label="KPI Completion"
                value={kpiCompletion.filled} max={kpiCompletion.total || 1}
                colorClass="bg-primary-500"
                subtext={`${kpiCompletion.filled} of ${kpiCompletion.total} KPIs filled`}
              />
              <ProgressBar
                label="Annual Cycle Progress"
                value={scoreTrend.length} max={4}
                colorClass="bg-green-500"
                subtext="Submitted assessment periods"
              />
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

        {/* Action Center */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-1 bg-primary-900 rounded-3xl p-5 sm:p-8 text-white relative overflow-hidden shadow-heavy flex flex-col justify-between h-[240px] sm:h-[300px]">
            <div className="relative z-10">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-primary-400 mb-6">
                <Activity size={24} />
              </div>
              <h3 className="text-xl font-black tracking-tighter uppercase italic mb-4">Performance Insights</h3>
              <p className="text-sm text-primary-100/70 font-medium leading-relaxed">
                {hasSubmission
                  ? `Your latest score is ${latestScore.toFixed(1)}% — grade ${grade.label}. ${trendDelta?.positive ? 'Trending upward.' : 'Keep pushing.'}`
                  : 'Submit your appraisal to start tracking your performance trend.'}
              </p>
            </div>
            <Link to="/analytics" className="relative z-10 mt-8 w-full bg-white/10 border border-white/20 hover:bg-white/20 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all text-center block">
              View Detailed Analysis
            </Link>
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl -mr-24 -mt-24" />
          </div>

          <div className="xl:col-span-2 bg-blue-600 rounded-2xl p-5 sm:p-8 text-white flex flex-col justify-between h-[240px] sm:h-[300px] relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 h-full">
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-black tracking-tighter uppercase italic">Action Center</h3>
                  <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mt-1">Priority Operations</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                  {[
                    { label: 'My Appraisal', to: '/my-appraisal' },
                    { label: 'Performance Contract', to: '/my-contract' },
                    { label: 'Leaderboard', to: '/leaderboard' },
                    { label: 'Analytics', to: '/analytics' },
                  ].map(action => (
                    <Link key={action.label} to={action.to}
                      className="bg-white text-blue-700 h-12 rounded-xl flex items-center px-6 font-black text-xs hover:bg-blue-50 transition-all shadow-lg uppercase tracking-tight">
                      {action.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="hidden lg:flex items-center justify-center px-8 border-l border-white/10">
                <div className="text-center">
                  <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2">Appraisal Status</p>
                  <div className="text-2xl font-black tracking-tighter italic">{status.toUpperCase()}</div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mb-32" />
          </div>
        </div>
      </div>

      {/* SUPERVISOR VIEW */}
      {(isSupervisor || isExec) && (
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 mt-16">
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
                  <Badge variant="primary">
                    {pendingCount > 0 ? `${pendingCount} Pending` : 'All Reviewed'}
                  </Badge>
                </div>
                <h2 className="text-3xl font-black tracking-tighter leading-tight text-slate-900 uppercase italic">Team Review Queue</h2>
                <p className="text-slate-500 mt-2 font-medium leading-relaxed text-sm">
                  {pendingCount > 0
                    ? `You have ${pendingCount} staff appraisal${pendingCount > 1 ? 's' : ''} awaiting your review. ${approvedCount} already approved.`
                    : 'No pending appraisals. All submissions have been reviewed.'}
                </p>
              </div>
              <Link to="/team"
                className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-primary-900 transition-all flex items-center gap-3 group shadow-lg shadow-primary-600/20">
                Enter Review Suite
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-50 rounded-full blur-3xl -mr-48 -mt-48" />
          </Card>

          {(isDeptHead || isExec) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
              {/* Compliance by dept */}
              <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6 sm:space-y-10">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-black text-slate-900 text-lg sm:text-xl uppercase tracking-tight">Compliance Tracking</h3>
                    <p className="text-xs text-slate-500 font-medium">Appraisal submission by department</p>
                  </div>
                  <PieChartIcon size={24} className="text-slate-300" />
                </div>
                <div className="grid grid-cols-1 gap-8">
                  {departments.slice(0, 4).map(dept => {
                    const deptRecords = appraisals.filter(a => a.departmentId === dept.id);
                    const submitted = deptRecords.filter(a => a.status !== AppraisalStatus.DRAFT).length;
                    const total = Math.max(dept.staffCount, submitted);
                    const pct = total > 0 ? Math.round((submitted / total) * 100) : 0;
                    const color = pct === 100 ? 'bg-green-600' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';
                    return (
                      <ProgressBar key={dept.id} label={dept.name} value={submitted} max={total}
                        colorClass={color} subtext={`${submitted} of ${total} submitted`} />
                    );
                  })}
                </div>
              </div>

              {/* Heatmap */}
              <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6 sm:space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-slate-900 text-lg sm:text-xl uppercase tracking-tight">Performance Heatmap</h3>
                    <p className="text-xs text-slate-500 font-medium">Direct reports KRA achievement</p>
                  </div>
                  <LayoutGrid size={24} className="text-slate-300" />
                </div>
                {heatmapData.length === 0 ? (
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center py-8">No submitted appraisals yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                          <th className="text-left pb-4 font-black">Staff Member</th>
                          <th className="pb-4 font-black">KRA 1</th>
                          <th className="pb-4 font-black">KRA 2</th>
                          <th className="pb-4 font-black">KRA 3</th>
                          <th className="pb-4 font-black">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {heatmapData.map((row: any) => (
                          <tr key={row.name} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="py-4"><p className="text-xs font-black text-slate-900">{row.name}</p></td>
                            {['kra1', 'kra2', 'kra3'].map((k, i) => (
                              <td key={k} className="py-4 px-2">
                                <div className="h-1 w-12 bg-slate-100 rounded-full mx-auto">
                                  <div className={cn('h-full rounded-full', i === 0 ? 'bg-green-500' : i === 1 ? 'bg-blue-500' : 'bg-purple-500')}
                                    style={{ width: `${row[k] ?? 0}%` }} />
                                </div>
                              </td>
                            ))}
                            <td className="py-4 text-center">
                              <span className="text-[10px] font-black px-2 py-1 bg-slate-100 rounded text-slate-600">
                                {Math.round(((row.kra1 ?? 0) + (row.kra2 ?? 0) + (row.kra3 ?? 0)) / 3)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EXECUTIVE ORG-WIDE */}
          {isExec && (
            <div className="space-y-8 mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
                {/* Compliance trend chart */}
                <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6 sm:space-y-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-black text-slate-900 text-2xl tracking-tight uppercase">Submission Trend</h3>
                      <p className="text-sm text-slate-500 font-medium">Appraisals submitted per period</p>
                    </div>
                    <PieChartIcon size={32} className="text-indigo-400" />
                  </div>
                  <div className="h-[250px] w-full">
                    {complianceTrend.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No submissions yet</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <AreaChart data={complianceTrend}>
                          <defs>
                            <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" hide />
                          <YAxis hide />
                          <Tooltip contentStyle={{ borderRadius: '24px', border: 'none' }} />
                          <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorComp)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Strategic alerts */}
                <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-100 text-slate-900 shadow-sm space-y-6 sm:space-y-8 relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="font-black text-xl sm:text-2xl tracking-tighter uppercase text-indigo-900 italic">Strategic Alerts</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Departments needing attention</p>
                    <div className="space-y-4 mt-8">
                      {departments
                        .map(dept => {
                          const deptRecords = appraisals.filter(a => a.departmentId === dept.id);
                          const submitted = deptRecords.filter(a => a.status !== AppraisalStatus.DRAFT).length;
                          const pct = dept.staffCount > 0 ? (submitted / dept.staffCount) * 100 : 100;
                          return { dept, pct };
                        })
                        .filter(({ pct }) => pct < 80)
                        .slice(0, 3)
                        .map(({ dept, pct }) => (
                          <div key={dept.id} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white transition-all group">
                            <div className="flex items-center gap-4">
                              <div className={cn('w-2.5 h-2.5 rounded-full animate-pulse',
                                pct < 40 ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]')} />
                              <div>
                                <p className="text-xs font-black">{dept.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{Math.round(pct)}% submission rate</p>
                              </div>
                            </div>
                            <ChevronRight size={18} className="text-slate-600 transition-transform group-hover:translate-x-1" />
                          </div>
                        ))}
                      {departments.every(({ }) => true) && appraisals.length === 0 && (
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center py-4">No submissions to analyse yet</p>
                      )}
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                </div>
              </div>

              {/* Org performance bar chart */}
              <div className="bg-white p-5 sm:p-8 lg:p-10 rounded-2xl border border-slate-100 shadow-sm space-y-6 sm:space-y-10">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-slate-900 text-xl sm:text-2xl tracking-tight uppercase">Organisation Performance Overview</h3>
                    <p className="text-sm text-slate-500 font-medium">Average approved score by department</p>
                  </div>
                  <BarChart3 size={32} className="text-indigo-400" />
                </div>
                <div className="h-[350px] w-full">
                  {deptChartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No approved appraisals yet</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <BarChart data={deptChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={45}>
                          {deptChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.score >= 90 ? '#16A34A' : '#07152f'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.section>
      )}
    </div>
  );
};
