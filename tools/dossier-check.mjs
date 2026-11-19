import puppeteer from 'puppeteer-core'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'],
  defaultViewport: { width: 1280, height: 800 },
})
const page = await browser.newPage()
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 60000 })
await page.waitForFunction(
  () => Array.from(document.querySelectorAll('button')).some((b) => b.textContent?.includes('ENTER SILENT')),
  { timeout: 45000, polling: 200 },
)
await page.evaluate(() =>
  Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.includes('ENTER SILENT'))?.click(),
)
await sleep(800)
await page.evaluate(() => window.__lenis?.scrollTo(document.body.scrollHeight, { duration: 0.01 }))
await sleep(1500)
// open the dossier
await page.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button, a')).find((el) =>
    el.textContent?.includes('RECRUITER DOSSIER'),
  )
  btn?.click()
})
await sleep(700)
const opened = await page.evaluate(() => !!document.querySelector('[data-lenis-prevent]'))
console.log('dossier panel found:', opened,
  '| dossier buttons:', await page.evaluate(() =>
    Array.from(document.querySelectorAll('button, a')).map(b => b.textContent?.trim().slice(0, 40)).filter(t => t && t.includes('DOSS'))))
const panel = await page.$('[data-lenis-prevent][tabindex="0"]')
const before = await page.evaluate(() => {
  const el = document.querySelector('[data-lenis-prevent][tabindex="0"]')
  return el ? { top: el.scrollTop, height: el.scrollHeight } : null
})
// wheel over the modal content
const box = await panel.boundingBox()
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
for (let i = 0; i < 6; i++) {
  await page.mouse.wheel({ deltaY: 400 })
  await sleep(120)
}
const after = await page.evaluate(() => {
  const el = document.querySelector('[data-lenis-prevent][tabindex="0"]')
  return { top: el.scrollTop, height: el.scrollHeight, bottomReached: el.scrollTop + el.clientHeight >= el.scrollHeight - 4 }
})
console.log('scroll before:', JSON.stringify(before), '→ after wheel:', JSON.stringify(after))
await page.screenshot({ path: 'shots/dossier-scrolled.png' })
await browser.close()
console.log(after.top > 0 && after.bottomReached ? 'PASS: dossier scrolls' : 'FAIL: dossier did not scroll')
