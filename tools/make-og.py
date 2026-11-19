"""Generates public/og.png — the social preview card for the site.

Run: python tools/make-og.py
Requires Pillow (already used by the PDF toolchain).
"""

from __future__ import annotations

import math
import random

from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1200, 630
SS = 2  # supersample, then downscale for clean edges
random.seed(7)

FONT_DIR = "C:/Windows/Fonts/"
serif = ImageFont.truetype(FONT_DIR + "georgia.ttf", int(150 * SS))
serif_italic = ImageFont.truetype(FONT_DIR + "georgiai.ttf", int(150 * SS))
sans = ImageFont.truetype(FONT_DIR + "segoeui.ttf", int(15 * SS))
sans_small = ImageFont.truetype(FONT_DIR + "segoeui.ttf", int(11 * SS))

img = Image.new("RGB", (W * SS, H * SS), "#05040d")
draw = ImageDraw.Draw(img)

# --- vertical sky gradient -------------------------------------------------
top = (5, 4, 13)
bottom = (36, 26, 64)
for y in range(H * SS):
    t = y / (H * SS)
    t = t ** 1.15
    r = int(top[0] + (bottom[0] - top[0]) * t)
    g = int(top[1] + (bottom[1] - top[1]) * t)
    b = int(top[2] + (bottom[2] - top[2]) * t)
    draw.line([(0, y), (W * SS, y)], fill=(r, g, b))

# --- glows -----------------------------------------------------------------
glow = Image.new("RGB", (W * SS, H * SS), (0, 0, 0))
gdraw = ImageDraw.Draw(glow)

def radial(cx: int, cy: int, radius: int, color: tuple[int, int, int], strength: float) -> None:
    steps = 60
    for i in range(steps, 0, -1):
        r = int(radius * i / steps)
        a = (1 - i / steps) ** 2 * strength
        gdraw.ellipse(
            [cx - r, cy - r, cx + r, cy + r],
            fill=tuple(int(c * a) for c in color),
        )

radial(int(W * SS * 0.80), int(H * SS * 0.62), int(H * SS * 0.85), (255, 170, 120), 0.55)
radial(int(W * SS * 0.12), int(H * SS * 0.08), int(H * SS * 0.7), (111, 91, 255), 0.35)
glow = glow.filter(ImageFilter.GaussianBlur(70 * SS))
img = Image.blend(img, Image.blend(img, glow, 0.85), 0.85)
draw = ImageDraw.Draw(img)

# --- stars -----------------------------------------------------------------
for _ in range(220):
    x = random.uniform(0, W * SS)
    y = random.uniform(0, H * SS * 0.8)
    r = random.choice([1, 1, 1, 2]) * SS
    a = random.uniform(0.15, 0.75)
    draw.ellipse([x, y, x + r, y + r], fill=(235, 232, 255, int(a * 255)))

# --- the ring --------------------------------------------------------------
cx, cy, rad = int(W * SS * 0.79), int(H * SS * 0.47), int(H * SS * 0.30)
for i in range(3):
    alpha = [70, 120, 45][i]
    width = max(1, int((3 - i) * SS * 1.2))
    draw.ellipse(
        [cx - rad - i * 6 * SS, cy - rad - i * 6 * SS, cx + rad + i * 6 * SS, cy + rad + i * 6 * SS],
        outline=(210, 190, 255, alpha),
        width=width,
    )

# the sun inside the ring
sun = Image.new("RGB", (W * SS, H * SS), (0, 0, 0))
sdraw = ImageDraw.Draw(sun)
sr = int(H * SS * 0.13)
sdraw.ellipse([cx - sr, cy - sr, cx + sr, cy + sr], fill=(255, 214, 170))
sun = sun.filter(ImageFilter.GaussianBlur(18 * SS))
img = Image.blend(img, Image.blend(img, sun, 0.8), 0.9)
draw = ImageDraw.Draw(img)

# --- type ------------------------------------------------------------------
left = int(W * SS * 0.075)
baseline = int(H * SS * 0.30)

draw.text((left, baseline), "Aria", font=serif, fill=(243, 239, 255))
draw.text((left + int(150 * SS), baseline + int(126 * SS)), "Vell", font=serif_italic, fill=(214, 200, 255))

def tracked(text: str, font: ImageFont.FreeTypeFont, y: int, fill, tracking: int) -> None:
    x = left
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking

tracked("CREATIVE DEVELOPER & SPATIAL DESIGNER", sans, baseline + int(320 * SS), (230, 224, 255), int(3.2 * SS))

# hairline
line_y = int(H * SS * 0.865)
draw.line([(left, line_y), (int(W * SS * 0.5), line_y)], fill=(255, 255, 255), width=SS)

tracked("ARIAVELL.STUDIO", sans_small, line_y + int(18 * SS), (200, 195, 230), int(2.4 * SS))

# --- film grain ------------------------------------------------------------
import numpy as np  # noqa: E402  (kept local: only this script needs it)

arr = np.asarray(img).astype(np.int16)
grain = np.random.normal(0, 5.5, arr.shape[:2])[..., None]
arr = np.clip(arr + grain, 0, 255).astype(np.uint8)
img = Image.fromarray(arr)

img = img.resize((W, H), Image.LANCZOS)
img.save("public/og.png", optimize=True)
print("wrote public/og.png")
