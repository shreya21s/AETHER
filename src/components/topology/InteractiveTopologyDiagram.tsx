import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Cpu, 
  HardDrive, 
  Wifi, 
  WifiOff, 
  Activity, 
  Server, 
  ArrowRight, 
  ShieldCheck, 
  Radio, 
  Layers, 
  Zap, 
  RefreshCw,
  Lock,
  Database
} from 'lucide-react';
import { ConnectivityMode, InferenceEnvironment } from '@/types';

interface InteractiveTopologyDiagramProps {
  connectivity: ConnectivityMode;
  onConnectivityChange?: (mode: ConnectivityMode) => void;
  activeInferenceEnv: InferenceEnvironment;
  onSelectInferenceEnv?: (env: InferenceEnvironment) => void;
  className?: string;
}

export const InteractiveTopologyDiagram: React.FC<InteractiveTopologyDiagramProps> = ({
  connectivity,
  onConnectivityChange,
  activeInferenceEnv,
  onSelectInferenceEnv,
  className = '',
}) => {
  const [selectedNode, setSelectedNode] = useState<InferenceEnvironment>(activeInferenceEnv);
  const [packetOffset, setPacketOffset] = useState(0);

  // Animated packet transmission loop
  useEffect(() => {
    const interval = setInterval(() => {
      setPacketOffset((prev) => (prev + 1) % 100);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const nodes = [
    {
      id: 'CLOUD' as InferenceEnvironment,
      name: 'CLOUD GPU NODE',
      sub: 'Centralized Hospital Hub',
      type: 'Remote High-Capacity Tier',
      status: connectivity === 'STABLE' ? 'ONLINE_NOMINAL' : connectivity === 'DEGRADED' ? 'HIGH_JITTER' : 'DISCONNECTED',
      statusColor: connectivity === 'STABLE' ? 'cyan' : connectivity === 'DEGRADED' ? 'amber' : 'red',
      model: 'Full Ensemble + Attention (FP32, 142.5 MB)',
      latency: connectivity === 'STABLE' ? '38 ms' : connectivity === 'DEGRADED' ? '512 ms' : 'Unreachable',
      packetLoss: connectivity === 'STABLE' ? '0.1%' : connectivity === 'DEGRADED' ? '22.4%' : '100%',
      security: 'TLS 1.3 + JWT Mutual Auth',
      role: 'Complex multi-variable inference & global registry updates when broadband is stable.',
      coords: { x: 120, y: 110 },
    },
    {
      id: 'EDGE' as InferenceEnvironment,
      name: 'EDGE CLIENT RUNTIME',
      sub: 'Primary Clinic Hardware',
      type: 'On-Device Quantized Execution',
      status: 'ACTIVE_DISPATCH',
      statusColor: 'green',
      model: 'Quantized INT8 Tree Ensembles (~11.8 MB)',
      latency: '24 ms (Direct)',
      packetLoss: '0.0% (Local Bus)',
      security: 'Sandboxed Client Memory (Zero WAN Transit)',
      role: 'Autonomous risk screening on field tablet or laptop without cloud dependency.',
      coords: { x: 400, y: 110 },
    },
    {
      id: 'OFFLINE' as InferenceEnvironment,
      name: 'AIR-GAPPED STORE',
      sub: 'Disconnected Local State',
      type: 'Encrypted Persistence & Sync Queue',
      status: connectivity === 'OFFLINE' ? 'PRIMARY_FAILOVER' : 'STANDBY_READY',
      statusColor: connectivity === 'OFFLINE' ? 'amber' : 'slate',
      model: 'Pre-Compiled Local Binary Weights (~11.8 MB)',
      latency: '18 ms (Zero Ping)',
      packetLoss: 'N/A (Air-Gapped)',
      security: 'AES-GCM-256 Local Encrypted IndexedDB',
      role: 'Persists screening assessments locally in remote outposts; auto-reconciles on link recovery.',
      coords: { x: 680, y: 110 },
    },
  ];

  const activeNodeInfo = nodes.find((n) => n.id === selectedNode) || nodes[1];

  return (
    <div className={`telemetry-panel p-5 tactical-corner bg-[#111622] border-border-subtle relative overflow-hidden font-mono ${className}`}>
      {/* Header with Link Controller Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-tactical-cyan animate-pulse" />
            <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-text-primary">
              Distributed Cloud ↔ Edge ↔ Offline Topology Matrix
            </h3>
          </div>
          <span className="text-[10px] text-text-secondary">
            Dynamic Failover &amp; Information Transmission Architecture
          </span>
        </div>

        {/* Real-time Link Simulation Controls */}
        {onConnectivityChange && (
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="text-text-secondary uppercase">Link State:</span>
            <button
              onClick={() => onConnectivityChange('STABLE')}
              className={`px-2 py-0.5 border tactical-corner transition-all ${
                connectivity === 'STABLE'
                  ? 'bg-tactical-cyan/15 text-tactical-cyan border-tactical-cyan'
                  : 'bg-bg-primary text-text-secondary border-border-subtle'
              }`}
            >
              4G_ONLINE
            </button>
            <button
              onClick={() => onConnectivityChange('DEGRADED')}
              className={`px-2 py-0.5 border tactical-corner transition-all ${
                connectivity === 'DEGRADED'
                  ? 'bg-tactical-amber/15 text-tactical-amber border-tactical-amber'
                  : 'bg-bg-primary text-text-secondary border-border-subtle'
              }`}
            >
              2G_JITTER
            </button>
            <button
              onClick={() => onConnectivityChange('OFFLINE')}
              className={`px-2 py-0.5 border tactical-corner transition-all ${
                connectivity === 'OFFLINE'
                  ? 'bg-tactical-red/15 text-tactical-red border-tactical-red'
                  : 'bg-bg-primary text-text-secondary border-border-subtle'
              }`}
            >
              AIR_GAPPED
            </button>
          </div>
        )}
      </div>

      {/* Interactive SVG Diagram Canvas */}
      <div className="relative mt-4 bg-[#090D14] border border-border-subtle p-4 min-h-[260px] tactical-corner overflow-x-auto">
        <div className="absolute inset-0 bg-tactical-grid opacity-25 pointer-events-none" />

        <svg viewBox="0 0 800 220" className="w-full h-auto min-w-[720px]">
          <defs>
            <linearGradient id="cloudEdgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity={connectivity === 'OFFLINE' ? 0.1 : 0.8} />
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="edgeOfflineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22C55E" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.8" />
            </linearGradient>

            <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* TRANSMISSION PATH 1: CLOUD ↔ EDGE */}
          <path
            d="M 180 110 L 340 110"
            stroke={connectivity === 'OFFLINE' ? '#EF4444' : connectivity === 'DEGRADED' ? '#F59E0B' : '#06B6D4'}
            strokeWidth="2.5"
            strokeDasharray={connectivity === 'DEGRADED' ? '6 4' : connectivity === 'OFFLINE' ? '2 6' : 'none'}
            fill="none"
          />

          {/* Animated Flow Packets along Path 1 */}
          {connectivity !== 'OFFLINE' && (
            <circle
              cx={180 + ((packetOffset * 1.6) % 160)}
              cy="110"
              r="4"
              fill={connectivity === 'DEGRADED' ? '#F59E0B' : '#06B6D4'}
              filter="url(#nodeGlow)"
            />
          )}

          {/* Link Status Label 1 */}
          <text
            x="260"
            y="98"
            fill={connectivity === 'STABLE' ? '#06B6D4' : connectivity === 'DEGRADED' ? '#F59E0B' : '#EF4444'}
            fontSize="9"
            fontFamily="monospace"
            textAnchor="middle"
            fontWeight="bold"
          >
            {connectivity === 'STABLE' ? 'TLS 1.3 WAN // 38ms' : connectivity === 'DEGRADED' ? 'HIGH JITTER // 512ms' : 'LINK SEVERED'}
          </text>

          {/* TRANSMISSION PATH 2: EDGE ↔ OFFLINE (Local Memory Bus / Transaction Queue) */}
          <path
            d="M 460 110 L 620 110"
            stroke="#22C55E"
            strokeWidth="2.5"
            strokeDasharray="4 2"
            fill="none"
          />

          {/* Animated Flow Packets along Path 2 */}
          <circle
            cx={460 + ((packetOffset * 1.6) % 160)}
            cy="110"
            r="4"
            fill="#22C55E"
            filter="url(#nodeGlow)"
          />

          {/* Link Status Label 2 */}
          <text
            x="540"
            y="98"
            fill="#22C55E"
            fontSize="9"
            fontFamily="monospace"
            textAnchor="middle"
            fontWeight="bold"
          >
            INTERNAL_STORAGE_BUS // 0ms
          </text>

          {/* THREE INTERACTIVE TOPOLOGY NODES */}
          {nodes.map((node) => {
            const isSelected = selectedNode === node.id;
            const isCurrentlyExecuting = activeInferenceEnv === node.id;

            return (
              <g
                key={node.id}
                onClick={() => {
                  setSelectedNode(node.id);
                  if (onSelectInferenceEnv) onSelectInferenceEnv(node.id);
                }}
                className="cursor-pointer group"
                transform={`translate(${node.coords.x}, ${node.coords.y})`}
              >
                {/* Outer Glow Halo if executing */}
                {isCurrentlyExecuting && (
                  <circle
                    cx="0"
                    cy="0"
                    r="44"
                    fill="none"
                    stroke={node.statusColor === 'cyan' ? '#06B6D4' : node.statusColor === 'green' ? '#22C55E' : '#F59E0B'}
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    className="animate-spin"
                    style={{ transformOrigin: '0 0' }}
                  />
                )}

                {/* Base Node Block */}
                <rect
                  x="-52"
                  y="-42"
                  width="104"
                  height="84"
                  fill="#111622"
                  stroke={isSelected ? '#06B6D4' : isCurrentlyExecuting ? '#22C55E' : '#334155'}
                  strokeWidth={isSelected ? '2' : '1.5'}
                  className="group-hover:stroke-tactical-cyan transition-colors"
                />

                {/* Corner Accents */}
                <path d="M -52 -32 L -52 -42 L -42 -42" stroke={isSelected ? '#06B6D4' : '#64748B'} strokeWidth="1.5" fill="none" />
                <path d="M 52 -32 L 52 -42 L 42 -42" stroke={isSelected ? '#06B6D4' : '#64748B'} strokeWidth="1.5" fill="none" />
                <path d="M -52 32 L -52 42 L -42 42" stroke={isSelected ? '#06B6D4' : '#64748B'} strokeWidth="1.5" fill="none" />
                <path d="M 52 32 L 52 42 L 42 42" stroke={isSelected ? '#06B6D4' : '#64748B'} strokeWidth="1.5" fill="none" />

                {/* Node Status Dot */}
                <circle
                  cx="-38"
                  cy="-28"
                  r="3.5"
                  fill={
                    node.statusColor === 'cyan' ? '#06B6D4' :
                    node.statusColor === 'green' ? '#22C55E' :
                    node.statusColor === 'amber' ? '#F59E0B' :
                    node.statusColor === 'red' ? '#EF4444' : '#64748B'
                  }
                  className="animate-pulse"
                />

                {/* Node Identifier Code */}
                <text x="-28" y="-25" fill="#94A3B8" fontSize="8" fontFamily="monospace">
                  NODE_{node.id}
                </text>

                {/* Node Title */}
                <text x="0" y="2" fill="#E5E7EB" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  {node.name.split(' ')[0]}
                </text>
                <text x="0" y="14" fill="#94A3B8" fontSize="8" fontFamily="monospace" textAnchor="middle">
                  {node.name.split(' ').slice(1).join(' ')}
                </text>

                {/* Node Active State Banner */}
                {isCurrentlyExecuting ? (
                  <rect x="-42" y="22" width="84" height="14" fill="#22C55E" rx="0" />
                ) : (
                  <rect x="-42" y="22" width="84" height="14" fill="#182231" stroke="#334155" strokeWidth="1" rx="0" />
                )}
                <text
                  x="0"
                  y="32"
                  fill={isCurrentlyExecuting ? '#0B0E14' : '#64748B'}
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {isCurrentlyExecuting ? '[ACTIVE ROUTE]' : '[STANDBY]'}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Node Telemetry Inspector Card */}
      <div className="mt-4 p-4 bg-[#0E131E] border border-border-subtle tactical-corner space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tactical-cyan" />
            <h4 className="font-heading font-bold text-xs sm:text-sm text-text-primary tracking-wider uppercase">
              NODE INSPECTOR // {activeNodeInfo.name} ({activeNodeInfo.type})
            </h4>
          </div>
          <span className={`px-2 py-0.5 text-[10px] font-bold border tactical-corner ${
            activeNodeInfo.statusColor === 'cyan' ? 'bg-tactical-cyan/15 text-tactical-cyan border-tactical-cyan/40' :
            activeNodeInfo.statusColor === 'green' ? 'bg-tactical-green/15 text-tactical-green border-tactical-green/40' :
            activeNodeInfo.statusColor === 'amber' ? 'bg-tactical-amber/15 text-tactical-amber border-tactical-amber/40' :
            'bg-tactical-red/15 text-tactical-red border-tactical-red/40'
          }`}>
            [{activeNodeInfo.status}]
          </span>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed font-sans">
          {activeNodeInfo.role}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 bg-bg-primary border border-border-subtle tactical-corner">
            <div className="text-[10px] text-text-secondary uppercase">Execution Model</div>
            <div className="text-text-primary font-bold text-[11px] truncate mt-0.5">{activeNodeInfo.model}</div>
          </div>

          <div className="p-2.5 bg-bg-primary border border-border-subtle tactical-corner">
            <div className="text-[10px] text-text-secondary uppercase">Round-Trip Latency</div>
            <div className="text-tactical-cyan font-bold text-[11px] mt-0.5">{activeNodeInfo.latency}</div>
          </div>

          <div className="p-2.5 bg-bg-primary border border-border-subtle tactical-corner">
            <div className="text-[10px] text-text-secondary uppercase">Channel Loss</div>
            <div className="text-tactical-amber font-bold text-[11px] mt-0.5">{activeNodeInfo.packetLoss}</div>
          </div>

          <div className="p-2.5 bg-bg-primary border border-border-subtle tactical-corner">
            <div className="text-[10px] text-text-secondary uppercase">Security Isolation</div>
            <div className="text-tactical-green font-bold text-[11px] truncate mt-0.5">{activeNodeInfo.security}</div>
          </div>
        </div>
      </div>
    </div>
  );
};