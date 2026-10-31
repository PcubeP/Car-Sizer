import { useState } from 'react'
import type { CarModel } from '@/types/car'

interface ImageCreditsProps {
  cars: CarModel[]
}

/**
 * Visible attribution for the Wikimedia Commons source photos the silhouettes are derived from.
 * CC BY / BY-SA licences require author + licence + source to be credited, so we surface it here
 * for whichever cars are currently on screen. Collapsed by default to stay unobtrusive.
 */
export function ImageCredits({ cars }: ImageCreditsProps) {
  const [open, setOpen] = useState(false)

  // De-dupe in case the same car is picked for both slots.
  const seen = new Set<string>()
  const unique = cars.filter((car) => {
    if (seen.has(car.id)) return false
    seen.add(car.id)
    return true
  })

  if (unique.length === 0) return null

  return (
    <section className="mt-8 border-t border-slate-800 pt-4 text-xs text-slate-500">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 text-slate-400 transition-colors hover:text-slate-200"
      >
        <span aria-hidden="true" className="inline-block w-3">
          {open ? '▾' : '▸'}
        </span>
        Image credits
      </button>
      {open && (
        <ul className="mt-3 space-y-2">
          {unique.map((car) => {
            const { author, license, sourceUrl } = car.sourceImage
            return (
              <li key={car.id}>
                <span className="text-slate-400">
                  {car.make} {car.model}
                </span>{' '}
                silhouette derived from a photo by {author}, {license} —{' '}
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 underline underline-offset-2 transition-colors hover:text-slate-200"
                >
                  Wikimedia Commons
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
