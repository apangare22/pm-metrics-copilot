import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { Metric } from '../../types';

interface Props {
  metrics: Metric[];
}

function parseNumeric(value: string): number | null {
  // Strip common non-numeric chars: $, %, commas, spaces, K/M suffixes
  const cleaned = value.replace(/[$,%\s]/g, '').replace(/,/g, '');
  const multiplier = /k$/i.test(cleaned) ? 1000 : /m$/i.test(cleaned) ? 1_000_000 : 1;
  const num = parseFloat(cleaned.replace(/[km]$/i, ''));
  return isNaN(num) ? null : num * multiplier;
}

const BAR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#22c55e', '#14b8a6', '#3b82f6', '#ef4444',
];

export default function MetricsBarChart({ metrics }: Props) {
  const numericMetrics = metrics
    .filter((m) => m.label.trim() && m.value.trim())
    .map((m) => ({ label: m.label.trim(), raw: m.value.trim(), numeric: parseNumeric(m.value) }))
    .filter((m) => m.numeric !== null) as { label: string; raw: string; numeric: number }[];

  if (numericMetrics.length === 0) {
    return null;
  }

  const data = numericMetrics.map((m) => ({ name: m.label, value: m.numeric, raw: m.raw }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">Metric Values</h3>
      <p className="text-xs text-slate-400 mb-4">Numeric metrics from your input</p>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 8, right: 16 }}
          barSize={18}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) =>
              v >= 1_000_000
                ? `${(v / 1_000_000).toFixed(1)}M`
                : v >= 1000
                ? `${(v / 1000).toFixed(0)}K`
                : String(v)
            }
          />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tick={{ fontSize: 11, fill: '#475569' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(_value, _name, props) => [props.payload.raw, 'Value']}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((_entry, index) => (
              <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
