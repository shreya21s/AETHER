import React from 'react';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Battery, 
  Zap, 
  Gauge, 
  Info, 
  Cloud, 
  BarChart3,
  Clock,
  Terminal,
  ShieldCheck,
  Server
} from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { MetricCard } from '@/components/shared/MetricCard';
import { RadialGauge } from '@/components/telemetry/RadialGauge';
import { NetworkPerformanceChart } from '@/components/charts/NetworkPerformanceChart';
import { InferenceEnvironment } from '@/types';

interface ResourceMonitoringProps {
  inferenceEnv: InferenceEnvironment;
}

export const ResourceMonitoring: React.FC<ResourceMonitoringProps> = ({ inferenceEnv }) => {
  const comparisonData = [
    {
      environment: 'Cloud Full Ensemble (FP32)',
      modelSize: '142.5 MB',
      latency: '210 ms',
      ramFootprint: '512 MB',
      batteryImpact: 'Offloaded to GPU',
      bandwidthReq: '> 256 kbps',
      edgeFeasible: false,
    },
    {
      environment: 'Edge Quantized Model (INT8)',
      modelSize: '11.8 MB',
      latency: '28 ms',
      ramFootprint: '38 MB',
      batteryImpact: '~0.04% per 100 screens',
      bandwidthReq: 'None (Local Exec)',
      edgeFeasible: true,
    },
    {
      environment: 'Offline Compact Cache',
      modelSize: '11.8 MB',
      latency: '24 ms',
      ramFootprint: '34 MB',
      batteryImpact: '~0.03% per 100 screens',
      bandwidthReq: 'Zero (Air-Gapped)',
      edgeFeasible: true,
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        moduleNumber={7}
        categoryTag="Edge Computing & Hardware Constraints"
        title="Device Resource &amp; Inference Telemetry"
        description="Monitoring compute cycles, memory ceiling, thermal budget, and battery drain on resource-constrained clinic hardware. Ensuring continuous reliability without device freezes or app crashes."
        status="IMPLEMENTED"
        actions={
          <div className="flex items-center gap-2 font-mono text-xs text-tactical-green bg-tactical-green/10 px-3 py-1.5 border border-tactical-green/30 tactical-corner">
            <span className="w-2 h-2 rounded-full bg-tactical-green animate-ping" />
            <span>[HARDWARE_TELEMETRY_ONLINE]</span>
          </div>
        }
      />

      {/* Mission-Control Hardware Radial Progress Gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <RadialGauge
          label="Edge CPU Load"
          value={14.2}
          unit="%"
          subValue="PEAK < 25%"
          color="green"
        />
        <RadialGauge
          label="RAM Footprint"
          value={42.8}
          min={0}
          max={256}
          unit="MB"
          subValue="SANDBOX: 256MB"
          color="green"
        />
        <RadialGauge
          label="Field Battery"
          value={74}
          unit="%"
          subValue="~9.4H REMAINING"
          color="amber"
        />
        <RadialGauge
          label="Execution Latency"
          value={26}
          min={0}
          max={150}
          unit="ms"
          subValue="SUB-30MS PASS"
          color="cyan"
        />
      </div>

      {/* Real-Time Hardware Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Edge CPU Utilization"
          value="14.2%"
          subValue="Target: < 25% peak"
          statusColor="green"
          icon={<Cpu className="w-4 h-4" />}
          badge="Nominal"
        />
        <MetricCard
          label="Memory (RAM) Footprint"
          value="42.8 MB"
          subValue="Sandbox Ceiling: 256 MB"
          statusColor="green"
          icon={<HardDrive className="w-4 h-4" />}
          badge="INT8 Quantized"
        />
        <MetricCard
          label="Mobile Battery Status"
          value="74%"
          subValue="Est. 9.4 hrs field duty"
          statusColor="amber"
          icon={<Battery className="w-4 h-4" />}
          badge="Discharging"
        />
        <MetricCard
          label="Inference Latency"
          value="26 ms"
          subValue="Local Edge Execution"
          statusColor="cyan"
          icon={<Clock className="w-4 h-4" />}
          badge="Sub-30ms"
        />
      </div>

      {/* Cross-Tier Execution Benchmark Chart */}
      <NetworkPerformanceChart connectivity="STABLE" />

      {/* Cross-Tier Comparative Benchmark Table */}
      <div className="telemetry-panel p-5 tactical-corner space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
          <div>
            <h3 className="font-heading font-bold text-sm sm:text-base tracking-wider uppercase text-text-primary flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-tactical-cyan" />
              Comparative Execution Benchmarks Across Tiers
            </h3>
            <p className="text-xs text-text-secondary mt-0.5 font-mono">
              Evaluating trade-offs between Cloud full-model capacity and Edge quantized footprint.
            </p>
          </div>
          <span className="font-mono text-[11px] text-text-secondary">
            [SUITE_BENCHMARK_v2.1]
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead>
              <tr className="border-b border-border-subtle text-text-secondary uppercase text-[10px]">
                <th className="py-2.5 px-3">Execution Tier</th>
                <th className="py-2.5 px-3">Model Size</th>
                <th className="py-2.5 px-3">Inference Latency</th>
                <th className="py-2.5 px-3">RAM Footprint</th>
                <th className="py-2.5 px-3">Battery Drain</th>
                <th className="py-2.5 px-3">Bandwidth Need</th>
                <th className="py-2.5 px-3">Air-Gap Capable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50 text-text-primary">
              {comparisonData.map((row, idx) => (
                <tr key={idx} className="hover:bg-bg-elevated/40 transition-colors">
                  <td className="py-3 px-3 font-heading font-bold text-text-primary">
                    {row.environment}
                  </td>
                  <td className="py-3 px-3 text-tactical-cyan font-bold">{row.modelSize}</td>
                  <td className="py-3 px-3 text-tactical-green font-bold">{row.latency}</td>
                  <td className="py-3 px-3">{row.ramFootprint}</td>
                  <td className="py-3 px-3 text-[11px]">{row.batteryImpact}</td>
                  <td className="py-3 px-3">{row.bandwidthReq}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 text-[10px] font-bold border tactical-corner ${
                      row.edgeFeasible 
                        ? 'bg-tactical-green/10 text-tactical-green border-tactical-green/30' 
                        : 'bg-tactical-red/10 text-tactical-red border-tactical-red/30'
                    }`}>
                      {row.edgeFeasible ? '[YES]' : '[NO]'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Technical Explanation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="telemetry-panel p-5 tactical-corner space-y-3">
          <div className="flex items-center gap-2 font-heading font-bold text-sm tracking-wider uppercase text-text-primary">
            <Zap className="w-4 h-4 text-tactical-amber" />
            <span>Resource-Aware Dynamic Model Switching</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed font-mono">
            When a clinic tablet drops below 15% battery or experiences CPU thermal throttling, the AETHER controller automatically disables heavy local calibration loops and falls back to a pruned compact lookup decision tree, preserving battery life for emergency patient screenings.
          </p>
        </div>

        <div className="telemetry-panel p-5 tactical-corner space-y-3">
          <div className="flex items-center gap-2 font-heading font-bold text-sm tracking-wider uppercase text-text-primary">
            <Info className="w-4 h-4 text-tactical-cyan" />
            <span>INT8 Quantization &amp; Tree Flattening</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed font-mono">
            By quantizing floating-point tree leaf outputs and node split thresholds into 8-bit integer fixed-point representations, model memory requirements decrease by 92% (from 142MB down to ~12MB) with less than 0.004 change in area under the ROC curve (AUROC).
          </p>
        </div>
      </div>
    </div>
  );
};