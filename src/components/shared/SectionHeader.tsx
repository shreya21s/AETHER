import React from 'react';
import { ModuleStatus } from '@/types';
import { StatusBadge } from './StatusBadge';

interface SectionHeaderProps {
  moduleNumber?: number;
  categoryTag?: string;
  title: string;
  description: string;
  status?: ModuleStatus;
  actions?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  moduleNumber,
  categoryTag,
  title,
  description,
  status,
  actions,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 mb-6 border-b border-border-subtle">
      <div className="space-y-1.5 max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          {moduleNumber !== undefined && (
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
              MODULE {String(moduleNumber).padStart(2, '0')}
            </span>
          )}
          {categoryTag && (
            <span className="font-mono text-xs text-text-secondary uppercase tracking-wider">
              // {categoryTag}
            </span>
          )}
          {status && <StatusBadge status={status} size="sm" />}
        </div>
        <h1 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-text-primary">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          {description}
        </p>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
};

