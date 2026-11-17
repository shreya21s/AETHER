import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ConnectivityMode, InferenceEnvironment, PatientRecord } from '@/types';
import { Overview } from '@/pages/Overview';
import { ClinicalAssessment } from '@/pages/ClinicalAssessment';
import { AdaptiveInference } from '@/pages/AdaptiveInference';
import { UncertaintyIntelligence } from '@/pages/UncertaintyIntelligence';
import { AdaptiveAcquisition } from '@/pages/AdaptiveAcquisition';
import { Architecture } from '@/pages/Architecture';
import { ResourceMonitoring } from '@/pages/ResourceMonitoring';
import { PatientRecords } from '@/pages/PatientRecords';
import { ResearchEvaluation } from '@/pages/ResearchEvaluation';
import { Roadmap } from '@/pages/Roadmap';

export function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('overview');
  const [connectivity, setConnectivity] = useState<ConnectivityMode>('STABLE');
  const [inferenceEnv, setInferenceEnv] = useState<InferenceEnvironment>('EDGE');
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);

  const handleConnectivityChange = (mode: ConnectivityMode) => {
    setConnectivity(mode);
    // Automatic adaptive controller routing
    if (mode === 'STABLE') {
      setInferenceEnv('CLOUD');
    } else if (mode === 'DEGRADED') {
      setInferenceEnv('EDGE');
    } else {
      setInferenceEnv('OFFLINE');
    }
  };

  const renderActivePage = () => {
    switch (currentRoute) {
      case 'overview':
        return (
          <Overview
            onNavigate={setCurrentRoute}
            connectivity={connectivity}
            inferenceEnv={inferenceEnv}
          />
        );
      case 'assessment':
        return (
          <ClinicalAssessment
            onNavigate={setCurrentRoute}
            inferenceEnv={inferenceEnv}
          />
        );
      case 'adaptive-inference':
        return (
          <AdaptiveInference
            connectivity={connectivity}
            onConnectivityChange={handleConnectivityChange}
            inferenceEnv={inferenceEnv}
            onInferenceEnvChange={setInferenceEnv}
          />
        );
      case 'uncertainty':
        return <UncertaintyIntelligence onNavigate={setCurrentRoute} />;
      case 'acquisition':
        return <AdaptiveAcquisition onNavigate={setCurrentRoute} />;
      case 'architecture':
        return <Architecture />;
      case 'resources':
        return <ResourceMonitoring inferenceEnv={inferenceEnv} />;
      case 'records':
        return <PatientRecords />;
      case 'research':
        return <ResearchEvaluation />;
      case 'roadmap':
        return <Roadmap />;
      default:
        return (
          <Overview
            onNavigate={setCurrentRoute}
            connectivity={connectivity}
            inferenceEnv={inferenceEnv}
          />
        );
    }
  };

  return (
    <AppLayout
      currentRoute={currentRoute}
      onNavigate={setCurrentRoute}
      connectivity={connectivity}
      onConnectivityChange={handleConnectivityChange}
      inferenceEnv={inferenceEnv}
      onInferenceEnvChange={setInferenceEnv}
      isPresentationMode={isPresentationMode}
      onTogglePresentationMode={() => setIsPresentationMode(!isPresentationMode)}
    >
      {renderActivePage()}
    </AppLayout>
  );
}

export default App;
