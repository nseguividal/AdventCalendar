'use client'

import type { ChallengeEditorProps } from '../types'
import type { WordleConfig } from './types'

export function WordleEditor({
  config,
  onChange,
}: ChallengeEditorProps<WordleConfig>) {
  const targetWord = config.targetWord || 'NADAL'
  const maxAttempts = config.maxAttempts || 6
  const title = config.title || ''
  const hint = config.hint || ''

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-[#0f4437] uppercase tracking-wider mb-1">
          Paraula Secreta (en majúscules)
        </label>
        <input
          type="text"
          value={targetWord}
          onChange={(e) =>
            onChange({
              ...config,
              targetWord: e.target.value.toUpperCase().trim(),
            })
          }
          placeholder="Ex: NADAL, ESTEL, REGAL, PASTORET"
          className="w-full rounded-xl border border-[#d8cdbf] bg-white px-3.5 py-2 text-sm uppercase font-mono tracking-widest text-[#2c2825] focus:border-[#0f4437] focus:outline-none"
        />
        <p className="text-[11px] text-[#7e7368] mt-1">
          La paraula pot tenir entre 3 i 8 lletres (la mida habitual del Wordle són 5 lletres).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-[#0f4437] uppercase tracking-wider mb-1">
            Nombre d'intents màxims
          </label>
          <select
            value={maxAttempts}
            onChange={(e) =>
              onChange({
                ...config,
                maxAttempts: Number(e.target.value),
              })
            }
            className="w-full rounded-xl border border-[#d8cdbf] bg-white px-3.5 py-2 text-xs text-[#2c2825] focus:border-[#0f4437] focus:outline-none"
          >
            <option value={4}>4 intents (Molt difícil)</option>
            <option value={5}>5 intents (Difícil)</option>
            <option value={6}>6 intents (Estàndard)</option>
            <option value={7}>7 intents (Fàcil)</option>
            <option value={8}>8 intents (Molt fàcil)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0f4437] uppercase tracking-wider mb-1">
            Títol personalitzat (opcional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) =>
              onChange({
                ...config,
                title: e.target.value,
              })
            }
            placeholder="Ex: Paraula secreta del dia"
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
          onChange={(e) =>
            onChange({
              ...config,
              hint: e.target.value,
            })
          }
          placeholder="Ex: És una tradició dolça que mengem després del dinar..."
          className="w-full rounded-xl border border-[#d8cdbf] bg-white px-3.5 py-2 text-xs text-[#2c2825] focus:border-[#0f4437] focus:outline-none"
        />
      </div>
    </div>
  )
}

