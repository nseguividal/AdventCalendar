'use client'

import type { ChallengeEditorProps } from '../types'
import type { CatchGiftsConfig } from './types'

export function CatchGiftsEditor({
  config,
  onChange,
}: ChallengeEditorProps<CatchGiftsConfig>) {
  const title = config.title || ''
  const targetScore = config.targetScore ?? 8
  const durationSeconds = config.durationSeconds ?? 20
  const speed = config.speed || 'normal'

  return (
    <div className="space-y-3.5">
      <div>
        <label className="block text-xs font-bold text-[#0f4437] uppercase tracking-wider mb-1">
          Títol del joc (opcional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          placeholder="Ex: Atrapa els regals de Nadal!"
          className="w-full rounded-xl border border-[#d8cdbf] bg-white px-3 py-1.5 text-xs text-[#2c2825] focus:border-[#0f4437] focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-[#0f4437] uppercase tracking-wider mb-1">
            Regals necessaris per guanyar
          </label>
          <input
            type="number"
            min={4}
            max={20}
            value={targetScore}
            onChange={(e) =>
              onChange({
                ...config,
                targetScore: Math.max(3, Math.min(25, parseInt(e.target.value) || 8)),
              })
            }
            className="w-full rounded-xl border border-[#d8cdbf] bg-white px-3 py-1.5 text-xs text-[#2c2825] focus:border-[#0f4437] focus:outline-none"
          />
          <p className="text-[10px] text-[#7e7368] mt-0.5">Recomanat: entre 6 i 10 regals</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0f4437] uppercase tracking-wider mb-1">
            Temps límit (segons)
          </label>
          <input
            type="number"
            min={10}
            max={60}
            value={durationSeconds}
            onChange={(e) =>
              onChange({
                ...config,
                durationSeconds: Math.max(10, Math.min(90, parseInt(e.target.value) || 20)),
              })
            }
            className="w-full rounded-xl border border-[#d8cdbf] bg-white px-3 py-1.5 text-xs text-[#2c2825] focus:border-[#0f4437] focus:outline-none"
          />
          <p className="text-[10px] text-[#7e7368] mt-0.5">Recomanat: 20 segons</p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#0f4437] uppercase tracking-wider mb-1">
          Velocitat de caiguda
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'easy', label: 'Tranquil (Fàcil)' },
            { id: 'normal', label: 'Estàndard' },
            { id: 'hard', label: 'Ràpid (Repte)' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange({ ...config, speed: item.id as any })}
              className={`py-1.5 px-2 rounded-xl border text-xs font-bold transition text-center ${
                speed === item.id
                  ? 'bg-[#0f4437] text-white border-[#0f4437]'
                  : 'bg-white text-[#524a42] border-[#d8cdbf] hover:bg-[#faf6f2]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

