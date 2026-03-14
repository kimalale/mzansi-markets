import React, { useState, useEffect, useCallback, useRef } from 'react'
import { ASSETS, CATEGORIES, AssetCategory, Asset } from '../engine/assets'
import { QuoteMap, fetchAllQuotes, fmtPrice, fmtPct, ageLabel } from '../services/api'
import { checkAlerts } from '../services/alerts'
import { getWatchlist, togglePin, isPinned } from '../services/watchlist'
import { sfx } from '../../cloudphone-ui/src/engine/sound'
import { CP_KEYS } from '../../cloudphone-ui/src/types'

interface Props {
  onDetail:  (asset: Asset) => void
  onAlerts:  () => void
  onSetup:   () => void
}

const CAT_COLORS: Record<AssetCategory, string> = {
  fx:          '#00f5ff',
  stocks:      '#4ade80',
  crypto:      '#f59e0b',
  commodities: '#c084fc',
}

export function DashboardView({ onDetail, onAlerts, onSetup }: Props) {
  const [quotes,       setQuotes]       = useState<QuoteMap>({})
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [fromCache,    setFromCache]    = useState(false)
  const [firedAlerts,  setFiredAlerts]  = useState<string[]>([])
  const [focusedIdx,   setFocusedIdx]   = useState(0)
  const [watchlist,    setWatchlist]    = useState<string[]>([])
  const [activeCat,    setActiveCat]    = useState<AssetCategory | 'watchlist'>('watchlist')
  const flashRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const { quotes: q, fromCache: fc } = await fetchAllQuotes()
      setQuotes(q)
      setFromCache(fc)
      const fired = checkAlerts(q)
      if (fired.length) {
        setFiredAlerts(fired)
        sfx.play('notify')
        if (flashRef.current) clearTimeout(flashRef.current)
        flashRef.current = setTimeout(() => setFiredAlerts([]), 4000)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fetch failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setWatchlist(getWatchlist())
    refresh()
    // Auto-refresh every 5 minutes
    const t = setInterval(refresh, 5 * 60 * 1000)
    return () => clearInterval(t)
  }, [refresh])

  // Compute visible asset list for current tab
  const visibleAssets: Asset[] = activeCat === 'watchlist'
    ? watchlist.map(sym => ASSETS.find(a => a.symbol === sym)!).filter(Boolean)
    : ASSETS.filter(a => a.category === activeCat)

  // D-pad input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === CP_KEYS.UP) {
        sfx.play('nav')
        setFocusedIdx(i => Math.max(0, i - 1))
      }
      if (e.key === CP_KEYS.DOWN) {
        sfx.play('nav')
        setFocusedIdx(i => Math.min(visibleAssets.length - 1, i + 1))
      }
      if (e.key === CP_KEYS.LEFT) {
        sfx.play('nav')
        const cats: (AssetCategory | 'watchlist')[] = ['watchlist', 'fx', 'stocks', 'crypto', 'commodities']
        const idx = cats.indexOf(activeCat)
        setActiveCat(cats[Math.max(0, idx - 1)])
        setFocusedIdx(0)
      }
      if (e.key === CP_KEYS.RIGHT) {
        sfx.play('nav')
        const cats: (AssetCategory | 'watchlist')[] = ['watchlist', 'fx', 'stocks', 'crypto', 'commodities']
        const idx = cats.indexOf(activeCat)
        setActiveCat(cats[Math.min(cats.length - 1, idx + 1)])
        setFocusedIdx(0)
      }
      if (e.key === CP_KEYS.CONFIRM || e.key === CP_KEYS.LSK) {
        if (visibleAssets[focusedIdx]) {
          sfx.play('select')
          onDetail(visibleAssets[focusedIdx])
        }
      }
      if (e.key === CP_KEYS.RSK) {
        sfx.play('nav')
        onAlerts()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [visibleAssets, focusedIdx, activeCat, onDetail, onAlerts])

  const catTabs: (AssetCategory | 'watchlist')[] = ['watchlist', 'fx', 'stocks', 'crypto', 'commodities']
  const catLabels: Record<string, string> = {
    watchlist: '★', fx: 'FX', stocks: 'JSE', crypto: '₿', commodities: 'CMD',
  }

  return (
    <div className="w-[240px] h-[320px] bg-black flex flex-col font-mono scanlines relative overflow-hidden">

      {/* Header */}
      <div className="h-[40px] flex-shrink-0 flex items-center justify-between px-2"
        style={{ background:'#08080f', borderBottom:'1px solid #0f0f1f' }}>
        <span className="font-hud text-[10px] font-bold tracking-widest" style={{ color:'#4ade80' }}>
          MZANSI MARKETS
        </span>
        <div className="flex items-center gap-2">
          {loading && <span className="text-[7px] animate-pulse" style={{color:'#555'}}>UPDATING</span>}
          {!loading && fromCache && <span className="text-[7px]" style={{color:'#333'}}>CACHED</span>}
          {!loading && !fromCache && !error && (
            <span className="text-[7px]" style={{color:'#1a3a1a'}}>● LIVE</span>
          )}
          {error && <span className="text-[7px]" style={{color:'#e05555'}}>ERR</span>}
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-shrink-0" style={{ borderBottom:'1px solid #0f0f1f' }}>
        {catTabs.map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveCat(cat); setFocusedIdx(0); sfx.play('nav') }}
            className="flex-1 h-[18px] text-[7px] tracking-wide transition-all"
            style={{
              background:  activeCat === cat ? '#0a0a1a' : '#08080f',
              color:       activeCat === cat
                ? (cat === 'watchlist' ? '#fbbf24' : CAT_COLORS[cat as AssetCategory])
                : '#333',
              borderBottom: activeCat === cat
                ? `2px solid ${cat === 'watchlist' ? '#fbbf24' : CAT_COLORS[cat as AssetCategory]}`
                : '2px solid transparent',
            }}
          >
            {catLabels[cat]}
          </button>
        ))}
      </div>

      {/* Asset list */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {error && !Object.keys(quotes).length ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <span className="text-[8px] text-center px-4" style={{color:'#e05555'}}>{error}</span>
            <button onClick={refresh}
              className="text-[8px] px-3 py-1 rounded-sm border"
              style={{color:'#4ade80', borderColor:'#4ade80'}}>RETRY</button>
          </div>
        ) : activeCat === 'watchlist' && visibleAssets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-1 px-4">
            <span className="text-[8px] text-center" style={{color:'#333'}}>No pinned assets yet</span>
            <span className="text-[7px] text-center" style={{color:'#222'}}>Open any asset and press ● to pin</span>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            {visibleAssets.map((asset, i) => {
              const q      = quotes[asset.symbol]
              const up     = q ? q.pct >= 0 : null
              const focused = i === focusedIdx
              const fired   = firedAlerts.includes(asset.symbol)
              const pinned  = isPinned(asset.symbol)

              return (
                <div
                  key={asset.symbol}
                  onClick={() => { sfx.play('select'); onDetail(asset) }}
                  className="flex items-center px-2 cursor-pointer transition-all"
                  style={{
                    height: '36px',
                    background: fired
                      ? 'rgba(251,191,36,0.15)'
                      : focused
                        ? '#0a0a1a'
                        : 'transparent',
                    borderLeft: focused
                      ? `2px solid ${activeCat === 'watchlist' ? '#fbbf24' : CAT_COLORS[asset.category]}`
                      : '2px solid transparent',
                  }}
                >
                  {/* Symbol */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] tracking-wide"
                        style={{ color: focused
                          ? (activeCat === 'watchlist' ? '#fbbf24' : CAT_COLORS[asset.category])
                          : '#aaa' }}>
                        {asset.short}
                      </span>
                      {pinned && <span style={{color:'#fbbf24', fontSize:7}}>★</span>}
                      {fired  && <span style={{color:'#fbbf24', fontSize:7}}>⚡</span>}
                    </div>
                    {q && (
                      <div className="text-[6px]" style={{color:'#333'}}>
                        {ageLabel(q.timestamp)}
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <div className="text-[9px] font-hud" style={{color: q ? '#ccc' : '#333'}}>
                      {q ? fmtPrice(q.price, asset.decimals) : '---'}
                    </div>
                    {q && (
                      <div className="text-[7px]"
                        style={{ color: up === null ? '#333' : up ? '#4ade80' : '#e05555' }}>
                        {up !== null ? (up ? '▲ ' : '▼ ') : ''}{fmtPct(q.pct)}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Softkeys */}
      <div className="h-[24px] flex-shrink-0 flex items-center justify-between px-2"
        style={{ background:'#08080f', borderTop:'1px solid #0f0f1f' }}>
        <span className="text-[8px]" style={{color:'#4ade80'}}>DETAIL</span>
        <span className="text-[7px]" style={{color:'#333'}}>◀▶ TAB  ↑↓ MOVE</span>
        <span className="text-[8px]" style={{color:'#444'}} onClick={onAlerts}>ALERTS</span>
      </div>
    </div>
  )
}
