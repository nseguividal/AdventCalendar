'use client'

import type { ChallengeEditorProps } from '../types'
import type { SnowglobesConfig } from './types'
import { FolderOpen, CheckCircle2 } from 'lucide-react'

const FIXED_CITIES = [
  { name: 'Atenes', file: 'atenes.png', code: 'ATH' },
  { name: 'Barcelona', file: 'barcelona.png', code: 'BCN' },
  { name: 'Berlín', file: 'berlin.png', code: 'BER' },
  { name: 'Budapest', file: 'budapest.png', code: 'BUD' },
  { name: 'El Caire', file: 'elcaire.png', code: 'CAI' },
  { name: 'Londres', file: 'londres.png', code: 'LON' },
  { name: 'Milà', file: 'mila.png', code: 'MIL' },
  { name: 'Nova York', file: 'novayork.png', code: 'NYC' },
  { name: 'París', file: 'paris.png', code: 'PAR' },
  { name: 'Pisa', file: 'pisa.png', code: 'PSA' },
  { name: 'Rio de Janeiro', file: 'rio.png', code: 'RIO' },
  { name: 'Roma', file: 'roma.png', code: 'FCO' },
  { name: 'Sydney', file: 'sydney.png', code: 'SYD' },
  { name: 'Venècia', file: 'venecia.png', code: 'VCE' },
]

export function SnowglobesEditor({
  config,
  onChange,
}: ChallengeEditorProps<SnowglobesConfig>) {
  const title = config.title || ''

  return (
    <div className="space-y-4">
      {/* Títol opcional */}
      <div>
        <label className="block text-xs font-bold text-[#0f4437] uppercase tracking-wider mb-1">
          Títol del repte (opcional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          placeholder="Ex: Barreja de boles de neu"
          className="w-full rounded-xl border border-[#d8cdbf] bg-white px-3.5 py-2 text-xs text-[#2c2825] focus:border-[#0f4437] focus:outline-none"
        />
      </div>

      {/* Caixa informativa de funcionament fix */}
      <div className="rounded-2xl bg-[#0f4437]/5 border border-[#0f4437]/15 p-3.5 space-y-2 text-xs text-[#0f4437]">
        <div className="flex items-center gap-1.5 font-bold">
          <FolderOpen className="w-4 h-4 text-[#0f4437]" />
          <span>Boles de vidre transparents del joc (14 ciutats):</span>
        </div>
        <p className="text-[11px] text-[#524a42]">
          Aquest joc compta amb 14 ciutats en total. En pantalla es mostren 9 boles i 4 requadres de ciutats; en encertar una bola, es revelen noves ciutats i boles fins a completar-les totes. Guarda els fitxers PNG transparents a:
        </p>
        <div className="bg-white p-2.5 rounded-xl border border-[#d8cdbf] font-mono text-[11px] text-[#0f4437] font-bold">
          public/snowglobes/
        </div>

        <div className="pt-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7e7368] mb-1.5">
            Fitxers necessaris (1 per ciutat):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FIXED_CITIES.map((c) => (
              <div
                key={c.code}
                className="rounded-xl border border-[#d8cdbf] bg-white p-2 text-center"
              >
                <div className="font-bold text-[#0f4437] text-xs flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>{c.name}</span>
                </div>
                <code className="text-[10px] text-[#7e7368] font-mono block mt-0.5">
                  {c.file}
                </code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
