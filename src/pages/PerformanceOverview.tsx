import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Filter, ChevronDown, LayoutGrid, List, ArrowUpRight,
  User, Building2, Calendar, MoreVertical, CheckCircle2, X as XIcon,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { useAppraisals } from '../context/AppraisalContext';
import { useOrg } from '../context/OrgContext';
import { useNotifications } from '../context/NotificationContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

const GRADE_BAR: Record<string, string> = {
  O: 'bg-green-600', E: 'bg-blue-600', VG: 'bg-purple-600',
  G: 'bg-amber-500', F: 'bg-orange-500', P: 'bg-red-600',
};
const GRADE_BADGE: Record<string, string> = {
  O: 'outstanding', E: 'excellent', VG: 'verygood',
  G: 'good', F: 'fair', P: 'poor',
};

function scoreToGrade(score: number): string {
  if (score >= 100) return 'O';
  if (score >= 90) return 'E';
  if (score >= 80) return 'VG';
  if (score >= 70) return 'G';
  if (score >= 60) return 'F';
  return 'P';
}

export const PerformanceOverview: React.FC = () => {
  const { user } = useAuth();
  const { appraisals } = useAppraisals();
  const { departments } = useOrg();
  const { addNotification } = useNotifications();

  const [view, setView] = useState<'table' | 'grid'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  // ── Role-scoped dataset (PRD §9 — Access Control) ──────────────────────────
  // NC / Deputy Director → all appraisals
  // Dept Head → only their department
  // Team Lead / Supervisor → only their direct reports (supervisorId === user.id)
  const scopedAppraisals = useMemo(() => {
    if (!user) return [];
    if (user.role === UserRole.NC || user.role === UserRole.DEPUTY_DIRECTOR || user.role === UserRole.SUPER_ADMIN) {
      return appraisals;
    }
    if (user.role === UserRole.DEPT_HEAD) {
      return appraisals.filter(a => a.departmentId === user.departmentId);
    }
    if (user.role === UserRole.TEAM_LEAD) {
      return appraisals.filter(a => a.supervisorId === user.id);
    }
    return [];
  }, [appraisals, user]);

  // ── Aggregate per-user: collect all quarters, compute annual avg ────────────
  const staffRows = useMemo(() => {
    const byUser: Record<string, any> = {};
    scopedAppraisals.forEach(a => {
      if (!byUser[a.userId]) {
        byUser[a.userId] = {
          id: a.userId,
          name: a.userName,
          ippis: a.ippisNo,
          designation: a.designation,
          deptId: a.departmentId,
          supervisorId: a.supervisorId,
          quarters: {} as Record<string, number>,
          latestStatus: a.status,
          latestSubmittedAt: a.submittedAt,
        };
      }
      const row = byUser[a.userId];
      // Extract quarter label from period string e.g. "Q1-2026" → "Q1"
      const qLabel = a.period.split('-')[0];
      row.quarters[qLabel] = a.scores.grandTotal;
      // Keep the most recent status
      if (new Date(a.submittedAt) > new Date(row.latestSubmittedAt)) {
        row.latestStatus = a.status;
        row.latestSubmittedAt = a.submittedAt;
      }
    });

    return Object.values(byUser).map((row: any) => {
      const scores = Object.values(row.quarters) as number[];
      const annual = scores.length > 0
        ? Math.round((scores.reduce((s: number, v: number) => s + v, 0) / scores.length) * 10) / 10
        : 0;
      const dept = departments.find(d => d.id === row.deptId);
      return {
        ...row,
        dept: dept?.name ?? row.deptId,
        annual,
        grade: annual > 0 ? scoreToGrade(annual) : '—',
      };
    });
  }, [scopedAppraisals, departments]);

  // ── Filters ─────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return staffRows.filter(s => {
      const matchSearch = !searchTerm ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.ippis?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDept = !filterDept || s.deptId === filterDept;
      return matchSearch && matchDept;
    });
  }, [staffRows, searchTerm, filterDept]);

  const handleExportPDF = async (staff: any) => {
    addNotification('info', 'Report Generation', `Generating performance report for ${staff.name}...`);
    try {
      const { generateAppraisalPDF } = await import('../lib/exportUtils');
      generateAppraisalPDF({
        userName: staff.name,
        ippisNo: staff.ippis,
        department: staff.dept,
        designation: staff.designation,
        period: 'Annual 2026',
        totalScore: staff.annual,
        grade: staff.grade,
      }, `Performance_Report_${staff.name.replace(/\s+/g, '_')}`);
      addNotification('success', 'Report Exported', `${staff.name}'s report is ready.`);
    } catch {
      addNotification('error', 'Export Failed', 'Could not generate the report.');
    }
  };

  const isEmpty = filtered.length === 0;

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by name or IPPIS..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/5 focus:bg-white focus:border-primary-200 transition-all font-black uppercase tracking-widest placeholder:font-medium placeholder:tracking-normal"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Dept filter — only for NC/DD/Admin who see all depts */}
          {(user?.role === UserRole.NC || user?.role === UserRole.DEPUTY_DIRECTOR || user?.role === UserRole.SUPER_ADMIN) && (
            <select
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 focus:outline-none focus:border-primary-300 uppercase tracking-widest"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          )}

          <div className="h-8 w-px bg-slate-100" />

          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
            <button
              onClick={() => setView('table')}
              className={cn('p-2 rounded-lg transition-all', view === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600')}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setView('grid')}
              className={cn('p-2 rounded-lg transition-all', view === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600')}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </Card>

      {isEmpty && (
        <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            {appraisals.length === 0
              ? 'No appraisals submitted yet — data will appear here once staff submit their appraisals.'
              : 'No staff match your current filters.'}
          </p>
        </div>
      )}

      {/* Table View */}
      {!isEmpty && view === 'table' && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Employee</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Department</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Q1</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Q2</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Q3</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Q4</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Annual / Grade</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(staff => (
                  <tr
                    key={staff.id}
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedStaff(staff)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs uppercase italic flex-shrink-0">
                          {staff.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 uppercase italic tracking-tight">{staff.name}</p>
                          <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic">{staff.designation} • {staff.ippis}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-slate-700 uppercase italic">{staff.dept}</p>
                    </td>
                    {['Q1','Q2','Q3','Q4'].map(q => (
                      <td key={q} className="px-6 py-4">
                        <span className="text-sm font-black text-slate-600 font-mono italic">
                          {staff.quarters[q] != null ? `${staff.quarters[q].toFixed(1)}` : '—'}
                        </span>
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full transition-all duration-700', GRADE_BAR[staff.grade] ?? 'bg-slate-300')}
                            style={{ width: `${staff.annual}%` }}
                          />
                        </div>
                        <Badge variant={(GRADE_BADGE[staff.grade] ?? 'default') as any} size="sm">
                          {staff.grade !== '—' ? staff.grade : '—'}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={staff.latestStatus === 'Counter-Signed' || staff.latestStatus === 'Approved' ? 'primary' : 'default'} size="sm">
                        {staff.latestStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100">
                        <ArrowUpRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Grid View */}
      {!isEmpty && view === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(staff => (
            <Card
              key={staff.id}
              onClick={() => setSelectedStaff(staff)}
              className="group cursor-pointer p-6 flex flex-col h-full justify-between"
            >
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-950 flex items-center justify-center text-white font-black text-lg italic uppercase">
                    {staff.name[0]}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 group-hover:text-primary-600 transition-colors uppercase italic tracking-tight text-sm">{staff.name}</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">{staff.designation}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest italic">{staff.dept}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                  <p className="text-[9px] text-slate-400 font-black uppercase mb-1 italic tracking-widest">Annual Score</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-slate-900 font-mono italic">{staff.annual > 0 ? `${staff.annual}%` : '—'}</span>
                    {staff.grade !== '—' && (
                      <Badge variant={(GRADE_BADGE[staff.grade] ?? 'default') as any} size="sm">{staff.grade}</Badge>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                  <p className="text-[9px] text-slate-400 font-black uppercase mb-1 italic tracking-widest">Status</p>
                  <Badge variant={staff.latestStatus === 'Counter-Signed' || staff.latestStatus === 'Approved' ? 'primary' : 'default'} size="sm">
                    {staff.latestStatus}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase italic tracking-widest">
                  <span className="text-slate-400">Performance Track</span>
                  <span className="text-slate-900 font-mono">{staff.annual > 0 ? `${staff.annual}%` : '—'}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-700', GRADE_BAR[staff.grade] ?? 'bg-slate-300')}
                    style={{ width: `${staff.annual}%` }}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedStaff && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedStaff(null)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] pointer-events-auto overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-primary-950 flex items-center justify-center text-white font-black text-xl italic shadow-lg flex-shrink-0">
                      {selectedStaff.name[0]}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-black text-slate-900 tracking-tight uppercase italic leading-none truncate">{selectedStaff.name}</h2>
                      <p className="text-[10px] text-primary-600 font-black uppercase tracking-widest mt-1 italic">{selectedStaff.designation}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedStaff(null)} className="p-2 bg-white rounded-xl border border-slate-100 text-slate-400 hover:text-primary-600 transition-all flex-shrink-0">
                    <XIcon size={18} />
                  </button>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-3 px-5 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Building2 size={14} className="text-primary-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest leading-none mb-0.5">Department</p>
                      <p className="text-xs font-black text-slate-900 uppercase italic truncate">{selectedStaff.dept}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <User size={14} className="text-primary-400 flex-shrink-0" />
                    <div>
                      <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest leading-none mb-0.5">IPPIS No.</p>
                      <p className="text-xs font-black text-slate-900 font-mono italic">{selectedStaff.ippis}</p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  <section className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Quarterly Performance</h3>
                      {selectedStaff.grade !== '—' && (
                        <Badge variant={(GRADE_BADGE[selectedStaff.grade] ?? 'default') as any} size="sm">Grade: {selectedStaff.grade}</Badge>
                      )}
                    </div>
                    <div className="space-y-2.5">
                      {['Q1','Q2','Q3','Q4'].map(q => {
                        const score = selectedStaff.quarters[q];
                        return (
                          <div key={q} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black text-slate-600 uppercase italic tracking-widest">{q}</span>
                              <span className="text-xs font-black text-slate-900 font-mono">{score != null ? `${score.toFixed(1)}%` : '—'}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              {score != null && (
                                <div
                                  className={cn('h-full rounded-full', GRADE_BAR[scoreToGrade(score)] ?? 'bg-slate-300')}
                                  style={{ width: `${score}%` }}
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section className="p-4 rounded-xl bg-primary-50 border border-primary-100">
                    <h3 className="text-[9px] font-black text-primary-500 uppercase tracking-widest italic mb-2">Annual Summary</h3>
                    <p className="text-xs text-primary-900 font-medium leading-relaxed italic">
                      {selectedStaff.annual > 0
                        ? `Annual average: ${selectedStaff.annual}% — Grade ${selectedStaff.grade}. Based on ${Object.keys(selectedStaff.quarters).length} submitted quarter(s).`
                        : 'No appraisals submitted yet for this staff member.'}
                    </p>
                  </section>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 grid grid-cols-2 gap-3 bg-slate-50/40">
                  <button
                    onClick={() => handleExportPDF(selectedStaff)}
                    className="py-2.5 bg-white border border-slate-200 rounded-xl font-black text-[10px] text-slate-700 hover:bg-slate-50 transition-all active:scale-95 uppercase tracking-widest"
                  >
                    Export PDF
                  </button>
                  <button className="py-2.5 bg-primary-950 text-white rounded-xl font-black text-[10px] hover:bg-primary-900 transition-all active:scale-95 uppercase tracking-widest italic">
                    Full Dossier
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
