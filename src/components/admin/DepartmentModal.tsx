import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Building2, Save } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useOrg } from '../../context/OrgContext';
import { useNotifications } from '../../context/NotificationContext';

interface Props { onClose: () => void; }

export const DepartmentModal: React.FC<Props> = ({ onClose }) => {
  const { addDepartment } = useOrg();
  const { addNotification } = useNotifications();
  const [form, setForm] = useState({ name: '', code: '', head: '', staffCount: 0 });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Department name is required';
    if (!form.code.trim()) e.code = 'Code is required';
    if (form.code.length > 6) e.code = 'Code must be 6 characters or less';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    addDepartment({ name: form.name.trim().toUpperCase(), code: form.code.trim().toUpperCase(), head: form.head.trim() || 'Vacant', staffCount: form.staffCount });
    addNotification('success', 'Department Created', `${form.name.toUpperCase()} has been added to the organization.`);
    onClose();
  };

  const field = (label: string, key: keyof typeof form, placeholder: string, type = 'text') => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => { setForm(p => ({ ...p, [key]: type === 'number' ? parseInt(e.target.value) || 0 : e.target.value })); setErrors(p => ({ ...p, [key]: '' })); }}
        className={cn("w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:bg-white transition-all uppercase italic",
          errors[key] ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-primary-400")}
      />
      {errors[key] && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">{errors[key]}</p>}
    </div>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-md rounded-2xl shadow-heavy p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center"><Building2 size={16} /></div>
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase italic tracking-tight">New Department</h2>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5 italic">Initialize a new organizational unit</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><X size={16} className="text-slate-400" /></button>
          </div>

          <div className="space-y-3">
            {field('Department Name', 'name', 'e.g. LEGAL SERVICES')}
            <div className="grid grid-cols-2 gap-3">
              {field('Short Code', 'code', 'e.g. LEGAL')}
              {field('Initial Staff Count', 'staffCount', '0', 'number')}
            </div>
            {field('Unit Head (optional)', 'head', 'e.g. JOHN DOE')}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all italic">Cancel</button>
            <button onClick={handleSubmit} className="flex-1 flex items-center justify-center gap-2 bg-primary-950 text-white py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all italic">
              <Save size={13} />Create Department
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
