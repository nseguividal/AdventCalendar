'use client'

import type { ChallengeEditorProps } from '../types'
import type { MemoryConfig, MemoryCardCount } from './types'

export function MemoryEditor({
  config,
  onChange,
}: ChallengeEditorProps<MemoryConfig>) {
  const currentTotal: MemoryCardCount =
    config.totalCards ||
    (config.pairCount ? ((config.pairCount * 2) as MemoryCardCount) : 12)

  const handleTotalCardsChange = (val: number) => {
    const total = val as MemoryCardCount
    onChange({
      ...config,
      totalCards: total,
      pairCount: total / 2,
    })
  }

  return (
    <div className="space-y-3">
      {/* Títol */}
      <div>
        <label className="block text-[11px] font-semibold text-[#6e6358] uppercase tracking-wider mb-1">
          Instrucció o títol del joc
        </label>
        <input
          type="text"
          value={config.title || ''}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          placeholder="p. ex. Troba les parelles nadalenques"
          className="w-full px-3 py-1.5 bg-white border border-[#d8cdbf] rounded-xl text-[#2c2825] placeholder-[#9c9184] text-xs focus:outline-none focus:ring-2 focus:ring-[#0f4437]/15 focus:border-[#0f4437]"
        />
      </div>

      {/* Selector de caselles: 6, 8, 12 o 24 */}
      <div>
        <label className="block text-[11px] font-semibold text-[#6e6358] uppercase tracking-wider mb-1">
          Nombre de caselles
        </label>
        <select
          value={currentTotal}
          onChange={(e) => handleTotalCardsChange(Number(e.target.value))}
          className="w-full px-3 py-1.5 bg-white border border-[#d8cdbf] rounded-xl text-[#2c2825] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0f4437]/15 focus:border-[#0f4437]"
        >
          <option value={6}>6 caselles (3 parelles - Ràpid i senzill)</option>
          <option value={8}>8 caselles (4 parelles - Fàcil)</option>
          <option value={12}>12 caselles (6 parelles - Recomanat per a mòbil)</option>
          <option value={24}>24 caselles (12 parelles - Gran desafiament nadalenc)</option>
        </select>
        <p className="text-[10px] text-[#7e7368] mt-1">
          Les cartes s'omplen i barregen automàticament amb motius nadalencs (arbres, ninots de neu, regals, tió, espelmes...).
        </p>
      </div>
    </div>
  )
}
