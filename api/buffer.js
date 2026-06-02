export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { text, token, channelId, scheduledAt } = req.body;
  if (!token || !channelId) { res.status(400).json({ error: 'Buffer APIキーまたはチャンネルIDがありません' }); return; }

  try {
    // Buffer REST API v1を使用
    const params = new URLSearchParams();
    params.append('text', text);
    params.append('profile_ids[]', channelId);
    if (scheduledAt) {
      params.append('scheduled_at', scheduledAt);
    }

    const response = await fetch('https://api.bufferapp.com/1/updates/create.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + token
      },
      body: params.toString()
    });
    
    const data = await response.json();
    
    if (data.success || data.updates) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ error: data.message || JSON.stringify(data) });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
