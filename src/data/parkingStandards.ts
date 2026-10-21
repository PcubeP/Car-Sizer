export interface ParkingStandard {
  id: string
  /** Short menu label. */
  label: string
  region: string
  /** Bay depth/length in mm (the axis a car's length is measured against). */
  bayLengthMm: number
  /** Bay width in mm (relevant for door-opening clearance; shown in the summary, not the side view). */
  bayWidthMm: number
  note?: string
}

/**
 * Common parking-bay sizes used to give a "will it fit?" reference. Values are typical
 * published minimums; local codes vary, so these are guidance rather than legal figures.
 */
export const parkingStandards: ParkingStandard[] = [
  {
    id: 'india-standard',
    label: 'India · standard bay',
    region: 'India',
    bayLengthMm: 5000,
    bayWidthMm: 2500,
    note: 'Typical surface/covered car bay per common Indian planning norms.',
  },
  {
    id: 'india-compact',
    label: 'India · compact/basement bay',
    region: 'India',
    bayLengthMm: 4500,
    bayWidthMm: 2400,
    note: 'Tighter basement/stack bay often seen in Indian apartment complexes.',
  },
  {
    id: 'uk-standard',
    label: 'UK · standard bay',
    region: 'UK',
    bayLengthMm: 4800,
    bayWidthMm: 2400,
  },
  {
    id: 'us-standard',
    label: 'US · standard bay',
    region: 'US',
    bayLengthMm: 5486,
    bayWidthMm: 2743,
    note: 'Roughly 18 ft × 9 ft.',
  },
  {
    id: 'us-compact',
    label: 'US · compact bay',
    region: 'US',
    bayLengthMm: 4877,
    bayWidthMm: 2438,
    note: 'Roughly 16 ft × 8 ft.',
  },
]

export function findParkingStandard(id: string | null | undefined): ParkingStandard | null {
  if (!id) return null
  return parkingStandards.find((s) => s.id === id) ?? null
}
