import express from 'express'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const app = express()
const PORT = process.env.PORT || 3000
const HOST_PROC = process.env.HOST_PROC || '/host/proc'
const HOST_ROOT = process.env.HOST_ROOT || '/host/root'

app.use(express.static('dist'))

app.get('/api/stats', (req, res) => {
  try {
    const memInfo = readFileSync(`${HOST_PROC}/meminfo`, 'utf-8')
    const memTotal = parseInt(memInfo.match(/MemTotal:\s+(\d+)/)[1]) / 1024 / 1024
    const memAvail = parseInt(memInfo.match(/MemAvailable:\s+(\d+)/)[1]) / 1024 / 1024

    const df = execFileSync('df', ['-B1', HOST_ROOT]).toString()
    const last = df.trim().split('\n').at(-1).split(/\s+/)
    const diskTotal = parseInt(last[1]) / (1024 ** 3)
    const diskUsed = parseInt(last[2]) / (1024 ** 3)

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
