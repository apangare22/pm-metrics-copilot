import { useState } from 'react';
import type { InsightPanel } from '../../types';
import InsightCard from './InsightCard';
import { Copy, Check } from 'lucide-react';

interface AnalysisPanelProps {
  panel: InsightPanel;
}

const panelConfig = {
  churn: {
    headerBg: 'bg-red-600',
    headerText: 'text-white',
    summaryBg: 'bg-red-50',
    summaryBorder: 'border-red-100',
    summaryText: 'text-red-800',
  },
  ab_test: {
    headerBg: 'bg-blue-600',
    headerText: 'text-white',
    summaryBg: 'bg-blue-50',
    summaryBorder: 'border-blue-100',
    summaryText: 'text-blue-800',
  },
  funnel: {
    headerBg: 'bg-orange-500',
    headerText: 'text-white',
    summaryBg: 'bg-orange-50',
    summaryBorder: 'border-orange-100',
    summaryText: 'text-orange-800',
  },
  leading_lagging: {
    headerBg: 'bg-emerald-600',
    headerText: 'text-white',
    summaryBg: 'bg-emerald-50',
    summaryBorder: 'border-emerald-100',
    summaryText: 'text-emerald-800',
  },
};

export default function AnalysisPanel({ panel }: AnalysisPanelProps) {
  const [copied, setCopied] = useState(false);
  const config = panelConfig[panel.type];

  const handleCopy = async () => {
    const text = [
      `## ${panel.title}`,
      '',
      panel.summary,
      '',
      ...panel.insights.map(
        (insight) =>
          `### ${insight.title} [${insight.severity}]\n${insight.description}`
      ),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for environments without clipboard API
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className={`${config.headerBg} ${config.headerText} px-5 py-3.5 flex items-center justify-between`}>
        <h3 className="font-semibold text-base">{panel.title}</h3>
        <button
          onClick={handleCopy}
          title="Copy to clipboard"
          className="flex items-center gap-1.5 text-white/80 hover:text-white text-xs py-1 px-2 rounded-md hover:bg-white/20 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Body */}
      <div className="bg-white p-5 space-y-4">
        {/* Summary */}
        <div className={`${config.summaryBg} ${config.summaryBorder} border rounded-lg px-4 py-3`}>
          <p className={`text-sm leading-relaxed ${config.summaryText}`}>{panel.summary}</p>
        </div>

        {/* Insights */}
        <div className="space-y-3">
          {panel.insights.map((insight, index) => (
            <InsightCard key={index} insight={insight} />
          ))}
        </div>

        {panel.insights.length === 0 && (
          <p className="text-sm text-slate-400 italic text-center py-4">No insights available.</p>
        )}
      </div>
    </div>
  );
}
