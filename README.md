# Mzansi Markets — CloudPhone Widget

Live ZAR FX, JSE stocks, crypto and commodities dashboard built for CloudPhone feature phones.
WebGL sparkline charts, price alerts, watchlist pinning, and offline cache — all in 240×320px.

---

## What it tracks

| Category    | Assets                                         |
|-------------|------------------------------------------------|
| FX Pairs    | USD/ZAR, EUR/ZAR, GBP/ZAR, CNY/ZAR, EUR/USD  |
| JSE Stocks  | NPN (Naspers), SBK (Standard Bank), FSR (FirstRand), AGL (Anglo American), SOL (Sasol) |
| Crypto      | BTC/USD, ETH/USD, XRP/USD                     |
| Commodities | Gold, Silver, WTI Crude Oil                   |

---

## Features

- **Live quotes** — all assets refreshed in a single batch API call (1 credit per refresh)
- **Colour-coded % change** — green ▲ up, red ▼ down
- **Watchlist** — pin any asset to a ★ Favourites tab
- **Price alerts** — set above/below targets, flashes ⚡ when triggered
- **30-day sparkline** — WebGL line chart with fill on the detail screen
- **OHLC panel** — open, high, low, close on detail screen
- **Offline cache** — serves last known prices if network fails
- **Auto-refresh** — every 5 minutes while app is open

---

## Architecture

```
CloudPhone device
    │ HTTP GET (no API key in request)
    ▼
Cloudflare Worker (free)     ← injects TD_API_KEY server-side
    │ apikey=<secret>
    ▼
Twelve Data API              ← live market data
```

---

## Step 1 — Get a Twelve Data API key

1. Go to **https://twelvedata.com** → Sign up (free)
2. Copy your API key from the dashboard
3. Free tier: **800 credits/day** — the app uses ~1 credit per 5-min refresh

---

## Step 2 — Deploy the Cloudflare Worker proxy

```bash
npm install -g wrangler
wrangler login

# Store your API key as a secret (never in git)
wrangler secret put TD_API_KEY
# Paste your Twelve Data key when prompted

# Edit worker/proxy.ts — update ALLOWED_ORIGINS:
# 'https://YOUR_USERNAME.github.io'

wrangler deploy
# → https://mzansi-proxy.YOUR_SUBDOMAIN.workers.dev
```

---

## Step 3 — Deploy widget to GitHub Pages

```bash
git init && git add . && git commit -m "Mzansi Markets"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mzansi-markets.git
git push -u origin main
# Settings → Pages → Source → GitHub Actions
# Live at: https://YOUR_USERNAME.github.io/mzansi-markets/
```

---

## Step 4 — Register on CloudPhone

1. **https://cloudphone.tech/my** → Add Widget
2. Name: `Mzansi Markets`
3. URL: `https://YOUR_USERNAME.github.io/mzansi-markets/`
4. Icon: `public/icon.png`
5. Test at **https://cloudphone.tech/my/simulator**

---

## First launch

On first open the app shows a **Setup screen** — paste your Worker URL and press SAVE.
Config is stored in `localStorage`, setup is one-time only.

---

## Navigation

| Key              | Action                          |
|------------------|---------------------------------|
| Arrow Up/Down    | Move through asset list         |
| Arrow Left/Right | Switch category tabs            |
| Enter / Escape   | Open asset detail / confirm     |
| Backspace        | Back / RSK                      |
| Center (●)       | Open detail / confirm action    |

---

## Caching strategy

| Endpoint      | App cache TTL | Cloudflare edge TTL |
|---------------|---------------|---------------------|
| `/quote`      | 5 minutes     | 5 minutes           |
| `/time_series`| 60 minutes    | 60 minutes          |

With auto-refresh every 5 min and edge caching, you stay comfortably within 800 credits/day.

---

## Adding more assets

Edit `src/engine/assets.ts` — add entries to the `ASSETS` array:

```ts
{ symbol:'AAPL',    label:'Apple Inc',     short:'AAPL',    category:'stocks',
  tdType:'stock',   exchange:'NASDAQ',     decimals:2 },
{ symbol:'USD/NGN', label:'Dollar / Naira', short:'USD/NGN', category:'fx',
  tdType:'forex',   decimals:2 },
```

Twelve Data symbol reference: **https://twelvedata.com/symbols**

---

## File structure

```
mzansi-markets/
├── src/
│   ├── App.tsx                    ← view router
│   ├── types.ts
│   ├── engine/
│   │   ├── assets.ts              ← all 16 instrument definitions
│   │   └── sparkline.ts           ← WebGL 30-day line chart
│   ├── services/
│   │   ├── api.ts                 ← Twelve Data client + localStorage cache
│   │   ├── alerts.ts              ← price alert CRUD + trigger checker
│   │   └── watchlist.ts           ← pin/unpin assets
│   └── views/
│       ├── DashboardView.tsx      ← scrollable market list, 5 tabs
│       ├── DetailView.tsx         ← sparkline + OHLC + actions
│       ├── AlertsView.tsx         ← alerts list + add alert form
│       └── SetupView.tsx          ← first-run config + loading screen
├── worker/
│   └── proxy.ts                   ← Cloudflare Worker (deploy separately)
├── public/
│   ├── icon.png                   ← 512×512 RGB PNG
│   └── manifest.json
├── wrangler.toml
└── .github/workflows/deploy.yml
```
