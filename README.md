# RETRO COMPUTING SOUL // Tahmid — Frontend Developer

A developer portfolio built as an old-school computer workshop, powered by **Three.js / React Three Fiber + Custom GLSL Shaders + Lenis Scroll**.

The portfolio is a developer's desk in a dark room. The retro style is retro **computing** — CRT terminals, boot screens, floppy disks, wireframe vector graphics — not 80s synthwave. The "BUILD 99%" concept survives: a professional overplanner who ships anyway.

---

## The Journey (Scroll = Camera Dolly)

| # | Chapter | Visual Scene | Interaction |
|---|---------|--------------|-------------|
| **Boot** | BIOS Preloader | BIOS lines type out (`MEMORY TEST... OK`, `LOADING PLANS... 99%`), the counter **stalls at 99%**, then: *"fine. I'll give it a push."* → 100% + boot chime. | Click to push, or wait for the auto-push. Skip straight to the recruiter dossier. |
| **01** | **The Desk** | A large well-modeled CRT (curved glass, beveled bezel, vents, power LED) on a desk in a dark room, lit by its own amber phosphor glow. Floppy stack with handwritten labels (`plans_v1`, `plans_v2_FINAL`, `todo_someday`) plus ONE glowing shipped disk, floppy drive, mechanical keyboard, mug, cables, sticky notes, engraved plate. | Floppy disks are clickable — insert one and its case study boots on the CRT. |
| **02** | **The Dive** | The camera pushes **through the glass** (scanline flash + phosphor flare) into a yellow wireframe vector landscape: low-poly mountains, horizon line, clean grid floor fading into fog. | Terrain "compiles" from wireframe into solid graphite with yellow edge lines as the build progresses. |
| **03–05** | **Inside the Screen** | Commit-log blocks (experience), wireframe parts tray (skills), five glowing floppy-disk beacons (projects), a giant terminal wall (AI workflow). | Beacons are clickable. The terminal is real: `help`, `ls projects`, `cat about.txt`, `skills`, `contact`, `hire --now` — with clickable buttons for visitors who don't type. |
| **06** | **Build Successful** | The camera pulls back **out of the screen** to the finished desk; the CRT reads `BUILD SUCCESSFUL.` | Direct contact dispatch. |

---

## Design System

### 1. Palette (strict)
- Black (`#0A0A0B`), graphite (`#141416`), bone white (`#EDEDEA`)
- **ONE accent**: amber phosphor yellow (`#FFD400`)
- No pink, purple, cyan, neon rainbow, palm trees or sun-and-grid.

### 2. Typography
- **Headlines**: heavy wide grotesk (Space Grotesk)
- **Screen text / logs / terminal**: VT323 (drawn large for crispness)
- **Body / HUD labels**: IBM Plex Mono
- **Hazard labels**: Big Shoulders Stencil
- Sharp rectangles, thin borders, hazard-tape dividers. No rounded pills.

### 3. Authentic CRT effects (deliberate, controlled)
Rendered at full DPR with the retro layer applied as an intentional shader pass **on top**: slight barrel distortion, fine scanline mask, soft phosphor glow (bloom on the screen only), subtle flicker + ghosting, gentle chromatic fringing near the edges, vignette. Text never loses legibility — scanline depth, flicker and aberration are all tuned subtle.

### 4. Sound (optional, off by default)
"Quiet night room": a calm lo-fi layer that makes visitors feel at ease within seconds — always optional, never intrusive, and the site is fully functional with sound off. The preloader ends at 100% with **ENTER WITH SOUND / ENTER SILENT** buttons; the choice is remembered in `localStorage`, and `prefers-reduced-motion` defaults to silent.

**Main layer — lo-fi hip hop playlist** (`src/lib/playlist.ts` config): instrumental tracks at 70–85 BPM (warm Rhodes-style keys, soft dusty drums, mellow bass, light vinyl crackle; no vocals, no drops, no bright highs), shuffled with ~5 s crossfades. Tracks are **synthesized in-browser** (self-generated audio: no downloads, no licensing, never audibly loops) — or drop real royalty-free files (Pixabay Music, FMA…) into the config; they stream via `HTMLAudioElement → MediaElementSource` and their attribution renders automatically in the footer credits.

**Support layers** (10–15 dB under the music, via a ducked support bus): warm pad drone (D Dorian, gliding chords), faint CRT hum + soft air, soft distant rain, a rare muffled keystroke every 20–40 s.

**Interaction beats:**
- Scroll gently opens a low-pass on the music (brighter when moving, warmer when still) — tiny and slow; Lazy Mode keeps it steady
- The 99% stall: the music muffles through the filter (from another room), the beat softens; only crackle and rain remain for a heartbeat
- At 100%: the filter opens, the track swells back + a warm resolving chord and soft bell — relief, not a fanfare
- Project hover/click: one soft, low, rounded tone; footer gauge ticks barely audible; no notification beeps

**Mini player** (`src/components/MiniPlayer.tsx`): cassette/CRT-styled corner widget — collapsible, with play/pause, next track, volume, a tiny analyser EQ and a `NOW PLAYING:` line; sharp rectangles, black + caution yellow, thin borders, fully keyboard accessible.

**Mixing:** master ≈ 27% with a limiter, gentle HF roll-off on the whole mix (tape warmth), 3 s fade-in / 1.5 s fade-out, auto-pause when the tab is hidden, one track loaded at a time, lazy graph creation after the first click.

---

## Quality & Accessibility

- Adaptive quality: `PerformanceMonitor` scales DPR; mobile drops DOF/reflection-heavy passes
- `prefers-reduced-motion`: post-processing and handheld shake disabled
- All text is real DOM text; hero shows name, role, years, proof and two buttons within 5 seconds
- Lazy Mode auto-plays the whole journey (top bar), stops on any manual input
- The build meter stalls at 99% until the final chapter, where it reads `BUILD SUCCESSFUL`

## Tech Stack

- React 18, TypeScript, Vite
- Three.js, `@react-three/fiber`, `@react-three/drei`
- Custom GLSL: vector grid floor, phosphor screen, CRT post pass (barrel/scanline/ghosting/fringing)
- Post-processing: Bloom, Depth of Field, custom CRT Effect
- Lenis smooth scroll + GSAP ScrollTrigger, Tailwind CSS
- Web Audio API (generative lo-fi playlist + ambient support layers, no audio assets required)

## Development

```bash
npm install
npm run dev          # local dev server
npm run typecheck    # strict TypeScript verification
npm run build        # typecheck + production build
```

### Local frame capture (optional)

```bash
node tools/shot-server.mjs       # receives PNGs on :5555
node tools/journey-shots.mjs     # drives system Chrome through the whole camera path
node tools/interact-check.mjs    # clicks terminal commands + a disk insert
```

Requires Chrome at the default Windows path (override with `CHROME_PATH`).
