import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { Activity, Signal, Zap, Clock } from 'lucide-react';
import { ConnectivityMode } from '@/types';

interface NetworkPerformanceChartProps {
  connectivity: ConnectivityMode;
  className?: string;
}

export const NetworkPerformanceChart: React.FC<NetworkPerformanceChartProps> = ({
  connectivity,
  className = '',
}) => {
  const [metricTab, setMetricTab] = useState<'LATENCY' | 'PACKET_LOSS' | 'TIER_COMPARISON'>('LATENCY');

  // Time-series data under different network conditions
  const generateTelemetryTimeSeries = () => {
    const points = [];
    const baseLatency = connectivity === 'STABLE' ? 38 : connectivity === 'DEGRADED' ? 480 : 0;
    const baseLoss = connectivity === 'STABLE' ? 0.2 : connectivity === 'DEGRADED' ? 18.5 : 100;
    
    for (let i = 0; i <= 20; i++) {
      const timeLabel = `-${20 - i}s`;
      const jitter = connectivity === 'STABLE' ? (Math.random() * 8 - 4) : connectivity === 'DEGRADED' ? (Math.random() * 120 - 60) : 0;
      const lossJitter = connectivity === 'STABLE' ? (Math.random() * 0.3) : connectivity === 'DEGRADED' ? (Math.random() * 8 - 4) : 0;

      points.push({
        time: timeLabel,
        latency: Math.max(0, Math.round(baseLatency + jitter)),
        packetLoss: Math.max(0, Math.min(100, parseFloat((baseLoss + lossJitter).toFixed(1)))),
        threshold: 150, // Edge Failover threshold
      });
    }
    return points;
  };

  const timeSeriesData = generateTelemetryTimeSeries();

  // Cross-Tier comparative execution benchmarks
  const tierComparisonData = [
    { metric: 'Latency (ms)', cloud: 210, edge: 26, offline: 22 },
    { metric: 'RAM Footprint (MB)', cloud: 512, edge: 38, offline: 34 },
    { metric: 'Model Size (MB)', cloud: 142.5, edge: 11.8, offline: 11.8 },
    { metric: 'Failure Risk (%)', cloud: connectivity === 'OFFLINE' ? 100 : connectivity === 'DEGRADED' ? 24 : 1, edge: 0.1, offline: 0.0 },
  ];

  return (
    <div className={`telemetry-panel p-5 tactical-corner bg-[#111622] border-border-subtle relative overflow-hidden font-mono ${className}`}>
      {/* Header with Metric Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Signal className="w-4 h-4 text-tactical-cyan" />
            <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-text-primary">
              Network Telemetry &amp; Failover Performance
            </h3>
          </div>
          <span className="text-[10px] text-text-secondary">
            Continuous WAN Link Monitoring &amp; Dynamic Controller Dispatch
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px]">
          <button
            onClick={() => setMetricTab('LATENCY')}
            className={`px-2.5 py-1 border transition-all ${
              metricTab === 'LATENCY'
                ? 'bg-tactical-cyan/15 text-tactical-cyan border-tactical-cyan'
                : 'bg-bg-primary text-text-secondary border-border-subtle hover:text-text-primary'
            }`}
          >
            LATENCY OVER TIME
          </button>
          <button
            onClick={() => setMetricTab('PACKET_LOSS')}
            className={`px-2.5 py-1 border transition-all ${
              metricTab === 'PACKET_LOSS'
                ? 'bg-tactical-amber/15 text-tactical-amber border-tactical-amber'
                : 'bg-bg-primary text-text-secondary border-border-subtle hover:text-text-primary'
            }`}
          >
            PACKET DROP RATIO
          </button>
          <button
            onClick={() => setMetricTab('TIER_COMPARISON')}
            className={`px-2.5 py-1 border transition-all ${
              metricTab === 'TIER_COMPARISON'
                ? 'bg-tactical-green/15 text-tactical-green border-tactical-green'
                : 'bg-bg-primary text-text-secondary border-border-subtle hover:text-text-primary'
            }`}
          >
            CLOUD VS EDGE BENCHMARK
          </button>
        </div>
      </div>

      {/* Main Chart Stage */}
      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {metricTab === 'LATENCY' ? (
            <AreaChart data={timeSeriesData} margin={{ top: 10, right: 20, bottom: 15, left: 10 }}>
              <defs>
                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={connectivity === 'STABLE' ? '#06B6D4' : '#F59E0B'} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={connectivity === 'STABLE' ? '#06B6D4' : '#F59E0B'} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" opacity={0.5} />
              <XAxis dataKey="time" stroke="#64748B" fontSize={10} />
              <YAxis
                stroke="#64748B"
                fontSize={10}
                label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B0E14', borderColor: '#334155', borderRadius: '0px', fontSize: '11px' }}
                formatter={(value: any) => [`${value} ms`, 'Round-Trip Latency']}
                labelFormatter={(label) => `Time Offset: ${label}`}
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              <ReferenceLine y={150} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'Edge Failover Threshold (150ms)', fill: '#EF4444', fontSize: 9 }} />
              <Area
                type="monotone"
                dataKey="latency"
                stroke={connectivity === 'STABLE' ? '#06B6D4' : '#F59E0B'}
                fill="url(#latencyGradient)"
                strokeWidth={2}
                name="WAN Round-Trip Latency"
              />
            </AreaChart>
          ) : metricTab === 'PACKET_LOSS' ? (
            <BarChart data={timeSeriesData} margin={{ top: 10, right: 20, bottom: 15, left: 10 }}>
              <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" opacity={0.5} />
              <XAxis dataKey="time" stroke="#64748B" fontSize={10} />
              <YAxis
                stroke="#64748B"
                fontSize={10}
                domain={[0, 100]}
                label={{ value: 'Packet Loss (%)', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B0E14', borderColor: '#334155', borderRadius: '0px', fontSize: '11px' }}
                formatter={(value: any) => [`${value}%`, 'Packet Loss Ratio']}
                labelFormatter={(label) => `Time Offset: ${label}`}
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              <ReferenceLine y={5} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: 'Safe Boundary (5%)', fill: '#F59E0B', fontSize: 9 }} />
              <Bar
                dataKey="packetLoss"
                fill={connectivity === 'OFFLINE' ? '#EF4444' : connectivity === 'DEGRADED' ? '#F59E0B' : '#22C55E'}
                name="Packet Drop Ratio (%)"
              />
            </BarChart>
          ) : (
            <BarChart data={tierComparisonData} margin={{ top: 10, right: 20, bottom: 15, left: 10 }}>
              <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" opacity={0.5} />
              <XAxis dataKey="metric" stroke="#64748B" fontSize={10} />
              <YAxis stroke="#64748B" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B0E14', borderColor: '#334155', borderRadius: '0px', fontSize: '11px' }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              <Bar dataKey="cloud" fill="#06B6D4" name="Cloud GPU Cluster (FP32)" />
              <Bar dataKey="edge" fill="#22C55E" name="Edge Mobile Runtime (INT8)" />
              <Bar dataKey="offline" fill="#F59E0B" name="Offline Air-Gapped Cache" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Footer */}
      <div className="mt-3 pt-2 border-t border-border-subtle/60 flex flex-wrap items-center justify-between gap-2 text-[10px] text-text-secondary">
        <div>
          ROUTING GOVERNOR POLICY: <span className="text-tactical-cyan font-bold">Latency &lt; 150ms ? CLOUD : EDGE_QUANTIZED</span>
        </div>
        <div>
          ACTIVE ROUTE: <span className="text-tactical-green font-bold">[{connectivity === 'STABLE' ? 'CLOUD_GPU' : connectivity === 'DEGRADED' ? 'EDGE_INT8' : 'LOCAL_CACHE'}]</span>
        </div>
      </div>
    </div>
  );
};