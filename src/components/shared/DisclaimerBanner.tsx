import React from 'react';
import { ShieldCheck, Terminal, AlertTriangle } from 'lucide-react';

interface DisclaimerBannerProps {
  compact?: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ compact = true }) => {
  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-sm telemetry-panel border-l-2 border-l-tactical-amber text-xs text-text-secondary">
      <div className="flex items-center gap-2.5 truncate font-mono text-[11px]">
        <span className="flex items-center justify-center w-4 h-4 rounded-sm bg-tactical-amber/20 text-tactical-amber shrink-0">
          <AlertTriangle className="w-3 h-3" />
        </span>
        <span className="truncate">
          <strong className="text-text-primary uppercase tracking-wider">AETHER OPERATIONAL PROTOCOL:</strong> Offline-first adaptive clinical decision-support system. Candidate target: Respiratory Airflow-Obstruction (NHANES 2007–2012 feasibility cohort). Non-diagnostic.
        </span>
      </div>
      <div className="hidden lg:flex items-center gap-2 shrink-0 font-mono text-[10px] text-text-muted">
        <span className="flex items-center gap-1.5 text-tactical-cyan">
          <span className="w-1.5 h-1.5 rounded-full bg-tactical-cyan animate-pulse" />
          SYS_ACTIVE
        </span>
        <span>•</span>
        <span>SEC_LEVEL_01</span>
      </div>
    </div>
  );
};
