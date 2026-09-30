import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

interface GapBadgeProps {
  gap: number;
  requiredLevel?: number;
  currentLevel?: number;
}

export const GapBadge: React.FC<GapBadgeProps> = ({ gap }) => {
  if (gap <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5" />
        On Track (Met)
      </span>
    );
  }

  if (gap === 1) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <AlertTriangle className="w-3.5 h-3.5" />
        Needs Dev (-1 Level)
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
      <AlertCircle className="w-3.5 h-3.5" />
      Critical Gap (-{gap} Levels)
    </span>
  );
};
