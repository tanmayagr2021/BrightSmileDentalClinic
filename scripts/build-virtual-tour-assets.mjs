// Converts the clinic's source panoramas (ASSETS/New/Pana, gitignored) into the
// web-ready WebP files the Virtual Tour serves from public/virtual-tour/.
//
// Source filenames are kept verbatim in SOURCES so every output is traceable
// back to the exact file it came from; outputs get URL-safe slugs because the
// originals contain spaces, a leading "+" and trailing whitespace.
//
// Usage: node scripts/build-virtual-tour-assets.mjs
import sharp from 'sharp'
import { mkdir, stat } from 'node:fs/promises'
import path from 'node:path'

const SRC_DIR = path.resolve('ASSETS/New/Pana')
const OUT_DIR = path.resolve('public/virtual-tour')

const SOURCES = {
  'entrance-reception': 'entrance reception .png',
  'waiting-area': '+waiting area .png',
  'treatment-room-1': 'chair 1.png',
  'treatment-room-2': 'chair 2.png',
  'treatment-room-3': 'cair 3.png',
}

await mkdir(OUT_DIR, { recursive: true })

for (const [slug, file] of Object.entries(SOURCES)) {
  const input = path.join(SRC_DIR, file)
  const { width, height } = await sharp(input).metadata()

  // Full-resolution panorama — never upscaled, these are the native pixels.
  const pano = path.join(OUT_DIR, `${slug}.webp`)
  await sharp(input).webp({ quality: 86, effort: 6 }).toFile(pano)

  // Small preview for the overview list / page hero.
  const thumb = path.join(OUT_DIR, `${slug}-thumb.webp`)
  await sharp(input).resize({ width: 640 }).webp({ quality: 78 }).toFile(thumb)

  const kb = async (p) => Math.round((await stat(p)).size / 1024)
  console.log(`${file.padEnd(26)} ${width}x${height}  ->  ${slug}.webp ${await kb(pano)}KB, thumb ${await kb(thumb)}KB`)
}
