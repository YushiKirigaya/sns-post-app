export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { text, token, channelId, scheduledAt } = req.body;
  if (!token || !channelId) { res.status(400).json({ error: 'Buffer APIキーまたはチャンネルIDがありません' }); return; }

  try {
    const dueAt = scheduledAt || new Date().toISOString();
    const mutation = `mutation CreateUpdate($input: CreateUpdateInput!) {
      createUpdate(input: $input) {
        ... on UpdateCreated { update { id text status } }
        ... on Error { message }
      }
    }`;
    const response = await fetch('https://api.buffer.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        query: mutation,
        variables: { input: { channelId, content: { text }, dueAt } }
      })
    });
    const data = await response.json();
    const result = data?.data?.createUpdate;
    if (result?.update) {
      res.status(200).json({ success: true, id: result.update.id });
    } else {
      const msg = result?.message || JSON.stringify(data);
      res.status(400).json({ error: msg });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
