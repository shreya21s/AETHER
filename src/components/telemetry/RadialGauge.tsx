import React from 'react';

interface RadialGaugeProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  subValue?: string;
  color?: 'cyan' | 'green' | 'amber' | 'red';
  size?: number;
  className?: string;
}

export const RadialGauge: React.FC<RadialGaugeProps> = ({
  label,
  value,
  min = 0,
  max = 100,
  unit = '%',
  subValue,
  color = 'cyan',
  size = 120,
  className = '',
}) => {
  const normalizedValue = Math.min(Math.max(value, min), max);
  const percentage = (normalizedValue - min) / (max - min);

  // SVG parameters
  const strokeWidth = 8;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // 240 degree gauge arc
  const arcFraction = 0.75;
  const arcLength = circumference * arcFraction;
  const strokeDashoffset = arcLength * (1 - percentage);

  const strokeColorMap = {
    cyan: '#06B6D4',
    green: '#22C55E',
    amber: '#F59E0B',
    red: '#EF4444',
  };

  const activeColor = strokeColorMap[color];

  return (
    <div className={`p-4 bg-bg-card border border-border-subtle tactical-corner flex flex-col items-center justify-between font-mono relative overflow-hidden ${className}`}>
      <div className="w-full flex items-center justify-between text-[10px] text-text-secondary uppercase mb-1">
        <span>{label}</span>
        <span style={{ color: activeColor }} className="font-bold">
          [{normalizedValue}
          {unit}]
        </span>
      </div>

      <div className="relative flex items-center justify-center my-1" style={{ width: size, height: size * 0.85 }}>
        <svg
          width={size}
          height={size}
          className="rotate-[135deg] overflow-visible"
          style={{ transformOrigin: '50% 50%' }}
        >
          {/* Background Track Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1E293B"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Active Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={activeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Readout Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span className="font-heading font-black text-xl text-text-primary tracking-tight">
            {normalizedValue}
            <span className="text-xs font-mono text-text-secondary ml-0.5">{unit}</span>
          </span>
          {subValue && (
            <span className="text-[9px] text-text-secondary font-mono mt-0.5 truncate max-w-[90px] text-center">
              {subValue}
            </span>
          )}
        </div>
      </div>

      {/* Ticks Range Indicator */}
      <div className="w-full flex justify-between text-[8px] text-text-muted mt-1 px-1 border-t border-border-subtle/50 pt-1">
        <span>{min}{unit}</span>
        <span className="text-tactical-cyan">MID {((max - min) / 2).toFixed(0)}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};