import type { Analysis } from '../../types';
import HistoryList from './HistoryList';
import { Plus, History } from 'lucide-react';

interface SidebarProps {
  analyses: Analysis[];
  onSelect: (analysis: Analysis) => void;
  onDelete: (id: string) => void;
  onNewAnalysis: () => void;
  selectedId: string | null;
}

export default function Sidebar({
  analyses,
  onSelect,
  onDelete,
  onNewAnalysis,
  selectedId,
}: SidebarProps) {
  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
      {/* New Analysis button */}
      <div className="p-3 border-b border-slate-100">
        <button
          onClick={onNewAnalysis}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Analysis
        </button>
      </div>

      {/* History header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100">
        <History className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">History</span>
        {analyses.length > 0 && (
          <span className="ml-auto text-xs text-slate-400">{analyses.length}</span>
        )}
      </div>

      {/* History list */}
      <div className="flex-1 overflow-y-auto p-2">
        <HistoryList
          analyses={analyses}
          onSelect={onSelect}
          onDelete={onDelete}
          selectedId={selectedId}
        />
      </div>
    </aside>
  );
}
