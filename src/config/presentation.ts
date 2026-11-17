import { PresentationStep } from '@/types';

export const PRESENTATION_STEPS: PresentationStep[] = [
  {
    stepNumber: 1,
    route: 'overview',
    title: 'The Low-Connectivity Clinical AI Problem',
    subtitle: 'Clinical AI often fails where it is needed most due to cloud dependence.',
    highlightText: '70% of primary health clinics in rural and resource-constrained settings face intermittent or zero broadband access.',
    presenterNotes: 'Explain why standard cloud-only models are inadequate for remote clinics. AETHER introduces an offline-first, uncertainty-aware triage model that adapts to available bandwidth and edge compute.',
    statusRequirement: 'IMPLEMENTED',
    keyPoints: [
      'Cloud dependence creates single-point-of-failure vulnerabilities in remote triage.',
      'AETHER operates seamlessly across Cloud, Edge, and Disconnected (Offline) environments.',
      'Research target: Respiratory airflow-obstruction screening (evaluated against NHANES spirometry).',
      'Non-diagnostic: Designed exclusively as an assistive decision-support screening tool.'
    ]
  },
  {
    stepNumber: 2,
    route: 'architecture',
    title: 'Complete 11-Layer Research Architecture',
    subtitle: 'End-to-end framework from client data collection to secure delta synchronization.',
    highlightText: 'A modular, decoupled architecture enabling local edge inference with deferred cloud reconciliation.',
    presenterNotes: 'Walk the evaluation committee through the system layers: data intake, preprocessing, the adaptive controller, cloud/edge execution, the uncertainty engine, selective abstention, and offline sync.',
    statusRequirement: 'IMPLEMENTED',
    keyPoints: [
      'Layered modularity: Decoupled edge runtime and cloud orchestrator.',
      'Clear separation of implemented components vs research roadmap.',
      'Interactive component inspectability with formal input/output contracts.',
      'Local encrypted persistence layer for disconnected healthcare workers.'
    ]
  },
  {
    stepNumber: 3,
    route: 'assessment',
    title: 'Clinical Data Collection & Spirometry Feasibility',
    subtitle: 'Manual patient entry designed for front-line community health workers.',
    highlightText: 'Standardized clinical variables including demographics, respiratory symptoms, and baseline spirometry.',
    presenterNotes: 'Demonstrate manual data entry. Note that no IoT hardware is required for this phase. Emphasize that clinical variables are aligned with NHANES candidate variables, currently undergoing feasibility audit.',
    statusRequirement: 'IMPLEMENTED',
    keyPoints: [
      'No complex IoT dependency: Fast, manual entry suitable for low-resource clinics.',
      'Validated input bounds with missing-data awareness.',
      'Synthetic benchmark patient profiles preloaded for deterministic demonstrations.',
      'Strict clinical disclaimer: Assistance and screening triage only.'
    ]
  },
  {
    stepNumber: 4,
    route: 'adaptive-inference',
    title: 'The WHERE Decision: Adaptive Inference Controller',
    subtitle: 'Intelligently selecting Cloud, Edge, or Offline execution paths.',
    highlightText: 'Runtime controller measures latency, jitter, battery, and compute to select the optimal model pipeline.',
    presenterNotes: 'Show the interactive network simulator. Toggle between Stable, Degraded, and Disconnected. Notice how the controller dynamically chooses the cloud full model vs quantized edge model vs pure offline execution.',
    statusRequirement: 'IMPLEMENTED',
    keyPoints: [
      'Stable network -> Cloud full-model execution with maximum capacity.',
      'Degraded network / high latency -> Edge local model to prevent timeout failures.',
      'Complete disconnect -> Full offline execution with zero internet dependency.',
      'Clear scientific separation: Network simulator vs execution pipeline.'
    ]
  },
  {
    stepNumber: 5,
    route: 'uncertainty',
    title: 'The WHETHER Decision: Uncertainty Intelligence & Abstention',
    subtitle: 'Evaluating predictive trustworthiness before returning a clinical screening.',
    highlightText: 'High probability != High reliability. AETHER abstains when uncertainty exceeds safe thresholds.',
    presenterNotes: 'Show the three core triage outcomes: 1) Confirmed Screening, 2) Request Additional Data, and 3) Abstain and Refer to Physician. Discuss why selective classification and calibration matter clinically.',
    statusRequirement: 'IMPLEMENTED',
    keyPoints: [
      'Triage Outcome 1: Return Screening Result when confidence is calibrated & uncertainty is low.',
      'Triage Outcome 2: Request Additional Information when uncertainty is resolvable with more tests.',
      'Triage Outcome 3: Abstain and Refer for Human Evaluation when sample is out-of-distribution.',
      'Distinguishes epistemic (model knowledge) vs aleatoric (data noise) uncertainty.'
    ]
  },
  {
    stepNumber: 6,
    route: 'acquisition',
    title: 'The WHAT NEXT Decision: Adaptive Measurement Acquisition',
    subtitle: 'Active information gathering to resolve clinical ambiguity cost-effectively.',
    highlightText: 'Sequential value-of-information optimization: recommending the most impactful test next.',
    presenterNotes: 'Show how AETHER recommends a specific follow-up test (e.g. Post-Bronchodilator spirometry or FeNO) only when it provides meaningful information gain, avoiding unnecessary patient travel or costs.',
    statusRequirement: 'IMPLEMENTED',
    keyPoints: [
      'Evaluates candidate clinical measurements by expected information gain vs clinical burden.',
      'Interactive testing workflow: Enter additional measurement and re-screen.',
      'Side-by-side before/after comparison showing real reduction in predictive entropy.',
      'Respects clinical boundaries: AI suggests information value without overriding medical judgment.'
    ]
  },
  {
    stepNumber: 7,
    route: 'roadmap',
    title: 'Development Roadmap & Future Research',
    subtitle: 'Transparent 10-phase execution plan from feasibility to peer-reviewed dissemination.',
    highlightText: 'Rigorous academic trajectory balancing theoretical safety guarantees with real-world edge viability.',
    presenterNotes: 'Conclude the presentation by reviewing the 10 development phases. Highlight what is currently implemented, what is actively being trained/quantized, and the planned publication timeline.',
    statusRequirement: 'IMPLEMENTED',
    keyPoints: [
      'Phase 1-6 implemented and functional in prototype demonstration.',
      'Phase 7-9 model quantization and cryptographic delta sync currently in progress.',
      'Phase 10: Multi-center offline evaluation and research paper submission.',
      'Zero fabricated claims: Clear delineation of tested prototype vs planned roadmap.'
    ]
  }
];

