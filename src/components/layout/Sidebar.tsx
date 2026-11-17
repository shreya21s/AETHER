import React from 'react';
import { 
  LayoutDashboard, 
  Stethoscope, 
  Cpu, 
  HelpCircle, 
  GitFork, 
  Layers, 
  Activity, 
  Users, 
  FileSpreadsheet, 
  Milestone,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Server,
  Terminal,
  Radio
} from 'lucide-react';
import { SYSTEM_MODULES_STATUS } from '@/config/features';

export interface NavItemConfig {
  id: string;
  code: string;
  name: string;
  route: string;
  icon: React.ReactNode;
  featureKey: string;
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'overview',
    code: '01',
    name: 'Overview',
    route: 'overview',
    icon: <LayoutDashboard className="w-4 h-4" />,
    featureKey: 'overview',
  },
  {
    id: 'assessment',
    code: '02',
    name: 'Patient Assessment',
    route: 'assessment',
    icon: <Stethoscope className="w-4 h-4" />,
    featureKey: 'clinicalAssessment',
  },
  {
    id: 'uncertainty',
    code: '03',
    name: 'Clinical Intelligence',
    route: 'uncertainty',
    icon: <HelpCircle className="w-4 h-4" />,
    featureKey: 'uncertaintyIntelligence',
  },
  {
    id: 'acquisition',
    code: '04',
    name: 'Adaptive Acquisition',
    route: 'acquisition',
    icon: <GitFork className="w-4 h-4" />,
    featureKey: 'adaptiveAcquisition',
  },
  {
    id: 'adaptive-inference',
    code: '05',
    name: 'Inference Engine',
    route: 'adaptive-inference',
    icon: <Cpu className="w-4 h-4" />,
    featureKey: 'adaptiveInference',
  },
  {
    id: 'resources',
    code: '06',
    name: 'Network Monitoring',
    route: 'resources',
    icon: <Activity className="w-4 h-4" />,
    featureKey: 'resourceMonitoring',
  },
  {
    id: 'architecture',
    code: '07',
    name: 'System Architecture',
    route: 'architecture',
    icon: <Layers className="w-4 h-4" />,
    featureKey: 'systemArchitecture',
  },
  {
    id: 'records',
    code: '08',
    name: 'Patient Registry',
    route: 'records',
    icon: <Users className="w-4 h-4" />,
    featureKey: 'patientRecords',
  },
  {
    id: 'research',
    code: '09',
    name: 'Research & Analytics',
    route: 'research',
    icon: <FileSpreadsheet className="w-4 h-4" />,
    featureKey: 'researchEvaluation',
  },
  {
    id: 'roadmap',
    code: '10',
    name: 'System Settings',
    route: 'roadmap',
    icon: <Milestone className="w-4 h-4" />,
    featureKey: 'developmentRoadmap',
  },
];

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  collapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const sidebarWidth = collapsed ? 'w-16' : 'w-60';

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Main Persistent Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 flex flex-col justify-between bg-[#0E131E] border-r border-border-subtle transition-all duration-200 font-mono ${sidebarWidth} ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Header row in sidebar */}
          <div className="h-14 px-3.5 flex items-center justify-between border-b border-border-subtle">
            {!collapsed ? (
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-tactical-cyan animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  CONTROL_NAV
                </span>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <Radio className="w-4 h-4 text-tactical-cyan" />
              </div>
            )}

            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1 rounded-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-1.5 space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const feature = SYSTEM_MODULES_STATUS[item.featureKey];
              const status = feature ? feature.status : 'PLANNED';
              const isActive = currentRoute === item.route;

              const ledColor =
                status === 'IMPLEMENTED'
                  ? 'bg-tactical-green shadow-[0_0_6px_#22C55E]'
                  : status === 'IN_DEVELOPMENT'
                  ? 'bg-tactical-amber shadow-[0_0_6px_#F59E0B]'
                  : 'bg-slate-500';

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.route);
                    onCloseMobile();
                  }}
                  title={collapsed ? `${item.name} (${status})` : undefined}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-sm text-xs transition-all group ${
                    isActive
                      ? 'bg-[#182231] text-tactical-cyan border-l-2 border-l-tactical-cyan border-y border-r border-border-subtle font-bold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-[#141B27] border-l-2 border-l-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={`${isActive ? 'text-tactical-cyan' : 'text-text-muted group-hover:text-text-primary'}`}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className="truncate tracking-wide text-left text-[11px] font-sans font-medium">
                        {item.name}
                      </span>
                    )}
                  </div>

                  {!collapsed && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full ${ledColor}`} />
                      <span className="text-[9px] text-text-muted">
                        {item.code}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-border-subtle bg-[#0A0D15]">
          {!collapsed ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-text-primary font-bold">
                <span className="flex items-center gap-1.5 text-tactical-cyan">
                  <ShieldCheck className="w-3 h-3" />
                  SYS_SECURITY
                </span>
                <span className="text-tactical-green">ENCRYPTED</span>
              </div>
              <p className="text-[9px] text-text-muted leading-tight">
                OFFLINE-FIRST AIRGAP ARCHITECTURE
              </p>
            </div>
          ) : (
            <div className="flex justify-center" title="Mission Security Active">
              <span className="w-2 h-2 rounded-full bg-tactical-cyan animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
