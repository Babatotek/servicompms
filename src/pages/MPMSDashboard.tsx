import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe, Building2, Layers, Activity, Target,
  ShieldCheck, Download, RefreshCw, ChevronRight,
} from 'lucide-react';
import { useOrg } from '../context/OrgContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { mpmsApi } from '../lib/api';
import { CategoryDetailPanel } from '../components/mpms/CategoryDetailPanel';

// ── Circular progress ring ────────────────────────────────────────────────────
const Ring: React.FC<{ score: number; size?: number; stroke?: number; color?: string }> = ({
  score, size = 56, stroke = 6, color = '#6366f1',
}) => {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
    </svg>
  );
};

const CAT_COLORS = ['#6366f1', '#2563eb', '#8b5cf6'];
const CAT_ICONS  = [Globe, Building2, Layers];
const DEPT_COLORS = ['#0f172a', '#2563eb', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#0891b2', '#d97706'];

export const MPMSDashboard: React.FC = () => {
  const { mpmsCategories, mpmsKRAs, mpmsObjectives, mpmsKPIs, mpmsAchievements, departments } = useOrg();
  const [apiData, setApiData] = useState<{ institutional_score: number; category_scores: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCatIdx, setSelectedCatIdx] = useState<number | null>(null);
  const year = new Date().getFullYear();

  const fetchData = () => {
    setLoading(true);
    mpmsApi.dashboard(year)
      .then(setApiData)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [year]);

  const categoryScores = useMemo(() => {
    if (apiData?.category_scores?.length) return apiData.category_scores;
    return mpmsCategories.map(cat => {
      const catKRAs   = mpmsKRAs.filter(k => k.categoryId === cat.id);
      const catKPIIds = catKRAs.flatMap(kra => {
        const objs = mpmsObjectives.filter(o => o.kraId === kra.id);
        return mpmsKPIs.filter(kpi => objs.some(o => o.id === kpi.objectiveId)).map(kpi => kpi.id);
      });
      const achieved = catKPIIds
        .map(id => mpmsAchievements.find(a => a.kpiId === id))
        .filter(Boolean) as any[];
      const avg = achieved.length > 0
        ? achieved.reduce((s: number, a: any) => s + a.achievementValue, 0) / achieved.length : 0;
      return {
        ...cat,
        score:           Math.round(avg * 10) / 10,
        kpi_count:       catKPIIds.length,
        submitted_count: achieved.length,
        weighted_score:  (avg / 100) * (cat.weight ?? cat.weight_percent ?? 0),
      };
    });
  }, [apiData, mpmsCategories, mpmsKRAs, mpmsObjectives, mpmsKPIs, mpmsAchievements]);

  const institutionalScore = useMemo(() => {
    if (apiData?.institutional_score !== undefined) return apiData.institutional_score;
    const tw = categoryScores.reduce((a: number, b: any) => a + (b.weight ?? b.weight_percent ?? 0), 0);
    const aw = categoryScores.reduce((a: number, b: any) => a + (b.weighted_score ?? 0), 0);
    return tw > 0 ? Math.round((aw / tw) * 1000) / 10 : 0;
  }, [apiData, categoryScores]);

  const kpiChartData = useMemo(() =>
    mpmsAchievements.slice(0, 10).map((a: any) => {
      const kpi   = mpmsKPIs.find(k => k.id === a.kpiId);
      const label = kpi
        ? (kpi.description.length > 20 ? kpi.description.slice(0, 20) + '…' : kpi.description)
        : String(a.kpiId);
      return { name: label, score: a.achievementValue };
    }),
  [mpmsAchievements, mpmsKPIs]);

  const deptData = useMemo(() =>
    departments.slice(0, 8).map((d, i) => ({
      name:  d.code,
      value: d.unitWeight,
      color: DEPT_COLORS[i % DEPT_COLORS.length],
      fullName: d.name,
    })),
  [departments]);

  return (
    <div className="w-full max-w-[1800px] mx-auto space-y-3 pb-6">

      {/* ── Row 1: Hero strip + 3 category cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">

        {/* Hero — col-span-4 */}
        <div className="lg:col-span-4 bg-primary-950 rounded-2xl p-4 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-primary-300">
                Live · {year} Cycle
              </span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter leading-tight text-white">
              Master MPMS<br />
              <span className="text-primary-400">Scorecard</span>
            </h1>
            <p className="text-xs text-primary-200/50 mt-1 leading-relaxed">
              Institutional performance index across all priority areas.
            </p>
          </div>

          {/* Score + ring */}
          <div className="relative z-10 flex items-end justify-between mt-3">
            <div>
              <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">
                Institutional Score
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tighter leading-none">
                  {loading ? '—' : institutionalScore.toFixed(1)}
                </span>
                <span className="text-sm font-black text-primary-400">%</span>
              </div>
            </div>
            <div className="relative">
              <Ring score={loading ? 0 : institutionalScore} size={60} stroke={6} color="#818cf8" />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white">
                {loading ? '…' : `${Math.round(institutionalScore)}%`}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="relative z-10 flex gap-2 mt-3">
            <button className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/10 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              <Download size={10} /> Export
            </button>
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/10 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <RefreshCw size={10} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
          <div className="absolute -top-8 -left-8 w-28 h-28 bg-primary-500/10 rounded-full blur-2xl" />
        </div>

        {/* 3 category cards — col-span-8 */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {categoryScores.map((cat: any, i: number) => {
            const Icon   = CAT_ICONS[i] ?? Globe;
            const color  = CAT_COLORS[i] ?? '#6366f1';
            const weight = cat.weight ?? cat.weight_percent ?? 0;
            const submitted = cat.submitted_count ?? cat.submittedCount ?? 0;
            const total     = cat.kpi_count ?? cat.kpiCount ?? 0;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="h-full"
              >
                <Card onClick={() => setSelectedCatIdx(i)} className="p-3 h-full flex flex-col justify-between group hover:shadow-md transition-all cursor-pointer relative overflow-hidden">
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      <Icon size={14} />
                    </div>
                    <Badge variant="default" size="sm" className="bg-slate-50 border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      {weight}% wt.
                    </Badge>
                  </div>

                  <p className="text-xs font-black text-slate-900 uppercase tracking-tight leading-tight mb-2">
                    {cat.name}
                  </p>

                  {/* Score + ring */}
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-2xl font-black tracking-tighter leading-none text-slate-900">
                        {loading ? '—' : cat.score.toFixed(1)}
                      </span>
                      <span className="text-xs font-black text-slate-400 ml-1">%</span>
                    </div>
                    <Ring score={loading ? 0 : cat.score} size={44} stroke={5} color={color} />
                  </div>

                  {/* Progress bar */}
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.score}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {submitted}/{total} KPIs
                    </span>
                    <ChevronRight size={12} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Row 2: KPI chart + Unit weights ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">

        {/* KPI bar chart — col-span-7 */}
        <Card className="lg:col-span-7 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                KPI Achievement Breakdown
              </h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                Submitted achievement values across master KPI library
              </p>
            </div>
            <Activity size={14} className="text-slate-300" />
          </div>

          <div className="h-[180px]">
            {kpiChartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-2">
                <Activity size={24} className="text-slate-200" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">
                  No achievement data yet
                </p>
                <p className="text-[10px] text-slate-300 uppercase tracking-widest text-center">
                  Dept Heads enter values via MPMS → KPI Entry
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpiChartData} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="name" axisLine={false} tickLine={false}
                    tick={{ fontSize: 7, fontWeight: 900, fill: '#94a3b8' }}
                    interval={0} angle={-35} height={55}
                  />
                  <YAxis
                    axisLine={false} tickLine={false}
                    tick={{ fontSize: 8, fontWeight: 900, fill: '#94a3b8' }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff', fontSize: 10 }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="score" radius={[3, 3, 0, 0]} barSize={18} fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Unit weights — col-span-5 */}
        <Card className="lg:col-span-5 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                Unit Weight Distribution
              </h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                Institutional contribution by department
              </p>
            </div>
            <Target size={14} className="text-slate-300" />
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto">
            {deptData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2.5">
                <div
                  className="w-5 h-5 rounded-lg flex items-center justify-center text-white text-[9px] font-black flex-shrink-0"
                  style={{ backgroundColor: d.color }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-tight truncate">
                      {d.fullName ?? d.name}
                    </span>
                    <span className="text-xs font-black text-slate-900 font-mono ml-2 flex-shrink-0">
                      {d.value}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(d.value / 50) * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.05 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2.5">
            <div className="w-7 h-7 bg-green-50 rounded-xl flex items-center justify-center text-green-600 flex-shrink-0">
              <ShieldCheck size={13} />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-900 uppercase leading-none">
                  Compliance Assured
                </p>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                  Verified · Institutional Audit Unit
                </p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Row 3: KRA summary table ── */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
              KRA Framework Summary
            </h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
              All {mpmsKRAs.length} Key Result Areas across {mpmsCategories.length} priority categories
            </p>
          </div>
          <Badge variant="primary" size="sm">{year}</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[480px]">
            <thead>
              <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="pb-2 pr-4">KRA</th>
                <th className="pb-2 pr-4">Category</th>
                <th className="pb-2 pr-4 text-right">Weight</th>
                <th className="pb-2">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mpmsKRAs.slice(0, 8).map((kra: any) => {
                const cat    = mpmsCategories.find((c: any) => c.id === kra.categoryId);
                const catIdx = mpmsCategories.findIndex((c: any) => c.id === kra.categoryId);
                const color  = CAT_COLORS[catIdx] ?? '#94a3b8';
                const catScore = categoryScores.find((cs: any) => cs.id === kra.categoryId);
                const progress = catScore ? catScore.score : 0;
                return (
                  <tr key={kra.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2 pr-4">
                      <p className="text-xs font-black text-slate-900 uppercase tracking-tight leading-tight">
                        {kra.name.length > 38 ? kra.name.slice(0, 38) + '…' : kra.name}
                      </p>
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: color }}
                      >
                        {cat?.code ?? cat?.name?.slice(0, 4) ?? '—'}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <span className="text-xs font-black text-slate-900 font-mono">{kra.weight}%</span>
                    </td>
                    <td className="py-2 w-28">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${progress}%`, backgroundColor: color }}
                          />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 font-mono w-7 text-right">
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {mpmsKRAs.length > 8 && (
            <div className="pt-2.5 text-center">
              <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-700 transition-colors">
                + {mpmsKRAs.length - 8} more KRAs
              </button>
            </div>
          )}
        </div>
      </Card>
      {/* ── Category detail panel ── */}
      <AnimatePresence>
        {selectedCatIdx !== null && (
          <CategoryDetailPanel
            category={mpmsCategories[selectedCatIdx]}
            kras={mpmsKRAs}
            objectives={mpmsObjectives}
            kpis={mpmsKPIs}
            departments={departments}
            color={CAT_COLORS[selectedCatIdx] ?? '#6366f1'}
            onClose={() => setSelectedCatIdx(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
