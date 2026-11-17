import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Lock,
  Database,
  Terminal,
  FileText
} from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { PatientRecord } from '@/types';
import { getStoredRecords, syncPendingRecords } from '@/services/storageService';

export const PatientRecords: React.FC = () => {
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [syncFilter, setSyncFilter] = useState<string>('ALL');
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadData = () => {
    const list = getStoredRecords();
    setRecords(list);
    if (!selectedPatient && list.length > 0) {
      setSelectedPatient(list[0]);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await new Promise((r) => setTimeout(r, 600));
    syncPendingRecords();
    loadData();
    setIsSyncing(false);
  };

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.referenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.notes && rec.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'ALL' || rec.screeningResult === categoryFilter;

    const matchesSync =
      syncFilter === 'ALL' || rec.syncStatus === syncFilter;

    return matchesSearch && matchesCategory && matchesSync;
  });

  return (
    <div className="space-y-6">
      <SectionHeader
        moduleNumber={8}
        categoryTag="Data Management & Synchronization"
        title="Patient Screening Records &amp; Local Persistence"
        description="Local encrypted persistence with asynchronous transactional synchronization. Anonymized synthetic demonstration profiles based on NHANES spirometry formats (Zero Real Personal Health Information)."
        status="IN_DEVELOPMENT"
        actions={
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-2 bg-bg-card hover:bg-bg-elevated border border-border-subtle hover:border-tactical-amber/50 text-xs font-mono text-text-primary transition-all disabled:opacity-50 tactical-corner uppercase tracking-wider"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-tactical-amber ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Reconciling Queue...' : 'Reconcile Local Records'}</span>
          </button>
        }
      />

      {/* Development status callout */}
      <div className="p-4 telemetry-panel border-l-4 border-l-tactical-amber tactical-corner text-xs text-text-secondary flex items-start gap-3">
        <Lock className="w-4 h-4 text-tactical-amber shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-mono text-[10px] text-tactical-amber uppercase font-bold tracking-wider">
            [CDSS_PERSISTENCE_09] // Storage & Cryptographic Replication
          </span>
          <p className="leading-relaxed font-mono text-text-primary">
            Local storage and transactional queues are currently functional client-side. End-to-end cryptographic conflict-resolution with central FHIR/HL7 backends is in active development.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="telemetry-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs tactical-corner">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="FILTER BY REF ID OR CLINICAL NOTES..."
            className="w-full bg-bg-primary border border-border-subtle pl-9 pr-3 py-2 text-text-primary font-mono text-xs focus:border-tactical-amber outline-none tactical-corner uppercase"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <div className="flex items-center gap-1.5 bg-bg-primary border border-border-subtle px-2.5 py-1 tactical-corner">
            <span className="text-text-secondary">Outcome:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-text-primary outline-none cursor-pointer font-mono"
            >
              <option value="ALL" className="bg-bg-primary">ALL CATEGORIES</option>
              <option value="HIGH_RISK_OBSTRUCTION" className="bg-bg-primary">HIGH RISK</option>
              <option value="MODERATE_RISK" className="bg-bg-primary">MODERATE RISK</option>
              <option value="LOW_RISK" className="bg-bg-primary">LOW RISK</option>
              <option value="INCONCLUSIVE" className="bg-bg-primary">INCONCLUSIVE</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-bg-primary border border-border-subtle px-2.5 py-1 tactical-corner">
            <span className="text-text-secondary">Sync State:</span>
            <select
              value={syncFilter}
              onChange={(e) => setSyncFilter(e.target.value)}
              className="bg-transparent text-text-primary outline-none cursor-pointer font-mono"
            >
              <option value="ALL" className="bg-bg-primary">ALL STATES</option>
              <option value="SYNCED" className="bg-bg-primary">SYNCED</option>
              <option value="PENDING_SYNC" className="bg-bg-primary">PENDING SYNC</option>
              <option value="LOCAL_ONLY" className="bg-bg-primary">LOCAL ONLY</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Records Layout: Table + Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table List */}
        <div className="lg:col-span-7 telemetry-panel p-5 overflow-hidden space-y-3 tactical-corner">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-xs font-mono text-text-secondary">
            <span>PATIENT COHORT RECORDS ({filteredRecords.length})</span>
            <span>STORE: [INDEXED_DB]</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-border-subtle text-text-secondary uppercase text-[10px]">
                  <th className="py-2.5 px-3">Reference ID</th>
                  <th className="py-2.5 px-3">Screening Result</th>
                  <th className="py-2.5 px-3">Inference Tier</th>
                  <th className="py-2.5 px-3">Sync Status</th>
                  <th className="py-2.5 px-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50 text-text-primary">
                {filteredRecords.map((p) => {
                  const isSelected = selectedPatient?.id === p.id;

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPatient(p)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-tactical-amber/10 text-text-primary' : 'hover:bg-bg-elevated/40'
                      }`}
                    >
                      <td className="py-3 px-3 font-bold text-text-primary">
                        {p.referenceId}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold border tactical-corner ${
                          p.screeningResult === 'HIGH_RISK_OBSTRUCTION'
                            ? 'bg-tactical-red/10 text-tactical-red border-tactical-red/30'
                            : p.screeningResult === 'MODERATE_RISK'
                            ? 'bg-tactical-amber/10 text-tactical-amber border-tactical-amber/30'
                            : p.screeningResult === 'LOW_RISK'
                            ? 'bg-tactical-green/10 text-tactical-green border-tactical-green/30'
                            : 'bg-tactical-cyan/10 text-tactical-cyan border-tactical-cyan/30'
                        }`}>
                          {p.screeningResult ? `[${p.screeningResult.replace('_', ' ')}]` : '[UNSCREENED]'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-tactical-cyan">
                        [{p.inferenceModeUsed || 'EDGE'}]
                      </td>
                      <td className="py-3 px-3">
                        <span className={`flex items-center gap-1 text-[11px] ${
                          p.syncStatus === 'SYNCED' ? 'text-tactical-green' : 'text-tactical-amber'
                        }`}>
                          {p.syncStatus === 'SYNCED' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          <span>[{p.syncStatus}]</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <ChevronRight className={`w-3.5 h-3.5 inline ${isSelected ? 'text-tactical-amber' : 'text-text-secondary'}`} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Patient Detail Inspector */}
        <div className="lg:col-span-5">
          {selectedPatient ? (
            <div className="telemetry-panel p-5 space-y-4 sticky top-20 tactical-corner">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div>
                  <span className="font-mono text-xs text-tactical-amber uppercase font-bold">
                    [PATIENT_RECORD_AUDIT]
                  </span>
                  <h3 className="font-heading font-bold text-base text-text-primary mt-0.5">
                    {selectedPatient.referenceId}
                  </h3>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-bg-primary border border-border-subtle text-text-secondary">
                  AGE: {selectedPatient.age} | {selectedPatient.sex}
                </span>
              </div>

              {/* Triage & Probability */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-bg-primary border border-border-subtle tactical-corner">
                  <div className="text-[10px] text-text-secondary uppercase">Screening Result</div>
                  <div className="font-bold text-text-primary text-sm mt-1">
                    {selectedPatient.screeningResult ? selectedPatient.screeningResult.replace('_', ' ') : 'None'}
                  </div>
                </div>

                <div className="p-3 bg-bg-primary border border-border-subtle tactical-corner">
                  <div className="text-[10px] text-text-secondary uppercase">Predictive Entropy</div>
                  <div className="font-bold text-tactical-amber text-sm mt-1">
                    {selectedPatient.uncertaintyScore ?? 'N/A'}
                  </div>
                </div>
              </div>

              {/* Spirometry Parameters */}
              <div className="p-3 bg-bg-primary border border-border-subtle space-y-1.5 text-xs font-mono tactical-corner">
                <div className="text-[10px] text-text-secondary uppercase font-bold pb-1 border-b border-border-subtle/50">
                  Recorded Spirometry Parameters
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>FEV1 (Litres):</span>
                  <span className="text-text-primary font-bold">{selectedPatient.measurements.fev1Litres ?? 'N/A'} L</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>FVC (Litres):</span>
                  <span className="text-text-primary font-bold">{selectedPatient.measurements.fvcLitres ?? 'N/A'} L</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>FEV1 / FVC Ratio:</span>
                  <span className="text-tactical-cyan font-bold">{selectedPatient.measurements.fev1FvcRatio ?? 'N/A'}</span>
                </div>
                {selectedPatient.measurements.postBdFev1Ratio && (
                  <div className="flex justify-between text-tactical-green font-bold">
                    <span>Post-BD Ratio:</span>
                    <span>{selectedPatient.measurements.postBdFev1Ratio}</span>
                  </div>
                )}
              </div>

              {/* Clinical Notes & Rationale */}
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-text-secondary uppercase">Clinician Assessment Notes:</span>
                <p className="text-xs text-text-primary bg-bg-primary p-3 border border-border-subtle leading-relaxed font-mono tactical-corner">
                  {selectedPatient.notes || 'Routine screening assessment recorded under low-connectivity research protocol.'}
                </p>
              </div>

              <div className="pt-2 border-t border-border-subtle flex justify-between items-center text-xs font-mono text-text-secondary">
                <span>Assessment Timestamp:</span>
                <span className="text-text-primary">{new Date(selectedPatient.assessmentDate).toLocaleDateString()}</span>
              </div>
            </div>
          ) : (
            <div className="telemetry-panel p-8 text-center text-xs font-mono text-text-secondary tactical-corner">
              Select a record from the table to view audit details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};