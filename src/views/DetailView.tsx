import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Asset } from '../engine/assets'
import { Quote, fetchTimeSeries, fmtPrice, fmtPct, TimeSeriesPoint } from '../services/api'
import { drawSparkline } from '../engine/sparkline'
import { togglePin, isPinned } from '../services/watchlist'
import { sfx } from '../../cloudphone-ui/src/engine/sound'
import { CP_KEYS } from '../../cloudphone-ui/src/types'

interface Props {
  asset:    Asset
  quote:    Quote | undefined
  onBack:   () => void
  onAddAlert: (asset: Asset) => void
}

const ACTIONS = ['PIN', 'ALERT', 'BACK'] as const
type Action = typeof ACTIONS[number]

export function DetailView({ asset, quote, onBack, onAddAlert }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const [series,   setSeries]   = useState<TimeSeriesPoint[]>([])
  const [loading,  setLoading]  = useState(true)
  const [pinned,   setPinned]   = useState(() => isPinned(asset.symbol))
  const [focusedAct, setFocusedAct] = useState(0)

  useEffect(() => {
    fetchTimeSeries(asset.symbol, asset.exchange)
      .then(pts => { setSeries(pts); setLoading(false) })
      .catch(() => setLoading(false))
  }, [asset])

  useEffect(() => {
    if (!loading && series.length && canvasRef.current) {
      drawSparkline(canvasRef.current, series)
    }
  }, [loading, series])

  const handleAction = useCallback((act: Action) => {
    if (act === 'BACK')  { sfx.play('back');   onBack() }
    if (act === 'PIN')   {
      const now = togglePin(asset.symbol)
      setPinned(now)
      sfx.play(now ? 'win' : 'nav')
    }
    if (act === 'ALERT') { sfx.play('select'); onAddAlert(asset) }
  }, [asset, onBack, onAddAlert])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === CP_KEYS.LEFT)  { sfx.play('nav'); setFocusedAct(i => Math.max(0, i-1)) }
      if (e.key === CP_KEYS.RIGHT) { sfx.play('nav'); setFocusedAct(i => Math.min(ACTIONS.length-1, i+1)) }
      if (e.key === CP_KEYS.CONFIRM || e.key === CP_KEYS.LSK) handleAction(ACTIONS[focusedAct])
      if (e.key === CP_KEYS.RSK)   onBack()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [focusedAct, handleAction, onBack])

  const up    = quote ? quote.pct >= 0 : null
  const color = up === null ? '#888' : up ? '#4ade80' : '#e05555'

  const rangeMin = series.length ? Math.min(...series.map(p => p.close)) : 0
  const rangeMax = series.length ? Math.max(...series.map(p => p.close)) : 0

  return (
    <div className="w-[240px] h-[320px] bg-black flex flex-col font-mono scanlines">

      {/* Header */}
      <div className="h-[40px] flex-shrink-0 flex items-center justify-between px-2"
        style={{ background:'#08080f', borderBottom:'1px solid #0f0f1f' }}>
        <div>
          <div className="font-hud text-[12px] font-bold" style={{color:'#4ade80'}}>{asset.short}</div>
          <div className="text-[10px] font-bold tracking-wide" style={{color:'#333'}}>{asset.label}</div>
        </div>
        <div className="text-right">
          <div className="font-hud text-[13px] font-bold" style={{color}}>
            {quote ? fmtPrice(quote.price, asset.decimals) : '---'}
          </div>
          <div className="text-[13px]" style={{color}}>
            {quote ? (up ? '▲ ' : '▼ ') + fmtPct(quote.pct) : ''}
          </div>
        </div>
      </div>

      {/* Sparkline */}
      <div className="flex-shrink-0 relative" style={{height:90, background:'#050505'}}>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[13px] animate-pulse" style={{color:'#333'}}>LOADING CHART...</span>
          </div>
        ) : series.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[13px]" style={{color:'#333'}}>NO CHART DATA</span>
          </div>
        ) : (
          <>
            <canvas ref={canvasRef} width={240} height={90} className="w-full h-full" />
            {/* Range labels */}
            <div className="absolute top-1 right-1 text-[13px]" style={{color:'#fff'}}>
              {fmtPrice(rangeMax, asset.decimals)}
            </div>
            <div className="absolute bottom-1 right-1 text-[13px]" style={{color:'#fff'}}>
              {fmtPrice(rangeMin, asset.decimals)}
            </div>
            <div className="absolute bottom-1 left-1 text-[13px]" style={{color:'#fff'}}>30D</div>
          </>
        )}
      </div>

      {/* OHLC */}
      <div className="flex-shrink-0 grid grid-cols-2 gap-[1px] px-2 py-2"
        style={{background:'#08080f', borderBottom:'1px solid #0f0f1f'}}>
        {quote ? [
          ['OPEN',  fmtPrice(quote.open,  asset.decimals)],
          ['CLOSE', fmtPrice(quote.close, asset.decimals)],
          ['HIGH',  fmtPrice(quote.high,  asset.decimals)],
          ['LOW',   fmtPrice(quote.low,   asset.decimals)],
        ].map(([label, val]) => (
          <div key={label} className="flex justify-between items-center px-1">
            <span className="text-[10px]" style={{color:'#fff'}}>{label}</span>
            <span className="text-[10px] font-hud" style={{color:'#fff'}}>{val}</span>
          </div>
        )) : (
          <div className="col-span-2 text-center text-[10px]" style={{color:'#fff'}}>
            No quote data available
          </div>
        )}
      </div>

      {/* 30D stats */}
      {series.length > 1 && (
        <div className="flex-shrink-0 flex justify-between px-3 py-1"
          style={{background:'#08080f', borderBottom:'1px solid #0f0f1f'}}>
          {(() => {
            const first = series[0].close
            const last  = series[series.length - 1].close
            const chg   = ((last - first) / first) * 100
            const up30  = chg >= 0
            return (
              <>
                <span className="text-[10px]" style={{color:'#fff'}}>30D CHANGE</span>
                <span className="text-[10px] font-hud" style={{color: up30 ? '#4ade80' : '#e05555'}}>
                  {up30 ? '+' : ''}{chg.toFixed(2)}%
                </span>
              </>
            )
          })()}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex-1 flex items-center justify-center gap-3 px-3">
        {ACTIONS.map((act, i) => (
          <div
            key={act}
            onClick={() => handleAction(act)}
            className="px-3 py-2 rounded-sm border text-[10px] font-extrabold tracking-wide cursor-pointer transition-all"
            style={{
              borderColor: focusedAct === i ? '#4ade80' : '#1a1a2e',
              color:       focusedAct === i ? '#4ade80' : '#444',
              background:  focusedAct === i ? '#050f05' : '#08080f',
            }}
          >
            {act === 'PIN' ? (pinned ? '★ UNPIN' : '☆ PIN') : act}
          </div>
        ))}
      </div>

      {/* Softkeys */}
      <div className="h-[24px] flex-shrink-0 flex items-center justify-between px-2"
        style={{ background:'#08080f', borderTop:'1px solid #0f0f1f' }}>
        <span className="text-[11px] font-bold" style={{color:'#4ade80'}}>SELECT</span>
        <span className="text-[11px] font-bold" style={{color:'#333'}}>◀▶ ACTION</span>
        <span className="text-[11px] font-bold" style={{color:'#444'}} onClick={onBack}>BACK</span>
      </div>
    </div>
  )
}
