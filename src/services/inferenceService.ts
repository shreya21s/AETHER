import { PatientRecord, InferenceEnvironment, ScreeningRiskCategory } from '@/types';

// Integration-ready base URL for future FastAPI backend
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export interface InferenceExecutionResult {
  environment: InferenceEnvironment;
  latencyMs: number;
  modelIdentifier: string;
  calibratedRisk: number;
  riskCategory: ScreeningRiskCategory;
  featureContributions: { feature: string; weight: number }[];
  isDeterministicSimulation: boolean;
}

/**
 * Evaluates clinical risk for respiratory obstruction.
 * Based on candidate clinical variables from NHANES spirometry datasets.
 * Clearly identified as a research decision-support algorithm, subject to feasibility audit.
 */
export async function executeClinicalInference(
  patient: PatientRecord,
  preferredEnv: InferenceEnvironment = 'EDGE'
): Promise<InferenceExecutionResult> {
  // If a live FastAPI backend is configured via VITE_API_URL, attempt live query
  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/screen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient, environment: preferredEnv }),
      });
      if (response.ok) {
        const data = await response.json();
        return {
          environment: preferredEnv,
          latencyMs: data.latencyMs ?? 145,
          modelIdentifier: data.modelIdentifier ?? 'Cloud-Ensemble-XGB-v1.2',
          calibratedRisk: data.calibratedRisk,
          riskCategory: data.riskCategory,
          featureContributions: data.featureContributions,
          isDeterministicSimulation: false,
        };
      }
    } catch {
      console.warn('[AETHER] Live backend unreachable, falling back to local edge deterministic execution.');
    }
  }

  // Deterministic local clinical screening estimation
  const startTime = performance.now();

  let riskScore = 0.05; // baseline population risk
  const contributions: { feature: string; weight: number }[] = [];

  // 1. Spirometry Ratio (Golden feature in airflow obstruction)
  const ratio = patient.measurements.fev1FvcRatio ?? (
    patient.measurements.fev1Litres && patient.measurements.fvcLitres 
      ? patient.measurements.fev1Litres / patient.measurements.fvcLitres 
      : undefined
  );

  if (ratio !== undefined) {
    if (ratio < 0.60) {
      riskScore += 0.58;
      contributions.push({ feature: 'Severely Reduced FEV1/FVC (< 0.60)', weight: +0.58 });
    } else if (ratio < 0.70) {
      riskScore += 0.42;
      contributions.push({ feature: 'Obstructive Threshold FEV1/FVC (0.60-0.69)', weight: +0.42 });
    } else if (ratio < 0.73) {
      riskScore += 0.20;
      contributions.push({ feature: 'Borderline Normal FEV1/FVC (0.70-0.73)', weight: +0.20 });
    } else if (ratio > 0.88 && (patient.measurements.fvcLitres ?? 4.0) < 2.0) {
      // Possible restrictive anomaly: high ratio, very low capacity
      riskScore += 0.15;
      contributions.push({ feature: 'Atypical High Ratio with Low FVC (Restrictive Pattern)', weight: +0.15 });
    } else {
      riskScore -= 0.10;
      contributions.push({ feature: 'Normal Preserved FEV1/FVC (>= 0.73)', weight: -0.10 });
    }
  } else {
    contributions.push({ feature: 'Missing Spirometry Primary Ratio', weight: 0 });
  }

  // 2. Smoking exposure
  if (patient.smokingStatus === 'Current') {
    const packPenalty = Math.min(0.25, (patient.packYears / 40) * 0.25);
    riskScore += 0.12 + packPenalty;
    contributions.push({ feature: `Current Smoker (${patient.packYears} pack-yrs)`, weight: 0.12 + packPenalty });
  } else if (patient.smokingStatus === 'Former') {
    const packPenalty = Math.min(0.12, (patient.packYears / 50) * 0.12);
    riskScore += 0.05 + packPenalty;
    contributions.push({ feature: `Former Smoker (${patient.packYears} pack-yrs)`, weight: 0.05 + packPenalty });
  }

  // 3. Symptoms profile
  let symptomScore = 0;
  if (patient.symptoms.chronicCough) symptomScore += 0.06;
  if (patient.symptoms.dyspneaOnExertion) symptomScore += 0.09;
  if (patient.symptoms.wheezing) symptomScore += 0.08;
  if (patient.symptoms.sputumProduction) symptomScore += 0.05;
  if (symptomScore > 0) {
    riskScore += symptomScore;
    contributions.push({ feature: 'Respiratory Symptoms Cluster', weight: Number(symptomScore.toFixed(2)) });
  }

  // 4. Age factor
  if (patient.age > 60) {
    riskScore += 0.08;
    contributions.push({ feature: 'Age > 60 years', weight: +0.08 });
  } else if (patient.age > 45) {
    riskScore += 0.04;
    contributions.push({ feature: 'Age 45-60 years', weight: +0.04 });
  }

  // 5. Occupational exposure
  if (patient.medicalHistory.occupationalExposure) {
    riskScore += 0.07;
    contributions.push({ feature: 'Occupational Particulate/Vapor Exposure', weight: +0.07 });
  }

  // 6. Post-bronchodilator update if present
  if (patient.measurements.postBdFev1Ratio !== undefined) {
    if (patient.measurements.postBdFev1Ratio < 0.70) {
      riskScore += 0.18;
      contributions.push({ feature: 'Fixed Post-BD Airflow Limitation (< 0.70)', weight: +0.18 });
    } else {
      riskScore -= 0.15;
      contributions.push({ feature: 'Reversible Airflow Limitation (Post-BD >= 0.70)', weight: -0.15 });
    }
  }

  const calibratedRisk = Math.min(0.96, Math.max(0.04, Number(riskScore.toFixed(3))));

  let riskCategory: ScreeningRiskCategory = 'LOW_RISK';
  if (calibratedRisk >= 0.65) {
    riskCategory = 'HIGH_RISK_OBSTRUCTION';
  } else if (calibratedRisk >= 0.35) {
    riskCategory = 'MODERATE_RISK';
  } else {
    riskCategory = 'LOW_RISK';
  }

  const latencySimulation = preferredEnv === 'CLOUD' 
    ? Math.floor(180 + Math.random() * 80)
    : preferredEnv === 'EDGE' 
      ? Math.floor(22 + Math.random() * 12)
      : Math.floor(8 + Math.random() * 6);

  const modelIdentifier = preferredEnv === 'CLOUD'
    ? 'AETHER-Cloud-Ensemble-XGBoost-FP32'
    : preferredEnv === 'EDGE'
      ? 'AETHER-Edge-TreeQuantized-INT8'
      : 'AETHER-Offline-Cache-Compact-v0.4';

  return {
    environment: preferredEnv,
    latencyMs: latencySimulation,
    modelIdentifier,
    calibratedRisk,
    riskCategory,
    featureContributions: contributions,
    isDeterministicSimulation: true,
  };
}

