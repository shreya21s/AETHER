import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts';
import { Activity, Wind, Sliders, TrendingUp, Info } from 'lucide-react';

interface SpirometryFlowLoopVisualizerProps {
  fev1Litres?: number;
  fvcLitres?: number;
  postBdFev1Ratio?: number;
  className?: string;
}

export const SpirometryFlowLoopVisualizer: React.FC<SpirometryFlowLoopVisualizerProps> = ({
  fev1Litres = 2.15,
  fvcLitres = 3.65,
  postBdFev1Ratio,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'FLOW_VOLUME' | 'VOLUME_TIME'>('FLOW_VOLUME');
  const [showPostBd, setShowPostBd] = useState<boolean>(true);

  // Ratio calculation
  const currentRatio = fvcLitres > 0 ? fev1Litres / fvcLitres : 0.68;
  const isObstructed = currentRatio < 0.70;

  // Generate Flow-Volume Loop Data (Flow L/s vs Expired Volume L)
  // Normal curve: Sharp peak expiratory flow (PEF ~ 8.5 L/s), then linear descent to FVC (~4.5L)
  // Obstructed curve: Decreased PEF (~4.8 L/s), rapid concave "scooping" of expiratory limb
  const flowVolumeData = [
    { volume: 0.0, normalFlow: 0.0, patientFlow: 0.0, postBdFlow: 0.0 },
    { volume: 0.3, normalFlow: 7.8, patientFlow: isObstructed ? 4.9 : 7.2, postBdFlow: isObstructed ? 5.8 : 7.4 },
    { volume: 0.6, normalFlow: 8.8, patientFlow: isObstructed ? 5.2 : 8.1, postBdFlow: isObstructed ? 6.4 : 8.3 }, // Peak flow
    { volume: 1.0, normalFlow: 7.9, patientFlow: isObstructed ? 3.4 : 7.2, postBdFlow: isObstructed ? 4.6 : 7.4 }, // FEV1 mark
    { volume: 1.5, normalFlow: 6.5, patientFlow: isObstructed ? 2.1 : 5.8, postBdFlow: isObstructed ? 3.2 : 6.0 },
    { volume: 2.0, normalFlow: 5.1, patientFlow: isObstructed ? 1.4 : 4.6, postBdFlow: isObstructed ? 2.3 : 4.8 },
    { volume: 2.5, normalFlow: 3.9, patientFlow: isObstructed ? 0.9 : 3.4, postBdFlow: isObstructed ? 1.6 : 3.6 },
    { volume: 3.0, normalFlow: 2.7, patientFlow: isObstructed ? 0.5 : 2.3, postBdFlow: isObstructed ? 1.0 : 2.5 },
    { volume: 3.5, normalFlow: 1.6, patientFlow: isObstructed ? 0.2 : 1.2, postBdFlow: isObstructed ? 0.5 : 1.4 },
    { volume: 4.0, normalFlow: 0.6, patientFlow: isObstructed ? 0.0 : 0.4, postBdFlow: isObstructed ? 0.1 : 0.5 },
    { volume: 4.5, normalFlow: 0.0, patientFlow: 0.0, postBdFlow: 0.0 },
  ];

  // Generate Volume-Time Data (Volume L vs Time seconds)
  const volumeTimeData = [
    { time: 0.0, normalVol: 0.0, patientVol: 0.0, postBdVol: 0.0 },
    { time: 0.5, normalVol: 2.6, patientVol: isObstructed ? 1.4 : 2.3, postBdVol: isObstructed ? 1.7 : 2.4 },
    { time: 1.0, normalVol: 3.6, patientVol: isObstructed ? fev1Litres : 3.3, postBdVol: isObstructed ? fev1Litres * 1.15 : 3.4 }, // 1.0 sec = FEV1
    { time: 1.5, normalVol: 4.0, patientVol: isObstructed ? fev1Litres + 0.5 : 3.8, postBdVol: isObstructed ? fev1Litres + 0.7 : 3.9 },
    { time: 2.0, normalVol: 4.2, patientVol: isObstructed ? fev1Litres + 0.8 : 4.1, postBdVol: isObstructed ? fev1Litres + 1.0 : 4.2 },
    { time: 3.0, normalVol: 4.4, patientVol: isObstructed ? fvcLitres * 0.92 : 4.3, postBdVol: isObstructed ? fvcLitres * 0.96 : 4.4 },
    { time: 4.0, normalVol: 4.5, patientVol: isObstructed ? fvcLitres : 4.4, postBdVol: isObstructed ? fvcLitres * 1.02 : 4.5 },
    { time: 6.0, normalVol: 4.5, patientVol: isObstructed ? fvcLitres : 4.5, postBdVol: isObstructed ? fvcLitres * 1.02 : 4.5 },
  ];

  return (
    <div className={`telemetry-panel p-5 tactical-corner bg-[#111622] border-border-subtle relative overflow-hidden font-mono ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-tactical-cyan" />
            <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-text-primary">
              Diagnostic Spirometry Curve Analytics
            </h3>
          </div>
          <span className="text-[10px] text-text-secondary">
            ATS / ERS Standardized Spirometric Flow Loop Modeling
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <button
            onClick={() => setViewMode('FLOW_VOLUME')}
            className={`px-2.5 py-1 border transition-all ${
              viewMode === 'FLOW_VOLUME'
                ? 'bg-tactical-cyan/15 text-tactical-cyan border-tactical-cyan'
                : 'bg-bg-primary text-text-secondary border-border-subtle hover:text-text-primary'
            }`}
          >
            FLOW-VOLUME (L/s vs L)
          </button>
          <button
            onClick={() => setViewMode('VOLUME_TIME')}
            className={`px-2.5 py-1 border transition-all ${
              viewMode === 'VOLUME_TIME'
                ? 'bg-tactical-cyan/15 text-tactical-cyan border-tactical-cyan'
                : 'bg-bg-primary text-text-secondary border-border-subtle hover:text-text-primary'
            }`}
          >
            VOLUME-TIME (FEV1 Curve)
          </button>
          <button
            onClick={() => setShowPostBd(!showPostBd)}
            className={`px-2 py-1 border transition-all ${
              showPostBd
                ? 'bg-tactical-green/15 text-tactical-green border-tactical-green'
                : 'bg-bg-primary text-text-secondary border-border-subtle hover:text-text-primary'
            }`}
          >
            {showPostBd ? '[POST-BD: ON]' : '[POST-BD: OFF]'}
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'FLOW_VOLUME' ? (
            <ComposedChart data={flowVolumeData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" opacity={0.5} />
              <XAxis
                dataKey="volume"
                stroke="#64748B"
                fontSize={10}
                tickFormatter={(v) => `${v.toFixed(1)} L`}
                label={{ value: 'Expired Volume (Litres)', position: 'insideBottom', offset: -10, fill: '#94A3B8', fontSize: 10 }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={10}
                domain={[0, 10]}
                label={{ value: 'Airflow (L/s)', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B0E14', borderColor: '#334155', borderRadius: '0px', fontSize: '11px', fontFamily: 'monospace' }}
                formatter={(val: any, name: any) => [
                  `${Number(val).toFixed(2)} L/s`,
                  name === 'normalFlow' ? 'Predicted Normal LLN' : name === 'patientFlow' ? 'Patient Pre-BD Flow' : 'Patient Post-BD Response',
                ]}
                labelFormatter={(label) => `Volume Expired: ${label} L`}
              />
              <Legend
                wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingTop: '10px' }}
                formatter={(value) => (
                  <span className="text-text-secondary">
                    {value === 'normalFlow' ? 'Normal Reference LLN' : value === 'patientFlow' ? 'Patient Observed (Pre-BD)' : 'Post-Bronchodilator (Post-BD)'}
                  </span>
                )}
              />
              {/* Reference line for FEV1 cut-off volume */}
              <ReferenceLine x={1.0} stroke="#475569" strokeDasharray="2 2" label={{ value: '1.0s Vol', fill: '#64748B', fontSize: 9 }} />
              
              {/* Normal predicted baseline */}
              <Line
                type="monotone"
                dataKey="normalFlow"
                stroke="#06B6D4"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                name="normalFlow"
              />

              {/* Observed patient loop */}
              <Area
                type="monotone"
                dataKey="patientFlow"
                stroke={isObstructed ? '#F59E0B' : '#22C55E'}
                fill={isObstructed ? '#F59E0B' : '#22C55E'}
                fillOpacity={0.15}
                strokeWidth={2.5}
                name="patientFlow"
              />

              {/* Post-BD Response */}
              {showPostBd && (
                <Line
                  type="monotone"
                  dataKey="postBdFlow"
                  stroke="#22C55E"
                  strokeWidth={2}
                  strokeDasharray="2 2"
                  dot={false}
                  name="postBdFlow"
                />
              )}
            </ComposedChart>
          ) : (
            <ComposedChart data={volumeTimeData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" opacity={0.5} />
              <XAxis
                dataKey="time"
                stroke="#64748B"
                fontSize={10}
                tickFormatter={(v) => `${v}s`}
                label={{ value: 'Expiratory Time (seconds)', position: 'insideBottom', offset: -10, fill: '#94A3B8', fontSize: 10 }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={10}
                domain={[0, 5]}
                label={{ value: 'Volume (Litres)', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B0E14', borderColor: '#334155', borderRadius: '0px', fontSize: '11px', fontFamily: 'monospace' }}
                formatter={(val: any, name: any) => [
                  `${Number(val).toFixed(2)} L`,
                  name === 'normalVol' ? 'Predicted Normal LLN' : name === 'patientVol' ? 'Patient Observed Vol' : 'Post-BD Volume',
                ]}
                labelFormatter={(label) => `Time: ${label} sec`}
              />
              <Legend
                wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingTop: '10px' }}
                formatter={(value) => (
                  <span className="text-text-secondary">
                    {value === 'normalVol' ? 'Normal Volume Curve' : value === 'patientVol' ? 'Patient Observed (FEV1)' : 'Post-BD Volume'}
                  </span>
                )}
              />
              <ReferenceLine x={1.0} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: 'FEV1 Threshold (1.0s)', fill: '#F59E0B', fontSize: 9 }} />
              
              <Line
                type="monotone"
                dataKey="normalVol"
                stroke="#06B6D4"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                name="normalVol"
              />

              <Area
                type="monotone"
                dataKey="patientVol"
                stroke={isObstructed ? '#F59E0B' : '#22C55E'}
                fill={isObstructed ? '#F59E0B' : '#22C55E'}
                fillOpacity={0.15}
                strokeWidth={2.5}
                name="patientVol"
              />

              {showPostBd && (
                <Line
                  type="monotone"
                  dataKey="postBdVol"
                  stroke="#22C55E"
                  strokeWidth={2}
                  strokeDasharray="2 2"
                  dot={false}
                  name="postBdVol"
                />
              )}
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Clinical Interpretation Footer */}
      <div className="mt-3 pt-2.5 border-t border-border-subtle/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="text-text-secondary">CURVE INTERPRETATION:</span>
          <span className={`font-bold ${isObstructed ? 'text-tactical-amber' : 'text-tactical-green'}`}>
            {isObstructed
              ? 'SCOOPED EXHALATION // CONCAVE EXPIRATORY LIMB (OBSTRUCTIVE LIMITATION)'
              : 'LINEAR EXPIRATORY TRAJECTORY // NORMAL LUNG ELASTIC RECOIL'}
          </span>
        </div>
        <div className="text-text-secondary text-[10px]">
          FEV1: <span className="text-text-primary font-bold">{fev1Litres}L</span> | FVC: <span className="text-text-primary font-bold">{fvcLitres}L</span> | Ratio: <span className={`font-bold ${isObstructed ? 'text-tactical-amber' : 'text-tactical-green'}`}>{currentRatio.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};