export type ProductContext = 'SaaS' | 'Fintech' | 'Marketplace' | 'Consumer App';

export interface Metric {
  id: string;
  label: string;
  value: string;
}

export interface Insight {
  title: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
}

export interface InsightPanel {
  type: 'churn' | 'ab_test' | 'funnel' | 'leading_lagging';
  title: string;
  insights: Insight[];
  summary: string;
}

export interface MetricTarget {
  metric: string;
  current: number;
  target: number;
  timeframe: string;
  unit: string;
}

export type PanelKey = 'churn_retention' | 'ab_tests' | 'funnel_dropoff' | 'leading_lagging';

export interface AnalysisOutput {
  churn_retention: InsightPanel;
  ab_tests: InsightPanel;
  funnel_dropoff: InsightPanel;
  leading_lagging: InsightPanel;
  metric_targets: MetricTarget[];
}

export interface Analysis {
  id: string;
  user_id: string;
  title: string;
  product_context: ProductContext | null;
  time_period: string | null;
  input_data: { metrics: Metric[] };
  output: AnalysisOutput;
  created_at: string;
}
