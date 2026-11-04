'use client'

import { useState } from 'react'
import type { ChallengeEditorProps } from '../types'
import type { FindCaganerConfig } from './types'
import { MapPin, HelpCircle } from 'lucide-react'

export function FindCaganerEditor({
  config,
  onChange,
}: ChallengeEditorProps<FindCaganerConfig>) {
  const title = config.title || ''
  const hint = config.hint || ''
  const caganerX = config.caganerX ?? 72
  const caganerY = config.caganerY ?? 68

  const handleSceneClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)

    onChange({
      ...config,
      caganerX: Math.max(5, Math.min(95, x)),
      caganerY: Math.max(10, Math.min(95, y)),
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
          placeholder="Ex: Troba el Caganer amagat al pessebre!"
          className="w-full rounded-xl border border-[#d8cdbf] bg-white px-3 py-1.5 text-xs text-[#2c2825] focus:border-[#0f4437] focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-[#0f4437] uppercase tracking-wider mb-1">
          Pista opcional per al jugador
        </label>
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#248896] shrink-0" />
          <input
            type="text"
            value={hint}
            onChange={(e) => onChange({ ...config, hint: e.target.value })}
            placeholder="Ex: Busca darrere de l'arbre a la dreta del riu..."
            className="w-full rounded-xl border border-[#d8cdbf] bg-white px-3 py-1.5 text-xs text-[#2c2825] focus:border-[#0f4437] focus:outline-none"
          />
        </div>
      </div>

      {/* Editor visual del mapa del pessebre */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-[#0f4437] uppercase tracking-wider">
            Amagatall del Caganer (Clica per canviar-lo de lloc)
          </label>
          <span className="text-[10px] text-[#7e7368] font-mono">
            X: {caganerX}% • Y: {caganerY}%
          </span>
        </div>
        <p className="text-[11px] text-[#7e7368] mb-2">
          Fes clic sobre qualsevol punt de la il·lustració del pessebre per amagar el Caganer allí.
        </p>

        <div
          onClick={handleSceneClick}
          className="relative w-full aspect-[4/3] rounded-2xl border-2 border-[#0f4437]/30 overflow-hidden cursor-crosshair bg-gradient-to-b from-[#1b3a4b] via-[#2d5a27] to-[#406830] shadow-md select-none"
        >
          {/* Elements del paisatge */}
          <div className="absolute top-2 left-3 text-xs text-yellow-200">⭐ Estel de Betlem</div>
          <div className="absolute top-8 left-1/4 text-2xl">🏔️</div>
          <div className="absolute top-6 right-1/4 text-2xl">⛰️</div>
          <div className="absolute top-14 left-8 text-2xl">🏠</div>
          <div className="absolute top-20 right-8 text-3xl">🛖</div>
          <div className="absolute top-24 left-1/2 -translate-x-1/2 text-3xl">✨</div>
          <div className="absolute bottom-12 left-10 text-2xl">🐑</div>
          <div className="absolute bottom-16 left-24 text-2xl">🐑</div>
          <div className="absolute bottom-6 left-1/3 text-3xl">🌲</div>
          <div className="absolute bottom-14 right-1/3 text-3xl">🌳</div>
          <div className="absolute bottom-8 right-12 text-3xl">🌲</div>
          <div className="absolute bottom-20 right-20 text-xl">🔥</div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-2xl">🌉</div>

          {/* Marcador d'amagatall seleccionat */}
          <div
            style={{ left: `${caganerX}%`, top: `${caganerY}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none animate-bounce"
          >
            <div className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black shadow-md border border-white">
              Caganer Aquí!
            </div>
            <span className="text-2xl drop-shadow-md">💩</span>
            <MapPin className="w-4 h-4 text-red-600 -mt-1" />
          </div>
        </div>
      </div>
    </div>
  )
}

