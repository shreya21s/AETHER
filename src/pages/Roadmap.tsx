import React from 'react';
import { 
  Milestone, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Calendar, 
  Layers, 
  Cpu, 
  FileText,
  Sparkles,
  GitBranch,
  Terminal,
  Flag
} from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { RoadmapPhase } from '@/types';

export const Roadmap: React.FC = () => {
  const phases: RoadmapPhase[] = [
    {
      phaseNumber: 1,
      title: 'Clinical Use-Case & Dataset Feasibility Audit',
      status: 'IMPLEMENTED',
      timeframe: 'Phase 1 (Completed Audit)',
      objective: 'Select respiratory airflow-obstruction screening as primary research use-case and conduct formal data quality audit on NHANES 2007–2012 spirometry files.',
      technologies: ['NHANES SAS/XPT files', 'Python pandas', 'ATS/ERS Spirometry Standards'],
      dependencies: ['Public CDC NHANES Repository'],
      completionCriteria: [
        'Identify valid spirometry grade A/B quality exams',
        'Map candidate demographics, symptoms, and exposure features',
        'Establish exclusion criteria for pre-existing tracheostomies or acute distress',
      ],
      clinicalSignificance: 'Ensures model training is anchored on rigorous physiological definitions rather than unverified synthetic targets.',
    },
    {
      phaseNumber: 2,
      title: 'Baseline Machine Learning Predictive Models',
      status: 'IMPLEMENTED',
      timeframe: 'Phase 2 (Completed Baseline)',
      objective: 'Develop supervised baseline models (logistic regression, gradient-boosted decision trees, random forests) to predict airflow limitation.',
      technologies: ['Scikit-learn', 'XGBoost', 'LightGBM', 'Python 3.11'],
      dependencies: ['Phase 1 Dataset Partition'],
      completionCriteria: [
        '5-fold cross-validated AUROC >= 0.82 on test cohort',
        'SHAP feature importance analysis confirming FEV1/FVC and pack-years primacy',
        'Deterministic inference pipeline contract',
      ],
      clinicalSignificance: 'Provides the empirical performance benchmark against which edge compressed models are evaluated.',
    },
    {
      phaseNumber: 3,
      title: 'Model Quantization & Mobile Compression',
      status: 'IN_DEVELOPMENT',
      timeframe: 'Phase 3 (Active Engineering)',
      objective: 'Compress baseline tree models and neural tabulators to INT8 representations to run within mobile CPU constraints.',
      technologies: ['ONNX Runtime', 'TFLite Micro', 'Treelite Compiler', 'Fixed-point INT8'],
      dependencies: ['Phase 2 Trained Models'],
      completionCriteria: [
        'Total model weight payload < 15MB',
        'Quantization AUROC degradation <= 0.005',
        'Sub-30ms inference on ARM mobile processor',
      ],
      clinicalSignificance: 'Allows complex clinical AI to execute smoothly on inexpensive clinic tablets without freezing the OS.',
    },
    {
      phaseNumber: 4,
      title: 'Offline Mobile & Edge Inference Runtime',
      status: 'IMPLEMENTED',
      timeframe: 'Phase 4 (Engine Complete)',
      objective: 'Build client-side edge execution environment capable of evaluating screening models in total isolation from the internet.',
      technologies: ['React 19', 'WebAssembly / JS Runtime', 'Progressive Web App (PWA)', 'Service Workers'],
      dependencies: ['Phase 3 Quantized Weights'],
      completionCriteria: [
        'Zero network requests required during screening evaluation',
        'Deterministic local evaluation verified against cloud benchmark',
        'Instantaneous UI response under complete air-gap disconnect',
      ],
      clinicalSignificance: 'Guarantees that front-line workers in remote villages can screen patients even with zero cellular signal.',
    },
    {
      phaseNumber: 5,
      title: 'Cloud Inference & FastAPI Gateway Microservice',
      status: 'PLANNED',
      timeframe: 'Phase 5 (Scheduled)',
      objective: 'Deploy high-throughput cloud inference microservice for centralized clinics with broadband access.',
      technologies: ['FastAPI', 'Docker', 'Kubernetes', 'NVIDIA Triton Inference Server'],
      dependencies: ['Phase 2 Full Ensemble Models'],
      completionCriteria: [
        'Standardized REST & gRPC endpoint contracts',
        'Sub-150ms remote API response time',
        'End-to-end TLS 1.3 encryption for patient feature payloads',
      ],
      clinicalSignificance: 'Enables regional hub hospitals to leverage deep ensemble capacity when connectivity is present.',
    },
    {
      phaseNumber: 6,
      title: 'Adaptive Inference Controller (WHERE Engine)',
      status: 'IMPLEMENTED',
      timeframe: 'Phase 6 (Completed Engine)',
      objective: 'Implement dynamic runtime controller that senses network health and battery constraints to route requests to Cloud, Edge, or Offline.',
      technologies: ['Telemetry Probing Daemon', 'Cost-Utility Routing Function', 'State Machine'],
      dependencies: ['Phase 4 (Offline) and Phase 5 (Cloud) Contracts'],
      completionCriteria: [
        'Automatic failover switching within 100ms of link degradation',
        'Battery preservation mode triggering compact local models below 20% charge',
        'Zero failed or dropped screening requests',
      ],
      clinicalSignificance: 'Eliminates brittle single-point-of-failure vulnerabilities in fluctuating rural networks.',
    },
    {
      phaseNumber: 7,
      title: 'Uncertainty Quantification & Selective Abstention (WHETHER Engine)',
      status: 'IMPLEMENTED',
      timeframe: 'Phase 7 (Completed Engine)',
      objective: 'Implement conformal prediction and isotonic calibration to enable the AI to abstain and refer ambiguous patients to specialists.',
      technologies: ['Isotonic Regression', 'Platt Scaling', 'Conformal Risk Control', 'Selective Classification'],
      dependencies: ['Phase 2 Probabilistic Outputs'],
      completionCriteria: [
        'Expected Calibration Error (ECE) < 5%',
        '3-way triage outcome: Confirm, Acquire More Data, or Abstain',
        'High-uncertainty cases successfully flagged for human physician audit',
      ],
      clinicalSignificance: 'Guarantees clinical safety by preventing overconfident misclassifications on atypical patient presentations.',
    },
    {
      phaseNumber: 8,
      title: 'Adaptive Measurement Acquisition (WHAT NEXT Engine)',
      status: 'IMPLEMENTED',
      timeframe: 'Phase 8 (Completed Engine)',
      objective: 'Develop sequential value-of-information optimization recommending high-yield follow-up tests (post-BD, FeNO, SpO2) to resolve uncertainty.',
      technologies: ['Mutual Information Estimation', 'Greedy VoI Ranking', 'Clinical Utility Matrix'],
      dependencies: ['Phase 7 Uncertainty Engine'],
      completionCriteria: [
        'Average 35% reduction in predictive entropy upon acquiring top-ranked test',
        'Before-and-after comparison interface demonstrating uncertainty resolution',
        'Zero recommendation of medically contraindicated tests',
      ],
      clinicalSignificance: 'Saves patient travel expenses and clinic resources by requesting only the most informative clinical tests.',
    },
    {
      phaseNumber: 9,
      title: 'Secure Local Storage & Cryptographic Delta Sync',
      status: 'IN_DEVELOPMENT',
      timeframe: 'Phase 9 (Active Development)',
      objective: 'Implement transactional local storage with encrypted differential delta replication when internet connectivity resumes.',
      technologies: ['IndexedDB', 'AES-GCM-256 Web Crypto API', 'Vector Clocks', 'FHIR Resource Sync'],
      dependencies: ['Phase 4 Offline Storage Queue'],
      completionCriteria: [
        'End-to-end client-side encryption of stored records',
        'Automatic background synchronization queue',
        'Deterministic multi-master conflict resolution',
      ],
      clinicalSignificance: 'Ensures remote patient records are preserved securely and merged into national health registries without data loss.',
    },
    {
      phaseNumber: 10,
      title: 'Comprehensive Evaluation & Academic Dissemination',
      status: 'PLANNED',
      timeframe: 'Phase 10 (Target: Q3 2027)',
      objective: 'Execute multi-center offline evaluation experiments and submit research paper to premier digital health and machine learning conferences.',
      technologies: ['LaTeX', 'Academic Benchmark Suite', 'Statistical Significance Testing'],
      dependencies: ['All Preceding Phases'],
      completionCriteria: [
        'Complete 10 experimental protocols documented in Module 9',
        'Demonstrate non-inferiority of edge vs cloud triage under network drops',
        'Peer-reviewed manuscript submission',
      ],
      clinicalSignificance: 'Establishes verified scientific credibility and peer-reviewed validation for deployment in global health settings.',
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        moduleNumber={10}
        categoryTag="Project Trajectory & Milestones"
        title="10-Phase Research &amp; Clinical Roadmap"
        description="Structured milestone trajectory from NHANES dataset feasibility audit to peer-reviewed academic dissemination. Synchronized with actual repository development status."
        status="IMPLEMENTED"
        actions={
          <div className="flex items-center gap-2 font-mono text-xs text-tactical-cyan bg-tactical-cyan/10 px-3 py-1.5 border border-tactical-cyan/30 tactical-corner">
            <Flag className="w-3.5 h-3.5 text-tactical-cyan" />
            <span>[10_PHASES_TRACKED]</span>
          </div>
        }
      />

      {/* Visual Roadmap Stepper */}
      <div className="space-y-4">
        {phases.map((phase) => (
          <div
            key={phase.phaseNumber}
            className={`telemetry-panel p-5 relative overflow-hidden transition-all tactical-corner ${
              phase.status === 'IMPLEMENTED'
                ? 'border-tactical-green/30 bg-bg-card'
                : phase.status === 'IN_DEVELOPMENT'
                ? 'border-tactical-amber/30 bg-bg-card'
                : 'border-border-subtle bg-bg-card/60 opacity-80'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border-subtle pb-3">
              <div className="flex items-center gap-3">
                <span className={`flex items-center justify-center w-7 h-7 font-mono font-bold text-xs border ${
                  phase.status === 'IMPLEMENTED'
                    ? 'bg-tactical-green/10 text-tactical-green border-tactical-green/40'
                    : phase.status === 'IN_DEVELOPMENT'
                    ? 'bg-tactical-amber/10 text-tactical-amber border-tactical-amber/40'
                    : 'bg-slate-500/10 text-slate-400 border-slate-500/40'
                }`}>
                  {String(phase.phaseNumber).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-heading font-bold text-sm sm:text-base text-text-primary">
                    Phase {phase.phaseNumber}: {phase.title}
                  </h3>
                  <div className="font-mono text-[11px] text-text-secondary mt-0.5">
                    {phase.timeframe}
                  </div>
                </div>
              </div>

              <StatusBadge status={phase.status} size="sm" />
            </div>

            {/* Content Details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-3 text-xs font-mono">
              <div className="lg:col-span-6 space-y-2">
                <div>
                  <span className="text-text-secondary text-[10px] uppercase font-bold">Objective:</span>
                  <p className="text-text-primary leading-relaxed mt-0.5">{phase.objective}</p>
                </div>

                <div className="p-2.5 bg-bg-primary border border-border-subtle/80 text-[11px] text-text-secondary tactical-corner">
                  <span className="text-tactical-amber font-bold">Clinical Significance: </span>
                  {phase.clinicalSignificance}
                </div>
              </div>

              <div className="lg:col-span-6 space-y-2">
                <div>
                  <span className="text-text-secondary text-[10px] uppercase font-bold">Completion Criteria:</span>
                  <ul className="space-y-1 text-text-primary mt-1 text-[11px]">
                    {phase.completionCriteria.map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                          phase.status === 'IMPLEMENTED' ? 'text-tactical-green' : 'text-text-secondary'
                        }`} />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-text-secondary">Stack:</span>
                  {phase.technologies.map((t, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 bg-bg-primary text-text-primary border border-border-subtle">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};