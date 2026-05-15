import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Save, Eye, EyeOff, ChevronDown, Check, Loader } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useOrg } from '../../context/OrgContext';
import { useNotifications } from '../../context/NotificationContext';
import { UserRole } from '../../types';
import { adminApi } from '../../lib/api';

// ── Shared input style ────────────────────────────────────────────────────────
const inputCls = (error?: string) => cn(
  'w-full bg-slate-50 border rounded-2xl px-4 py-3 text-[11px] font-black text-slate-900 uppercase tracking-widest outline-none transition-all',
  error
    ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
    : 'border-slate-100 focus:border-primary-300 focus:ring-2 focus:ring-primary-950/5 focus:bg-white',
);

const labelCls = 'text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none';

// ── Custom dropdown ───────────────────────────────────────────────────────────
interface DropdownOption { value: string; label: string; sub?: string }

const Dropdown: React.FC<{
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}> = ({ label, value, options, onChange, placeholder = '— Select —', error, required }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="space-y-1.5" ref={ref}>
      <label className={labelCls}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={cn(
            'w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-left transition-all',
            open
              ? 'bg-white border-primary-300 ring-2 ring-primary-950/5'
              : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200',
            error && 'border-red-300',
          )}
        >
          <span className={cn(
            'text-[11px] font-black uppercase tracking-widest truncate',
            selected ? 'text-slate-900' : 'text-slate-400',
          )}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            size={14}
            className={cn('text-slate-400 flex-shrink-0 ml-2 transition-transform duration-200', open && 'rotate-180')}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.12 }}
              className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Empty option */}
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false); }}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors',
                  !value ? 'bg-primary-950 text-white' : 'text-slate-400 hover:bg-slate-50',
                )}
              >
                <span className="text-[10px] font-black uppercase tracking-widest">{placeholder}</span>
                {!value && <Check size={12} />}
              </button>

              <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
                {options.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { onChange(opt.value); setOpen(false); }}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors group',
                      opt.value === value
                        ? 'bg-primary-950 text-white'
                        : 'hover:bg-slate-50 text-slate-900',
                    )}
                  >
                    <div className="min-w-0">
                      <p className={cn(
                        'text-[11px] font-black uppercase tracking-widest truncate',
                        opt.value === value ? 'text-white' : 'text-slate-900',
                      )}>
                        {opt.label}
                      </p>
                      {opt.sub && (
                        <p className={cn(
                          'text-[9px] font-black uppercase tracking-widest mt-0.5',
                          opt.value === value ? 'text-primary-300' : 'text-slate-400',
                        )}>
                          {opt.sub}
                        </p>
                      )}
                    </div>
                    {opt.value === value && <Check size={12} className="flex-shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && <p className="text-[9px] text-red-500 font-black uppercase tracking-widest">{error}</p>}
    </div>
  );
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface StaffFormData {
  firstname: string; surname: string; othername: string;
  email: string; ippis_no: string; phone: string;
  designation: string; department_id: string; role: string;
  supervisor_id: string; counter_signer_id: string; password: string;
}

interface ExistingUser {
  id: string | number;
  firstname: string; surname: string; othername?: string;
  email: string; ippis_no: string; phone?: string;
  designation: string; department_id: string; role: string;
  supervisor_id?: string | number | null;
  counter_signer_id?: string | number | null;
  is_active: boolean;
}

interface Props {
  onClose: () => void;
  existing?: ExistingUser;
  allUsers?: ExistingUser[];
}

const ROLES: DropdownOption[] = [
  { value: UserRole.STAFF,            label: UserRole.STAFF },
  { value: UserRole.TEAM_LEAD,        label: UserRole.TEAM_LEAD },
  { value: UserRole.DEPT_HEAD,        label: UserRole.DEPT_HEAD },
  { value: UserRole.DEPUTY_DIRECTOR,  label: UserRole.DEPUTY_DIRECTOR },
  { value: UserRole.NC,               label: UserRole.NC },
  { value: UserRole.SUPER_ADMIN,      label: UserRole.SUPER_ADMIN },
];

const EMPTY: StaffFormData = {
  firstname: '', surname: '', othername: '', email: '',
  ippis_no: '', phone: '', designation: '',
  department_id: '', role: UserRole.STAFF,
  supervisor_id: '', counter_signer_id: '', password: '',
};

// ── Component ─────────────────────────────────────────────────────────────────
export const StaffModal: React.FC<Props> = ({ onClose, existing, allUsers = [] }) => {
  const { departments } = useOrg();
  const { addNotification } = useNotifications();

  const [form, setForm]     = useState<StaffFormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<StaffFormData>>({});
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const isEdit = !!existing;

  useEffect(() => {
    if (existing) {
      setForm({
        firstname:         existing.firstname,
        surname:           existing.surname,
        othername:         existing.othername ?? '',
        email:             existing.email,
        ippis_no:          existing.ippis_no,
        phone:             existing.phone ?? '',
        designation:       existing.designation,
        department_id:     existing.department_id,
        role:              existing.role,
        supervisor_id:     existing.supervisor_id ? String(existing.supervisor_id) : '',
        counter_signer_id: existing.counter_signer_id ? String(existing.counter_signer_id) : '',
        password:          '',
      });
    }
  }, [existing]);

  const set = (key: keyof StaffFormData, val: string) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  const validate = (): boolean => {
    const e: Partial<StaffFormData> = {};
    if (!form.firstname.trim())   e.firstname    = 'Required';
    if (!form.surname.trim())     e.surname      = 'Required';
    if (!form.email.trim())       e.email        = 'Required';
    if (!form.ippis_no.trim())    e.ippis_no     = 'Required';
    if (!form.designation.trim()) e.designation  = 'Required';
    if (!form.department_id)      e.department_id = 'Required';
    if (!form.role)               e.role         = 'Required';
    if (!isEdit && !form.password.trim()) e.password = 'Required for new staff';
    if (form.password && form.password.length < 8) e.password = 'Min 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        firstname:         form.firstname.trim().toUpperCase(),
        surname:           form.surname.trim().toUpperCase(),
        othername:         form.othername.trim().toUpperCase() || undefined,
        email:             form.email.trim().toLowerCase(),
        ippis_no:          form.ippis_no.trim(),
        phone:             form.phone.trim() || undefined,
        designation:       form.designation.trim().toUpperCase(),
        department_id:     form.department_id,
        role:              form.role,
        supervisor_id:     form.supervisor_id || undefined,
        counter_signer_id: form.counter_signer_id || undefined,
      };
      if (form.password) payload.password = form.password;

      if (isEdit) {
        await adminApi.updateUser(Number(existing!.id), payload);
        addNotification('success', 'Staff Updated', `${payload.surname} ${payload.firstname} has been updated.`);
      } else {
        await adminApi.createUser(payload);
        addNotification('success', 'Staff Created', `${payload.surname} ${payload.firstname} has been added.`);
      }
      onClose();
    } catch (err: any) {
      addNotification('error', 'Save Failed', err.message ?? 'Could not save staff record.');
    } finally {
      setSaving(false);
    }
  };

  // Memoize options — prevents Dropdown from seeing new array references on every render
  const deptOptions: DropdownOption[] = useMemo(() =>
    departments.map(d => ({ value: d.id, label: d.name, sub: d.code })),
  [departments]);

  const userOptions: DropdownOption[] = useMemo(() =>
    allUsers
      .filter(u => String(u.id) !== String(existing?.id ?? ''))
      .map(u => ({ value: String(u.id), label: `${u.surname} ${u.firstname}`, sub: u.role })),
  [allUsers, existing?.id]);

  // Inline text field
  const Field = ({
    label, field, type = 'text', placeholder, required = false,
  }: {
    label: string; field: keyof StaffFormData;
    type?: string; placeholder?: string; required?: boolean;
  }) => (
    <div className="space-y-1.5">
      <label className={labelCls}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={form[field]}
        onChange={e => set(field, e.target.value)}
        placeholder={placeholder}
        className={inputCls(errors[field])}
      />
      {errors[field] && (
        <p className="text-[9px] text-red-500 font-black uppercase tracking-widest">{errors[field]}</p>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="bg-white w-full max-w-2xl rounded-[28px] shadow-2xl my-4 overflow-hidden"
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-950 text-white rounded-xl flex items-center justify-center shadow-md">
                <User size={16} />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase italic tracking-tight leading-none">
                  {isEdit ? 'Edit Staff Member' : 'Add New Staff'}
                </h2>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1 italic">
                  {isEdit
                    ? `Editing: ${existing!.surname} ${existing!.firstname}`
                    : 'Create a new staff account'}
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

          {/* ── Body ── */}
          <div className="px-7 py-6 space-y-6 max-h-[68vh] overflow-y-auto">

            {/* Full Name */}
            <section className="space-y-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                <span className="w-4 h-px bg-slate-200 inline-block" />Full Name
              </p>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Surname"    field="surname"   placeholder="ISAH"      required />
                <Field label="First Name" field="firstname" placeholder="ABDULLAHI" required />
                <Field label="Other Name" field="othername" placeholder="Optional" />
              </div>
            </section>

            {/* Identity & Contact */}
            <section className="space-y-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                <span className="w-4 h-px bg-slate-200 inline-block" />Identity & Contact
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="IPPIS Number"  field="ippis_no"    placeholder="40001"                required />
                <Field label="Phone"         field="phone"       placeholder="08012345678" />
                <Field label="Email Address" field="email"       placeholder="name@servicom.gov.ng" type="email" required />
                <Field label="Designation"   field="designation" placeholder="OFFICER I"            required />
              </div>
            </section>

            {/* Organisation */}
            <section className="space-y-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                <span className="w-4 h-px bg-slate-200 inline-block" />Organisation
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Dropdown
                  label="Department" required
                  value={form.department_id}
                  options={deptOptions}
                  onChange={v => set('department_id', v)}
                  placeholder="— Select Department —"
                  error={errors.department_id}
                />
                <Dropdown
                  label="Role" required
                  value={form.role}
                  options={ROLES}
                  onChange={v => set('role', v)}
                  placeholder="— Select Role —"
                  error={errors.role}
                />
                <Dropdown
                  label="Direct Supervisor"
                  value={form.supervisor_id}
                  options={userOptions}
                  onChange={v => set('supervisor_id', v)}
                  placeholder="— None —"
                />
                <Dropdown
                  label="Counter-Signing Officer"
                  value={form.counter_signer_id}
                  options={userOptions}
                  onChange={v => set('counter_signer_id', v)}
                  placeholder="— None —"
                />
              </div>
            </section>

            {/* Login Credentials */}
            <section className="space-y-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                <span className="w-4 h-px bg-slate-200 inline-block" />Login Credentials
                {isEdit && (
                  <span className="text-slate-300 normal-case font-medium text-[9px]">
                    — leave blank to keep current password
                  </span>
                )}
              </p>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder={isEdit ? 'New password (optional)' : 'Set initial password'}
                  className={cn(inputCls(errors.password), 'pr-12')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[9px] text-red-500 font-black uppercase tracking-widest">{errors.password}</p>
              )}
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                Login email is the email address above.
              </p>
            </section>
          </div>

          {/* ── Footer ── */}
          <div className="flex gap-3 px-7 py-5 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 rounded-2xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-white hover:border-slate-300 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-primary-950 text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary-950/20 active:scale-95 transition-all disabled:opacity-50 hover:bg-primary-900"
            >
              {saving
                ? <Loader className="w-4 h-4 animate-spin text-white" />
                : <Save size={13} />
              }
              {isEdit ? 'Save Changes' : 'Create Staff'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
