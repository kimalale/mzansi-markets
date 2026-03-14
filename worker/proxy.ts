/**
 * mzansi-proxy — Cloudflare Worker
 *
 * Proxies requests to Twelve Data API, injecting the apikey
 * server-side to avoid exposing it in the client bundle.
 *
 * Deploy:
 *   1. npm install -g wrangler
 *   2. wrangler login
 *   3. wrangler secret put TD_API_KEY   ← paste your Twelve Data key
 *   4. Edit ALLOWED_ORIGINS below with your GitHub Pages URL
 *   5. wrangler deploy
 *
 * Free tier: 800 API credits/day
 * The widget batches all quotes in ONE /quote call = 1 credit per refresh.
 * With 5-min cache, max 288 refreshes/day — well within free limits.
 */

const TD_BASE = 'https://api.twelvedata.com'

const ALLOWED_ORIGINS = [
  'https://kimalale.github.io',
  'http://localhost:5173',
  'http://localhost:4173',
]

const ALLOWED_PATHS = ['quote', 'price', 'time_series', 'exchange_rate']

export interface Env {
  TD_API_KEY: string
}

function cors(origin: string): Record<string, string> {
  const ok = ALLOWED_ORIGINS.some(o => origin.startsWith(o))
  return {
    'Access-Control-Allow-Origin':  ok ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = req.headers.get('Origin') ?? ''
    const c      = cors(origin)

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: c })
    if (req.method !== 'GET')     return new Response('Method not allowed', { status: 405, headers: c })

    const url      = new URL(req.url)
    const endpoint = url.pathname.replace(/^\/+/, '')

    if (!ALLOWED_PATHS.includes(endpoint)) {
      return new Response('Not found', { status: 404, headers: c })
    }

    // Append apikey to query params
    url.searchParams.set('apikey', env.TD_API_KEY)
    const target = `${TD_BASE}/${endpoint}${url.search}`

    try {
      const resp = await fetch(target, {
        cf: {
          cacheTtl:        endpoint === 'time_series' ? 3600 : 300,
          cacheEverything: true,
        },
      })

      const body = await resp.text()
      return new Response(body, {
        status:  resp.status,
        headers: {
          ...c,
          'Content-Type':  'application/json',
          'Cache-Control': endpoint === 'time_series'
            ? 'public, max-age=3600'
            : 'public, max-age=300',
        },
      })
    } catch (err) {
      return new Response(
        JSON.stringify({ status: 'error', message: String(err) }),
        { status: 502, headers: { ...c, 'Content-Type': 'application/json' } }
      )
    }
  },
}
