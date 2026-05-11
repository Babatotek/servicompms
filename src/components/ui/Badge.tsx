import React from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'outstanding' | 'excellent' | 'verygood' | 'good' | 'fair' | 'poor' | 'default' | 'primary';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  className,
  size = 'md'
}) => {
  const variants = {
    outstanding: "bg-green-50 text-outstanding border-green-100",
    excellent: "bg-blue-50 text-excellent border-blue-100",
    verygood: "bg-purple-50 text-verygood border-purple-100",
    good: "bg-amber-50 text-good border-amber-100",
    fair: "bg-orange-50 text-fair border-orange-100",
    poor: "bg-red-50 text-poor border-red-100",
    primary: "bg-primary-50 text-primary-600 border-primary-100",
    default: "bg-slate-50 text-slate-600 border-slate-100"
  };

  return (
    <span className={cn(
      "inline-flex items-center font-black uppercase tracking-widest border rounded-lg px-2 py-0.5",
      size === 'sm' ? "text-[8px]" : "text-[10px]",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};
