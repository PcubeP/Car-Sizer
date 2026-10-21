import { useEffect, useMemo, useState } from 'react'
import { carCatalog } from '@/data/carCatalog'
import { findParkingStandard, type ParkingStandard } from '@/data/parkingStandards'
import { useSilhouetteManifest } from '@/hooks/useSilhouetteManifest'
import { useWikidataDimensions } from '@/hooks/useWikidataDimensions'
import { CarPicker } from '@/components/CarPicker'
import { OverlayCanvas, type AlignmentMode } from '@/components/OverlayCanvas'
import { AlignmentToggle } from '@/components/AlignmentToggle'
import { ParkingToggle } from '@/components/ParkingToggle'
import { DimensionSummary } from '@/components/DimensionSummary'

const ALIGNMENTS: AlignmentMode[] = ['center', 'front', 'rear']

function readInitialState() {
  const params = new URLSearchParams(window.location.search)
  const a = params.get('a')
  const b = params.get('b')
  const align = params.get('align')
  const bay = params.get('bay')
  return {
    carAId: a && carCatalog.some((c) => c.id === a) ? a : 'mini-cooper-3door',
    carBId: b && carCatalog.some((c) => c.id === b) ? b : 'kia-sorento-2020',
    alignment: (align && ALIGNMENTS.includes(align as AlignmentMode) ? align : 'center') as AlignmentMode,
    parking: findParkingStandard(bay),
  }
}

function App() {
  const initial = useMemo(readInitialState, [])
  const [carAId, setCarAId] = useState(initial.carAId)
  const [carBId, setCarBId] = useState(initial.carBId)
  const [alignment, setAlignment] = useState<AlignmentMode>(initial.alignment)
  const [parking, setParking] = useState<ParkingStandard | null>(initial.parking)
  const [copied, setCopied] = useState(false)
  const { manifest } = useSilhouetteManifest()
  const liveDims = useWikidataDimensions(carCatalog)

  const carA = carCatalog.find((c) => c.id === carAId) ?? carCatalog[0]
  const carB = carCatalog.find((c) => c.id === carBId) ?? carCatalog[1]

  // Keep the URL in sync so the current comparison is always shareable/bookmarkable.
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('a', carAId)
    params.set('b', carBId)
    if (alignment !== 'center') params.set('align', alignment)
    if (parking) params.set('bay', parking.id)
    const query = params.toString()
    window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname)
  }, [carAId, carBId, alignment, parking])

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Car Size Comparison</h1>
          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            Compare the real-world footprint of two cars, overlaid to scale using their actual silhouettes.
          </p>
        </div>
        <button
          type="button"
          onClick={handleShare}
          className="shrink-0 self-start rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-800"
        >
          {copied ? 'Link copied!' : 'Copy share link'}
        </button>
      </header>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CarPicker label="Car A" cars={carCatalog} selectedId={carAId} onChange={setCarAId} accentColor="#2563eb" />
        <CarPicker label="Car B" cars={carCatalog} selectedId={carBId} onChange={setCarBId} accentColor="#f97316" />
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
        <AlignmentToggle value={alignment} onChange={setAlignment} />
        <ParkingToggle value={parking} onChange={setParking} />
      </div>

      <OverlayCanvas
        carA={carA}
        carB={carB}
        manifestA={manifest[carA.id]}
        manifestB={manifest[carB.id]}
        alignment={alignment}
        parking={parking}
      />

      <div className="mt-8 overflow-x-auto">
        <DimensionSummary carA={carA} carB={carB} liveA={liveDims[carA.id]} liveB={liveDims[carB.id]} />
      </div>
    </div>
  )
}

export default App
