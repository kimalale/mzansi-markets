// ─────────────────────────────────────────────────────────
// Mzansi Markets — Watchlist (pinned assets)
// ─────────────────────────────────────────────────────────

const KEY = 'mm_watchlist'

export function getWatchlist(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

export function isPinned(symbol: string): boolean {
  return getWatchlist().includes(symbol)
}

export function togglePin(symbol: string): boolean {
  const list = getWatchlist()
  const idx  = list.indexOf(symbol)
  if (idx >= 0) {
    list.splice(idx, 1)
    localStorage.setItem(KEY, JSON.stringify(list))
    return false
  } else {
    list.push(symbol)
    localStorage.setItem(KEY, JSON.stringify(list))
    return true
  }
}
