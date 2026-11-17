import { ModuleStatus } from '@/types';

export interface FeatureConfig {
  id: string;
  name: string;
  category: string;
  status: ModuleStatus;
  description: string;
  implementationNotes: string;
  targetMilestone?: string;
}

export const APP_IDENTITY = {
  name: 'AETHER',
  subName: 'Adaptive Clinical Intelligence',
  tagline: 'Reliable clinical intelligence. Even beyond connectivity.',
  officialTitle: 'Offline-First, Uncertainty-Aware Adaptive Cloud–Edge AI for Clinical Risk Screening in Low-Connectivity Healthcare Environments',
  clinicalTargetCandidate: 'Respiratory Airflow-Obstruction Screening (Subject to NHANES 2007–2012 feasibility audit)',
  version: '0.4.0-research-preview',
  environmentBadge: 'RESEARCH PROTOYPE — NON-DIAGNOSTIC DECISION SUPPORT',
};

export const SYSTEM_MODULES_STATUS: Record<string, FeatureConfig> = {
  // Module 1: Overview
  overview: {
    id: 'overview',
    name: 'Command Center & System Overview',
    category: 'System Interface',
    status: 'IMPLEMENTED',
    description: 'High-level operational overview, architecture node visualization, research pillars, and live system state.',
    implementationNotes: 'Fully interactive with real-time state synchronization across edge/cloud simulation.',
  },

  // Module 2: Clinical Assessment
  clinicalAssessment: {
    id: 'clinicalAssessment',
    name: 'Patient Assessment & Screening Input',
    category: 'Clinical Operations',
    status: 'IMPLEMENTED',
    description: 'Structured manual input form for patient demographics, symptoms, clinical history, and initial spirometry parameters.',
    implementationNotes: 'Client-side reactive validation, candidate dataset fields, and synthetic profile presets for rapid testing.',
  },

  // Module 3: Adaptive Inference
  adaptiveInference: {
    id: 'adaptiveInference',
    name: 'Adaptive Inference Controller (WHERE)',
    category: 'Inference Infrastructure',
    status: 'IMPLEMENTED',
    description: 'Dynamic execution routing between Cloud full-model, Edge quantized model, and complete Offline execution based on network telemetry and device resources.',
    implementationNotes: 'Deterministic inference execution engine with simulated network degradation conditions and device telemetry.',
  },

  // Module 4: Uncertainty Intelligence
  uncertaintyIntelligence: {
    id: 'uncertaintyIntelligence',
    name: 'Uncertainty Intelligence & Abstention (WHETHER)',
    category: 'Trustworthy AI',
    status: 'IMPLEMENTED',
    description: 'Calibrated predictive uncertainty quantification, Shannon entropy calculation, and 3-way triage outcome (Screen, Request Data, or Abstain).',
    implementationNotes: 'Implements selective classification logic, Expected Calibration Error (ECE) visualization, and epistemic/aleatoric risk breakdown.',
  },

  // Module 5: Adaptive Measurement Acquisition
  adaptiveAcquisition: {
    id: 'adaptiveAcquisition',
    name: 'Adaptive Measurement Acquisition (WHAT NEXT)',
    category: 'Active Information Gathering',
    status: 'IMPLEMENTED',
    description: 'Sequential value-of-information clinical acquisition strategy recommending subsequent tests to resolve diagnostic uncertainty.',
    implementationNotes: 'Interactive multi-step testing workflow with side-by-side before/after comparative uncertainty analysis.',
  },

  // Module 6: System Architecture
  systemArchitecture: {
    id: 'systemArchitecture',
    name: 'Interactive System Architecture Explorer',
    category: 'Research Systems',
    status: 'IMPLEMENTED',
    description: '11-layer comprehensive architectural model mapping data collection, preprocessing, controllers, inference nodes, and sync engines.',
    implementationNotes: 'Interactive component inspectability detailing inputs, outputs, tech stack, and module status.',
  },

  // Module 7: Resource Monitoring
  resourceMonitoring: {
    id: 'resourceMonitoring',
    name: 'Device & Edge Resource Telemetry',
    category: 'Edge Computing',
    status: 'IMPLEMENTED',
    description: 'Hardware constraint tracking including CPU cycles, memory footprint, battery drain, quantization comparisons, and inference latency.',
    implementationNotes: 'Simulated device telemetry and live model size / latency comparative benchmarks.',
  },

  // Module 8: Patient Records & Storage
  patientRecords: {
    id: 'patientRecords',
    name: 'Offline-First Records & Secure Synchronization',
    category: 'Data Management',
    status: 'IN_DEVELOPMENT',
    description: 'Local storage caching with end-to-end sync queue, differential delta updates, and conflict resolution.',
    implementationNotes: 'Frontend local storage and simulated sync queue implemented. Backend cryptographic conflict resolution in development.',
    targetMilestone: 'Phase 9 (Q2 2027)',
  },

  // Module 9: Research & Evaluation
  researchEvaluation: {
    id: 'researchEvaluation',
    name: 'Research Metrics & Experimental Benchmarks',
    category: 'Academic Evaluation',
    status: 'IN_DEVELOPMENT',
    description: 'Comprehensive experimental protocol covering 10 academic benchmark categories: baseline ML, quantization, selective prediction, and distribution shift.',
    implementationNotes: 'Evaluation framework structure designed. Baseline models in development; figures marked as DEMO protocol.',
    targetMilestone: 'Phase 10 (Q3 2027)',
  },

  // Module 10: Development Roadmap
  developmentRoadmap: {
    id: 'developmentRoadmap',
    name: '10-Phase Research & Implementation Roadmap',
    category: 'Project Management',
    status: 'IMPLEMENTED',
    description: 'Step-by-step milestone progression from NHANES feasibility audit to peer-reviewed publication.',
    implementationNotes: 'Real-time sync with repository phase progress.',
  },

  // Sub-features / Backend components
  backendFastApiIntegration: {
    id: 'backendFastApiIntegration',
    name: 'FastAPI Production Inference Gateway',
    category: 'Backend Infrastructure',
    status: 'PLANNED',
    description: 'High-concurrency microservice serving full ensemble models with batched GPU acceleration.',
    implementationNotes: 'Client service interfaces prepared; backend service scheduled for Phase 5.',
    targetMilestone: 'Phase 5',
  },

  int8QuantizedMobileModel: {
    id: 'int8QuantizedMobileModel',
    name: 'ONNX/TFLite INT8 Quantized Edge Model',
    category: 'Model Compression',
    status: 'IN_DEVELOPMENT',
    description: 'Quantized gradient boosting / lightweight neural network optimized for offline mobile CPU inference.',
    implementationNotes: 'Targeting < 15MB model footprint with < 50ms inference latency.',
    targetMilestone: 'Phase 3-4',
  },

  conformalPredictionEngine: {
    id: 'conformalPredictionEngine',
    name: 'Split Conformal Prediction with Coverage Guarantees',
    category: 'Theoretical Statistics',
    status: 'IN_DEVELOPMENT',
    description: 'Finite-sample distribution-free prediction sets with 90% and 95% marginal coverage bounds.',
    implementationNotes: 'Prototype heuristic calibration active; formal split conformal calibration in progress.',
    targetMilestone: 'Phase 7',
  }
};

export const getStatusColor = (status: ModuleStatus) => {
  switch (status) {
    case 'IMPLEMENTED':
      return {
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-400',
        label: 'Implemented',
        text: 'text-emerald-400',
      };
    case 'IN_DEVELOPMENT':
      return {
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        dot: 'bg-amber-400',
        label: 'In Development',
        text: 'text-amber-400',
      };
    case 'PLANNED':
      return {
        badge: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
        dot: 'bg-slate-400',
        label: 'Planned / Roadmap',
        text: 'text-slate-400',
      };
  }
};

