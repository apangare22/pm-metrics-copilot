import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { MetricTarget } from '../../types';

interface Props {
  targets: MetricTarget[];
}

function formatValue(value: number, unit: string): string {
  const formatted =
    value >= 1_000_000
      ? `${(value / 1_000_000).toFixed(1)}M`
      : value >= 1000
      ? `${(value / 1000).toFixed(1)}K`
      : value % 1 === 0
      ? String(value)
      : value.toFixed(1);
  return `${formatted}${unit}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const current = payload.find((p: { dataKey: string }) => p.dataKey === 'current');
  const target = payload.find((p: { dataKey: string }) => p.dataKey === 'target');
  const unit = payload[0]?.payload?.unit ?? '';
  const timeframe = payload[0]?.payload?.timeframe ?? '';
  const improvement =
    current && target
      ? (((target.value - current.value) / current.value) * 100).toFixed(1)
      : null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-md p-3 text-xs space-y-1.5 min-w-[180px]">
      <p className="font-semibold text-slate-700 text-sm">{label}</p>
      {current && (
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500">Current</span>
          <span className="font-medium text-slate-700">{formatValue(current.value, unit)}</span>
        </div>
      )}
      {target && (
        <div className="flex items-center justify-between gap-4">
          <span className="text-indigo-500">Target</span>
          <span className="font-medium text-indigo-700">{formatValue(target.value, unit)}</span>
        </div>
      )}
      {improvement !== null && (
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100">
          <span className="text-slate-400">Improvement</span>
          <span className={`font-semibold ${Number(improvement) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {Number(improvement) >= 0 ? '+' : ''}{improvement}%
          </span>
        </div>
      )}
      {timeframe && (
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-400">Timeframe</span>
          <span className="text-slate-600">{timeframe}</span>
        </div>
      )}
    </div>
  );
};

export default function ComparisonChart({ targets }: Props) {
  if (!targets || targets.length === 0) return null;

  const data = targets.map((t) => ({
    name: t.metric,
    current: t.current,
    target: t.target,
    unit: t.unit,
    timeframe: t.timeframe,
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Current vs Recommended Targets</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            AI-recommended benchmarks based on your product context
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0 ml-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-slate-400 inline-block" />
            Current
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" />
            Target
          </span>
        </div>
      </div>

      {/* Timeframe badges */}
      <div className="flex flex-wrap gap-1.5 mb-4 mt-2">
        {targets.map((t) => (
          <span
            key={t.metric}
            className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full px-2 py-0.5"
          >
            <span className="font-medium">{t.metric}</span>
            <span className="text-indigo-400">→ {t.timeframe}</span>
          </span>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={Math.max(240, data.length * 52)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 8, right: 24 }}
          barSize={16}
          barGap={4}
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
            width={140}
            tick={{ fontSize: 11, fill: '#475569' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={0} stroke="#e2e8f0" />
          <Bar dataKey="current" name="Current" fill="#94a3b8" radius={[0, 4, 4, 0]} />
          <Bar dataKey="target" name="Target" fill="#6366f1" radius={[0, 4, 4, 0]} />
          <Legend wrapperStyle={{ display: 'none' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
