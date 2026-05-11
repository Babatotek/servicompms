import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, CheckCircle2, XCircle, Clock, MessageSquare,
  Search, Activity, Award, ChevronRight, AlertTriangle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useAppraisals } from '../context/AppraisalContext';
import { AppraisalStatus } from '../types';
import { useNotifications } from '../context/NotificationContext';

export const TeamReview: React.FC = () => {
  const { user } = useAuth();
  const { getAppraisalsForSupervisor, updateAppraisalStatus } = useAppraisals();
  const { addNotification, notifyUser } = useNotifications();
  const [selectedAppraisal, setSelectedAppraisal] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [supervisorComment, setSupervisorComment] = useState('');
  const [supervisorRating, setSupervisorRating] = useState(0);
  // No fake timer — loading state will be driven by real API calls when backend is connected
  const loading = false;

  const allAppraisals = getAppraisalsForSupervisor(user?.id ?? '');
  const pendingAppraisals = allAppraisals.filter(a =>
    a.status === AppraisalStatus.SUBMITTED || a.status === AppraisalStatus.UNDER_REVIEW
  );
  const approvedAppraisals = allAppraisals.filter(a => a.status === AppraisalStatus.APPROVED);

  const filteredPending = pendingAppraisals.filter(a =>
    a.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.departmentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprove = (appraisalId: string) => {
    if (!supervisorComment.trim()) {
      addNotification('warning', 'Comment Required', 'Please enter a supervisor comment before approving.');
      return;
    }
    updateAppraisalStatus(appraisalId, AppraisalStatus.APPROVED, supervisorComment, supervisorRating);
    addNotification('success', 'Appraisal Approved', 'Appraisal approved and forwarded to the counter-signing officer.');
    // Notify the staff member their appraisal was approved
    notifyUser(
      selectedAppraisal.userId,
      'success',
      'Appraisal Approved',
      `Your appraisal has been approved by your supervisor. It has been forwarded for counter-signing.`
    );
    setSelectedAppraisal(null);
    setSupervisorComment('');
    setSupervisorRating(0);
  };

  const handleReturn = (appraisalId: string) => {
    if (!supervisorComment.trim()) {
      addNotification('warning', 'Comment Required', 'Please state the reason for returning this appraisal.');
      return;
    }
    updateAppraisalStatus(appraisalId, AppraisalStatus.RETURNED, supervisorComment);
    addNotification('info', 'Appraisal Returned', 'The appraisal has been returned to the staff member for revision.');
    // Notify the staff member their appraisal was returned
    notifyUser(
      selectedAppraisal.userId,
      'warning',
      'Appraisal Returned for Revision',
      `Your appraisal has been returned by your supervisor. Please review their comments and resubmit.`
    );
    setSelectedAppraisal(null);
    setSupervisorComment('');
  };

  return (
    <div className="space-y-4 pb-8">
      {/* ── Stat strip ── */}
      <div className="grid grid-cols-3 gap-3">
        {loading ? [1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />) : (
          <>
            {[
              { label: 'Submissions', value: `${allAppraisals.length} Staff`, icon: <Users size={20} />, color: 'bg-primary-50 text-primary-600', hover: 'hover:border-primary-100' },
              { label: 'Pending Review', value: `${pendingAppraisals.length} New`, icon: <Clock size={20} />, color: 'bg-amber-50 text-amber-600', hover: 'hover:border-amber-100', accent: pendingAppraisals.length > 0 ? 'text-amber-600' : 'text-slate-900' },
              { label: 'Approved', value: `${approvedAppraisals.length} Done`, icon: <CheckCircle2 size={20} />, color: 'bg-green-50 text-green-600', hover: 'hover:border-green-100', accent: 'text-green-600' },
            ].map((s, i) => (
              <div key={i} className={cn("bg-white border border-slate-100 rounded-2xl p-3 sm:p-4 flex items-center gap-3 transition-all", s.hover)}>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", s.color)}>
                  {s.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                  <p className={cn("text-base sm:text-xl font-black tracking-tighter uppercase italic leading-none truncate", s.accent ?? 'text-slate-900')}>{s.value}</p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── Main layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Queue sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Review Queue</p>
            <Badge variant="primary" size="sm">{pendingAppraisals.length} Pending</Badge>
          </div>

          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff..."
              className="w-full bg-white border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-[11px] font-black text-slate-900 placeholder:text-slate-400 focus:border-primary-200 focus:outline-none transition-all uppercase tracking-widest"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            {loading ? [1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />) :
             filteredPending.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center">
                <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest italic">
                  {allAppraisals.length === 0 ? 'No appraisals submitted yet.' : 'No pending reviews.'}
                </p>
              </div>
            ) : filteredPending.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ x: 4 }}
                onClick={() => { setSelectedAppraisal(item); setSupervisorComment(''); setSupervisorRating(0); }}
                className={cn(
                  "p-4 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden",
                  selectedAppraisal?.id === item.id
                    ? "bg-primary-950 border-primary-950 text-white shadow-lg"
                    : "bg-white border-slate-100 hover:border-primary-200 hover:shadow-sm"
                )}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="min-w-0 flex-1 pr-2">
                    <h4 className="font-black text-sm tracking-tight uppercase italic leading-none truncate">{item.userName}</h4>
                    <p className={cn("text-[9px] font-black uppercase tracking-widest mt-1 opacity-60 truncate", selectedAppraisal?.id === item.id ? "text-white" : "text-slate-500")}>
                      {item.departmentId} · {item.period}
                    </p>
                  </div>
                  <Badge variant={selectedAppraisal?.id === item.id ? 'primary' : 'default'} size="sm"
                    className={selectedAppraisal?.id === item.id ? 'bg-white/20 text-white border-transparent flex-shrink-0' : 'flex-shrink-0'}>
                    {item.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest opacity-50">
                    <Clock size={11} />
                    {new Date(item.submittedAt).toLocaleDateString()}
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-40 italic">Score</p>
                    <p className="text-xl font-black font-mono leading-none italic">{item.scores.grandTotal.toFixed(1)}%</p>
                  </div>
                </div>
                {selectedAppraisal?.id === item.id && (
                  <div className="absolute top-0 right-0 p-3 opacity-[0.05]">
                    <Award size={80} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {selectedAppraisal ? (
              <Card className="p-0 overflow-hidden flex flex-col rounded-2xl border-slate-100">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-950 flex items-center justify-center text-white font-black text-xl italic shadow-lg flex-shrink-0">
                      {selectedAppraisal.userName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-black text-slate-900 tracking-tight uppercase italic leading-none">{selectedAppraisal.userName}</h3>
                        <Badge variant="primary" size="sm">SUBMITTED</Badge>
                      </div>
                      <p className="text-[10px] text-primary-600 font-black uppercase tracking-widest mt-1 italic">{selectedAppraisal.period} Appraisal</p>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5 italic">
                        IPPIS: {selectedAppraisal.ippisNo} · {selectedAppraisal.designation}
                      </p>
                    </div>
                  </div>
                  {/* Score pills */}
                  <div className="flex gap-2 flex-shrink-0">
                    <div className="bg-white border border-slate-100 rounded-xl px-4 py-2 text-center shadow-sm">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Self Score</p>
                      <p className="text-xl font-black text-slate-900 font-mono tracking-tighter italic">{selectedAppraisal.scores.grandTotal.toFixed(1)}%</p>
                    </div>
                    <div className="bg-primary-950 rounded-xl px-4 py-2 text-center shadow-lg">
                      <p className="text-[8px] font-black text-primary-300 uppercase tracking-widest leading-none mb-1 opacity-70">Sec. 4</p>
                      <p className="text-xl font-black text-white font-mono tracking-tighter italic">{selectedAppraisal.scores.kpiTotal.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-380px)]">
                  {/* Comments + breakdown */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <section className="space-y-2">
                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">
                        <MessageSquare size={12} className="text-primary-400" /> Self-Appraisal Comments
                      </h4>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 min-h-[80px]">
                        <p className="text-xs text-slate-600 leading-relaxed italic">
                          {selectedAppraisal.comments?.appraiseeComments
                            ? `"${selectedAppraisal.comments.appraiseeComments}"`
                            : <span className="text-slate-400 not-italic">No comments provided by the appraisee.</span>
                          }
                        </p>
                      </div>
                    </section>

                    <section className="space-y-2">
                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">
                        <Activity size={12} className="text-indigo-500" /> Score Breakdown
                      </h4>
                      <div className="space-y-1.5">
                        {[
                          { label: 'Section 4 — Tasks (70%)', value: selectedAppraisal.scores.kpiTotal.toFixed(1) + '%', color: 'bg-indigo-50 border-indigo-100 text-indigo-700' },
                          { label: 'Section 5 — Competencies (20%)', value: selectedAppraisal.scores.competency.toFixed(1) + '%', color: 'bg-green-50 border-green-100 text-green-700' },
                          { label: 'Section 6 — Operations (10%)', value: selectedAppraisal.scores.opsScore.toFixed(1) + '%', color: 'bg-amber-50 border-amber-100 text-amber-700' },
                          { label: 'Grand Total', value: selectedAppraisal.scores.grandTotal.toFixed(1) + '%', color: 'bg-primary-950 border-primary-900 text-white' },
                        ].map((row) => (
                          <div key={row.label} className={cn("flex items-center justify-between px-3 py-2 rounded-xl border", row.color)}>
                            <span className="text-[9px] font-black uppercase tracking-widest">{row.label}</span>
                            <span className="text-sm font-black font-mono">{row.value}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  {/* Supervisor action card */}
                  <section className="p-4 rounded-2xl bg-primary-950 text-white space-y-4 relative overflow-hidden">
                    <h4 className="text-[9px] font-black text-primary-400 uppercase tracking-widest flex items-center gap-2 italic">
                      <Activity size={14} /> Supervisor Validation
                    </h4>

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-black text-primary-200 uppercase tracking-widest opacity-70">Recommendation Commentary *</p>
                        <textarea
                          placeholder="Enter mandatory professional feedback..."
                          value={supervisorComment}
                          onChange={(e) => setSupervisorComment(e.target.value)}
                          rows={3}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-medium text-white focus:bg-white/10 focus:outline-none transition-all placeholder:text-slate-600 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <p className="text-[9px] font-black text-primary-200 uppercase tracking-widest opacity-70">Supervisor Rating (1–5)</p>
                          <div className="flex gap-2">
                            {[1,2,3,4,5].map((num) => (
                              <button
                                key={num}
                                onClick={() => setSupervisorRating(num)}
                                className={cn(
                                  "w-10 h-10 rounded-xl border flex items-center justify-center font-black text-sm transition-all active:scale-90",
                                  supervisorRating === num
                                    ? "bg-primary-600 border-primary-500 text-white"
                                    : "bg-white/5 border-white/10 hover:bg-primary-600"
                                )}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[9px] font-black text-primary-200 uppercase tracking-widest opacity-70">Promotability Index</p>
                          <select className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-black text-white focus:outline-none appearance-none cursor-pointer uppercase tracking-widest">
                            <option>High Potential</option>
                            <option>Steady Performer</option>
                            <option>Needs Guidance</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary-600/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
                  </section>
                </div>

                {/* Footer actions */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <button
                    onClick={() => handleReturn(selectedAppraisal.id)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-red-600 rounded-xl font-black text-[10px] hover:bg-red-50 hover:border-red-200 transition-all uppercase tracking-widest"
                  >
                    <XCircle size={15} /> Return for Revision
                  </button>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-black text-[10px] hover:border-primary-950 hover:text-primary-950 transition-all uppercase tracking-widest">
                      <AlertTriangle size={15} className="text-amber-500" /> Flag for NC
                    </button>
                    <button
                      onClick={() => handleApprove(selectedAppraisal.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-950 text-white rounded-xl font-black text-[10px] hover:bg-primary-900 transition-all shadow-lg active:scale-95 uppercase tracking-widest group"
                    >
                      <CheckCircle2 size={15} className="text-green-400" />
                      Validate & Approve
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center p-10 text-center min-h-[400px] group">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 mb-4 shadow-sm relative group-hover:scale-105 transition-transform">
                  <Users size={32} />
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-black text-sm animate-bounce shadow-lg border-2 border-white">!</div>
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2 tracking-tight uppercase italic">Select a Review</h3>
                <p className="text-[10px] text-slate-400 max-w-xs font-black uppercase italic tracking-widest leading-relaxed opacity-70">
                  Choose a team member from the queue to review their appraisal.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
