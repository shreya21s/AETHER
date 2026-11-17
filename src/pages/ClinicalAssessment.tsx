import React, { useState } from 'react';
import { 
  Stethoscope, 
  User, 
  Activity, 
  ClipboardList, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Bookmark,
  Cpu,
  RefreshCw,
  Terminal,
  ShieldCheck,
  AlertTriangle,
  Play
} from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { PatientRecord, InferenceEnvironment } from '@/types';
import { DEMO_PATIENTS } from '@/data/demoPatients';
import { executeClinicalInference, InferenceExecutionResult } from '@/services/inferenceService';
import { evaluateUncertainty } from '@/services/uncertaintyService';
import { saveRecordLocally } from '@/services/storageService';
import { RespiratorySystemVisualizer } from '@/components/medical/RespiratorySystemVisualizer';
import { SpirometryFlowLoopVisualizer } from '@/components/medical/SpirometryFlowLoopVisualizer';

interface ClinicalAssessmentProps {
  onNavigate: (route: string) => void;
  inferenceEnv: InferenceEnvironment;
  onAssessmentCompleted?: (record: PatientRecord) => void;
}

export const ClinicalAssessment: React.FC<ClinicalAssessmentProps> = ({
  onNavigate,
  inferenceEnv,
  onAssessmentCompleted,
}) => {
  const [patient, setPatient] = useState<PatientRecord>({
    id: `pat-${Date.now()}`,
    referenceId: 'AETHER-CLINIC-701',
    age: 52,
    sex: 'Male',
    smokingStatus: 'Current',
    packYears: 24,
    symptoms: {
      chronicCough: true,
      dyspneaOnExertion: true,
      wheezing: true,
      sputumProduction: false,
      chestTightness: false,
    },
    medicalHistory: {
      asthmaHistory: false,
      allergies: false,
      occupationalExposure: true,
      recurrentInfections: false,
    },
    vitals: {
      restingHeartRate: 76,
      respiratoryRate: 18,
      bmi: 26.5,
      oxygenSaturation: 95,
    },
    measurements: {
      fev1Litres: 1.95,
      fvcLitres: 3.10,
      fev1FvcRatio: 0.629,
      peakExpiratoryFlow: 360,
    },
    assessmentDate: new Date().toISOString(),
    syncStatus: 'LOCAL_ONLY',
    reviewStatus: 'PENDING_PHYSICIAN_REVIEW',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [inferenceResult, setInferenceResult] = useState<InferenceExecutionResult | null>(null);
  const [uncertaintyMetrics, setUncertaintyMetrics] = useState<ReturnType<typeof evaluateUncertainty> | null>(null);

  const presets = [
    { label: 'COHORT_01 [OBSTRUCTIVE]', data: DEMO_PATIENTS[0] },
    { label: 'COHORT_02 [BORDERLINE]', data: DEMO_PATIENTS[1] },
    { label: 'COHORT_03 [RESTRICTIVE]', data: DEMO_PATIENTS[2] },
    { label: 'COHORT_04 [CONTROL]', data: DEMO_PATIENTS[3] },
  ];

  const handleLoadPreset = (preset: PatientRecord) => {
    setPatient({
      ...preset,
      id: `pat-${Date.now()}`,
      assessmentDate: new Date().toISOString(),
    });
    setValidationErrors({});
    setInferenceResult(null);
    setUncertaintyMetrics(null);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!patient.referenceId.trim()) errors.referenceId = 'PATIENT_REF_ID_REQUIRED';
    if (!patient.age || patient.age < 18 || patient.age > 105) errors.age = 'RANGE_18_105';
    if (patient.packYears < 0) errors.packYears = 'PACK_YEARS_NON_NEGATIVE';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRunScreening = async () => {
    if (!validateForm()) return;

    setIsRunning(true);
    try {
      const res = await executeClinicalInference(patient, inferenceEnv);
      const uncertainty = evaluateUncertainty(patient, res.calibratedRisk);

      setInferenceResult(res);
      setUncertaintyMetrics(uncertainty);

      const updatedRecord: PatientRecord = {
        ...patient,
        screeningResult: res.riskCategory,
        calibratedProbability: uncertainty.calibratedProbability,
        uncertaintyScore: uncertainty.predictiveEntropy,
        decisionOutcome: uncertainty.decision,
        inferenceModeUsed: inferenceEnv,
      };

      saveRecordLocally(updatedRecord);
      if (onAssessmentCompleted) {
        onAssessmentCompleted(updatedRecord);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const calculatedRatio = patient.measurements.fev1Litres && patient.measurements.fvcLitres
    ? Number((patient.measurements.fev1Litres / patient.measurements.fvcLitres).toFixed(3))
    : patient.measurements.fev1FvcRatio;

  const completedSections = [
    Boolean(patient.referenceId && patient.age && patient.sex),
    Boolean(Object.values(patient.symptoms).some(Boolean) || patient.smokingStatus),
    Boolean(patient.measurements.fev1Litres || patient.measurements.fvcLitres || patient.measurements.fev1FvcRatio),
  ];
  const progressPercent = Math.round((completedSections.filter(Boolean).length / 3) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-mono">
      <SectionHeader
        moduleNumber={2}
        categoryTag="Clinical Operations Workstation"
        title="Patient Clinical Assessment // Data Intake"
        description="Technical patient evaluation terminal for field healthcare operatives. Standardized clinical vectors aligned with NHANES spirometry datasets (subject to ongoing feasibility audit)."
        status="IMPLEMENTED"
        actions={
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-text-muted flex items-center gap-1 text-[11px]">
              <Bookmark className="w-3.5 h-3.5 text-tactical-cyan" /> COHORTS:
            </span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleLoadPreset(p.data)}
                className="px-2 py-0.5 rounded-sm bg-[#141B27] hover:bg-bg-elevated border border-border-subtle hover:border-tactical-cyan text-[10px] text-text-secondary hover:text-text-primary transition-all"
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Completion Indicator */}
      <div className="telemetry-panel p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-text-muted uppercase text-[10px]">INTAKE_COMPLETION:</span>
          <div className="w-36 bg-[#0E131E] rounded-none h-1.5 overflow-hidden border border-border-subtle">
            <div
              className="bg-tactical-cyan h-full transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-tactical-cyan font-bold">{progressPercent}%</span>
        </div>

        <div className="flex items-center gap-4 text-[10px] text-text-muted">
          <span className={`flex items-center gap-1 ${completedSections[0] ? 'text-tactical-green font-bold' : ''}`}>
            [{completedSections[0] ? 'OK' : 'WAIT'}] 1. DEMOGRAPHICS
          </span>
          <span className={`flex items-center gap-1 ${completedSections[1] ? 'text-tactical-green font-bold' : ''}`}>
            [{completedSections[1] ? 'OK' : 'WAIT'}] 2. SYMPTOMS
          </span>
          <span className={`flex items-center gap-1 ${completedSections[2] ? 'text-tactical-green font-bold' : ''}`}>
            [{completedSections[2] ? 'OK' : 'WAIT'}] 3. SPIROMETRY
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Column */}
        <div className="lg:col-span-8 space-y-5">
          {/* Section 1: Demographics */}
          <div className="telemetry-panel p-5 tactical-corner space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-tactical-cyan" />
                <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary">
                  1. Demographics &amp; Exposure Vector
                </h3>
              </div>
              <span className="text-[10px] text-text-muted">MANUAL_ENTRY</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
              <div>
                <label className="block text-text-muted mb-1 text-[10px] uppercase">
                  REFERENCE_ID <span className="text-tactical-red">*</span>
                </label>
                <input
                  type="text"
                  value={patient.referenceId}
                  onChange={(e) => setPatient({ ...patient, referenceId: e.target.value })}
                  className={`w-full bg-[#0E131E] border rounded-sm px-2.5 py-1.5 text-text-primary focus:border-tactical-cyan outline-none transition-colors ${
                    validationErrors.referenceId ? 'border-tactical-red' : 'border-border-subtle'
                  }`}
                  placeholder="NHANES-SYNTH-102"
                />
              </div>

              <div>
                <label className="block text-text-muted mb-1 text-[10px] uppercase">
                  AGE [YRS] <span className="text-tactical-red">*</span>
                </label>
                <input
                  type="number"
                  min="18"
                  max="105"
                  value={patient.age}
                  onChange={(e) => setPatient({ ...patient, age: Number(e.target.value) })}
                  className="w-full bg-[#0E131E] border border-border-subtle rounded-sm px-2.5 py-1.5 text-text-primary focus:border-tactical-cyan outline-none"
                />
              </div>

              <div>
                <label className="block text-text-muted mb-1 text-[10px] uppercase">
                  BIOLOGICAL_SEX <span className="text-tactical-red">*</span>
                </label>
                <select
                  value={patient.sex}
                  onChange={(e) => setPatient({ ...patient, sex: e.target.value as any })}
                  className="w-full bg-[#0E131E] border border-border-subtle rounded-sm px-2.5 py-1.5 text-text-primary focus:border-tactical-cyan outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-text-muted mb-1 text-[10px] uppercase">
                  SMOKING_STATUS <span className="text-tactical-red">*</span>
                </label>
                <select
                  value={patient.smokingStatus}
                  onChange={(e) => setPatient({ ...patient, smokingStatus: e.target.value as any })}
                  className="w-full bg-[#0E131E] border border-border-subtle rounded-sm px-2.5 py-1.5 text-text-primary focus:border-tactical-cyan outline-none"
                >
                  <option value="Never">Never</option>
                  <option value="Former">Former</option>
                  <option value="Current">Current</option>
                </select>
              </div>

              <div>
                <label className="block text-text-muted mb-1 text-[10px] uppercase">
                  PACK_YEARS
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={patient.packYears}
                  onChange={(e) => setPatient({ ...patient, packYears: Number(e.target.value) })}
                  className="w-full bg-[#0E131E] border border-border-subtle rounded-sm px-2.5 py-1.5 text-text-primary focus:border-tactical-cyan outline-none"
                />
              </div>

              <div>
                <label className="block text-text-muted mb-1 text-[10px] uppercase">
                  BMI [KG/M²]
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={patient.vitals.bmi}
                  onChange={(e) => setPatient({ ...patient, vitals: { ...patient.vitals, bmi: Number(e.target.value) } })}
                  className="w-full bg-[#0E131E] border border-border-subtle rounded-sm px-2.5 py-1.5 text-text-primary focus:border-tactical-cyan outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Symptoms */}
          <div className="telemetry-panel p-5 tactical-corner space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-tactical-cyan" />
                <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary">
                  2. Respiratory Symptoms &amp; Exposures
                </h3>
              </div>
              <span className="text-[10px] text-text-muted">MULTIPLE_CRITERIA</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-text-muted uppercase mb-2">SYMPTOM_FLAGS:</div>
                <div className="space-y-1.5">
                  {[
                    { key: 'chronicCough', label: 'Chronic Cough (> 8 weeks)' },
                    { key: 'dyspneaOnExertion', label: 'Dyspnea / Breathlessness on Exertion' },
                    { key: 'wheezing', label: 'Audible Wheezing' },
                    { key: 'sputumProduction', label: 'Daily Sputum Production' },
                    { key: 'chestTightness', label: 'Chest Tightness' },
                  ].map((s) => (
                    <label key={s.key} className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer hover:text-tactical-cyan">
                      <input
                        type="checkbox"
                        checked={(patient.symptoms as any)[s.key]}
                        onChange={(e) =>
                          setPatient({
                            ...patient,
                            symptoms: { ...patient.symptoms, [s.key]: e.target.checked },
                          })
                        }
                        className="rounded-none border-border-subtle text-tactical-cyan focus:ring-tactical-cyan w-3.5 h-3.5 bg-[#0E131E]"
                      />
                      <span>{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-text-muted uppercase mb-2">EXPOSURE_FLAGS:</div>
                <div className="space-y-1.5">
                  {[
                    { key: 'asthmaHistory', label: 'Childhood Asthma History' },
                    { key: 'allergies', label: 'Atopic Rhinitis / Allergies' },
                    { key: 'occupationalExposure', label: 'Occupational Particulate/Dust' },
                    { key: 'recurrentInfections', label: 'Recurrent Chest Infections' },
                  ].map((m) => (
                    <label key={m.key} className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer hover:text-tactical-cyan">
                      <input
                        type="checkbox"
                        checked={(patient.medicalHistory as any)[m.key]}
                        onChange={(e) =>
                          setPatient({
                            ...patient,
                            medicalHistory: { ...patient.medicalHistory, [m.key]: e.target.checked },
                          })
                        }
                        className="rounded-none border-border-subtle text-tactical-cyan focus:ring-tactical-cyan w-3.5 h-3.5 bg-[#0E131E]"
                      />
                      <span>{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Spirometry */}
          <div className="telemetry-panel p-5 tactical-corner space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-tactical-cyan" />
                <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary">
                  3. Pulmonary Spirometry Readings
                </h3>
              </div>
              <span className="text-[10px] text-tactical-green">GOLD_INDICES</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
              <div>
                <label className="block text-text-muted mb-1 text-[10px]">FEV1 [LITRES]</label>
                <input
                  type="number"
                  step="0.05"
                  value={patient.measurements.fev1Litres ?? ''}
                  onChange={(e) =>
                    setPatient({
                      ...patient,
                      measurements: {
                        ...patient.measurements,
                        fev1Litres: e.target.value ? Number(e.target.value) : undefined,
                      },
                    })
                  }
                  className="w-full bg-[#0E131E] border border-border-subtle rounded-sm px-2.5 py-1.5 text-text-primary focus:border-tactical-cyan outline-none"
                  placeholder="2.10"
                />
              </div>

              <div>
                <label className="block text-text-muted mb-1 text-[10px]">FVC [LITRES]</label>
                <input
                  type="number"
                  step="0.05"
                  value={patient.measurements.fvcLitres ?? ''}
                  onChange={(e) =>
                    setPatient({
                      ...patient,
                      measurements: {
                        ...patient.measurements,
                        fvcLitres: e.target.value ? Number(e.target.value) : undefined,
                      },
                    })
                  }
                  className="w-full bg-[#0E131E] border border-border-subtle rounded-sm px-2.5 py-1.5 text-text-primary focus:border-tactical-cyan outline-none"
                  placeholder="3.20"
                />
              </div>

              <div>
                <label className="block text-text-muted mb-1 text-[10px]">RATIO [FEV1 / FVC]</label>
                <div className="w-full bg-[#0E131E] border border-border-subtle rounded-sm px-2.5 py-1.5">
                  {calculatedRatio !== undefined ? (
                    <span className={calculatedRatio < 0.70 ? 'text-tactical-amber font-bold' : 'text-tactical-green font-bold'}>
                      {calculatedRatio}
                    </span>
                  ) : (
                    <span className="text-text-muted">Awaiting Inputs</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-text-muted mb-1 text-[10px]">PEAK_FLOW [L/MIN]</label>
                <input
                  type="number"
                  value={patient.measurements.peakExpiratoryFlow ?? ''}
                  onChange={(e) =>
                    setPatient({
                      ...patient,
                      measurements: {
                        ...patient.measurements,
                        peakExpiratoryFlow: e.target.value ? Number(e.target.value) : undefined,
                      },
                    })
                  }
                  className="w-full bg-[#0E131E] border border-border-subtle rounded-sm px-2.5 py-1.5 text-text-primary focus:border-tactical-cyan outline-none"
                  placeholder="380"
                />
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-sm telemetry-panel bg-[#111622]">
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <Cpu className="w-4 h-4 text-tactical-cyan" />
              <span>
                TARGET_ROUTE: <strong className="text-tactical-cyan font-bold">{inferenceEnv}</strong>
              </span>
            </div>

            <button
              onClick={handleRunScreening}
              disabled={isRunning}
              className="w-full sm:w-auto px-6 py-2.5 rounded-sm bg-tactical-cyan text-bg-primary font-heading font-bold text-xs hover:bg-tactical-cyan/90 transition-all flex items-center justify-center gap-2 shadow-tactical-cyan disabled:opacity-50"
            >
              <Stethoscope className="w-4 h-4" />
              <span>{isRunning ? 'EVALUATING INFERENCE...' : 'RUN INFERENCE PIPELINE'}</span>
            </button>
          </div>
        </div>

        {/* Right Output Column (Unified Results Dashboard - Section 7) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="telemetry-panel p-5 tactical-corner space-y-4 sticky top-16">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-tactical-cyan" />
                Inference Result Output
              </h3>
              <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-tactical-cyan/15 text-tactical-cyan border border-tactical-cyan/30 font-bold">
                EVAL_LIVE
              </span>
            </div>

            {inferenceResult && uncertaintyMetrics ? (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                {/* 3-Decision Output Banner (PREDICT / REQUEST / ABSTAIN) */}
                <div className="p-3.5 rounded-sm bg-[#0E131E] border border-border-subtle space-y-1.5">
                  <div className="text-[10px] text-text-muted uppercase">DECISION_OUTCOME:</div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-sm font-black uppercase tracking-wider border ${
                        uncertaintyMetrics.decision === 'SCREENING_CONFIRMED'
                          ? 'bg-emerald-500/15 text-tactical-green border-emerald-500/30'
                          : uncertaintyMetrics.decision === 'ACQUISITION_REQUIRED'
                          ? 'bg-amber-500/15 text-tactical-amber border-amber-500/30'
                          : 'bg-rose-500/15 text-tactical-red border-rose-500/30'
                      }`}
                    >
                      {uncertaintyMetrics.decision === 'SCREENING_CONFIRMED' && '[PREDICT: SUFFICIENT_EVIDENCE]'}
                      {uncertaintyMetrics.decision === 'ACQUISITION_REQUIRED' && '[REQUEST: ADDITIONAL_DATA]'}
                      {uncertaintyMetrics.decision === 'ABSTAIN_REFERRAL' && '[ABSTAIN: HUMAN_ESCALATION]'}
                    </span>
                  </div>
                  {uncertaintyMetrics.abstentionReason && (
                    <p className="text-[11px] text-text-secondary leading-snug pt-1 font-sans">
                      {uncertaintyMetrics.abstentionReason}
                    </p>
                  )}
                </div>

                {/* Calibrated Risk vs Uncertainty */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-sm bg-[#0E131E] border border-border-subtle">
                    <div className="text-[10px] text-text-muted uppercase">CALIBRATED_RISK</div>
                    <div className="text-2xl font-black text-text-primary mt-1">
                      {(uncertaintyMetrics.calibratedProbability * 100).toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-text-secondary mt-0.5 truncate">
                      {inferenceResult.riskCategory}
                    </div>
                  </div>

                  <div className="p-3 rounded-sm bg-[#0E131E] border border-border-subtle">
                    <div className="text-[10px] text-text-muted uppercase">ENTROPY H(p)</div>
                    <div className="text-2xl font-black text-tactical-cyan mt-1">
                      {uncertaintyMetrics.predictiveEntropy}
                    </div>
                    <div className="text-[10px] text-text-secondary mt-0.5">
                      SCALE [0.0 - 1.0]
                    </div>
                  </div>
                </div>

                {/* Telemetry metadata */}
                <div className="p-3 rounded-sm bg-[#0E131E] border border-border-subtle text-[11px] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-text-muted">MODE:</span>
                    <span className="text-tactical-cyan font-bold">{inferenceResult.environment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">LATENCY:</span>
                    <span className="text-tactical-green font-bold">{inferenceResult.latencyMs} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">MODEL:</span>
                    <span className="text-text-primary truncate max-w-[150px]">{inferenceResult.modelIdentifier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">PERSISTENCE:</span>
                    <span className="text-tactical-green">LOCAL_DB_COMMITTED</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-1">
                  {uncertaintyMetrics.decision === 'ACQUISITION_REQUIRED' && (
                    <button
                      onClick={() => onNavigate('acquisition')}
                      className="w-full py-2.5 rounded-sm bg-tactical-cyan text-bg-primary font-heading font-bold text-xs hover:bg-tactical-cyan/90 transition-all flex items-center justify-center gap-1.5 shadow-tactical-cyan"
                    >
                      <span>LAUNCH ADAPTIVE ACQUISITION</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => onNavigate('uncertainty')}
                    className="w-full py-2 rounded-sm bg-[#141B27] hover:bg-bg-elevated border border-border-subtle text-text-secondary hover:text-text-primary text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>INSPECT UNCERTAINTY ENGINE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 px-4 space-y-2">
                <div className="w-10 h-10 rounded-sm bg-[#0E131E] border border-border-subtle flex items-center justify-center mx-auto text-tactical-cyan">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div className="text-xs text-text-secondary">
                  Awaiting patient vector evaluation. Fill fields or load a cohort preset, then execute pipeline.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Intelligence Section: Anatomical Pulmonary & Diagnostic Spirometry Loops */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-6">
          <RespiratorySystemVisualizer
            fev1FvcRatio={calculatedRatio ?? 0.68}
            interactive={true}
          />
        </div>
        <div className="lg:col-span-6">
          <SpirometryFlowLoopVisualizer
            fev1Litres={patient.measurements.fev1Litres ?? 2.15}
            fvcLitres={patient.measurements.fvcLitres ?? 3.65}
            postBdFev1Ratio={patient.measurements.postBdFev1Ratio}
          />
        </div>
      </div>
    </div>
  );
};
