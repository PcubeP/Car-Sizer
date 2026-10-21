import type { CarModel } from '@/types/car'
import type { SilhouetteManifestEntry } from '@/hooks/useSilhouetteManifest'
import type { ParkingStandard } from '@/data/parkingStandards'
import { mmToMeters } from '@/lib/units'

export type AlignmentMode = 'center' | 'front' | 'rear'

interface CarLayer {
  car: CarModel
  manifestEntry?: SilhouetteManifestEntry
  accentColor: string
  label: string
  alignment: AlignmentMode
}

interface OverlayCanvasProps {
  carA: CarModel
  carB: CarModel
  manifestA?: SilhouetteManifestEntry
  manifestB?: SilhouetteManifestEntry
  alignment: AlignmentMode
  parking?: ParkingStandard | null
}

const PX_PER_METER = 90
const STAGE_HEIGHT_METERS = 2.4

/** Positions a sprite so its nose (front) always renders on the right, regardless of the source photo's facing. */
function CarSprite({ car, manifestEntry, accentColor, label, alignment }: CarLayer) {
  if (!manifestEntry) {
    return (
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-sm text-slate-400">
        Processing silhouette for {car.make} {car.model}…
      </div>
    )
  }

  const displayWidthPx = mmToMeters(car.lengthMm) * PX_PER_METER
  const aspect = manifestEntry.heightPx / manifestEntry.widthPx
  const displayHeightPx = displayWidthPx * aspect
  const needsFlip = car.facing === 'left'

  const left =
    alignment === 'front'
      ? `calc(50% - ${displayWidthPx}px)`
      : alignment === 'rear'
        ? '50%'
        : `calc(50% - ${displayWidthPx / 2}px)`

  return (
    <div className="absolute bottom-0" style={{ left, width: displayWidthPx, height: displayHeightPx }}>
      <img
        src={`/silhouettes/${car.id}.png`}
        alt={`${car.make} ${car.model} side silhouette`}
        className="h-full w-full object-contain opacity-85"
        style={{
          filter: `drop-shadow(0 0 4px ${accentColor})`,
          transform: needsFlip ? 'scaleX(-1)' : undefined,
        }}
      />
      <span
        className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium"
        style={{ color: accentColor }}
      >
        {label}
      </span>
    </div>
  )
}

export function OverlayCanvas({ carA, carB, manifestA, manifestB, alignment, parking }: OverlayCanvasProps) {
  const stageHeightPx = STAGE_HEIGHT_METERS * PX_PER_METER
  const gridLines = Array.from({ length: 12 }, (_, i) => i)

  const bayLengthPx = parking ? mmToMeters(parking.bayLengthMm) * PX_PER_METER : 0
  const longestCarMm = Math.max(carA.lengthMm, carB.lengthMm)
  const bayOverflow = parking ? longestCarMm > parking.bayLengthMm : false

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/60 p-6">
      <div className="relative mx-auto" style={{ height: stageHeightPx, minWidth: 900 }}>
        {/* ground grid, one line per meter */}
        <div className="absolute inset-x-0 bottom-0 top-0 flex justify-center">
          {gridLines.map((i) => (
            <div
              key={i}
              className="absolute bottom-0 top-0 border-l border-slate-800/70"
              style={{ left: `calc(50% + ${(i - 6) * PX_PER_METER}px)` }}
            />
          ))}
        </div>
        {/* parking bay reference, centered on the ground line */}
        {parking && (
          <div
            className="absolute bottom-0 top-0 -translate-x-1/2 rounded-sm border-x border-dashed"
            style={{
              left: '50%',
              width: bayLengthPx,
              borderColor: bayOverflow ? 'rgba(248,113,113,0.8)' : 'rgba(74,222,128,0.7)',
              backgroundColor: bayOverflow ? 'rgba(248,113,113,0.08)' : 'rgba(74,222,128,0.08)',
            }}
          >
            <span
              className="absolute left-1/2 top-1 -translate-x-1/2 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{
                color: bayOverflow ? '#fca5a5' : '#86efac',
                backgroundColor: 'rgba(2,6,23,0.7)',
              }}
            >
              {parking.label} · {mmToMeters(parking.bayLengthMm).toFixed(1)} m
            </span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 border-t border-slate-700" />
        {/* alignment anchor line */}
        {alignment !== 'center' && (
          <div className="absolute bottom-0 top-0 left-1/2 border-l border-dashed border-slate-600" />
        )}

        <CarSprite
          car={carB}
          manifestEntry={manifestB}
          accentColor="#f97316"
          label={`${carB.make} ${carB.model}`}
          alignment={alignment}
        />
        <CarSprite
          car={carA}
          manifestEntry={manifestA}
          accentColor="#2563eb"
          label={`${carA.make} ${carA.model}`}
          alignment={alignment}
        />
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">
        Grid lines are spaced 1 meter apart ·{' '}
        {alignment === 'center'
          ? 'cars are aligned to a shared ground line and center point'
          : alignment === 'front'
            ? 'cars are aligned front bumper to front bumper'
            : 'cars are aligned rear bumper to rear bumper'}
      </p>
      {parking && (
        <p className="mt-1 text-center text-xs" style={{ color: bayOverflow ? '#fca5a5' : '#86efac' }}>
          {bayOverflow
            ? `The longer car exceeds the ${mmToMeters(parking.bayLengthMm).toFixed(1)} m ${parking.region} bay length by ${mmToMeters(longestCarMm - parking.bayLengthMm).toFixed(2)} m.`
            : `Both cars fit within the ${mmToMeters(parking.bayLengthMm).toFixed(1)} m ${parking.region} bay length (bay width ${mmToMeters(parking.bayWidthMm).toFixed(2)} m).`}
        </p>
      )}
    </div>
  )
}

