import React, { useState } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { PresentationOverlay } from './PresentationOverlay';
import { DisclaimerBanner } from '../shared/DisclaimerBanner';
import { ConnectivityMode, InferenceEnvironment } from '@/types';
import { PRESENTATION_STEPS } from '@/config/presentation';
import { syncPendingRecords, getStoredRecords } from '@/services/storageService';
import { useTheme } from '@/hooks/useTheme';

interface AppLayoutProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  connectivity: ConnectivityMode;
  onConnectivityChange: (mode: ConnectivityMode) => void;
  inferenceEnv: InferenceEnvironment;
  onInferenceEnvChange: (env: InferenceEnvironment) => void;
  isPresentationMode: boolean;
  onTogglePresentationMode: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentRoute,
  onNavigate,
  connectivity,
  onConnectivityChange,
  inferenceEnv,
  onInferenceEnvChange,
  isPresentationMode,
  onTogglePresentationMode,
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [presentationStepIndex, setPresentationStepIndex] = useState(0);

  const { theme, toggleTheme } = useTheme();

  // Compute pending sync count
  const allRecords = getStoredRecords();
  const pendingSyncCount = allRecords.filter(r => r.syncStatus === 'PENDING_SYNC' || r.syncStatus === 'LOCAL_ONLY').length;

  const handleTriggerSync = () => {
    syncPendingRecords();
    window.dispatchEvent(new Event('storage'));
  };

  const handleSelectPresentationStep = (index: number) => {
    setPresentationStepIndex(index);
    const step = PRESENTATION_STEPS[index];
    if (step) {
      onNavigate(step.route);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col font-sans selection:bg-tactical-amber/30 selection:text-text-primary transition-colors duration-200">
      {/* Top Mission-Control Bar */}
      <TopBar
        connectivity={connectivity}
        onConnectivityChange={onConnectivityChange}
        inferenceEnv={inferenceEnv}
        onInferenceEnvChange={onInferenceEnvChange}
        isPresentationMode={isPresentationMode}
        onTogglePresentationMode={onTogglePresentationMode}
        onToggleSidebarMobile={() => setMobileMenuOpen(!mobileMenuOpen)}
        pendingSyncCount={pendingSyncCount}
        onTriggerSync={handleTriggerSync}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Body Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tactical Nav Sidebar */}
        <Sidebar
          currentRoute={currentRoute}
          onNavigate={onNavigate}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Central Operations Workspace with Fine Tactical Grid */}
        <main className={`flex-1 overflow-y-auto bg-tactical-grid relative p-4 sm:p-6 lg:p-8 ${isPresentationMode ? 'pb-32' : 'pb-16'}`}>
          <div className="max-w-7xl mx-auto space-y-6">
            <DisclaimerBanner compact={true} />
            {children}
          </div>
        </main>
      </div>

      {/* Presentation Mode Overlay */}
      {isPresentationMode && (
        <PresentationOverlay
          currentStepIndex={presentationStepIndex}
          onSelectStepIndex={handleSelectPresentationStep}
          onClose={onTogglePresentationMode}
        />
      )}
    </div>
  );
};