'use client'

import { useState, useEffect, useMemo } from 'react'
import type { ChallengePlayerProps } from '../types'
import type { WordSearchConfig } from './types'
import { generateWordSearch } from './generator'
import { Sparkles, Check, RotateCcw } from 'lucide-react'

export function WordSearchPlayer({
  config,
  isAlreadySolved,
  onSuccess,
}: ChallengePlayerProps<WordSearchConfig>) {
  const rawWords = useMemo(
    () => (config.words && config.words.length > 0 ? config.words : ['NADAL', 'TIO', 'NEU']),
    [config.words]
  )
  const size = config.gridSize || 8

  // Generar la graella un cop
  const generated = useMemo(
    () => generateWordSearch(rawWords, size),
    [rawWords, size]
  )

  const [selectedCells, setSelectedCells] = useState<{ r: number; c: number }[]>([])
  const [foundWords, setFoundWords] = useState<string[]>(
    isAlreadySolved ? generated.words : []
  )
  const [foundCellKeys, setFoundCellKeys] = useState<Set<string>>(() => {
    if (isAlreadySolved) {
      const allKeys = new Set<string>()
      generated.placements.forEach((p) => {
        p.cells.forEach((cell) => allKeys.add(`${cell.r}-${cell.c}`))
      })
      return allKeys
    }
    return new Set<string>()
  })

  // Paraula actual formada per la selecció
  const currentWord = selectedCells
    .map(({ r, c }) => generated.matrix[r]?.[c] || '')
    .join('')

  // Comprovar si la selecció coincideix amb alguna de les paraules
  useEffect(() => {
    if (isAlreadySolved || !currentWord) return

    // Comprovar si les cel·les seleccionades formen una línia recta consecutiva
    const isConsecutiveLine = (cells: { r: number; c: number }[]) => {
      if (cells.length <= 1) return true
      const dr = Math.sign(cells[1].r - cells[0].r)
      const dc = Math.sign(cells[1].c - cells[0].c)
      if (dr === 0 && dc === 0) return false

      for (let i = 1; i < cells.length; i++) {
        if (
          cells[i].r !== cells[i - 1].r + dr ||
          cells[i].c !== cells[i - 1].c + dc
        ) {
          return false
        }
      }
      return true
    }

    if (!isConsecutiveLine(selectedCells)) return

    const matchedWord = generated.words.find(
      (w) =>
        !foundWords.includes(w) &&
        (w === currentWord || w === currentWord.split('').reverse().join(''))
    )

    if (matchedWord) {
      const newFoundWords = [...foundWords, matchedWord]
      setFoundWords(newFoundWords)

      // Encerclar EXACTAMENT les cel·les que el jugador ha clicat a la graella,
      // no les cel·les teòriques del generador:
      setFoundCellKeys((prev) => {
        const next = new Set(prev)
        selectedCells.forEach((cell) => next.add(`${cell.r}-${cell.c}`))
        return next
      })

      // Netejar la selecció activa
      setSelectedCells([])

      // Si s'han trobat totes les paraules
      if (newFoundWords.length === generated.words.length) {
        onSuccess()
      }
    }
  }, [currentWord, selectedCells, generated, foundWords, isAlreadySolved, onSuccess])

  const handleCellClick = (r: number, c: number) => {
    if (isAlreadySolved) return

    const alreadyIndex = selectedCells.findIndex((cell) => cell.r === r && cell.c === c)
    if (alreadyIndex !== -1) {
      // Si clica l'última lletra seleccionada, la desmarca
      if (alreadyIndex === selectedCells.length - 1) {
        setSelectedCells(selectedCells.slice(0, -1))
        return
      }
      // Si clica una anterior, retalla fins allà
      setSelectedCells(selectedCells.slice(0, alreadyIndex + 1))
      return
    }

    // Afegir la nova cel·la
    setSelectedCells([...selectedCells, { r, c }])
  }

  const handleClearSelection = () => {
    setSelectedCells([])
  }

  const isComplete = foundWords.length === generated.words.length

  const containerMaxWidth =
    size >= 16
      ? 'max-w-[360px] sm:max-w-[450px]'
      : size >= 10
      ? 'max-w-[350px] sm:max-w-[400px]'
      : 'max-w-[340px] sm:max-w-[380px]'

  const gridGap = size >= 16 ? 'gap-0.5 sm:gap-1' : size >= 10 ? 'gap-0.5 sm:gap-1' : 'gap-1 sm:gap-1.5'

  const cellTextSize =
    size >= 16
      ? 'text-[10px] sm:text-xs font-black'
      : size >= 10
      ? 'text-xs sm:text-sm font-bold'
      : 'text-xs sm:text-sm font-bold'

  const cellRounded =
    size >= 16
      ? 'rounded-xs sm:rounded-sm'
      : size >= 10
      ? 'rounded-md sm:rounded-lg'
      : 'rounded-lg sm:rounded-xl'

  return (
    <div className="space-y-4">
      {/* Títol i llistat de paraules a buscar */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#6e6358] mb-2 text-center">
          {config.title || 'Troba les paraules nadalenques:'}
        </p>

        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
          {generated.words.map((w) => {
            const isFound = foundWords.includes(w)
            return (
              <span
                key={w}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                  isFound
                    ? 'bg-[#0f4437] text-white line-through shadow-xs'
                    : 'bg-[#f5ede3] text-[#0f4437] border border-[#e4d6c4]'
                }`}
              >
                {isFound && <Check className="w-3 h-3 stroke-[3]" />}
                {w}
              </span>
            )
          })}
        </div>
      </div>

      {/* Paraula en curs de selecció */}
      <div className="flex items-center justify-between px-2 text-xs">
        <span className="text-[#6e6358]">
          Selecció:{' '}
          <strong className="text-[#0f4437] tracking-wider text-sm">
            {currentWord || '—'}
          </strong>
        </span>

        {selectedCells.length > 0 && !isComplete && (
          <button
            type="button"
            onClick={handleClearSelection}
            className="inline-flex items-center gap-1 text-[11px] text-[#b91c1c] hover:underline font-medium"
          >
            <RotateCcw className="w-3 h-3" /> Netejar
          </button>
        )}
      </div>

      {/* Graella de la Sopa de Lletres */}
      <div className={`mx-auto w-full ${containerMaxWidth} p-2 rounded-2xl bg-[#f5ede3]/70 border border-[#e4d6c4] shadow-xs`}>
        <div
          className={`grid ${gridGap} aspect-square`}
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          }}
        >
          {generated.matrix.map((row, r) =>
            row.map((letter, c) => {
              const cellKey = `${r}-${c}`
              const isFound = foundCellKeys.has(cellKey)
              const isSelected = selectedCells.some(
                (cell) => cell.r === r && cell.c === c
              )

              return (
                <button
                  key={cellKey}
                  type="button"
                  onClick={() => handleCellClick(r, c)}
                  disabled={isAlreadySolved}
                  className={`flex items-center justify-center ${cellTextSize} ${cellRounded} transition-all duration-150 select-none ${
                    isFound
                      ? 'bg-[#0f4437] text-white shadow-xs'
                      : isSelected
                      ? 'bg-[#248896] text-white shadow-md scale-105 ring-2 ring-[#248896]'
                      : 'bg-white text-[#2c2825] border border-[#e8dfd3] hover:bg-[#faf6f2] active:scale-95'
                  }`}
                >
                  {letter}
                </button>
              )
            })
          )}
        </div>
      </div>

      {isComplete && !isAlreadySolved && (
        <div className="rounded-xl bg-[#0f4437]/10 border border-[#0f4437]/20 p-2.5 text-center text-xs font-semibold text-[#0f4437] flex items-center justify-center gap-1.5 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#c89332]" />
          <span>Has trobat totes les paraules! Enhorabona!</span>
        </div>
      )}
    </div>
  )
}

