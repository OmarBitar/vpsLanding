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
