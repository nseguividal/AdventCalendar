export interface WordPlacement {
  word: string
  cells: { r: number; c: number }[]
}

export interface GeneratedGrid {
  matrix: string[][]
  placements: WordPlacement[]
  words: string[]
}

const CATALAN_LETTERS = 'ABCDEFGHIJLMNOPQRSTUVXYZ'

export function generateWordSearch(
  rawWords: string[],
  size: number = 8
): GeneratedGrid {
  // Normalitzar paraules (majúscules, sense accents ni espais)
  const normalizedWords = rawWords
    .map((w) =>
      w
        .trim()
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z]/g, '')
    )
    .filter((w) => w.length >= 2 && w.length <= size)

  // Inicialitzar matriu buida
  const matrix: string[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => '')
  )

  const placements: WordPlacement[] = []

  // Direccions: dreta, avall, diagonal avall-dreta
  const directions = [
    { dr: 0, dc: 1 }, // Horitzontal
    { dr: 1, dc: 0 }, // Vertical
    { dr: 1, dc: 1 }, // Diagonal
  ]

  for (const word of normalizedWords) {
    let placed = false
    let attempts = 0

    while (!placed && attempts < 100) {
      attempts++
      const dir = directions[Math.floor(Math.random() * directions.length)]
      const maxR = size - (word.length - 1) * dir.dr
      const maxC = size - (word.length - 1) * dir.dc

      if (maxR <= 0 || maxC <= 0) continue

      const startR = Math.floor(Math.random() * maxR)
      const startC = Math.floor(Math.random() * maxC)

      // Comprovar si hi cap sense col·lisions
      let canPlace = true
      for (let i = 0; i < word.length; i++) {
        const r = startR + i * dir.dr
        const c = startC + i * dir.dc
        const currentLetter = matrix[r][c]
        if (currentLetter !== '' && currentLetter !== word[i]) {
          canPlace = false
          break
        }
      }

      if (canPlace) {
        const cells: { r: number; c: number }[] = []
        for (let i = 0; i < word.length; i++) {
          const r = startR + i * dir.dr
          const c = startC + i * dir.dc
          matrix[r][c] = word[i]
          cells.push({ r, c })
        }
        placements.push({ word, cells })
        placed = true
      }
    }
  }

  // Omplir els buits amb lletres aleatòries
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === '') {
        matrix[r][c] =
          CATALAN_LETTERS[Math.floor(Math.random() * CATALAN_LETTERS.length)]
      }
    }
  }

  return {
    matrix,
    placements,
    words: placements.map((p) => p.word),
  }
}

