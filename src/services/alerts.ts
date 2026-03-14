// ─────────────────────────────────────────────────────────
// Mzansi Markets — Price Alerts
//
// Alerts are stored in localStorage and checked against
// fresh quotes on every data refresh. When triggered, the
// alert flashes on screen and is marked as fired.
// ─────────────────────────────────────────────────────────

import { QuoteMap } from './api'

export type AlertDirection = 'above' | 'below'

export interface PriceAlert {
  id:        string
  symbol:    string
  target:    number
  direction: AlertDirection  // fire when price goes above/below target
  label:     string          // e.g. "USD/ZAR above 19.50"
  fired:     boolean
  createdAt: number
}

const KEY = 'mm_alerts'

function load(): PriceAlert[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

function save(alerts: PriceAlert[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(alerts)) } catch {}
}

export function getAlerts(): PriceAlert[] {
  return load()
}

export function addAlert(symbol: string, target: number, direction: AlertDirection): PriceAlert {
  const alerts = load()
  const alert: PriceAlert = {
    id:        `${symbol}_${Date.now()}`,
    symbol,
    target,
    direction,
    label:     `${symbol} ${direction} ${target}`,
    fired:     false,
    createdAt: Date.now(),
  }
  alerts.push(alert)
  save(alerts)
  return alert
}

export function removeAlert(id: string): void {
  save(load().filter(a => a.id !== id))
}

export function clearFiredAlerts(): void {
  save(load().filter(a => !a.fired))
}

/** Check all alerts against current quotes. Returns fired alert symbols. */
export function checkAlerts(quotes: QuoteMap): string[] {
  const alerts = load()
  const fired: string[] = []
  let changed = false

  for (const alert of alerts) {
    if (alert.fired) continue
    const q = quotes[alert.symbol]
    if (!q) continue

    const triggered =
      (alert.direction === 'above' && q.price >= alert.target) ||
      (alert.direction === 'below' && q.price <= alert.target)

    if (triggered) {
      alert.fired = true
      fired.push(alert.symbol)
      changed = true
    }
  }

  if (changed) save(alerts)
  return fired
}
