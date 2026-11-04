'use client'

import type { ChallengeEditorProps } from '../types'
import type { SnowmanConfig, SnowmanWordItem } from './types'
import { Plus, Trash2, HelpCircle } from 'lucide-react'

export function SnowmanEditor({
  config,
  onChange,
}: ChallengeEditorProps<SnowmanConfig>) {
  // Normalitzar la llista de frases (compatible amb format antic word/hint)
  const wordsList: SnowmanWordItem[] = (
    config.words && config.words.length > 0
      ? config.words.map((item) =>
          typeof item === 'string'
            ? { word: item, hint: '' }
            : { word: item.word || '', hint: item.hint || '' }
        )
      : config.word
      ? [{ word: config.word, hint: config.hint || '' }]
      : [{ word: 'TIÓ DE NADAL', hint: 'És de fusta i caga regals...' }]
  )

  const title = config.title || ''

  const handleUpdateItem = (
    index: number,
    field: 'word' | 'hint',
    val: string
  ) => {
    const updated = wordsList.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          [field]: field === 'word' ? val.toUpperCase() : val,
        }
      }
      return item
    })

    onChange({
      ...config,
      words: updated,
      word: updated[0]?.word || '',
      hint: updated[0]?.hint || '',
      maxErrors: 6,
    })
  }

  const handleAddPhrase = () => {
    const updated: SnowmanWordItem[] = [
      ...wordsList,
      { word: '', hint: '' },
    ]
    onChange({
      ...config,
      words: updated,
      maxErrors: 6,
    })
  }

  const handleRemovePhrase = (index: number) => {
    if (wordsList.length <= 1) return
    const updated = wordsList.filter((_, i) => i !== index)
    onChange({
      ...config,
      words: updated,
      word: updated[0]?.word || '',
      hint: updated[0]?.hint || '',
      maxErrors: 6,
    })
  }

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
          onChange={(e) =>
            onChange({
              ...config,
              title: e.target.value,
              maxErrors: 6,
            })
          }
          placeholder="Ex: Salva el ninot de neu!"
          className="w-full rounded-xl border border-[#d8cdbf] bg-white px-3.5 py-2 text-xs text-[#2c2825] focus:border-[#0f4437] focus:outline-none"
        />
      </div>

      {/* Secció de Frases / Paraules */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-[#0f4437] uppercase tracking-wider">
            Frases o paraules secretes ({wordsList.length})
          </label>
          <span className="text-[10px] text-[#7e7368] font-medium">
            Sempre 6 intents per frase
          </span>
        </div>
        <p className="text-[11px] text-[#7e7368] mb-3">
          Si només poses una frase, sempre es jugarà amb la mateixa. Si n'afegeixes més, en cas de fallar apareixerà la següent en bucle fins encertar-ne una.
        </p>

        <div className="space-y-2.5">
          {wordsList.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[#d8cdbf] bg-[#faf6f2] p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#0f4437] bg-white px-2 py-0.5 rounded-md border border-[#e8dfd3]">
                  {wordsList.length > 1 ? `Frase ${idx + 1}` : 'Frase principal'}
                </span>
                {wordsList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePhrase(idx)}
                    className="text-[#b91c1c] hover:bg-red-50 p-1 rounded-lg transition"
                    title="Eliminar frase"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Input de la paraula o frase */}
              <div>
                <input
                  type="text"
                  value={item.word}
                  onChange={(e) => handleUpdateItem(idx, 'word', e.target.value)}
                  placeholder="Ex: TIÓ DE NADAL, PASTORET, POLVORÓ..."
                  className="w-full rounded-xl border border-[#d8cdbf] bg-white px-3 py-1.5 text-xs uppercase font-mono tracking-wider text-[#2c2825] focus:border-[#0f4437] focus:outline-none"
                />
              </div>

              {/* Input de la pista opcional */}
              <div className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#248896] shrink-0" />
                <input
                  type="text"
                  value={item.hint || ''}
                  onChange={(e) => handleUpdateItem(idx, 'hint', e.target.value)}
                  placeholder="Pista opcional per a aquesta frase..."
                  className="w-full rounded-lg border border-[#e8dfd3] bg-white px-2.5 py-1 text-[11px] text-[#2c2825] focus:border-[#248896] focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Botó afegir nova frase */}
        <button
          type="button"
          onClick={handleAddPhrase}
          className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#0f4437]/30 bg-white text-xs font-bold text-[#0f4437] hover:bg-[#0f4437]/5 transition shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Afegir una altra frase de reserva</span>
        </button>
      </div>
    </div>
  )
}
