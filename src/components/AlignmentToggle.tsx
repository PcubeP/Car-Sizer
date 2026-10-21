import type { AlignmentMode } from '@/components/OverlayCanvas'

interface AlignmentToggleProps {
  value: AlignmentMode
  onChange: (mode: AlignmentMode) => void
}

const OPTIONS: { value: AlignmentMode; label: string }[] = [
  { value: 'center', label: 'Center' },
  { value: 'front', label: 'Front bumper' },
  { value: 'rear', label: 'Rear bumper' },
]

export function AlignmentToggle({ value, onChange }: AlignmentToggleProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-slate-400">Align by:</span>
      <div className="inline-flex overflow-hidden rounded-md border border-slate-700">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 transition-colors ${
              value === opt.value ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
