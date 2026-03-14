import React, { useState } from 'react'
import { AppConfig } from '../types'

// ── Setup ─────────────────────────────────────────────────

interface SetupProps {
  existing: AppConfig | null
  onSave:   (cfg: AppConfig) => void
}

export function SetupView({ existing, onSave }: SetupProps) {
  const [proxy, setProxy] = useState(existing?.proxyUrl ?? '')
  const [error, setError] = useState('')

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); save() }
  }

  function save() {
    if (!proxy.trim()) { setError('Worker URL required'); return }
    onSave({ proxyUrl: proxy.trim() })
  }

  return (
    <div className="w-[240px] h-[320px] bg-black flex flex-col font-mono scanlines" onKeyDown={handleKey}>
      <div className="h-[40px] flex-shrink-0 flex items-center px-2"
        style={{background:'#08080f', borderBottom:'1px solid #0f0f1f'}}>
        <span className="font-hud text-[13px] font-bold tracking-widest" style={{color:'#4ade80'}}>
          MZANSI MARKETS
        </span>
        <span className="ml-auto text-[10px] font-bold" style={{color:'#333'}}>SETUP</span>
      </div>

      <div className="flex-1 flex flex-col px-3 pt-4 gap-3">

        <div className="text-[11px] font-bold leading-relaxed" style={{color:'#fffaaa'}}>
          GET A FREE API KEY AT{'\n'}
          <span style={{color:'#4ade80'}}>twelvedata.com</span>
          {'\n'}THEN DEPLOY THE WORKER.
        </div>

        <div>
          <div className="text-[10px] font-bold mb-1" style={{color:'#4ade80'}}>▶ WORKER PROXY URL</div>
          <input
            autoFocus
            type="text"
            value={proxy}
            onChange={e => setProxy(e.target.value)}
            placeholder="https://mzansi-proxy.*.workers.dev"
            className="w-full h-[28px] rounded-sm px-2 text-[10px] font-bold outline-none font-mono"
            style={{background:'#08080f', border:'1px solid #4ade80', color:'#ccc'}}
          />
          <div className="text-[11px] font-bold mt-1 leading-relaxed" style={{color:'#fffaac'}}>
            Deploy worker/proxy.ts to Cloudflare Workers.{'\n'}
            See README for full instructions.
          </div>
        </div>

        {error && <div className="text-[10px] font-bold" style={{color:'#e05555'}}>{error}</div>}

        <button onClick={save}
          className="w-full h-[28px] rounded-sm text-[11px] font-extrabold tracking-widest font-mono mt-auto"
          style={{background:'#050f05', border:'1px solid #4ade80', color:'#4ade80'}}>
          SAVE & START
        </button>
      </div>

      <div className="h-[24px] flex-shrink-0 flex items-center justify-between px-2"
        style={{background:'#08080f', borderTop:'1px solid #0f0f1f'}}>
        <span className="text-[11px] font-bold" style={{color:'#4ade80'}}>SAVE</span>
        <span className="text-[11px] font-bold" style={{color:'#333'}}></span>
        <span className="text-[11px] font-bold" style={{color:'#333'}}></span>
      </div>
    </div>
  )
}

// ── Loading ───────────────────────────────────────────────

export function LoadingView() {
  return (
    <div className="w-[240px] h-[320px] bg-black flex flex-col items-center justify-center gap-3 font-mono scanlines">
      <div className="font-hud text-[14px] font-bold tracking-widest" style={{color:'#4ade80'}}>
        MZANSI
      </div>
      <div className="font-hud text-[14px] font-bold tracking-widest" style={{color:'#4ade80'}}>
        MARKETS
      </div>
      <div className="flex gap-2 mt-2">
        {[0,1,2].map(i => (
          <div key={i}
            className="w-[5px] h-[5px] rounded-full animate-pulse"
            style={{background:'#4ade80', animationDelay:`${i*0.2}s`}} />
        ))}
      </div>
    </div>
  )
}
