import Anthropic from '@anthropic-ai/sdk';
import type { Metric, ProductContext, AnalysisOutput } from '../types';

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY as string,
  dangerouslyAllowBrowser: true,
});

const SYSTEM_PROMPT = `You are a senior product manager and data analyst with deep expertise in SaaS, Fintech, Marketplace, and Consumer App products. You specialize in identifying growth opportunities, retention risks, and actionable insights from product metrics. Always provide specific, actionable recommendations based on the data provided.`;

export async function analyzeMetrics(
  metrics: Metric[],
  productContext: ProductContext | null,
  timePeriod: string | null
): Promise<AnalysisOutput> {
  const metricsTable = metrics
    .filter((m) => m.label.trim() !== '' && m.value.trim() !== '')
    .map((m) => `| ${m.label} | ${m.value} |`)
    .join('\n');

  const contextLine = productContext ? `Product Context: ${productContext}` : 'Product Context: Not specified';
  const timeLine = timePeriod ? `Time Period: ${timePeriod}` : 'Time Period: Not specified';

  const userMessage = `Please analyze the following product metrics and provide structured insights.

${contextLine}
${timeLine}

Metrics:
| Metric | Value |
|--------|-------|
${metricsTable}

Respond with ONLY a valid JSON object (no markdown, no code blocks, no explanation) using this exact structure:
{
  "churn_retention": {
    "type": "churn",
    "title": "Churn & Retention Signals",
    "summary": "A concise 2-3 sentence overview of churn and retention patterns observed in the data.",
    "insights": [
      {
        "title": "Insight title",
        "description": "Detailed, actionable description with specific recommendations",
        "severity": "High"
      }
    ]
  },
  "ab_tests": {
    "type": "ab_test",
    "title": "A/B Test Recommendations",
    "summary": "A concise 2-3 sentence overview of recommended experiments based on the data.",
    "insights": [
      {
        "title": "Insight title",
        "description": "Detailed, actionable description with specific recommendations",
        "severity": "Medium"
      }
    ]
  },
  "funnel_dropoff": {
    "type": "funnel",
    "title": "Funnel Drop-off Diagnosis",
    "summary": "A concise 2-3 sentence overview of funnel performance and drop-off points.",
    "insights": [
      {
        "title": "Insight title",
        "description": "Detailed, actionable description with specific recommendations",
        "severity": "High"
      }
    ]
  },
  "leading_lagging": {
    "type": "leading_lagging",
    "title": "Leading vs Lagging Breakdown",
    "summary": "A concise 2-3 sentence overview of leading and lagging indicators in the data.",
    "insights": [
      {
        "title": "Insight title",
        "description": "Detailed, actionable description with specific recommendations",
        "severity": "Low"
      }
    ]
  }
}

Provide 3-5 insights per panel. Severity must be exactly "High", "Medium", or "Low".`;

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  });

  const message = await stream.finalMessage();

  const textContent = message.content.find((c) => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude API');
  }

  const rawText = textContent.text.trim();

  // Strip markdown code blocks if present
  const jsonText = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();

  let parsed: AnalysisOutput;
  try {
    parsed = JSON.parse(jsonText) as AnalysisOutput;
  } catch {
    throw new Error(`Failed to parse Claude response as JSON. Raw response: ${rawText.slice(0, 200)}`);
  }

  // Validate structure
  const requiredKeys: (keyof AnalysisOutput)[] = ['churn_retention', 'ab_tests', 'funnel_dropoff', 'leading_lagging'];
  for (const key of requiredKeys) {
    if (!parsed[key]) {
      throw new Error(`Missing required panel: ${key}`);
    }
  }

  return parsed;
}
