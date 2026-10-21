import { useEffect, useState } from 'react'

export interface SilhouetteManifestEntry {
  id: string
  widthPx: number
  heightPx: number
}

type ManifestMap = Record<string, SilhouetteManifestEntry>

export function useSilhouetteManifest() {
  const [manifest, setManifest] = useState<ManifestMap>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/silhouettes/manifest.json')
      .then((res) => res.json())
      .then((entries: SilhouetteManifestEntry[]) => {
        if (cancelled) return
        const map: ManifestMap = {}
        for (const entry of entries) map[entry.id] = entry
        setManifest(map)
      })
      .catch(() => {
        if (!cancelled) setManifest({})
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { manifest, loading }
}
