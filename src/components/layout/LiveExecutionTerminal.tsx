import React, { useState } from 'react';
import { Terminal, Trash2, ArrowDown, Shield, CheckCircle2 } from 'lucide-react';

export interface ExecutionLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'TRACE' | 'EVAL' | 'ROUTING' | 'WARN' | 'SUCCESS';
  module: string;
  message: string;
}

interface LiveExecutionTerminalProps {
  logs: ExecutionLogEntry[];
  onClearLogs?: () => void;
  maxHeight?: string;
}

export const LiveExecutionTerminal: React.FC<LiveExecutionTerminalProps> = ({
  logs,
  onClearLogs,
  maxHeight = 'max-h-56',
}) => {
  const [autoScroll, setAutoScroll] = useState(true);

  const getLevelStyle = (level: ExecutionLogEntry['level']) => {
    switch (level) {
      case 'SUCCESS':
        return 'text-tactical-green bg-emerald-500/10 border-emerald-500/30';
      case 'WARN':
        return 'text-tactical-amber bg-amber-500/10 border-amber-500/30';
      case 'ROUTING':
        return 'text-tactical-cyan bg-cyan-500/10 border-cyan-500/30';
      case 'EVAL':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'TRACE':
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
      case 'INFO':
      default:
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <div className="telemetry-panel p-4 tactical-corner space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-tactical-cyan" />
          <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary">
            Live Execution Terminal // Runtime Event Bus
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-text-muted">
          <span className="flex items-center gap-1.5 text-tactical-green">
            <span className="w-1.5 h-1.5 rounded-full bg-tactical-green animate-pulse" />
            STREAM_ACTIVE
          </span>
          {onClearLogs && (
            <button
              onClick={onClearLogs}
              className="hover:text-text-primary text-text-muted transition-colors flex items-center gap-1"
              title="Clear event logs"
            >
              <Trash2 className="w-3 h-3" />
              <span>CLEAR</span>
            </button>
          )}
        </div>
      </div>

      <div className={`space-y-1.5 overflow-y-auto pr-1 text-[11px] ${maxHeight}`}>
        {logs.length === 0 ? (
          <div className="text-text-muted py-4 text-center italic">
            // Awaiting application events. Initiate screening or simulate network transitions to stream logs.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-2.5 py-1 px-1.5 rounded-sm hover:bg-[#182231] transition-colors leading-relaxed border-l border-l-transparent hover:border-l-tactical-cyan"
            >
              <span className="text-text-muted shrink-0 text-[10px]">{log.timestamp}</span>
              <span className={`px-1.5 py-0.2 rounded-sm text-[9px] font-bold border shrink-0 ${getLevelStyle(log.level)}`}>
                [{log.level}]
              </span>
              <span className="text-text-secondary shrink-0 font-semibold text-[10px]">
                [{log.module}]:
              </span>
              <span className="text-text-primary break-all">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
