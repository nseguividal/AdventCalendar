'use client'

import type { ChallengeEditorProps } from '../types'
import type { EquationConfig } from './types'
import { Sparkles } from 'lucide-react'

const PRESETS = [
  {
    name: '🎄 Arbres, Regals i Campanes',
    lines: [
      '🎄 + 🎄 = 10',
      '🎄 + 🎁 = 9',
      '🎁 + 🔔 = 7',
      '🎄 + 🎁 × 🔔 = ?',
    ],
    solution: 17,
    hint: 'Multiplicació abans de suma: 5 + (4 × 3) = 17',
  },
  {
    name: '🎅 Pare Noel, Trineu i Estel',
    lines: [
      '🎅 + 🎅 + 🎅 = 30',
      '🎅 + 🛷 = 20',
      '🛷 - ⭐ = 6',
      '🎅 + 🛷 + ⭐ = ?',
    ],
    solution: 24,
    hint: 'Pare Noel = 10, Trineu = 10, Estel = 4',
  },
  {
    name: '🍬 Bastons de caramel i Galetes',
    lines: [
      '🍬 + 🍬 = 8',
      '🍬 × 🍪 = 20',
      '🍪 - 🥛 = 2',
      '🍬 + 🍪 + 🥛 = ?',
    ],
    solution: 12,
    hint: 'Caramel = 4, Galeta = 5, Llet = 3',
  },
]

export function EquationEditor({
  config,
  onChange,
}: ChallengeEditorProps<EquationConfig>) {
  const lines =
    config.lines && config.lines.length > 0
      ? config.lines
      : PRESETS[0].lines

  const solution = config.solution ?? PRESETS[0].solution
  const title = config.title || ''
  const hint = config.hint || ''

  const handleLinesChange = (text: string) => {
    const rawLines = text.split('\n').filter((l) => l.trim().length > 0)
    onChange({
      ...config,
      lines: rawLines,
    })
  }

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    onChange({
      ...config,
      lines: preset.lines,
      solution: preset.solution,
      hint: preset.hint,
    })
  }

  return (
    <div className="space-y-4">
      {/* Botons ràpids de plantilles */}
      <div>
        <label className="block text-xs font-bold text-[#0f4437] uppercase tracking-wider mb-1.5">
          Carregar plantilla predissenyada
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#d8cdbf] bg-white text-xs font-semibold text-[#2c2825] hover:bg-[#faf6f2] hover:border-[#0f4437] transition shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c89332]" />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#0f4437] uppercase tracking-wider mb-1">
          Línies de l'equació (una per línia)
        </label>
        <textarea
          rows={4}
          value={lines.join('\n')}
          onChange={(e) => handleLinesChange(e.target.value)}
          placeholder="🎄 + 🎄 = 10&#10;🎄 + 🎁 = 9&#10;🎁 + 🔔 = 7&#10;🎄 + 🎁 × 🔔 = ?"
          className="w-full rounded-xl border border-[#d8cdbf] bg-white px-3.5 py-2 text-sm font-mono text-[#2c2825] focus:border-[#0f4437] focus:outline-none"
        />
        <p className="text-[11px] text-[#7e7368] mt-1">
          Pots enganxar qualsevol emoticona (🎄, 🎁, 🔔, 🎅, 🛷, ⛄, ⭐, 🍬, 🍪) i operadors (+, -, ×, =).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-[#0f4437] uppercase tracking-wider mb-1">
            Resultat numèric correcte
          </label>
          <input
            type="number"
            value={solution}
            onChange={(e) =>
              onChange({
                ...config,
                solution: Number(e.target.value),
              })
            }
            placeholder="Ex: 17"
            className="w-full rounded-xl border border-[#d8cdbf] bg-white px-3.5 py-2 text-sm font-mono font-bold text-[#0f4437] focus:border-[#0f4437] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0f4437] uppercase tracking-wider mb-1">
            Títol personalitzat (opcional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onChange({ ...config, title: e.target.value })}
            placeholder="Ex: Enigma Matemàtic de Nadal"
            className="w-full rounded-xl border border-[#d8cdbf] bg-white px-3.5 py-2 text-xs text-[#2c2825] focus:border-[#0f4437] focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#0f4437] uppercase tracking-wider mb-1">
          Pista (opcional)
        </label>
        <input
          type="text"
          value={hint}
          onChange={(e) => onChange({ ...config, hint: e.target.value })}
          placeholder="Ex: Vigila amb l'ordre: primer la multiplicació abans de sumar!"
          className="w-full rounded-xl border border-[#d8cdbf] bg-white px-3.5 py-2 text-xs text-[#2c2825] focus:border-[#0f4437] focus:outline-none"
        />
      </div>
    </div>
  )
}

