import React, { useState } from 'react';
import { 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  BarChart2, 
  Layers, 
  Sliders, 
  Info,
  Scale,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  AlertOctagon,
  Radar,
  Activity
} from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { MetricCard } from '@/components/shared/MetricCard';
import { DecisionOutcome, UncertaintyMetrics } from '@/types';
import { DEMO_PATIENTS } from '@/data/demoPatients';
import { evaluateUncertainty } from '@/services/uncertaintyService';
import { AiModelAnalyticsChart } from '@/components/charts/AiModelAnalyticsChart';
import { UncertaintyAnalyticsChart } from '@/components/charts/UncertaintyAnalyticsChart';

interface UncertaintyIntelligenceProps {
  onNavigate: (route: string) => void;
}

export const UncertaintyIntelligence: React.FC<UncertaintyIntelligenceProps> = ({ onNavigate }) => {
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);

  const testCases = [
    {
      code: 'ARCHETYPE_01 // SUFFICIENT_EVIDENCE',
      title: 'Definite Airflow Limitation',
      subtitle: 'Clear obstructive pattern, calibrated high probability with minimal entropy. Autonomous screening confirmed.',
      patient: DEMO_PATIENTS[0],
      decisionType: 'PREDICT',
      expectedDecision: 'SCREENING_CONFIRMED' as DecisionOutcome,
    },
    {
      code: 'ARCHETYPE_02 // BOUNDARY_AMBIGUITY',
      title: 'Borderline Ratio (FEV1/FVC ~ 0.70)',
      subtitle: 'Ambiguity near standard clinical cut-off. Moderate entropy resolvable via follow-up post-BD spirometry.',
      patient: DEMO_PATIENTS[1],
      decisionType: 'REQUEST',
      expectedDecision: 'ACQUISITION_REQUIRED' as DecisionOutcome,
    },
    {
      code: 'ARCHETYPE_03 // HIGH_EPISTEMIC_RISK',
      title: 'Atypical Restrictive Anomaly',
      subtitle: 'Severely restricted volume with preserved ratio. High epistemic out-of-domain risk triggering abstention.',
      patient: DEMO_PATIENTS[2],
      decisionType: 'ABSTAIN',
      expectedDecision: 'ABSTAIN_REFERRAL' as DecisionOutcome,
    },
  ];

  const currentArchetype = testCases[selectedCaseIndex];
  const metrics: UncertaintyMetrics = evaluateUncertainty(
    currentArchetype.patient,
    currentArchetype.patient.calibratedProbability ?? 0.5
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        moduleNumber={4}
        categoryTag="Trustworthy AI & Calibration"
        title="Uncertainty Intelligence & Selective Abstention (WHETHER Engine)"
        description="Assessing predictive trustworthiness before returning a clinical screening result. Decomposing model epistemic uncertainty from data noise to trigger selective classification and mandatory human physician referral."
        status="IMPLEMENTED"
        actions={
          <div className="flex items-center gap-2 font-mono text-xs text-tactical-amber bg-tactical-amber/10 px-3 py-1.5 border border-tactical-amber/30 tactical-corner">
            <Radar className="w-3.5 h-3.5 animate-spin text-tactical-amber" />
            <span>[CALIBRATION_ACTIVE]</span>
          </div>
        }
      />

      {/* Foundational Principle Callout */}
      <div className="p-4 telemetry-panel border-l-4 border-l-tactical-amber tactical-corner flex items-start gap-3.5">
        <Scale className="w-5 h-5 text-tactical-amber shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-mono text-xs text-tactical-amber uppercase font-bold tracking-wider">
            [CDSS_AXIOM_01] // Core Clinical Safety Principle
          </div>
          <p className="text-xs sm:text-sm text-text-primary leading-relaxed font-mono">
            "High predicted probability does not automatically establish clinical reliability. The system evaluates predictive confidence and epistemic risk before returning an automated screening result."
          </p>
        </div>
      </div>

      {/* 3 Core Decisions Banner: PREDICT vs REQUEST vs ABSTAIN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            key: 'PREDICT',
            code: 'OUTCOME_01',
            label: 'PREDICT',
            sub: 'Sufficient Evidence',
            desc: 'Confidence is high, epistemic uncertainty < 0.35. Safe to issue autonomous clinical screening triage.',
            borderColor: 'border-tactical-green',
            textColor: 'text-tactical-green',
            bgActive: 'bg-tactical-green/10',
            active: currentArchetype.decisionType === 'PREDICT',
          },
          {
            key: 'REQUEST',
            code: 'OUTCOME_02',
            label: 'REQUEST',
            sub: 'Additional Data Needed',
            desc: 'Borderline boundary ambiguity near 0.70 ratio. Active acquisition requested to resolve entropy before deciding.',
            borderColor: 'border-tactical-amber',
            textColor: 'text-tactical-amber',
            bgActive: 'bg-tactical-amber/10',
            active: currentArchetype.decisionType === 'REQUEST',
          },
          {
            key: 'ABSTAIN',
            code: 'OUTCOME_03',
            label: 'ABSTAIN',
            sub: 'Human Review Mandatory',
            desc: 'High epistemic uncertainty (> 0.65) or anomalous pattern. Automatic safety abstention routes patient to pulmonologist.',
            borderColor: 'border-tactical-red',
            textColor: 'text-tactical-red',
            bgActive: 'bg-tactical-red/10',
            active: currentArchetype.decisionType === 'ABSTAIN',
          },
        ].map((dec) => (
          <div
            key={dec.key}
            className={`telemetry-panel p-5 tactical-corner transition-all border ${
              dec.active
                ? `${dec.borderColor} ${dec.bgActive} shadow-[0_0_15px_rgba(255,255,255,0.06)]`
                : 'opacity-70 border-border-subtle'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`font-mono text-xs font-bold tracking-wider ${dec.textColor}`}>
                [{dec.label}]
              </span>
              <span className="font-mono text-[10px] text-text-secondary">
                {dec.code}
              </span>
            </div>
            <div className="font-heading font-bold text-sm text-text-primary mb-1">
              {dec.sub}
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              {dec.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Case Archetype Selector */}
      <div className="telemetry-panel p-5 tactical-corner space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-tactical-cyan" />
            <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-text-primary">
              Clinical Case Demonstration Scenarios
            </h3>
          </div>
          <span className="font-mono text-[11px] text-text-secondary">
            Select an archetype to inspect decision engine logic
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {testCases.map((tc, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCaseIndex(idx)}
              className={`telemetry-panel p-4 text-left transition-all tactical-corner ${
                selectedCaseIndex === idx
                  ? tc.decisionType === 'PREDICT'
                    ? 'border-tactical-green bg-tactical-green/10 shadow-[0_0_12px_rgba(34,197,94,0.15)]'
                    : tc.decisionType === 'REQUEST'
                    ? 'border-tactical-amber bg-tactical-amber/10 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                    : 'border-tactical-red bg-tactical-red/10 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                  : 'hover:border-border-subtle/80 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-text-secondary uppercase">
                  {tc.code.split(' // ')[0]}
                </span>
                <span
                  className={`font-mono text-[10px] px-2 py-0.5 font-bold uppercase border ${
                    tc.decisionType === 'PREDICT'
                      ? 'bg-tactical-green/10 text-tactical-green border-tactical-green/30'
                      : tc.decisionType === 'REQUEST'
                      ? 'bg-tactical-amber/10 text-tactical-amber border-tactical-amber/30'
                      : 'bg-tactical-red/10 text-tactical-red border-tactical-red/30'
                  }`}
                >
                  [{tc.decisionType}]
                </span>
              </div>
              <h4 className="font-heading font-bold text-xs sm:text-sm text-text-primary mb-1">
                {tc.title}
              </h4>
              <p className="text-[11px] text-text-secondary leading-snug line-clamp-2">
                {tc.subtitle}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Uncertainty Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Calibrated Risk"
          value={`${(metrics.calibratedProbability * 100).toFixed(1)}%`}
          subValue={`Raw: ${(metrics.rawProbability * 100).toFixed(1)}%`}
          statusColor={metrics.calibratedProbability > 0.65 ? 'red' : metrics.calibratedProbability > 0.4 ? 'amber' : 'green'}
          badge="Isotonic Calibrated"
        />
        <MetricCard
          label="Predictive Entropy H(p)"
          value={metrics.predictiveEntropy}
          subValue="Normalized [0.00 - 1.00]"
          statusColor={metrics.predictiveEntropy > 0.5 ? 'amber' : 'green'}
          badge="Total Uncertainty"
        />
        <MetricCard
          label="Epistemic Uncertainty"
          value={metrics.epistemicUncertainty}
          subValue="Parameter Variance / OOD"
          statusColor={metrics.epistemicUncertainty > 0.6 ? 'red' : 'cyan'}
          badge="Lack of Knowledge"
        />
        <MetricCard
          label="Aleatoric Uncertainty"
          value={metrics.aleatoricUncertainty}
          subValue="Measurement Noise / Bias"
          statusColor={metrics.aleatoricUncertainty > 0.4 ? 'amber' : 'green'}
          badge="Data Variance"
        />
      </div>

      {/* Interactive AI Model Performance Analytics Charts (ROC, Calibration, Selective Risk) */}
      <AiModelAnalyticsChart />

      {/* Uncertainty Quantification & Abstention Analytics (Entropy Histogram, Triage Split, Epistemic Decomposition) */}
      <UncertaintyAnalyticsChart />

      {/* Technical Panels: Conformal Bounds & Academic Calibration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conformal Prediction */}
        <div className="telemetry-panel p-5 tactical-corner space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-text-primary flex items-center gap-2">
              <Layers className="w-4 h-4 text-tactical-cyan" />
              Conformal Prediction Set (Coverage Guarantees)
            </h3>
            <span className="font-mono text-[10px] text-tactical-cyan bg-tactical-cyan/10 px-2 py-0.5 border border-tactical-cyan/30">
              1 - alpha = 90%
            </span>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed font-mono">
            Conformal prediction outputs a statistically validated prediction set of candidate clinical outcomes with marginal coverage guarantees under exchangeability assumptions.
          </p>

          <div className="p-4 bg-bg-primary border border-border-subtle space-y-3 tactical-corner">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-text-secondary">Prediction Set Candidates:</span>
              <div className="flex items-center gap-1.5">
                {metrics.conformalPredictionSet.map((label, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-tactical-cyan/10 text-tactical-cyan border border-tactical-cyan/30 font-bold uppercase text-[11px]">
                    [{label}]
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-text-secondary">90% Non-Conformity Interval:</span>
              <span className="text-text-primary font-bold">
                [{metrics.confidenceInterval[0].toFixed(2)}, {metrics.confidenceInterval[1].toFixed(2)}]
              </span>
            </div>

            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-text-secondary">Set Ambiguity Status:</span>
              <span className={metrics.conformalPredictionSet.length > 1 ? 'text-tactical-amber font-bold' : 'text-tactical-green font-bold'}>
                {metrics.conformalPredictionSet.length > 1 ? '[MULTI_CLASS_AMBIGUITY]' : '[SINGLETON_DEFINITE_SET]'}
              </span>
            </div>
          </div>
        </div>

        {/* Academic Calibration */}
        <div className="telemetry-panel p-5 tactical-corner space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-text-primary flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-tactical-green" />
              Academic Calibration &amp; Selective Prediction
            </h3>
            <span className="font-mono text-[10px] text-tactical-green bg-tactical-green/10 px-2 py-0.5 border border-tactical-green/30">
              [BENCHMARKED]
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-bg-primary border border-border-subtle tactical-corner">
              <div className="text-[10px] text-text-secondary uppercase">Expected Calibration Error</div>
              <div className="text-lg font-bold text-tactical-green mt-1">{(metrics.expectedCalibrationError * 100).toFixed(1)}%</div>
              <div className="text-[10px] text-tactical-green mt-0.5">ECE &lt; 5% Target Met</div>
            </div>

            <div className="p-3 bg-bg-primary border border-border-subtle tactical-corner">
              <div className="text-[10px] text-text-secondary uppercase">Brier Score</div>
              <div className="text-lg font-bold text-text-primary mt-1">{metrics.brierScore.toFixed(3)}</div>
              <div className="text-[10px] text-text-secondary mt-0.5">Mean Squared Error</div>
            </div>

            <div className="p-3 bg-bg-primary border border-border-subtle tactical-corner">
              <div className="text-[10px] text-text-secondary uppercase">Selective Risk (Accepted)</div>
              <div className="text-lg font-bold text-tactical-cyan mt-1">{(metrics.selectiveRisk * 100).toFixed(1)}%</div>
              <div className="text-[10px] text-text-secondary mt-0.5">Risk on Non-Abstained</div>
            </div>

            <div className="p-3 bg-bg-primary border border-border-subtle tactical-corner">
              <div className="text-[10px] text-text-secondary uppercase">Empirical Coverage</div>
              <div className="text-lg font-bold text-text-primary mt-1">{(metrics.coverageLevel * 100).toFixed(0)}%</div>
              <div className="text-[10px] text-text-secondary mt-0.5">Accepted Triage Ratio</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};