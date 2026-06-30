import React, { useState } from 'react';
import { Sparkles, Key, CheckCircle, ExternalLink, Loader, X, Copy, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    num: 1,
    icon: '🌐',
    title: 'Open AI Studio',
    desc: 'Click the button below to open Google AI Studio in a new tab',
    action: (
      <a
        href="https://aistudio.google.com/apikey"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '11px 22px', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 700,
          background: 'linear-gradient(135deg, #4285f4, #34a853)',
          color: '#fff', textDecoration: 'none', transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        <ExternalLink size={15} />
        Open aistudio.google.com/apikey
      </a>
    ),
  },
  {
    num: 2,
    icon: '🔑',
    title: 'Create a Free API Key',
    desc: 'Click "Create API Key" → select any project → copy the key (starts with AIza…)',
  },
  {
    num: 3,
    icon: '✅',
    title: 'Paste it Below',
    desc: 'Paste your key in the field and click Activate — it saves in your browser instantly',
  },
];

export default function ApiKeySetup({ onSave, onSkip }) {
  const [key, setKey]           = useState('');
  const [status, setStatus]     = useState('idle'); // idle | testing | success | error
  const [errMsg, setErrMsg]     = useState('');
  const [step, setStep]         = useState(0); // 0=intro,1=setup

  const testAndSave = async () => {
    const trimmed = key.trim();
    if (!trimmed || trimmed.length < 10) {
      setErrMsg('Please paste a valid API key (starts with AIza…)');
      return;
    }
    setStatus('testing');
    setErrMsg('');
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${trimmed}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Say "OK" in one word.' }] }],
            generationConfig: { maxOutputTokens: 5 },
          }),
        }
      );
      const data = await res.json();
      const errMsg = data?.error?.message || '';

      // Quota exceeded (429) = key IS valid, just daily limit hit → save & activate
      if (res.status === 429 || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('rate')) {
        localStorage.setItem('gemini_api_key', trimmed);
        setStatus('quota');            // special state = valid but quota
        setTimeout(() => onSave(trimmed), 1800);
        return;
      }

      // Truly invalid key
      if (!res.ok) {
        throw new Error(errMsg || 'Invalid API key');
      }

      // Full success — key works and has quota
      localStorage.setItem('gemini_api_key', trimmed);
      setStatus('success');
      setTimeout(() => onSave(trimmed), 1200);

    } catch (err) {
      // Network or invalid key error
      const msg = err.message || '';
      if (msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate')) {
        // Quota from catch path — still valid key
        localStorage.setItem('gemini_api_key', key.trim());
        setStatus('quota');
        setTimeout(() => onSave(key.trim()), 1800);
      } else {
        setStatus('error');
        setErrMsg(
          msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('api_key')
            ? '❌ Invalid API key. Please double-check and paste it again.'
            : `⚠️ ${msg || 'Could not verify key. Check your internet connection.'}`
        );
      }
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(2, 10, 6, 0.92)',
      backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        background: 'linear-gradient(145deg, hsl(150,30%,7%), hsl(150,20%,5%))',
        border: '1px solid rgba(82,183,136,0.25)',
        borderRadius: '24px',
        padding: '36px 32px',
        maxWidth: '520px', width: '100%',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(82,183,136,0.08)',
        position: 'relative',
      }}>

        {/* Skip button */}
        <button
          onClick={onSkip}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'hsl(150,10%,45%)', cursor: 'pointer', padding: '6px' }}
          title="Skip (use built-in mode)"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(82,183,136,0.2), rgba(56,161,105,0.1))',
            border: '2px solid rgba(82,183,136,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px auto',
            fontSize: '28px',
          }}>
            <Sparkles size={28} color="#52b788" />
          </div>
          <h2 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, marginBottom: '8px' }}>
            Activate Full AI — It's Free!
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'hsl(150,15%,55%)', lineHeight: 1.6 }}>
            Get your free Google Gemini API key to unlock real AI answers for<br />
            <strong style={{ color: '#52b788' }}>any question</strong> — farming, math, science, coding & more.
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              display: 'flex', gap: '14px', alignItems: 'flex-start',
              padding: '14px 16px', borderRadius: '12px',
              background: 'rgba(82,183,136,0.04)',
              border: '1px solid rgba(82,183,136,0.08)',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                background: 'rgba(82,183,136,0.12)', border: '1.5px solid rgba(82,183,136,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 800, color: '#52b788',
              }}>
                {s.num}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                  {s.icon} {s.title}
                </p>
                <p style={{ fontSize: '0.78rem', color: 'hsl(150,15%,55%)', lineHeight: 1.5 }}>
                  {s.desc}
                </p>
                {s.action && <div style={{ marginTop: '10px' }}>{s.action}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Key Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'hsl(150,15%,55%)', fontWeight: 600 }}>
            <Key size={12} style={{ display: 'inline', marginRight: '5px' }} />
            Paste your API key here:
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="input-field"
              style={{ flex: 1, fontSize: '0.85rem', letterSpacing: key.startsWith('AIza') ? '0.02em' : 'normal' }}
              placeholder="AIzaSy…"
              value={key}
              onChange={e => { setKey(e.target.value); setStatus('idle'); setErrMsg(''); }}
              onKeyDown={e => e.key === 'Enter' && testAndSave()}
              autoFocus
            />
            <button
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 700, whiteSpace: 'nowrap', minWidth: '110px' }}
              onClick={testAndSave}
              disabled={status === 'testing' || status === 'success' || status === 'quota'}
            >
              {status === 'testing' ? (
                <><Loader size={14} className="animate-spin" /> Testing…</>
              ) : status === 'success' || status === 'quota' ? (
                <><CheckCircle size={14} /> Activated!</>
              ) : (
                <>Activate <ArrowRight size={14} /></>
              )}
            </button>
          </div>

          {/* Status messages */}
          {errMsg && (
            <p style={{ fontSize: '0.78rem', color: '#ff6b6b', padding: '8px 12px', background: 'rgba(255,107,107,0.08)', borderRadius: '8px', border: '1px solid rgba(255,107,107,0.15)' }}>
              {errMsg}
            </p>
          )}
          {status === 'success' && (
            <p style={{ fontSize: '0.82rem', color: '#52b788', padding: '10px 14px', background: 'rgba(82,183,136,0.08)', borderRadius: '8px', border: '1px solid rgba(82,183,136,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={15} /> ✅ Key verified! Full AI is now active. Launching…
            </p>
          )}
          {status === 'quota' && (
            <p style={{ fontSize: '0.82rem', color: '#52b788', padding: '10px 14px', background: 'rgba(82,183,136,0.08)', borderRadius: '8px', border: '1px solid rgba(82,183,136,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={15} /> ✅ Key saved! Daily quota resets at midnight — AI will work fully then. Launching…
            </p>
          )}

          {/* Skip link */}
          <button
            onClick={onSkip}
            style={{ background: 'transparent', border: 'none', color: 'hsl(150,10%,40%)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline', textAlign: 'center', marginTop: '4px' }}
          >
            Skip for now — use built-in farming knowledge instead
          </button>
        </div>
      </div>
    </div>
  );
}
