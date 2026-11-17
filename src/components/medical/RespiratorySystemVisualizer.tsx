import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Wind, 
  AlertTriangle, 
  ShieldCheck, 
  Maximize2, 
  Info,
  Layers,
  Sparkles,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface RespiratorySystemVisualizerProps {
  fev1FvcRatio?: number;
  interactive?: boolean;
  className?: string;
  showHotspots?: boolean;
}

export const RespiratorySystemVisualizer: React.FC<RespiratorySystemVisualizerProps> = ({
  fev1FvcRatio = 0.68,
  interactive = true,
  className = '',
  showHotspots = true,
}) => {
  const [airwayMode, setAirwayMode] = useState<'AUTO' | 'NORMAL' | 'OBSTRUCTED'>('AUTO');
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [breathPhase, setBreathPhase] = useState<'INSPIRATION' | 'EXPIRATION'>('INSPIRATION');
  const [pulseCount, setPulseCount] = useState(0);

  // Determine active physiological presentation
  const isObstructed = airwayMode === 'OBSTRUCTED' || (airwayMode === 'AUTO' && fev1FvcRatio < 0.70);

  // Breathing cycle animation ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathPhase((prev) => (prev === 'INSPIRATION' ? 'EXPIRATION' : 'INSPIRATION'));
      setPulseCount((c) => (c + 1) % 100);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const hotspots = [
    {
      id: 'trachea',
      title: 'TRACHEA & CARINA',
      cx: 200,
      cy: 95,
      detail: 'Main airway conduit (inner diam. ~18mm). Laminar flow velocity 1.2 m/s.',
      param: 'Resistance Raw: 0.8 cmH2O/L/s',
      status: 'PATENT',
    },
    {
      id: 'right_bronchus',
      title: 'RIGHT MAIN BRONCHUS',
      cx: 155,
      cy: 165,
      detail: 'Steeper bifurcation (25° angle). Primary locus for airborne particle deposition.',
      param: 'Airflow partition: 54% volume',
      status: isObstructed ? 'MILD_TURBULENCE' : 'NOMINAL',
    },
    {
      id: 'left_bronchus',
      title: 'LEFT SECONDARY BRONCHI',
      cx: 245,
      cy: 170,
      detail: '45° takeoff angle passing under aortic arch. Narrowed cross-sectional lumen.',
      param: isObstructed ? 'Dynamic collapse under forced expiration' : 'Laminar transit',
      status: isObstructed ? 'AIRWAY_REDUCTION' : 'NOMINAL',
    },
    {
      id: 'alveolar_zone',
      title: 'TERMINAL ALVEOLAR SACS',
      cx: 280,
      cy: 250,
      detail: 'Microscopic gas-exchange interface (~300M alveoli). Diffusion surface area ~100m².',
      param: isObstructed ? 'Loss of elastic recoil, air trapping' : 'Compliance: 0.2 L/cmH2O',
      status: isObstructed ? 'HYPERINFLATION' : 'NORMAL_DIFFUSION',
    },
  ];

  return (
    <div className={`telemetry-panel p-5 tactical-corner bg-[#111622] border-border-subtle relative overflow-hidden font-mono ${className}`}>
      {/* Visualizer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-tactical-cyan animate-pulse tactical-corner" />
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-text-primary flex items-center gap-2">
            <Wind className="w-4 h-4 text-tactical-cyan" />
            Anatomical Pulmonary &amp; Airflow Telemetry
          </h3>
        </div>

        {/* Airway condition toggle */}
        {interactive && (
          <div className="flex items-center gap-1.5 text-[10px]">
            <button
              onClick={() => setAirwayMode('AUTO')}
              className={`px-2 py-1 rounded-none border transition-all ${
                airwayMode === 'AUTO'
                  ? 'bg-tactical-cyan/15 text-tactical-cyan border-tactical-cyan'
                  : 'bg-bg-primary text-text-secondary border-border-subtle hover:text-text-primary'
              }`}
            >
              AUTO [RATIO: {fev1FvcRatio.toFixed(2)}]
            </button>
            <button
              onClick={() => setAirwayMode('NORMAL')}
              className={`px-2 py-1 rounded-none border transition-all ${
                airwayMode === 'NORMAL'
                  ? 'bg-tactical-green/15 text-tactical-green border-tactical-green'
                  : 'bg-bg-primary text-text-secondary border-border-subtle hover:text-text-primary'
              }`}
            >
              PATENT (NORMAL)
            </button>
            <button
              onClick={() => setAirwayMode('OBSTRUCTED')}
              className={`px-2 py-1 rounded-none border transition-all ${
                airwayMode === 'OBSTRUCTED'
                  ? 'bg-tactical-amber/15 text-tactical-amber border-tactical-amber'
                  : 'bg-bg-primary text-text-secondary border-border-subtle hover:text-text-primary'
              }`}
            >
              OBSTRUCTED (COPD)
            </button>
          </div>
        )}
      </div>

      {/* Main Visualizer Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4 items-center">
        {/* SVG Anatomical Diagram with Animated Airflow */}
        <div className="lg:col-span-7 relative flex items-center justify-center bg-[#090D14] border border-border-subtle p-3 min-h-[340px] tactical-corner overflow-hidden">
          {/* Tactical Crosshair Background Grids */}
          <div className="absolute inset-0 bg-tactical-grid opacity-30 pointer-events-none" />
          
          {/* HUD Corner Indicators */}
          <div className="absolute top-2 left-2 text-[9px] text-text-secondary">
            FOV: THORACIC_AP // 500x400
          </div>
          <div className="absolute top-2 right-2 text-[9px] text-tactical-cyan flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-tactical-cyan animate-ping" />
            CYCLE: [{breathPhase}]
          </div>

          <svg
            viewBox="0 0 400 360"
            className="w-full h-auto max-w-[380px] filter drop-shadow-[0_0_20px_rgba(6,182,212,0.15)]"
          >
            <defs>
              {/* Radial gradient for lung parenchyma */}
              <radialGradient id="leftLungGrad" cx="60%" cy="50%" r="50%">
                <stop offset="0%" stopColor={isObstructed ? '#F59E0B' : '#06B6D4'} stopOpacity="0.25" />
                <stop offset="80%" stopColor="#111622" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0B0E14" stopOpacity="0.95" />
              </radialGradient>

              <radialGradient id="rightLungGrad" cx="40%" cy="50%" r="50%">
                <stop offset="0%" stopColor={isObstructed ? '#F59E0B' : '#06B6D4'} stopOpacity="0.25" />
                <stop offset="80%" stopColor="#111622" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0B0E14" stopOpacity="0.95" />
              </radialGradient>

              {/* Glowing filter for active conduits */}
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Thorax Silhouette & Ribcage Outlines (Faint Tactical Blueprint) */}
            <g stroke="#1E293B" strokeWidth="1" fill="none" opacity="0.4">
              <path d="M 80 120 Q 200 90 320 120" />
              <path d="M 70 160 Q 200 130 330 160" />
              <path d="M 65 200 Q 200 170 335 200" />
              <path d="M 70 240 Q 200 210 330 240" />
              <path d="M 85 280 Q 200 250 315 280" />
              <path d="M 110 320 Q 200 290 290 320" />
            </g>

            {/* RIGHT LUNG (3 Lobes Outline) */}
            <path
              d="M 180 120 
                 C 140 110, 85 140, 75 190
                 C 65 240, 80 290, 110 320
                 C 140 335, 175 320, 185 285
                 C 190 240, 185 160, 180 120 Z"
              fill="url(#rightLungGrad)"
              stroke={isObstructed ? '#F59E0B' : '#06B6D4'}
              strokeWidth="1.5"
              strokeDasharray={isObstructed ? '4 2' : 'none'}
              className="transition-all duration-700"
            />

            {/* LEFT LUNG (2 Lobes Outline with Cardiac Notch) */}
            <path
              d="M 220 120 
                 C 260 110, 315 140, 325 190
                 C 335 240, 320 290, 290 320
                 C 260 335, 230 315, 222 280
                 C 215 245, 205 210, 215 160
                 C 218 140, 219 125, 220 120 Z"
              fill="url(#leftLungGrad)"
              stroke={isObstructed ? '#F59E0B' : '#06B6D4'}
              strokeWidth="1.5"
              strokeDasharray={isObstructed ? '4 2' : 'none'}
              className="transition-all duration-700"
            />

            {/* Cardiac Notch Indicator */}
            <path
              d="M 205 210 Q 220 245 222 280"
              stroke="#EF4444"
              strokeWidth="1"
              strokeDasharray="2 2"
              fill="none"
              opacity="0.6"
            />
            <text x="210" y="248" fill="#EF4444" fontSize="8" fontFamily="monospace" opacity="0.8">
              CARDIAC_NOTCH
            </text>

            {/* TRACHEA (Anterior Cartilage Rings) */}
            <g stroke="#334155" strokeWidth="1.5" fill="none">
              <line x1="190" y1="35" x2="210" y2="35" />
              <line x1="190" y1="45" x2="210" y2="45" />
              <line x1="190" y1="55" x2="210" y2="55" />
              <line x1="190" y1="65" x2="210" y2="65" />
              <line x1="190" y1="75" x2="210" y2="75" />
              <line x1="190" y1="85" x2="210" y2="85" />
              <line x1="190" y1="95" x2="210" y2="95" />
            </g>

            {/* Tracheal Walls */}
            <path
              d="M 190 30 L 190 100 L 165 140 M 210 30 L 210 100 L 235 140"
              stroke="#E2E8F0"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />

            {/* BRONCHIAL TREE (Bifurcations) */}
            {/* Right Main Bronchus & Lobar Branches */}
            <g stroke={isObstructed ? '#F59E0B' : '#06B6D4'} strokeWidth="2" fill="none" strokeLinecap="round">
              {/* Right main */}
              <path d="M 190 100 Q 170 120 155 145" />
              {/* Right upper lobe */}
              <path d="M 165 130 Q 140 135 115 150" strokeWidth="1.5" />
              <path d="M 115 150 Q 100 145 90 160" strokeWidth="1" />
              {/* Right middle lobe */}
              <path d="M 155 145 Q 130 180 110 205" strokeWidth="1.5" />
              <path d="M 110 205 Q 95 210 85 230" strokeWidth="1" />
              {/* Right lower lobe */}
              <path d="M 155 145 Q 150 195 140 245" strokeWidth="1.5" />
              <path d="M 140 245 Q 130 270 120 295" strokeWidth="1" />
              <path d="M 140 245 Q 155 270 160 290" strokeWidth="1" />
            </g>

            {/* Left Main Bronchus & Lobar Branches */}
            <g stroke={isObstructed ? '#F59E0B' : '#06B6D4'} strokeWidth="2" fill="none" strokeLinecap="round">
              {/* Left main */}
              <path d="M 210 100 Q 235 125 245 150" />
              {/* Left upper lobe */}
              <path d="M 235 135 Q 265 140 290 155" strokeWidth="1.5" />
              <path d="M 290 155 Q 305 150 315 165" strokeWidth="1" />
              {/* Left lingula */}
              <path d="M 245 150 Q 275 185 295 210" strokeWidth="1.5" />
              {/* Left lower lobe */}
              <path d="M 245 150 Q 250 200 260 250" strokeWidth="1.5" />
              <path d="M 260 250 Q 270 275 280 300" strokeWidth="1" />
              <path d="M 260 250 Q 245 275 240 295" strokeWidth="1" />
            </g>

            {/* DYNAMIC AIRFLOW PARTICLES (Animated along pathways) */}
            <g filter="url(#neonGlow)">
              {/* Central Tracheal Particle Stream */}
              <circle
                cx="200"
                cy={35 + ((pulseCount * 4) % 65)}
                r="2.5"
                fill={isObstructed ? '#FBBF24' : '#22C55E'}
                className="animate-pulse"
              />
              <circle
                cx="200"
                cy={35 + (((pulseCount + 15) * 4) % 65)}
                r="2.5"
                fill={isObstructed ? '#F59E0B' : '#06B6D4'}
              />

              {/* Right Bronchus Flow */}
              <circle
                cx={190 - ((pulseCount * 1.5) % 45)}
                cy={100 + ((pulseCount * 2.2) % 65)}
                r="2"
                fill={isObstructed ? '#EF4444' : '#06B6D4'}
              />

              {/* Left Bronchus Flow */}
              <circle
                cx={210 + ((pulseCount * 1.5) % 45)}
                cy={100 + ((pulseCount * 2.2) % 65)}
                r="2"
                fill={isObstructed ? '#EF4444' : '#06B6D4'}
              />

              {/* Peripheral Alveolar Flow or Turbulence */}
              {isObstructed ? (
                // Eddying turbulent markers in obstructed state
                <>
                  <circle cx="130" cy="180" r="3" fill="#EF4444" opacity="0.8" className="animate-ping" />
                  <circle cx="275" cy="185" r="3" fill="#F59E0B" opacity="0.8" className="animate-ping" />
                  <text x="100" y="175" fill="#EF4444" fontSize="8" fontFamily="monospace">
                    ▲ TURBULENCE
                  </text>
                  <text x="250" y="180" fill="#F59E0B" fontSize="8" fontFamily="monospace">
                    ▲ AIRWAY RESISTANCE ↑
                  </text>
                </>
              ) : (
                // Smooth alveolar distribution markers
                <>
                  <circle cx="120" cy="270" r="2" fill="#22C55E" opacity="0.9" />
                  <circle cx="280" cy="265" r="2" fill="#22C55E" opacity="0.9" />
                  <circle cx="105" cy="210" r="1.5" fill="#06B6D4" opacity="0.9" />
                  <circle cx="295" cy="210" r="1.5" fill="#06B6D4" opacity="0.9" />
                </>
              )}
            </g>

            {/* INTERACTIVE HOTSPOTS */}
            {showHotspots &&
              hotspots.map((h) => {
                const isSelected = selectedHotspot === h.id;
                return (
                  <g
                    key={h.id}
                    onClick={() => setSelectedHotspot(isSelected ? null : h.id)}
                    className="cursor-pointer group"
                  >
                    <circle
                      cx={h.cx}
                      cy={h.cy}
                      r="9"
                      fill="#0B0E14"
                      stroke={isSelected ? '#F59E0B' : '#06B6D4'}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      className="group-hover:stroke-tactical-amber transition-colors"
                    />
                    <circle
                      cx={h.cx}
                      cy={h.cy}
                      r="4"
                      fill={isSelected ? '#F59E0B' : '#06B6D4'}
                      className="animate-pulse"
                    />
                    <text
                      x={h.cx + 12}
                      y={h.cy + 4}
                      fill={isSelected ? '#F59E0B' : '#94A3B8'}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      [{h.id.toUpperCase().substring(0, 4)}]
                    </text>
                  </g>
                );
              })}
          </svg>
        </div>

        {/* Real-time Physiological Telemetry Readout */}
        <div className="lg:col-span-5 space-y-3.5">
          {/* Status Indicator Card */}
          <div className={`p-4 bg-bg-primary border tactical-corner space-y-2 ${
            isObstructed ? 'border-tactical-amber/50 bg-tactical-amber/5' : 'border-tactical-green/50 bg-tactical-green/5'
          }`}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary uppercase">PULMONARY PHENOTYPE:</span>
              <span className={`px-2 py-0.5 text-[10px] font-bold border tactical-corner ${
                isObstructed
                  ? 'bg-tactical-amber/15 text-tactical-amber border-tactical-amber/40'
                  : 'bg-tactical-green/15 text-tactical-green border-tactical-green/40'
              }`}>
                {isObstructed ? 'OBSTRUCTIVE_PATTERN' : 'PRESERVED_PHYSIOLOGY'}
              </span>
            </div>

            <div className="text-sm font-heading font-black text-text-primary">
              {isObstructed ? 'Airflow Limitation Detected' : 'Unobstructed Airway Transit'}
            </div>

            <p className="text-[11px] text-text-secondary leading-relaxed font-sans">
              {isObstructed
                ? 'Expiratory flow limitation identified. Airway resistance elevated across distal bronchioles with potential gas trapping in alveolar units.'
                : 'Laminar velocity profiles preserved throughout primary tracheobronchial tree. Elastic alveolar recoil within physiological reference bounds.'}
            </p>
          </div>

          {/* Key Physiological Vector Parameters */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 bg-bg-primary border border-border-subtle tactical-corner">
              <div className="text-[10px] text-text-secondary uppercase">FEV1 / FVC Ratio</div>
              <div className={`text-lg font-bold font-mono mt-0.5 ${
                fev1FvcRatio < 0.70 ? 'text-tactical-amber' : 'text-tactical-green'
              }`}>
                {fev1FvcRatio.toFixed(2)}
              </div>
              <div className="text-[9px] text-text-secondary">Cut-off: 0.70 (GOLD Standard)</div>
            </div>

            <div className="p-3 bg-bg-primary border border-border-subtle tactical-corner">
              <div className="text-[10px] text-text-secondary uppercase">Airway Mechanics</div>
              <div className="text-lg font-bold font-mono text-tactical-cyan mt-0.5">
                {isObstructed ? '2.4 cmH2O' : '1.1 cmH2O'}
              </div>
              <div className="text-[9px] text-text-secondary">Airway Resistance Raw</div>
            </div>

            <div className="p-3 bg-bg-primary border border-border-subtle tactical-corner">
              <div className="text-[10px] text-text-secondary uppercase">Flow Pattern</div>
              <div className="text-sm font-bold font-mono text-text-primary mt-0.5">
                {isObstructed ? 'TURBULENT / SCOOP' : 'LAMINAR CONE'}
              </div>
              <div className="text-[9px] text-text-secondary">Expiratory curve shape</div>
            </div>

            <div className="p-3 bg-bg-primary border border-border-subtle tactical-corner">
              <div className="text-[10px] text-text-secondary uppercase">Ventilation Sync</div>
              <div className="text-sm font-bold font-mono text-tactical-green mt-0.5">
                {breathPhase}
              </div>
              <div className="text-[9px] text-text-secondary">2.8s Cadence cycle</div>
            </div>
          </div>

          {/* Selected Hotspot Inspection Drawer */}
          {selectedHotspot && (
            <div className="p-3.5 bg-[#141B27] border border-tactical-cyan/40 tactical-corner space-y-1 animate-in fade-in duration-200">
              {(() => {
                const spot = hotspots.find((h) => h.id === selectedHotspot);
                if (!spot) return null;
                return (
                  <>
                    <div className="flex items-center justify-between text-[11px] font-bold text-tactical-cyan">
                      <span>[{spot.title}]</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-tactical-cyan/10 border border-tactical-cyan/30">
                        {spot.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-primary font-sans leading-snug pt-1">
                      {spot.detail}
                    </p>
                    <div className="text-[10px] text-tactical-amber font-mono pt-1">
                      &gt; {spot.param}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};