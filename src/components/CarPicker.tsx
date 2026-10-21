import type { CarModel } from '@/types/car'

interface CarPickerProps {
  label: string
  cars: CarModel[]
  selectedId: string
  onChange: (id: string) => void
  accentColor: string
}

export function CarPicker({ label, cars, selectedId, onChange, accentColor }: CarPickerProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium" style={{ color: accentColor }}>
        {label}
      </span>
      <select
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
      >
        {cars.map((car) => (
          <option key={car.id} value={car.id}>
            {car.year} {car.make} {car.model} {car.trim ?? ''}
          </option>
        ))}
      </select>
    </label>
  )
}
