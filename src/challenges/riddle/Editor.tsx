'use client'

import type { ChallengeEditorProps } from '../types'
import type { RiddleConfig } from './types'

export function RiddleEditor({
  config,
  onChange,
}: ChallengeEditorProps<RiddleConfig>) {
  return (
    <div className="space-y-3">
      {/* Text de l'endevinalla */}
      <div>
        <label className="block text-[11px] font-semibold text-[#6e6358] uppercase tracking-wider mb-1">
          Text de l'endevinalla
        </label>
        <textarea
          rows={2}
          value={config.question || ''}
          onChange={(e) => onChange({ ...config, question: e.target.value })}
          placeholder="Escriu l'endevinalla aquí..."
          className="w-full px-3 py-2 bg-white border border-[#d8cdbf] rounded-xl text-[#2c2825] placeholder-[#9c9184] text-xs focus:outline-none focus:ring-2 focus:ring-[#0f4437]/15 focus:border-[#0f4437] resize-none"
        />
      </div>

      {/* Solució */}
      <div>
        <label className="block text-[11px] font-semibold text-[#6e6358] uppercase tracking-wider mb-1">
          Solució (no distingeix majúscules)
        </label>
        <input
          type="text"
          value={config.solution || ''}
          onChange={(e) => onChange({ ...config, solution: e.target.value })}
          placeholder="p. ex. arbre de nadal"
          className="w-full px-3 py-1.5 bg-white border border-[#d8cdbf] rounded-xl text-[#2c2825] placeholder-[#9c9184] text-xs focus:outline-none focus:ring-2 focus:ring-[#0f4437]/15 focus:border-[#0f4437]"
        />
      </div>

      {/* Pista */}
      <div>
        <label className="block text-[11px] font-semibold text-[#6e6358] uppercase tracking-wider mb-1">
          Pista <span className="text-[#8c8277] lowercase font-normal">(opcional)</span>
        </label>
        <input
          type="text"
          value={config.hint || ''}
          onChange={(e) => onChange({ ...config, hint: e.target.value })}
          placeholder="p. ex. Té branques i boles de colors"
          className="w-full px-3 py-1.5 bg-white border border-[#d8cdbf] rounded-xl text-[#2c2825] placeholder-[#9c9184] text-xs focus:outline-none focus:ring-2 focus:ring-[#0f4437]/15 focus:border-[#0f4437]"
        />
      </div>
    </div>
  )
}

