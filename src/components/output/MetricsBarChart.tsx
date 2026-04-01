import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import type { Metric } from '../../types';

interface Props {
  metrics: Metric[];
}

function parseNumeric(value: string): number | null {
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

  if (numericMetrics.length === 0) return null;

  const max = Math.max(...numericMetrics.map((m) => m.numeric));

  // Normalize all values to 0–100 scale so every bar is visible
  // The actual value is shown as a label — the bar length shows relative rank
  const data = numericMetrics.map((m, i) => ({
    name: m.label,
    normalized: max > 0 ? Math.max((m.numeric / max) * 100, 2) : 2, // min 2% so bar is always visible
    raw: m.raw,
    color: BAR_COLORS[i % BAR_COLORS.length],
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Metric Values</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Bar length shows relative rank — actual values shown as labels
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 8, right: 80 }}
          barSize={18}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            hide
          />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            tick={{ fontSize: 11, fill: '#475569' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(_value, _name, props) => [props.payload.raw, 'Value']}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
            cursor={{ fill: '#f8fafc' }}
          />
          <Bar dataKey="normalized" radius={[0, 4, 4, 0]} isAnimationActive={true}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
            <LabelList
              dataKey="raw"
              position="right"
              style={{ fontSize: 11, fill: '#475569', fontWeight: 500 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
