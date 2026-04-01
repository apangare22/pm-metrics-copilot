import type { Metric, ProductContext, AnalysisOutput } from '../types';

export async function analyzeMetrics(
  metrics: Metric[],
  productContext: ProductContext | null,
  timePeriod: string | null,
  authToken: string
): Promise<AnalysisOutput> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({ metrics, productContext, timePeriod }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? 'Analysis failed. Please try again.');
  }

  return data as AnalysisOutput;
}
