'use client'

import { useState } from 'react'
import type { ChallengeEditorProps } from '../types'
import type { WordSearchConfig } from './types'

export function WordSearchEditor({
  config,
  onChange,
}: ChallengeEditorProps<WordSearchConfig>) {
  const [wordsInput, setWordsInput] = useState(
    (config.words || ['NADAL', 'TIO', 'NEU']).join(', ')
  )

  const handleWordsChange = (val: string) => {
    setWordsInput(val)
    const parsed = val
      .split(',')
      .map((w) => w.trim().toUpperCase())
      .filter((w) => w.length >= 2)
    onChange({
      ...config,
      words: parsed,
    })
  }

  return (
    <div className="space-y-3">
      {/* Títol opcional */}
      <div>
        <label className="block text-[11px] font-semibold text-[#6e6358] uppercase tracking-wider mb-1">
          Títol o instrucció
        </label>
        <input
          type="text"
          value={config.title || ''}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          placeholder="p. ex. Troba les 3 paraules nadalenques"
          className="w-full px-3 py-1.5 bg-white border border-[#d8cdbf] rounded-xl text-[#2c2825] placeholder-[#9c9184] text-xs focus:outline-none focus:ring-2 focus:ring-[#0f4437]/15 focus:border-[#0f4437]"
        />
      </div>

      {/* Paraules a buscar */}
      <div>
        <label className="block text-[11px] font-semibold text-[#6e6358] uppercase tracking-wider mb-1">
          Paraules a amagar (separades per coma)
        </label>
        <input
          type="text"
          value={wordsInput}
          onChange={(e) => handleWordsChange(e.target.value)}
          placeholder="p. ex. NADAL, TIO, NEU, ARBRE"
          className="w-full px-3 py-1.5 bg-white border border-[#d8cdbf] rounded-xl text-[#2c2825] placeholder-[#9c9184] text-xs focus:outline-none focus:ring-2 focus:ring-[#0f4437]/15 focus:border-[#0f4437]"
        />
        <p className="text-[10px] text-[#7e7368] mt-1">
          Recomanat: 3 a 6 paraules (de 3 a 8 lletres per a 8×8/10×10, o més llargues per a 16×16).
        </p>
      </div>

      {/* Mida de la graella */}
      <div>
        <label className="block text-[11px] font-semibold text-[#6e6358] uppercase tracking-wider mb-1">
          Mida de la graella
        </label>
        <select
          value={config.gridSize || 8}
          onChange={(e) =>
            onChange({ ...config, gridSize: Number(e.target.value) })
          }
          className="w-full px-3 py-1.5 bg-white border border-[#d8cdbf] rounded-xl text-[#2c2825] text-xs focus:outline-none focus:ring-2 focus:ring-[#0f4437]/15 focus:border-[#0f4437]"
        >
          <option value={8}>8 × 8 (Ràpida - Ideal per a mòbil)</option>
          <option value={10}>10 × 10 (Mitjana)</option>
          <option value={16}>16 × 16 (Gran - Desafiament complet)</option>
        </select>
      </div>
    </div>
  )
}

