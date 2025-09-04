// Serverless proxy function (Vercel)
export default async function handler(req, res) {
  // --- Allow your Lovable site to call this ---
  res.setHeader('Access-Control-Allow-Origin', 'https://YOUR-LOVABLE-DOMAIN');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

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
