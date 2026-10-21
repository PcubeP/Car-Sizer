export type BodyType = 'sedan' | 'hatchback' | 'suv' | 'truck' | 'coupe'

export interface CarSourceImage {
  /** Wikimedia Commons file name, e.g. "Honda Civic Hybrid (side view).jpg" */
  commonsFileName: string
  author: string
  license: string
  sourceUrl: string
}

export interface CarModel {
  id: string
  make: string
  model: string
  trim?: string
  year: number
  bodyType: BodyType
  lengthMm: number
  widthMm: number
  heightMm: number
  /** Wikidata entity ID (e.g. "Q1435218"), used for the live dimension cross-check. */
  wikidataId?: string
  /** Which side of the source photo the car's front bumper/nose is on. */
  facing: 'left' | 'right'
  /** Source photo used to derive the real side-profile silhouette (build-time only). */
  sourceImage: CarSourceImage
}
