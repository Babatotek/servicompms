import React, { useState, useMemo } from 'react';
import {
  Settings, Percent, BarChart3, Calendar, Award, Copy, Plus, Trash2, Save,
  CheckCircle2, ChevronRight, Database, Layout, Users, Search, Filter,
  Mail, Shield, Building2, Bell, Clock, Zap, Globe, Target
} from 'lucide-react';
import { cn } from '../lib/utils';
import { UserRole } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { useOrg } from '../context/OrgContext';
import { DepartmentModal } from '../components/admin/DepartmentModal';
import { TemplateBuilder } from '../components/admin/TemplateBuilder';
import { PerformanceTemplate } from '../lib/performanceTemplates';
import { 
  DEFAULT_GRADE_SCALE, 
  DEFAULT_COMPETENCIES,
  DEFAULT_OPERATIONS_ITEMS,
  SECTION_WEIGHTS, 
  APPRAISAL_PERIOD_DEFAULTS as DEFAULT_PERIODS 
} from '../constants';

const MOCK_USERS = [
  // NC
  { id: '1',  name: 'Oladimeji Funmilayo',  email: 'o.funmilayo@servicom.gov.ng',  role: UserRole.NC,          dept: 'National Coordinator', status: 'Active' },
  // PA
  { id: '2',  name: 'Ututah Emmanuel',       email: 'u.emmanuel@servicom.gov.ng',   role: UserRole.STAFF,       dept: 'Public Awareness',     status: 'Active' },
  // ACCOUNT
  { id: '3',  name: 'Odumu Godwin',          email: 'o.godwin@servicom.gov.ng',     role: UserRole.DEPT_HEAD,   dept: 'Accounts & Finance',   status: 'Active' },
  { id: '4',  name: 'Oladimeji Funmilayo',   email: 'ol.funmilayo@servicom.gov.ng', role: UserRole.STAFF,       dept: 'Accounts & Finance',   status: 'Active' },
  { id: '5',  name: 'Omego Hilary',          email: 'o.hilary@servicom.gov.ng',     role: UserRole.STAFF,       dept: 'Accounts & Finance',   status: 'Active' },
  // ADMIN
  { id: '6',  name: 'Nawabua Chinyere',      email: 'n.chinyere@servicom.gov.ng',   role: UserRole.DEPT_HEAD,   dept: 'Admin & HR',           status: 'Active' },
  { id: '7',  name: 'Abdullahi Isah',        email: 'a.isah@servicom.gov.ng',       role: UserRole.STAFF,       dept: 'Admin & HR',           status: 'Active' },
  { id: '8',  name: 'Amos Obinna',           email: 'a.obinna@servicom.gov.ng',     role: UserRole.STAFF,       dept: 'Admin & HR',           status: 'Active' },
  { id: '9',  name: 'Danabuyi Samson',       email: 'd.samson@servicom.gov.ng',     role: UserRole.STAFF,       dept: 'Admin & HR',           status: 'Active' },
  { id: '10', name: 'Kaura Isaiah',          email: 'k.isaiah@servicom.gov.ng',     role: UserRole.STAFF,       dept: 'Admin & HR',           status: 'Active' },
  { id: '11', name: 'Mohammed Musa',         email: 'm.musa@servicom.gov.ng',       role: UserRole.STAFF,       dept: 'Admin & HR',           status: 'Active' },
  { id: '12', name: 'Nwachukwu Thankgod',   email: 'n.thankgod@servicom.gov.ng',   role: UserRole.STAFF,       dept: 'Admin & HR',           status: 'Active' },
  { id: '13', name: 'Yunusa Gambo',          email: 'y.gambo@servicom.gov.ng',      role: UserRole.STAFF,       dept: 'Admin & HR',           status: 'Inactive' },
  // AUDIT
  { id: '14', name: 'Omakwu Peter',          email: 'o.peter@servicom.gov.ng',      role: UserRole.STAFF,       dept: 'Internal Audit',       status: 'Active' },
  // ICT
  { id: '15', name: 'ICT Head',              email: 'ict.head@servicom.gov.ng',     role: UserRole.DEPT_HEAD,   dept: 'ICT',                  status: 'Active' },
  // OPERATIONS
  { id: '16', name: 'Akinbodewa Ngozi',      email: 'a.ngozi@servicom.gov.ng',      role: UserRole.DEPUTY_DIRECTOR, dept: 'Operations',       status: 'Active' },
  { id: '17', name: 'Oleh Nneka',            email: 'o.nneka@servicom.gov.ng',      role: UserRole.TEAM_LEAD,   dept: 'Operations — Team A',  status: 'Active' },
  { id: '18', name: 'Shittu Oyelude',        email: 's.oyelude@servicom.gov.ng',    role: UserRole.STAFF,       dept: 'Operations — Team A',  status: 'Active' },
  { id: '19', name: 'Onche Ben',             email: 'o.ben@servicom.gov.ng',        role: UserRole.TEAM_LEAD,   dept: 'Operations — Team B',  status: 'Active' },
  { id: '20', name: 'Sesugh Duruba',         email: 's.duruba@servicom.gov.ng',     role: UserRole.STAFF,       dept: 'Operations — Team B',  status: 'Active' },
  { id: '21', name: 'Tubi-Tolulope',         email: 't.tolulope@servicom.gov.ng',   role: UserRole.STAFF,       dept: 'Operations — Team B',  status: 'Active' },
  { id: '22', name: 'Igwilo Esther',         email: 'i.esther@servicom.gov.ng',     role: UserRole.STAFF,       dept: 'Operations — Team C',  status: 'Active' },
  { id: '23', name: 'Obe Nat',               email: 'o.nat@servicom.gov.ng',        role: UserRole.STAFF,       dept: 'Operations — Team C',  status: 'Active' },
  { id: '24', name: 'Ochelebe Anthony',      email: 'o.anthony@servicom.gov.ng',    role: UserRole.STAFF,       dept: 'Operations — Team C',  status: 'Active' },
  { id: '25', name: 'Olaniyan Kikelomo',     email: 'o.kikelomo@servicom.gov.ng',   role: UserRole.STAFF,       dept: 'Operations — Team C',  status: 'Active' },
  { id: '26', name: 'Magaji Medinatu',       email: 'm.medinatu@servicom.gov.ng',   role: UserRole.STAFF,       dept: 'Operations — Team D',  status: 'Active' },
  { id: '27', name: 'Nasir Mohammed',        email: 'n.mohammed@servicom.gov.ng',   role: UserRole.STAFF,       dept: 'Operations — Team D',  status: 'Active' },
  { id: '28', name: 'Nnanna Rose',           email: 'n.rose@servicom.gov.ng',       role: UserRole.STAFF,       dept: 'Operations — Team D',  status: 'Active' },
  { id: '29', name: 'Zack-Ukoh Lucy',        email: 'z.lucy@servicom.gov.ng',       role: UserRole.STAFF,       dept: 'Operations — Team D',  status: 'Active' },
];




type Tab = 'users' | 'scoring' | 'periods' | 'competencies' | 'templates' | 'notifications' | 'mpms_library' | 'unit_weights';

const TAB_CONFIG: { id: Tab; icon: React.ReactNode; label: string }[] = [
  { id: 'users',         icon: <Users size={14} />,    label: 'Staff & Organization' },
  { id: 'scoring',       icon: <Percent size={14} />,  label: 'Scoring & Grades' },
  { id: 'periods',       icon: <Calendar size={14} />, label: 'Appraisal Periods' },
  { id: 'competencies',  icon: <Award size={14} />,    label: 'Competencies & Ops' },
  { id: 'templates',     icon: <Layout size={14} />,   label: 'KRA Template Library' },
  { id: 'notifications', icon: <Mail size={14} />,     label: 'Notifications' },
  { id: 'mpms_library',  icon: <Globe size={14} />,    label: 'MPMS KPI Library' },
  { id: 'unit_weights',  icon: <Target size={14} />,   label: 'Unit Weights' },
];

// Compact section header used across all tabs
const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; action?: React.ReactNode }> = ({ icon, title, subtitle, action }) => (
  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center">{icon}</div>
      <div>
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight italic leading-none">{title}</h3>
        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5 italic opacity-70">{subtitle}</p>
      </div>
    </div>
    {action}
  </div>
);

export const AdminSettings: React.FC = () => {
  const { departments, templates, deleteTemplate, mpmsKRAs, mpmsKPIs, mpmsCategories, mpmsObjectives } = useOrg();
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [userSubTab, setUserSubTab] = useState<'staff' | 'depts'>('staff');
  const [saved, setSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PerformanceTemplate | undefined>();

  // ── Controlled scoring weights (PRD Gap 3 fix) ───────────────────────────
  const [weights, setWeights] = useState({
    section4: SECTION_WEIGHTS.taskPerformance,
    section5: SECTION_WEIGHTS.competencies,
    section6: SECTION_WEIGHTS.operations,
  });
  const weightSum = weights.section4 + weights.section5 + weights.section6;
  const weightValid = weightSum === 100;

  // ── Controlled grade scale ────────────────────────────────────────────────
  const [gradeScale, setGradeScale] = useState(DEFAULT_GRADE_SCALE.map(g => ({ ...g })));

  const handleWeightChange = (key: 'section4' | 'section5' | 'section6', val: string) => {
    const num = Math.max(0, Math.min(100, parseInt(val) || 0));
    setWeights(prev => ({ ...prev, [key]: num }));
  };

  const handleGradeChange = (id: string, field: 'label' | 'threshold', val: string) => {
    setGradeScale(prev => prev.map(g =>
      g.id === id ? { ...g, [field]: field === 'threshold' ? parseInt(val) || 0 : val } : g
    ));
  };

  const handleSave = () => {
    if (!weightValid) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Use live departments from OrgContext for filtering
  const filteredDepts = departments.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = MOCK_USERS.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.dept.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-3 pb-16">
      {/* Modals */}
      {showDeptModal && <DepartmentModal onClose={() => setShowDeptModal(false)} />}
      {(showTemplateBuilder || editingTemplate) && (
        <TemplateBuilder
          existing={editingTemplate}
          onClose={() => { setShowTemplateBuilder(false); setEditingTemplate(undefined); }}
        />
      )}
      {/* Tab bar */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5 flex-1 min-w-max overflow-x-auto scrollbar-hide bg-white border border-slate-100 rounded-xl p-1.5 shadow-sm">
          {TAB_CONFIG.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg font-black transition-all whitespace-nowrap text-[10px] uppercase tracking-widest",
                activeTab === tab.id
                  ? "bg-primary-950 text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={handleSave}
          className="flex-shrink-0 flex items-center gap-1.5 bg-primary-950 text-white px-4 py-2.5 rounded-xl font-black text-[10px] hover:translate-y-[-1px] transition-all shadow-md active:scale-95 uppercase tracking-widest"
        >
          {saved ? <CheckCircle2 size={13} /> : <Save size={13} />}
          <span className="hidden sm:inline">{saved ? 'Saved' : 'Save Changes'}</span>
        </button>
      </div>

      {/* ── USERS TAB ── */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          {/* Sub-tab + toolbar */}
          <Card className="p-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center"><Building2 size={14} /></div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setUserSubTab('staff')} className={cn("text-sm font-black tracking-tight uppercase italic transition-all", userSubTab === 'staff' ? "text-slate-900" : "text-slate-300 hover:text-slate-500")}>Staff Directory</button>
                  <span className="text-slate-200 font-black">/</span>
                  <button onClick={() => setUserSubTab('depts')} className={cn("text-sm font-black tracking-tight uppercase italic transition-all", userSubTab === 'depts' ? "text-slate-900" : "text-slate-300 hover:text-slate-500")}>Departments</button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={14} />
                  <input type="text" placeholder={userSubTab === 'staff' ? "Search staff..." : "Search departments..."} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-52 bg-slate-50 border border-slate-100 rounded-lg pl-9 pr-3 py-2 text-[11px] font-black uppercase tracking-widest text-slate-900 focus:bg-white focus:border-primary-400 transition-all outline-none" />
                </div>
                <button className="p-2 bg-slate-50 border border-slate-100 rounded-lg hover:bg-white transition-all"><Filter size={14} className="text-slate-500" /></button>
                <button onClick={() => setShowDeptModal(true)} className="flex items-center gap-1.5 bg-primary-950 text-white px-4 py-2 rounded-lg font-black text-[10px] active:scale-95 transition-all shadow-md uppercase tracking-widest">
                  <Plus size={13} /><span>Add {userSubTab === 'staff' ? 'Staff' : 'Dept'}</span>
                </button>
              </div>
            </div>
          </Card>

          {/* Staff table */}
          {userSubTab === 'staff' && (
            <Card className="p-0 overflow-hidden">
              {loading ? (
                <div className="p-4 space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left min-w-[600px]">
                    <thead>
                      <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/50">
                        <th className="px-4 py-3">Staff Member</th>
                        <th className="px-4 py-3 hidden md:table-cell">Role</th>
                        <th className="px-4 py-3 min-w-[160px]">Department</th>
                        <th className="px-4 py-3 hidden sm:table-cell">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredUsers.map(user => (
                        <tr key={user.id} className="group hover:bg-slate-50/40 transition-all cursor-pointer">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary-950 flex items-center justify-center text-white font-mono font-black text-[9px] uppercase italic flex-shrink-0">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-black text-slate-900 uppercase italic tracking-tight leading-none">{user.name}</p>
                                <p className="text-[9px] font-black text-slate-400 lowercase tracking-tight mt-0.5 opacity-70 truncate max-w-[160px]">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <Badge variant="default" size="sm" className="bg-slate-50 border-slate-100 text-slate-600 font-black italic text-[9px]">
                              <Shield size={9} className="mr-1 opacity-60" />{user.role}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 min-w-[160px]">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{user.dept}</span>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <Badge variant={user.status === 'Active' ? 'primary' : 'default'} size="sm">
                              <div className={cn("w-1 h-1 rounded-full mr-1.5", user.status === 'Active' ? "bg-white" : "bg-red-400")} />{user.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                              <button className="p-2 bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-primary-600 hover:border-primary-100 transition-all"><Settings size={12} /></button>
                              <button className="p-2 bg-white border border-slate-100 rounded-lg text-red-300 hover:text-red-600 hover:border-red-100 transition-all"><Trash2 size={12} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* Departments grid */}
          {userSubTab === 'depts' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {loading ? [1,2,3,4,5].map(i => <Skeleton key={i} className="h-40 rounded-xl" />) : (
                <>
                  {filteredDepts.map(dept => (
                    <Card key={dept.id} className="p-4 space-y-3 group cursor-pointer hover:border-primary-200 transition-all hover:shadow-md">
                      <div className="flex justify-between items-start">
                        <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center text-primary-400 group-hover:text-primary-600 transition-all"><Building2 size={16} /></div>
                        <Badge variant="default" size="sm" className="bg-slate-100 text-slate-500 group-hover:bg-primary-950 group-hover:text-white transition-all uppercase tracking-widest italic font-black text-[9px]">{dept.code}</Badge>
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight italic leading-none">{dept.name}</h4>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 italic opacity-60">Corporate Unit</p>
                      </div>
                      <div className="space-y-1.5 pt-2 border-t border-slate-50">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Unit Weight</span>
                          <span className="text-[10px] font-black text-slate-900 uppercase italic tracking-tight">{dept.unitWeight}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Status</span>
                          <Badge variant={dept.isActive ? 'primary' : 'default'} size="sm">{dept.isActive ? 'Active' : 'Inactive'}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button className="flex-1 bg-white border border-slate-100 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-600 hover:border-primary-950 hover:text-primary-950 transition-all italic">Directory</button>
                        <button className="p-2 bg-primary-950 text-white rounded-lg hover:bg-primary-900 transition-all shadow-md"><Settings size={14} /></button>
                      </div>
                    </Card>
                  ))}
                  <button onClick={() => setShowDeptModal(true)}
                    className="p-4 rounded-xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-3 text-slate-300 hover:border-primary-200 hover:text-primary-400 hover:bg-primary-50/20 transition-all min-h-[160px] group">
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform"><Plus size={20} /></div>
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] italic">New Unit</span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* Bulk sync banner */}
          <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-primary-50/30 border-primary-100/50 border-dashed">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-primary-400 shadow-sm"><Database size={18} /></div>
              <div>
                <p className="text-sm font-black text-slate-900 uppercase italic tracking-tight">Bulk Directory Sync</p>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5 italic opacity-70">Synchronize staff database via Excel/CSV upload</p>
              </div>
            </div>
            <button className="bg-primary-950 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:translate-y-[-1px] transition-all active:scale-95 shadow-md italic flex-shrink-0">Upload Dataset</button>
          </Card>
        </div>
      )}

      {/* ── SCORING TAB ── */}
      {activeTab === 'scoring' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Section Weights — controlled with 100% validation */}
          <Card className="p-4 space-y-4">
            <SectionHeader icon={<Percent size={14} />} title="Composite Weights" subtitle="Distribution of final performance score" />
            <div className="space-y-4">
              {([
                { key: 'section4' as const, label: 'Section 4 — Task Performance', color: 'bg-primary-600' },
                { key: 'section5' as const, label: 'Section 5 — Competencies',     color: 'bg-indigo-500' },
                { key: 'section6' as const, label: 'Section 6 — Operations',       color: 'bg-violet-500' },
              ]).map(w => (
                <div key={w.key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest italic">{w.label}</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number" min={0} max={100}
                        value={weights[w.key]}
                        onChange={e => handleWeightChange(w.key, e.target.value)}
                        className="w-12 text-right font-mono text-sm font-black text-primary-600 italic bg-transparent border-none outline-none focus:ring-0 p-0"
                      />
                      <span className="text-xs font-black text-slate-400 italic">%</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all', w.color)} style={{ width: `${weights[w.key]}%` }} />
                  </div>
                </div>
              ))}
              <div className={cn(
                'flex items-center justify-between p-3 rounded-xl text-white mt-2',
                weightValid ? 'bg-primary-950' : 'bg-red-600'
              )}>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] italic opacity-60">
                  {weightValid ? 'Aggregate Sum ✓' : `Sum = ${weightSum}% — must equal 100%`}
                </span>
                <span className="text-xl font-black italic tracking-tighter">{weightSum}%</span>
              </div>
            </div>
          </Card>

          {/* Grade Scale — controlled */}
          <Card className="p-4 space-y-4">
            <SectionHeader icon={<BarChart3 size={14} />} title="Grade Definitions" subtitle="Labels and score thresholds" />
            <div className="space-y-1.5">
              {gradeScale.map(grade => (
                <div key={grade.key} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-50 bg-slate-50/30 group hover:border-primary-100 hover:bg-white transition-all">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black italic text-sm flex-shrink-0" style={{ backgroundColor: grade.color }}>{grade.key}</div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={grade.label}
                      onChange={e => handleGradeChange(grade.id, 'label', e.target.value)}
                      className="w-full bg-transparent border-none text-xs font-black text-slate-900 focus:ring-0 p-0 uppercase italic tracking-tight outline-none"
                    />
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic mt-0.5">Grade Label</p>
                  </div>
                  <div className="flex items-center gap-1 border-l border-slate-100 pl-3">
                    <input
                      type="number"
                      value={grade.threshold}
                      onChange={e => handleGradeChange(grade.id, 'threshold', e.target.value)}
                      className="w-10 bg-transparent border-none text-right font-mono text-sm font-black text-slate-900 focus:ring-0 p-0 italic outline-none"
                    />
                    <span className="text-xs font-black text-slate-400 italic">%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── PERIODS TAB ── */}
      {activeTab === 'periods' && (
        <Card className="p-4 space-y-4">
          <SectionHeader icon={<Calendar size={14} />} title="Appraisal Calendar" subtitle="Define active submission windows"
            action={<button className="flex items-center gap-1.5 bg-primary-950 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-md active:scale-95 italic transition-all"><Plus size={13} />Add Period</button>} />
          {loading ? <div className="grid grid-cols-2 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-36 rounded-xl" />)}</div> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {DEFAULT_PERIODS.map(period => (
                <div key={period.label} className="p-4 rounded-xl border border-slate-100 bg-slate-50/30 space-y-3 group hover:bg-white hover:border-primary-100 transition-all hover:shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-2xl font-black text-slate-900 italic tracking-tighter leading-none">{period.label}</h4>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic mt-1">{period.coverage}</p>
                    </div>
                    <Badge variant="primary" size="sm">Active</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Opens</p>
                      <input type="text" defaultValue={period.submissionOpens} className="w-full bg-white border border-slate-100 rounded-lg px-3 py-1.5 text-[10px] font-black text-slate-900 uppercase italic shadow-sm outline-none focus:border-primary-300" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Closes</p>
                      <input type="text" defaultValue={period.submissionCloses} className="w-full bg-white border border-slate-100 rounded-lg px-3 py-1.5 text-[10px] font-black text-slate-900 uppercase italic shadow-sm outline-none focus:border-primary-300" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button className="flex-1 py-1.5 rounded-lg border border-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:border-primary-950 hover:text-primary-950 transition-all bg-white italic">Deactivate</button>
                    <button className="p-1.5 bg-primary-950 text-white rounded-lg hover:bg-primary-900 transition-all shadow-sm"><Settings size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ── COMPETENCIES TAB ── */}
      {activeTab === 'competencies' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Competency clusters */}
          {/* Competency clusters */}
          <Card className="p-4 space-y-4">
            <SectionHeader icon={<Award size={14} />} title="Competency Clusters" subtitle="Generic, Functional, Ethics & Values"
              action={<button className="p-2 bg-slate-50 hover:bg-primary-950 hover:text-white rounded-lg text-slate-700 transition-all"><Plus size={14} /></button>} />
            {loading ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div> : (
              <div className="space-y-3">
                {DEFAULT_COMPETENCIES.map(c => (
                  <div key={c.cluster} className="p-3 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-primary-100 transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-slate-900 uppercase italic tracking-tight">{c.cluster}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Weight Sum</span>
                        <span className="text-sm font-black text-primary-600 font-mono italic">
                          {c.items.reduce((acc, item) => acc + item.target, 0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {c.items.map(item => (
                        <span key={item.name} className="text-[9px] font-black text-slate-600 bg-white border border-slate-100 px-2 py-1 rounded-lg uppercase italic tracking-tight">
                          {item.name} ({item.target})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 text-white">
                  <span className="text-[9px] font-black uppercase tracking-widest italic opacity-60">Total Allocation</span>
                  <span className="text-base font-black font-mono italic">20 pts</span>
                </div>
              </div>
            )}
          </Card>

          {/* Operations items */}
          <Card className="p-4 space-y-4">
            <SectionHeader icon={<Zap size={14} />} title="Operations & Processes" subtitle="Section 6 scoring items"
              action={<button className="p-2 bg-slate-50 hover:bg-primary-950 hover:text-white rounded-lg text-slate-700 transition-all"><Plus size={14} /></button>} />
            {loading ? <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div> : (
              <div className="space-y-2">
                {DEFAULT_OPERATIONS_ITEMS.map(item => (
                  <div key={item.name} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-100 bg-slate-50/30 group hover:bg-white hover:border-primary-100 transition-all">
                    <div className="flex-1">
                      <p className="text-xs font-black text-slate-900 uppercase italic tracking-tight">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(item.target / item.max) * 100}%` }} />
                        </div>
                        <span className="text-[9px] font-black text-slate-400 italic font-mono">{item.target}/{item.max}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="p-1.5 bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-primary-600 transition-all"><Settings size={11} /></button>
                      <button className="p-1.5 bg-white border border-slate-100 rounded-lg text-red-300 hover:text-red-600 transition-all"><Trash2 size={11} /></button>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 text-white mt-1">
                  <span className="text-[9px] font-black uppercase tracking-widest italic opacity-60">Max Total Points</span>
                  <span className="text-base font-black font-mono italic">10 pts</span>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── TEMPLATES TAB ── */}
      {activeTab === 'templates' && (
        <Card className="p-4 space-y-4">
          <SectionHeader icon={<Database size={14} />} title="KRA Template Library" subtitle="Manage department-level performance structures"
            action={<button onClick={() => setShowTemplateBuilder(true)} className="flex items-center gap-1.5 bg-primary-950 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-md active:scale-95 italic transition-all"><Plus size={13} />Create Template</button>} />
          {loading ? <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div> : (
            <div className="space-y-2">
              {templates.map(temp => (
                <div key={temp.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/30 group hover:border-primary-100 hover:bg-white transition-all hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary-600 group-hover:border-primary-100 transition-all shadow-sm flex-shrink-0">
                      <Layout size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase italic tracking-tight leading-none">{temp.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="default" size="sm" className="bg-slate-100 text-slate-500 font-black italic text-[9px]">
                          {departments.find(d => d.id === temp.departmentId)?.code ?? temp.departmentId}
                        </Badge>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic opacity-70">
                          {temp.kras.reduce((s, k) => s + k.objectives.reduce((os, o) => os + o.kpis.length, 0), 0)} KPI Items
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingTemplate(temp)} className="p-2 bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm"><Settings size={14} /></button>
                    <button onClick={() => deleteTemplate(temp.id)} className="p-2 bg-white border border-slate-100 rounded-lg text-slate-300 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"><Trash2 size={14} /></button>
                    <button onClick={() => setEditingTemplate(temp)} className="bg-primary-950 text-white px-4 py-2 rounded-lg font-black text-[10px] flex items-center gap-1.5 uppercase tracking-widest italic shadow-md active:scale-95 transition-all">
                      Manage<ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
              {templates.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">No templates yet. Create your first KRA template.</p>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* ── NOTIFICATIONS TAB ── */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Workflow triggers */}
          <Card className="p-4 space-y-4">
            <SectionHeader icon={<Bell size={14} />} title="Workflow Triggers" subtitle="Automated notification events" />
            {loading ? <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div> : (
              <div className="space-y-2">
                {[
                  { label: 'Appraisal Period Open', desc: 'Notify all staff when a new quarter opens', active: true },
                  { label: 'Appraisal Submission', desc: 'Notify supervisors when staff submits form', active: true },
                  { label: 'Approval / Denial', desc: 'Notify staff when appraisal status changes', active: true },
                  { label: 'Escalation Alert', desc: 'Notify counter-signers of delayed reviews', active: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50/30 border border-transparent hover:border-primary-100 hover:bg-white transition-all group">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-xs font-black text-slate-900 uppercase italic tracking-tight leading-none">{item.label}</p>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5 italic opacity-70 truncate">{item.desc}</p>
                    </div>
                    <button className={cn("w-10 h-5 rounded-full relative transition-all duration-300 shadow-sm flex-shrink-0", item.active ? "bg-primary-950" : "bg-slate-200")}>
                      <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm", item.active ? "right-0.5" : "left-0.5")} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Reminder intervals + email identity */}
          <Card className="p-4 space-y-4">
            <SectionHeader icon={<Clock size={14} />} title="Reminder Intervals" subtitle="Deadline alert schedule" />
            {loading ? <div className="space-y-3"><Skeleton className="h-16 w-full rounded-xl" /><Skeleton className="h-16 w-full rounded-xl" /></div> : (
              <div className="space-y-4">
                {[
                  { label: 'First Reminder', value: '7 DAYS BEFORE', pct: 40, color: 'bg-primary-600' },
                  { label: 'Second Reminder', value: '3 DAYS BEFORE', pct: 20, color: 'bg-amber-500' },
                  { label: 'Final Alert', value: '24 HOURS LEFT', pct: 10, color: 'bg-red-600' },
                ].map(r => (
                  <div key={r.label} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-700 uppercase italic tracking-widest">{r.label}</label>
                      <span className="text-[10px] font-black text-primary-600 italic font-mono">{r.value}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", r.color)} style={{ width: `${r.pct}%` }} />
                    </div>
                  </div>
                ))}

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] italic">E-Mail Identity</p>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic opacity-70">Sender Name</label>
                    <input type="text" defaultValue="SERVICOM Performance System"
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs font-black text-slate-900 focus:bg-white focus:border-primary-300 transition-all uppercase italic shadow-sm outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic opacity-70">Reply-to Address</label>
                    <input type="text" defaultValue="hr@servicom.gov.ng"
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs font-black text-slate-900 focus:bg-white focus:border-primary-300 transition-all lowercase italic shadow-sm outline-none" />
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
      {/* ── MPMS KPI LIBRARY TAB ── */}
      {activeTab === 'mpms_library' && (
        <div className="space-y-3">
          <Card className="p-4 space-y-4">
            <SectionHeader
              icon={<Globe size={14} />}
              title="MPMS KPI Library"
              subtitle="Institutional KPIs cascaded from OHCSF framework — master source for all department templates"
            />
            <div className="space-y-4">
              {mpmsCategories.map(cat => {
                const catKRAs = mpmsKRAs.filter(k => k.categoryId === cat.id);
                return (
                  <div key={cat.id} className="space-y-2">
                    <div className="flex items-center justify-between px-3 py-2 bg-primary-950 text-white rounded-xl">
                      <span className="text-[10px] font-black uppercase tracking-widest italic">{cat.name}</span>
                      <span className="text-[10px] font-black font-mono">{cat.weight}%</span>
                    </div>
                    {catKRAs.map(kra => {
                      const kraObjs = mpmsObjectives.filter(o => o.kraId === kra.id);
                      const kraKpis = mpmsKPIs.filter(k => kraObjs.some(o => o.id === k.objectiveId));
                      return (
                        <div key={kra.id} className="ml-3 border-l-2 border-slate-100 pl-3 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900 uppercase italic tracking-tight">{kra.name}</span>
                            <span className="text-[9px] font-black text-slate-400 font-mono">Weight: {kra.weight}</span>
                          </div>
                          {kraKpis.map(kpi => {
                            const dept = departments.find(d => d.id === kpi.leadUnitId);
                            return (
                              <div key={kpi.id} className="flex items-start justify-between gap-3 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                                <p className="text-[10px] font-medium text-slate-700 flex-1">{kpi.description}</p>
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                  <Badge variant="primary" size="sm">{dept?.code ?? kpi.leadUnitId}</Badge>
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Target: {kpi.annualTarget}</span>
                                </div>
                              </div>
                            );
                          })}
                          {kraKpis.length === 0 && (
                            <p className="text-[9px] text-slate-400 italic pl-2">No KPIs seeded yet for this KRA.</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ── UNIT WEIGHTS TAB ── */}
      {activeTab === 'unit_weights' && (
        <Card className="p-4 space-y-4">
          <SectionHeader
            icon={<Target size={14} />}
            title="Unit Weights"
            subtitle="MPMS institutional contribution weight per department (Sheet8) — total must equal 50"
          />
          <div className="space-y-2">
            {departments.map(dept => (
              <div key={dept.id} className="flex items-center gap-4 px-3 py-2.5 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-primary-100 transition-all">
                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 flex-shrink-0">
                  <span className="text-[9px] font-black uppercase">{dept.code.slice(0,3)}</span>
                </div>
                <span className="flex-1 text-xs font-black text-slate-900 uppercase italic tracking-tight">{dept.name}</span>
                <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(dept.unitWeight / 50) * 100}%` }} />
                </div>
                <span className="text-sm font-black text-primary-600 font-mono italic w-8 text-right">{dept.unitWeight}</span>
              </div>
            ))}
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary-950 text-white mt-2">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] italic opacity-60">Total Weight</span>
              <span className="text-xl font-black italic tracking-tighter">
                {departments.reduce((s, d) => s + d.unitWeight, 0)} / 50
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
