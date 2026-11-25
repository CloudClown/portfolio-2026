# AGENTS.md

> Single source of truth for any AI coding agent (and for the human) working on this project.
> Everything below was read out of the actual codebase — no invented features. Anything uncertain is marked **TBD**.
>
> Last audited: commit `19844a9` (branch `main`).

---

## 1. Project Overview

This is the personal developer portfolio of **Tahmid, Frontend Developer** (React / Next.js / TypeScript), built as a *retro computing workshop*: a CRT terminal desk in a dark room that the visitor scrolls **through** into a yellow wireframe vector landscape, where experience, skills, projects and a working terminal live "inside the screen". The concept is "BUILD 99%" — a professional overplanner whose build stalls at 99% until the visitor pushes it to 100%. It exists to give recruiters and clients a memorable, fast, accessible single-page case study that ends with a direct call to action.

## 2. Scope

### In scope
- One single-page, scroll-driven 3D experience (camera dolly along a fixed path) with six chapters: Boot Desk → Commit Log (experience) → Packages (skills) → Disk Library (projects) → Terminal (AI workflow) → Build Successful (contact).
- **BIOS boot preloader** that types BIOS lines, stalls at 99%, then completes on click or auto-push; offers ENTER WITH SOUND / ENTER SILENT.
- **CRT desk scene** (curved glass, bezel, vents, LED, floppy stack, keyboard, mug, cables, sticky notes) with **clickable floppy disks** that open project case studies on the screen.
- **Dive through the glass** into a wireframe vector landscape that "compiles" from wireframe into solid geometry as the build progresses.
- **Real, usable terminal** with commands: `help`, `ls projects` / `ls`, `cat about.txt` / `about`, `skills`, `contact`, `hire --now` — plus clickable buttons for non-typists.
- **Projects**: data-driven list, each with a case-study modal (problem, approach, stack, results, links).
- **Recruiter Dossier**: a scrollable one-panel summary modal (skippable from the preloader).
- **Optional generative lo-fi soundtrack** (default OFF): synthesized in-browser playlist + ambient support layers, cassette mini player with play/pause/next/volume/EQ, scroll-reactive filter, stalls with the 99% beat, resolves with a chord at 100%.
- **Lazy Mode**: auto-scrolls the whole journey, stops on manual input.
- **HUD**: top bar, chapter rail, build meter (stalls at 99%, shows BUILD SUCCESSFUL at the end), corner brackets, status line.
- Strict visual system (see §6) applied consistently, plus CRT post-processing.
- Accessible by design: real DOM text for all content, keyboard-operable player/modals/terminal, respects `prefers-reduced-motion`, site fully usable with sound off.
- Static, zero-backend deployment with social preview metadata (OG/Twitter card, favicons, sitemap, robots).

### Out of scope
- No backend, no CMS, no database, no auth, no contact-form server (contact is `mailto:` / links only).
- No blog, no multi-page routing, no i18n.
- No analytics, cookies, tracking or consent banner (none in code).
- No real third-party audio files shipped — all music is synthesized in-browser (the `file` track path is wired but unused; see §9).
- Not an e-commerce/booking/app product; it is a single-person portfolio.
- No test suite (see §5).
- Does not support IE / legacy browsers; requires WebGL2 for the intended experience (**TBD**: exact fallback beyond CSS/no-WebGL is not implemented as a separate path).

## 3. Tech Stack

- **Language(s):** TypeScript (strict, `noUnusedLocals`), HTML, CSS, GLSL (inline shader strings)
- **Framework(s):** React 18 + Vite 5; `@react-three/fiber` renderer for the 3D scene
- **Key libraries / dependencies:**
  - `three` — WebGL engine
  - `@react-three/fiber`, `@react-three/drei` — React renderer + helpers
  - `@react-three/postprocessing`, `postprocessing` — Bloom / DOF / custom CRT pass
  - `lenis` — smooth scroll (drives camera progress)
  - `gsap` — animation/ScrollTrigger
  - `@react-three/rapier` — declared dependency, **unused**: no import anywhere in `src/` (safe to remove)
  - `lucide-react` — icons
  - Tailwind CSS 3 + `autoprefixer`, `postcss` — styling
  - Web Audio API (no audio libraries) — whole sound engine is hand-rolled in `src/lib/ambient.ts`
  - `puppeteer-core` (dev only) — local QA/screenshot scripts
- **Package manager:** npm (`package-lock.json` present)
- **Database / storage:** None. Only `localStorage` for the sound preference key `tahmid-sound-pref`
- **Deployment target:** Vercel (static build, `dist/`), connected to GitHub `CloudClown/portfolio-2026`; every push to `main` auto-deploys. Live URL: `https://tahmid-chy-theta.vercel.app/`

## 4. Project Structure

```
auto-claw-protfolio/
├─ index.html                 # shell, SEO/OG/Twitter meta, favicons, Google Fonts
├─ package.json               # scripts: dev / build / typecheck / preview (no test)
├─ vite.config.ts             # React plugin, es2020 target, manualChunks (three / r3f / fx)
├─ tailwind.config.js         # palette + font families
├─ tsconfig*.json             # strict TS config
├─ public/
│  ├─ favicon.svg|png         # T-99 "99 + progress bar" mark
│  ├─ apple-touch-icon.png    # 180×180 iOS icon
│  ├─ og.png                  # 1200×630 social preview card (BIOS style)
│  ├─ robots.txt, sitemap.xml # point at the Vercel URL
├─ src/
│  ├─ main.tsx                # React root
│  ├─ App.tsx                 # composition root: Canvas, HUD, sections, modals, player, loader
│  ├─ index.css               # design tokens, Lenis styles, base typography, CRT-ish utilities
│  ├─ components/
│  │  ├─ Loader.tsx           # BIOS preloader, 99% stall, entry choice (sound/silent)
│  │  ├─ Hud.tsx              # TopBar, SectionRail, ProgressMeter, CornerBrackets, StatusLine
│  │  ├─ Sections.tsx         # Hero, About, Skills, Projects, AIWorkflow, Contact (DOM chapters)
│  │  ├─ Terminal.tsx         # command parser + interactive terminal UI
│  │  ├─ ProjectModal.tsx     # project case-study modal (data-lenis-prevent)
│  │  ├─ RecruiterDossier.tsx # recruiter summary modal (data-lenis-prevent, tabIndex=0)
│  │  ├─ MiniPlayer.tsx       # cassette/CRT corner player (play/pause/next/volume/EQ)
│  │  ├─ Magnetic.tsx         # magnetic hover wrapper
│  │  └─ Cursor.tsx           # custom cursor/reticle
│  ├─ data/
│  │  ├─ site.ts              # identity, stats, socials, chapter definitions  ← edit content here
│  │  ├─ projects.ts          # 5 projects with full case-study copy
│  │  ├─ skills.ts, journey.ts, aiTools.ts
│  ├─ hooks/
│  │  ├─ useSmoothScroll.ts   # Lenis setup + scroll progress bridge (dev hook `__lenis`)
│  │  ├─ useLazyMode.ts       # auto-scroll journey
│  │  └─ useSectionReveal.ts  # chapter reveal on scroll
│  ├─ lib/
│  │  ├─ ambient.ts           # ENTIRE sound engine (~1200 lines): lo-fi sequencer, mixing, ducking, mini-player API, UI tones
│  │  ├─ playlist.ts          # track config ('generated' presets | 'file' URLs) + musicCredit()
│  │  ├─ lenis.ts             # lockScroll / unlockScroll / scrollToChapter
│  │  ├─ scroll.ts, anim.ts, motion.ts, pointer.ts, textures.ts
│  ├─ three/
│  │  ├─ scenes.tsx           # Experience: scene graph + AmbientScroll → sound activity bridge
│  │  ├─ CameraRig.tsx        # camera position along the path (progress-driven)
│  │  ├─ path.ts              # STOPS: camera keyframes / chapter anchors
│  │  ├─ Effects.tsx          # post-processing stack (bloom, DOF, custom CRT pass)
│  │  ├─ shaders.ts           # inline GLSL (grid floor, phosphor screen, CRT post)
│  │  ├─ palette.ts, Atmosphere.tsx
│  │  └─ objects/
│  │     ├─ CRTDesk.tsx       # the desk, CRT, floppies (clickable), props
│  │     └─ VectorWorld.tsx   # wireframe landscape inside the screen
│  └─ (no tests/)
├─ tools/                     # local QA scripts (dev only, not shipped)
│  ├─ audio-check.mjs         # 10 audio wiring checks (needs dev server on :5173)
│  ├─ dossier-check.mjs       # verifies dossier modal scrolls (Lenis fix)
│  ├─ journey-shots.mjs       # captures the full camera journey
│  ├─ interact-check.mjs      # clicks terminal commands + a floppy insert
│  ├─ shot-server.mjs         # PNG receiver on :5555
│  ├─ og-card.html            # SOURCE of public/og.png (render in headless Chrome)
│  └─ make-og.py             # LEGACY Aria Vell OG generator — superseded by og-card.html
├─ shots/                     # local screenshots (gitignored)
└─ README.md                  # long-form design/feature documentation
```

## 5. How to Run / Build / Test

```bash
# install
npm install

# run dev  (Vite dev server, default http://localhost:5173)
npm run dev

# build  (strict typecheck first, then production bundle → dist/)
npm run build

# test
# There is NO unit/integration test suite and no `npm test` script.
# "Testing" here = typecheck + build + the manual QA scripts in tools/:
npm run typecheck
node tools/shot-server.mjs          # terminal A: PNG receiver on :5555
node tools/journey-shots.mjs        # terminal B: drives system Chrome through the journey
node tools/interact-check.mjs       # terminal B: clicks terminal commands + a floppy
node tools/audio-check.mjs          # needs dev server on :5173 + Chrome with
                                    # --autoplay-policy=no-user-gesture-required
node tools/dossier-check.mjs        # verifies the recruiter dossier scrolls

# preview production build locally
npm run preview
```

QA script prerequisites: Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe` (override with `CHROME_PATH`), and the scripts must be run from inside the project so `puppeteer-core` resolves.

**Deploy:** `git push` to `main` → Vercel auto-builds (`npm run build`, output `dist`). No env vars needed. Regenerate the social card by editing `tools/og-card.html`, screenshotting it at 1200×630 into `public/og.png`, then bumping `?v=N` on `og:image` in `index.html` to bust social caches.

---

## 6. Conventions (design system + code rules)

**Palette (strict — no other colors):**
- Black `#0A0A0B`, graphite `#141416`, bone `#EDEDEA`
- Exactly ONE accent: amber phosphor `#FFD400`
- No pink/purple/cyan/neon, no sun-and-grid synthwave imagery.

**Typography:**
- Headlines: Space Grotesk (heavy/wide)
- Screen text, logs, terminal: VT323 (drawn large)
- Body / HUD labels: IBM Plex Mono
- Hazard labels: Big Shoulders Stencil
- Sharp rectangles and 1px borders; no rounded pills. Hazard-tape dividers for section edges.

**Code rules:**
- TypeScript strict; `npm run build` runs `tsc --noEmit` first — never commit a build that fails typecheck.
- Keep audio code in `src/lib/ambient.ts`; keep track/music config in `src/lib/playlist.ts` only.
- Any scrollable modal panel MUST carry `data-lenis-prevent` (Lenis intercepts wheel at window level even when stopped). Both `ProjectModal` and `RecruiterDossier` already do.
- Dev-only globals (`window.__sound`, `window.__lenis`) must stay behind `import.meta.env.DEV`.
- Content copy lives in `src/data/*.ts`, not inside components.
- Reduced motion: post-processing / handheld shake disabled; sound defaults to silent.
- No new runtime dependency for audio or animation unless strictly necessary (hand-rolled Web Audio + GSAP cover it).

---

## 7. Live Checklist

### Done (verified in code and/or live)
- [x] Full retro "RETRO COMPUTING SOUL" redesign: palette, fonts, hazard dividers, HUD, section layout
- [x] CRT desk scene with modeled monitor, props and clickable floppy disks (`src/three/objects/CRTDesk.tsx`)
- [x] Camera dolly path + chapter stops (`src/three/path.ts`, `CameraRig.tsx`), zones follow camera position (no black voids on jumps)
- [x] Dive-through-the-glass transition with scanline/phosphor flash
- [x] Wireframe vector landscape that compiles (`VectorWorld.tsx`, custom GLSL in `shaders.ts`)
- [x] CRT post-processing pass (barrel, scanlines, phosphor glow, flicker, aberration, vignette)
- [x] BIOS boot preloader: typed BIOS lines, 99% stall, "fine. I'll give it a push." → 100% + chime
- [x] Entry choice buttons (ENTER WITH SOUND / ENTER SILENT), preference remembered in `localStorage`
- [x] Recruiter Dossier modal (openable from preloader/HUD) — [x] scroll fixed via `data-lenis-prevent` + `tabIndex={0}`
- [x] Project case-study modals with `data-lenis-prevent`
- [x] Interactive terminal (help / ls projects / cat about.txt / skills / contact / hire --now) + clickable command buttons
- [x] Five data-driven projects (`src/data/projects.ts`)
- [x] Lazy Mode auto-scroll that stops on manual input
- [x] Build meter that stalls at 99% and ends `BUILD SUCCESSFUL`
- [x] Full lo-fi sound replacement ("Quiet Night Room" → lo-fi playlist): 4 generative presets, 70–82 BPM, FM Rhodes, dusty drums, vinyl crackle
- [x] Lookahead AudioContext scheduling (stable under 3D load), ~24-bar auto-advance, shuffle with no immediate repeats, 4–6 s crossfades
- [x] Support layers ducked ~10–15 dB (pad drone, CRT hum/air, rain, rare keystrokes)
- [x] Scroll-reactive low-pass on the music; Lazy Mode keeps it steady
- [x] Stall beat (`stallHold`) muffles music and keeps crackle/rain; resolve (`resolveRelease`) opens filter + chord + bell
- [x] Mix: master 0.27, limiter, 3 s fade-in / 1.5 s fade-out, tab-hidden auto-pause, lazy graph creation
- [x] Cassette MiniPlayer with reels, analyser EQ, NOW PLAYING (aria-live), play/pause, next, volume, collapse; keyboard accessible
- [x] `file`-track path via `MediaElementSource` + automatic footer attribution via `musicCredit()`
- [x] Footer colophon renders the music credit / "GENERATED IN-BROWSER"
- [x] Old engine-sound system fully removed (`engineProfiles.ts` deleted, `SoundToggle.tsx` replaced by `MiniPlayer.tsx`)
- [x] QA: `tools/audio-check.mjs` — 10/10 checks passing; `dossier-check.mjs` passing
- [x] QA: journey/interaction screenshots captured (`shots/`, gitignored)
- [x] README rewritten for the current design + sound spec
- [x] Identical first track renamed "Midnight Study" → "Late Night Commits"
- [x] Git initialized, remote `origin` = `https://github.com/CloudClown/portfolio-2026.git`, branch `main`
- [x] Vercel project connected to GitHub (auto-deploy on push to `main`)
- [x] Canonical URL, `og:url`, `sitemap.xml`, `robots.txt` synced to `https://tahmid-chy-theta.vercel.app/`
- [x] `package.json` renamed `aria-vell-portfolio` → `portfolio-2026`, description updated
- [x] New OG/Twitter preview card (T-99 BIOS style, 1200×630) at `public/og.png`; image URLs versioned `?v=2`
- [x] New favicon set: T-99 "99 + progress bar" SVG, 32×32 PNG, 180×180 apple-touch-icon, wired in `index.html`
- [x] Clean production build and clean typecheck
- [x] Real contact links wired from `src/data/site.ts`: email `tahmid.chy29@gmail.com`, GitHub `github.com/CloudClown`, LinkedIn `in/tahmid-rahman-chowdhury`; project repo URLs moved to `github.com/CloudClown/*`; JSON-LD `Person` gets `email`/`url`/`sameAs`

### Remaining / open
- [ ] **Real social-preview refresh on Discord/X** — server-side is correct and verified live; the old card is cached client-side. Action is human: share `…vercel.app/?v=2` (or edit an existing message) to force re-fetch. Nothing to do in Vercel.
- [ ] **Personal detail placeholder** — `site.personalDetail` is literally `[ONE PERSONAL DETAIL GOES HERE — …]`.
- [ ] **Real royalty-free tracks (optional)** — the `kind: 'file'` path is implemented but `PLAYLIST` ships only generated presets. Blocked earlier by environment (Pixabay needs an API key; archive.org SSL dropped), not by code. Needs user-provided URLs + attribution.
- [ ] **Custom domain (optional)** — once owned, update `canonical`, `og:url`, `sitemap.xml`, `robots.txt` in one pass.
- [ ] **`tools/make-og.py` is stale** — still generates the old Aria Vell card. Either delete it or re-point it at the new design so nobody regenerates the wrong image.
- [ ] **Remove unused `@react-three/rapier`** — confirmed: zero imports in `src/`, so it only adds install weight.
- [ ] **No automated tests** — no `npm test`, no CI. Verification is typecheck + build + Puppeteer QA scripts.
- [ ] **Accessibility audit not performed** — no automated axe/lighthouse pass recorded. **TBD**.
- [ ] **Cross-browser/device matrix not recorded** — verified only in headless/system Chrome on Windows. **TBD** for Safari/iOS/Firefox.

### Known environment caveats (not product bugs)
- Headless Chrome throttles `requestAnimationFrame` to ~1.5 fps; scroll-velocity audio wiring was therefore verified by feeding velocities directly. Real browsers at 60 Hz feed every frame.
- Puppeteer scripting gotchas: `page.evaluate` cannot return DOM nodes (use `page.$` + `boundingBox()`); Tailwind arbitrary selectors like `.max-h-[90vh]` break `querySelector` — prefer attribute selectors.

---

## 8. If You Change Something

1. Run `npm run typecheck` (or just `npm run build`).
2. If you touched scroll/modals, re-run `tools/dossier-check.mjs`.
3. If you touched audio (`ambient.ts`, `playlist.ts`, `MiniPlayer.tsx`), re-run `tools/audio-check.mjs` with the dev server up.
4. If you touched the 3D scene, run `tools/journey-shots.mjs` and inspect `shots/` for black frames or broken transitions.
5. If you touched the OG card, bump `?v=N` in `index.html`.
6. Update this checklist — that is this file's whole purpose.
