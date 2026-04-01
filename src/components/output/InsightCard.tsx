import type { Insight } from '../../types';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

interface InsightCardProps {
  insight: Insight;
}

const severityConfig = {
  High: {
    badge: 'bg-red-100 text-red-700 border-red-200',
    border: 'border-l-red-400',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
  },
  Medium: {
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    border: 'border-l-amber-400',
    icon: AlertCircle,
    iconColor: 'text-amber-500',
  },
  Low: {
    badge: 'bg-green-100 text-green-700 border-green-200',
    border: 'border-l-green-400',
    icon: CheckCircle,
    iconColor: 'text-green-500',
  },
};

export default function InsightCard({ insight }: InsightCardProps) {
  const config = severityConfig[insight.severity];
  const Icon = config.icon;

  return (
    <div className={`bg-white border border-slate-200 border-l-4 ${config.border} rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${config.iconColor}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h4 className="text-sm font-semibold text-slate-800 leading-snug">{insight.title}</h4>
            <span
              className={`inline-flex shrink-0 items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.badge}`}
            >
              {insight.severity}
            </span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{insight.description}</p>
        </div>
      </div>
    </div>
  );
}
