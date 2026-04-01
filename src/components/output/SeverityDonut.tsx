import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { AnalysisOutput } from '../../types';

interface Props {
  output: AnalysisOutput;
}

const COLORS = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#22c55e',
};

export default function SeverityDonut({ output }: Props) {
  const counts = { High: 0, Medium: 0, Low: 0 };

  const panels = [output.churn_retention, output.ab_tests, output.funnel_dropoff, output.leading_lagging];
  for (const panel of panels) {
    for (const insight of panel.insights) {
      counts[insight.severity] = (counts[insight.severity] ?? 0) + 1;
    }
  }

  const data = Object.entries(counts)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">Severity Overview</h3>
      <p className="text-xs text-slate-400 mb-4">{total} total insights across all panels</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={COLORS[entry.name as keyof typeof COLORS]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [
              `${value} insights (${Math.round((Number(value) / total) * 100)}%)`,
              name,
            ]}
          />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-slate-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
