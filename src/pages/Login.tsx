import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, Shield, Mail, Lock, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState('');

  // Prefetch Dashboard chunk to speed up transition after login
  const prefetchDashboard = () => {
    import('./Dashboard').catch(() => {});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message ?? 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden relative">
           <div className="relative z-10">

              {/* Logo + title — inside the card at the top */}
              <div className="text-center pt-8 pb-6 px-8 border-b border-slate-50">
                 <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <img src="/servicom_logo.png" alt="SERVICOM" className="w-full h-full object-contain drop-shadow-md" />
                 </div>
                 <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">SERVICOM PMS</h1>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5">Performance Management System</p>
              </div>

              <div className="p-8">
                 <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Organization Email</label>
                       <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                             type="email" 
                             required
                             value={email}
                             onChange={(e) => setEmail(e.target.value)}
                             onFocus={prefetchDashboard}
                             placeholder="name@servicom.gov.ng"
                             className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-sans"
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Password</label>
                       <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                             type="password" 
                             placeholder="••••••••"
                             value={password}
                             onChange={e => setPassword(e.target.value)}
                             required
                             className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-sans"
                          />
                       </div>
                    </div>

                    {error && (
                      <p className="text-xs font-black text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">{error}</p>
                    )}

                    <button 
                       type="submit"
                       disabled={isLoading}
                       onMouseEnter={prefetchDashboard}
                       className="w-full bg-primary-950 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary-900 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-primary-950/20"
                    >
                       {isLoading ? (
                          <Loader className="w-5 h-5 animate-spin text-white" />
                       ) : (
                          <>
                             <LogIn size={20} />
                             Sign In to Portal
                          </>
                       )}
                    </button>
                 </form>

                 <div className="mt-6 pt-6 border-t border-slate-50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                       <Shield size={16} />
                    </div>
                    <p className="text-xs text-slate-400 leading-tight">
                       By signing in, you agree to the SERVICOM data privacy policy and performance management guidelines.
                    </p>
                 </div>
              </div>
           </div>

           <div className="absolute -bottom-10 -right-10 p-4 opacity-5 rotate-12">
              <div className="w-40 h-40 bg-slate-900 rounded-full" />
           </div>
        </div>

        <p className="text-center mt-6 text-slate-400 text-xs font-medium">
           &copy; 2026 SERVICOM Nigeria. Internal Use Only.
        </p>
      </motion.div>
    </div>
  );
};
