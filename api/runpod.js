// Serverless proxy function (Vercel)
const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',        // Vite dev
  'http://127.0.0.1:5173',
  'http://localhost:3000',        // CRA dev (if you use it)
  'http://127.0.0.1:3000',
  'https://vercel-proxy-five-iota.vercel.app', // calling from same domain is fine too
  // add your production frontend domain here when you deploy it, e.g.:
  // 'https://your-frontend.vercel.app',
  // 'https://www.yourcustomdomain.com',
]);

function setCors(req, res) {
  const origin = req.headers.origin || '';
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : '';
  if (allow) {
    res.setHeader('Access-Control-Allow-Origin', allow);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    // Preflight – return early with the CORS headers above
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST' });
  }

  try {
    const { input } = req.body || {};
    if (!input) return res.status(400).json({ error: 'Missing { input }' });

    const endpointId = process.env.RUNPOD_ENDPOINT_ID;
    const apiKey = process.env.RUNPOD_API_KEY;

    const rp = await fetch(`https://api.runpod.ai/v2/${endpointId}/runsync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ input })
    });

    const data = await rp.json();
    return res.status(rp.ok ? 200 : 500).json(data);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
