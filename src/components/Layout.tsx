import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCircle, 
  Users, 
  BarChart3, 
  Trophy, 
  Settings, 
  LogOut,
  FileText,
  Activity,
  ChevronRight,
  Menu,
  X,
  Search,
  Command,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { cn } from '../lib/utils';
import { NotificationBell } from '../context/NotificationContext';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  isActive?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, badge, isActive, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={cn(
      "flex items-center justify-between px-5 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden",
      isActive 
        ? "bg-primary-950 text-white shadow-heavy shadow-primary-950/20 translate-x-1" 
        : "text-slate-500 hover:bg-slate-50 hover:text-primary-950"
    )}
  >
    {isActive && (
       <div className="absolute left-0 top-0 w-1 h-full bg-primary-500" />
    )}
    <div className="flex items-center gap-3">
      <span className={cn(
        "transition-transform duration-300 group-hover:scale-110",
        isActive ? "text-primary-400" : "text-slate-400 group-hover:text-primary-600"
      )}>
        {icon}
      </span>
      <span className={cn("text-[11px] uppercase tracking-[0.2em] font-black italic", isActive ? "text-white" : "text-slate-500")}>{label}</span>
    </div>
    {badge !== undefined && badge > 0 && (
      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
        {badge}
      </span>
    )}
    <ChevronRight className={cn(
      "w-4 h-4 transition-opacity",
      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
    )} />
  </Link>
);

interface SidebarNavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isSupervisor = user && [
    UserRole.TEAM_LEAD, 
    UserRole.DEPT_HEAD, 
    UserRole.DEPUTY_DIRECTOR, 
    UserRole.NC
  ].includes(user.role);

  const isAdmin = user?.role === UserRole.SUPER_ADMIN;

  const appraiseeItems: SidebarNavItem[] = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/my-appraisal', icon: <UserCircle size={20} />, label: 'My Appraisal' },
    { to: '/my-contract', icon: <FileText size={20} />, label: 'Performance Contract' },
  ];

  const appraiserItems: SidebarNavItem[] = [];
  if (isSupervisor) {
    appraiserItems.push({ to: '/team', icon: <Users size={20} />, label: 'Team / Unit', badge: 3 });
    appraiserItems.push({ to: '/performance-overview', icon: <BarChart3 size={20} />, label: 'Performance' });
  }

  const systemItems: SidebarNavItem[] = [
    { to: '/analytics', icon: <Activity size={20} />, label: 'Analytics' },
    { to: '/reports', icon: <FileText size={20} />, label: 'Reports' },
    { to: '/leaderboard', icon: <Trophy size={20} />, label: 'Leaderboard' },
  ];
  
  if (isAdmin) {
    systemItems.push({ to: '/admin/settings', icon: <Settings size={20} />, label: 'Configuration' });
  }

  const allNavItems = [...appraiseeItems, ...appraiserItems, ...systemItems];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-[280px] bg-white border-r border-slate-100 sticky top-0 h-screen z-40">
        <div className="p-10">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform">
              <img src="/servicom_logo.png" alt="SERVICOM" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-black text-primary-950 tracking-tighter leading-none text-2xl italic uppercase">SERVICOM</h1>
              <p className="text-[10px] text-primary-500 font-black uppercase tracking-[0.3em] mt-1.5 italic opacity-60">ePMS Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-8 overflow-y-auto pb-4 scrollbar-hide">
          <div className="space-y-4">
            <p className="px-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Appraisal</p>
            <div className="space-y-1">
              {appraiseeItems.map((item) => (
                <NavItem 
                  key={item.to} 
                  {...item} 
                  isActive={location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))} 
                />
              ))}
            </div>
          </div>

          {appraiserItems.length > 0 && (
            <div className="space-y-4">
              <p className="px-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Management</p>
              <div className="space-y-1">
                {appraiserItems.map((item) => (
                  <NavItem 
                    key={item.to} 
                    {...item} 
                    isActive={location.pathname === item.to || location.pathname.startsWith(item.to)} 
                  />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <p className="px-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">System</p>
            <div className="space-y-1">
              {systemItems.map((item) => (
                <NavItem 
                  key={item.to} 
                  {...item} 
                  isActive={location.pathname === item.to || location.pathname.startsWith(item.to)} 
                />
              ))}
            </div>
          </div>
        </nav>

        <div className="p-6">
           <div className="bg-slate-50/80 rounded-[32px] p-2 space-y-1 border border-slate-100">
              <Link to="/help" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-white rounded-2xl transition-all font-bold text-xs">
                 <HelpCircle size={18} />
                 <span>Support Center</span>
              </Link>
              <button 
                onClick={signOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all font-bold text-xs"
              >
                <LogOut size={18} />
                Logout
              </button>
           </div>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-premium">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/servicom_logo.png" alt="SERVICOM" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-black text-primary-950 tracking-tighter uppercase italic leading-none block">SERVICOM</span>
              <span className="text-[8px] text-primary-500 font-black uppercase tracking-widest mt-0.5 opacity-60">Mobile Unit</span>
            </div>
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-2xl text-primary-950 hover:bg-slate-100 transition-all active:scale-90">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
         </button>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white pt-16 animate-in slide-in-from-top duration-300 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {allNavItems.map((item) => (
              <NavItem 
                key={item.to} 
                {...item} 
                isActive={location.pathname === item.to}
                onClick={() => setIsMobileMenuOpen(false)}
              />
            ))}
            <div className="pt-4 border-t border-slate-100 mt-4">
              <div className="flex items-center gap-3 px-4 py-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary-950 flex items-center justify-center text-white font-black text-lg italic">
                  {user?.firstname[0]}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 uppercase italic tracking-tight">{user?.firstname} {user?.surname}</p>
                  <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest opacity-60">{user?.role}</p>
                </div>
              </div>
              <button 
                onClick={signOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-colors font-bold text-sm"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full lg:max-w-[calc(100vw-280px)] pt-16 lg:pt-0 min-w-0">
        <header className="hidden lg:flex items-center justify-between px-6 py-4 bg-white/60 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-100/50">
          <div className="flex items-center gap-10 flex-1">
            <div className="relative w-full max-w-sm group">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
               <input 
                  type="text" 
                  placeholder="Global Directory Search..." 
                  className="w-full bg-slate-50 border border-transparent rounded-[24px] pl-14 pr-14 py-4 text-[13px] font-black italic uppercase tracking-widest text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-primary-100 focus:ring-4 focus:ring-primary-950/5 transition-all outline-none shadow-inner"
               />
               <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <Command size={10} className="text-slate-400" />
                  <span className="text-[9px] font-black text-slate-400">K</span>
               </div>
            </div>

            <div className="h-6 w-px bg-slate-200" />

            <div>
              <h2 className="text-2xl font-black text-primary-950 uppercase tracking-tighter italic leading-none">
                {allNavItems.find(item => item.to === location.pathname || (item.to !== '/' && location.pathname.startsWith(item.to)))?.label || 'Dashboard'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-8">
             <div className="flex items-center gap-3">
                <NotificationBell />
             </div>

             <div className="h-10 w-px bg-slate-100" />

             <div className="flex items-center gap-5 group cursor-pointer pl-4 py-1.5 pr-1.5 bg-slate-50/50 rounded-[24px] border border-slate-100/50 hover:bg-white hover:border-primary-100 transition-all shadow-sm">
                <div className="text-right hidden xl:block">
                   <p className="text-[13px] font-black text-slate-900 leading-none uppercase italic tracking-tight">{user?.firstname} {user?.surname}</p>
                   <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mt-1.5 italic opacity-60 leading-none">{user?.role}</p>
                </div>
                <div className="relative">
                   <div className="w-12 h-12 rounded-[18px] bg-primary-950 flex items-center justify-center text-white font-black text-xl italic shadow-heavy shadow-primary-950/20 group-hover:scale-105 transition-transform overflow-hidden border-2 border-white">
                      {user?.avatarUrl ? (
                         <img src={user.avatarUrl} alt={user.surname} className="w-full h-full object-cover" />
                      ) : (
                         <span>{user?.firstname[0]}</span>
                      )}
                   </div>
                   <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full shadow-premium" />
                </div>
             </div>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
