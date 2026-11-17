import React from 'react';
import { ModuleStatus } from '@/types';

interface StatusBadgeProps {
  status: ModuleStatus;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
  className = '',
}) => {
  const config = {
    IMPLEMENTED: {
      badge: 'bg-emerald-500/10 text-tactical-green border-emerald-500/30',
      dot: 'bg-tactical-green shadow-[0_0_8px_#22C55E]',
      label: 'SYS_READY',
    },
    IN_DEVELOPMENT: {
      badge: 'bg-amber-500/10 text-tactical-amber border-amber-500/30',
      dot: 'bg-tactical-amber shadow-[0_0_8px_#F59E0B]',
      label: 'SYS_VALIDATING',
    },
    PLANNED: {
      badge: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      dot: 'bg-slate-400',
      label: 'ROADMAP_STAGED',
    },
  }[status];

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs tracking-wider';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase font-bold rounded-sm border ${config.badge} ${sizeClasses} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />}
      <span>{config.label}</span>
    </span>
  );
};
