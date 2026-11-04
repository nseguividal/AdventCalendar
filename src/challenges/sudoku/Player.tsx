'use client'

import { useState, useMemo, useEffect } from 'react'
import type { ChallengePlayerProps } from '../types'
import type { SudokuConfig } from './types'
import { Sparkles, HelpCircle, RotateCcw, Eraser } from 'lucide-react'

const DEFAULT_SYMBOLS = ['🎄', '⭐', '🎁', '🔔']

const DEFAULT_INITIAL_GRID: (number | null)[][] = [
  [0, null, 2, null],
  [null, 3, null, 1],
  [1, null, 3, null],
  [null, 2, null, 0],
]

const DEFAULT_SOLUTION_GRID: number[][] = [
  [0, 1, 2, 3],
  [2, 3, 0, 1],
  [1, 0, 3, 2],
  [3, 2, 1, 0],
]

export function SudokuPlayer({
  config,
  isAlreadySolved,
  onSuccess,
}: ChallengePlayerProps<SudokuConfig>) {
  const symbols = useMemo(() => {
    return config.symbols && config.symbols.length === 4 ? config.symbols : DEFAULT_SYMBOLS
  }, [config.symbols])

  const initialGrid = useMemo(() => {
    return config.initialGrid || DEFAULT_INITIAL_GRID
  }, [config.initialGrid])

  const solutionGrid = useMemo(() => {
    return config.solutionGrid || DEFAULT_SOLUTION_GRID
  }, [config.solutionGrid])

  const [currentGrid, setCurrentGrid] = useState<(number | null)[][]>(() => {
    if (isAlreadySolved) {
      return solutionGrid.map((row) => [...row])
    }
    return initialGrid.map((row) => [...row])
  })

  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null)
  const [isWon, setIsWon] = useState(isAlreadySolved)
  const [showHint, setShowHint] = useState(false)

  // Identificar si una casella és inicial fixa
  const isCellFixed = (r: number, c: number) => {
    return initialGrid[r][c] !== null
  }

  // Detectar conflictes a la graella (duplicats a fila, columna o quadrant de 2x2)
  const conflicts = useMemo(() => {
    const conflictSet = new Set<string>()

    // Comprovar files
    for (let r = 0; r < 4; r++) {
      const seen = new Map<number, number>()
      for (let c = 0; c < 4; c++) {
        const val = currentGrid[r][c]
        if (val !== null) {
          if (seen.has(val)) {
            conflictSet.add(`${r},${c}`)
            conflictSet.add(`${r},${seen.get(val)}`)
          } else {
            seen.set(val, c)
          }
        }
      }
    }

    // Comprovar columnes
    for (let c = 0; c < 4; c++) {
      const seen = new Map<number, number>()
      for (let r = 0; r < 4; r++) {
        const val = currentGrid[r][c]
        if (val !== null) {
          if (seen.has(val)) {
            conflictSet.add(`${r},${c}`)
            conflictSet.add(`${seen.get(val)},${c}`)
          } else {
            seen.set(val, r)
          }
        }
      }
    }

    // Comprovar quadrants 2x2
    const blocks = [
      [0, 0],
      [0, 2],
      [2, 0],
      [2, 2],
    ]
    for (const [startR, startC] of blocks) {
      const seen = new Map<number, string>()
      for (let dr = 0; dr < 2; dr++) {
        for (let dc = 0; dc < 2; dc++) {
          const r = startR + dr
          const c = startC + dc
          const val = currentGrid[r][c]
          if (val !== null) {
            if (seen.has(val)) {
              conflictSet.add(`${r},${c}`)
              conflictSet.add(seen.get(val)!)
            } else {
              seen.set(val, `${r},${c}`)
            }
          }
        }
      }
    }

    return conflictSet
  }, [currentGrid])

  // Comprovar si s'ha completat amb èxit
  useEffect(() => {
    if (isWon || isAlreadySolved) return

    // Comprovar si totes les caselles estan plenes
    let allFilled = true
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentGrid[r][c] === null) {
          allFilled = false
          break
        }
      }
      if (!allFilled) break
    }

    if (allFilled && conflicts.size === 0) {
      setIsWon(true)
      onSuccess()
    }
  }, [currentGrid, conflicts.size, isWon, isAlreadySolved, onSuccess])

  const handleSelectCell = (r: number, c: number) => {
    if (isWon) return
    if (isCellFixed(r, c)) return
    setSelectedCell({ r, c })
  }

  const handlePutSymbol = (symbolIdx: number) => {
    if (!selectedCell || isWon) return
    const { r, c } = selectedCell

    const next = currentGrid.map((row) => [...row])
    next[r][c] = symbolIdx
    setCurrentGrid(next)
  }

  const handleClearCell = () => {
    if (!selectedCell || isWon) return
    const { r, c } = selectedCell

    const next = currentGrid.map((row) => [...row])
    next[r][c] = null
    setCurrentGrid(next)
  }

  const handleReset = () => {
    setCurrentGrid(initialGrid.map((row) => [...row]))
    setSelectedCell(null)
    setIsWon(false)
  }

  return (
    <div className="space-y-3.5 max-w-xs mx-auto select-none">
      {/* Títol */}
      <div className="text-center">
        <h4 className="text-sm font-bold text-[#0f4437]">
          {config.title || 'Mini Sudoku de Nadal'}
        </h4>
        <p className="text-[11px] text-[#7e7368] mt-0.5">
          {isWon
            ? '✨ Sudoku completat correctament!'
            : 'Omple la graella sense repetir cap símbol per fila, columna ni bloc de 2×2'}
        </p>
      </div>

      {/* Pista opcional */}
      {config.hint && !isWon && (
        <div className="text-center">
          {!showHint ? (
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="inline-flex items-center gap-1 text-[11px] text-[#248896] hover:underline font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Necessites una pista?
            </button>
          ) : (
            <div className="rounded-lg bg-[#248896]/10 border border-[#248896]/20 py-1 px-2.5 text-[11px] text-[#248896] font-medium animate-in fade-in">
              💡 {config.hint}
            </div>
          )}
        </div>
      )}

      {/* Graella 4x4 */}
      <div className="relative mx-auto w-64 h-64 bg-white rounded-2xl border-2 border-[#0f4437] shadow-sm grid grid-cols-4 grid-rows-4 overflow-hidden p-1 gap-1">
        {currentGrid.map((row, r) =>
          row.map((val, c) => {
            const isFixed = isCellFixed(r, c)
            const isSelected = selectedCell?.r === r && selectedCell?.c === c
            const hasConflict = conflicts.has(`${r},${c}`)

            // Delimitadors més gruixuts per als 4 quadrants de 2x2
            const borderBottom = r === 1 ? 'border-b-2 border-b-[#0f4437]' : ''
            const borderRight = c === 1 ? 'border-r-2 border-r-[#0f4437]' : ''

            return (
              <button
                key={`${r}-${c}`}
                type="button"
                disabled={isFixed || isWon}
                onClick={() => handleSelectCell(r, c)}
                className={`relative flex items-center justify-center rounded-xl text-2xl transition-all ${borderBottom} ${borderRight} ${
                  isFixed
                    ? 'bg-[#f4ede3] text-[#2c2825] font-black cursor-default'
                    : isSelected
                    ? 'bg-[#248896]/15 ring-2 ring-[#248896] scale-102 z-10'
                    : hasConflict
                    ? 'bg-red-50 ring-1 ring-red-400'
                    : 'bg-[#faf6f2] hover:bg-[#f5ede3] active:scale-95'
                }`}
              >
                {val !== null ? symbols[val] : ''}
              </button>
            )
          })
        )}
      </div>

      {/* Selector de Símbols Inferior */}
      {!isWon && (
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-4 gap-2">
            {symbols.map((sym, idx) => (
              <button
                key={idx}
                type="button"
                disabled={!selectedCell}
                onClick={() => handlePutSymbol(idx)}
                className="h-11 rounded-xl border border-[#d8cdbf] bg-white hover:bg-[#faf6f2] active:scale-95 text-2xl flex items-center justify-center transition shadow-2xs disabled:opacity-40"
              >
                {sym}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              disabled={!selectedCell}
              onClick={handleClearCell}
              className="flex-1 py-1 px-2.5 rounded-lg border border-[#d8cdbf] bg-white text-[11px] font-bold text-[#7e7368] hover:bg-gray-50 flex items-center justify-center gap-1 transition disabled:opacity-40"
            >
              <Eraser className="w-3.5 h-3.5" /> Buidar casella
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="py-1 px-2.5 rounded-lg border border-[#d8cdbf] bg-white text-[11px] font-bold text-[#b91c1c] hover:bg-red-50 flex items-center justify-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" /> Reiniciar
            </button>
          </div>
        </div>
      )}

      {/* Estat de victòria */}
      {isWon && (
        <div className="rounded-xl bg-[#0f4437]/10 border border-[#0f4437]/20 p-2.5 text-center text-xs font-bold text-[#0f4437] flex items-center justify-center gap-1.5 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-[#c89332]" />
          <span>Molt bé! Has resolt el Sudoku de Nadal!</span>
        </div>
      )}
    </div>
  )
}

