import { useEffect, useState } from 'react'
import type { CarModel } from '@/types/car'
import { fetchWikidataDimensions, type WikidataDimensions } from '@/services/wikidata'

/** Live Wikidata dimensions keyed by car id (only for cars that declare a wikidataId). */
export function useWikidataDimensions(cars: CarModel[]) {
  const [byCarId, setByCarId] = useState<Record<string, WikidataDimensions>>({})

  const qids = cars
    .map((c) => c.wikidataId)
    .filter((q): q is string => Boolean(q))
    .sort()
    .join(',')

  useEffect(() => {
    if (!qids) return
    let cancelled = false
    fetchWikidataDimensions(qids.split(','))
      .then((byQid) => {
        if (cancelled) return
        const map: Record<string, WikidataDimensions> = {}
        for (const car of cars) {
          if (car.wikidataId && byQid[car.wikidataId]) map[car.id] = byQid[car.wikidataId]
        }
        setByCarId(map)
      })
      .catch(() => {
        if (!cancelled) setByCarId({})
      })
    return () => {
      cancelled = true
    }
    // `qids` captures the meaningful identity of the car set for this lookup.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qids])

  return byCarId
}
