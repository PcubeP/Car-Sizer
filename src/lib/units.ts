const MM_PER_INCH = 25.4

export function mmToMeters(mm: number): number {
  return mm / 1000
}

export function mmToFeetInches(mm: number): string {
  const totalInches = mm / MM_PER_INCH
  let feet = Math.floor(totalInches / 12)
  let inches = Math.round(totalInches % 12)
  if (inches === 12) {
    inches = 0
    feet += 1
  }
  return `${feet}'${inches}"`
}

export function formatMm(mm: number): string {
  return `${mmToMeters(mm).toFixed(2)} m (${mmToFeetInches(mm)})`
}

export function diffLabel(mmA: number, mmB: number): string {
  const diff = mmA - mmB
  const sign = diff > 0 ? '+' : diff < 0 ? '\u2212' : '\u00b1'
  return `${sign}${mmToMeters(Math.abs(diff)).toFixed(2)} m`
}
