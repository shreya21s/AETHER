import React, { useState } from 'react';
import { 
  Cloud, 
  Cpu, 
  HardDrive, 
  ArrowRight, 
  Activity, 
  Sliders, 
  ExternalLink, 
  ShieldCheck, 
  Server, 
  Zap, 
  Stethoscope, 
  HelpCircle, 
  GitFork, 
  Wifi,
  WifiOff,
  Radio,
  Clock,
  Terminal,
  AlertTriangle,
  Play,
  Wind
} from 'lucide-react';
import { MetricCard } from '@/components/shared/MetricCard';
import { LiveExecutionTerminal, ExecutionLogEntry } from '@/components/layout/LiveExecutionTerminal';
import { RespiratorySystemVisualizer } from '@/components/medical/RespiratorySystemVisualizer';
import { InteractiveTopologyDiagram } from '@/components/topology/InteractiveTopologyDiagram';
import { RadialGauge } from '@/components/telemetry/RadialGauge';
import { NetworkPerformanceChart } from '@/components/charts/NetworkPerformanceChart';
import { ConnectivityMode, InferenceEnvironment } from '@/types';

interface OverviewProps {
  onNavigate: (route: string) => void;
  connectivity: ConnectivityMode;
  inferenceEnv: InferenceEnvironment;
}

export const Overview: React.FC<OverviewProps> = ({
  onNavigate,
  connectivity,
  inferenceEnv,
}) => {
  // Interactive Live Playground State
  const [demoRatio, setDemoRatio] = useState<number>(0.66);
  const [demoAge, setDemoAge] = useState<number>(56);
  const [demoSmoking, setDemoSmoking] = useState<boolean>(true);

  // Runtime event logs stream
  const [logs, setLogs] = useState<ExecutionLogEntry[]>([
    {
      id: 'log-01',
      timestamp: '18:41:02.104',
      level: 'INFO',
      module: 'SYS_INIT',
      message: 'AETHER Tactical Operations Console online. Initialized 11-layer architecture.',
    },
    {
      id: 'log-02',
      timestamp: '18:41:02.148',
      level: 'ROUTING',
      module: 'TELEMETRY',
      message: `Active link mode sensed: ${connectivity}. Assigned inference route: ${inferenceEnv}.`,
    },
    {
      id: 'log-03',
      timestamp: '18:41:02.210',
      level: 'SUCCESS',
      module: 'LOCAL_STORAGE',
      message: 'IndexedDB persistent transaction queue verified. Local air-gap state ready.',
    },
  ]);

  const addLog = (level: ExecutionLogEntry['level'], module: string, message: string) => {
    const now = new Date();
    const ts = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    setLogs((prev) => [
      ...prev,
      { id: `log-${Date.now()}-${Math.random()}`, timestamp: ts, level, module, message },
    ]);
  };

  const computePlaygroundRisk = () => {
    let risk = 0.08;
    if (demoRatio < 0.60) risk += 0.68;
    else if (demoRatio < 0.70) risk += 0.46;
    else if (demoRatio < 0.75) risk += 0.22;
    else risk -= 0.05;

    if (demoSmoking) risk += 0.20;
    if (demoAge > 50) risk += 0.08;

    risk = Math.max(0.04, Math.min(0.96, risk));

    let triage = 'PREDICT';
    let triageDetail = 'Sufficient evidence for autonomous classification.';
    let triageColor: 'green' | 'amber' | 'red' = 'green';

    if (demoRatio >= 0.67 && demoRatio <= 0.73) {
      triage = 'REQUEST';
      triageDetail = 'Borderline airflow limitation. Additional post-BD testing required.';
      triageColor = 'amber';
    } else if (demoRatio > 0.82 && risk > 0.4) {
      triage = 'ABSTAIN';
      triageDetail = 'Atypical pattern with high epistemic uncertainty. Human physician audit mandatory.';
      triageColor = 'red';
    }

    return {
      riskPercent: (risk * 100).toFixed(1),
      triage,
      triageDetail,
      triageColor,
      entropy: (-(risk * Math.log2(risk) + (1 - risk) * Math.log2(1 - risk))).toFixed(2),
    };
  };

  const playgroundResult = computePlaygroundRisk();

  const handleTestSimulator = () => {
    addLog('INFO', 'SCREENING_INPUT', `Ingested vector: FEV1/FVC=${demoRatio}, Age=${demoAge}, Smoker=${demoSmoking}`);
    addLog('EVAL', 'UNCERTAINTY', `Calibrated probability evaluated: ${playgroundResult.riskPercent}%, Entropy=${playgroundResult.entropy}`);
    addLog(
      playgroundResult.triageColor === 'green' ? 'SUCCESS' : playgroundResult.triageColor === 'amber' ? 'WARN' : 'WARN',
      'TRIAGE_ENGINE',
      `Triage output generated -> [${playgroundResult.triage}]: ${playgroundResult.triageDetail}`
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-mono">
      {/* SECTION 1: Tactical Mission Command Header */}
      <div className="telemetry-panel p-5 tactical-corner bg-[#111622] border-border-subtle relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-none bg-tactical-cyan/15 text-tactical-cyan border border-tactical-cyan/30 font-bold flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-tactical-cyan animate-pulse" />
                TACTICAL_OPS_MONITOR // LEVEL_01
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-none bg-[#141B27] text-text-secondary border border-border-subtle">
                PROTOCOL: NHANES_SPIROMETRY_2007_2012
              </span>
            </div>

            <h1 className="font-heading font-black text-2xl sm:text-3xl text-text-primary tracking-tight">
              AETHER — MISSION CONTROL &amp; TELEMETRY CONSOLE
            </h1>
            <p className="text-xs text-text-secondary leading-relaxed font-sans">
              Offline-first, uncertainty-aware distributed AI platform for clinical risk screening in low-connectivity healthcare environments. Dynamic Cloud–Edge–Offline routing with selective abstention.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('assessment')}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-tactical-cyan text-bg-primary font-heading font-bold text-xs hover:bg-tactical-cyan/90 transition-all tactical-corner tracking-wider uppercase"
            >
              <Stethoscope className="w-4 h-4" />
              <span>LAUNCH ASSESSMENT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('architecture')}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-bg-card hover:bg-bg-elevated text-text-primary border border-border-subtle text-xs hover:border-tactical-cyan transition-all tactical-corner"
            >
              <Server className="w-3.5 h-3.5 text-text-secondary" />
              <span>SYSTEM ARCHITECTURE</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: Visual Mission-Control Radial Telemetry Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <RadialGauge
          label="WAN RTT Latency"
          value={connectivity === 'STABLE' ? 38 : connectivity === 'DEGRADED' ? 480 : 0}
          min={0}
          max={600}
          unit="ms"
          subValue={connectivity === 'STABLE' ? '4G NOMINAL' : connectivity === 'DEGRADED' ? 'HIGH JITTER' : 'DISCONNECTED'}
          color={connectivity === 'STABLE' ? 'cyan' : connectivity === 'DEGRADED' ? 'amber' : 'red'}
        />

        <RadialGauge
          label="Packet Drop Ratio"
          value={connectivity === 'STABLE' ? 0.2 : connectivity === 'DEGRADED' ? 22.4 : 100}
          min={0}
          max={100}
          unit="%"
          subValue={connectivity === 'STABLE' ? 'LOSS < 0.5%' : connectivity === 'DEGRADED' ? 'RETRY QUEUE' : 'AIR-GAPPED'}
          color={connectivity === 'STABLE' ? 'green' : connectivity === 'DEGRADED' ? 'amber' : 'red'}
        />

        <RadialGauge
          label="Edge CPU Utilization"
          value={14.2}
          min={0}
          max={100}
          unit="%"
          subValue="ARM CORTEX-A53"
          color="green"
        />

        <RadialGauge
          label="Mobile Battery Life"
          value={78}
          min={0}
          max={100}
          unit="%"
          subValue="9.4 HRS DUTY"
          color="amber"
        />
      </div>

      {/* SECTION 3: Interactive Cloud ↔ Edge ↔ Offline Architecture Topology */}
      <InteractiveTopologyDiagram
        connectivity={connectivity}
        activeInferenceEnv={inferenceEnv}
      />

      {/* SECTION 4: Anatomical Pulmonary Visualizer + Live Clinical Decision Support Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Anatomical Lungs and Respiratory Airflow Visualizer */}
        <div className="lg:col-span-6">
          <RespiratorySystemVisualizer
            fev1FvcRatio={demoRatio}
            interactive={true}
          />
        </div>

        {/* Right: Live Clinical Parameter Tuning Simulator */}
        <div className="lg:col-span-6 telemetry-panel p-5 tactical-corner bg-[#111622] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-tactical-cyan" />
              <h2 className="font-heading font-bold text-sm sm:text-base text-text-primary uppercase tracking-wider">
                Clinical Vector Simulator
              </h2>
            </div>
            <button
              onClick={handleTestSimulator}
              className="flex items-center gap-1.5 px-3 py-1 bg-tactical-cyan text-bg-primary text-xs font-bold hover:bg-tactical-cyan/90 transition-all tactical-corner self-start sm:self-auto uppercase tracking-wider"
            >
              <Play className="w-3 h-3" />
              <span>EVALUATE VECTOR</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* Slider 1: FEV1/FVC Ratio */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary">PULMONARY RATIO [FEV1 / FVC]:</span>
                <span className={`px-2 py-0.5 rounded-none font-bold text-xs ${
                  demoRatio < 0.70 ? 'bg-amber-500/15 text-tactical-amber border border-amber-500/30' : 'bg-emerald-500/15 text-tactical-green border border-emerald-500/30'
                }`}>
                  {demoRatio.toFixed(2)} {demoRatio < 0.70 ? '// LIMITATION' : '// PRESERVED'}
                </span>
              </div>
              <input
                type="range"
                min="0.45"
                max="0.88"
                step="0.01"
                value={demoRatio}
                onChange={(e) => setDemoRatio(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#182231] rounded-none appearance-none cursor-pointer accent-tactical-cyan"
              />
              <div className="flex justify-between text-[10px] text-text-secondary">
                <span>0.45 [SEVERE OBSTRUCTION]</span>
                <span className="text-tactical-amber font-bold">0.70 GOLD CUT-OFF</span>
                <span>0.88 [NORMAL RANGE]</span>
              </div>
            </div>

            {/* Slider 2: Patient Age */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary">PATIENT_AGE:</span>
                <span className="font-bold text-text-primary text-xs">{demoAge} YRS</span>
              </div>
              <input
                type="range"
                min="20"
                max="85"
                step="1"
                value={demoAge}
                onChange={(e) => setDemoAge(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[#182231] rounded-none appearance-none cursor-pointer accent-tactical-cyan"
              />
            </div>

            {/* Smoking Toggle */}
            <div className="flex items-center justify-between p-3 rounded-none bg-bg-primary border border-border-subtle text-xs">
              <span className="text-text-secondary">SMOKING_EXPOSURE_HISTORY:</span>
              <button
                onClick={() => setDemoSmoking(!demoSmoking)}
                className={`px-3 py-1 rounded-none text-xs font-bold transition-all border ${
                  demoSmoking
                    ? 'bg-tactical-red/15 text-tactical-red border-tactical-red/40'
                    : 'bg-[#182231] text-text-secondary border-border-subtle'
                }`}
              >
                {demoSmoking ? 'POSITIVE (>= 20 PACK-YRS)' : 'NON-SMOKER'}
              </button>
            </div>

            {/* Real-time Triage Output */}
            <div className="p-4 bg-bg-primary border border-border-subtle tactical-corner space-y-3">
              <div className="flex justify-between items-center border-b border-border-subtle pb-2">
                <span className="text-[10px] text-text-secondary uppercase">CALIBRATED INFERENCE OUTPUT</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-tactical-cyan/15 text-tactical-cyan font-bold border border-tactical-cyan/30">
                  ISOTONIC_CALIBRATED
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-3xl font-black text-text-primary tracking-tight">
                    {playgroundResult.riskPercent}%
                  </div>
                  <div className="text-[10px] text-text-secondary uppercase">
                    CALIBRATED RISK PROBABILITY
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-tactical-cyan">
                    {playgroundResult.entropy}
                  </div>
                  <div className="text-[10px] text-text-secondary uppercase">
                    ENTROPY H(p)
                  </div>
                </div>
              </div>

              {/* Triage Decision */}
              <div className="p-3 bg-bg-card border border-border-subtle space-y-1.5 tactical-corner">
                <div className="text-[10px] text-text-secondary uppercase font-bold">DECISION_OUTCOME:</div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-0.5 rounded-none font-bold tracking-wider uppercase border ${
                    playgroundResult.triageColor === 'green'
                      ? 'bg-tactical-green/15 text-tactical-green border-tactical-green/40'
                      : playgroundResult.triageColor === 'amber'
                      ? 'bg-tactical-amber/15 text-tactical-amber border-tactical-amber/40'
                      : 'bg-tactical-red/15 text-tactical-red border-tactical-red/40'
                  }`}>
                    [{playgroundResult.triage}]
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary leading-snug font-sans pt-1">
                  {playgroundResult.triageDetail}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: Real-Time Network Telemetry Performance Charts */}
      <NetworkPerformanceChart connectivity={connectivity} />

      {/* SECTION 6: Live Execution Terminal */}
      <LiveExecutionTerminal logs={logs} onClearLogs={() => setLogs([])} />
    </div>
  );
};