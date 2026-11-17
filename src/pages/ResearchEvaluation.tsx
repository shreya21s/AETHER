import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  BarChart2, 
  LineChart, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  Database,
  ArrowRight,
  TrendingUp,
  Sliders,
  Scale,
  FlaskConical,
  Terminal
} from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ModuleStatus } from '@/types';

interface ExperimentProtocol {
  id: number;
  title: string;
  category: string;
  status: ModuleStatus;
  objective: string;
  metrics: string[];
  requiredData: string;
  expectedOutput: string;
  hypothesizedBenefit: string;
}

export const ResearchEvaluation: React.FC = () => {
  const [selectedExperimentId, setSelectedExperimentId] = useState<number>(1);

  const experiments: ExperimentProtocol[] = [
    {
      id: 1,
      title: 'Baseline ML Model Evaluation',
      category: 'Predictive Modeling',
      status: 'IN_DEVELOPMENT',
      objective: 'Evaluate tree-based ensembles (XGBoost, LightGBM, Random Forest) vs baseline logistic regression on NHANES spirometry cohort.',
      metrics: ['AUROC', 'F1-Score', 'Sensitivity (Recall)', 'Specificity', 'Brier Score'],
      requiredData: 'NHANES 2007–2012 Spirometry Exam examination files (~11,000 subjects).',
      expectedOutput: 'Receiver Operating Characteristic (ROC) curves and Precision-Recall frontiers across 5-fold cross-validation.',
      hypothesizedBenefit: 'Establishes achievable discrimination upper-bound before compression.',
    },
    {
      id: 2,
      title: 'Model Quantization & Compression',
      category: 'Edge Computing',
      status: 'IN_DEVELOPMENT',
      objective: 'Quantize baseline ensembles from FP32 to INT8 and evaluate degradation in discrimination vs memory savings.',
      metrics: ['Memory Footprint (MB)', 'Quantization Error Delta', 'Delta AUROC (< 0.01 target)', 'Inference Speedup'],
      requiredData: 'Trained baseline models and representative calibration subset.',
      expectedOutput: 'Pareto frontier comparing model parameter reduction against risk classification fidelity.',
      hypothesizedBenefit: '> 85% reduction in model size with negligible clinical degradation.',
    },
    {
      id: 3,
      title: 'Cloud vs Edge vs Offline Comparative Benchmark',
      category: 'Distributed Systems',
      status: 'IN_DEVELOPMENT',
      objective: 'Compare execution latency, resource overhead, and concordance of screening decisions across the three execution tiers.',
      metrics: ['Execution Latency (ms)', 'RAM Footprint', 'Decision Agreement (Cohen Kappa)', 'Battery Drain (mAh)'],
      requiredData: 'Synthetic test cohort evaluated across Cloud, Edge, and Offline nodes.',
      expectedOutput: 'Latency breakdown charts and concordance correlation matrices.',
      hypothesizedBenefit: 'Demonstrates functional parity between edge and cloud for frontline triage.',
    },
    {
      id: 4,
      title: 'Network-Condition Sensitivity Experiments',
      category: 'Fault Tolerance',
      status: 'PLANNED',
      objective: 'Inject simulated latency (100ms-2000ms) and packet drop (0%-40%) to evaluate adaptive controller switching stability.',
      metrics: ['Failover Switching Time (ms)', 'Request Timeout Rate', 'Drop Recovery Ratio', 'Bandwidth Consumption'],
      requiredData: 'Simulated WAN link emulator with jitter injection.',
      expectedOutput: 'Timeline traces of automatic execution path shifts under fluctuating network bandwidth.',
      hypothesizedBenefit: 'Zero unhandled timeout failures during acute network drops.',
    },
    {
      id: 5,
      title: 'Uncertainty Calibration Benchmarking',
      category: 'Trustworthy AI',
      status: 'IN_DEVELOPMENT',
      objective: 'Apply Temperature Scaling, Isotonic Regression, and Platt Scaling to calibrate posterior probability distributions.',
      metrics: ['Expected Calibration Error (ECE)', 'Maximum Calibration Error (MCE)', 'Brier Score', 'Reliability Diagram'],
      requiredData: 'Held-out calibration partition from validation split.',
      expectedOutput: 'Reliability curves plotting predicted probability bins against empirical event frequency.',
      hypothesizedBenefit: 'Reduction of ECE to < 5%, preventing overconfident misclassifications.',
    },
    {
      id: 6,
      title: 'Selective Prediction & Risk-Coverage Frontier',
      category: 'Clinical Safety',
      status: 'IN_DEVELOPMENT',
      objective: 'Implement rejection rules based on predictive entropy and evaluate selective risk as coverage decreases.',
      metrics: ['Selective Risk', 'Coverage Level (0.50 - 1.0)', 'Risk-Coverage Curve (RC-Curve)', 'Abstention Precision'],
      requiredData: 'Full evaluation cohort with flagged borderline cases.',
      expectedOutput: 'Risk-Coverage curves demonstrating that selective abstention removes majority of misclassifications.',
      hypothesizedBenefit: 'Drastic reduction in false negative risk on accepted cohort by routing ambiguous cases to clinicians.',
    },
    {
      id: 7,
      title: 'Adaptive Measurement Acquisition Evaluation',
      category: 'Active Learning',
      status: 'IN_DEVELOPMENT',
      objective: 'Evaluate reduction in entropy and change in clinical decision when sequential measurements are acquired.',
      metrics: ['Mutual Information Gain', 'Average Number of Additional Tests', 'Cost-Effectiveness Ratio', 'Decision Flips'],
      requiredData: 'Sub-cohort with post-BD spirometry, SpO2, and symptom scores.',
      expectedOutput: 'Step-wise entropy reduction curves per additional test acquired.',
      hypothesizedBenefit: 'Optimal test recommendation that resolves borderline uncertainty with minimal clinical burden.',
    },
    {
      id: 8,
      title: 'Device Hardware & Thermal Throttling Stress-Test',
      category: 'Edge Computing',
      status: 'PLANNED',
      objective: 'Run continuous inference loops on low-spec Android tablets to measure thermal rise and battery consumption.',
      metrics: ['Battery Discharge Rate (%/hour)', 'CPU Temperature (deg C)', 'Thermal Throttling Frequency', 'Frame Drops'],
      requiredData: 'Physical low-cost Android test devices (ARM Cortex-A53 class).',
      expectedOutput: 'Thermal dissipation curves and 8-hour battery longevity projections.',
      hypothesizedBenefit: 'Guaranteed 8+ hours of continuous field operation on a single battery charge.',
    },
    {
      id: 9,
      title: 'Out-of-Distribution & Subgroup Shift Evaluation',
      category: 'Fairness & Robustness',
      status: 'PLANNED',
      objective: 'Evaluate model performance across distinct demographic subgroups (age > 70, non-smokers with occupational exposure).',
      metrics: ['Demographic Parity', 'Subgroup ECE', 'False Positive Disparity', 'Epistemic Uncertainty Sensitivity'],
      requiredData: 'Stratified demographic NHANES partitions.',
      expectedOutput: 'Disaggregated fairness tables and out-of-distribution detection AUROC.',
      hypothesizedBenefit: 'Validation that the system abstains rather than predicts erroneously on underrepresented cohorts.',
    },
    {
      id: 10,
      title: 'End-to-End System Evaluation & Field Pilot',
      category: 'Translational Medicine',
      status: 'PLANNED',
      objective: 'Simulate full clinic workflow with community health workers: offline intake, inference, and deferred cloud sync.',
      metrics: ['Task Completion Time (min)', 'Clinician Usability Score (SUS)', 'Sync Reconciliation Accuracy', 'User Error Rate'],
      requiredData: 'Simulated primary health center pilot scenario.',
      expectedOutput: 'System usability scores and multi-center field feasibility report.',
      hypothesizedBenefit: 'Validated end-to-end clinical workflow viable in low-resource clinics.',
    },
  ];

  const activeExp = experiments.find((e) => e.id === selectedExperimentId) || experiments[0];

  return (
    <div className="space-y-6">
      <SectionHeader
        moduleNumber={9}
        categoryTag="Academic Research & Evaluation"
        title="Research Evaluation &amp; Experimental Protocols"
        description="Structured academic research dashboard covering 10 experimental protocols. Formal statistical metrics for model calibration, selective prediction, and edge computing efficiency."
        status="IN_DEVELOPMENT"
        actions={
          <div className="flex items-center gap-2 font-mono text-xs text-tactical-amber bg-tactical-amber/10 px-3 py-1.5 border border-tactical-amber/30 tactical-corner">
            <FlaskConical className="w-3.5 h-3.5 text-tactical-amber" />
            <span>[10_PROTOCOLS_STAGED]</span>
          </div>
        }
      />

      {/* Academic Scientific Disclaimer */}
      <div className="p-4 telemetry-panel border-l-4 border-l-tactical-cyan tactical-corner text-xs text-text-secondary flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-tactical-cyan shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-mono text-[10px] text-tactical-cyan uppercase font-bold tracking-wider">
            [PROTOCOL_TRANSPARENCY] // Scientific Integrity
          </span>
          <p className="leading-relaxed font-mono text-text-primary">
            AETHER establishes formal methodology planned for NHANES 2007–2012 feasibility testing and academic peer-reviewed publication.
          </p>
        </div>
      </div>

      {/* Experiment Selector List + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 10 Protocols List */}
        <div className="lg:col-span-5 space-y-2">
          <div className="text-xs font-mono text-text-secondary pb-1 flex justify-between">
            <span>RESEARCH PROTOCOLS (10)</span>
            <span>ACADEMIC PIPELINE</span>
          </div>

          <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
            {experiments.map((exp) => {
              const isSelected = selectedExperimentId === exp.id;

              return (
                <button
                  key={exp.id}
                  onClick={() => setSelectedExperimentId(exp.id)}
                  className={`w-full telemetry-panel p-3 text-left transition-all flex items-center justify-between gap-2 tactical-corner ${
                    isSelected
                      ? 'border-tactical-amber bg-tactical-amber/10 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                      : 'hover:border-border-subtle/80 opacity-80'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-tactical-cyan font-bold">
                        P{String(exp.id).padStart(2, '0')}
                      </span>
                      <h4 className="font-heading font-bold text-xs text-text-primary truncate">
                        {exp.title}
                      </h4>
                    </div>
                    <p className="font-mono text-[10px] text-text-secondary truncate mt-0.5">
                      {exp.category}
                    </p>
                  </div>

                  <StatusBadge status={exp.status} size="sm" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Protocol Detailed Specification */}
        <div className="lg:col-span-7">
          <div className="telemetry-panel p-5 space-y-4 sticky top-20 tactical-corner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
              <div>
                <span className="font-mono text-xs text-tactical-amber uppercase font-bold">
                  [PROTOCOL_{String(activeExp.id).padStart(2, '0')}] // {activeExp.category.toUpperCase()}
                </span>
                <h3 className="font-heading font-bold text-base text-text-primary mt-0.5">
                  {activeExp.title}
                </h3>
              </div>
              <StatusBadge status={activeExp.status} size="sm" />
            </div>

            {/* Objective */}
            <div className="space-y-1">
              <span className="font-mono text-[10px] text-text-secondary uppercase">
                Research Objective:
              </span>
              <p className="text-xs text-text-primary leading-relaxed bg-bg-primary p-3 border border-border-subtle tactical-corner font-mono">
                {activeExp.objective}
              </p>
            </div>

            {/* Metrics */}
            <div className="space-y-1.5">
              <span className="font-mono text-[10px] text-text-secondary uppercase">
                Target Evaluation Metrics:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeExp.metrics.map((m, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-xs px-2.5 py-1 bg-bg-primary text-tactical-cyan border border-tactical-cyan/25 font-medium"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Data & Output Requirements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-bg-primary border border-border-subtle tactical-corner space-y-1">
                <span className="text-[10px] text-text-secondary uppercase font-bold block">
                  Required Cohort:
                </span>
                <p className="text-text-primary text-[11px]">{activeExp.requiredData}</p>
              </div>

              <div className="p-3 bg-bg-primary border border-border-subtle tactical-corner space-y-1">
                <span className="text-[10px] text-text-secondary uppercase font-bold block">
                  Expected Output:
                </span>
                <p className="text-text-primary text-[11px]">{activeExp.expectedOutput}</p>
              </div>
            </div>

            {/* Hypothesized Benefit */}
            <div className="p-3 bg-bg-primary border border-tactical-green/30 tactical-corner text-xs font-mono space-y-1">
              <span className="text-[10px] text-tactical-green uppercase font-bold block">
                Hypothesized Clinical / Technical Advance:
              </span>
              <p className="text-text-primary">{activeExp.hypothesizedBenefit}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};