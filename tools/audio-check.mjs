// Lo-fi "Quiet Night Room" behavior check (dev server only).
import puppeteer from 'puppeteer-core'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const BASE = 'http://localhost:5173/'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu-sandbox', '--autoplay-policy=no-user-gesture-required', '--use-angle=swiftshader'],
  defaultViewport: { width: 1280, height: 800 },
})

const page = await browser.newPage()
page.on('pageerror', (e) => console.error('PAGE ERROR:', e.message))
page.on('console', (m) => {
  if (m.type() === 'error') console.error('CONSOLE:', m.text())
})

await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 60000 })
await page.evaluate(() => localStorage.removeItem('tahmid-sound-pref'))
await page.reload({ waitUntil: 'networkidle0' })

// 1) Boot → stall → auto-push → entry buttons appear
await page.waitForFunction(() => document.querySelectorAll('button').length > 0, { timeout: 20000 })
await page.waitForFunction(
  () => {
    const btns = Array.from(document.querySelectorAll('button'))
    return btns.some((b) => b.textContent?.includes('ENTER WITH SOUND'))
  },
  { timeout: 15000, polling: 500 },
)
console.log('1) entry buttons rendered: true')

// 2) ENTER WITH SOUND → context starts, master fades to 0.27, music + support layers live
await page.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find((b) =>
    b.textContent?.includes('ENTER WITH SOUND'),
  )
  btn?.click()
})
await sleep(3600)
const started = await page.evaluate(() => ({
  state: window.__sound.state,
  master: +window.__sound.master.gain.value.toFixed(3),
  musicGain: +window.__sound.musicGain.gain.value.toFixed(3),
  musicFilter: Math.round(window.__sound.musicFilter.frequency.value),
  crackle: +window.__sound.crackleGain.gain.value.toFixed(3),
  support: +window.__sound.supportGain.gain.value.toFixed(3),
  padFilter: Math.round(window.__sound.padFilter.frequency.value),
  rainGain: +window.__sound.rainGain.gain.value.toFixed(4),
  playing: window.__sound.nowPlaying.title,
}))
console.log('2) after entry:', JSON.stringify(started))

// 3) Scroll → music filter opens. Headless throttles rAF, so assert the
//    mechanism: updateScrollActivity is fed every frame and activity eases
//    when fed real velocity values (real 60Hz browsers feed every frame).
await page.evaluate(() => {
  const s = window.__sound
  window.__feedCalls = 0
  const orig = s.updateScrollActivity.bind(s)
  s.updateScrollActivity = (v, dt) => {
    window.__feedCalls++
    return orig(v, dt)
  }
})
await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }))
await sleep(1200)
const fed = await page.evaluate(() => window.__feedCalls)
console.log('3a) scroll activity fed from R3F frames:', fed, 'times')
// Feed real wheel-scale velocity for a second (what a real 60fps session does)
await page.evaluate(async () => {
  for (let i = 0; i < 30; i++) {
    window.__sound.updateScrollActivity(60, 0.016)
    await new Promise((r) => setTimeout(r, 16))
  }
})
const open = await page.evaluate(() => ({
  activity: +window.__sound.activity.toFixed(3),
  musicFilter: Math.round(window.__sound.musicFilter.frequency.value),
}))
await sleep(4000)
const settled = await page.evaluate(() => ({
  activity: +window.__sound.activity.toFixed(3),
  musicFilter: Math.round(window.__sound.musicFilter.frequency.value),
}))
console.log('3b) music filter opens with scroll:', JSON.stringify(open), '→ eases back:', JSON.stringify(settled))

// 4) The 99% stall: music muffles + softens, crackle and rain remain; then resolve
await page.evaluate(() => window.__sound.stallHold())
await sleep(1800)
const stalled = await page.evaluate(() => ({
  musicFilter: Math.round(window.__sound.musicFilter.frequency.value),
  musicGain: +window.__sound.musicGain.gain.value.toFixed(3),
  crackle: +window.__sound.crackleGain.gain.value.toFixed(3),
  rainGain: +window.__sound.rainGain.gain.value.toFixed(4),
}))
await page.evaluate(() => window.__sound.resolveRelease())
await sleep(2600)
const resolved = await page.evaluate(() => ({
  musicFilter: Math.round(window.__sound.musicFilter.frequency.value),
  musicGain: +window.__sound.musicGain.gain.value.toFixed(3),
}))
console.log('4) stall muffle:', JSON.stringify(stalled), '→ resolve:', JSON.stringify(resolved))

// 5) Mini player: collapsed control → expand → NOW PLAYING + controls
const collapsedLabel = await page.evaluate(() =>
  document.querySelector('button[aria-pressed]')?.getAttribute('aria-label'),
)
await page.evaluate(() => document.querySelector('button[aria-pressed]')?.click())
await sleep(300)
const panel = await page.evaluate(() => ({
  nowPlaying: document.querySelector('[aria-live="polite"]')?.textContent,
  hasPause: !!Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.includes('PAUSE')),
  hasNext: !!Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.includes('NEXT')),
  hasVolume: !!document.querySelector('input[type="range"][aria-label="Music volume"]'),
  hasCollapse: !!Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.includes('COLLAPSE')),
}))
console.log('5) collapsed:', JSON.stringify(collapsedLabel))
console.log('   expanded:', JSON.stringify(panel))

// 6) Volume + next track
await page.evaluate(() => {
  const input = document.querySelector('input[type="range"][aria-label="Music volume"]')
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
  setter.call(input, '0.4')
  input.dispatchEvent(new Event('input', { bubbles: true }))
})
await sleep(600)
const vol = await page.evaluate(() => ({
  musicGain: +window.__sound.musicGain.gain.value.toFixed(3),
  volume: window.__sound.musicVolume,
}))
const trackBefore = await page.evaluate(() => window.__sound.nowPlaying.title)
await page.evaluate(() => window.__sound.nextTrack())
await sleep(6500)
const trackAfter = await page.evaluate(() => ({
  title: window.__sound.nowPlaying.title,
  musicGain: +window.__sound.musicGain.gain.value.toFixed(3),
}))
console.log('6) volume:', JSON.stringify(vol), '| next:', trackBefore, '→', JSON.stringify(trackAfter))

// 7) Tab-hidden auto-pause
await page.evaluate(() => {
  Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
  document.dispatchEvent(new Event('visibilitychange'))
})
await sleep(400)
const hiddenGain = await page.evaluate(() => +window.__sound.master.gain.value.toFixed(3))
await page.evaluate(() => {
  Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
  document.dispatchEvent(new Event('visibilitychange'))
})
await sleep(900)
const visibleGain = await page.evaluate(() => +window.__sound.master.gain.value.toFixed(3))
console.log('7) hidden:', hiddenGain, '→ visible:', visibleGain)

// 8) Pause via mini player → pref stored 'off'
await page.evaluate(() =>
  Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.includes('PAUSE'))?.click(),
)
await sleep(1800)
const off = await page.evaluate(() => ({
  state: window.__sound.state,
  pref: localStorage.getItem('tahmid-sound-pref'),
}))
console.log('8) paused via player:', JSON.stringify(off))

// 9) Reload with pref=on → armed → wakes on first gesture
await page.evaluate(() => localStorage.setItem('tahmid-sound-pref', 'on'))
await page.reload({ waitUntil: 'networkidle0' })
await sleep(1500)
await page.mouse.click(640, 400)
await sleep(2500)
const woken = await page.evaluate(() => ({
  state: window.__sound.state,
  master: +window.__sound.master.gain.value.toFixed(3),
}))
console.log('9) after reload + gesture:', JSON.stringify(woken))

// 10) Footer credits render from the playlist config
await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
await sleep(1500)
const credit = await page.evaluate(() => document.body.textContent.includes('MUSIC: GENERATED IN-BROWSER'))
console.log('10) footer credit rendered:', credit)

await browser.close()
console.log('done')
