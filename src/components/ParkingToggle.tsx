import { parkingStandards, type ParkingStandard } from '@/data/parkingStandards'

interface ParkingToggleProps {
  value: ParkingStandard | null
  onChange: (standard: ParkingStandard | null) => void
}

export function ParkingToggle({ value, onChange }: ParkingToggleProps) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-slate-400">Parking bay:</span>
      <select
        value={value?.id ?? ''}
        onChange={(e) => onChange(parkingStandards.find((s) => s.id === e.target.value) ?? null)}
        className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-100"
      >
        <option value="">None</option>
        {parkingStandards.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label} ({(s.bayLengthMm / 1000).toFixed(1)} m)
          </option>
        ))}
      </select>
    </label>
  )
}
