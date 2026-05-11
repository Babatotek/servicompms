import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  LayoutGrid, 
  List, 
  ArrowUpRight,
  User,
  Building2,
  Calendar,
  MoreVertical,
  X as XIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { UserRole } from '../types';
import { generateAppraisalPDF } from '../lib/exportUtils';
import { useNotifications } from '../context/NotificationContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

const MOCK_STAFF = [
  { id: '1', name: 'Abdullahi Isah', ippis: '12345', designation: 'AO II', dept: 'Admin', team: 'Records', status: 'Submitted', q1: 72, q2: 78, annual: 75, grade: 'VG' },
  { id: '2', name: 'Oleh Nneka', ippis: '23456', designation: 'AO I', dept: 'Operations', team: 'Team A', status: 'Approved', q1: 85, q2: 88, annual: 86, grade: 'E' },
  { id: '3', name: 'Nawabua Chinyere', ippis: '34567', designation: 'Asst. Chief', dept: 'Admin', team: 'Head', status: 'Under Review', q1: 92, q2: 91, annual: 91, grade: 'E' },
  { id: '4', name: 'Akinbodewa Ngozi', ippis: '45678', designation: 'Deputy Director', dept: 'Operations', team: 'Head', status: 'Draft', q1: 78, q2: null, annual: 78, grade: 'G' },
  { id: '5', name: 'Oladimeji Funmilayo', ippis: '56789', designation: 'PEO I', dept: 'Account', team: 'Head', status: 'Approved', q1: 95, q2: 98, annual: 96, grade: 'O' },
  { id: '6', name: 'Sesugh Duruba', ippis: '67890', designation: 'AO II', dept: 'Operations', team: 'Team B', status: 'Submitted', q1: 65, q2: 70, annual: 67, grade: 'F' },
];

const GRADE_COLORS: Record<string, string> = {
  'O': 'bg-green-100 text-green-700 border-green-200',
  'E': 'bg-blue-100 text-blue-700 border-blue-200',
  'VG': 'bg-purple-100 text-purple-700 border-purple-200',
  'G': 'bg-amber-100 text-amber-700 border-amber-200',
  'F': 'bg-orange-100 text-orange-700 border-orange-200',
  'P': 'bg-red-100 text-red-700 border-red-200',
};

const GRADE_BAR_COLORS: Record<string, string> = {
  'O': 'bg-green-600',
  'E': 'bg-blue-600',
  'VG': 'bg-purple-600',
  'G': 'bg-amber-500',
  'F': 'bg-orange-500',
  'P': 'bg-red-600',
};

export const PerformanceOverview: React.FC = () => {
  const { addNotification } = useNotifications();
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleExportPDF = (staff: any) => {
    addNotification('info', 'Report Generation', `Generating performance report for ${staff.name}...`);
    
    try {
      generateAppraisalPDF({
        userName: staff.name,
        ippisNo: staff.ippis,
        department: staff.dept,
        designation: staff.designation,
        period: 'Annual 2026',
        kpiScore: staff.annual,
        competencyScore: 85,
        opsScore: 90,
        totalScore: staff.annual,
        grade: staff.grade
      }, `Performance_Report_${staff.name.replace(/\s+/g, '_')}`);
      
      addNotification('success', 'Report Exported', `${staff.name}'s report is ready.`);
    } catch (error) {
      addNotification('error', 'Export Failed', 'Could not generate the report.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Toolbar */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or IPPIS..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/5 focus:bg-white focus:border-primary-200 transition-all font-black uppercase tracking-widest placeholder:font-medium placeholder:tracking-normal"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter size={16} />
            Filters
            <ChevronDown size={14} />
          </button>
          
          <div className="h-8 w-px bg-slate-100" />
          
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
            <button 
              onClick={() => setView('table')}
              className={cn(
                "p-2 rounded-lg transition-all",
                view === 'table' ? "bg-white text-slate-900 shadow-premium" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setView('grid')}
              className={cn(
                "p-2 rounded-lg transition-all",
                view === 'grid' ? "bg-white text-slate-900 shadow-premium" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </Card>

      {/* Table View */}
      {view === 'table' ? (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Employee</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Dept / Team</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Q1</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Q2</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Performance Indicator</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? [1,2,3,4,5].map(i => (
                  <tr key={i}>
                    <td className="px-8 py-5"><div className="flex gap-3"><Skeleton className="w-8 h-8 rounded-full" /><div className="space-y-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-2 w-24" /></div></div></td>
                    <td className="px-8 py-5"><div className="space-y-1"><Skeleton className="h-4 w-24" /><Skeleton className="h-2 w-16" /></div></td>
                    <td className="px-8 py-5"><Skeleton className="h-4 w-8" /></td>
                    <td className="px-8 py-5"><Skeleton className="h-4 w-8" /></td>
                    <td className="px-8 py-5"><div className="flex gap-2 justify-center"><Skeleton className="w-8 h-6" /><Skeleton className="w-24 h-2" /></div></td>
                    <td className="px-8 py-5"><Skeleton className="w-20 h-6 rounded-full" /></td>
                    <td className="px-8 py-5 text-right"><Skeleton className="w-8 h-8 rounded-lg ml-auto" /></td>
                  </tr>
                )) : MOCK_STAFF.map((staff) => (
                  <tr 
                    key={staff.id} 
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedStaff(staff)}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs uppercase italic">
                          {staff.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 uppercase italic tracking-tight">{staff.name}</p>
                          <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic">{staff.designation} • {staff.ippis}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-black text-slate-700 uppercase italic">{staff.dept}</p>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest italic">{staff.team}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-black text-slate-600 font-mono italic">{staff.q1}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-black text-slate-600 font-mono italic">{staff.q2 || '—'}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-4">
                        <Badge variant={staff.grade === 'O' ? 'outstanding' : staff.grade === 'E' ? 'excellent' : 'default'} size="sm">
                          {staff.grade}
                        </Badge>
                        <div className="flex-1 max-w-[100px] h-1 w-full bg-slate-100 rounded-full overflow-hidden hidden sm:block p-0.5">
                          <div className={cn("h-full rounded-full transition-all duration-1000", staff.grade === 'O' ? 'bg-primary-600' : 'bg-slate-900')} style={{ width: `${staff.annual}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <Badge variant={staff.status === 'Approved' ? 'primary' : 'default'} size="sm">
                        {staff.status}
                      </Badge>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <button className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 shadow-none hover:shadow-premium">
                          <ArrowUpRight size={18} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {loading ? [1,2,3,4,5,6].map(i => (
            <Card key={i} className="h-[280px] flex flex-col justify-between">
              <div className="flex gap-4 items-center">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="space-y-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-2 w-24" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </Card>
          )) : MOCK_STAFF.map((staff) => (
            <Card 
              key={staff.id}
              onClick={() => setSelectedStaff(staff)}
              className="group cursor-pointer p-6 flex flex-col h-full justify-between"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-950 flex items-center justify-center text-white font-black text-lg italic uppercase">
                    {staff.name[0]}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 group-hover:text-primary-600 transition-colors uppercase italic tracking-tight">{staff.name}</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">{staff.designation}</p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                 <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-primary-100 transition-all">
                    <p className="text-[9px] text-slate-400 font-black uppercase mb-1.5 italic tracking-widest leading-none">Annual Score</p>
                    <div className="flex items-center gap-2">
                       <span className="text-2xl font-black text-slate-900 font-mono italic tracking-tighter leading-none">{staff.annual}</span>
                       <Badge variant={staff.grade === 'O' ? 'outstanding' : staff.grade === 'E' ? 'excellent' : 'default'} size="sm">
                          {staff.grade}
                       </Badge>
                    </div>
                 </div>
                 <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-primary-100 transition-all">
                    <p className="text-[9px] text-slate-400 font-black uppercase mb-1.5 italic tracking-widest leading-none">Status</p>
                    <Badge variant={staff.status === 'Approved' ? 'primary' : 'default'} size="sm">
                       {staff.status}
                    </Badge>
                 </div>
              </div>

              <div className="space-y-2.5">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase italic tracking-widest">
                    <span className="text-slate-400">Performance Track</span>
                    <span className="text-slate-900 font-mono">{staff.annual}%</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div className={cn("h-full rounded-full transition-all duration-1000", staff.grade === 'O' ? 'bg-primary-600' : 'bg-slate-900')} style={{ width: `${staff.annual}%` }} />
                 </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Centered Modal Detail */}
      <AnimatePresence>
        {selectedStaff && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStaff(null)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100]"
            />

            {/* Modal */}
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
                  <button
                    onClick={() => setSelectedStaff(null)}
                    className="p-2 bg-white rounded-xl border border-slate-100 text-slate-400 hover:text-primary-600 transition-all flex-shrink-0"
                  >
                    <XIcon size={18} />
                  </button>
                </div>

                {/* Meta row */}
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

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">

                  {/* Quarterly scores */}
                  <section className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Quarterly Performance</h3>
                      <Badge variant={selectedStaff.grade === 'O' ? 'outstanding' : selectedStaff.grade === 'E' ? 'excellent' : 'default'} size="sm">
                        Grade: {selectedStaff.grade}
                      </Badge>
                    </div>
                    <div className="space-y-2.5">
                      {['Q1', 'Q2', 'Q3', 'Q4'].map((q, idx) => {
                        const score = idx === 0 ? selectedStaff.q1 : idx === 1 ? selectedStaff.q2 : null;
                        return (
                          <div key={q} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black text-slate-600 uppercase italic tracking-widest">{q}</span>
                              <span className="text-xs font-black text-slate-900 font-mono">{score ? `${score}%` : '—'}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              {score ? (
                                <div
                                  className={cn("h-full rounded-full", idx === 0 ? "bg-slate-400" : "bg-primary-600")}
                                  style={{ width: `${score}%` }}
                                />
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Insight */}
                  <section className="p-4 rounded-xl bg-primary-50 border border-primary-100 relative overflow-hidden">
                    <h3 className="text-[9px] font-black text-primary-500 uppercase tracking-widest italic mb-2">Strategic Insight</h3>
                    <p className="text-xs text-primary-900 font-medium leading-relaxed italic">
                      Performance is maintaining an upward trend. The jump from {selectedStaff.q1} to {selectedStaff.q2 ?? '—'} shows significant improvement in task alignment and KPI execution.
                    </p>
                  </section>

                  {/* Audit trail */}
                  <section className="space-y-3">
                    <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Audit Trail</h3>
                    <div className="space-y-3">
                      {[
                        { icon: <CheckCircle2 size={14} />, color: 'bg-green-50 text-green-600 border-green-100', label: 'Appraisal Finalized', sub: 'Approved by Supervisor · 2 days ago' },
                        { icon: <Calendar size={14} />, color: 'bg-primary-50 text-primary-600 border-primary-100', label: 'Contract Activation', sub: 'Annual performance contract activated · Jan 2026' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border", item.color)}>
                            {item.icon}
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-slate-900 uppercase italic tracking-tight">{item.label}</p>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5 italic">{item.sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
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

const CheckCircle2 = ({ size, className = "" }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
    <path d="m9 12 2 2 4-4"></path>
  </svg>
);

const X = ({ size, className = "" }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
