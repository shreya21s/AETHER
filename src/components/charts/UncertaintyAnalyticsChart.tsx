import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ReferenceLine,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { ShieldAlert, HelpCircle, Activity, Scale, Compass } from 'lucide-react';

interface UncertaintyAnalyticsChartProps {
  className?: string;
}

export const UncertaintyAnalyticsChart: React.FC<UncertaintyAnalyticsChartProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'ENTROPY_DIST' | 'TRIAGE_SPLIT' | 'DECOMPOSITION'>('ENTROPY_DIST');

  // Predictive Entropy H(p) distribution across cohort
  const entropyDistributionData = [
    { bin: '0.00 - 0.10', count: 1840, category: 'LOW', label: 'Definite Normal / Obstructed' },
    { bin: '0.10 - 0.20', count: 1420, category: 'LOW', label: 'High Confidence' },
    { bin: '0.20 - 0.30', count: 980, category: 'LOW', label: 'Nominal Evidence' },
    { bin: '0.30 - 0.40', count: 640, category: 'MODERATE', label: 'Slight Boundary Ambiguity' },
    { bin: '0.40 - 0.50', count: 480, category: 'MODERATE', label: 'Borderline Cut-Off (0.70)' },
    { bin: '0.50 - 0.60', count: 320, category: 'HIGH', label: 'Active Acquisition Required' },
    { bin: '0.60 - 0.70', count: 210, category: 'HIGH', label: 'High Epistemic Variance' },
    { bin: '0.70 - 0.85', count: 140, category: 'CRITICAL', label: 'Severe Out-of-Domain Risk' },
    { bin: '0.85 - 1.00', count: 85, category: 'CRITICAL', label: 'Mandatory Human Abstention' },
  ];

  // 3-Way Triage Allocation
  const triageSplitData = [
    { name: 'PREDICT (Autonomous)', count: 4240, percentage: 76.5, fill: '#22C55E' },
    { name: 'REQUEST (Active VoI)', count: 820, percentage: 14.8, fill: '#F59E0B' },
    { name: 'ABSTAIN (Physician Escalation)', count: 480, percentage: 8.7, fill: '#EF4444' },
  ];

  // Epistemic vs Aleatoric Uncertainty across key Archetypes
  const decompositionData = [
    { archetype: 'Archetype 1: Severe Limitation', epistemic: 0.08, aleatoric: 0.14, total: 0.22, decision: 'PREDICT' },
    { archetype: 'Archetype 2: Healthy Preserved', epistemic: 0.06, aleatoric: 0.11, total: 0.17, decision: 'PREDICT' },
    { archetype: 'Archetype 3: Borderline (0.69)', epistemic: 0.18, aleatoric: 0.38, total: 0.56, decision: 'REQUEST' },
    { archetype: 'Archetype 4: Atypical Restriction', epistemic: 0.68, aleatoric: 0.21, total: 0.89, decision: 'ABSTAIN' },
    { archetype: 'Archetype 5: Extreme Elderly (>85)', epistemic: 0.52, aleatoric: 0.29, total: 0.81, decision: 'ABSTAIN' },
  ];

  return (
    <div className={`telemetry-panel p-5 tactical-corner bg-[#111622] border-border-subtle relative overflow-hidden font-mono ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-tactical-amber" />
            <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-text-primary">
              Uncertainty Quantification &amp; Abstention Engine
            </h3>
          </div>
          <span className="text-[10px] text-text-secondary">
            Predictive Entropy Decomposition &amp; Selective Classification Allocation
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px]">
          <button
            onClick={() => setActiveTab('ENTROPY_DIST')}
            className={`px-2.5 py-1 border transition-all ${
              activeTab === 'ENTROPY_DIST'
                ? 'bg-tactical-amber/15 text-tactical-amber border-tactical-amber'
                : 'bg-bg-primary text-text-secondary border-border-subtle hover:text-text-primary'
            }`}
          >
            ENTROPY HISTOGRAM
          </button>
          <button
            onClick={() => setActiveTab('TRIAGE_SPLIT')}
            className={`px-2.5 py-1 border transition-all ${
              activeTab === 'TRIAGE_SPLIT'
                ? 'bg-tactical-green/15 text-tactical-green border-tactical-green'
                : 'bg-bg-primary text-text-secondary border-border-subtle hover:text-text-primary'
            }`}
          >
            TRIAGE RATIOS (76.5 / 14.8 / 8.7)
          </button>
          <button
            onClick={() => setActiveTab('DECOMPOSITION')}
            className={`px-2.5 py-1 border transition-all ${
              activeTab === 'DECOMPOSITION'
                ? 'bg-tactical-cyan/15 text-tactical-cyan border-tactical-cyan'
                : 'bg-bg-primary text-text-secondary border-border-subtle hover:text-text-primary'
            }`}
          >
            EPISTEMIC VS ALEATORIC
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'ENTROPY_DIST' ? (
            <BarChart data={entropyDistributionData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" opacity={0.5} />
              <XAxis
                dataKey="bin"
                stroke="#64748B"
                fontSize={9}
                label={{ value: 'Shannon Entropy H(p) Bins [0.0 - 1.0]', position: 'insideBottom', offset: -10, fill: '#94A3B8', fontSize: 10 }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={10}
                label={{ value: 'Patient Count', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B0E14', borderColor: '#334155', borderRadius: '0px', fontSize: '11px' }}
                formatter={(val: any, name: any, item: any) => [`${val} patients`, item.payload.label]}
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              <ReferenceLine x="0.40 - 0.50" stroke="#F59E0B" strokeDasharray="3 3" label={{ value: 'Request Threshold', fill: '#F59E0B', fontSize: 9 }} />
              <ReferenceLine x="0.70 - 0.85" stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Abstain Threshold', fill: '#EF4444', fontSize: 9 }} />
              <Bar dataKey="count" name="Patient Distribution">
                {entropyDistributionData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.category === 'LOW'
                        ? '#22C55E'
                        : entry.category === 'MODERATE'
                        ? '#06B6D4'
                        : entry.category === 'HIGH'
                        ? '#F59E0B'
                        : '#EF4444'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          ) : activeTab === 'TRIAGE_SPLIT' ? (
            <BarChart
              layout="vertical"
              data={triageSplitData}
              margin={{ top: 15, right: 30, bottom: 15, left: 140 }}
            >
              <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" opacity={0.5} />
              <XAxis
                type="number"
                stroke="#64748B"
                fontSize={10}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#E5E7EB"
                fontSize={10}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B0E14', borderColor: '#334155', borderRadius: '0px', fontSize: '11px' }}
                formatter={(val: any, name: any, item: any) => [`${val}% (${item.payload.count} records)`, 'Allocation']}
              />
              <Bar dataKey="percentage" name="Triage Proportion (%)">
                {triageSplitData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart
              data={decompositionData}
              margin={{ top: 10, right: 20, bottom: 25, left: 10 }}
            >
              <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" opacity={0.5} />
              <XAxis dataKey="archetype" stroke="#64748B" fontSize={9} angle={-10} textAnchor="end" />
              <YAxis
                stroke="#64748B"
                fontSize={10}
                domain={[0, 1.0]}
                label={{ value: 'Uncertainty Score', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B0E14', borderColor: '#334155', borderRadius: '0px', fontSize: '11px' }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              <Bar dataKey="epistemic" stackId="a" fill="#EF4444" name="Epistemic (Model Out-of-Domain)" />
              <Bar dataKey="aleatoric" stackId="a" fill="#06B6D4" name="Aleatoric (Data Noise)" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Footer */}
      <div className="mt-3 pt-2 border-t border-border-subtle/60 flex flex-wrap items-center justify-between gap-2 text-[10px] text-text-secondary">
        <div>
          SAFETY GATEWAY: <span className="text-tactical-green font-bold">76.5% of cases resolved with high calibration confidence</span>
        </div>
        <div>
          RISK PREVENTION: <span className="text-tactical-amber font-bold">8.7% mandatory physician referral eliminates extreme false negatives</span>
        </div>
      </div>
    </div>
  );
};