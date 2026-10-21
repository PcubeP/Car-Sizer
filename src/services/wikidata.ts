export interface WikidataDimensions {
  /** All values normalized to millimetres. Any field may be missing on Wikidata. */
  lengthMm?: number
  widthMm?: number
  heightMm?: number
}

interface CacheEntry {
  dims: WikidataDimensions
  fetchedAt: number
}

type CacheShape = Record<string, CacheEntry>

const CACHE_KEY = 'wikidata-dims:v1'
const TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql'

function readCache(): CacheShape {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as CacheShape) : {}
  } catch {
    return {}
  }
}

function writeCache(cache: CacheShape): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // storage full / unavailable - non-fatal, live lookup just won't be cached
  }
}

function isFresh(entry: CacheEntry): boolean {
  return Date.now() - entry.fetchedAt < TTL_MS
}

/**
 * Uses the normalized-value node (psn:) so quantities come back in the SI base unit (metres),
 * regardless of whether the source statement was stored in mm, cm or m. We then convert to mm.
 */
function buildQuery(qids: string[]): string {
  const values = qids.map((q) => `wd:${q}`).join(' ')
  return `SELECT ?item ?lenM ?widM ?heiM WHERE {
  VALUES ?item { ${values} }
  OPTIONAL { ?item p:P2043/psn:P2043/wikibase:quantityAmount ?lenM. }
  OPTIONAL { ?item p:P2049/psn:P2049/wikibase:quantityAmount ?widM. }
  OPTIONAL { ?item p:P2048/psn:P2048/wikibase:quantityAmount ?heiM. }
}`
}

interface SparqlBinding {
  item: { value: string }
  lenM?: { value: string }
  widM?: { value: string }
  heiM?: { value: string }
}

function metresToMm(value: string | undefined): number | undefined {
  if (value == null) return undefined
  const m = Number.parseFloat(value)
  if (!Number.isFinite(m) || m <= 0) return undefined
  return Math.round(m * 1000)
}

async function querySparql(qids: string[]): Promise<Record<string, WikidataDimensions>> {
  const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(buildQuery(qids))}&format=json`
  const res = await fetch(url, { headers: { Accept: 'application/sparql-results+json' } })
  if (!res.ok) throw new Error(`SPARQL request failed: ${res.status}`)
  const json = (await res.json()) as { results: { bindings: SparqlBinding[] } }

  const out: Record<string, WikidataDimensions> = {}
  for (const b of json.results.bindings) {
    const qid = b.item.value.split('/').pop()
    if (!qid) continue
    // Statements can repeat per trim; keep the first non-empty value we see for each field.
    const existing = out[qid] ?? {}
    out[qid] = {
      lengthMm: existing.lengthMm ?? metresToMm(b.lenM?.value),
      widthMm: existing.widthMm ?? metresToMm(b.widM?.value),
      heightMm: existing.heightMm ?? metresToMm(b.heiM?.value),
    }
  }
  return out
}

/**
 * Returns live Wikidata dimensions for the given entity IDs, backed by a 7-day localStorage
 * cache. Only QIDs that are missing or stale are fetched. Network/parse failures resolve to
 * whatever is already cached, so callers can always fall back to hardcoded catalog dims.
 */
export async function fetchWikidataDimensions(qids: string[]): Promise<Record<string, WikidataDimensions>> {
  const unique = Array.from(new Set(qids.filter(Boolean)))
  const cache = readCache()
  const result: Record<string, WikidataDimensions> = {}
  const stale: string[] = []

  for (const qid of unique) {
    const entry = cache[qid]
    if (entry && isFresh(entry)) {
      result[qid] = entry.dims
    } else {
      stale.push(qid)
    }
  }

  if (stale.length === 0) return result

  try {
    const fetched = await querySparql(stale)
    const now = Date.now()
    for (const qid of stale) {
      const dims = fetched[qid] ?? {}
      cache[qid] = { dims, fetchedAt: now }
      result[qid] = dims
    }
    writeCache(cache)
  } catch {
    // On failure, surface any stale-but-cached values we still have.
    for (const qid of stale) {
      if (cache[qid]) result[qid] = cache[qid].dims
    }
  }

  return result
}
