export interface SudokuConfig {
  title?: string
  symbols?: string[] // default ['🎄', '⭐', '🎁', '🔔']
  initialGrid?: (number | null)[][] // 4x4 matrix with 0, 1, 2, 3 or null
  solutionGrid?: number[][] // 4x4 complete solution
  hint?: string
}

