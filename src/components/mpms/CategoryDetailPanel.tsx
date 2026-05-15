import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown, ChevronRight, Target, Building2 } from 'lucide-react';
import { MPMSCategory, MPMSKRA, MPMSObjective, MPMSKPI } from '../../types';
import { Department } from '../../types';
import { cn } from '../../lib/utils';

interface Props {
  category: MPMSCategory;
  kras: MPMSKRA[];
  objectives: MPMSObjective[];
  kpis: MPMSKPI[];
  departments: Department[];
  color: string;
  onClose: () => void;
}

const DEPT_MAP: Record<string, string> = {};

function deptName(id: string, departments: Department[]): string {
  const d = departments.find(d => d.id === id);
  return d ? d.code : id.replace('dept_', '').toUpperCase();
}

const KPIRow: React.FC<{ kpi: MPMSKPI; departments: Department[]; color: string }> = ({ kpi, departments, color }) => (
  <div className="flex items-start gap-3 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
    <div className="w-1 h-full min-h-[32px] rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: color }} />
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-slate-800 leading-snug">{kpi.description}</p>
      <div className="flex flex-wrap items-center gap-2 mt-1.5">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          Target: <span className="text-slate-900">{kpi.annualTarget} {kpi.unitOfMeasurement}</span>
        </span>
        <span className="text-slate-200">·</span>
        <span className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">
          <Building2 size={9} />
          Lead: <span
            className="text-white px-1.5 py-0.5 rounded-md text-[9px] font-black ml-0.5"
            style={{ backgroundColor: color }}
          >
            {deptName(kpi.leadUnitId, departments)}
          </span>
        </span>
        {kpi.supportUnitIds.length > 0 && (
          <span className="flex items-center gap-1 flex-wrap text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Support:
            {kpi.supportUnitIds.map(id => (
              <span key={id} className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md text-[9px] font-black">
                {deptName(id, departments)}
              </span>
            ))}
          </span>
        )}
      </div>
    </div>
  </div>
);

const ObjectiveRow: React.FC<{
  objective: MPMSObjective;
  kpis: MPMSKPI[];
  departments: Department[];
  color: string;
}> = ({ objective, kpis, departments, color }) => {
  const [open, setOpen] = useState(false);
  const objKPIs = kpis.filter(k => k.objectiveId === objective.id);

  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-start gap-3 p-3 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex-shrink-0 mt-0.5">
          {open
            ? <ChevronDown size={13} className="text-slate-400" />
            : <ChevronRight size={13} className="text-slate-300" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-slate-800 leading-snug">{objective.description}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Wt: <span className="text-slate-700">{objective.weight}</span>
            </span>
            <span className="text-slate-200">·</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {objKPIs.length} KPI{objKPIs.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2">
              {objKPIs.map(kpi => (
                <KPIRow key={kpi.id} kpi={kpi} departments={departments} color={color} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const KRASection: React.FC<{
  kra: MPMSKRA;
  objectives: MPMSObjective[];
  kpis: MPMSKPI[];
  departments: Department[];
  color: string;
  index: number;
}> = ({ kra, objectives, kpis, departments, color, index }) => {
  const [open, setOpen] = useState(index === 0);
  const kraObjs = objectives.filter(o => o.kraId === kra.id);
  const kraKPIs = kpis.filter(k => kraObjs.some(o => o.id === k.objectiveId));

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-[10px] font-black flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          {kra.serialNo}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-slate-900 uppercase tracking-tight leading-tight">{kra.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Weight: <span className="text-slate-700">{kra.weight}%</span>
            </span>
            <span className="text-slate-200">·</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {kraObjs.length} objectives · {kraKPIs.length} KPIs
            </span>
          </div>
        </div>
        <div className="flex-shrink-0">
          {open
            ? <ChevronDown size={15} className="text-slate-400" />
            : <ChevronRight size={15} className="text-slate-300" />
          }
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2 border-t border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pt-3 pb-1">Objectives & KPIs</p>
              {kraObjs.map(obj => (
                <ObjectiveRow
                  key={obj.id}
                  objective={obj}
                  kpis={kpis}
                  departments={departments}
                  color={color}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const CategoryDetailPanel: React.FC<Props> = ({
  category, kras, objectives, kpis, departments, color, onClose,
}) => {
  const catKRAs = kras.filter(k => k.categoryId === category.id);
  const totalKPIs = kpis.filter(k =>
    objectives.filter(o => catKRAs.some(kra => kra.id === o.kraId)).some(o => o.id === k.objectiveId)
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[85vh] bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-5 border-b border-slate-100" style={{ borderTopColor: color, borderTopWidth: 3 }}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ backgroundColor: color }}
          >
            <Target size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{category.weight}% Weight</p>
            <h2 className="text-base font-black text-slate-900 uppercase tracking-tight leading-tight">{category.name}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
              {catKRAs.length} KRAs · {totalKPIs} KPIs
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors flex-shrink-0"
          >
            <X size={14} className="text-slate-500" />
          </button>
        </div>

        {/* Scrollable KRA list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {catKRAs.map((kra, i) => (
            <KRASection
              key={kra.id}
              kra={kra}
              objectives={objectives}
              kpis={kpis}
              departments={departments}
              color={color}
              index={i}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
