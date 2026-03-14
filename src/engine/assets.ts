// ─────────────────────────────────────────────────────────
// Mzansi Markets — Asset Registry
// All tradeable instruments shown in the dashboard
// ─────────────────────────────────────────────────────────

export type AssetCategory = 'fx' | 'stocks' | 'crypto' | 'commodities'

export interface Asset {
  symbol:   string        // Twelve Data symbol e.g. "USD/ZAR"
  label:    string        // Display name e.g. "USD/ZAR"
  short:    string        // Short label e.g. "USD/ZAR"
  category: AssetCategory
  tdType:   'forex' | 'stock' | 'cryptocurrency' | 'etf'
  exchange?: string       // e.g. "JSE" for stocks
  decimals:  number       // price decimal places
}

export const ASSETS: Asset[] = [
  // ── FX Pairs ──────────────────────────────────────────
  { symbol:'USD/ZAR', label:'US Dollar / Rand',    short:'USD/ZAR', category:'fx',          tdType:'forex',          decimals:4 },
  { symbol:'EUR/ZAR', label:'Euro / Rand',          short:'EUR/ZAR', category:'fx',          tdType:'forex',          decimals:4 },
  // { symbol:'GBP/ZAR', label:'British Pound / Rand', short:'GBP/ZAR', category:'fx',          tdType:'forex',          decimals:4 },
  // { symbol:'CNY/ZAR', label:'Chinese Yuan / Rand',  short:'CNY/ZAR', category:'fx',          tdType:'forex',          decimals:4 },
  // { symbol:'EUR/USD', label:'Euro / US Dollar',     short:'EUR/USD', category:'fx',          tdType:'forex',          decimals:5 },

  // ── JSE Stocks ────────────────────────────────────────
  // { symbol:'NPN',     label:'Naspers',              short:'NPN',     category:'stocks',      tdType:'stock', exchange:'JSE', decimals:2 },
  { symbol:'SBK',     label:'Standard Bank',        short:'SBK',     category:'stocks',      tdType:'stock', exchange:'JSE', decimals:2 },
  // { symbol:'FSR',     label:'FirstRand',            short:'FSR',     category:'stocks',      tdType:'stock', exchange:'JSE', decimals:2 },
  // { symbol:'AGL',     label:'Anglo American',       short:'AGL',     category:'stocks',      tdType:'stock', exchange:'JSE', decimals:2 },
  { symbol:'SOL',     label:'Sasol',                short:'SOL',     category:'stocks',      tdType:'stock', exchange:'JSE', decimals:2 },

  // ── Crypto ────────────────────────────────────────────
  { symbol:'BTC/USD', label:'Bitcoin',              short:'BTC/USD', category:'crypto',      tdType:'cryptocurrency', decimals:0 },
  // { symbol:'ETH/USD', label:'Ethereum',             short:'ETH/USD', category:'crypto',      tdType:'cryptocurrency', decimals:2 },
  // { symbol:'XRP/USD', label:'Ripple',               short:'XRP/USD', category:'crypto',      tdType:'cryptocurrency', decimals:4 },

  // ── Commodities ───────────────────────────────────────
  { symbol:'XAU/USD', label:'Gold (oz)',            short:'GOLD',    category:'commodities', tdType:'forex',          decimals:2 },
  // { symbol:'XAG/USD', label:'Silver (oz)',          short:'SILVER',  category:'commodities', tdType:'forex',          decimals:3 },
  // { symbol:'USOIL',   label:'Crude Oil (WTI)',      short:'WTI OIL', category:'commodities', tdType:'etf',            decimals:2 },
]

export const CATEGORIES: { id: AssetCategory; label: string; icon: string }[] = [
  { id:'fx',          label:'FX PAIRS',    icon:'💱' },
  { id:'stocks',      label:'JSE STOCKS',  icon:'📈' },
  { id:'crypto',      label:'CRYPTO',      icon:'₿'  },
  { id:'commodities', label:'COMMODITIES', icon:'🪙' },
]

export function assetsByCategory(cat: AssetCategory): Asset[] {
  return ASSETS.filter(a => a.category === cat)
}

export function assetBySymbol(symbol: string): Asset | undefined {
  return ASSETS.find(a => a.symbol === symbol)
}
