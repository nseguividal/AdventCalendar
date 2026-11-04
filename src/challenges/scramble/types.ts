export interface ScrambleWordItem {
  id?: string
  word: string
  hint?: string
}

export interface ScrambleConfig {
  title?: string
  words?: ScrambleWordItem[]
  // Compatibilitat retroactiva per a una sola paraula:
  word?: string
  hint?: string
}

