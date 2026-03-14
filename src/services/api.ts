// ─────────────────────────────────────────────────────────
// Mzansi Markets — Twelve Data API Service
//
// API docs: https://twelvedata.com/docs
// Free tier: 800 API credits/day, 8 credits/min
//
// CACHING STRATEGY (to preserve quota):
//   - Batch all quotes in ONE /price call = 1 credit
//   - Cache quotes: 5 min TTL
//   - Cache time_series (sparkline): 60 min TTL
//   - Serve stale cache if fetch fails (offline mode)
//
// CORS: Requests go through a Cloudflare Worker proxy
// that injects the apikey header server-side.
// ─────────────────────────────────────────────────────────

import { ASSETS } from '../engine/assets'

export interface Quote {
  symbol:    string
  price:     number
  change:    number     // absolute change
  pct:       number     // percent change
  open:      number
  high:      number
  low:       number
  close:     number     // previous close
  timestamp: number     // unix ms
  stale?:    boolean    // true if from cache and > TTL
}

export interface TimeSeriesPoint {
  datetime: string
  close:    number
}

export type QuoteMap = Record<string, Quote>

// ── Cache helpers ─────────────────────────────────────────

interface CacheEntry<T> { data: T; ts: number }

function cGet<T>(key: string, ttlMs: number): T | null {
  try {
    const raw = localStorage.getItem(`mm_${key}`)
    if (!raw) return null
    const e: CacheEntry<T> = JSON.parse(raw)
    if (Date.now() - e.ts > ttlMs) return null
    return e.data
  } catch { return null }
}

function cGetStale<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`mm_${key}`)
    if (!raw) return null
    return (JSON.parse(raw) as CacheEntry<T>).data
  } catch { return null }
}

function cSet<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`mm_${key}`, JSON.stringify({ data, ts: Date.now() }))
  } catch {}
}

// ── API client ────────────────────────────────────────────

export let PROXY_URL = ''

export function setProxyUrl(url: string) {
  PROXY_URL = url.replace(/\/$/, '')
  localStorage.setItem('mm_proxy', url)
}

export function loadProxyUrl(): string {
  const s = localStorage.getItem('mm_proxy') || ''
  PROXY_URL = s
  return s
}

async function tdFetch<T>(path: string): Promise<T> {
  if (!PROXY_URL) throw new Error('No proxy URL configured')
  const res = await fetch(`${PROXY_URL}${path}`)
  if (!res.ok) throw new Error(`API ${res.status}`)
  const data = await res.json()
  if (data.status === 'error') throw new Error(data.message || 'API error')
  return data as T
}

// ── Batch quote fetch ─────────────────────────────────────
// Fetches ALL asset prices in a single API call using /price
// Returns a QuoteMap indexed by symbol

interface TDBatchPrice {
  [symbol: string]: { price: string } | { code: number; message: string }
}

interface TDQuote {
  symbol:         string
  close:          string
  open:           string
  high:           string
  low:            string
  previous_close: string
  change:         string
  percent_change: string
  datetime:       string
}

export async function fetchAllQuotes(): Promise<{ quotes: QuoteMap; fromCache: boolean }> {
  const CACHE_KEY = 'quotes_all'
  const TTL       = 5 * 60 * 1000   // 5 minutes

  // Return fresh cache if available
  const cached = cGet<QuoteMap>(CACHE_KEY, TTL)
  if (cached) return { quotes: cached, fromCache: true }

  try {
    // Build comma-separated symbol list
    // JSE stocks need exchange suffix for Twelve Data
    const symbols = ASSETS.map(a =>
      a.exchange === 'JSE' ? `${a.symbol}:JSE` : a.symbol
    ).join(',')

    // /quote returns open/high/low/close/change — more useful than /price
    const raw = await tdFetch<TDQuote[] | TDQuote>(`/quote?symbol=${encodeURIComponent(symbols)}`)

    const items: TDQuote[] = Array.isArray(raw) ? raw : [raw]
    const quotes: QuoteMap = {}

    for (const item of items) {
      // Strip exchange suffix from symbol key
      const sym = item.symbol.replace(/:.*$/, '')
      quotes[sym] = {
        symbol:    sym,
        price:     parseFloat(item.close),
        change:    parseFloat(item.change),
        pct:       parseFloat(item.percent_change),
        open:      parseFloat(item.open),
        high:      parseFloat(item.high),
        low:       parseFloat(item.low),
        close:     parseFloat(item.previous_close),
        timestamp: Date.now(),
      }
    }

    cSet(CACHE_KEY, quotes)
    return { quotes, fromCache: false }

  } catch (err) {
    // Offline fallback — return stale cache with flag
    const stale = cGetStale<QuoteMap>(CACHE_KEY)
    if (stale) {
      Object.values(stale).forEach(q => { q.stale = true })
      return { quotes: stale, fromCache: true }
    }
    throw err
  }
}

// ── Time series (sparkline) ───────────────────────────────

interface TDTimeSeries {
  values: Array<{ datetime: string; close: string }>
}

export async function fetchTimeSeries(symbol: string, exchange?: string): Promise<TimeSeriesPoint[]> {
  const CACHE_KEY = `ts_${symbol}`
  const TTL       = 60 * 60 * 1000   // 60 minutes

  const cached = cGet<TimeSeriesPoint[]>(CACHE_KEY, TTL)
  if (cached) return cached

  const sym = exchange === 'JSE' ? `${symbol}:JSE` : symbol

  const raw = await tdFetch<TDTimeSeries>(
    `/time_series?symbol=${encodeURIComponent(sym)}&interval=1day&outputsize=30`
  )

  const points: TimeSeriesPoint[] = raw.values.map(v => ({
    datetime: v.datetime,
    close:    parseFloat(v.close),
  })).reverse()  // oldest first

  cSet(CACHE_KEY, points)
  return points
}

// ── Formatting helpers ────────────────────────────────────

export function fmtPrice(price: number, decimals: number): string {
  if (isNaN(price)) return '---'
  return price.toLocaleString('en-ZA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function fmtPct(pct: number): string {
  if (isNaN(pct)) return '---'
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(2)}%`
}

export function isUp(pct: number): boolean  { return pct >= 0 }
export function isDown(pct: number): boolean { return pct < 0 }

export function ageLabel(ts: number): string {
  const sec = Math.floor((Date.now() - ts) / 1000)
  if (sec < 60)  return `${sec}s ago`
  if (sec < 3600) return `${Math.floor(sec/60)}m ago`
  return `${Math.floor(sec/3600)}h ago`
}
