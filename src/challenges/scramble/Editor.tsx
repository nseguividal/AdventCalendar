'use client'

import type { ChallengeEditorProps } from '../types'
import type { ScrambleConfig, ScrambleWordItem } from './types'
import { Plus, Trash2 } from 'lucide-react'

export function ScrambleEditor({
  config,
  onChange,
}: ChallengeEditorProps<ScrambleConfig>) {
  const wordsList: ScrambleWordItem[] =
    config.words && config.words.length > 0
      ? config.words
      : config.word
      ? [{ word: config.word, hint: config.hint }]
      : [
          { word: 'NADAL', hint: "L'època més màgica de l'any" },
          { word: 'ESTEL', hint: "Brilla al cel de la nit de Nadal" },
        ]

  const title = config.title || ''

  const handleUpdateWord = (
    index: number,
    field: keyof ScrambleWordItem,
    value: string
  ) => {
    const updated = wordsList.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          [field]: field === 'word' ? value.toUpperCase().trim() : value,
        }
      }
      return item
    })
    onChange({
      ...config,
      words: updated,
      word: updated[0]?.word || '',
      hint: updated[0]?.hint || '',
    })
  }

  const handleAddWord = () => {
    const updated = [
      ...wordsList,
      { word: 'REGAL', hint: 'Embolicat amb un llaç sota l\'arbre' },
    ]
    onChange({
      ...config,
      words: updated,
    })
  }

  const handleRemoveWord = (index: number) => {
    if (wordsList.length <= 1) return
    const updated = wordsList.filter((_, i) => i !== index)
    onChange({
      ...config,
      words: updated,
      word: updated[0]?.word || '',
      hint: updated[0]?.hint || '',
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-[#0f4437] uppercase tracking-wider mb-1">
          Títol del repte (opcional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          placeholder="Ex: Lletres desordenades de Nadal"
          className="w-full rounded-xl border border-[#d8cdbf] bg-white px-3.5 py-2 text-xs text-[#2c2825] focus:border-[#0f4437] focus:outline-none"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-[#0f4437] uppercase tracking-wider">
            Paraules a ordenar ({wordsList.length})
          </label>
          <button
            type="button"
            onClick={handleAddWord}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#248896] hover:text-[#185e4d] transition"
          >
            <Plus className="w-3.5 h-3.5" /> Afegir paraula
          </button>
        </div>

        {wordsList.map((item, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-[#e8dfd3] bg-[#faf6f2] p-3.5 space-y-2.5 relative"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0f4437]">
                Paraula {idx + 1}
              </span>
              {wordsList.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveWord(idx)}
                  className="text-red-500 hover:text-red-700 transition p-1"
                  title="Eliminar paraula"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#6e6358] mb-1">
                  Paraula (en majúscules)
                </label>
                <input
                  type="text"
                  value={item.word}
                  onChange={(e) => handleUpdateWord(idx, 'word', e.target.value)}
                  placeholder="Ex: NADAL, PASTORET"
                  className="w-full rounded-xl border border-[#d8cdbf] bg-white px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-[#2c2825] focus:border-[#0f4437] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6e6358] mb-1">
                  Pista per a aquesta paraula (opcional)
                </label>
                <input
                  type="text"
                  value={item.hint || ''}
                  onChange={(e) => handleUpdateWord(idx, 'hint', e.target.value)}
                  placeholder="Ex: Neix a Betlem..."
                  className="w-full rounded-xl border border-[#d8cdbf] bg-white px-3 py-1.5 text-xs text-[#2c2825] focus:border-[#0f4437] focus:outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

