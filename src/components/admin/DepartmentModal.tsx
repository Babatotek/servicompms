import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Building2, Save } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useOrg } from '../../context/OrgContext';
import { useNotifications } from '../../context/NotificationContext';

interface Props { onClose: () => void; }

const inputCls = (error?: string) => cn(
  'w-full bg-slate-50 border rounded-2xl px-4 py-3 text-[11px] font-black text-slate-900 uppercase tracking-widest outline-none transition-all placeholder:text-slate-300 placeholder:normal-case',
  error
    ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
    : 'border-slate-100 focus:border-primary-300 focus:ring-2 focus:ring-primary-950/5 focus:bg-white',
);

const labelCls = 'text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none';

export const DepartmentModal: React.FC<Props> = ({ onClose }) => {
  const { addDepartment } = useOrg();
  const { addNotification } = useNotifications();
  const [form, setForm]     = useState({ name: '', code: '', staffCount: 0 });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Department name is required';
    if (!form.code.trim()) e.code = 'Short code is required';
    if (form.code.length > 6) e.code = 'Max 6 characters';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    addDepartment({
      name:        form.name.trim().toUpperCase(),
      code:        form.code.trim().toUpperCase(),
      unitWeight:  0,
      staffCount:  form.staffCount,
      isActive:    true,
    } as any);
    addNotification('success', 'Department Created', `${form.name.toUpperCase()} has been added.`);
    onClose();
  };

  const Field = (
    label: string,
    key: keyof typeof form,
    placeholder: string,
    type = 'text',
  ) => (
    <div className="space-y-1.5">
      <label className={labelCls}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => {
          setForm(p => ({ ...p, [key]: type === 'number' ? parseInt(e.target.value) || 0 : e.target.value }));
          setErrors(p => ({ ...p, [key]: '' }));
        }}
        className={inputCls(errors[key])}
      />
      {errors[key] && (
        <p className="text-[9px] text-red-500 font-black uppercase tracking-widest">{errors[key]}</p>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="bg-white w-full max-w-md rounded-[28px] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-950 text-white rounded-xl flex items-center justify-center shadow-md">
                <Building2 size={16} />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase italic tracking-tight leading-none">
                  New Department
                </h2>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1 italic">
                  Initialize a new organizational unit
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <X size={15} className="text-slate-500" />
            </button>
          </div>

          {/* Body */}
          <div className="px-7 py-6 space-y-4">
            {Field('Department Name', 'name', 'e.g. LEGAL SERVICES')}
            <div className="grid grid-cols-2 gap-3">
              {Field('Short Code', 'code', 'e.g. LEGAL')}
              {Field('Initial Staff Count', 'staffCount', '0', 'number')}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-7 py-5 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 rounded-2xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-white hover:border-slate-300 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 flex items-center justify-center gap-2 bg-primary-950 text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary-950/20 active:scale-95 transition-all hover:bg-primary-900"
            >
              <Save size={13} />
              Create Department
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
