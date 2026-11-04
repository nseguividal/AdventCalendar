export type ChallengeType =
  | 'riddle'
  | 'wordsearch'
  | 'quiz'
  | 'photo_voting'
  | 'memory'
  | 'wordle'
  | 'snowman'
  | 'scramble'
  | 'equation'
  | 'snowglobes'
  | 'catch_gifts'
  | 'find_caganer'
  | 'bells_memory'
  | 'pica_tio'
  | 'sudoku'

export interface ChallengePlayerProps<TConfig = any> {
  config: TConfig
  dayNumber: number
  isAlreadySolved: boolean
  onSuccess: (score?: number, total?: number) => void
}

export interface ChallengeEditorProps<TConfig = any> {
  config: TConfig
  onChange: (updated: TConfig) => void
}

export interface ChallengeDefinition<TConfig = any> {
  type: ChallengeType
  name: string
  description: string
  icon: string
  badgeLabel: string
  defaultConfig: TConfig
}

