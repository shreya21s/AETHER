import React, { useState } from 'react';
import { 
  GitFork, 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  PlusCircle, 
  Clock, 
  Coins, 
  AlertCircle,
  FileCheck,
  TrendingDown,
  RotateCcw,
  Check,
  Radar,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { PatientRecord, AdditionalMeasurementOption } from '@/types';
import { DEMO_PATIENTS, AVAILABLE_MEASUREMENT_OPTIONS } from '@/data/demoPatients';
import { rankMeasurementAcquisitions, AcquisitionRecommendation } from '@/services/acquisitionService';
import { executeClinicalInference } from '@/services/inferenceService';
import { evaluateUncertainty } from '@/services/uncertaintyService';
import { ClinicalDistributionChart } from '@/components/charts/ClinicalDistributionChart';
import { SpirometryFlowLoopVisualizer } from '@/components/medical/SpirometryFlowLoopVisualizer';

interface AdaptiveAcquisitionProps {
  onNavigate: (route: string) => void;
}

export const AdaptiveAcquisition: React.FC<AdaptiveAcquisitionProps> = ({ onNavigate }) => {
  const [patient, setPatient] = useState<PatientRecord>({
    ...DEMO_PATIENTS[1],
    measurements: {
      ...DEMO_PATIENTS[1].measurements,
      postBdFev1Ratio: undefined,
      fenoPpb: undefined,
    }
  });

  const [initialState] = useState({
    calibratedRisk: 0.56,
    uncertainty: 0.44,
    decision: 'REQUEST (ADDITIONAL DATA)',
    category: 'MODERATE_RISK',
  });

  const [selectedOption, setSelectedOption] = useState<AdditionalMeasurementOption>(AVAILABLE_MEASUREMENT_OPTIONS[0]);
  const [enteredValue, setEnteredValue] = useState<number>(0.64);
  const [hasAcquired, setHasAcquired] = useState(false);
  const [updatedState, setUpdatedState] = useState<{
    calibratedRisk: number;
    uncertainty: number;
    decision: string;
    category: string;
    fev1FvcRatio?: number;
    postBdRatio?: number;
  } | null>(null);

  const recommendations: AcquisitionRecommendation[] = rankMeasurementAcquisitions(
    patient,
    initialState.uncertainty
  );

  const handleAcquireMeasurement = async () => {
    let updatedMeasurements = { ...patient.measurements };

    if (selectedOption.id === 'post_bd_ratio') {
      updatedMeasurements.postBdFev1Ratio = enteredValue;
    } else if (selectedOption.id === 'feno_test') {
      updatedMeasurements.fenoPpb = enteredValue;
    } else if (selectedOption.id === 'peak_flow_variability') {
      updatedMeasurements.peakExpiratoryFlow = enteredValue;
    }

    const updatedPatient: PatientRecord = {
      ...patient,
      measurements: updatedMeasurements,
    };

    const res = await executeClinicalInference(updatedPatient, 'EDGE');
    const unc = evaluateUncertainty(updatedPatient, res.calibratedRisk);

    setPatient(updatedPatient);
    setUpdatedState({
      calibratedRisk: unc.calibratedProbability,
      uncertainty: unc.predictiveEntropy,
      decision: unc.decision === 'SCREENING_CONFIRMED' ? 'PREDICT (CONFIRMED)' : unc.decision,
      category: res.riskCategory,
      fev1FvcRatio: patient.measurements.fev1FvcRatio,
      postBdRatio: enteredValue,
    });
    setHasAcquired(true);
  };

  const handleReset = () => {
    setPatient({
      ...DEMO_PATIENTS[1],
      measurements: {
        ...DEMO_PATIENTS[1].measurements,
        postBdFev1Ratio: undefined,
        fenoPpb: undefined,
      }
    });
    setHasAcquired(false);
    setUpdatedState(null);
    setSelectedOption(AVAILABLE_MEASUREMENT_OPTIONS[0]);
    setEnteredValue(0.64);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        moduleNumber={5}
        categoryTag="Active Information Acquisition"
        title="Adaptive Measurement Acquisition (WHAT NEXT Engine)"
        description="Sequential Value-of-Information (VoI) optimization. Recommending targeted follow-up diagnostic tests to resolve borderline clinical ambiguity while minimizing patient travel, clinic burden, and healthcare expenditure."
        status="IMPLEMENTED"
        actions={
          hasAcquired ? (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-card hover:bg-bg-elevated border border-border-subtle text-xs font-mono text-text-secondary hover:text-text-primary transition-all tactical-corner"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>[RESET_ACQUISITION]</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 font-mono text-xs text-tactical-cyan bg-tactical-cyan/10 px-3 py-1.5 border border-tactical-cyan/30 tactical-corner">
              <Radar className="w-3.5 h-3.5 animate-spin text-tactical-cyan" />
              <span>[VOI_OPTIMIZER_ACTIVE]</span>
            </div>
          )
        }
      />

      {/* Clinical Guidance Notice */}
      <div className="p-4 telemetry-panel border-l-4 border-l-tactical-amber tactical-corner text-xs text-text-secondary flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-tactical-amber shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-mono text-[10px] text-tactical-amber uppercase font-bold tracking-wider">
            [CDSS_GUARDRAIL_05] // Information Acquisition Policy
          </span>
          <p className="leading-relaxed font-mono text-text-primary">
            Adaptive acquisition optimizes information value to resolve diagnostic entropy. AI recommendations do not override physician judgment or recommend clinically unnecessary interventions.
          </p>
        </div>
      </div>

      {/* Active Clinical Measurement Audit Matrix */}
      <div className="telemetry-panel p-5 tactical-corner space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
          <div>
            <span className="font-mono text-xs text-text-secondary">// AMBIGUITY PROFILE:</span>
            <h3 className="font-heading font-bold text-sm sm:text-base tracking-wider uppercase text-text-primary mt-0.5">
              {patient.referenceId} — Borderline Airflow Obstruction Case
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-3 py-1 bg-tactical-amber/10 text-tactical-amber border border-tactical-amber/30 font-bold tactical-corner">
              Entropy: {initialState.uncertainty} [STATUS: REQUEST]
            </span>
          </div>
        </div>

        {/* 3 Categorized Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          {/* A. Available Clinical Measurements */}
          <div className="p-3.5 bg-bg-primary border border-tactical-green/30 tactical-corner space-y-2">
            <div className="flex items-center justify-between text-tactical-green font-bold uppercase text-[11px]">
              <span>1. Available Measurements</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-1.5 text-text-secondary text-[11px]">
              <div className="flex justify-between">
                <span>Baseline FEV1:</span>
                <span className="text-text-primary font-bold">{patient.measurements.fev1Litres} L</span>
              </div>
              <div className="flex justify-between">
                <span>Baseline FVC:</span>
                <span className="text-text-primary font-bold">{patient.measurements.fvcLitres} L</span>
              </div>
              <div className="flex justify-between">
                <span>Pre-BD Ratio:</span>
                <span className="text-tactical-amber font-bold">{patient.measurements.fev1FvcRatio} (Borderline)</span>
              </div>
              <div className="flex justify-between">
                <span>Resting SpO2:</span>
                <span className="text-text-primary">{patient.vitals.oxygenSaturation}%</span>
              </div>
            </div>
          </div>

          {/* B. Missing Measurements */}
          <div className="p-3.5 bg-bg-primary border border-tactical-amber/30 tactical-corner space-y-2">
            <div className="flex items-center justify-between text-tactical-amber font-bold uppercase text-[11px]">
              <span>2. Missing Measurements</span>
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-1.5 text-text-secondary text-[11px]">
              <div className="flex justify-between">
                <span>Post-Bronchodilator:</span>
                <span className="text-text-secondary">Unrecorded</span>
              </div>
              <div className="flex justify-between">
                <span>FeNO Airway Biomarker:</span>
                <span className="text-text-secondary">Unrecorded</span>
              </div>
              <div className="flex justify-between">
                <span>Exertional Desaturation:</span>
                <span className="text-text-secondary">Not Tested</span>
              </div>
            </div>
          </div>

          {/* C. Requested Additional Measurement & Reason */}
          <div className="p-3.5 bg-bg-primary border border-tactical-cyan/30 tactical-corner space-y-2">
            <div className="flex items-center justify-between text-tactical-cyan font-bold uppercase text-[11px]">
              <span>3. Requested Test &amp; Reason</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-text-primary leading-snug">
              <strong className="text-tactical-cyan font-semibold">Post-BD Spirometry:</strong> Required to differentiate fixed airway obstruction (COPD) from reversible hyperresponsiveness (Asthma) near the 0.70 threshold.
            </p>
          </div>
        </div>
      </div>

      {/* Value-of-Information Ranked Recommendations */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-text-primary">
            Ranked Information Candidates (VoI Strategy)
          </h3>
          <span className="font-mono text-[11px] text-text-secondary">
            Expected Entropy Reduction Delta
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => {
            const isSelected = selectedOption.id === rec.recommendedOption.id;

            return (
              <div
                key={rec.recommendedOption.id}
                onClick={() => {
                  setSelectedOption(rec.recommendedOption);
                  if (rec.recommendedOption.id === 'post_bd_ratio') setEnteredValue(0.64);
                  if (rec.recommendedOption.id === 'feno_test') setEnteredValue(48);
                  if (rec.recommendedOption.id === 'spo2_exertion') setEnteredValue(91);
                }}
                className={`telemetry-panel p-4 cursor-pointer relative overflow-hidden transition-all tactical-corner ${
                  isSelected
                    ? 'border-tactical-cyan bg-tactical-cyan/10 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                    : 'hover:border-border-subtle/80 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 bg-tactical-cyan/20 text-tactical-cyan font-mono text-xs font-bold border border-tactical-cyan/40">
                      #{rec.rank}
                    </span>
                    <h4 className="font-heading font-bold text-sm text-text-primary">
                      {rec.recommendedOption.name}
                    </h4>
                  </div>
                  <span className="font-mono text-xs px-2 py-0.5 bg-tactical-cyan/10 text-tactical-cyan border border-tactical-cyan/30 font-bold">
                    Gain: +{rec.expectedInformationGain}
                  </span>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed mb-3">
                  {rec.clinicalRationale}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border-subtle/60 text-[11px] font-mono text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-tactical-amber" />
                    <span>Cost: {rec.costScale}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-tactical-cyan" />
                    <span>Duration: ~{rec.recommendedOption.timeRequiredMinutes}m</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Acquisition Input Area */}
      <div className="telemetry-panel p-5 tactical-corner space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-tactical-cyan" />
            <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-text-primary">
              Acquire Selected Measurement: {selectedOption.name}
            </h3>
          </div>
          <span className="font-mono text-[11px] text-text-secondary">
            Unit: {selectedOption.unit}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1">
            <label className="block font-mono text-xs text-text-secondary uppercase">
              Enter Measured Value ({selectedOption.shortCode})
            </label>
            <input
              type="number"
              step="0.01"
              value={enteredValue}
              onChange={(e) => setEnteredValue(Number(e.target.value))}
              className="w-full bg-bg-primary border border-border-subtle px-3 py-2 text-text-primary font-mono text-sm focus:border-tactical-amber outline-none tactical-corner"
            />
          </div>

          <div className="space-y-1 text-xs font-mono text-text-secondary">
            <div>Standard Diagnostic Target:</div>
            <div className="text-text-primary font-bold">{selectedOption.standardReferenceRange}</div>
          </div>

          <button
            onClick={handleAcquireMeasurement}
            className="w-full py-2.5 bg-tactical-amber text-bg-primary font-heading font-bold text-xs hover:bg-tactical-amber/90 transition-all flex items-center justify-center gap-2 tactical-corner uppercase tracking-wider"
          >
            <FileCheck className="w-4 h-4" />
            <span>Enter &amp; Re-Evaluate Triage</span>
          </button>
        </div>
      </div>

      {/* Clinical Distribution Analytics (FEV1 vs FVC Scatter & Subgroups) */}
      <ClinicalDistributionChart />

      {/* Spirometry Flow Loop Analysis for Acquired Measurement */}
      <SpirometryFlowLoopVisualizer
        fev1Litres={patient.measurements.fev1Litres ?? 2.1}
        fvcLitres={patient.measurements.fvcLitres ?? 3.4}
        postBdFev1Ratio={updatedState?.postBdRatio ?? (hasAcquired ? enteredValue : undefined)}
      />

      {/* Before & After Comparative Visualization */}
      {hasAcquired && updatedState && (
        <div className="telemetry-panel p-5 tactical-corner space-y-5 animate-in slide-in-from-bottom duration-300 border-tactical-green">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
            <div>
              <span className="font-mono text-xs text-tactical-green uppercase font-bold">
                // BEFORE-AND-AFTER UNCERTAINTY RESOLUTION
              </span>
              <h3 className="font-heading font-bold text-base text-text-primary mt-0.5">
                Impact of Acquired Measurement on Clinical Decision
              </h3>
            </div>
            <span className="font-mono text-xs px-3 py-1 bg-tactical-green/10 text-tactical-green border border-tactical-green/30 font-bold tactical-corner">
              [ENTROPY_RESOLVED]
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* INITIAL ASSESSMENT */}
            <div className="p-4 bg-bg-primary border border-border-subtle tactical-corner space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-text-secondary uppercase">Initial State (Prior)</span>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-tactical-amber/10 text-tactical-amber border border-tactical-amber/30 font-bold uppercase">
                  {initialState.decision}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Estimated Risk:</span>
                  <span className="text-text-primary font-bold">{(initialState.calibratedRisk * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Predictive Entropy:</span>
                  <span className="text-tactical-amber font-bold">{initialState.uncertainty} (High)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Missing Evidence:</span>
                  <span className="text-text-secondary">Post-BD reversibility unknown</span>
                </div>
              </div>

              <p className="text-[11px] text-text-secondary leading-snug pt-2 border-t border-border-subtle/50 font-mono">
                Borderline pre-BD spirometry resulted in high classification ambiguity near the 0.70 threshold.
              </p>
            </div>

            {/* UPDATED ASSESSMENT */}
            <div className="p-4 bg-bg-primary border border-tactical-green/40 tactical-corner space-y-3 shadow-[0_0_12px_rgba(34,197,94,0.15)]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-tactical-green uppercase font-bold">Updated State (Posterior)</span>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-tactical-green/10 text-tactical-green border border-tactical-green/30 font-bold uppercase">
                  {updatedState.decision}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Updated Risk:</span>
                  <span className="text-tactical-green font-bold">{(updatedState.calibratedRisk * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Predictive Entropy:</span>
                  <span className="text-tactical-green font-bold flex items-center gap-1">
                    {updatedState.uncertainty} <TrendingDown className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Acquired Evidence:</span>
                  <span className="text-tactical-cyan font-bold">Post-BD Ratio: {enteredValue} (&lt; 0.70)</span>
                </div>
              </div>

              <p className="text-[11px] text-text-primary leading-snug pt-2 border-t border-border-subtle/50 font-mono">
                Acquisition of Post-BD FEV1/FVC established irreversible fixed limitation, eliminating boundary ambiguity and confirming High Risk triage.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};