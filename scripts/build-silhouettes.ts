import { mkdir, writeFile, access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { removeBackground } from '@imgly/background-removal-node'
import { Jimp } from 'jimp'
import { carCatalog } from '../src/data/carCatalog'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.resolve(__dirname, '../public/silhouettes')

interface ManifestEntry {
  id: string
  widthPx: number
  heightPx: number
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

/**
 * Crops tightly to the true opaque silhouette bounds on all four sides, based on actual alpha
 * values rather than Jimp's autocrop() (which only trims a row/column when it is *entirely*
 * uniform - a single stray pixel near an edge, like a mirror or JPEG noise, blocks cropping on
 * that whole side). This guarantees every saved PNG's edges exactly match the car's silhouette,
 * which is required for accurate scaling and for front/rear/ground alignment to line up.
 */
function cropToAlphaBounds(image: Awaited<ReturnType<typeof Jimp.read>>): void {
  const ALPHA_THRESHOLD = 128
  const { width, height, data } = image.bitmap
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < height; y++) {
    const rowStart = y * width * 4
    for (let x = 0; x < width; x++) {
      if (data[rowStart + x * 4 + 3] > ALPHA_THRESHOLD) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (maxX >= minX && maxY >= minY) {
    image.crop({ x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 })
  }
}

async function processCar(id: string, commonsFileName: string): Promise<ManifestEntry> {
  const outPath = path.join(OUT_DIR, `${id}.png`)

  // Skip re-fetching from Commons if we already have a processed silhouette on disk -
  // keeps re-runs idempotent and avoids re-triggering Wikimedia rate limits. Still re-applies
  // the crop in case that logic has changed since the file was first generated.
  if (await fileExists(outPath)) {
    const image = await Jimp.read(outPath)
    cropToAlphaBounds(image)
    const pngBuffer = await image.getBuffer('image/png')
    await writeFile(outPath, pngBuffer)
    console.log(`[${id}] already processed, reusing (cropped to ${image.bitmap.width}x${image.bitmap.height})`)
    return { id, widthPx: image.bitmap.width, heightPx: image.bitmap.height }
  }

  const sourceUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(commonsFileName)}`
  console.log(`[${id}] removing background...`)
  const blob = await removeBackground(sourceUrl, { output: { quality: 0.9 } })
  const rawBuffer = Buffer.from(await blob.arrayBuffer())

  // Trim transparent padding so the PNG's pixel bounds match the car's true silhouette extent.
  const image = await Jimp.read(rawBuffer)
  cropToAlphaBounds(image)

  const pngBuffer = await image.getBuffer('image/png')
  await writeFile(outPath, pngBuffer)
  console.log(`[${id}] saved ${image.bitmap.width}x${image.bitmap.height} -> ${outPath}`)

  return { id, widthPx: image.bitmap.width, heightPx: image.bitmap.height }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const manifest: ManifestEntry[] = []

  for (const car of carCatalog) {
    try {
      const entry = await processCar(car.id, car.sourceImage.commonsFileName)
      manifest.push(entry)
    } catch (err) {
      console.error(`[${car.id}] FAILED:`, err)
    }
  }

  await writeFile(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log(`Wrote manifest with ${manifest.length}/${carCatalog.length} entries.`)
}

main()

