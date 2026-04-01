import type { ProductContext } from '../../types';
import { Calendar, Tag } from 'lucide-react';

interface ContextSelectorProps {
  productContext: ProductContext | null;
  onProductContextChange: (ctx: ProductContext | null) => void;
  timePeriod: string;
  onTimePeriodChange: (period: string) => void;
}

const PRODUCT_CONTEXTS: ProductContext[] = ['SaaS', 'Fintech', 'Marketplace', 'Consumer App'];

export default function ContextSelector({
  productContext,
  onProductContextChange,
  timePeriod,
  onTimePeriodChange,
}: ContextSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Product Context */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          <span className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            Product Context
          </span>
        </label>
        <select
          value={productContext ?? ''}
          onChange={(e) => {
            const val = e.target.value;
            onProductContextChange(val ? (val as ProductContext) : null);
          }}
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-700"
        >
          <option value="">Select context (optional)</option>
          {PRODUCT_CONTEXTS.map((ctx) => (
            <option key={ctx} value={ctx}>
              {ctx}
            </option>
          ))}
        </select>
      </div>

      {/* Time Period */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Time Period
          </span>
        </label>
        <input
          type="text"
          value={timePeriod}
          onChange={(e) => onTimePeriodChange(e.target.value)}
          placeholder="e.g. Q1 2024, Last 30 days"
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
