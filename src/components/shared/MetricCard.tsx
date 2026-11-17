import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subValue?: string;
  change?: string;
  isPositive?: boolean;
  statusColor?: 'cyan' | 'amber' | 'green' | 'red' | 'slate';
  icon?: React.ReactNode;
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subValue,
  change,
  isPositive,
  statusColor = 'cyan',
  icon,
  badge,
}) => {
  const colorMap = {
    cyan: 'border-tactical-cyan/30 text-tactical-cyan bg-tactical-cyan/10',
    amber: 'border-tactical-amber/30 text-tactical-amber bg-tactical-amber/10',
    green: 'border-tactical-green/30 text-tactical-green bg-tactical-green/10',
    red: 'border-tactical-red/30 text-tactical-red bg-tactical-red/10',
    slate: 'border-slate-500/30 text-slate-400 bg-slate-500/10',
  };

  const ledMap = {
    cyan: 'bg-tactical-cyan shadow-[0_0_6px_#06B6D4]',
    amber: 'bg-tactical-amber shadow-[0_0_6px_#F59E0B]',
    green: 'bg-tactical-green shadow-[0_0_6px_#22C55E]',
    red: 'bg-tactical-red shadow-[0_0_6px_#EF4444]',
    slate: 'bg-slate-500',
  };

  return (
    <div className="telemetry-panel p-4 tactical-corner relative overflow-hidden group">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 truncate">
          <span className={`w-1.5 h-1.5 rounded-full ${ledMap[statusColor]} shrink-0`} />
          <span className="font-mono text-[11px] uppercase tracking-wider text-text-secondary truncate">
            {label}
          </span>
        </div>
        {icon && (
          <div className="text-text-muted group-hover:text-tactical-cyan transition-colors shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          {value}
        </span>
        {unit && <span className="font-mono text-xs text-text-secondary">{unit}</span>}
      </div>

      {(subValue || change || badge) && (
        <div className="mt-2.5 pt-2 border-t border-border-subtle flex items-center justify-between text-xs font-mono">
          {subValue && (
            <span className="text-text-muted text-[11px] truncate max-w-[190px]">
              {subValue}
            </span>
          )}
          {change && (
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded-sm font-bold ${
                isPositive ? 'text-tactical-green bg-emerald-500/10' : 'text-tactical-red bg-rose-500/10'
              }`}
            >
              {change}
            </span>
          )}
          {badge && (
            <span className={`text-[10px] px-2 py-0.5 rounded-sm font-bold border ${colorMap[statusColor]}`}>
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
