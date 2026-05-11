import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'rect' }) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-slate-200/60",
        {
          "h-4 w-full rounded-md": variant === 'text',
          "rounded-2xl": variant === 'rect',
          "rounded-full": variant === 'circle',
        },
        className
      )}
    />
  );
};
