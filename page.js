'use client';
import { useState, useEffect, useCallback } from 'react';

const LEX_KEY = 'tw-ui-lexicon-v1';

function getLex() {
  try { return JSON.parse(localStorage.getItem(LEX_KEY) || '[]'); } catch { return []; }
}
function setLex(d) {
  localStorage.setItem(LEX_KEY, JSON.stringify(d));
}

function confColor(c) {
  if (c === '高') return { bg: '#EAF3DE', color: '#3B6D11' };
  if (c === '中') return { bg: '#FAEEDA', color: '#854F0B' };
  return { bg: '#FCEBEB', color: '#A32D2D' };
}

function Badge({ text, style }) {
  return (
    <span style={{
      fontSize: 11, padding: '2px 8px', borderRadius: 6,
      fontWeight: 500, ...style
    }}>{text}</span>
  );
}

export default function Home() {
  const [tab, setTab] = useState('query');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [resultFromLex, setResultFromLex] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editVal, setEditVal] = useState('');
  const [lex, setLexState] = useState([]);
  const [lexSearch, setLexSearch] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => { setLexState(getLex()); }, [tab]);

  const runQuery = useCallback(async () => {
    const term = input.trim();
    if (!term) return;
    setError(''); setResult(null); setEditMode(false); setSaved(false);

    const existing = getLex().find(e => e.input === term);
    if (existing) { setResult(existing); setResultFromLex(true); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'API 錯誤');
      setResult(data);
      setResultFromLex(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [input]);

  const saveEntry = (item, status, overrideSuggested) => {
    const entry = {
      ...item,
      suggested: overrideSuggested || item.suggested,
      status,
      savedAt: new Date().toISOString(),
    };
    const existing = getLex();
    const idx = existing.findIndex(e => e.input === entry.input);
    if (idx >= 0) existing[idx] = entry; else existing.unshift(entry);
    setLex(existing);
    setLexState(existing);
    setResult(entry);
    setResultFromLex(true);
    setSaved(true);
    setEditMode(false);
  };

  const removeEntry = (inputTerm) => {
    const updated = getLex().filter(e => e.input !== inputTerm);
    setLex(updated);
    setLexState(updated);
    setResult(null);
  };

  const filteredLex = lexSearch
    ? lex.filter(e => e.input.includes(lexSearch) || e.suggested.includes(lexSearch))
    : lex;

  const exportCSV = () => {
    const rows = [['原詞', '建議用詞', '狀態', '來源', '信心', '說明', '時間']];
    lex.forEach(e => rows.push([e.input, e.suggested, e.status === 'approved' ? '核准' : '拒絕', e.source, e.confidence, e.reason, e.savedAt || '']));
    const csv = rows.map(r => r.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tw-ui-lexicon.csv';
    a.click();
  };

  const s = {
    wrap: { maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' },
    title: { fontSize: 20, fontWeight: 600, margin: '0 0 1.5rem', color: '#1a1a1a' },
    nav: { display: 'flex', gap: 6, marginBottom: '1.5rem', borderBottom: '1px solid #e5e5e3', paddingBottom: 12 },
    navBtn: (active) => ({
      padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
      fontSize: 13, background: active ? '#f0efec' : 'transparent',
      color: active ? '#1a1a1a' : '#888', fontWeight: active ? 500 : 400,
    }),
    row: { display: 'flex', gap: 8, marginBottom: 16 },
    input: { flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, outline: 'none' },
    btn: (variant) => ({
      padding: '8px 18px', borderRadius: 8, border: '1px solid',
      cursor: 'pointer', fontSize: 13, fontWeight: 500,
      ...(variant === 'primary' ? { background: '#1a1a1a', color: '#fff', borderColor: '#1a1a1a' } :
          variant === 'ok'      ? { background: '#EAF3DE', color: '#3B6D11', borderColor: '#3B6D11' } :
          variant === 'reject'  ? { background: '#FCEBEB', color: '#A32D2D', borderColor: '#A32D2D' } :
                                  { background: 'transparent', color: '#555', borderColor: '#ddd' }),
    }),
    card: { background: '#fff', border: '1px solid #e5e5e3', borderRadius: 12, padding: '1.25rem', marginBottom: 10 },
    hint: { fontSize: 12, color: '#aaa', marginBottom: 12 },
    err: { fontSize: 13, color: '#A32D2D', background: '#FCEBEB', padding: '10px 14px', borderRadius: 8, marginBottom: 12 },
    stats: { display: 'flex', gap: 10, marginBottom: 20 },
    stat: { flex: 1, background: '#f5f5f3', borderRadius: 8, padding: '12px 16px' },
    statL: { fontSize: 11, color: '#999', marginBottom: 2 },
    statV: { fontSize: 22, fontWeight: 600, color: '#1a1a1a' },
    tbl: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
    th: { textAlign: 'left', padding: '6px 10px', color: '#aaa', fontWeight: 400, borderBottom: '1px solid #eee' },
    td: { padding: '9px 10px', borderBottom: '1px solid #f0f0ee', verticalAlign: 'middle' },
    dot: (ok) => ({ width: 7, height: 7, borderRadius: '50%', display: 'inline-block', marginRight: 6, background: ok ? '#3B6D11' : '#A32D2D' }),
    delBtn: { background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 14, padding: '2px 6px' },
  };

  return (
    <div style={s.wrap}>
      <h1 style={s.title}>台灣 UI 用詞建議系統</h1>

      <div style={s.nav}>
        <button style={s.navBtn(tab === 'query')} onClick={() => setTab('query')}>查詢</button>
        <button style={s.navBtn(tab === 'lexicon')} onClick={() => setTab('lexicon')}>詞庫 {lex.length > 0 && `(${lex.length})`}</button>
      </div>

      {tab === 'query' && (
        <div>
          <p style={s.hint}>輸入詞彙，AI 分析後可直接審核存入詞庫</p>
          <div style={s.row}>
            <input
              style={s.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runQuery()}
              placeholder="例如：优化、软件、点击..."
            />
            <button style={s.btn('primary')} onClick={runQuery} disabled={loading}>
              {loading ? '分析中...' : '查詢'}
            </button>
          </div>

          {error && <div style={s.err}>{error}</div>}

          {result && (
            <div style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{result.input}</span>
                <span style={{ color: '#aaa', fontSize: 13 }}>→</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#185FA5' }}>{result.suggested}</span>
                <Badge text={`信心 ${result.confidence}`} style={confColor(result.confidence)} />
                {resultFromLex && <Badge text="已在詞庫" style={{ background: '#EAF3DE', color: '#3B6D11' }} />}
              </div>
              <div style={{ marginBottom: 8 }}>
                <Badge text={result.source} style={{ background: '#f5f5f3', color: '#666', fontSize: 12 }} />
              </div>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7, marginBottom: 14 }}>{result.reason}</p>

              {editMode && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input
                    style={{ ...s.input, flex: 1 }}
                    value={editVal}
                    onChange={e => setEditVal(e.target.value)}
                    placeholder="修改建議用詞..."
                  />
                  <button style={s.btn('ok')} onClick={() => saveEntry(result, 'approved', editVal)}>確認存入</button>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {resultFromLex ? (
                  <button style={s.btn()} onClick={() => removeEntry(result.input)}>從詞庫移除</button>
                ) : (
                  <>
                    <button style={s.btn('ok')} onClick={() => saveEntry(result, 'approved')}>核准存入</button>
                    <button style={s.btn()} onClick={() => { setEditMode(!editMode); setEditVal(result.suggested); }}>修改後存入</button>
                    <button style={s.btn('reject')} onClick={() => saveEntry(result, 'rejected')}>拒絕</button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'lexicon' && (
        <div>
          <div style={s.stats}>
            <div style={s.stat}><div style={s.statL}>核准</div><div style={s.statV}>{lex.filter(e => e.status === 'approved').length}</div></div>
            <div style={s.stat}><div style={s.statL}>拒絕</div><div style={s.statV}>{lex.filter(e => e.status === 'rejected').length}</div></div>
            <div style={s.stat}><div style={s.statL}>總計</div><div style={s.statV}>{lex.length}</div></div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input style={s.input} value={lexSearch} onChange={e => setLexSearch(e.target.value)} placeholder="搜尋詞彙..." />
            <button style={s.btn()} onClick={exportCSV}>匯出 CSV</button>
          </div>
          {filteredLex.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#bbb', padding: '2rem 0', fontSize: 13 }}>詞庫是空的，先查詢並核准幾個詞吧</p>
          ) : (
            <table style={s.tbl}>
              <thead>
                <tr>
                  <th style={s.th}>狀態</th>
                  <th style={s.th}>原詞</th>
                  <th style={s.th}>建議用詞</th>
                  <th style={s.th}>來源</th>
                  <th style={s.th}>信心</th>
                  <th style={s.th}></th>
                </tr>
              </thead>
              <tbody>
                {filteredLex.map(e => (
                  <tr key={e.input}>
                    <td style={s.td}>
                      <span style={s.dot(e.status === 'approved')} />
                      {e.status === 'approved' ? '核准' : '拒絕'}
                    </td>
                    <td style={s.td}>{e.input}</td>
                    <td style={{ ...s.td, fontWeight: 500 }}>{e.suggested}</td>
                    <td style={{ ...s.td, color: '#888', fontSize: 12 }}>{e.source}</td>
                    <td style={s.td}><Badge text={e.confidence} style={confColor(e.confidence)} /></td>
                    <td style={s.td}>
                      <button style={s.delBtn} onClick={() => {
                        const updated = getLex().filter(x => x.input !== e.input);
                        setLex(updated); setLexState(updated);
                      }}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
