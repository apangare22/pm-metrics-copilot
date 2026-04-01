import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { AnalysisOutput } from '../../types';

interface Props {
  output: AnalysisOutput;
}

const PANEL_LABELS: Record<keyof AnalysisOutput, string> = {
  churn_retention: 'Churn',
  ab_tests: 'A/B Tests',
  funnel_dropoff: 'Funnel',
  leading_lagging: 'Leading/Lag',
};

export default function SeverityByPanel({ output }: Props) {
  const data = (Object.keys(PANEL_LABELS) as (keyof AnalysisOutput)[]).map((key) => {
    const panel = output[key];
    const counts = { High: 0, Medium: 0, Low: 0 };
    for (const insight of panel.insights) {
      counts[insight.severity] = (counts[insight.severity] ?? 0) + 1;
    }
    return { name: PANEL_LABELS[key], ...counts };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">Insights by Panel</h3>
      <p className="text-xs text-slate-400 mb-4">Severity breakdown per analysis panel</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={14}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={20}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => (
              <span className="text-xs text-slate-600">{value}</span>
            )}
          />
          <Bar dataKey="High" fill="#ef4444" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Medium" fill="#f59e0b" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Low" fill="#22c55e" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
