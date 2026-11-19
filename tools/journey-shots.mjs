// Local-only journey capture for visual checks during development.
// Drives the system Chrome against the preview server and screenshots
// the whole camera path with REAL time (no virtual-time distortion).
import puppeteer from 'puppeteer-core'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const outDir = join(process.cwd(), 'shots')
await mkdir(outDir, { recursive: true })

const CHROME =
  process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = process.env.BASE_URL ?? 'http://localhost:4173/'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu-sandbox', '--hide-scrollbars', '--use-angle=swiftshader'],
  defaultViewport: { width: 1440, height: 900 },
})

const page = await browser.newPage()
page.on('pageerror', (e) => console.error('PAGE ERROR:', e.message))
page.on('console', (m) => {
  if (m.type() === 'error') console.error('CONSOLE:', m.text())
})

await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 60000 })

// Wait for the boot sequence to finish on its own (BIOS ~3s + count 1.4s + stall 2.6s + fade)
await sleep(12000)
await page.screenshot({ path: join(outDir, 'j-00-hero.png') })

// Scroll journey: real scrolls, let the camera settle before each frame
const stops = [
  ['01-dive', 0.11, 3500],
  ['02-about', 0.3, 3500],
  ['03-skills', 0.5, 3500],
  ['04-projects', 0.68, 3500],
  ['05-terminal', 0.85, 3500],
  ['06-contact', 1, 4500],
]

for (const [name, p, settle] of stops) {
  await page.evaluate((progress) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: Math.max(0, Math.min(1, progress)) * max, behavior: 'instant' })
    window.dispatchEvent(new Event('scroll'))
  }, p)
  await sleep(settle)
  await page.screenshot({ path: join(outDir, `j-${name}.png`) })
  console.log('captured', name)
}

await browser.close()
console.log('done')
