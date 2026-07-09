// Serverless function: proxies the Ignite AI assistant to the Anthropic API.
// Runs on Vercel (Node.js runtime). Requires env var ANTHROPIC_API_KEY.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(500).json({ error: 'Server missing ANTHROPIC_API_KEY' });
    return;
  }

  // Vercel auto-parses JSON bodies; fall back to manual parse just in case.
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const { system, question, model } = body || {};
  if (!question) {
    res.status(400).json({ error: 'Missing question' });
    return;
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-haiku-4-5',
        max_tokens: 900,
        system: system || '',
        messages: [{ role: 'user', content: question }]
      })
    });

    const data = await r.json();
    if (!r.ok) {
      res.status(502).json({ error: 'Upstream error', detail: data });
      return;
    }
    const text = (data.content && data.content[0] && data.content[0].text) || '';
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: 'assistant_failed' });
  }
}
