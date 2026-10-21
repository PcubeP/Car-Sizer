import type { CarModel } from '@/types/car'
import type { WikidataDimensions } from '@/services/wikidata'
import { formatMm, diffLabel, mmToMeters } from '@/lib/units'

interface DimensionSummaryProps {
  carA: CarModel
  carB: CarModel
  liveA?: WikidataDimensions
  liveB?: WikidataDimensions
}

/** Above this spec-vs-Wikidata gap (mm) we flag the value rather than showing a quiet check. */
const LIVE_TOLERANCE_MM = 30

function LiveNote({ spec, live }: { spec: number; live?: number }) {
  if (live == null) return null
  const withinTolerance = Math.abs(live - spec) <= LIVE_TOLERANCE_MM
  if (withinTolerance) {
    return (
      <span className="ml-1 text-emerald-500" title={`Matches Wikidata (${mmToMeters(live).toFixed(2)} m)`}>
        ✓
      </span>
    )
  }
  return (
    <span className="ml-1 text-amber-400" title="Differs from Wikidata">
      (Wikidata {mmToMeters(live).toFixed(2)} m)
    </span>
  )
}

function Row({
  label,
  a,
  b,
  diff,
  specA,
  specB,
  liveA,
  liveB,
}: {
  label: string
  a: string
  b: string
  diff: string
  specA: number
  specB: number
  liveA?: number
  liveB?: number
}) {
  return (
    <tr className="border-t border-slate-800">
      <td className="py-2 pr-4 text-slate-400">{label}</td>
      <td className="py-2 pr-4 text-carA">
        {a}
        <LiveNote spec={specA} live={liveA} />
      </td>
      <td className="py-2 pr-4 text-carB">
        {b}
        <LiveNote spec={specB} live={liveB} />
      </td>
      <td className="py-2 text-slate-300">{diff}</td>
    </tr>
  )
}

export function DimensionSummary({ carA, carB, liveA, liveB }: DimensionSummaryProps) {
  const hasLive = Boolean(liveA || liveB)
  return (
    <div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-slate-500">
            <th className="pb-2 font-normal">Dimension</th>
            <th className="pb-2 font-normal">
              {carA.make} {carA.model}
            </th>
            <th className="pb-2 font-normal">
              {carB.make} {carB.model}
            </th>
            <th className="pb-2 font-normal">Difference</th>
          </tr>
        </thead>
        <tbody>
          <Row
            label="Length"
            a={formatMm(carA.lengthMm)}
            b={formatMm(carB.lengthMm)}
            diff={diffLabel(carA.lengthMm, carB.lengthMm)}
            specA={carA.lengthMm}
            specB={carB.lengthMm}
            liveA={liveA?.lengthMm}
            liveB={liveB?.lengthMm}
          />
          <Row
            label="Width"
            a={formatMm(carA.widthMm)}
            b={formatMm(carB.widthMm)}
            diff={diffLabel(carA.widthMm, carB.widthMm)}
            specA={carA.widthMm}
            specB={carB.widthMm}
            liveA={liveA?.widthMm}
            liveB={liveB?.widthMm}
          />
          <Row
            label="Height"
            a={formatMm(carA.heightMm)}
            b={formatMm(carB.heightMm)}
            diff={diffLabel(carA.heightMm, carB.heightMm)}
            specA={carA.heightMm}
            specB={carB.heightMm}
            liveA={liveA?.heightMm}
            liveB={liveB?.heightMm}
          />
        </tbody>
      </table>
      {hasLive && (
        <p className="mt-2 text-xs text-slate-500">
          <span className="text-emerald-500">✓</span> spec matches live Wikidata data (within {LIVE_TOLERANCE_MM} mm).
          Figures without a mark aren't published on Wikidata for that model.
        </p>
      )}
    </div>
  )
}
