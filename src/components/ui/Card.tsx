import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  animate?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  hover = true,
  animate = true
}) => {
  const Component = animate ? motion.div : 'div';
  
  return (
    <Component
      initial={animate ? { opacity: 0, scale: 0.98 } : undefined}
      animate={animate ? { opacity: 1, scale: 1 } : undefined}
      className={cn(
        "bg-white p-6 rounded-3xl border border-slate-100 shadow-premium transition-all duration-300",
        hover && "hover:shadow-heavy hover:border-slate-200/50",
        className
      )}
    >
      {children}
    </Component>
  );
};

export const CardHeader: React.FC<{ title: string; subtitle?: string; icon?: React.ReactNode; className?: string }> = ({ 
  title, 
  subtitle, 
  icon,
  className
}) => (
  <div className={cn("flex justify-between items-start mb-6", className)}>
    <div>
      <h3 className="font-black text-slate-900 tracking-tighter text-sm uppercase italic leading-none">{title}</h3>
      {subtitle && <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 leading-none">{subtitle}</p>}
    </div>
    {icon && (
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
        {icon}
      </div>
    )}
  </div>
);
