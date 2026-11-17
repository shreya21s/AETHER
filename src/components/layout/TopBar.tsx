import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Activity, 
  Cpu, 
  Cloud, 
  HardDrive, 
  RefreshCw,
  Menu,
  Sliders,
  ShieldCheck,
  Compass,
  Bell,
  Radio,
  Terminal,
  Clock
} from 'lucide-react';
import { ConnectivityMode, InferenceEnvironment } from '@/types';
import { APP_IDENTITY } from '@/config/features';

interface TopBarProps {
  connectivity: ConnectivityMode;
  onConnectivityChange: (mode: ConnectivityMode) => void;
  inferenceEnv: InferenceEnvironment;
  onInferenceEnvChange: (env: InferenceEnvironment) => void;
  isPresentationMode: boolean;
  onTogglePresentationMode: () => void;
  onToggleSidebarMobile: () => void;
  pendingSyncCount: number;
  onTriggerSync: () => void;
  theme?: string;
  onToggleTheme?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  connectivity,
  onConnectivityChange,
  inferenceEnv,
  onInferenceEnvChange,
  isPresentationMode,
  onTogglePresentationMode,
  onToggleSidebarMobile,
  pendingSyncCount,
  onTriggerSync,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0] + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const connectivityConfig = {
    STABLE: {
      label: '4G_STABLE // 38MS',
      icon: <Wifi className="w-3.5 h-3.5 text-tactical-green" />,
      color: 'text-tactical-green border-tactical-green/40 bg-tactical-green/10',
    },
    DEGRADED: {
      label: '2G_JITTER // 480MS',
      icon: <Activity className="w-3.5 h-3.5 text-tactical-amber" />,
      color: 'text-tactical-amber border-tactical-amber/40 bg-tactical-amber/10',
    },
    OFFLINE: {
      label: 'AIR_GAPPED // LOCAL',
      icon: <WifiOff className="w-3.5 h-3.5 text-tactical-red" />,
      color: 'text-tactical-red border-tactical-red/40 bg-tactical-red/10',
    },
  };

  const inferenceConfig = {
    CLOUD: {
      label: 'CLOUD_GPU_ENSEMBLE',
      icon: <Cloud className="w-3.5 h-3.5 text-tactical-cyan" />,
      color: 'text-tactical-cyan border-tactical-cyan/40 bg-tactical-cyan/10',
    },
    EDGE: {
      label: 'EDGE_INT8_RUNTIME',
      icon: <Cpu className="w-3.5 h-3.5 text-tactical-green" />,
      color: 'text-tactical-green border-tactical-green/40 bg-tactical-green/10',
    },
    OFFLINE: {
      label: 'OFFLINE_CACHE_BUFFER',
      icon: <HardDrive className="w-3.5 h-3.5 text-tactical-amber" />,
      color: 'text-tactical-amber border-tactical-amber/40 bg-tactical-amber/10',
    },
  };

  return (
    <header className="sticky top-0 z-30 h-14 w-full bg-[#0E131E] border-b border-border-subtle px-4 flex items-center justify-between gap-4 font-mono">
      {/* Left: Branding & Mission ID */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebarMobile}
          className="lg:hidden p-1.5 rounded-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-sm bg-[#141B27] border border-tactical-cyan/40 flex items-center justify-center text-tactical-cyan font-black text-xs shadow-tactical-cyan">
            Æ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-sm tracking-wider text-text-primary">
                AETHER
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-tactical-cyan/10 text-tactical-cyan border border-tactical-cyan/30 font-bold">
                OPS_v0.4
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Real-Time Tactical Telemetry */}
      <div className="hidden lg:flex items-center gap-2 text-xs">
        {/* Network State Simulator */}
        <div className="flex items-center gap-1 bg-[#141B27] border border-border-subtle rounded-sm p-0.5">
          <span className="text-[10px] text-text-muted px-2 uppercase flex items-center gap-1">
            <Sliders className="w-3 h-3 text-tactical-cyan" /> NET:
          </span>
          {(['STABLE', 'DEGRADED', 'OFFLINE'] as ConnectivityMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onConnectivityChange(mode)}
              className={`px-2 py-0.5 rounded-sm text-[10px] transition-all flex items-center gap-1.5 ${
                connectivity === mode
                  ? connectivityConfig[mode].color + ' font-bold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
              }`}
            >
              {connectivityConfig[mode].icon}
              <span>{mode}</span>
            </button>
          ))}
        </div>

        {/* Selected Route */}
        <div className="flex items-center gap-1.5 bg-[#141B27] border border-border-subtle rounded-sm px-2.5 py-1 text-xs">
          <span className="text-[10px] text-text-muted uppercase">ROUTE:</span>
          <div className={`flex items-center gap-1 font-bold ${inferenceConfig[inferenceEnv].color} px-2 py-0.5 rounded-sm text-[10px]`}>
            {inferenceConfig[inferenceEnv].icon}
            <span>{inferenceConfig[inferenceEnv].label}</span>
          </div>
        </div>

        {/* System Health */}
        <div className="flex items-center gap-1.5 bg-[#141B27] border border-border-subtle rounded-sm px-2.5 py-1 text-[10px] text-tactical-green">
          <span className="w-2 h-2 rounded-full bg-tactical-green shadow-[0_0_6px_#22C55E] animate-pulse" />
          <span>SYS_NOMINAL</span>
        </div>

        {/* Live Telemetry Clock */}
        <div className="flex items-center gap-1.5 bg-[#141B27] border border-border-subtle rounded-sm px-2.5 py-1 text-[10px] text-text-muted">
          <Clock className="w-3 h-3 text-tactical-cyan" />
          <span className="text-text-primary">{timeStr}</span>
        </div>
      </div>

      {/* Right: Actions, Sync, Presentation Walkthrough, Profile */}
      <div className="flex items-center gap-2">
        {/* Sync queue indicator */}
        <button
          onClick={onTriggerSync}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#141B27] border border-border-subtle hover:border-tactical-cyan text-xs text-text-secondary hover:text-text-primary transition-all"
          title={pendingSyncCount > 0 ? `${pendingSyncCount} records pending sync` : 'All records synced'}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${pendingSyncCount > 0 ? 'text-tactical-amber animate-spin' : 'text-tactical-green'}`} />
          <span className="hidden xl:inline text-[10px]">
            {pendingSyncCount > 0 ? `QUEUE [${pendingSyncCount}]` : 'SYNCED'}
          </span>
        </button>

        {/* Presentation Walkthrough */}
        <button
          onClick={onTogglePresentationMode}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium transition-all ${
            isPresentationMode
              ? 'bg-tactical-cyan text-bg-primary font-bold shadow-tactical-cyan'
              : 'bg-[#182231] hover:bg-bg-elevated border border-border-subtle text-tactical-cyan hover:border-tactical-cyan'
          }`}
          title="Mission-Control Guided Walkthrough"
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="text-[10px] uppercase font-bold tracking-wider">
            {isPresentationMode ? 'Exit Tour' : 'Command Tour'}
          </span>
        </button>

        {/* Clinician Profile */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border-subtle text-xs">
          <div className="w-6 h-6 rounded-sm bg-[#182231] border border-border-subtle flex items-center justify-center font-bold text-[10px] text-tactical-cyan">
            OP
          </div>
          <div className="hidden xl:block text-left text-[10px]">
            <div className="font-bold text-text-primary leading-tight">CLINIC_OPS // MD</div>
            <div className="text-tactical-green flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-tactical-green" /> AUTHENTICATED
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
