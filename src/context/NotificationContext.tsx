import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X, Bell, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type: NotificationType, title: string, message: string) => void;
  markAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // toasts = notifications that haven't been dismissed from the toast tray yet
  const [toasts, setToasts] = useState<Notification[]>([]);

  const addNotification = useCallback((type: NotificationType, title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const n: Notification = { id, type, title, message, timestamp: new Date(), read: false };

    // Add to persistent notification list
    setNotifications(prev => [n, ...prev]);

    // Add to toast tray and auto-dismiss after 5s
    setToasts(prev => [n, ...prev]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setToasts(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setToasts([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, removeNotification, clearAll, unreadCount }}>
      {children}

      {/* Toast tray — bottom-right */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.slice(0, 4).map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 60, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.92, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 flex gap-3 overflow-hidden relative group pointer-events-auto"
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                n.type === 'success' ? "bg-green-50 text-green-600" :
                n.type === 'error'   ? "bg-red-50 text-red-600" :
                n.type === 'warning' ? "bg-amber-50 text-amber-600" :
                "bg-indigo-50 text-indigo-600"
              )}>
                {n.type === 'success' ? <CheckCircle2 size={20} /> :
                 n.type === 'error'   ? <AlertCircle size={20} /> :
                 n.type === 'warning' ? <AlertCircle size={20} /> :
                 <Info size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none">{n.title}</h4>
                <p className="text-[11px] text-slate-500 font-medium mt-1 line-clamp-2 leading-snug">{n.message}</p>
              </div>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== n.id))}
                className="p-1 hover:bg-slate-100 rounded-lg transition-all h-fit opacity-0 group-hover:opacity-100 shrink-0"
              >
                <X size={14} className="text-slate-400" />
              </button>
              {/* colour bar */}
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl",
                n.type === 'success' ? "bg-green-500" :
                n.type === 'error'   ? "bg-red-500" :
                n.type === 'warning' ? "bg-amber-500" :
                "bg-indigo-500"
              )} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

// ── Notification Bell + Dropdown (used in Layout header) ─────────────────────
export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, removeNotification, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const typeIcon = (type: NotificationType) => {
    const cls = type === 'success' ? 'text-green-500' : type === 'error' ? 'text-red-500' : type === 'warning' ? 'text-amber-500' : 'text-indigo-500';
    if (type === 'success') return <CheckCircle2 size={14} className={cls} />;
    if (type === 'error' || type === 'warning') return <AlertCircle size={14} className={cls} />;
    return <Info size={14} className={cls} />;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(o => !o); if (!open) notifications.forEach(n => !n.read && markAsRead(n.id)); }}
        className="w-12 h-12 rounded-[18px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary-950 hover:bg-white hover:border-primary-100 transition-all relative group shadow-sm"
      >
        <Bell size={20} className="group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-sm" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.15 } }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-slate-400" />
                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-primary-950 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </div>
              {notifications.length > 0 && (
                <button onClick={clearAll} className="flex items-center gap-1 text-[9px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors">
                  <Trash2 size={11} /> Clear all
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell size={28} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No notifications</p>
                </div>
              ) : notifications.map(n => (
                <div
                  key={n.id}
                  className={cn("flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group", !n.read && "bg-primary-50/30")}
                >
                  <div className="mt-0.5 shrink-0">{typeIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none">{n.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-snug line-clamp-2">{n.message}</p>
                    <p className="text-[9px] text-slate-300 font-black uppercase tracking-widest mt-1">
                      {n.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button
                    onClick={() => removeNotification(n.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded-lg transition-all shrink-0"
                  >
                    <X size={12} className="text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
