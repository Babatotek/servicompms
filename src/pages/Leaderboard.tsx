import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Search, Medal, Award, ChevronRight, Filter, ArrowUpRight, Flame, Target } from 'lucide-react';
import { cn } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { useAppraisals, AppraisalRecord } from '../context/AppraisalContext';
import { useOrg } from '../context/OrgContext';

const GRADE_VARIANTS: Record<string, string> = {
  O: 'outstanding', E: 'excellent', VG: 'verygood', G: 'good', F: 'fair', P: 'poor',
};

// Grade-based bar colours per PRD §8.3
const GRADE_BAR: Record<string, string> = {
  O: 'bg-green-600', E: 'bg-blue-600', VG: 'bg-purple-600',
  G: 'bg-amber-500', F: 'bg-orange-500', P: 'bg-red-600',
};

type LeaderboardTab = 'annual' | 'quarter' | 'department';

export const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const { getLeaderboard, appraisals } = useAppraisals();
  const { departments } = useOrg();
  const [search, setSearch] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<LeaderboardTab>('annual');

  const rawBoard = getLeaderboard();

  // Current quarter board — latest submitted appraisal per user regardless of approval
  const currentQBoard = React.useMemo(() => {
    const byUser: Record<string, AppraisalRecord> = {};
    appraisals.forEach(a => {
      if (!byUser[a.userId] || new Date(a.submittedAt) > new Date(byUser[a.userId].submittedAt)) {
        byUser[a.userId] = a;
      }
    });
    return Object.values(byUser)
      .filter(a => a.scores.grandTotal > 0)
      .sort((a, b) => b.scores.grandTotal - a.scores.grandTotal)
      .map(a => {
        const s = a.scores.grandTotal;
        const grade = s >= 100 ? 'O' : s >= 90 ? 'E' : s >= 80 ? 'VG' : s >= 70 ? 'G' : s >= 60 ? 'F' : 'P';
        return { userId: a.userId, userName: a.userName, departmentId: a.departmentId, score: Math.round(s * 10) / 10, grade };
      });
  }, [appraisals]);

  // Department board — average annual score per dept
  const deptBoard = React.useMemo(() => {
    const byDept: Record<string, number[]> = {};
    rawBoard.forEach(e => {
      if (!byDept[e.departmentId]) byDept[e.departmentId] = [];
      byDept[e.departmentId].push(e.score);
    });
    return Object.entries(byDept)
      .map(([deptId, scores]) => {
        const dept = departments.find(d => d.id === deptId);
        const avg = Math.round((scores.reduce((s, v) => s + v, 0) / scores.length) * 10) / 10;
        const grade = avg >= 100 ? 'O' : avg >= 90 ? 'E' : avg >= 80 ? 'VG' : avg >= 70 ? 'G' : avg >= 60 ? 'F' : 'P';
        return { id: deptId, name: dept?.name ?? deptId, score: avg, grade, count: scores.length };
      })
      .sort((a, b) => b.score - a.score);
  }, [rawBoard, departments]);

  const activeBoard = activeTab === 'annual' ? rawBoard : activeTab === 'quarter' ? currentQBoard : [];

  const board = activeBoard.filter(e =>
    search === '' ||
    e.userName.toLowerCase().includes(search.toLowerCase()) ||
    e.departmentId.toLowerCase().includes(search.toLowerCase())
  );

  const topUnits = React.useMemo(() => {
    return deptBoard.slice(0, 3);
  }, [deptBoard]);

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto pb-8">
      {/* Tab switcher + Search */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Tabs */}
        <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm gap-1">
          {([
            { id: 'annual',     label: 'Annual' },
            { id: 'quarter',    label: 'Current Quarter' },
            { id: 'department', label: 'By Department' },
          ] as { id: LeaderboardTab; label: string }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all',
                activeTab === tab.id ? 'bg-primary-950 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab !== 'department' && (
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-600 transition-colors" size={16} />
            <input type="text" placeholder="SEARCH STAFF..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-5 py-2.5 text-[11px] font-black tracking-widest text-slate-900 placeholder:text-slate-400 focus:border-primary-500 outline-none transition-all shadow-sm" />
          </div>
        )}
      </section>

      {board.length === 0 && activeTab !== 'department' ? (
        <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <Trophy size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            {search ? 'No staff match your search.' : 'No approved appraisals yet — rankings appear once appraisals are approved.'}
          </p>
        </div>
      ) : activeTab === 'department' ? (
        /* Department Rankings */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <Card className="lg:col-span-8 p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-50 flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><Medal size={18} /></div>
              <div>
                <h2 className="text-sm font-black text-slate-900 tracking-tighter uppercase italic">Department Rankings</h2>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-0.5">Average annual score per unit</p>
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {deptBoard.map((dept, idx) => (
                <motion.div key={dept.id}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + idx * 0.04 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-all group">
                  <div className="w-8 font-mono text-lg font-black text-slate-200 group-hover:text-primary-400 transition-colors text-center italic flex-shrink-0">
                    {(idx + 1) < 10 ? `0${idx + 1}` : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-xs text-slate-900 uppercase italic tracking-tight">{dept.name}</h4>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{dept.count} staff ranked</p>
                  </div>
                  <div className="hidden lg:block w-40 space-y-1">
                    <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Score</span><span>{dept.score}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${dept.score}%` }}
                        className={cn('h-full rounded-full', GRADE_BAR[dept.grade] ?? 'bg-slate-300')} />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 px-4 border-l border-slate-100 flex-shrink-0">
                    <span className="text-lg font-black text-slate-900 font-mono italic">{dept.score}%</span>
                    <Badge variant={(GRADE_VARIANTS[dept.grade] ?? 'default') as any} size="sm">{dept.grade}</Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-primary-950 rounded-2xl p-5 text-white shadow-heavy relative overflow-hidden">
              <div className="relative z-10 space-y-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-primary-400"><Flame size={16} /></div>
                <h3 className="font-black text-base tracking-tighter uppercase italic">Top Performing Unit</h3>
                {deptBoard[0] && (
                  <>
                    <p className="text-2xl font-black tracking-tighter italic">{deptBoard[0].name}</p>
                    <p className="text-[10px] font-black text-primary-300 uppercase tracking-widest">{deptBoard[0].score}% average — Grade {deptBoard[0].grade}</p>
                  </>
                )}
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-[0.05] -rotate-12 translate-x-1/4"><Trophy size={140} /></div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Podium */}
          <div className="grid grid-cols-3 gap-3">
            {board.slice(0, 3).map((entry, idx) => (
              <Card key={entry.userId}
                className={cn("relative p-3 sm:p-4 flex flex-col items-center text-center overflow-hidden group",
                  idx === 0 ? "bg-primary-950 text-white border-primary-900 shadow-heavy" : "bg-white")}>
                <div className="absolute top-2.5 left-2.5">
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black font-mono",
                    idx === 0 ? "bg-white/10 text-white" : "bg-slate-50 text-slate-500")}>
                    0{idx + 1}
                  </div>
                </div>
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mt-4 mb-2 shadow-lg transition-transform group-hover:scale-110",
                  idx === 0 ? "bg-amber-400 text-slate-900" : idx === 1 ? "bg-slate-50 text-slate-400" : "bg-orange-50 text-orange-600")}>
                  <Trophy size={idx === 0 ? 20 : 16} />
                </div>
                <p className={cn("text-[8px] font-black uppercase tracking-[0.15em] mb-1", idx === 0 ? "text-primary-400" : "text-slate-400")}>
                  {idx === 0 ? 'Champion' : idx === 1 ? 'Diamond' : 'Elite'}
                </p>
                <h3 className="font-black text-[11px] sm:text-xs tracking-tight leading-tight uppercase italic line-clamp-2 mb-1">{entry.userName}</h3>
                <p className={cn("text-[8px] font-black uppercase tracking-[0.15em] mb-2 truncate w-full", idx === 0 ? "text-slate-500" : "text-slate-400")}>
                  {entry.departmentId}
                </p>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-black tracking-tighter font-mono italic">{entry.score}</span>
                  <span className="text-xs font-black text-primary-500">%</span>
                </div>
                <Badge variant={GRADE_VARIANTS[entry.grade] ?? 'default'} className="mt-1.5" size="sm">{entry.grade}</Badge>
                {idx === 0 && <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity"><Award size={120} /></div>}
              </Card>
            ))}
          </div>

          {/* Table + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <Card className="lg:col-span-8 p-0 overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><Medal size={18} /></div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900 tracking-tighter uppercase italic">Full Rankings</h2>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-0.5">Live from submitted appraisals</p>
                  </div>
                </div>
                <div className="bg-primary-50 rounded-xl px-4 py-2 flex items-center gap-2 border border-primary-100">
                  <span className="text-[9px] font-black text-primary-600 uppercase tracking-widest leading-none">Ranked</span>
                  <span className="text-sm font-black text-slate-900 font-mono tracking-tighter leading-none">{board.length} STAFF</span>
                </div>
              </div>

              <div className="divide-y divide-slate-50">
                {board.map((entry, idx) => {
                  const isMe = entry.userId === user?.id;
                  const initials = entry.userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2);
                  return (
                    <motion.div key={entry.userId}
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + idx * 0.03 }}
                      className={cn(
                        "flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3 hover:bg-slate-50/50 transition-all cursor-pointer group",
                        isMe && "bg-primary-50/60 border-l-2 border-primary-500"
                      )}>
                      <div className="w-8 font-mono text-lg font-black text-slate-200 group-hover:text-primary-400 transition-colors text-center leading-none italic flex-shrink-0">
                        {(idx + 1) < 10 ? `0${idx + 1}` : idx + 1}
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center transition-transform group-hover:scale-110 p-0.5 overflow-hidden flex-shrink-0">
                        {idx === 0
                          ? <div className="w-full h-full bg-amber-400 rounded-lg flex items-center justify-center text-slate-900"><Trophy size={14} /></div>
                          : <div className="w-full h-full bg-slate-50 rounded-lg flex items-center justify-center"><span className="text-[10px] font-black text-slate-400 font-mono">{initials}</span></div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <h4 className="font-black text-xs text-slate-900 truncate tracking-tight uppercase italic">{entry.userName}</h4>
                          {isMe && <Badge variant="primary" className="bg-primary-950 text-white border-primary-900 hidden sm:flex">You</Badge>}
                        </div>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] truncate">{entry.departmentId}</p>
                      </div>
                      <div className="hidden lg:block w-32 space-y-1">
                        <div className="flex justify-between items-center text-[8px] font-black text-slate-400 px-0.5 uppercase tracking-widest">
                          <span>Score</span><span>{entry.score}%</span>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${entry.score}%` }}
                            className={cn("h-full rounded-full", GRADE_BAR[entry.grade] ?? 'bg-slate-300')} />
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 px-3 sm:px-4 border-x border-slate-100 flex-shrink-0">
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-lg font-black text-slate-900 tracking-tighter font-mono leading-none italic">{entry.score}</span>
                          <span className="text-[9px] font-black text-primary-500">%</span>
                        </div>
                        <Badge variant={GRADE_VARIANTS[entry.grade] ?? 'default'} size="sm">{entry.grade}</Badge>
                      </div>
                      <div className="w-8 flex justify-end flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-slate-900 group-hover:bg-white transition-all shadow-sm">
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="bg-slate-50/50 py-3 flex justify-center border-t border-slate-50">
                <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors flex items-center gap-2 group">
                  {board.length} staff ranked <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </Card>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-primary-950 rounded-2xl p-5 text-white shadow-heavy relative overflow-hidden group">
                <div className="relative z-10 space-y-4">
                  <div>
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-primary-400 mb-3 group-hover:scale-110 transition-transform"><Flame size={16} /></div>
                    <h3 className="font-black text-base tracking-tighter leading-tight uppercase italic group-hover:text-primary-400 transition-colors">Join the Elite Corps</h3>
                    <p className="text-slate-400 text-[10px] mt-1.5 font-black uppercase tracking-[0.15em] leading-relaxed opacity-70 italic">
                      Staff consistently achieving "Outstanding" grades qualify for performance-based bonuses.
                    </p>
                  </div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{rawBoard.filter(e => e.grade === 'O').length} Outstanding achievers</p>
                  <button className="w-full bg-white text-slate-900 rounded-lg py-2.5 font-black text-[10px] uppercase tracking-widest hover:bg-primary-400 hover:text-white transition-all active:scale-95">
                    Achievement Metrics
                  </button>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-[0.1] -rotate-12 translate-x-1/4 transition-all"><Trophy size={140} /></div>
              </div>

              <Card className="p-4 space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                  <div className="w-8 h-8 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center"><Target size={16} /></div>
                  <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase italic">Top Units</h2>
                </div>
                {topUnits.length === 0 ? (
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center py-4">No data yet</p>
                ) : (
                  <div className="space-y-4">
                    {topUnits.map(unit => (
                      <div key={unit.name} className="space-y-1.5 group">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Unit</p>
                            <h4 className="font-black text-slate-900 text-[10px] group-hover:text-primary-600 transition-colors uppercase italic">{unit.name}</h4>
                          </div>
                          <p className="text-base font-black text-slate-900 font-mono tracking-tighter leading-none italic">{unit.score}%</p>
                        </div>
                        <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${unit.score}%` }}
                            transition={{ duration: 1.5, ease: 'circOut' }}
                            className="h-full bg-slate-900 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
