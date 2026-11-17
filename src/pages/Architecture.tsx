import React, { useState } from 'react';
import { 
  Layers, 
  CheckCircle2, 
  Cpu, 
  Cloud, 
  HardDrive, 
  HelpCircle, 
  GitFork, 
  Database, 
  RefreshCw, 
  LayoutDashboard, 
  Filter, 
  UserPlus,
  ArrowRight,
  Terminal,
  Activity
} from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SystemLayerComponent } from '@/types';

export const Architecture: React.FC = () => {
  const [selectedComponentId, setSelectedComponentId] = useState<string>('c3');

  const components: SystemLayerComponent[] = [
    {
      id: 'c1',
      layerNumber: 1,
      layerName: 'Patient Data Intake',
      name: 'Structured Clinical Input Interface',
      status: 'IMPLEMENTED',
      purpose: 'Accepts manual clinician entry of demographics, respiratory symptoms, medical exposures, and spirometry data without hardware IoT overhead.',
      inputs: ['Manual clinician keystrokes', 'Candidate spirometry readings'],
      outputs: ['Validated JSON Patient Record Vector'],
      dependencies: ['Browser runtime / Client device'],
      technologies: ['React 19', 'TypeScript', 'Tailwind CSS', 'Client-side Schema Validation'],
      edgeExecutionCapable: true,
    },
    {
      id: 'c2',
      layerNumber: 2,
      layerName: 'Data Preprocessing',
      name: 'Feature Vector Normalizer & Imputation Filter',
      status: 'IMPLEMENTED',
      purpose: 'Normalizes physiological features against cohort reference bounds, flags missing variables, and computes FEV1/FVC ratios.',
      inputs: ['Raw Patient Record Vector'],
      outputs: ['Clean Standardized Feature Vector (14 features)'],
      dependencies: ['Layer 1 (Data Intake)'],
      technologies: ['Deterministic Feature Pipeline', 'Missing-data indicators'],
      edgeExecutionCapable: true,
    },
    {
      id: 'c3',
      layerNumber: 3,
      layerName: 'Adaptive Inference Controller',
      name: 'Dynamic WHERE Execution Router',
      status: 'IMPLEMENTED',
      purpose: 'Monitors real-time round-trip latency, jitter, packet drop rates, and device battery level to dynamically route queries to Cloud, Edge, or Offline pipelines.',
      inputs: ['Standardized Feature Vector', 'Network Telemetry Probe', 'Battery & RAM State'],
      outputs: ['Execution Route Assignment (Cloud vs Edge vs Offline)'],
      dependencies: ['Layer 2 (Preprocessing)', 'Device Network & Battery Telemetry'],
      technologies: ['Heuristic Rule-Cost Engine', 'Network Telemetry Ping', 'Dynamic Failover Governor'],
      edgeExecutionCapable: true,
    },
    {
      id: 'c4',
      layerNumber: 4,
      layerName: 'Cloud Inference Node',
      name: 'Remote High-Capacity GPU Ensemble',
      status: 'PLANNED',
      purpose: 'Executes high-parameter multi-head tabular attention models and deep gradient boosted ensembles on centralized cloud GPUs.',
      inputs: ['Encrypted Feature Payload via REST/gRPC'],
      outputs: ['Full Model Raw Probability & Feature Shapley Scores'],
      dependencies: ['FastAPI Backend Service', 'Stable Broadband Connection'],
      technologies: ['Python 3.11', 'FastAPI', 'PyTorch / XGBoost', 'CUDA acceleration'],
      edgeExecutionCapable: false,
    },
    {
      id: 'c5',
      layerNumber: 5,
      layerName: 'Edge / Offline Inference Node',
      name: 'Quantized INT8 Local Runtime Engine',
      status: 'IMPLEMENTED',
      purpose: 'Executes compact quantized decision ensembles directly in the local browser / mobile device CPU, requiring zero cloud connectivity.',
      inputs: ['Standardized Feature Vector'],
      outputs: ['Edge Model Raw Probability Vector'],
      dependencies: ['Layer 2 (Preprocessing)'],
      technologies: ['Pre-compiled Quantized Tree Engine', 'WebAssembly / JS Runtime', 'Zero Network Dependencies'],
      edgeExecutionCapable: true,
    },
    {
      id: 'c6',
      layerNumber: 6,
      layerName: 'Uncertainty Engine',
      name: 'Predictive Uncertainty & Calibration Engine',
      status: 'IMPLEMENTED',
      purpose: 'Decomposes model predictions into epistemic uncertainty, aleatoric noise, Shannon entropy, and applies isotonic probability calibration.',
      inputs: ['Raw Model Probability Vector', 'Patient Feature Distance from Training Centroids'],
      outputs: ['Calibrated Probability', 'Epistemic Score', 'Aleatoric Score', 'Conformal Sets'],
      dependencies: ['Layer 4 or Layer 5 Inference Outputs'],
      technologies: ['Isotonic Regression', 'Shannon Entropy Analysis', 'Conformal Prediction Intervals'],
      edgeExecutionCapable: true,
    },
    {
      id: 'c7',
      layerNumber: 7,
      layerName: 'Decision Engine',
      name: 'Selective Classification & Abstention Triage',
      status: 'IMPLEMENTED',
      purpose: 'Executes 3-way triage policy: accepts prediction, requests further clinical data, or triggers mandatory human referral.',
      inputs: ['Calibrated Probability', 'Uncertainty Metrics'],
      outputs: ['Final Triage Decision: Confirmed | Acquisition Needed | Abstain & Refer'],
      dependencies: ['Layer 6 (Uncertainty Engine)'],
      technologies: ['Selective Risk Control Rule', 'Cost-Sensitive Abstention Policy'],
      edgeExecutionCapable: true,
    },
    {
      id: 'c8',
      layerNumber: 8,
      layerName: 'Adaptive Measurement Acquisition',
      name: 'Sequential Value-of-Information (VoI) Optimizer',
      status: 'IMPLEMENTED',
      purpose: 'Evaluates candidate diagnostic tests (Post-BD spirometry, FeNO, SpO2) by expected reduction in predictive entropy relative to clinical cost.',
      inputs: ['Patient Record with Missing Tests', 'Current Predictive Entropy'],
      outputs: ['Ranked Next Test Recommendations with Expected Information Gain'],
      dependencies: ['Layer 6 (Uncertainty Engine)', 'Clinical Test Catalog'],
      technologies: ['Information Gain Estimation', 'Cost-Benefit Utility Function'],
      edgeExecutionCapable: true,
    },
    {
      id: 'c9',
      layerNumber: 9,
      layerName: 'Local Database Store',
      name: 'Encrypted Offline-First Storage',
      status: 'IN_DEVELOPMENT',
      purpose: 'Persists patient screening results and transactional audit logs locally in the browser or mobile sandbox.',
      inputs: ['Completed Assessment Record'],
      outputs: ['Local Persistent State', 'Delta Queue for Sync'],
      dependencies: ['Browser IndexedDB / SQLite Storage'],
      technologies: ['IndexedDB', 'AES-GCM Local Storage Encryption (Planned)', 'Local Transaction Log'],
      edgeExecutionCapable: true,
    },
    {
      id: 'c10',
      layerNumber: 10,
      layerName: 'Secure Synchronization',
      name: 'Transactional Delta Sync Engine',
      status: 'IN_DEVELOPMENT',
      purpose: 'Performs asynchronous, conflict-free replication with the central cloud database when connectivity is detected.',
      inputs: ['Pending Local Records Queue'],
      outputs: ['Synchronized Global Patient Records', 'Replication Confirmation'],
      dependencies: ['Layer 9 (Local Storage)', 'Cloud Gateway Endpoint'],
      technologies: ['Differential Delta Sync', 'Vector Clock Conflict Resolution', 'TLS 1.3 Transport'],
      edgeExecutionCapable: true,
    },
    {
      id: 'c11',
      layerNumber: 11,
      layerName: 'Clinician Interface',
      name: 'Clinical Intelligence Operations Suite',
      status: 'IMPLEMENTED',
      purpose: 'Presents research-grade clinical visualizations, uncertainty meters, resource monitors, and presentation mode to clinicians.',
      inputs: ['All Pipeline Telemetry & Results'],
      outputs: ['Visual Clinical Decision Support'],
      dependencies: ['All Lower Layers'],
      technologies: ['React 19', 'Tailwind CSS', 'Recharts', 'AETHER Tactical Operations Design System'],
      edgeExecutionCapable: true,
    },
  ];

  const selectedComp = components.find((c) => c.id === selectedComponentId) || components[2];

  return (
    <div className="space-y-6">
      <SectionHeader
        moduleNumber={6}
        categoryTag="System Architecture"
        title="Interactive System Architecture Engine"
        description="Comprehensive 11-layer architecture for offline-first, uncertainty-aware clinical risk screening. Visualizing interactions from front-line data intake to encrypted cloud delta synchronization."
        status="IMPLEMENTED"
        actions={
          <div className="flex items-center gap-2 font-mono text-xs text-tactical-cyan bg-tactical-cyan/10 px-3 py-1.5 border border-tactical-cyan/30 tactical-corner">
            <Layers className="w-3.5 h-3.5 text-tactical-cyan" />
            <span>[11_LAYERS_SPECIFIED]</span>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 11 Architecture Layers Flow Diagram */}
        <div className="lg:col-span-7 space-y-3">
          <div className="p-3 bg-bg-card border border-border-subtle tactical-corner text-xs text-text-secondary flex items-center justify-between font-mono">
            <span>Select any component to inspect formal specification:</span>
            <span className="text-tactical-cyan font-bold text-[11px]">[TOTAL_LAYERS: 11]</span>
          </div>

          <div className="space-y-2">
            {components.map((c) => {
              const isSelected = selectedComponentId === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedComponentId(c.id)}
                  className={`telemetry-panel p-3.5 cursor-pointer transition-all flex items-center justify-between gap-3 tactical-corner ${
                    isSelected
                      ? 'border-tactical-cyan bg-tactical-cyan/10 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                      : 'hover:border-border-subtle/80 opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex items-center justify-center w-7 h-7 bg-bg-primary border border-border-subtle font-mono text-[10px] text-text-secondary font-bold shrink-0">
                      L{String(c.layerNumber).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-heading font-bold text-xs sm:text-sm text-text-primary truncate">
                        {c.name}
                      </h4>
                      <p className="font-mono text-[10px] text-text-secondary truncate">
                        {c.layerName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={c.status} size="sm" />
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-tactical-cyan translate-x-0.5' : 'text-text-secondary'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Component Detail Inspection Drawer */}
        <div className="lg:col-span-5 space-y-4">
          <div className="telemetry-panel p-5 tactical-corner space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <span className="font-mono text-xs text-tactical-cyan uppercase font-bold">
                  [LAYER_{String(selectedComp.layerNumber).padStart(2, '0')}_SPECIFICATION]
                </span>
                <h3 className="font-heading font-bold text-base text-text-primary mt-0.5">
                  {selectedComp.name}
                </h3>
              </div>
              <StatusBadge status={selectedComp.status} size="sm" />
            </div>

            {/* Purpose */}
            <div className="space-y-1">
              <span className="font-mono text-[10px] text-text-secondary uppercase">Functional Purpose:</span>
              <p className="text-xs text-text-primary leading-relaxed bg-bg-primary p-3 border border-border-subtle tactical-corner font-mono">
                {selectedComp.purpose}
              </p>
            </div>

            {/* Inputs & Outputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-bg-primary border border-border-subtle tactical-corner space-y-1.5">
                <span className="text-[10px] text-tactical-cyan uppercase font-bold block">Input Contracts:</span>
                <ul className="space-y-1 text-text-secondary text-[11px]">
                  {selectedComp.inputs.map((inp, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-tactical-cyan">&gt;</span>
                      <span>{inp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-bg-primary border border-border-subtle tactical-corner space-y-1.5">
                <span className="text-[10px] text-tactical-green uppercase font-bold block">Output Contracts:</span>
                <ul className="space-y-1 text-text-secondary text-[11px]">
                  {selectedComp.outputs.map((out, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-tactical-green">&gt;</span>
                      <span>{out}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Technologies */}
            <div className="space-y-1.5">
              <span className="font-mono text-[10px] text-text-secondary uppercase">Technology Stack:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedComp.technologies.map((tech, i) => (
                  <span key={i} className="font-mono text-[11px] px-2 py-0.5 bg-bg-primary text-text-primary border border-border-subtle">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Execution Capability */}
            <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs font-mono">
              <span className="text-text-secondary">Edge Execution Capability:</span>
              <span className={selectedComp.edgeExecutionCapable ? 'text-tactical-green font-bold' : 'text-tactical-amber font-bold'}>
                {selectedComp.edgeExecutionCapable ? '[SUPPORTED: LOCAL_EDGE]' : '[REQUIRES: CLOUD_HUB]'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};