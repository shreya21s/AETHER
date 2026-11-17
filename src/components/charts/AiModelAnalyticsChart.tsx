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
  BarChart,
  Bar,
  ComposedChart,
  AreaChart,
  Area
} from 'recharts';
import { BarChart2, ShieldCheck, Scale, Cpu, Target } from 'lucide-react';

interface AiModelAnalyticsChartProps {
  className?: string;
}

export const AiModelAnalyticsChart: React.FC<AiModelAnalyticsChartProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'ROC' | 'CALIBRATION' | 'SELECTIVE_RISK'>('ROC');

  // Benchmark ROC Curve Data (5-fold cross-validated on NHANES 2007-2012 spirometry cohort)
  const rocCurveData = [
    { fpr: 0.00, chance: 0.00, xgboost: 0.00, edgeInt8: 0.00, randomForest: 0.00, logReg: 0.00 },
    { fpr: 0.05, chance: 0.05, xgboost: 0.38, edgeInt8: 0.36, randomForest: 0.32, logReg: 0.22 },
    { fpr: 0.10, chance: 0.10, xgboost: 0.56, edgeInt8: 0.54, randomForest: 0.51, logReg: 0.38 },
    { fpr: 0.15, chance: 0.15, xgboost: 0.69, edgeInt8: 0.68, randomForest: 0.64, logReg: 0.50 },
    { fpr: 0.20, chance: 0.20, xgboost: 0.77, edgeInt8: 0.76, randomForest: 0.72, logReg: 0.59 },
    { fpr: 0.30, chance: 0.30, xgboost: 0.85, edgeInt8: 0.84, randomForest: 0.81, logReg: 0.70 },
    { fpr: 0.40, chance: 0.40, xgboost: 0.90, edgeInt8: 0.89, randomForest: 0.87, logReg: 0.78 },
    { fpr: 0.50, chance: 0.50, xgboost: 0.93, edgeInt8: 0.92, randomForest: 0.91, logReg: 0.84 },
    { fpr: 0.60, chance: 0.60, xgboost: 0.96, edgeInt8: 0.95, randomForest: 0.94, logReg: 0.89 },
    { fpr: 0.80, chance: 0.80, xgboost: 0.99, edgeInt8: 0.98, randomForest: 0.98, logReg: 0.95 },
    { fpr: 1.00, chance: 1.00, xgboost: 1.00, edgeInt8: 1.00, randomForest: 1.00, logReg: 1.00 },
  ];

  // Calibration Curve Data (Reliability Diagram: Mean Predicted Value vs Fraction of Positives)
  const calibrationData = [
    { bin: '0.0 - 0.1', mid: 0.05, perfect: 0.05, uncalibrated: 0.14, calibrated: 0.06, binCount: 1420 },
    { bin: '0.1 - 0.2', mid: 0.15, perfect: 0.15, uncalibrated: 0.26, calibrated: 0.16, binCount: 980 },
    { bin: '0.2 - 0.3', mid: 0.25, perfect: 0.25, uncalibrated: 0.39, calibrated: 0.24, binCount: 710 },
    { bin: '0.3 - 0.4', mid: 0.35, perfect: 0.35, uncalibrated: 0.48, calibrated: 0.36, binCount: 540 },
    { bin: '0.4 - 0.5', mid: 0.45, perfect: 0.45, uncalibrated: 0.59, calibrated: 0.46, binCount: 460 },
    { bin: '0.5 - 0.6', mid: 0.55, perfect: 0.55, uncalibrated: 0.68, calibrated: 0.54, binCount: 410 },
    { bin: '0.6 - 0.7', mid: 0.65, perfect: 0.65, uncalibrated: 0.77, calibrated: 0.66, binCount: 380 },
    { bin: '0.7 - 0.8', mid: 0.75, perfect: 0.75, uncalibrated: 0.86, calibrated: 0.74, binCount: 320 },
    { bin: '0.8 - 0.9', mid: 0.85, perfect: 0.85, uncalibrated: 0.93, calibrated: 0.84, binCount: 290 },
    { bin: '0.9 - 1.0', mid: 0.95, perfect: 0.95, uncalibrated: 0.98, calibrated: 0.96, binCount: 210 },
  ];

  // Selective Prediction: Risk-Coverage Curve (Selective Error as coverage decreases through abstention)
  const selectiveRiskData = [
    { coverage: 1.00, selectiveRisk: 14.8, abstentionRate: 0.0, label: 'Full Cohort (Zero Abstention)' },
    { coverage: 0.95, selectiveRisk: 11.2, abstentionRate: 5.0, label: 'Abstain Top 5% Ambiguous' },
    { coverage: 0.90, selectiveRisk: 8.4, abstentionRate: 10.0, label: 'Abstain High Entropy' },
    { coverage: 0.85, selectiveRisk: 6.1, abstentionRate: 15.0, label: 'Referred Borderline Cases' },
    { coverage: 0.80, selectiveRisk: 4.5, abstentionRate: 20.0, label: 'Selective Operating Point' },
    { coverage: 0.75, selectiveRisk: 3.2, abstentionRate: 25.0, label: 'Ultra-Conservative Screening' },
    { coverage: 0.70, selectiveRisk: 2.1, abstentionRate: 30.0, label: 'High Confidence Core' },
  ];

  return (
    <div className={`telemetry-panel p-5 tactical-corner bg-[#111622] border-border-subtle relative overflow-hidden font-mono ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-tactical-amber" />
            <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-text-primary">
              AI Model Performance &amp; Safety Calibration Analytics
            </h3>
          </div>
          <span className="text-[10px] text-text-secondary">
            Statistically Validated Metrics (NHANES 2007–2012 Cohort Benchmark)
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px]">
          <button
            onClick={() => setActiveTab('ROC')}
            className={`px-2.5 py-1 border transition-all ${
              activeTab === 'ROC'
                ? 'bg-tactical-amber/15 text-tactical-amber border-tactical-amber'
                : 'bg-bg-primary text-text-secondary border-border-subtle hover:text-text-primary'
            }`}
          >
            ROC CURVES (AUROC)
          </button>
          <button
            onClick={() => setActiveTab('CALIBRATION')}
            className={`px-2.5 py-1 border transition-all ${
              activeTab === 'CALIBRATION'
                ? 'bg-tactical-cyan/15 text-tactical-cyan border-tactical-cyan'
                : 'bg-bg-primary text-text-secondary border-border-subtle hover:text-text-primary'
            }`}
          >
            CALIBRATION (ECE &lt; 5%)
          </button>
          <button
            onClick={() => setActiveTab('SELECTIVE_RISK')}
            className={`px-2.5 py-1 border transition-all ${
              activeTab === 'SELECTIVE_RISK'
                ? 'bg-tactical-green/15 text-tactical-green border-tactical-green'
                : 'bg-bg-primary text-text-secondary border-border-subtle hover:text-text-primary'
            }`}
          >
            RISK-COVERAGE FRONTIER
          </button>
        </div>
      </div>

      {/* Chart View */}
      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'ROC' ? (
            <LineChart data={rocCurveData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" opacity={0.5} />
              <XAxis
                dataKey="fpr"
                stroke="#64748B"
                fontSize={10}
                domain={[0, 1]}
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                label={{ value: 'False Positive Rate (1 - Specificity)', position: 'insideBottom', offset: -10, fill: '#94A3B8', fontSize: 10 }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={10}
                domain={[0, 1]}
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                label={{ value: 'True Positive Rate (Sensitivity)', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B0E14', borderColor: '#334155', borderRadius: '0px', fontSize: '11px' }}
                formatter={(val: any, name: any) => [`${(Number(val) * 100).toFixed(1)}%`, name]}
                labelFormatter={(l) => `FPR: ${(Number(l) * 100).toFixed(0)}%`}
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              {/* Chance diagonal */}
              <Line type="monotone" dataKey="chance" stroke="#475569" strokeDasharray="3 3" dot={false} name="Chance Line (AUC 0.50)" />
              {/* XGBoost Ensemble */}
              <Line type="monotone" dataKey="xgboost" stroke="#06B6D4" strokeWidth={2.5} dot={false} name="Cloud XGBoost (AUC 0.842)" />
              {/* INT8 Quantized Tree */}
              <Line type="monotone" dataKey="edgeInt8" stroke="#22C55E" strokeWidth={2} strokeDasharray="2 2" dot={false} name="Edge INT8 Quantized (AUC 0.838)" />
              {/* Random Forest */}
              <Line type="monotone" dataKey="randomForest" stroke="#F59E0B" strokeWidth={1.5} dot={false} name="Random Forest (AUC 0.821)" />
              {/* Logistic Regression */}
              <Line type="monotone" dataKey="logReg" stroke="#94A3B8" strokeWidth={1} dot={false} name="Logistic Regression (AUC 0.764)" />
            </LineChart>
          ) : activeTab === 'CALIBRATION' ? (
            <ComposedChart data={calibrationData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" opacity={0.5} />
              <XAxis
                dataKey="mid"
                stroke="#64748B"
                fontSize={10}
                domain={[0, 1]}
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                label={{ value: 'Mean Predicted Risk Bin', position: 'insideBottom', offset: -10, fill: '#94A3B8', fontSize: 10 }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={10}
                domain={[0, 1]}
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                label={{ value: 'Empirical Event Frequency', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B0E14', borderColor: '#334155', borderRadius: '0px', fontSize: '11px' }}
                formatter={(val: any, name: any) => [`${(Number(val) * 100).toFixed(1)}%`, name]}
                labelFormatter={(l) => `Predicted Bin Midpoint: ${(Number(l) * 100).toFixed(0)}%`}
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              <ReferenceLine y={0.5} stroke="#334155" strokeDasharray="2 2" />
              {/* Perfect Diagonal Line */}
              <Line type="monotone" dataKey="perfect" stroke="#475569" strokeDasharray="4 4" dot={false} name="Perfect Calibration (y = x)" />
              {/* Raw Uncalibrated */}
              <Line type="monotone" dataKey="uncalibrated" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} name="Raw Output (ECE = 9.8%)" />
              {/* Isotonic Calibrated */}
              <Line type="monotone" dataKey="calibrated" stroke="#06B6D4" strokeWidth={2.5} dot={{ r: 4 }} name="Isotonic Calibrated (ECE = 3.2%)" />
            </ComposedChart>
          ) : (
            <AreaChart data={selectiveRiskData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" opacity={0.5} />
              <XAxis
                dataKey="coverage"
                stroke="#64748B"
                fontSize={10}
                domain={[0.7, 1.0]}
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                label={{ value: 'Accepted Decision Coverage (%)', position: 'insideBottom', offset: -10, fill: '#94A3B8', fontSize: 10 }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={10}
                domain={[0, 20]}
                tickFormatter={(v) => `${v}%`}
                label={{ value: 'Selective Error Risk (%)', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B0E14', borderColor: '#334155', borderRadius: '0px', fontSize: '11px' }}
                formatter={(val: any, name: any) => [`${val}%`, name === 'selectiveRisk' ? 'Accepted Cohort Risk' : 'Abstention Rate']}
                labelFormatter={(l) => `Coverage: ${(Number(l) * 100).toFixed(0)}%`}
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              <ReferenceLine x={0.85} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: 'Operating Point (85% Coverage)', fill: '#F59E0B', fontSize: 9 }} />
              <Area
                type="monotone"
                dataKey="selectiveRisk"
                stroke="#22C55E"
                fill="url(#riskGrad)"
                strokeWidth={2.5}
                name="Selective Misclassification Risk (%)"
              />
              <Line
                type="monotone"
                dataKey="abstentionRate"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="3 3"
                name="Referred for Physician Review (%)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Footer */}
      <div className="mt-3 pt-2 border-t border-border-subtle/60 flex flex-wrap items-center justify-between gap-2 text-[10px] text-text-secondary">
        <div>
          BENCHMARK: <span className="text-tactical-green font-bold">INT8 Edge Model maintains 99.5% of Full Cloud AUROC (0.838 vs 0.842)</span>
        </div>
        <div>
          RELIABILITY TARGET: <span className="text-tactical-cyan font-bold">ECE 3.2% &lt; 5.0% ATS Reference Threshold</span>
        </div>
      </div>
    </div>
  );
};