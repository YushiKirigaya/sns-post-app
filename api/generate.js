export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { text, tonePrompt, hashtags, apiKey } = req.body;
  if (!apiKey) { res.status(400).json({ error: 'APIキーがありません' }); return; }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `以下の生テキストをTwitter投稿文に整形してください。\n\n口調：${tonePrompt}\nハッシュタグ：${hashtags}\n\n生テキスト：${text}\n\n条件：\n- 140文字以内（ハッシュタグ込み）\n- 改行は1〜2箇所まで\n- 投稿文のみ返してください（説明不要）`
        }]
      })
    });
    const data = await response.json();
    if (data.error) { res.status(400).json({ error: data.error.message }); return; }
    const result = data.content.map(i => i.text || '').join('').trim();
    res.status(200).json({ result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
