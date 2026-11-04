export interface QuizQuestion {
  id?: string
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
}

export interface QuizConfig {
  title?: string
  questions?: QuizQuestion[]
  // Compatibilitat retroactiva per a quiz d'una sola pregunta:
  question?: string
  options?: string[]
  correctIndex?: number
  explanation?: string
}
