export type ModuleStatus = 'IMPLEMENTED' | 'IN_DEVELOPMENT' | 'PLANNED';

export type ConnectivityMode = 'STABLE' | 'DEGRADED' | 'OFFLINE';

export type InferenceEnvironment = 'CLOUD' | 'EDGE' | 'OFFLINE';

export type DecisionOutcome = 
  | 'SCREENING_CONFIRMED' 
  | 'ACQUISITION_REQUIRED' 
  | 'ABSTAIN_REFERRAL';

export type ScreeningRiskCategory = 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK_OBSTRUCTION' | 'INCONCLUSIVE';

export interface PatientRecord {
  id: string;
  referenceId: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  smokingStatus: 'Never' | 'Former' | 'Current';
  packYears: number;
  symptoms: {
    chronicCough: boolean;
    dyspneaOnExertion: boolean;
    wheezing: boolean;
    sputumProduction: boolean;
    chestTightness: boolean;
  };
  medicalHistory: {
    asthmaHistory: boolean;
    allergies: boolean;
    occupationalExposure: boolean;
    recurrentInfections: boolean;
  };
  vitals: {
    restingHeartRate: number; // bpm
    respiratoryRate: number;  // breaths/min
    bmi: number;
    oxygenSaturation?: number; // % SpO2
  };
  measurements: {
    fev1Litres?: number;       // Forced Expiratory Volume in 1s (L)
    fvcLitres?: number;        // Forced Vital Capacity (L)
    fev1FvcRatio?: number;     // FEV1/FVC ratio (0-1.0 or %)
    peakExpiratoryFlow?: number; // L/min
    postBdFev1Ratio?: number;  // Post-bronchodilator ratio
    fenoPpb?: number;          // Exhaled Nitric Oxide (ppb)
  };
  assessmentDate: string;
  screeningResult?: ScreeningRiskCategory;
  calibratedProbability?: number; // 0 - 1.0
  uncertaintyScore?: number;      // 0 - 1.0
  decisionOutcome?: DecisionOutcome;
  inferenceModeUsed?: InferenceEnvironment;
  syncStatus: 'SYNCED' | 'PENDING_SYNC' | 'LOCAL_ONLY';
  reviewStatus: 'PENDING_PHYSICIAN_REVIEW' | 'FLAGGED_FOR_AUDIT' | 'PRELIMINARY_COMPLETE';
  notes?: string;
}

export interface NetworkSimulationState {
  mode: ConnectivityMode;
  latencyMs: number;
  jitterMs: number;
  packetLossPercent: number;
  bandwidthKbps: number;
  cloudReachable: boolean;
}

export interface DeviceResourceState {
  cpuUsagePercent: number;
  ramUsageMb: number;
  totalRamMb: number;
  batteryLevelPercent: number;
  isPluggedIn: boolean;
  localModelLoaded: boolean;
  localModelSizeMb: number;
  temperatureCelsius: number;
}

export interface UncertaintyMetrics {
  calibratedProbability: number;
  rawProbability: number;
  predictiveEntropy: number; // Shannon entropy
  epistemicUncertainty: number; // Model parameter uncertainty
  aleatoricUncertainty: number; // Data noise
  conformalPredictionSet: string[];
  confidenceInterval: [number, number];
  brierScore: number;
  expectedCalibrationError: number;
  selectiveRisk: number;
  coverageLevel: number;
  decision: DecisionOutcome;
  abstentionReason?: string;
}

export interface AdditionalMeasurementOption {
  id: string;
  name: string;
  shortCode: string;
  category: 'PHYSIOLOGICAL' | 'PULMONARY_FUNCTION' | 'POINT_OF_CARE_LAB';
  unit: string;
  typicalCostScale: 'MINIMAL' | 'LOW' | 'MODERATE' | 'HIGH';
  timeRequiredMinutes: number;
  informationGainExpected: number; // 0 - 1.0
  clinicalRationale: string;
  applicabilityCriteria: string;
  standardReferenceRange: string;
}

export interface SystemLayerComponent {
  id: string;
  layerNumber: number;
  layerName: string;
  name: string;
  status: ModuleStatus;
  purpose: string;
  inputs: string[];
  outputs: string[];
  dependencies: string[];
  technologies: string[];
  edgeExecutionCapable: boolean;
}

export interface RoadmapPhase {
  phaseNumber: number;
  title: string;
  status: ModuleStatus;
  timeframe: string;
  objective: string;
  technologies: string[];
  dependencies: string[];
  completionCriteria: string[];
  clinicalSignificance: string;
}

export interface PresentationStep {
  stepNumber: number;
  route: string;
  title: string;
  subtitle: string;
  highlightText: string;
  presenterNotes: string;
  statusRequirement: ModuleStatus;
  keyPoints: string[];
}

