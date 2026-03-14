import React, { useState, useEffect, useCallback } from 'react'
import { Asset } from '../engine/assets'
import { fmtPrice } from '../services/api'
import {
  getAlerts, addAlert, removeAlert, clearFiredAlerts,
  PriceAlert, AlertDirection,
} from '../services/alerts'
import { useDPad }  from '../../cloudphone-ui/src/hooks/useDPad'
import { sfx }      from '../../cloudphone-ui/src/engine/sound'
import { CP_KEYS }  from '../../cloudphone-ui/src/types'

// ── Alerts List ───────────────────────────────────────────

interface AlertsProps {
  onBack: () => void
}

export function AlertsView({ onBack }: AlertsProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])

  useEffect(() => { setAlerts(getAlerts()) }, [])

  const { isFocused } = useDPad({
    length:  alerts.length || 1,
    axis:    'vertical',
    onBack:  () => { sfx.play('back'); onBack() },
    onChange: () => sfx.play('nav'),
    onConfirm: (i) => {
      if (alerts[i]) {
        removeAlert(alerts[i].id)
        setAlerts(getAlerts())
        sfx.play('nav')
      }
    },
  })

  function clearFired() {
    clearFiredAlerts()
    setAlerts(getAlerts())
    sfx.play('nav')
  }

  const hasFired = alerts.some(a => a.fired)

  return (
    <div className="w-[240px] h-[320px] bg-black flex flex-col font-mono scanlines">

      <div className="h-[40px] flex-shrink-0 flex items-center justify-between px-2"
        style={{background:'#08080f', borderBottom:'1px solid #0f0f1f'}}>
        <span className="font-hud text-[12px] font-bold tracking-widest" style={{color:'#fbbf24'}}>
          PRICE ALERTS
        </span>
        {hasFired && (
          <button onClick={clearFired} className="text-[10px] tracking-wide px-2 py-1 rounded-sm"
            style={{color:'#888', border:'1px solid #333'}}>
            CLEAR FIRED
          </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col px-2 py-1 gap-1">
        {alerts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-1">
            <span className="text-[11px] font-bold" style={{color:'#fff'}}>No alerts set</span>
            <span className="text-[11px] font-bold" style={{color:'#fffaaa'}}>Open an asset → ALERT to add one</span>
          </div>
        ) : (
          alerts.map((alert, i) => (
            <div
              key={alert.id}
              className="flex items-center justify-between px-2 py-2 rounded-sm border cursor-pointer"
              style={{
                borderColor: isFocused(i) ? '#fbbf24' : alert.fired ? '#1a1a00' : '#0f0f1f',
                background:  alert.fired ? '#0d0d00' : isFocused(i) ? '#0a0a00' : '#08080f',
              }}
            >
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold" style={{color: alert.fired ? '#fbbf24' : '#aaa'}}>
                    {alert.symbol}
                  </span>
                  {alert.fired && <span className="text-[11px]" style={{color:'#fbbf24'}}>⚡ FIRED</span>}
                </div>
                <div className="text-[10px] font-bold" style={{color:'#444'}}>
                  {alert.direction.toUpperCase()} {alert.target}
                </div>
              </div>
              {isFocused(i) && (
                <span className="text-[10px] font-bold" style={{color:'#e05555'}}>● DEL</span>
              )}
            </div>
          ))
        )}
      </div>

      <div className="h-[24px] flex-shrink-0 flex items-center justify-between px-2"
        style={{background:'#08080f', borderTop:'1px solid #0f0f1f'}}>
        <span className="text-[11px] font-bold" style={{color:'#fbbf24'}}>DELETE</span>
        <span className="text-[11px] font-bold" style={{color:'#333'}}>↑↓ MOVE</span>
        <span className="text-[11px] font-bold" style={{color:'#444'}} onClick={onBack}>BACK</span>
      </div>
    </div>
  )
}

// ── Add Alert ─────────────────────────────────────────────

interface AddAlertProps {
  asset:   Asset
  onSave:  () => void
  onBack:  () => void
}

export function AddAlertView({ asset, onSave, onBack }: AddAlertProps) {
  const [target,    setTarget]    = useState('')
  const [direction, setDirection] = useState<AlertDirection>('above')
  const [field,     setField]     = useState<'target' | 'dir'>('target')
  const [error,     setError]     = useState('')

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === CP_KEYS.UP || e.key === CP_KEYS.DOWN) {
      e.preventDefault()
      setField(f => f === 'target' ? 'dir' : 'target')
      sfx.play('nav')
    }
    if (e.key === CP_KEYS.LEFT || e.key === CP_KEYS.RIGHT) {
      if (field === 'dir') {
        setDirection(d => d === 'above' ? 'below' : 'above')
        sfx.play('nav')
      }
    }
    if (e.key === CP_KEYS.CONFIRM || e.key === CP_KEYS.LSK) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === CP_KEYS.RSK) { sfx.play('back'); onBack() }
  }, [field, target, direction, onBack])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  function handleSave() {
    const val = parseFloat(target)
    if (isNaN(val) || val <= 0) { setError('Enter a valid price'); return }
    addAlert(asset.symbol, val, direction)
    sfx.play('win')
    onSave()
  }

  return (
    <div className="w-[240px] h-[320px] bg-black flex flex-col font-mono scanlines">

      <div className="h-[40px] flex-shrink-0 flex items-center px-2"
        style={{background:'#08080f', borderBottom:'1px solid #0f0f1f'}}>
        <span className="font-hud text-[10px] font-bold tracking-widest" style={{color:'#fbbf24'}}>
          ADD ALERT
        </span>
        <span className="ml-2 text-[8px]" style={{color:'#4ade80'}}>{asset.short}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-4">

        <div className="text-[7px] tracking-wide text-center" style={{color:'#333'}}>
          ALERT WHEN PRICE GOES
        </div>

        {/* Direction selector */}
        <div className="w-full">
          <div className="text-[7px] mb-1" style={{color: field==='dir' ? '#fbbf24' : '#333'}}>
            {field==='dir' ? '▶ ' : '  '}DIRECTION (◀▶ TO CHANGE)
          </div>
          <div className="flex gap-2">
            {(['above','below'] as AlertDirection[]).map(d => (
              <div
                key={d}
                onClick={() => setDirection(d)}
                className="flex-1 h-[26px] flex items-center justify-center rounded-sm border text-[8px] tracking-wide cursor-pointer"
                style={{
                  borderColor: direction===d ? '#fbbf24' : '#1a1a1a',
                  color:       direction===d ? '#fbbf24' : '#444',
                  background:  direction===d ? '#0d0d00' : '#08080f',
                }}
              >
                {d.toUpperCase()} {d==='above' ? '▲' : '▼'}
              </div>
            ))}
          </div>
        </div>

        {/* Target price */}
        <div className="w-full">
          <div className="text-[7px] mb-1" style={{color: field==='target' ? '#fbbf24' : '#333'}}>
            {field==='target' ? '▶ ' : '  '}TARGET PRICE
          </div>
          <input
            autoFocus
            type="number"
            value={target}
            onChange={e => setTarget(e.target.value)}
            onFocus={() => setField('target')}
            placeholder={`e.g. ${fmtPrice(0, asset.decimals)}`}
            className="w-full h-[28px] rounded-sm px-2 text-[9px] outline-none font-mono"
            style={{
              background:  '#08080f',
              border:      `1px solid ${field==='target' ? '#fbbf24' : '#1a1a1a'}`,
              color:       '#ccc',
            }}
          />
          {error && <div className="text-[7px] mt-1" style={{color:'#e05555'}}>{error}</div>}
        </div>

        <button
          onClick={handleSave}
          className="w-full h-[28px] rounded-sm text-[9px] tracking-widest font-mono"
          style={{background:'#0d0d00', border:'1px solid #fbbf24', color:'#fbbf24'}}
        >
          SET ALERT
        </button>
      </div>

      <div className="h-[24px] flex-shrink-0 flex items-center justify-between px-2"
        style={{background:'#08080f', borderTop:'1px solid #0f0f1f'}}>
        <span className="text-[8px]" style={{color:'#fbbf24'}}>SAVE</span>
        <span className="text-[7px]" style={{color:'#333'}}>↑↓ SWITCH</span>
        <span className="text-[8px]" style={{color:'#444'}} onClick={onBack}>BACK</span>
      </div>
    </div>
  )
}
