import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Search, 
  TrendingUp, 
  TrendingDown,
  Medal,
  Award,
  ChevronRight,
  Filter,
  ArrowUpRight,
  Flame,
  Target
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'OLADIMEJI FUNMILAYO', dept: 'ACCOUNTS & FINANCE', score: 98.4, grade: 'O', status: 'up' },
  { rank: 2, name: 'NAWABUA CHINYERE', dept: 'ADMIN & HR', score: 91.2, grade: 'E', status: 'same' },
  { rank: 3, name: 'OLEH NNEKA', dept: 'OPERATIONS', score: 88.6, grade: 'E', status: 'up' },
  { rank: 4, name: 'LAWAL OBEHI', dept: 'OPERATIONS', score: 88.4, grade: 'E', status: 'down' },
  { rank: 5, name: 'AKINBODEWA NGOZI', dept: 'OPERATIONS', score: 78.4, grade: 'G', status: 'up' },
  { rank: 6, name: 'ABDULLAHI ISAH', dept: 'ADMIN & HR', score: 75.2, grade: 'VG', status: 'same' },
  { rank: 7, name: 'OMAKWU PETER', dept: 'INTERNAL AUDIT', score: 72.8, grade: 'VG', status: 'down' },
  { rank: 8, name: 'ODUMU GODWIN', dept: 'ACCOUNTS & FINANCE', score: 70.4, grade: 'G', status: 'up' },
];

const GRADE_VARIANTS: Record<string, any> = {
  'O': 'outstanding',
  'E': 'excellent',
  'VG': 'verygood',
  'G': 'good',
  'F': 'fair',
  'P': 'poor',
};

export const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto pb-8">
      {/* Search & Filter Bar */}
      <section className="flex items-center gap-3">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-600 transition-colors" size={16} />
          <input
            type="text"
            placeholder="SEARCH STAFF..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-5 py-2.5 text-[11px] font-black tracking-widest text-slate-900 placeholder:text-slate-400 focus:border-primary-500 outline-none transition-all shadow-sm"
          />
        </div>
        <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all group shadow-sm">
          <Filter size={16} className="text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </section>

      {/* Top 3 Podium Cards — compact horizontal layout */}
      <div className="grid grid-cols-3 gap-3">
        {loading ? [1, 2, 3].map(i => (
          <Card key={i} className="h-[140px] flex flex-col items-center justify-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="h-2 w-20" />
            <Skeleton className="h-5 w-28" />
          </Card>
        )) : MOCK_LEADERBOARD.slice(0, 3).map((staff, idx) => (
          <Card
            key={staff.name}
            className={cn(
              "relative p-3 sm:p-4 flex flex-col items-center text-center overflow-hidden group",
              idx === 0
                ? "bg-primary-950 text-white border-primary-900 shadow-heavy"
                : "bg-white"
            )}
          >
            {/* Rank badge */}
            <div className="absolute top-2.5 left-2.5">
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black font-mono",
                idx === 0 ? "bg-white/10 text-white" : "bg-slate-50 text-slate-500"
              )}>
                0{staff.rank}
              </div>
            </div>

            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center mt-4 mb-2 shadow-lg transition-transform group-hover:scale-110",
              idx === 0 ? "bg-amber-400 text-slate-900" :
              idx === 1 ? "bg-slate-50 text-slate-400" : "bg-orange-50 text-orange-600"
            )}>
              <Trophy size={idx === 0 ? 20 : 16} />
            </div>

            <p className={cn("text-[8px] font-black uppercase tracking-[0.15em] mb-1", idx === 0 ? "text-primary-400" : "text-slate-400")}>
              {idx === 0 ? 'Champion' : idx === 1 ? 'Diamond' : 'Elite'}
            </p>

            <h3 className="font-black text-[11px] sm:text-xs tracking-tight leading-tight uppercase italic line-clamp-2 mb-1">{staff.name}</h3>
            <p className={cn("text-[8px] font-black uppercase tracking-[0.15em] mb-2 truncate w-full", idx === 0 ? "text-slate-500" : "text-slate-400")}>
              {staff.dept}
            </p>

            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-black tracking-tighter font-mono italic">{staff.score}</span>
              <span className="text-xs font-black text-primary-500">%</span>
            </div>
            <Badge variant={GRADE_VARIANTS[staff.grade]} className="mt-1.5" size="sm">
              {staff.grade}
            </Badge>

            {idx === 0 && (
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <Award size={120} />
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Rankings + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Table */}
        <Card className="lg:col-span-8 p-0 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <Medal size={18} />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 tracking-tighter uppercase italic">Full Rankings</h2>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-0.5">Refreshed: 9th May 2026</p>
              </div>
            </div>
            <div className="bg-primary-50 rounded-xl px-4 py-2 flex items-center gap-2 border border-primary-100">
              <span className="text-[9px] font-black text-primary-600 uppercase tracking-widest leading-none">Active Pool</span>
              <span className="text-sm font-black text-slate-900 font-mono tracking-tighter leading-none">184 STAFF</span>
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {loading ? [1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="w-8 h-6" />
                <Skeleton className="w-9 h-9 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-2 w-28" />
                </div>
                <Skeleton className="w-20 h-8 rounded-lg" />
              </div>
            )) : MOCK_LEADERBOARD.map((staff, idx) => (
              <motion.div
                key={staff.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (idx * 0.04) }}
                className="flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3 hover:bg-slate-50/50 transition-all cursor-pointer group"
              >
                <div className="w-8 font-mono text-lg font-black text-slate-200 group-hover:text-primary-400 transition-colors text-center leading-none italic flex-shrink-0">
                  {staff.rank < 10 ? `0${staff.rank}` : staff.rank}
                </div>

                <div className="w-9 h-9 rounded-xl bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center transition-transform group-hover:scale-110 p-0.5 overflow-hidden flex-shrink-0">
                  {staff.rank === 1 ? (
                    <div className="w-full h-full bg-amber-400 rounded-lg flex items-center justify-center text-slate-900">
                      <Trophy size={14} />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-slate-50 rounded-lg flex items-center justify-center">
                      <span className="text-[10px] font-black text-slate-400 font-mono">{staff.name.split(' ')[0][0]}{staff.name.split(' ')[1][0]}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h4 className="font-black text-xs text-slate-900 truncate tracking-tight uppercase italic">{staff.name}</h4>
                    {staff.status === 'up' ? (
                      <Badge variant="primary" size="sm" className="bg-green-50 text-green-600 border-green-100 hidden sm:flex">
                        <TrendingUp size={9} className="mr-1" /> UP
                      </Badge>
                    ) : staff.status === 'down' ? (
                      <Badge variant="primary" size="sm" className="bg-red-50 text-red-600 border-red-100 hidden sm:flex">
                        <TrendingDown size={9} className="mr-1" /> DOWN
                      </Badge>
                    ) : null}
                    {staff.rank === 4 && <Badge variant="primary" className="bg-primary-950 text-white border-primary-900 hidden sm:flex">You</Badge>}
                  </div>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] truncate">{staff.dept}</p>
                </div>

                <div className="hidden lg:block w-32 space-y-1">
                  <div className="flex justify-between items-center text-[8px] font-black text-slate-400 px-0.5 uppercase tracking-widest">
                    <span>Score</span>
                    <span>{staff.score}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${staff.score}%` }}
                      className={cn("h-full rounded-full transition-all duration-1000", idx === 0 ? "bg-primary-600" : "bg-slate-900")}
                    />
                  </div>
                </div>

                <div className="flex flex-col items-end gap-0.5 px-3 sm:px-4 border-x border-slate-100 flex-shrink-0">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-lg font-black text-slate-900 tracking-tighter font-mono leading-none italic">{staff.score}</span>
                    <span className="text-[9px] font-black text-primary-500">%</span>
                  </div>
                  <Badge variant={GRADE_VARIANTS[staff.grade]} size="sm">{staff.grade}</Badge>
                </div>

                <div className="w-8 flex justify-end flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-slate-900 group-hover:bg-white transition-all shadow-sm">
                    <ChevronRight size={14} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-slate-50/50 py-3 flex justify-center border-t border-slate-50">
            <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors flex items-center gap-2 group">
              Display extended staff pool
              <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </Card>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-primary-950 rounded-2xl p-5 text-white shadow-heavy relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
              <div>
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-primary-400 mb-3 group-hover:scale-110 transition-transform">
                  <Flame size={16} />
                </div>
                <h3 className="font-black text-base tracking-tighter leading-tight uppercase italic group-hover:text-primary-400 transition-colors">Join the Elite Corps</h3>
                <p className="text-slate-400 text-[10px] mt-1.5 font-black uppercase tracking-[0.15em] leading-relaxed opacity-70 italic">
                  Staff consistently achieving "Outstanding" grades qualify for performance-based bonuses.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex -space-x-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-8 h-8 rounded-lg border-2 border-primary-950 bg-slate-800 flex items-center justify-center text-[8px] font-black">S{i}</div>
                  ))}
                  <div className="w-8 h-8 rounded-lg border-2 border-primary-950 bg-primary-600 flex items-center justify-center text-[8px] font-black shadow-lg">+12</div>
                </div>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Global Top 5% Achievers</p>
              </div>

              <button className="w-full bg-white text-slate-900 rounded-lg py-2.5 font-black text-[10px] uppercase tracking-widest hover:bg-primary-400 hover:text-white transition-all active:scale-95">
                Achievement Metrics
              </button>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-[0.1] -rotate-12 translate-x-1/4 transition-all">
              <Trophy size={140} />
            </div>
          </div>

          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
              <div className="w-8 h-8 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center">
                <Target size={16} />
              </div>
              <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase italic">Top Units</h2>
            </div>

            <div className="space-y-4">
              {[
                { name: 'ADMIN & HR', score: 88.4 },
                { name: 'OPERATIONS', score: 82.1 },
                { name: 'ACCOUNTS & FINANCE', score: 79.5 },
              ].map((dept) => (
                <div key={dept.name} className="space-y-1.5 group">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Unit</p>
                      <h4 className="font-black text-slate-900 text-[10px] group-hover:text-primary-600 transition-colors uppercase italic">{dept.name}</h4>
                    </div>
                    <p className="text-base font-black text-slate-900 font-mono tracking-tighter leading-none italic">{dept.score}%</p>
                  </div>
                  <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dept.score}%` }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                      className="h-full bg-slate-900 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
