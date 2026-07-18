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
