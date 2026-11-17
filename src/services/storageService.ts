import { PatientRecord } from '@/types';
import { DEMO_PATIENTS } from '@/data/demoPatients';

const STORAGE_KEY = 'aether_patient_records_v1';

export function getStoredRecords(): PatientRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with initial synthetic benchmark records
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_PATIENTS));
      return DEMO_PATIENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load local storage records:', err);
    return DEMO_PATIENTS;
  }
}

export function saveRecordLocally(record: PatientRecord): PatientRecord[] {
  try {
    const current = getStoredRecords();
    const existingIndex = current.findIndex(p => p.id === record.id || p.referenceId === record.referenceId);
    let updated: PatientRecord[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = record;
    } else {
      updated = [record, ...current];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save record locally:', err);
    return getStoredRecords();
  }
}

export function syncPendingRecords(): { syncedCount: number; remainingQueue: number } {
  try {
    const records = getStoredRecords();
    let count = 0;
    const synced = records.map(rec => {
      if (rec.syncStatus === 'PENDING_SYNC' || rec.syncStatus === 'LOCAL_ONLY') {
        count++;
        return { ...rec, syncStatus: 'SYNCED' as const };
      }
      return rec;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
    return { syncedCount: count, remainingQueue: 0 };
  } catch (err) {
    console.error('Sync error:', err);
    return { syncedCount: 0, remainingQueue: 0 };
  }
}

