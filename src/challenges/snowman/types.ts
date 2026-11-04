export interface SnowmanWordItem {
  word: string
  hint?: string
}

export interface SnowmanConfig {
  word?: string
  words?: (string | SnowmanWordItem)[]
  title?: string
  hint?: string
  maxErrors?: number
}

