'use client'

import type { ChallengeEditorProps } from '../types'
import type { PicaTioConfig } from './types'

export function PicaTioEditor({
  config,
  onChange,
}: ChallengeEditorProps<PicaTioConfig>) {
  const title = config.title || ''
  const hitsRequired = config.hitsRequired ?? 20
  const prizeName = config.prizeName || 'Torrons, neules i xocolata!'
  const verse =
    config.verse ||
    'Caga tió, tió de Nadal, no caguis arengades que són massa salades, caga torrons que són més bons! 🪵🎶'

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
          placeholder="Ex: Pica fort el Tió de Nadal!"
          className="w-full rounded-xl border border-[#d8cdbf] bg-white px-3 py-1.5 text-xs text-[#2c2825] focus:border-[#0f4437] focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-[#0f4437] uppercase tracking-wider mb-1">
            Cops de bastó necessaris
          </label>
          <input
            type="number"
            min={10}
            max={50}
            value={hitsRequired}
            onChange={(e) =>
              onChange({
                ...config,
                hitsRequired: Math.max(10, Math.min(60, parseInt(e.target.value) || 20)),
              })
            }
            className="w-full rounded-xl border border-[#d8cdbf] bg-white px-3 py-1.5 text-xs text-[#2c2825] focus:border-[#0f4437] focus:outline-none"
          />
          <p className="text-[10px] text-[#7e7368] mt-0.5">Recomanat: 20 cops</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0f4437] uppercase tracking-wider mb-1">
            Què caga el Tió?
          </label>
          <input
            type="text"
            value={prizeName}
            onChange={(e) => onChange({ ...config, prizeName: e.target.value })}
            placeholder="Ex: Torrons i neules!"
            className="w-full rounded-xl border border-[#d8cdbf] bg-white px-3 py-1.5 text-xs text-[#2c2825] focus:border-[#0f4437] focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#0f4437] uppercase tracking-wider mb-1">
          Cançó del Tió
        </label>
        <textarea
          rows={2}
          value={verse}
          onChange={(e) => onChange({ ...config, verse: e.target.value })}
          className="w-full rounded-xl border border-[#d8cdbf] bg-white px-3 py-1.5 text-xs text-[#2c2825] focus:border-[#0f4437] focus:outline-none"
        />
      </div>
    </div>
  )
}

