import { PatientRecord, AdditionalMeasurementOption } from '@/types';
import { AVAILABLE_MEASUREMENT_OPTIONS } from '@/data/demoPatients';

export interface AcquisitionRecommendation {
  recommendedOption: AdditionalMeasurementOption;
  rank: number;
  expectedInformationGain: number; // in bits or normalized (0-1)
  clinicalRationale: string;
  expectedEffectOnDecision: string;
  costScale: 'MINIMAL' | 'LOW' | 'MODERATE' | 'HIGH';
}

/**
 * Evaluates candidate additional clinical measurements using Value-of-Information (VoI) ranking.
 * Balances expected reduction in predictive entropy against testing burden.
 */
export function rankMeasurementAcquisitions(
  patient: PatientRecord,
  currentUncertainty: number
): AcquisitionRecommendation[] {
  const recommendations: AcquisitionRecommendation[] = [];

  for (const opt of AVAILABLE_MEASUREMENT_OPTIONS) {
    // Check if measurement is already recorded
    if (opt.id === 'post_bd_ratio' && patient.measurements.postBdFev1Ratio !== undefined) continue;
    if (opt.id === 'feno_test' && patient.measurements.fenoPpb !== undefined) continue;
    if (opt.id === 'spo2_exertion' && patient.vitals.oxygenSaturation !== undefined && patient.vitals.oxygenSaturation < 95) continue;
    if (opt.id === 'peak_flow_variability' && patient.measurements.peakExpiratoryFlow !== undefined) continue;

    let score = opt.informationGainExpected;
    let rationale = opt.clinicalRationale;
    let expectedEffect = 'Reduces overall classification variance.';

    if (opt.id === 'post_bd_ratio') {
      const ratio = patient.measurements.fev1FvcRatio ?? 0.70;
      if (ratio >= 0.65 && ratio <= 0.75) {
        score = 0.92;
        rationale = 'Primary critical test: Borderline pre-BD ratio (near 0.70 cut-off). Post-BD testing will definitively confirm or refute fixed irreversible obstruction.';
        expectedEffect = 'Directly clarifies whether case resolves to Confirmed Screening or remains Reversible Airway Disease.';
      }
    } else if (opt.id === 'feno_test') {
      if (patient.medicalHistory.allergies || patient.medicalHistory.asthmaHistory) {
        score = 0.78;
        rationale = 'Patient has atopic/asthma history. Elevated FeNO (>35 ppb) indicates active Th2 allergic airway inflammation, differentiating it from COPD.';
        expectedEffect = 'Helps resolve whether symptoms are allergic eosinophilic phenotype vs non-eosinophilic smoking-related obstruction.';
      }
    } else if (opt.id === 'spo2_exertion') {
      if (patient.symptoms.dyspneaOnExertion) {
        score = 0.65;
        rationale = 'Patient reports exertional dyspnea. Testing exertional desaturation identifies subclinical gas exchange defect even with preserved resting saturation.';
        expectedEffect = 'Provides physiological functional severity marker.';
      }
    }

    // Weight score by current uncertainty
    const finalGain = Number((score * Math.max(0.4, currentUncertainty)).toFixed(3));

    recommendations.push({
      recommendedOption: opt,
      rank: 0,
      expectedInformationGain: finalGain,
      clinicalRationale: rationale,
      expectedEffectOnDecision: expectedEffect,
      costScale: opt.typicalCostScale,
    });
  }

  // Sort by expected information gain descending
  recommendations.sort((a, b) => b.expectedInformationGain - a.expectedInformationGain);

  return recommendations.map((r, idx) => ({ ...r, rank: idx + 1 }));
}

