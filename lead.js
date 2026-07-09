// Serverless function: captures a lead from the site form and emails Todd.
// Runs on Vercel (Node.js runtime).
// Set RESEND_API_KEY to enable email delivery via Resend (https://resend.com).
// LEAD_TO / LEAD_FROM are optional overrides.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const lead = body || {};
  const to = process.env.LEAD_TO || 'todd@igniteai.biz';
  const from = process.env.LEAD_FROM || 'Ignite AI <leads@igniteai.biz>';

  const lines = [
    'New free-book lead from igniteai.biz',
    '',
    'Company: ' + (lead.company || '—'),
    'Email:   ' + (lead.email || '—'),
    'Phone:   ' + (lead.phone || '—'),
    'Current AI goals:',
    (lead.goals || '—'),
    '',
    'Received: ' + new Date().toISOString()
  ].join('\n');

  // Always log so the submission shows in Vercel function logs even without email set up.
  console.log('[LEAD]', JSON.stringify(lead));

  try {
    if (process.env.RESEND_API_KEY) {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer ' + process.env.RESEND_API_KEY
        },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: lead.email || undefined,
          subject: 'New book lead: ' + (lead.company || 'Unknown'),
          text: lines
        })
      });
      if (!r.ok) {
        const detail = await r.text();
        console.error('[LEAD] email failed', detail);
      }
    }
    // Never block the user even if email delivery fails.
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[LEAD] error', e);
    res.status(200).json({ ok: true });
  }
}
