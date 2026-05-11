import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Building2, 
  ChevronRight,
  Printer,
  Share2,
  MoreVertical
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNotifications } from '../context/NotificationContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

const MOCK_REPORTS = [
  { id: 'R-001', name: 'ANNUAL PERFORMANCE REPORT 2025', type: 'Annual', department: 'Organization-wide', date: 'Dec 20, 2025', size: '2.4 MB', author: 'System Admin' },
  { id: 'R-002', name: 'Q4 2025 DEPARTMENT SUMMARY', type: 'Quarterly', department: 'Accounts', date: 'Jan 05, 2026', size: '1.1 MB', author: 'Jane Smith' },
  { id: 'R-003', name: 'STAF APPRAISAL ARCHIVE - OLWATOSIN', type: 'Individual', department: 'Accounts', date: 'Oct 12, 2025', size: '850 KB', author: 'Dr. Jane Smith' },
  { id: 'R-004', name: 'COMPETENCY GAP ANALYSIS Q3', type: 'Special', department: 'Admin', date: 'Sep 30, 2025', size: '3.2 MB', author: 'HR Department' },
  { id: 'R-005', name: 'KPI ATTAINMENT OVERVIEW', type: 'Annual', department: 'Operations', date: 'Jan 15, 2026', size: '4.5 MB', author: 'System Admin' },
  { id: 'R-006', name: 'PROBATION REVIEW SUMMARY', type: 'Special', department: 'HR', date: 'Feb 02, 2026', size: '920 KB', author: 'HR Admin' },
];

export const Reports: React.FC = () => {
  const { addNotification } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  // No fake timer — loading state will be driven by real API calls when backend is connected
  const loading = false;

  const handleDownload = async (report: any) => {
    addNotification('info', 'Generating Report', `Preparing ${report.name}...`);
    try {
      const { generateAppraisalPDF } = await import('../lib/exportUtils');
      generateAppraisalPDF({
        name: report.author,
        ippis: report.id,
        department: report.department,
        designation: report.type,
        score: 85,
        status: 'Archived',
        lastUpdated: report.date,
      }, report.name.replace(/\s+/g, '_'));
    } catch {
      addNotification('error', 'Export Failed', 'Could not generate the report.');
    }
  };

  const filteredReports = MOCK_REPORTS.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         report.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || report.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 sm:space-y-10 max-w-[1600px] mx-auto">
      {/* Filters & Search */}
      <section className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search reports by name, department, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl pl-14 pr-6 py-3 text-sm font-medium outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
           <div className="flex p-1 bg-slate-100/50 rounded-xl border border-slate-100 min-w-max">
              {['All', 'Annual', 'Quarterly', 'Individual', 'Special'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    filterType === type 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {type}
                </button>
              ))}
           </div>
           <button className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
              <Filter size={18} />
           </button>
           <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-2.5 rounded-xl font-bold text-[13px] transition-all">
              <Printer size={16} />
              <span className="hidden sm:inline">Print</span>
           </button>
           <button className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-black text-[13px] shadow-lg shadow-primary-600/10 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest leading-none">
              <FileText size={16} />
              <span className="hidden sm:inline">Generate</span>
           </button>
        </div>
      </section>

      {/* Reports Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {loading ? [1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i} className="h-[320px] flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex gap-2"><Skeleton className="w-8 h-8 rounded-lg" /><Skeleton className="w-8 h-8 rounded-lg" /></div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2"><Skeleton className="h-2 w-16" /><Skeleton className="h-6 w-full" /></div>
              <div className="grid grid-cols-2 gap-4"><Skeleton className="h-10 rounded-lg" /><Skeleton className="h-10 rounded-lg" /></div>
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
          </Card>
        )) : filteredReports.map((report, i) => (
          <Card 
            key={report.id}
            className="group p-6 transition-all duration-500 relative overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-start relative z-10 mb-6">
               <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform",
                  report.type === 'Annual' ? "bg-primary-600" :
                  report.type === 'Quarterly' ? "bg-amber-500" :
                  report.type === 'Individual' ? "bg-emerald-500" : "bg-purple-600"
               )}>
                  <FileText size={24} />
               </div>
               <div className="flex items-center gap-1.5">
                  <button className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-all">
                     <Share2 size={16} />
                  </button>
                  <button className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-all">
                     <MoreVertical size={16} />
                  </button>
               </div>
            </div>

            <div className="space-y-3 relative z-10">
               <div>
                  <div className="flex items-center gap-2 mb-2">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{report.id}</span>
                     <Badge variant={report.type === 'Annual' ? 'primary' : 'default'} size="sm">
                        {report.type}
                     </Badge>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tighter leading-tight group-hover:text-primary-600 transition-colors uppercase italic">
                     {report.name}
                  </h3>
               </div>

               <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-50">
                  <div className="space-y-1">
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Building2 size={10} />
                        Department
                     </p>
                     <p className="text-xs font-black text-slate-900">{report.department}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Calendar size={10} />
                        Date
                     </p>
                     <p className="text-xs font-black text-slate-900">{report.date}</p>
                  </div>
                  <div className="space-y-1 text-left">
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <User size={10} />
                        Author
                     </p>
                     <p className="text-xs font-black text-slate-900">{report.author}</p>
                  </div>
                  <div className="space-y-1 text-right">
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Size</p>
                     <p className="text-xs font-black text-slate-900">{report.size}</p>
                  </div>
               </div>
            </div>

            <button 
              onClick={() => handleDownload(report)}
              className="mt-6 w-full bg-slate-900 text-white py-3.5 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-primary-600 transition-all active:scale-[0.98] shadow-lg shadow-slate-900/5 group/btn"
            >
               <Download size={16} className="group-hover/btn:translate-y-[-2px] transition-transform" />
               Download Report
               <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>

             {/* Background Texture */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-50 transition-colors" />
           </Card>
         ))}
       </section>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="bg-slate-50 rounded-[40px] border border-slate-100 border-dashed p-10 sm:p-24 text-center space-y-4">
           <div className="w-20 h-20 bg-white rounded-3xl border border-slate-100 flex items-center justify-center text-slate-300 mx-auto">
              <FileText size={40} />
           </div>
           <div>
              <h3 className="text-xl font-black text-slate-900">No reports found</h3>
              <p className="text-slate-500 font-medium">Try adjusting your search query or filter type.</p>
           </div>
        </div>
      )}
    </div>
  );
};
