# Bitar Family PWA — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a PWA landing page for the Bitar family with tool links, WireGuard info, and server stats gauges.

**Architecture:** Vite builds the PWA frontend. A Node.js Express server serves the built static files and provides a `/api/stats` endpoint that reads host RAM/disk stats from mounted `/proc` and host filesystem. Everything runs in a single Docker container deployed on Coolify.

**Tech Stack:** Vite, vite-plugin-pwa, Express, Docker, vanilla HTML/CSS/JS

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `server.js`
- Create: `Dockerfile`
- Create: `scripts/generate-icons.js`
- Create: `public/icons/` (via script)

- [ ] **Step 1: Create package.json**

```json
{
  "name": "bitar-family",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "node scripts/generate-icons.js && vite build",
    "start": "node server.js",
    "preview": "vite preview"
  },
  "dependencies": {
    "express": "^5.0.0",
    "vite": "^6.0.0",
    "vite-plugin-pwa": "^0.21.0",
    "canvas": "^3.0.0"
  }
}
```

- [ ] **Step 2: Create vite.config.js**

```js
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Bitar Family',
        short_name: 'Bitar Fam',
        description: 'Family tools, one tap away',
        theme_color: '#5d4037',
        background_color: '#faf6f0',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,png,svg}']
      }
    })
  ]
})
```

- [ ] **Step 3: Create scripts/generate-icons.js**

```js
import { writeFileSync, mkdirSync } from 'fs'
import { createCanvas } from 'canvas'
import { resolve } from 'path'

const sizes = [192, 512]
const outDir = resolve('public/icons')

mkdirSync(outDir, { recursive: true })

for (const size of sizes) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#8d6e63'
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2 - size * 0.05, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#faf6f0'
  ctx.font = `bold ${size * 0.4}px system-ui, -apple-system, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('BF', size / 2, size / 2)

  writeFileSync(resolve(outDir, `icon-${size}.png`), canvas.toBuffer('image/png'))
  console.log(`Generated icon-${size}.png`)
}
```

- [ ] **Step 4: Create server.js** (the Node.js Express server)

```js
import express from 'express'
import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.static('dist'))

app.get('/api/stats', (req, res) => {
  try {
    const memInfo = readFileSync('/host/proc/meminfo', 'utf-8')
    const memTotal = parseInt(memInfo.match(/MemTotal:\s+(\d+)/)[1]) / 1024 / 1024
    const memAvail = parseInt(memInfo.match(/MemAvailable:\s+(\d+)/)[1]) / 1024 / 1024

    const df = execSync('df -B1 /host/root').toString()
    const lines = df.trim().split('\n')
    const parts = lines[lines.length - 1].split(/\s+/)
    const diskTotal = parseInt(parts[1]) / (1024 ** 3)
    const diskUsed = parseInt(parts[2]) / (1024 ** 3)

    res.json({
      storage: { used: Math.round(diskUsed), total: Math.round(diskTotal) },
      ram: { used: Math.round(memTotal - memAvail), total: Math.round(memTotal) },
      updated: new Date().toISOString()
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => console.log(`Bitar Family PWA running on port ${PORT}`))
```

- [ ] **Step 5: Create Dockerfile** (multi-stage build)

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.js ./
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev
EXPOSE 3000
CMD ["node", "server.js"]
```

- [ ] **Step 6: Create .dockerignore**

```
node_modules
.git
*.md
docs
.superpowers
```

- [ ] **Step 7: Install dependencies**

Run:
```bash
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 8: Generate placeholder icons**

Run:
```bash
node scripts/generate-icons.js
```

Expected: `public/icons/icon-192.png` and `public/icons/icon-512.png` created.

---

### Task 2: Create index.html

**File:** Create `index.html`

- [ ] **Step 1: Write the HTML shell**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#5d4037">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <link rel="apple-touch-icon" href="/icons/icon-192.png">
  <title>Bitar Family</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <div id="app">
    <header class="top-bar">
      <span class="top-bar__brand">✦ Bitar Family</span>
    </header>

    <main class="content">
      <section id="tools" class="section">
        <div class="grid" id="tool-grid"></div>
      </section>

      <section id="wireguard" class="section">
        <div class="card card--wireguard">
          <div class="card__icon">🌐</div>
          <div class="card__body">
            <h2 class="card__title">Secure Connection</h2>
            <p class="card__desc">Install WireGuard on your phone and scan the QR code from Omar to access all family tools securely.</p>
            <a class="btn" href="https://play.google.com/store/apps/details?id=com.wireguard.android" target="_blank" rel="noopener">
              ▶ Google Play
            </a>
          </div>
        </div>
      </section>

      <section id="stats" class="section">
        <h2 class="section__title">Server Status</h2>
        <div class="gauges" id="stats-gauges">
          <div class="gauge">
            <div class="gauge__label">Storage</div>
            <div class="gauge__value" id="storage-value">—</div>
            <div class="gauge__bar"><div class="gauge__fill" id="storage-fill" style="width:0%"></div></div>
          </div>
          <div class="gauge">
            <div class="gauge__label">RAM</div>
            <div class="gauge__value" id="ram-value">—</div>
            <div class="gauge__bar"><div class="gauge__fill" id="ram-fill" style="width:0%"></div></div>
          </div>
        </div>
        <p class="stats__error" id="stats-error"></p>
      </section>
    </main>

    <footer class="footer">
      Built with ❤️ for the Bitar family
    </footer>
  </div>

  <script type="module" src="/main.js"></script>
</body>
</html>
```

---

### Task 3: Create style.css

**File:** Create `style.css`

- [ ] **Step 1: Write the warm & homey theme**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg: #faf6f0;
  --surface: #fff;
  --text: #3e2723;
  --muted: #8d6e63;
  --border: #e8ddd3;
  --primary: #5d4037;
  --warm-light: #f5e6d3;
  --warm: #d7ccc8;
  --green: #4caf50;
  --orange: #ff9800;
  --red: #f44336;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  padding: 16px;
  min-height: 100dvh;
}

.top-bar {
  text-align: center;
  margin-bottom: 24px;
}

.top-bar__brand {
  display: inline-block;
  background: var(--warm);
  padding: 6px 18px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
  color: var(--primary);
  letter-spacing: 0.02em;
}

.section {
  margin-bottom: 24px;
}

.section__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.card {
  background: var(--surface);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  box-shadow: 0 1px 3px rgba(62, 39, 35, 0.06);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.card:active {
  transform: scale(0.97);
}

.card__icon {
  width: 40px;
  height: 40px;
  background: var(--warm-light);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.card__body {
  flex: 1;
  min-width: 0;
}

.card__title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
}

.card__desc {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.4;
}

.card__badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  color: var(--muted);
  white-space: nowrap;
  margin-top: 6px;
}

.card--wireguard {
  display: block;
  cursor: default;
  padding: 20px;
}

.card--wireguard:active {
  transform: none;
}

.card--wireguard .card__icon {
  width: 44px;
  height: 44px;
  font-size: 24px;
  margin-bottom: 12px;
}

.card--wireguard .card__title {
  font-size: 16px;
  margin-bottom: 6px;
}

.card--wireguard .card__desc {
  font-size: 13px;
  margin-bottom: 14px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #2e7d32;
  color: #fff;
  padding: 10px 20px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.15s;
}

.btn:active {
  background: #1b5e20;
}

.gauges {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.gauge {
  background: var(--surface);
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 1px 3px rgba(62, 39, 35, 0.06);
}

.gauge__label {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.gauge__value {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
}

.gauge__bar {
  height: 8px;
  background: #e8ddd3;
  border-radius: 4px;
  overflow: hidden;
}

.gauge__fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.stats__error {
  font-size: 12px;
  color: var(--red);
  text-align: center;
  margin-top: 8px;
}

.footer {
  text-align: center;
  font-size: 12px;
  color: var(--muted);
  padding: 24px 0 32px;
}

@media (max-width: 360px) {
  .grid {
    gap: 8px;
  }
  .card {
    padding: 10px;
  }
  .card__icon {
    width: 34px;
    height: 34px;
    font-size: 16px;
  }
  .card__title {
    font-size: 13px;
  }
  .card__desc {
    font-size: 11px;
  }
}
```

---

### Task 4: Create main.js

**File:** Create `main.js`

- [ ] **Step 1: Write the app logic**

```js
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

const tools = [
  {
    icon: '✏️',
    name: 'Excalidraw',
    desc: 'Whiteboard & diagrams',
    url: 'https://excalidraw.apps.albitar.homes/',
    badge: { icon: '⬡', label: 'Miro', color: '#ffd02a' }
  },
  {
    icon: '🔄',
    name: 'n8n',
    desc: 'Automate tasks',
    url: 'https://n8n.apps.albitar.homes/home/workflows',
    badge: { icon: '⚡', label: 'Zapier', color: '#ff4a00' }
  },
  {
    icon: '☁️',
    name: 'Nextcloud',
    desc: 'File storage & sharing',
    url: 'https://nextcloud.apps.albitar.homes/',
    badge: { icon: '▷▷▷', label: 'Drive', color: '#4285f4' }
  },
  {
    icon: '🧰',
    name: 'Omni-tools',
    desc: 'Utility tools',
    url: 'https://omni-tools.apps.albitar.homes/',
    badge: { icon: 'G', label: 'Tools', color: '#4285f4' }
  },
  {
    icon: '🔍',
    name: 'SearXNG',
    desc: 'Private search',
    url: 'https://searxng.apps.albitar.homes/',
    badge: { icon: 'G', label: 'Google', color: '#4285f4' }
  },
  {
    icon: '🤖',
    name: 'OpenWebUI',
    desc: 'AI chat assistant',
    url: 'https://openwebui.apps.albitar.homes/',
    badge: { icon: '◆', label: 'ChatGPT', color: '#10a37f' }
  }
]

function renderTools() {
  const grid = document.getElementById('tool-grid')
  grid.innerHTML = tools.map(t => `
    <div class="card" onclick="window.open('${t.url}', '_blank', 'noopener,noreferrer')" role="button" tabindex="0">
      <div class="card__icon">${t.icon}</div>
      <div class="card__body">
        <div class="card__title">${t.name}</div>
        <div class="card__desc">${t.desc}</div>
        <span class="card__badge" style="color:${t.badge.color}">
          <span style="font-weight:700">${t.badge.icon}</span> ${t.badge.label}
        </span>
      </div>
    </div>
  `).join('')
}

function colorForUsage(pct) {
  if (pct < 60) return 'var(--green)'
  if (pct < 85) return 'var(--orange)'
  return 'var(--red)'
}

async function fetchStats() {
  const errEl = document.getElementById('stats-error')
  const storageVal = document.getElementById('storage-value')
  const storageFill = document.getElementById('storage-fill')
  const ramVal = document.getElementById('ram-value')
  const ramFill = document.getElementById('ram-fill')

  try {
    const res = await fetch('/api/stats', { cache: 'no-store' })
    if (!res.ok) throw new Error('Not available')
    const data = await res.json()

    const storagePct = (data.storage.used / data.storage.total) * 100
    storageVal.textContent = `${data.storage.used} GB / ${data.storage.total} GB`
    storageFill.style.width = `${Math.min(storagePct, 100)}%`
    storageFill.style.background = colorForUsage(storagePct)

    const ramPct = (data.ram.used / data.ram.total) * 100
    ramVal.textContent = `${data.ram.used} GB / ${data.ram.total} GB`
    ramFill.style.width = `${Math.min(ramPct, 100)}%`
    ramFill.style.background = colorForUsage(ramPct)

    errEl.textContent = ''
  } catch {
    storageVal.textContent = '—'
    ramVal.textContent = '—'
    errEl.textContent = '⚠️ Server stats unavailable'
  }
}

renderTools()
fetchStats()
```

---

### Task 5: Build & Verify Docker Image

- [ ] **Step 1: Build the PWA**

Run:
```bash
npm run build
```

Expected: `dist/` directory created with `index.html`, `style.css`, `main.js`, `manifest.webmanifest`, `sw.js`, and `icons/` subdirectory.

- [ ] **Step 2: Verify build output structure**

Run:
```bash
ls -la dist/ && ls -la dist/icons/
```

Expected: `index.html`, `style.css`, `main.js`, `manifest.webmanifest`, `sw.js`, `workbox-*.js`, `icons/icon-192.png`, `icons/icon-512.png`

- [ ] **Step 3: Build Docker image**

Run:
```bash
docker build -t bitar-family .
```

Expected: Image builds successfully, no errors. The multi-stage build runs Vite build in stage 1, copies output to stage 2.

- [ ] **Step 4: Run Docker container for test**

Run:
```bash
docker run -d -p 3000:3000 \
  -v /proc:/host/proc:ro \
  -v /:/host/root:ro \
  --name bitar-family bitar-family
```

Expected: Container starts. Open `http://localhost:3000` — page renders with all 6 tool cards, WireGuard section, stats gauges showing actual server data.

- [ ] **Step 5: Test the API endpoint**

Run:
```bash
curl http://localhost:3000/api/stats
```

Expected: JSON response with `storage` and `ram` objects containing `used` and `total` in GB.

- [ ] **Step 6: Verify PWA manifest**

Open `http://localhost:3000` → browser dev tools → Application → Manifest. Expected: name "Bitar Family", display "standalone", icons listed.

- [ ] **Step 7: Clean up test container**

Run:
```bash
docker rm -f bitar-family
```
