import React from 'react';

interface CompetencyBadgeProps {
  level: number;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const levelLabels: Record<number, string> = {
  1: 'Level 1: Foundation',
  2: 'Level 2: Developing',
  3: 'Level 3: Operational',
  4: 'Level 4: Advanced',
  5: 'Level 5: Master Expert'
};

const levelStyles: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  2: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-300' },
  3: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-300' },
  4: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-300' },
  5: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
};

export const CompetencyBadge: React.FC<CompetencyBadgeProps> = ({ level, showText = true, size = 'md' }) => {
  const clampedLevel = Math.max(1, Math.min(5, level || 1));
  const style = levelStyles[clampedLevel] || levelStyles[1];

  const sizeClass = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-medium px-2.5 py-1',
    lg: 'text-sm font-semibold px-3 py-1.5'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border ${style.bg} ${style.text} ${style.border} ${sizeClass}`}>
      <span className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((lvl) => (
          <span
            key={lvl}
            className={`w-1.5 h-3 rounded-xs ${
              lvl <= clampedLevel ? 'bg-current opacity-90' : 'bg-slate-300 opacity-40'
            }`}
          />
        ))}
      </span>
      <span>{showText ? levelLabels[clampedLevel] : `Lvl ${clampedLevel}`}</span>
    </span>
  );
};
