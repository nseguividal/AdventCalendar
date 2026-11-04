export type WordSearchGridSize = 8 | 10 | 16

export interface WordSearchConfig {
  title?: string
  words: string[]
  gridSize?: WordSearchGridSize | number
}
