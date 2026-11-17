import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  BookOpen, 
  Compass,
  ArrowRight,
  Maximize2,
  Minimize2,
  Radio
} from 'lucide-react';
import { PRESENTATION_STEPS } from '@/config/presentation';

interface PresentationOverlayProps {
  currentStepIndex: number;
  onSelectStepIndex: (index: number) => void;
  onClose: () => void;
}

export const PresentationOverlay: React.FC<PresentationOverlayProps> = ({
  currentStepIndex,
  onSelectStepIndex,
  onClose,
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const currentStep = PRESENTATION_STEPS[currentStepIndex];

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      onSelectStepIndex(currentStepIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < PRESENTATION_STEPS.length - 1) {
      onSelectStepIndex(currentStepIndex + 1);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-4 py-2.5 bg-tactical-amber text-bg-primary font-heading font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:bg-tactical-amber/90 transition-all tactical-corner tracking-wider uppercase"
        >
          <Radio className="w-4 h-4 animate-pulse text-bg-primary" />
          <span>Resume Walkthrough (Step {currentStep.stepNumber}/7)</span>
          <Maximize2 className="w-3.5 h-3.5 ml-1" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-bg-secondary/95 backdrop-blur-2xl border-t border-border-subtle shadow-[0_-15px_40px_rgba(0,0,0,0.7)] font-mono">
      {/* Presenter Defense Commentary Drawer */}
      {showNotes && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 bg-bg-primary border-b border-border-subtle text-xs animate-in slide-in-from-bottom duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-mono text-[11px] text-tactical-amber font-bold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" /> // COMMITTEE DEFENSE BRIEFING:
              </div>
              <p className="text-text-primary text-xs leading-relaxed max-w-4xl">
                {currentStep.presenterNotes}
              </p>
            </div>
            <div className="hidden md:flex flex-col items-end gap-1 shrink-0 font-mono text-[10px] text-text-secondary">
              <span>Scientific Evaluation Sequence</span>
              <span className="text-tactical-cyan font-bold">Step {currentStep.stepNumber} of {PRESENTATION_STEPS.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Tactical Walkthrough Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Step Indicator & Title */}
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-7 h-7 bg-tactical-amber text-bg-primary font-mono font-bold text-xs tactical-corner">
            {String(currentStep.stepNumber).padStart(2, '0')}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-sm text-text-primary uppercase tracking-wider">
                {currentStep.title}
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 bg-tactical-amber/10 text-tactical-amber border border-tactical-amber/30 font-bold uppercase">
                STEP {currentStep.stepNumber} / 7
              </span>
            </div>
            <p className="text-xs text-text-secondary line-clamp-1">
              {currentStep.subtitle}
            </p>
          </div>
        </div>

        {/* 7-Step Navigation Pills */}
        <div className="hidden lg:flex items-center gap-1.5">
          {PRESENTATION_STEPS.map((s, idx) => (
            <button
              key={s.stepNumber}
              onClick={() => onSelectStepIndex(idx)}
              className={`px-2.5 py-1 text-[11px] font-mono transition-all flex items-center gap-1.5 border tactical-corner ${
                currentStepIndex === idx
                  ? 'bg-tactical-amber/15 text-tactical-amber border-tactical-amber/50 font-bold shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated border-border-subtle'
              }`}
              title={`Step ${s.stepNumber}: ${s.title}`}
            >
              <span>{s.stepNumber}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${currentStepIndex === idx ? 'bg-tactical-amber' : 'bg-text-secondary/40'}`} />
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 justify-between md:justify-end">
          {/* Toggle Notes */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-3 py-1.5 text-xs font-mono flex items-center gap-1.5 border transition-all tactical-corner ${
              showNotes
                ? 'bg-tactical-amber/20 text-tactical-amber border-tactical-amber/40'
                : 'bg-bg-card text-text-secondary hover:text-text-primary border-border-subtle'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Notes</span>
          </button>

          {/* Prev / Next buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="p-1.5 bg-bg-card border border-border-subtle text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all tactical-corner"
              title="Previous Step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentStepIndex === PRESENTATION_STEPS.length - 1}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-tactical-amber text-bg-primary font-heading font-bold text-xs hover:bg-tactical-amber/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all tactical-corner uppercase tracking-wider"
              title="Next Step"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Minimize / Close */}
          <div className="flex items-center gap-1 pl-1 border-l border-border-subtle">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors tactical-corner"
              title="Minimize Walkthrough"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-text-secondary hover:text-tactical-red hover:bg-bg-elevated transition-colors tactical-corner"
              title="Close Walkthrough"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};