'use client'

import { useMemo } from 'react'
import type { ChallengeEditorProps } from '../types'
import type { PhotoVotingConfig, PhotoItem } from './types'
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import { ImageUploader } from '@/components/ImageUploader'
import { deleteStorageFile } from '@/lib/storage'

export function PhotoVotingEditor({
  config,
  onChange,
}: ChallengeEditorProps<PhotoVotingConfig>) {
  // Normalitzar llista de fotos
  const photos: PhotoItem[] = useMemo(() => {
    if (config.photos && config.photos.length > 0) {
      return config.photos
    }
    if (config.imageUrl || config.options) {
      return [
        {
          title: config.title || 'Qui és aquest nadó de la família?',
          imageUrl: config.imageUrl || '',
          options: config.options || ['La mare', 'El pare', "L'oncle Jordi", 'La tieta Marta'],
          correctPerson: config.correctPerson || 'La mare',
          hint: config.hint || '',
        },
      ]
    }
    return [
      {
        title: 'Qui és aquest nadó de la família?',
        imageUrl: '',
        options: ['La mare', 'El pare', "L'oncle Jordi", 'La tieta Marta'],
        correctPerson: 'La mare',
        hint: '',
      },
    ]
  }, [config])

  const updatePhotos = (newPhotos: PhotoItem[]) => {
    onChange({
      ...config,
      photos: newPhotos,
      // Retrocompatibilitat per a la primera foto:
      title: newPhotos[0]?.title || '',
      imageUrl: newPhotos[0]?.imageUrl || '',
      options: newPhotos[0]?.options || [],
      correctPerson: newPhotos[0]?.correctPerson || '',
      hint: newPhotos[0]?.hint || '',
    })
  }

  const handleFieldChange = (pIndex: number, field: keyof PhotoItem, value: any) => {
    const updated = [...photos]
    updated[pIndex] = { ...updated[pIndex], [field]: value }
    updatePhotos(updated)
  }

  const handleOptionsChange = (pIndex: number, text: string) => {
    const parsed = text
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const current = photos[pIndex]
    const currentCorrect = current.correctPerson || ''
    const newCorrect = parsed.includes(currentCorrect) ? currentCorrect : parsed[0] || ''

    const updated = [...photos]
    updated[pIndex] = {
      ...updated[pIndex],
      options: parsed,
      correctPerson: newCorrect,
    }
    updatePhotos(updated)
  }

  const handleAddPhoto = () => {
    const newPhoto: PhotoItem = {
      title: 'Qui és aquest nadó de la família?',
      imageUrl: '',
      options: ['La mare', 'El pare', "L'oncle Jordi", 'La tieta Marta'],
      correctPerson: 'La mare',
      hint: '',
    }
    updatePhotos([...photos, newPhoto])
  }

  const handleRemovePhoto = (pIndex: number) => {
    if (photos.length <= 1) return
    const removedPhoto = photos[pIndex]
    if (removedPhoto?.imageUrl) {
      deleteStorageFile(removedPhoto.imageUrl).catch(() => {})
    }
    const updated = photos.filter((_, i) => i !== pIndex)
    updatePhotos(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-[#6e6358] uppercase tracking-wider block">
            Fotos misterioses ({photos.length})
          </span>
          <span className="text-[10px] text-[#248896] font-medium">
            1 sol intent per foto amb puntuació final
          </span>
        </div>
        <button
          type="button"
          onClick={handleAddPhoto}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#248896]/10 hover:bg-[#248896]/20 text-[#248896] text-xs font-bold rounded-lg transition"
        >
          <Plus className="w-3.5 h-3.5" /> Afegir foto
        </button>
      </div>

      {photos.map((photo, pIndex) => {
        const opts = photo.options && photo.options.length > 0 ? photo.options : ['La mare', 'El pare']

        return (
          <div
            key={pIndex}
            className="p-3.5 rounded-xl border border-[#e8dfd3] bg-white space-y-3 relative shadow-xs"
          >
            {/* Capçalera de la foto */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#248896] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                Foto {pIndex + 1}
              </span>
              {photos.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(pIndex)}
                  className="text-[#7e7368] hover:text-[#b91c1c] p-1 transition"
                  title="Eliminar aquesta foto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Títol opcional */}
            <div>
              <label className="block text-[10px] font-semibold text-[#7e7368] uppercase tracking-wider mb-1">
                Pregunta o instrucció
              </label>
              <input
                type="text"
                value={photo.title || ''}
                onChange={(e) => handleFieldChange(pIndex, 'title', e.target.value)}
                placeholder="p. ex. Qui és aquest nadó de la família?"
                className="w-full px-2.5 py-1.5 bg-[#fdfbf7] border border-[#d8cdbf] rounded-lg text-[#2c2825] text-xs focus:outline-none focus:ring-1 focus:ring-[#248896]"
              />
            </div>

            {/* Pujador de la imatge */}
            <div>
              <ImageUploader
                compact
                label="Fotografia del nadó / familiar"
                value={photo.imageUrl || ''}
                onChange={(url) => handleFieldChange(pIndex, 'imageUrl', url)}
              />
            </div>

            {/* Noms d'opcions */}
            <div>
              <label className="block text-[10px] font-semibold text-[#7e7368] uppercase tracking-wider mb-1">
                Possibles familiars (separats per coma)
              </label>
              <input
                type="text"
                value={opts.join(', ')}
                onChange={(e) => handleOptionsChange(pIndex, e.target.value)}
                placeholder="p. ex. La mare, El pare, L'oncle Jordi, La tieta Marta"
                className="w-full px-2.5 py-1.5 bg-[#fdfbf7] border border-[#d8cdbf] rounded-lg text-[#2c2825] text-xs focus:outline-none focus:ring-1 focus:ring-[#248896]"
              />
            </div>

            {/* Persona correcta */}
            <div>
              <label className="block text-[10px] font-semibold text-[#7e7368] uppercase tracking-wider mb-1">
                Qui és el correcte? (Resposta encertada)
              </label>
              <select
                value={photo.correctPerson || opts[0] || ''}
                onChange={(e) => handleFieldChange(pIndex, 'correctPerson', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#fdfbf7] border border-[#d8cdbf] rounded-lg text-[#2c2825] text-xs focus:outline-none focus:ring-1 focus:ring-[#248896]"
              >
                {opts.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Pista opcional */}
            <div>
              <label className="block text-[10px] font-semibold text-[#7e7368] uppercase tracking-wider mb-1">
                Pista <span className="font-normal lowercase">(opcional, si no es posa no es mostrarà)</span>
              </label>
              <input
                type="text"
                value={photo.hint || ''}
                onChange={(e) => handleFieldChange(pIndex, 'hint', e.target.value)}
                placeholder="p. ex. Va néixer l'any 1985 a Barcelona"
                className="w-full px-2.5 py-1.5 bg-[#fdfbf7] border border-[#d8cdbf] rounded-lg text-[#2c2825] placeholder-[#9c9184] text-xs focus:outline-none focus:ring-1 focus:ring-[#248896]"
              />
            </div>
          </div>
        )
      })}

      {photos.length > 1 && (
        <button
          type="button"
          onClick={handleAddPhoto}
          className="w-full py-2 border-2 border-dashed border-[#d8cdbf] hover:border-[#248896] rounded-xl text-xs font-bold text-[#248896] hover:bg-[#248896]/5 transition flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Afegir una altra foto al repte
        </button>
      )}
    </div>
  )
}
