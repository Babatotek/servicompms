import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  User, Mail, Phone, Briefcase, MapPin, Fingerprint,
  Lock, Save, CheckCircle2, AlertCircle, Camera, X, Loader,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../lib/api';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';

const Field: React.FC<{
  label: string; icon: React.ReactNode; value: string;
  onChange?: (v: string) => void; readOnly?: boolean;
  type?: string; placeholder?: string;
}> = ({ label, icon, value, onChange, readOnly, type = 'text', placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
      {icon} {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      readOnly={readOnly}
      placeholder={placeholder}
      className={cn(
        'w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none',
        readOnly
          ? 'bg-slate-50 border-slate-100 text-slate-500 cursor-not-allowed'
          : 'bg-white border-slate-200 text-slate-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-950/5',
      )}
    />
  </div>
);

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();

  // Editable fields
  const [firstname,  setFirstname]  = useState(user?.firstname  ?? '');
  const [surname,    setSurname]    = useState(user?.surname    ?? '');
  const [othername,  setOthername]  = useState(user?.othername  ?? '');
  const [phone,      setPhone]      = useState(user?.phone      ?? '');
  const [avatarUrl,  setAvatarUrl]  = useState(user?.avatarUrl  ?? '');

  // Password change
  const [currentPw,  setCurrentPw]  = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');

  const [saving,     setSaving]     = useState(false);
  const [pwSaving,   setPwSaving]   = useState(false);
  const [toast,      setToast]      = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // Avatar — convert to base64 and store as data URL
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('error', 'Please upload an image file.'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const src = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height, 256);
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img,
          (img.width - size) / 2, (img.height - size) / 2, size, size,
          0, 0, size, size
        );
        setAvatarUrl(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await profileApi.update({ firstname, surname, othername, phone, avatar_url: avatarUrl || undefined });
      updateUser({
        firstname, surname, othername: othername || undefined,
        phone, avatarUrl: avatarUrl || undefined,
      });
      showToast('success', 'Profile updated successfully.');
    } catch (err: any) {
      showToast('error', err.message ?? 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPw !== confirmPw) { showToast('error', 'New passwords do not match.'); return; }
    if (newPw.length < 8)    { showToast('error', 'Password must be at least 8 characters.'); return; }
    setPwSaving(true);
    try {
      await profileApi.changePassword(currentPw, newPw, confirmPw);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      showToast('success', 'Password changed successfully.');
    } catch (err: any) {
      showToast('error', err.message ?? 'Failed to change password.');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className={cn(
            'flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-black',
            toast.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800',
          )}
        >
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </motion.div>
      )}

      {/* Avatar + identity */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-[28px] bg-primary-950 flex items-center justify-center text-white font-black text-3xl italic shadow-heavy overflow-hidden">
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                : <span>{firstname[0] ?? '?'}</span>
              }
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-primary-600 hover:border-primary-300 transition-all shadow-sm"
            >
              <Camera size={14} />
            </button>
            {avatarUrl && (
              <button
                onClick={() => setAvatarUrl('')}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white shadow-sm"
              >
                <X size={10} />
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* Identity (read-only) */}
          <div className="flex-1 space-y-1 text-center sm:text-left">
            <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">
              {surname} {firstname}
            </h2>
            <p className="text-sm font-black text-primary-600 uppercase tracking-widest">{user?.role}</p>
            <p className="text-xs text-slate-400 font-black uppercase tracking-widest">{user?.designation}</p>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2">
              <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                IPPIS: {user?.ippisNo}
              </span>
              <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {user?.departmentId?.replace('dept_', '').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Editable fields */}
      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-7 h-7 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center">
            <User size={14} />
          </div>
          <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-tight">Personal Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Surname"    icon={<User size={10} />}        value={surname}   onChange={setSurname}   placeholder="SURNAME" />
          <Field label="First Name" icon={<User size={10} />}        value={firstname} onChange={setFirstname} placeholder="FIRSTNAME" />
          <Field label="Other Name" icon={<User size={10} />}        value={othername} onChange={setOthername} placeholder="OTHERNAME (optional)" />
          <Field label="Phone"      icon={<Phone size={10} />}       value={phone}     onChange={setPhone}     placeholder="08000000000" />
          <Field label="Email"      icon={<Mail size={10} />}        value={user?.email ?? ''} readOnly />
          <Field label="IPPIS No."  icon={<Fingerprint size={10} />} value={user?.ippisNo ?? ''} readOnly />
          <Field label="Designation" icon={<Briefcase size={10} />}  value={user?.designation ?? ''} readOnly />
          <Field label="Department"  icon={<MapPin size={10} />}     value={user?.departmentId?.replace('dept_', '').toUpperCase() ?? ''} readOnly />
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="flex items-center gap-2 bg-primary-950 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-900 transition-all active:scale-95 disabled:opacity-50 shadow-md"
          >
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save size={13} />}
            Save Changes
          </button>
        </div>
      </Card>

      {/* Password change */}
      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-7 h-7 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
            <Lock size={14} />
          </div>
          <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-tight">Change Password</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Current Password" icon={<Lock size={10} />} type="password" value={currentPw} onChange={setCurrentPw} placeholder="••••••••" />
          <Field label="New Password"     icon={<Lock size={10} />} type="password" value={newPw}     onChange={setNewPw}     placeholder="Min 8 characters" />
          <Field label="Confirm Password" icon={<Lock size={10} />} type="password" value={confirmPw} onChange={setConfirmPw} placeholder="Repeat new password" />
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleChangePassword}
            disabled={pwSaving || !currentPw || !newPw || !confirmPw}
            className="flex items-center gap-2 bg-amber-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-700 transition-all active:scale-95 disabled:opacity-50 shadow-md"
          >
            {pwSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Lock size={13} />}
            Update Password
          </button>
        </div>
      </Card>

      {/* Read-only org info */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-7 h-7 bg-slate-50 text-slate-500 rounded-lg flex items-center justify-center">
            <Briefcase size={14} />
          </div>
          <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-tight">Organisational Details</h3>
          <span className="ml-auto text-[9px] font-black text-slate-400 uppercase tracking-widest">Read-only — managed by Admin</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Role"        icon={<User size={10} />}    value={user?.role ?? ''}        readOnly />
          <Field label="Designation" icon={<Briefcase size={10} />} value={user?.designation ?? ''} readOnly />
          <Field label="Department"  icon={<MapPin size={10} />}  value={user?.departmentId ?? ''} readOnly />
          <Field label="IPPIS No."   icon={<Fingerprint size={10} />} value={user?.ippisNo ?? ''}  readOnly />
        </div>
      </Card>
    </div>
  );
};
