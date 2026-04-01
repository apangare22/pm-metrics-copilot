import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const DAILY_LIMIT = 10;

const SYSTEM_PROMPT = `You are a senior product manager and data analyst with deep expertise in SaaS, Fintech, Marketplace, and Consumer App products. You specialize in identifying growth opportunities, retention risks, and actionable insights from product metrics. Always provide specific, actionable recommendations based on the data provided.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify auth token
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.slice(7);

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }

  // Rate limit: count analyses created today by this user
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const authedSupabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { count, error: countError } = await authedSupabase
    .from('analyses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfDay.toISOString());

  if (countError) {
    return res.status(500).json({ error: 'Failed to check usage limit.' });
  }

  if ((count ?? 0) >= DAILY_LIMIT) {
    return res.status(429).json({
      error: `Daily limit of ${DAILY_LIMIT} analyses reached. Please try again tomorrow.`,
    });
  }

  // Parse request body
  const { metrics, productContext, timePeriod } = req.body ?? {};

  if (!Array.isArray(metrics) || metrics.length === 0) {
    return res.status(400).json({ error: 'No metrics provided.' });
  }

  const validMetrics = metrics.filter(
    (m: { label?: string; value?: string }) =>
      typeof m.label === 'string' && m.label.trim() &&
      typeof m.value === 'string' && m.value.trim()
  );

  if (validMetrics.length === 0) {
    return res.status(400).json({ error: 'No valid metrics provided.' });
  }

  // Build prompt
  const metricsTable = validMetrics
    .map((m: { label: string; value: string }) => `| ${m.label} | ${m.value} |`)
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

Provide 3-5 insights per panel. Severity must be exactly "High", "Medium", or "Low".

Also include a "metric_targets" array that shows recommended target values for each numeric input metric, based on your analysis and industry benchmarks. Only include metrics that have a clear numeric current value and a meaningful improvement target.

"metric_targets": [
  {
    "metric": "exact metric name from input",
    "current": 34,
    "target": 48,
    "timeframe": "3 months",
    "unit": "%"
  }
]

Rules for metric_targets:
- "current" and "target" must be plain numbers (no symbols)
- "unit" should be "%", "K", "M", "$", "mins", or "" for plain numbers
- "timeframe" should be realistic (e.g. "1 month", "3 months", "6 months")
- Only include metrics where improvement direction is clear
- Target should reflect best-in-class benchmarks for the given product context`;

  // Call Claude API
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const message = await stream.finalMessage();

    const textContent = message.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return res.status(500).json({ error: 'No text response from Claude API.' });
    }

    const rawText = textContent.text.trim();
    const jsonText = rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI response. Please try again.' });
    }

    const requiredKeys = ['churn_retention', 'ab_tests', 'funnel_dropoff', 'leading_lagging'];
    for (const key of requiredKeys) {
      if (!parsed[key]) {
        return res.status(500).json({ error: `Incomplete AI response (missing ${key}). Please try again.` });
      }
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Claude API error:', err);
    return res.status(500).json({ error: 'AI analysis failed. Please try again.' });
  }
}
