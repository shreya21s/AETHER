import React, { useState } from 'react';
import { 
  Sliders, 
  Wifi, 
  WifiOff, 
  Activity, 
  Cpu, 
  Cloud, 
  HardDrive, 
  ArrowRight, 
  Battery, 
  CheckCircle2, 
  Play, 
  Gauge, 
  Zap, 
  Radio,
  Terminal,
  ShieldCheck,
  Signal
} from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { InteractiveTopologyDiagram } from '@/components/topology/InteractiveTopologyDiagram';
import { NetworkPerformanceChart } from '@/components/charts/NetworkPerformanceChart';
import { ConnectivityMode, InferenceEnvironment, NetworkSimulationState, DeviceResourceState } from '@/types';

interface AdaptiveInferenceProps {
  connectivity: ConnectivityMode;
  onConnectivityChange: (mode: ConnectivityMode) => void;
  inferenceEnv: InferenceEnvironment;
  onInferenceEnvChange: (env: InferenceEnvironment) => void;
}

export const AdaptiveInference: React.FC<AdaptiveInferenceProps> = ({
  connectivity,
  onConnectivityChange,
  inferenceEnv,
  onInferenceEnvChange,
}) => {
  const [networkSim, setNetworkSim] = useState<NetworkSimulationState>({
    mode: connectivity,
    latencyMs: connectivity === 'STABLE' ? 42 : connectivity === 'DEGRADED' ? 480 : 0,
    jitterMs: connectivity === 'STABLE' ? 8 : connectivity === 'DEGRADED' ? 180 : 0,
    packetLossPercent: connectivity === 'STABLE' ? 0.2 : connectivity === 'DEGRADED' ? 18.5 : 100,
    bandwidthKbps: connectivity === 'STABLE' ? 12000 : connectivity === 'DEGRADED' ? 95 : 0,
    cloudReachable: connectivity !== 'OFFLINE',
  });

  const [deviceResources] = useState<DeviceResourceState>({
    cpuUsagePercent: 14.2,
    ramUsageMb: 38.4,
    totalRamMb: 512,
    batteryLevelPercent: 78,
    isPluggedIn: false,
    localModelLoaded: true,
    localModelSizeMb: 11.8,
    temperatureCelsius: 36.8,
  });

  const [isSimulatingRequest, setIsSimulatingRequest] = useState(false);
  const [pipelineTrace, setPipelineTrace] = useState<string[]>([
    `[00:00.000] [SYS_INIT] Adaptive Routing Governor initialized in mode: ${connectivity}`,
    `[00:00.012] [LINK_SENSOR] Active interface: ${connectivity === 'STABLE' ? '4G_WAN_STABLE' : connectivity === 'DEGRADED' ? '2G_CELLULAR_JITTER' : 'AIR_GAPPED_DISCONNECTED'}`,
    `[00:00.024] [ROUTER_DISPATCH] Primary target assigned: [${inferenceEnv}_PIPELINE]`
  ]);

  const handleApplyPreset = (mode: ConnectivityMode) => {
    onConnectivityChange(mode);
    let selectedTarget: InferenceEnvironment = 'EDGE';

    if (mode === 'STABLE') {
      selectedTarget = 'CLOUD';
      setNetworkSim({
        mode: 'STABLE',
        latencyMs: 38,
        jitterMs: 6,
        packetLossPercent: 0.1,
        bandwidthKbps: 15400,
        cloudReachable: true,
      });
    } else if (mode === 'DEGRADED') {
      selectedTarget = 'EDGE';
      setNetworkSim({
        mode: 'DEGRADED',
        latencyMs: 512,
        jitterMs: 240,
        packetLossPercent: 22.4,
        bandwidthKbps: 78,
        cloudReachable: true,
      });
    } else {
      selectedTarget = 'OFFLINE';
      setNetworkSim({
        mode: 'OFFLINE',
        latencyMs: 0,
        jitterMs: 0,
        packetLossPercent: 100,
        bandwidthKbps: 0,
        cloudReachable: false,
      });
    }

    onInferenceEnvChange(selectedTarget);
    setPipelineTrace((prev) => [
      ...prev,
      `[${new Date().toISOString().substring(14, 23)}] [POLICY_TRIGGER] Link transitioned to [${mode}]. Re-evaluating cost-utility dispatch...`,
      `[${new Date().toISOString().substring(14, 23)}] [ROUTER_FAILOVER] Switched execution target -> [${selectedTarget}_PIPELINE]`,
    ]);
  };

  const handleTestInferenceCycle = async () => {
    setIsSimulatingRequest(true);
    const ts = () => new Date().toISOString().substring(14, 23);

    setPipelineTrace((prev) => [
      ...prev,
      `[${ts()}] [INFERENCE_REQUEST] Incoming clinical vector payload (14 normalized features)...`,
    ]);

    await new Promise((r) => setTimeout(r, 220));
    setPipelineTrace((prev) => [
      ...prev,
      `[${ts()}] [TELEMETRY_SAMPLE] Latency=${networkSim.latencyMs}ms | Loss=${networkSim.packetLossPercent}% | Battery=${deviceResources.batteryLevelPercent}%`,
    ]);

    await new Promise((r) => setTimeout(r, 240));
    setPipelineTrace((prev) => [
      ...prev,
      `[${ts()}] [GOVERNOR_DECISION] Selected Tier: [${inferenceEnv}]. Dispatching deterministic inference thread...`,
    ]);

    await new Promise((r) => setTimeout(r, 300));
    if (inferenceEnv === 'CLOUD') {
      setPipelineTrace((prev) => [
        ...prev,
        `[${ts()}] [CLOUD_GPU] Remote cluster inference verified via TLS 1.3. Round-trip executed in ${networkSim.latencyMs + 65}ms.`,
      ]);
    } else if (inferenceEnv === 'EDGE') {
      setPipelineTrace((prev) => [
        ...prev,
        `[${ts()}] [EDGE_INT8] Local WebAssembly quantized execution complete. RAM peak: +4.2MB, Time: 26.4ms.`,
      ]);
    } else {
      setPipelineTrace((prev) => [
        ...prev,
        `[${ts()}] [AIR_GAP] Zero remote ping. Record written to local SQLite/IndexedDB transactional queue.`,
      ]);
    }

    setIsSimulatingRequest(false);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        moduleNumber={3}
        categoryTag="Adaptive Distributed Execution"
        title="Adaptive Inference Controller (WHERE Engine)"
        description="Dynamic multi-tier execution governor. Evaluates real-time packet loss, round-trip latency, jitter, and on-device power budgets to route clinical requests between Cloud ensembles, local INT8 models, and air-gapped storage."
        status="IMPLEMENTED"
        actions={
          <div className="flex items-center gap-2 font-mono text-xs text-tactical-cyan bg-tactical-cyan/10 px-3 py-1.5 border border-tactical-cyan/30 tactical-corner">
            <Radio className="w-3.5 h-3.5 animate-pulse text-tactical-cyan" />
            <span>[SYS_ROUTER_ACTIVE]</span>
          </div>
        }
      />

      {/* Network Profile Presets */}
      <div className="telemetry-panel p-5 tactical-corner space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-tactical-amber" />
            <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-text-primary">
              Tactical Link Conditions Simulation
            </h3>
          </div>
          <span className="font-mono text-[11px] text-text-secondary">
            Select channel profile to test failover routing
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              mode: 'STABLE' as ConnectivityMode,
              code: 'PROFILE_01 // 4G_BROADBAND',
              title: 'Broadband / 4G (Nominal)',
              subtitle: 'Regional hub hospital uplink',
              target: 'CLOUD GPU ENSEMBLE',
              latency: '38 ms RTT',
              loss: '0.1% Drop',
              icon: <Wifi className="w-5 h-5 text-tactical-green" />,
              borderClass: connectivity === 'STABLE' ? 'border-tactical-green bg-tactical-green/10 shadow-[0_0_15px_rgba(34,197,94,0.15)]' : 'border-border-subtle hover:border-tactical-green/40',
            },
            {
              mode: 'DEGRADED' as ConnectivityMode,
              code: 'PROFILE_02 // 2G_JITTER',
              title: '2G Cellular (Degraded)',
              subtitle: 'Intermittent rural cellular reception',
              target: 'EDGE INT8 RUNTIME',
              latency: '512 ms RTT',
              loss: '22.4% Drop',
              icon: <Activity className="w-5 h-5 text-tactical-amber" />,
              borderClass: connectivity === 'DEGRADED' ? 'border-tactical-amber bg-tactical-amber/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 'border-border-subtle hover:border-tactical-amber/40',
            },
            {
              mode: 'OFFLINE' as ConnectivityMode,
              code: 'PROFILE_03 // AIR_GAPPED',
              title: 'Zero Signal (Air-Gapped)',
              subtitle: 'Remote community health post',
              target: 'OFFLINE LOCAL CACHE',
              latency: '0 ms (Local)',
              loss: '100% Drop',
              icon: <WifiOff className="w-5 h-5 text-tactical-red" />,
              borderClass: connectivity === 'OFFLINE' ? 'border-tactical-red bg-tactical-red/10 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'border-border-subtle hover:border-tactical-red/40',
            },
          ].map((preset) => (
            <button
              key={preset.mode}
              onClick={() => handleApplyPreset(preset.mode)}
              className={`telemetry-panel p-4 text-left transition-all relative overflow-hidden group tactical-corner ${preset.borderClass}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-text-secondary uppercase">
                  {preset.code}
                </span>
                {connectivity === preset.mode && (
                  <span className="flex items-center gap-1 font-mono text-[10px] text-tactical-green uppercase font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-tactical-green animate-ping" />
                    ACTIVE
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-1.5">
                {preset.icon}
                <h4 className="font-heading font-bold text-sm text-text-primary">
                  {preset.title}
                </h4>
              </div>

              <p className="text-xs text-text-secondary mb-3">{preset.subtitle}</p>

              <div className="space-y-1 font-mono text-[11px] border-t border-border-subtle/60 pt-2.5">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Assigned Route:</span>
                  <span className="text-tactical-cyan font-bold">{preset.target}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Expected RTT:</span>
                  <span className="text-text-primary">{preset.latency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Packet Loss:</span>
                  <span className="text-text-primary">{preset.loss}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Network Performance Telemetry Chart */}
      <NetworkPerformanceChart connectivity={connectivity} />

      {/* Interactive Topology Diagram */}
      <InteractiveTopologyDiagram
        connectivity={connectivity}
        onConnectivityChange={handleApplyPreset}
        activeInferenceEnv={inferenceEnv}
        onSelectInferenceEnv={onInferenceEnvChange}
      />

      {/* Telemetry Panels: Network & Hardware */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Network Metrics */}
        <div className="telemetry-panel p-5 tactical-corner space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-text-primary flex items-center gap-2">
              <Signal className="w-4 h-4 text-tactical-cyan" />
              WAN Telemetry Sensor Array
            </h3>
            <span className="font-mono text-[10px] text-tactical-cyan bg-tactical-cyan/10 px-2 py-0.5 border border-tactical-cyan/30">
              [POLLING_100HZ]
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-bg-primary border border-border-subtle tactical-corner">
              <div className="font-mono text-[10px] text-text-secondary uppercase">Round-Trip Latency</div>
              <div className="font-mono text-xl font-bold text-text-primary mt-1">
                {networkSim.latencyMs === 0 ? '0 ms' : `${networkSim.latencyMs} ms`}
              </div>
              <div className="font-mono text-[10px] text-text-secondary mt-0.5">ICMP Ping Delta</div>
            </div>

            <div className="p-3 bg-bg-primary border border-border-subtle tactical-corner">
              <div className="font-mono text-[10px] text-text-secondary uppercase">Downlink Bandwidth</div>
              <div className="font-mono text-xl font-bold text-text-primary mt-1">
                {networkSim.bandwidthKbps > 1000
                  ? `${(networkSim.bandwidthKbps / 1000).toFixed(1)} Mbps`
                  : `${networkSim.bandwidthKbps} Kbps`}
              </div>
              <div className="font-mono text-[10px] text-text-secondary mt-0.5">Channel Capacity</div>
            </div>

            <div className="p-3 bg-bg-primary border border-border-subtle tactical-corner">
              <div className="font-mono text-[10px] text-text-secondary uppercase">Packet Loss Ratio</div>
              <div className={`font-mono text-xl font-bold mt-1 ${networkSim.packetLossPercent > 10 ? 'text-tactical-red' : 'text-tactical-green'}`}>
                {networkSim.packetLossPercent}%
              </div>
              <div className="font-mono text-[10px] text-text-secondary mt-0.5">Drop Threshold: &lt; 5%</div>
            </div>

            <div className="p-3 bg-bg-primary border border-border-subtle tactical-corner">
              <div className="font-mono text-[10px] text-text-secondary uppercase">Cloud Gateway Health</div>
              <div className={`font-mono text-base font-bold mt-1.5 ${networkSim.cloudReachable ? 'text-tactical-green' : 'text-tactical-red'}`}>
                {networkSim.cloudReachable ? 'REACHABLE' : 'UNREACHABLE'}
              </div>
              <div className="font-mono text-[10px] text-text-secondary mt-0.5">Socket Keep-Alive</div>
            </div>
          </div>
        </div>

        {/* Device Hardware Metrics */}
        <div className="telemetry-panel p-5 tactical-corner space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-text-primary flex items-center gap-2">
              <Cpu className="w-4 h-4 text-tactical-green" />
              On-Device Hardware Telemetry
            </h3>
            <span className="font-mono text-[10px] text-tactical-green bg-tactical-green/10 px-2 py-0.5 border border-tactical-green/30">
              [TABLET_PROFILE]
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-bg-primary border border-border-subtle tactical-corner">
              <div className="font-mono text-[10px] text-text-secondary uppercase">CPU Core Utilization</div>
              <div className="font-mono text-xl font-bold text-tactical-green mt-1">
                {deviceResources.cpuUsagePercent}%
              </div>
              <div className="font-mono text-[10px] text-text-secondary mt-0.5">Peak Target: &lt; 25%</div>
            </div>

            <div className="p-3 bg-bg-primary border border-border-subtle tactical-corner">
              <div className="font-mono text-[10px] text-text-secondary uppercase">RAM Allocation</div>
              <div className="font-mono text-xl font-bold text-text-primary mt-1">
                {deviceResources.ramUsageMb} MB
              </div>
              <div className="font-mono text-[10px] text-text-secondary mt-0.5">Budget: {deviceResources.totalRamMb} MB</div>
            </div>

            <div className="p-3 bg-bg-primary border border-border-subtle tactical-corner">
              <div className="font-mono text-[10px] text-text-secondary uppercase">Battery Charge</div>
              <div className="font-mono text-xl font-bold text-tactical-amber mt-1 flex items-center gap-1.5">
                <Battery className="w-4 h-4 text-tactical-amber" />
                {deviceResources.batteryLevelPercent}%
              </div>
              <div className="font-mono text-[10px] text-text-secondary mt-0.5">Field Runtime: ~9.4h</div>
            </div>

            <div className="p-3 bg-bg-primary border border-border-subtle tactical-corner">
              <div className="font-mono text-[10px] text-text-secondary uppercase">Quantized Footprint</div>
              <div className="font-mono text-base font-bold text-tactical-cyan mt-1.5">
                {deviceResources.localModelSizeMb} MB
              </div>
              <div className="font-mono text-[10px] text-tactical-cyan mt-0.5">INT8 Memory Resident</div>
            </div>
          </div>
        </div>
      </div>

      {/* Routing Logic Matrix Table */}
      <div className="telemetry-panel p-5 tactical-corner space-y-3">
        <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-tactical-amber" />
            <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-text-primary">
              Deterministic Cost-Utility Routing Matrix
            </h3>
          </div>
          <span className="font-mono text-[10px] text-text-secondary">AETHER GOVERNOR v1.4</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead>
              <tr className="border-b border-border-subtle text-text-secondary uppercase text-[10px]">
                <th className="py-2 px-3">Rule ID</th>
                <th className="py-2 px-3">Link State</th>
                <th className="py-2 px-3">Latency Criterion</th>
                <th className="py-2 px-3">Loss Criterion</th>
                <th className="py-2 px-3">Battery Floor</th>
                <th className="py-2 px-3">Assigned Route</th>
                <th className="py-2 px-3">Active Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50 text-text-primary">
              <tr className={`hover:bg-bg-elevated/40 ${connectivity === 'STABLE' ? 'bg-tactical-green/10' : ''}`}>
                <td className="py-2 px-3 text-tactical-cyan">RULE_01</td>
                <td className="py-2 px-3">CONNECTED</td>
                <td className="py-2 px-3">&lt; 150 ms</td>
                <td className="py-2 px-3">&lt; 2.0%</td>
                <td className="py-2 px-3">&gt; 15%</td>
                <td className="py-2 px-3 font-bold text-tactical-green">CLOUD_GPU_ENSEMBLE</td>
                <td className="py-2 px-3">
                  {connectivity === 'STABLE' ? (
                    <span className="text-tactical-green font-bold">[ACTIVE]</span>
                  ) : (
                    <span className="text-text-secondary">[STANDBY]</span>
                  )}
                </td>
              </tr>
              <tr className={`hover:bg-bg-elevated/40 ${connectivity === 'DEGRADED' ? 'bg-tactical-amber/10' : ''}`}>
                <td className="py-2 px-3 text-tactical-cyan">RULE_02</td>
                <td className="py-2 px-3">DEGRADED</td>
                <td className="py-2 px-3">&gt;= 150 ms</td>
                <td className="py-2 px-3">&gt;= 2.0%</td>
                <td className="py-2 px-3">&gt; 10%</td>
                <td className="py-2 px-3 font-bold text-tactical-amber">EDGE_INT8_QUANTIZED</td>
                <td className="py-2 px-3">
                  {connectivity === 'DEGRADED' ? (
                    <span className="text-tactical-amber font-bold">[ACTIVE]</span>
                  ) : (
                    <span className="text-text-secondary">[STANDBY]</span>
                  )}
                </td>
              </tr>
              <tr className={`hover:bg-bg-elevated/40 ${connectivity === 'OFFLINE' ? 'bg-tactical-red/10' : ''}`}>
                <td className="py-2 px-3 text-tactical-cyan">RULE_03</td>
                <td className="py-2 px-3">AIR_GAPPED</td>
                <td className="py-2 px-3">Unreachable</td>
                <td className="py-2 px-3">100% Loss</td>
                <td className="py-2 px-3">Any</td>
                <td className="py-2 px-3 font-bold text-tactical-red">LOCAL_OFFLINE_CACHE</td>
                <td className="py-2 px-3">
                  {connectivity === 'OFFLINE' ? (
                    <span className="text-tactical-red font-bold">[ACTIVE]</span>
                  ) : (
                    <span className="text-text-secondary">[STANDBY]</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Execution Pipeline Trace */}
      <div className="telemetry-panel p-5 tactical-corner space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
          <div>
            <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-text-primary flex items-center gap-2">
              <Terminal className="w-4 h-4 text-tactical-amber" />
              Runtime Pipeline Execution Trace
            </h3>
            <p className="text-xs text-text-secondary mt-0.5 font-mono">
              Live sequential trace of adaptive routing under telemetry feedback.
            </p>
          </div>
          <button
            onClick={handleTestInferenceCycle}
            disabled={isSimulatingRequest}
            className="flex items-center gap-1.5 px-4 py-2 bg-tactical-amber text-bg-primary font-heading font-bold text-xs hover:bg-tactical-amber/90 transition-all tactical-corner disabled:opacity-50 self-start sm:self-auto uppercase tracking-wider"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isSimulatingRequest ? 'Executing Routing Cycle...' : 'Test Routing Cycle'}</span>
          </button>
        </div>

        {/* Live Trace Terminal */}
        <div className="p-4 bg-bg-primary border border-border-subtle font-mono text-xs space-y-1.5 text-text-primary tactical-corner">
          <div className="text-[10px] text-text-secondary pb-1 border-b border-border-subtle/50 flex justify-between font-mono">
            <span>// ADAPTIVE CONTROLLER LOG OUTPUT</span>
            <span className="text-tactical-cyan">DETERMINISTIC_DISPATCH</span>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {pipelineTrace.map((line, idx) => (
              <div key={idx} className="leading-relaxed">
                {line.includes('ACTIVE') || line.includes('Nominal') || line.includes('verified') ? (
                  <span className="text-tactical-green">{line}</span>
                ) : line.includes('DEGRADED') || line.includes('TRIGGER') || line.includes('POLICY') ? (
                  <span className="text-tactical-amber">{line}</span>
                ) : line.includes('AIR_GAPPED') || line.includes('DISCONNECTED') ? (
                  <span className="text-tactical-red">{line}</span>
                ) : (
                  <span className="text-text-primary">{line}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};