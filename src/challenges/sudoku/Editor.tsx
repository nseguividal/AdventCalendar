'use client'

import type { ChallengeEditorProps } from '../types'
import type { SudokuConfig } from './types'

const PRESET_SYMBOLS = ['🎄', '⭐', '🎁', '🔔']

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

export function SudokuEditor({
  config,
  onChange,
}: ChallengeEditorProps<SudokuConfig>) {
  const title = config.title || ''
  const symbols = config.symbols && config.symbols.length === 4 ? config.symbols : PRESET_SYMBOLS
  const hint = config.hint || ''

  const handleSymbolChange = (index: number, val: string) => {
    const updated = [...symbols]
    updated[index] = val || PRESET_SYMBOLS[index]
    onChange({
      ...config,
      symbols: updated,
    })
  }

  const handleResetPreset = () => {
    onChange({
      ...config,
      symbols: PRESET_SYMBOLS,
      initialGrid: DEFAULT_INITIAL_GRID,
      solutionGrid: DEFAULT_SOLUTION_GRID,
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-[#0f4437] uppercase tracking-wider mb-1">
          Títol del joc (opcional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          placeholder="Ex: Mini Sudoku de Nadal"
          className="w-full rounded-xl border border-[#d8cdbf] bg-white px-3 py-1.5 text-xs text-[#2c2825] focus:border-[#0f4437] focus:outline-none"
        />
      </div>

      {/* Símbols utilitzats */}
      <div>
        <label className="block text-xs font-bold text-[#0f4437] uppercase tracking-wider mb-1">
          Els 4 símbols nadalencs del Sudoku
        </label>
        <div className="grid grid-cols-4 gap-2">
          {symbols.map((sym, i) => (
            <div key={i} className="text-center">
              <input
                type="text"
                value={sym}
                onChange={(e) => handleSymbolChange(i, e.target.value)}
                maxLength={2}
                className="w-full text-center text-lg p-1.5 rounded-xl border border-[#d8cdbf] bg-white focus:border-[#0f4437] focus:outline-none"
              />
              <span className="text-[10px] text-[#7e7368]">Símbol {i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#0f4437] uppercase tracking-wider mb-1">
          Pista opcional
        </label>
        <input
          type="text"
          value={hint}
          onChange={(e) => onChange({ ...config, hint: e.target.value })}
          placeholder="Ex: Cap símbol es pot repetir a la mateixa fila, columna ni quadrat de 2x2..."
          className="w-full rounded-xl border border-[#d8cdbf] bg-white px-3 py-1.5 text-xs text-[#2c2825] focus:border-[#0f4437] focus:outline-none"
        />
      </div>

      <div className="pt-1">
        <button
          type="button"
          onClick={handleResetPreset}
          className="text-xs font-bold text-[#0f4437] hover:underline"
        >
          ↻ Restablir tauler predeterminat equilibrat (4×4)
        </button>
      </div>
    </div>
  )
}

