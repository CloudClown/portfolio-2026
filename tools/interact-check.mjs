// Interaction check: terminal commands + disk-insert modal boot.
import puppeteer from 'puppeteer-core'
import { join } from 'node:path'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const outDir = join(process.cwd(), 'shots')

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu-sandbox', '--hide-scrollbars', '--use-angle=swiftshader'],
  defaultViewport: { width: 1440, height: 900 },
})

const page = await browser.newPage()
page.on('pageerror', (e) => console.error('PAGE ERROR:', e.message))
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0', timeout: 60000 })
await sleep(12000)

// Scroll to the terminal chapter
await page.evaluate(() => {
  const el = document.getElementById('ai-workflow')
  if (el) window.scrollTo({ top: el.offsetTop + el.offsetHeight / 2 - window.innerHeight / 2, behavior: 'instant' })
  window.dispatchEvent(new Event('scroll'))
})
await sleep(2500)

// Click the 'hire --now' command button
const clicked = await page.evaluate(() => {
  const buttons = Array.from(document.querySelectorAll('button'))
  const b = buttons.find((x) => x.textContent?.trim() === 'hire --now')
  if (b) {
    b.click()
    return true
  }
  return false
})
console.log('clicked hire --now:', clicked)
await sleep(2500)
await page.screenshot({ path: join(outDir, 'x-terminal-hire.png') })

// Now jump to projects and click the first project card -> modal boot
await page.evaluate(() => {
  const el = document.getElementById('projects')
  if (el) window.scrollTo({ top: el.offsetTop + el.offsetHeight / 2 - window.innerHeight / 2, behavior: 'instant' })
  window.dispatchEvent(new Event('scroll'))
})
await sleep(1500)
await page.evaluate(() => {
  const card = document.querySelector('#projects .cursor-pointer')
  if (card) card.dispatchEvent(new MouseEvent('click', { bubbles: true }))
})
await sleep(400)
await page.screenshot({ path: join(outDir, 'x-modal-boot.png') })
await sleep(1600)
await page.screenshot({ path: join(outDir, 'x-modal-content.png') })

await browser.close()
console.log('done')
