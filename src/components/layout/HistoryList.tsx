import type { Analysis } from '../../types';
import { Trash2, ChevronRight, Tag } from 'lucide-react';

interface HistoryListProps {
  analyses: Analysis[];
  onSelect: (analysis: Analysis) => void;
  onDelete: (id: string) => void;
  selectedId: string | null;
}

const contextColors: Record<string, string> = {
  SaaS: 'bg-indigo-100 text-indigo-700',
  Fintech: 'bg-green-100 text-green-700',
  Marketplace: 'bg-orange-100 text-orange-700',
  'Consumer App': 'bg-purple-100 text-purple-700',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function HistoryList({ analyses, onSelect, onDelete, selectedId }: HistoryListProps) {
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this analysis? This cannot be undone.')) {
      onDelete(id);
    }
  };

  if (analyses.length === 0) {
    return (
      <div className="px-3 py-6 text-center">
        <p className="text-xs text-slate-400">No saved analyses yet.</p>
        <p className="text-xs text-slate-400 mt-1">Run an analysis and save it to see it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {analyses.map((analysis) => {
        const isSelected = selectedId === analysis.id;
        const contextColor = analysis.product_context
          ? contextColors[analysis.product_context] ?? 'bg-slate-100 text-slate-600'
          : null;

        return (
          <div
            key={analysis.id}
            onClick={() => onSelect(analysis)}
            className={`group relative rounded-lg p-3 cursor-pointer transition-colors ${
              isSelected
                ? 'bg-indigo-50 border border-indigo-200'
                : 'hover:bg-slate-50 border border-transparent'
            }`}
          >
            <div className="flex items-start justify-between gap-1">
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    isSelected ? 'text-indigo-800' : 'text-slate-700'
                  }`}
                >
                  {analysis.title}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{formatDate(analysis.created_at)}</p>
                {analysis.product_context && contextColor && (
                  <span
                    className={`inline-flex items-center gap-1 mt-1.5 text-xs px-1.5 py-0.5 rounded-md font-medium ${contextColor}`}
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {analysis.product_context}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={(e) => handleDelete(e, analysis.id)}
                  title="Delete analysis"
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {isSelected && <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
