# cloudphone-ui

> React + TypeScript + Tailwind framework for building CloudPhone feature phone widgets.

CloudPhone runs a Chromium-based browser engine server-side, rendering widgets on Nokia 110 4G,
Itel, Mobicel, and 100+ other devices across emerging markets. This framework gives you a
modern DX — React, TypeScript, Tailwind — while enforcing the CloudPhone constraints that matter:
QVGA screen, D-pad navigation, no touch events, minimal bundle size.

---

## Quick start

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/cloudphone-ui.git
cd cloudphone-ui

# Install (requires Bun — https://bun.sh)
bun install

# Dev server (hot reload, keyboard-navigable in browser)
bun dev

# Production build
bun build
# → apps/rps-duel/dist/  (upload this or let CI do it)

# View bundle size report
open apps/rps-duel/dist/stats.html
```

---

## Project structure

```
cloudphone-ui/
├── src/                        ← Framework (shared across all apps)
│   ├── types/index.ts          ← Platform constants, key mappings, shared types
│   ├── hooks/
│   │   ├── useDPad.ts          ← D-pad focus management  ← START HERE
│   │   ├── useStorage.ts       ← Typed localStorage + high score helper
│   │   └── useKeyPress.ts      ← Single-key listener utility
│   ├── components/
│   │   ├── Screen.tsx          ← Root layout (header + content + softkeys)
│   │   ├── MenuItem.tsx        ← Focusable vertical menu row
│   │   ├── ChoiceGrid.tsx      ← Horizontal/grid D-pad item selector
│   │   └── Countdown.tsx       ← Animated 3..2..1..FIGHT
│   └── engine/
│       └── sound.ts            ← Web Audio synth engine (no audio files)
│
├── apps/
│   └── rps-duel/               ← Demo app (RPS Duel game)
│       ├── src/
│       │   ├── App.tsx         ← View router
│       │   ├── types.ts        ← Game types & constants
│       │   └── views/
│       │       ├── MenuView.tsx
│       │       ├── ModeView.tsx
│       │       ├── GameView.tsx
│       │       ├── ResultView.tsx
│       │       └── HighScoresView.tsx
│       ├── public/
│       │   ├── icon.png        ← 512×512 RGB PNG (CloudPhone spec)
│       │   └── manifest.json   ← PWA manifest
│       ├── vite.config.ts      ← Build config + bundle analyser
│       └── tailwind.config.js  ← CloudPhone design tokens
│
└── .github/workflows/
    └── deploy.yml              ← Auto-deploy to GitHub Pages on push to main
```

---

## Framework API

### `useDPad(options)` — the core hook

```tsx
const { focused, setFocus, isFocused } = useDPad({
  length:      items.length,   // number of focusable items
  axis:        'vertical',     // 'horizontal' | 'vertical' | 'both' | 'grid'
  cols:        3,              // required for axis='grid'
  initialIndex: 0,
  onConfirm:   (i) => doSomething(i),   // Enter or LSK (Escape)
  onBack:      ()  => goBack(),          // RSK (Backspace)
  onChange:    (i) => sfx.play('nav'),   // any focus change
  disabled:    isAnimating,
  wrap:        true,           // wrap around edges
})
```

### `useStorage<T>(key, default)` — typed localStorage

```tsx
const [score, setScore, clearScore] = useStorage('my_score', 0)
const [prefs, setPrefs]             = useStorage('prefs', { sound: true })

// Functional update
setScore(prev => prev + 1)

// High score helper
const { highScore, submit, clear } = useHighScore('hs_game')
const isNew = submit(playerScore)  // returns true if new record
```

### `useKeyPress(key, handler)` — single key listener

```tsx
import { CP_KEYS } from '@cloudphone/types'

useKeyPress(CP_KEYS.NUM_1, () => choose('rock'))
useKeyPress(CP_KEYS.NUM_2, () => choose('paper'))
useKeyPress(CP_KEYS.NUM_3, () => choose('scissors'))
```

### `sfx.play(name)` — sound engine

```tsx
sfx.play('nav')      // navigation blip
sfx.play('select')   // confirm
sfx.play('back')     // back/cancel
sfx.play('win')      // round win
sfx.play('lose')     // round lose
sfx.play('draw')     // draw
sfx.play('fanfare')  // match victory
sfx.play('defeat')   // match loss
sfx.play('tick')     // countdown tick
sfx.play('go')       // countdown "GO"

// Custom sound
sfx.define('myBlip', [
  { freq: 440, dur: 0.08, type: 'square', vol: 0.12 },
  { freq: 660, dur: 0.1,  type: 'square', vol: 0.12, delay: 0.1 },
])
sfx.play('myBlip')

sfx.mute()    // silence all
sfx.unmute()
sfx.toggle()
```

### `<Screen>` — root layout container

```tsx
<Screen
  title="MY APP"
  softkeys={{ lsk: 'OK', rsk: 'BACK', center: 'APP' }}
  headerRight={<span>Score: 42</span>}
>
  <MyView />
</Screen>
```

### Tailwind design tokens

All CloudPhone colours are available as Tailwind classes:

| Class            | Value     | Usage               |
|------------------|-----------|---------------------|
| `bg-cp-bg`       | `#0a0a12` | Main background     |
| `bg-cp-bg2`      | `#0f0f1a` | Header / softkeys   |
| `bg-cp-bg3`      | `#14142a` | Focused states      |
| `border-cp-border` | `#1e1e35` | Default borders    |
| `text-cp-accent` | `#7b6fff` | Primary accent      |
| `text-cp-accent2`| `#a599ff` | Light accent        |
| `text-cp-win`    | `#3fc96d` | Win / success       |
| `text-cp-lose`   | `#e05555` | Lose / danger       |
| `text-cp-draw`   | `#d4a53a` | Draw / warning      |
| `text-cp-muted`  | `#555566` | Secondary text      |
| `font-hud`       | Orbitron  | HUD / titles        |
| `font-mono`      | Share Tech Mono | Body        |
| `animate-cd-pop` | —         | Countdown number    |
| `animate-pop-win`| —         | Win icon pulse      |

---

## Adding a new app

```bash
# Copy the scaffold
cp -r apps/rps-duel apps/my-widget

# Update vite.config.ts
# Change: const BASE = '/my-widget/'

# Update package.json name field
# Update public/manifest.json name & start_url

# Update .github/workflows/deploy.yml
# Change: path: apps/my-widget/dist
```

---

## Deploy to GitHub Pages

### First time setup

1. Create a public GitHub repo named `cloudphone-ui` (or your widget name)
2. Push this project:
   ```bash
   git init && git add . && git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/cloudphone-ui.git
   git push -u origin main
   ```
3. Go to **Settings → Pages → Source → GitHub Actions**
4. The first deploy triggers automatically. Your widget is live at:
   ```
   https://YOUR_USERNAME.github.io/rps-duel/
   ```

### Subsequent deploys

Just `git push` — CI builds and deploys automatically in ~60 seconds.

---

## CloudPhone widget specs

| Spec              | Value                             |
|-------------------|-----------------------------------|
| Screen (QVGA)     | 240 × 320 px                      |
| Header height     | 40 px                             |
| Softkey bar       | 24 px                             |
| Icon              | 512 × 512 px, 24-bit PNG, no alpha|
| Start URL         | Must be HTTPS                     |
| Navigation        | D-pad only (no touch)             |
| Enter / LSK       | `Escape` key                      |
| Back / RSK        | `Backspace` key                   |
| Storage           | `localStorage` supported          |
| Audio             | Web Audio API supported           |
| Bundle target     | < 150 KB gzipped                  |

Register at: **https://cloudphone.tech/my**
Simulator at: **https://cloudphone.tech/my/simulator**
