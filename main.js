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
    badge: { icon: '▷▷▷', label: 'Drive', color: '#4285f4' },
    app: { android: 'com.nextcloud.client' }
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

function openLink(i) {
  const t = tools[i]
  const a = document.createElement('a')
  a.rel = 'noopener noreferrer'
  a.target = '_blank'

  if (t.app?.android && /Android/i.test(navigator.userAgent)) {
    const u = new URL(t.url)
    a.href = `intent://${u.host}${u.pathname}#Intent;scheme=https;package=${t.app.android};end`
  } else {
    a.href = t.url
  }

  a.click()
}

function renderTools() {
  const grid = document.getElementById('tool-grid')
  grid.innerHTML = tools.map((t, i) => `
    <div class="card" onclick="openLink(${i})" role="button" tabindex="0">
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

function openWireGuard() {
  const a = document.createElement('a')
  a.rel = 'noopener noreferrer'
  a.target = '_blank'

  if (/Android/i.test(navigator.userAgent)) {
    a.href = 'intent://#Intent;scheme=wireguard;package=com.wireguard.android;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.wireguard.android;end'
  } else {
    a.href = 'https://play.google.com/store/apps/details?id=com.wireguard.android'
  }

  a.click()
}

document.getElementById('wireguard-btn').addEventListener('click', e => {
  e.preventDefault()
  openWireGuard()
})

window.openLink = openLink

renderTools()
fetchStats()
