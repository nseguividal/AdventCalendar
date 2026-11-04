export type MemoryCardCount = 6 | 8 | 12 | 24

export interface MemoryConfig {
  title?: string
  totalCards?: MemoryCardCount // 6, 8, 12 o 24 caselles
  pairCount?: number // Retrocompatibilitat: parelles = totalCards / 2
}
