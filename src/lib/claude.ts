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

  const text = await response.text();

  let data: { error?: string } & Partial<AnalysisOutput>;
  try {
    data = JSON.parse(text);
  } catch {
    // Non-JSON response — likely a timeout or server error from Vercel
    if (!response.ok) {
      throw new Error(
        response.status === 504
          ? 'Request timed out. Try with fewer metrics or try again.'
          : `Server error (${response.status}). Please try again.`
      );
    }
    throw new Error('Unexpected response from server. Please try again.');
  }

  if (!response.ok) {
    throw new Error(data.error ?? 'Analysis failed. Please try again.');
  }

  return data as AnalysisOutput;
}
