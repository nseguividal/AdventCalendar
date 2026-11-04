export interface PhotoItem {
  id?: string
  title?: string
  imageUrl: string
  options: string[]
  correctPerson: string
  hint?: string
}

export interface PhotoVotingConfig {
  title?: string
  photos?: PhotoItem[]
  // Compatibilitat retroactiva per a una sola foto:
  imageUrl?: string
  options?: string[]
  correctPerson?: string
  hint?: string
}
