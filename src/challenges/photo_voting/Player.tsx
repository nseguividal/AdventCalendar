'use client'

import { useState, useMemo } from 'react'
import type { ChallengePlayerProps } from '../types'
import type { PhotoVotingConfig, PhotoItem } from './types'
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  ArrowRight,
  Sparkles,
  Trophy,
  Award,
} from 'lucide-react'

export function PhotoVotingPlayer({
  config,
  isAlreadySolved,
  onSuccess,
}: ChallengePlayerProps<PhotoVotingConfig>) {
  // Normalitzar llista de fotos (suporta múltiples fotos o configuració antiga d'una sola foto)
  const photos: PhotoItem[] = useMemo(() => {
    if (config.photos && config.photos.length > 0) {
      return config.photos
    }
    if (config.imageUrl) {
      return [
        {
          title: config.title || 'Qui és aquest nadó de la família?',
          imageUrl: config.imageUrl,
          options: config.options || ['La mare', 'El pare', "L'oncle Jordi", 'La tieta Marta'],
          correctPerson: config.correctPerson || 'La mare',
          hint: config.hint,
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

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [showHint, setShowHint] = useState(false)

  const currentPhoto = photos[currentIndex] || photos[0]
  const options = currentPhoto.options && currentPhoto.options.length > 0
    ? currentPhoto.options
    : ['La mare', 'El pare']
  const correct = currentPhoto.correctPerson || options[0]
  const hint = (currentPhoto.hint || '').trim()

  const hasAnswered = selectedPerson !== null
  const isCorrect =
    selectedPerson !== null &&
    selectedPerson.trim().toLowerCase() === correct.trim().toLowerCase()

  const isLast = currentIndex === photos.length - 1

  const handleSelect = (person: string) => {
    if (isAlreadySolved || hasAnswered) return

    setSelectedPerson(person)

    const isMatch = person.trim().toLowerCase() === correct.trim().toLowerCase()
    if (isMatch) {
      setScore((prev) => prev + 1)
    }
  }

  const handleNextPhoto = () => {
    if (isLast) {
      onSuccess(score, photos.length)
    } else {
      setCurrentIndex((prev) => prev + 1)
      setSelectedPerson(null)
      setShowHint(false)
    }
  }

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* Indicador de progrés i puntuació en directe */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-[#6e6358]">
          <span className="flex items-center gap-1.5 text-[#248896]">
            <ImageIcon className="w-3.5 h-3.5" />
            {photos.length > 1 ? `Foto ${currentIndex + 1} de ${photos.length}` : 'Foto misteriosa'}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0f4437]/10 text-[#0f4437] font-bold">
            <Award className="w-3 h-3" />
            {score} {score === 1 ? 'encert' : 'encerts'}
          </span>
        </div>

        {photos.length > 1 && (
          <div className="w-full h-1 bg-[#e8dfd3] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#248896] transition-all duration-300 rounded-full"
              style={{
                width: `${((currentIndex + (hasAnswered ? 1 : 0)) / photos.length) * 100}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* Títol de la foto actual */}
      <div className="text-center">
        <h4 className="text-sm font-bold text-[#0f4437] leading-tight">
          {currentPhoto.title || 'Qui és aquest nadó de la família?'}
        </h4>
      </div>

      {/* Imatge de la foto */}
      <div className="relative mx-auto w-full max-w-[150px] sm:max-w-[190px] aspect-square rounded-xl overflow-hidden border-2 border-[#e8dfd3] shadow-xs bg-[#f4ede3] flex items-center justify-center">
        {currentPhoto.imageUrl ? (
          <img
            src={currentPhoto.imageUrl}
            alt="Foto familiar misteriosa"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center p-2 text-[#7e7368]">
            <span className="text-2xl block mb-1">👶</span>
            <span className="text-[11px] font-medium">Sense foto</span>
          </div>
        )}
      </div>

      {/* Pista opcional */}
      {hint && !hasAnswered && (
        <div className="text-center">
          {!showHint ? (
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="inline-flex items-center gap-1 text-[11px] text-[#248896] hover:underline font-medium"
            >
              <HelpCircle className="w-3 h-3" /> Necessites una pista?
            </button>
          ) : (
            <div className="rounded-lg bg-[#248896]/10 border border-[#248896]/20 py-1 px-2 text-[11px] text-[#248896] font-medium animate-in fade-in">
              💡 {hint}
            </div>
          )}
        </div>
      )}

      {/* Llista de candidats familiars (Només 1 intent) */}
      <div className="grid grid-cols-2 gap-2">
        {options.map((person) => {
          const isSelected = selectedPerson === person
          const isCorrectAnswer =
            person.trim().toLowerCase() === correct.trim().toLowerCase()

          let buttonStyle = 'bg-white border-[#d8cdbf] text-[#2c2825] hover:bg-[#faf6f2]'

          if (hasAnswered) {
            if (isCorrectAnswer) {
              // La correcta sempre es mostra en verd un cop contestat
              buttonStyle = 'bg-[#0f4437] border-[#0f4437] text-white shadow-xs font-bold'
            } else if (isSelected && !isCorrect) {
              // Si va triar aquesta i era errònia, es mostra en vermell
              buttonStyle = 'bg-red-500 border-red-500 text-white shadow-xs'
            } else {
              // Opcions no triades es desactiven suaument
              buttonStyle = 'bg-white/70 border-[#e8dfd3] text-[#8c8277] opacity-60'
            }
          }

          return (
            <button
              key={person}
              type="button"
              disabled={hasAnswered || isAlreadySolved}
              onClick={() => handleSelect(person)}
              className={`py-2 px-2.5 rounded-lg border text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                !hasAnswered ? 'active:scale-95' : 'cursor-default'
              } ${buttonStyle}`}
            >
              <span className="truncate">{person}</span>
              {hasAnswered && isCorrectAnswer && (
                <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
              )}
              {hasAnswered && isSelected && !isCorrect && (
                <XCircle className="w-3.5 h-3.5 text-white shrink-0" />
              )}
            </button>
          )
        })}
      </div>

      {/* Panell de feedback immediat i botó de següent foto */}
      {hasAnswered && !isAlreadySolved && (
        <div
          className={`space-y-2 rounded-xl p-2.5 text-center animate-in fade-in duration-200 border ${
            isCorrect
              ? 'bg-[#0f4437]/10 border-[#0f4437]/25 text-[#0f4437]'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 font-bold text-xs">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0f4437] shrink-0" />
                <span>Molt bé! Has encertat, és {correct}!</span>
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>Oh, no! Era {correct}!</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleNextPhoto}
            className={`w-full flex items-center justify-center gap-1.5 py-2 font-bold rounded-lg transition shadow-xs text-xs active:scale-[0.98] ${
              isLast
                ? 'bg-[#b91c1c] hover:bg-[#a11818] text-white shadow-sm'
                : 'bg-[#0f4437] hover:bg-[#145647] text-white'
            }`}
          >
            {isLast ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
                <span>Descobrir el trencaclosques</span>
              </>
            ) : (
              <>
                <span>Següent foto</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
