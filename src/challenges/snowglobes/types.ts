export interface GlobeItem {
  id: string
  cityName: string
  cityCode?: string
  imageUrl: string
  monumentName?: string
  hint?: string
}

export interface SnowglobesConfig {
  title?: string
  instructions?: string
  items: GlobeItem[]
  pointsPerHit?: number
  streakBonus?: number
  penalty?: number
}

