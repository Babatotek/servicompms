import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, ChevronDown, ChevronRight, Save, Layout, Target, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useOrg } from '../../context/OrgContext';
import { useNotifications } from '../../context/NotificationContext';
import { PerformanceTemplate, TemplateKRA, TemplateObjective, TemplateKPI } from '../../lib/performanceTemplates';

interface Props { onClose: () => void; existing?: PerformanceTemplate; }

type DraftKPI = Omit<TemplateKPI, 'id'> & { _id: string };
type DraftObj = Omit<TemplateObjective, 'id' | 'kpis'> & { _id: string; kpis: DraftKPI[] };
type DraftKRA = Omit<TemplateKRA, 'id' | 'objectives'> & { _id: string; objectives: DraftObj[]; expanded: boolean };

const uid = () => `_${Math.random().toString(36).slice(2, 9)}`;

const blankKPI = (): DraftKPI => ({
  _id: uid(), description: '', targetValue: 100, unit: '%', direction: 'higher',
  criteria: { O: 100, E: 90, VG: 80, G: 70, F: 60, P: 50 },
});
const blankObj = (): DraftObj => ({ _id: uid(), description: '', weight: 50, gradedWeight: 2.0, kpis: [blankKPI()] });
const blankKRA = (serialNo: number): DraftKRA => ({ _id: uid(), serialNo, name: '', weight: 50, objectives: [blankObj()], expanded: true });

export const TemplateBuilder: React.FC<Props> = ({ onClose, existing }) => {
  const { addTemplate, updateTemplate, departments } = useOrg();
  const { addNotification } = useNotifications();

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [departmentId, setDepartmentId] = useState(existing?.departmentId ?? '');
  const [kras, setKras] = useState<DraftKRA[]>(() => {
    if (existing?.kras.length) {
      return existing.kras.map(k => ({
        ...k, _id: uid(), expanded: false,
        objectives: k.objectives.map(o => ({ ...o, _id: uid(), kpis: o.kpis.map(p => ({ ...p, _id: uid() })) }))
      }));
    }
    return [blankKRA(1)];
  });
  const [errors, setErrors] = useState<string[]>([]);

  // ── KRA helpers ──────────────────────────────────────────────────────────
  const addKRA = () => setKras(p => [...p, blankKRA(p.length + 1)]);
  const removeKRA = (id: string) => setKras(p => p.filter(k => k._id !== id).map((k, i) => ({ ...k, serialNo: i + 1 })));
  const toggleKRA = (id: string) => setKras(p => p.map(k => k._id === id ? { ...k, expanded: !k.expanded } : k));
  const updateKRA = (id: string, patch: Partial<DraftKRA>) => setKras(p => p.map(k => k._id === id ? { ...k, ...patch } : k));

  // ── Objective helpers ────────────────────────────────────────────────────
  const addObj = (kraId: string) => setKras(p => p.map(k => k._id === kraId ? { ...k, objectives: [...k.objectives, blankObj()] } : k));
  const removeObj = (kraId: string, objId: string) => setKras(p => p.map(k => k._id === kraId ? { ...k, objectives: k.objectives.filter(o => o._id !== objId) } : k));
  const updateObj = (kraId: string, objId: string, patch: Partial<DraftObj>) =>
    setKras(p => p.map(k => k._id === kraId ? { ...k, objectives: k.objectives.map(o => o._id === objId ? { ...o, ...patch } : o) } : k));

  // ── KPI helpers ──────────────────────────────────────────────────────────
  const addKPI = (kraId: string, objId: string) =>
    setKras(p => p.map(k => k._id === kraId ? { ...k, objectives: k.objectives.map(o => o._id === objId ? { ...o, kpis: [...o.kpis, blankKPI()] } : o) } : k));
  const removeKPI = (kraId: string, objId: string, kpiId: string) =>
    setKras(p => p.map(k => k._id === kraId ? { ...k, objectives: k.objectives.map(o => o._id === objId ? { ...o, kpis: o.kpis.filter(p => p._id !== kpiId) } : o) } : k));
  const updateKPI = (kraId: string, objId: string, kpiId: string, patch: Partial<DraftKPI>) =>
    setKras(p => p.map(k => k._id === kraId ? { ...k, objectives: k.objectives.map(o => o._id === objId ? { ...o, kpis: o.kpis.map(p => p._id === kpiId ? { ...p, ...patch } : p) } : o) } : k));
  const updateCriteria = (kraId: string, objId: string, kpiId: string, grade: string, val: string) =>
    updateKPI(kraId, objId, kpiId, { criteria: { ...kras.find(k => k._id === kraId)!.objectives.find(o => o._id === objId)!.kpis.find(p => p._id === kpiId)!.criteria, [grade]: parseFloat(val) || 0 } });

  // ── Validate & save ──────────────────────────────────────────────────────
  const handleSave = (isDuplicate = false) => {
    const errs: string[] = [];
    if (!name.trim()) errs.push('Template name is required.');
    if (!departmentId) errs.push('Please assign a department.');
    kras.forEach((k, ki) => {
      if (!k.name.trim()) errs.push(`KRA ${ki + 1}: name is required.`);
      k.objectives.forEach((o, oi) => {
        if (!o.description.trim()) errs.push(`KRA ${ki + 1} / Objective ${oi + 1}: description is required.`);
        o.kpis.forEach((p, pi) => {
          if (!p.description.trim()) errs.push(`KRA ${ki + 1} / Obj ${oi + 1} / KPI ${pi + 1}: description is required.`);
        });
      });
    });
    if (errs.length) { setErrors(errs); return; }

    const built: Omit<PerformanceTemplate, 'id'> = {
      name: name.trim(),
      description: description.trim(),
      departmentId,
      kras: kras.map(k => ({
        id: k._id,
        serialNo: k.serialNo,
        name: k.name,
        weight: k.weight,
        objectives: k.objectives.map(o => ({
          id: o._id,
          description: o.description,
          weight: o.weight,
          gradedWeight: o.gradedWeight,
          kpis: o.kpis.map(p => ({
            id: p._id,
            description: p.description,
            targetValue: p.targetValue,
            unit: p.unit,
            direction: p.direction,
            criteria: p.criteria,
          })),
        })),
      })),
    };

    if (existing && !isDuplicate) {
      updateTemplate(existing.id, built);
      addNotification('success', 'Template Updated', `${name} has been updated.`);
    } else {
      addTemplate(built);
      addNotification('success', 'Template Created', `${name} is now available as a new template.`);
    }
    onClose();
  };

  const totalWeight = kras.reduce((s, k) => s + (k.weight || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 backdrop-blur-sm overflow-y-auto py-6 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
        className="bg-white w-full max-w-3xl rounded-2xl shadow-heavy flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center"><Layout size={16} /></div>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase italic tracking-tight">{existing ? 'Edit Template' : 'New KRA Template'}</h2>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5 italic">Define KRAs → Objectives → KPIs</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><X size={16} className="text-slate-400" /></button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Template meta */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Template Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Legal Services Head"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-primary-400 transition-all uppercase italic" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Department *</label>
              <select value={departmentId} onChange={e => setDepartmentId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-primary-400 transition-all italic cursor-pointer">
                <option value="">Select dept...</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-3 space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Description</label>
              <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of this template's scope"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-primary-400 transition-all italic" />
            </div>
          </div>

          {/* Weight summary */}
          <div className={cn("flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-black italic",
            Math.abs(totalWeight - 100) < 0.01 ? "bg-green-50 border-green-200 text-green-700" : "bg-amber-50 border-amber-200 text-amber-700")}>
            <span className="uppercase tracking-widest">Total KRA Weight</span>
            <span className="font-mono text-base">{totalWeight}% {Math.abs(totalWeight - 100) < 0.01 ? '✓' : '(must equal 100%)'}</span>
          </div>

          {/* KRA list */}
          <div className="space-y-3">
            {kras.map((kra, ki) => (
              <div key={kra._id} className="border border-slate-200 rounded-xl overflow-hidden">
                {/* KRA header row */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <button onClick={() => toggleKRA(kra._id)} className="text-slate-400 hover:text-slate-700 transition-colors">
                    {kra.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  <div className="w-6 h-6 bg-primary-950 rounded-md flex items-center justify-center text-white font-mono text-[10px] font-black flex-shrink-0">{kra.serialNo}</div>
                  <input value={kra.name} onChange={e => updateKRA(kra._id, { name: e.target.value })} placeholder="KRA Name (e.g. Financial Management)"
                    className="flex-1 bg-transparent border-none text-sm font-black text-slate-900 outline-none uppercase italic tracking-tight placeholder:text-slate-300 placeholder:font-normal placeholder:normal-case" />
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Wt</span>
                    <input type="number" value={kra.weight} onChange={e => updateKRA(kra._id, { weight: parseFloat(e.target.value) || 0 })}
                      className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-black text-primary-600 font-mono text-center outline-none focus:border-primary-400" />
                    <span className="text-[9px] font-black text-slate-400 italic">%</span>
                  </div>
                  {kras.length > 1 && (
                    <button onClick={() => removeKRA(kra._id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  )}
                </div>

                {/* Objectives */}
                {kra.expanded && (
                  <div className="p-3 space-y-3">
                    {kra.objectives.map((obj, oi) => (
                      <div key={obj._id} className="border border-slate-100 rounded-xl overflow-hidden">
                        {/* Objective row */}
                        <div className="flex items-start gap-2 px-3 py-2.5 bg-slate-50/50">
                          <Activity size={13} className="text-primary-400 mt-1 flex-shrink-0" />
                          <textarea value={obj.description} onChange={e => updateObj(kra._id, obj._id, { description: e.target.value })}
                            placeholder="Full objective description (e.g. Prepare and manage SERVICOM's annual budget...)"
                            rows={2}
                            className="flex-1 bg-transparent border-none text-xs font-semibold text-slate-700 outline-none italic resize-none placeholder:text-slate-300 placeholder:font-normal placeholder:not-italic" />
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">GW</span>
                            <input type="number" value={obj.gradedWeight} step="0.5" onChange={e => updateObj(kra._id, obj._id, { gradedWeight: parseFloat(e.target.value) || 0 })}
                              className="w-20 bg-white border border-slate-200 rounded-lg px-1.5 py-1 text-[10px] font-black text-indigo-600 font-mono text-center outline-none focus:border-indigo-400" />
                          </div>
                          {kra.objectives.length > 1 && (
                            <button onClick={() => removeObj(kra._id, obj._id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"><Trash2 size={12} /></button>
                          )}
                        </div>

                        {/* KPIs */}
                        <div className="px-3 pb-3 space-y-2">
                          {obj.kpis.map((kpi, pi) => (
                            <div key={kpi._id} className="bg-white border border-slate-100 rounded-xl p-3 space-y-2">
                              <div className="flex items-start gap-2">
                                <Target size={11} className="text-indigo-400 mt-1 flex-shrink-0" />
                                <input value={kpi.description} onChange={e => updateKPI(kra._id, obj._id, kpi._id, { description: e.target.value })}
                                  placeholder="KPI description (e.g. Timely preparation and submission of annual budget)"
                                  className="flex-1 bg-transparent border-none text-xs font-semibold text-slate-900 outline-none italic placeholder:text-slate-300 placeholder:font-normal placeholder:not-italic" />
                                {obj.kpis.length > 1 && (
                                  <button onClick={() => removeKPI(kra._id, obj._id, kpi._id)} className="p-0.5 text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"><Trash2 size={11} /></button>
                                )}
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Target</label>
                                  <input type="number" value={kpi.targetValue} onChange={e => updateKPI(kra._id, obj._id, kpi._id, { targetValue: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-xs font-black text-slate-900 font-mono outline-none focus:border-primary-400" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Unit</label>
                                  <input value={kpi.unit} onChange={e => updateKPI(kra._id, obj._id, kpi._id, { unit: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-xs font-black text-slate-900 outline-none focus:border-primary-400 uppercase italic" />
                                </div>
                                <div className="sm:col-span-2 space-y-1">
                                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Direction</label>
                                  <select value={kpi.direction} onChange={e => updateKPI(kra._id, obj._id, kpi._id, { direction: e.target.value as 'higher' | 'lower' })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-xs font-black text-slate-900 outline-none focus:border-primary-400 italic cursor-pointer">
                                    <option value="higher">Higher is better (e.g. % completion)</option>
                                    <option value="lower">Lower is better (e.g. days, errors)</option>
                                  </select>
                                </div>
                              </div>
                              {/* Grade criteria */}
                              <div className="grid grid-cols-6 gap-1.5">
                                {(['O', 'E', 'VG', 'G', 'F', 'P'] as const).map(g => (
                                  <div key={g} className="space-y-0.5 text-center">
                                    <label className={cn("text-[8px] font-black uppercase tracking-widest italic block", g === 'O' ? 'text-green-600' : g === 'P' ? 'text-red-500' : 'text-slate-400')}>{g}</label>
                                    <input type="number" value={kpi.criteria[g]} onChange={e => updateCriteria(kra._id, obj._id, kpi._id, g, e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-100 rounded-lg px-1 py-1 text-[10px] font-black text-slate-900 font-mono text-center outline-none focus:border-primary-400" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                          <button onClick={() => addKPI(kra._id, obj._id)}
                            className="w-full py-1.5 border border-dashed border-indigo-200 rounded-xl text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all italic flex items-center justify-center gap-1.5">
                            <Plus size={11} />Add KPI
                          </button>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => addObj(kra._id)}
                      className="w-full py-2 border border-dashed border-primary-200 rounded-xl text-[9px] font-black text-primary-400 uppercase tracking-widest hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/30 transition-all italic flex items-center justify-center gap-1.5">
                      <Plus size={11} />Add Objective
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button onClick={addKRA}
              className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-primary-300 hover:text-primary-500 hover:bg-primary-50/20 transition-all italic flex items-center justify-center gap-2">
              <Plus size={14} />Add KRA
            </button>
          </div>

          {/* Validation errors */}
          {errors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1">
              {errors.map((e, i) => <p key={i} className="text-[9px] font-black text-red-600 uppercase tracking-widest italic">{e}</p>)}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all italic">Cancel</button>
          {existing && (
            <button onClick={() => handleSave(true)} className="flex-1 flex items-center justify-center gap-2 border border-primary-200 text-primary-700 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-50 transition-all italic">
              <Plus size={13} />Save as New
            </button>
          )}
          <button onClick={() => handleSave(false)} className="flex-1 flex items-center justify-center gap-2 bg-primary-950 text-white py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all italic">
            <Save size={13} />{existing ? 'Update Template' : 'Save Template'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
