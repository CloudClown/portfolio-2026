import * as THREE from 'three'

/**
 * Procedural textures. The whole site ships without a single image download:
 * every glow, label and sticky note is a canvas drawn at runtime at 2x.
 */

const cache = new Map<string, THREE.Texture>()

/** Soft radial falloff, white in the centre. Used for halos and embers. */
export function glowTexture(power = 2.2) {
  const key = `glow-${power}`
  const hit = cache.get(key)
  if (hit) return hit

  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const image = ctx.createImageData(size, size)
  const half = size / 2

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - half) / half
      const dy = (y - half) / half
      const d = Math.min(1, Math.sqrt(dx * dx + dy * dy))
      const alpha = Math.pow(1 - d, power)
      const i = (y * size + x) * 4
      image.data[i] = 255
      image.data[i + 1] = 255
      image.data[i + 2] = 255
      image.data[i + 3] = Math.round(alpha * 255)
    }
  }
  ctx.putImageData(image, 0, 0)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  cache.set(key, texture)
  return texture
}

/** Draw a canvas at 2x scale for crisp text, then hand back a texture. */
function makeCanvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas')
  canvas.width = width * 2
  canvas.height = height * 2
  const ctx = canvas.getContext('2d')!
  ctx.scale(2, 2)
  draw(ctx)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  texture.needsUpdate = true
  return texture
}

const HANDWRITING = '"Caveat", "Segoe Script", cursive'

/** Grey floppy-disk case label: handwritten title + honest subtitle. */
export function floppyLabelTexture(title: string, sub: string) {
  const key = `floppy-${title}-${sub}`
  const hit = cache.get(key)
  if (hit) return hit

  const texture = makeCanvasTexture(256, 256, (ctx) => {
    // Off-white label
    ctx.fillStyle = '#E8E6DF'
    ctx.fillRect(8, 8, 240, 240)
    ctx.fillStyle = 'rgba(0,0,0,0.05)'
    ctx.fillRect(8, 8, 240, 10)

    // Handwritten title, wrapped
    ctx.fillStyle = '#141416'
    ctx.font = `600 44px ${HANDWRITING}`
    ctx.textBaseline = 'top'
    const words = title.split(' ')
    let line = ''
    let y = 34
    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      if (ctx.measureText(test).width > 218 && line) {
        ctx.fillText(line, 18, y)
        line = word
        y += 46
      } else {
        line = test
      }
    }
    ctx.fillText(line, 18, y)

    // Small monospace sub line
    ctx.fillStyle = '#55555C'
    ctx.font = '500 17px "IBM Plex Mono", monospace'
    ctx.fillText(sub.slice(0, 26), 18, 208)
  })

  cache.set(key, texture)
  return texture
}

/** Glowing shipped-disk label: black label, yellow marker handwriting. */
export function shippedLabelTexture(title: string) {
  const key = `shipped-${title}`
  const hit = cache.get(key)
  if (hit) return hit

  const texture = makeCanvasTexture(256, 256, (ctx) => {
    ctx.fillStyle = '#0B0B0D'
    ctx.fillRect(8, 8, 240, 240)
    ctx.strokeStyle = 'rgba(255,212,0,0.5)'
    ctx.lineWidth = 3
    ctx.strokeRect(16, 16, 224, 224)

    ctx.fillStyle = '#FFD400'
    ctx.font = `600 46px ${HANDWRITING}`
    ctx.textBaseline = 'top'
    const words = title.split(' ')
    let line = ''
    let y = 52
    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      if (ctx.measureText(test).width > 200 && line) {
        ctx.fillText(line, 24, y)
        line = word
        y += 50
      } else {
        line = test
      }
    }
    ctx.fillText(line, 24, y)
  })

  cache.set(key, texture)
  return texture
}

/** Engraved metal desk plate: name, role, and the ONE personal detail. */
export function deskPlateTexture(name: string, detail: string) {
  const key = `plate-${name}-${detail}`
  const hit = cache.get(key)
  if (hit) return hit

  const texture = makeCanvasTexture(512, 128, (ctx) => {
    ctx.fillStyle = '#2A2A30'
    ctx.fillRect(0, 0, 512, 128)

    // Brushed metal streaks
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.015 + Math.random() * 0.02})`
      ctx.fillRect(0, Math.random() * 128, 512, 1)
    }

    // Engraved border
    ctx.strokeStyle = 'rgba(0,0,0,0.55)'
    ctx.lineWidth = 3
    ctx.strokeRect(10, 10, 492, 108)
    ctx.strokeStyle = 'rgba(255,255,255,0.09)'
    ctx.lineWidth = 1
    ctx.strokeRect(13, 13, 486, 102)

    ctx.fillStyle = '#C9C9C4'
    ctx.font = '700 34px "Space Grotesk", sans-serif'
    ctx.textBaseline = 'top'
    ctx.fillText(name.toUpperCase() + ' — FRONTEND DEV', 28, 20)

    ctx.fillStyle = '#FFD400'
    ctx.font = '400 19px "IBM Plex Mono", monospace'
    const clipped = detail.length > 52 ? detail.slice(0, 51) + '…' : detail
    ctx.fillText(clipped, 28, 72)
  })

  cache.set(key, texture)
  return texture
}

/** Yellow sticky note with handwriting. */
export function stickyNoteTexture(text: string) {
  const key = `sticky-${text}`
  const hit = cache.get(key)
  if (hit) return hit

  const texture = makeCanvasTexture(128, 128, (ctx) => {
    ctx.fillStyle = '#FFD400'
    ctx.fillRect(0, 0, 128, 128)
    ctx.fillStyle = 'rgba(0,0,0,0.06)'
    ctx.fillRect(0, 116, 128, 12)

    ctx.fillStyle = '#141416'
    ctx.font = `600 26px ${HANDWRITING}`
    ctx.textBaseline = 'top'
    const words = text.split(' ')
    let line = ''
    let y = 14
    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      if (ctx.measureText(test).width > 104 && line) {
        ctx.fillText(line, 12, y)
        line = word
        y += 27
      } else {
        line = test
      }
    }
    ctx.fillText(line, 12, y)
  })

  cache.set(key, texture)
  return texture
}
