import type { Metric } from '../../types';
import { Plus, Trash2 } from 'lucide-react';

const MAX_METRICS = 12;

interface MetricFormProps {
  metrics: Metric[];
  onChange: (metrics: Metric[]) => void;
}

export default function MetricForm({ metrics, onChange }: MetricFormProps) {
  const atLimit = metrics.length >= MAX_METRICS;

  const addRow = () => {
    if (atLimit) return;
    const newMetric: Metric = {
      id: crypto.randomUUID(),
      label: '',
      value: '',
    };
    onChange([...metrics, newMetric]);
  };

  const removeRow = (id: string) => {
    if (metrics.length <= 1) return;
    onChange(metrics.filter((m) => m.id !== id));
  };

  const updateMetric = (id: string, field: 'label' | 'value', val: string) => {
    onChange(
      metrics.map((m) => (m.id === id ? { ...m, [field]: val } : m))
    );
  };

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="grid grid-cols-[1fr_1fr_36px] gap-2 px-1">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Metric Name</span>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Value</span>
        <span></span>
      </div>

      {/* Metric rows */}
      <div className="space-y-2">
        {metrics.map((metric, index) => (
          <div key={metric.id} className="grid grid-cols-[1fr_1fr_36px] gap-2 items-center">
            <input
              type="text"
              value={metric.label}
              onChange={(e) => updateMetric(metric.id, 'label', e.target.value)}
              placeholder={`e.g. Monthly Active Users`}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <input
              type="text"
              value={metric.value}
              onChange={(e) => updateMetric(metric.id, 'value', e.target.value)}
              placeholder={`e.g. 12,450`}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => removeRow(metric.id)}
              disabled={metrics.length <= 1}
              title={`Remove row ${index + 1}`}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add row / limit warning */}
      {atLimit ? (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Maximum of {MAX_METRICS} metrics reached. Remove a metric to add another.
        </p>
      ) : (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium py-1 px-2 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add metric
          </button>
          <span className="text-xs text-slate-400">{metrics.length} / {MAX_METRICS}</span>
        </div>
      )}
    </div>
  );
}
