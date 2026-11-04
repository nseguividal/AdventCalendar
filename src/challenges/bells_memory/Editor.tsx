'use client'

import type { ChallengeEditorProps } from '../types'
import type { BellsMemoryConfig } from './types'

export function BellsMemoryEditor({
  config,
  onChange,
}: ChallengeEditorProps<BellsMemoryConfig>) {
  const title = config.title || ''
  const rounds = config.rounds ?? 4
  const hint = config.hint || ''

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
          placeholder="Ex: Repeteix la melodia de les campanes"
          className="w-full rounded-xl border border-[#d8cdbf] bg-white px-3 py-1.5 text-xs text-[#2c2825] focus:border-[#0f4437] focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-[#0f4437] uppercase tracking-wider mb-1">
          Longitud de la melodia a recordar
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[3, 4, 5, 6].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onChange({ ...config, rounds: num })}
              className={`py-1.5 px-2 rounded-xl border text-xs font-bold transition text-center ${
                rounds === num
                  ? 'bg-[#0f4437] text-white border-[#0f4437]'
                  : 'bg-white text-[#524a42] border-[#d8cdbf] hover:bg-[#faf6f2]'
              }`}
            >
              {num} tocs
            </button>
          ))}
        </div>
        <p className="text-[10px] text-[#7e7368] mt-1">
          Recomanat: 4 tocs (ràpid i divertit per a totes les edats).
        </p>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#0f4437] uppercase tracking-wider mb-1">
          Pista opcional
        </label>
        <input
          type="text"
          value={hint}
          onChange={(e) => onChange({ ...config, hint: e.target.value })}
          placeholder="Ex: Escolta atentament els tons de cada campana..."
          className="w-full rounded-xl border border-[#d8cdbf] bg-white px-3 py-1.5 text-xs text-[#2c2825] focus:border-[#0f4437] focus:outline-none"
        />
      </div>
    </div>
  )
}

