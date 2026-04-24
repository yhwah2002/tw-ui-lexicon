export const runtime = 'edge';

const SYSTEM = `你是台灣 UI/UX 用語專家。根據台灣教科書、Apple/Microsoft/Google 繁中介面、教育部辭典，給出最適合的 UI 用詞建議。

請以純 JSON 格式回覆（不要 markdown、不要反引號、不要任何前言）：
{"input":"原始輸入","suggested":"建議用詞","confidence":"高","source":"Apple UI","reason":"說明50字以內"}

confidence 只能是：高、中、低`;

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: '未設定 ANTHROPIC_API_KEY' }, { status: 500 });
  }

  const { term } = await req.json();
  if (!term) {
    return Response.json({ error: '缺少 term 參數' }, { status: 400 });
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      system: SYSTEM,
      messages: [{ role: 'user', content: '請分析詞彙：' + term }],
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return Response.json({ error: data.error?.message || 'Anthropic API 錯誤' }, { status: res.status });
  }

  const raw = (data.content || []).map(b => b.text || '').join('');

  try {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('no JSON');
    const result = JSON.parse(raw.slice(start, end + 1));
    return Response.json(result);
  } catch {
    return Response.json({ error: '解析回應失敗', raw }, { status: 500 });
  }
}
