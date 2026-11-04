'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { CalendarRiddle } from '@/types/database'
import confetti from 'canvas-confetti'
import { X, CheckCircle2, Sparkles } from 'lucide-react'
import { ChallengeRenderer } from './ChallengeRenderer'
import { CHALLENGE_REGISTRY } from '@/challenges/registry'
import type { ChallengeType } from '@/challenges/types'

interface ChallengeModalProps {
  isOpen: boolean
  onClose: () => void
  dayNumber: number
  calendarId: string
  userId: string
  isAlreadySolved: boolean
  onSolved: (dayNumber: number, score?: number) => void
  onOpenPuzzle?: (dayNumber: number) => void
}

export function ChallengeModal({
  isOpen,
  onClose,
  dayNumber,
  calendarId,
  isAlreadySolved,
  onSolved,
  onOpenPuzzle,
}: ChallengeModalProps) {
  const [challengeData, setChallengeData] = useState<CalendarRiddle | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(isAlreadySolved)

  // Determinar el tipus de repte (riddle, wordsearch, quiz, photo_voting, memory)
  const challengeType = (challengeData?.challenge_type || 'riddle') as ChallengeType

  useEffect(() => {
    if (!isOpen) return

    setIsSuccess(isAlreadySolved)
    setLoading(true)

    async function fetchChallenge() {
      try {
        const { data, error } = await supabase
          .from('calendar_riddles')
          .select('*')
          .eq('calendar_id', calendarId)
          .eq('day_number', dayNumber)
          .single()

        if (!error && data) {
          setChallengeData(data)
        } else {
          // Repte per defecte en català si encara no està configurat
          setChallengeData({
            id: 'fallback',
            calendar_id: calendarId,
            day_number: dayNumber,
            challenge_type: 'riddle',
            riddle_text: `Un floc de neu cau suaument a la plaça del poble. Resol el secret del dia ${dayNumber}: Té branques, llums de colors i una estrella brillant al capdamunt. Què és?`,
            solution: 'arbre de nadal',
            hint: null,
            config: {
              question: `Un floc de neu cau suaument a la plaça del poble. Resol el secret del dia ${dayNumber}: Té branques, llums de colors i una estrella brillant al capdamunt. Què és?`,
              solution: 'arbre de nadal',
              hint: '',
            },
            created_at: null,
          })
        }
      } catch (err) {
        console.error('Error en carregar el repte:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchChallenge()
  }, [isOpen, calendarId, dayNumber, isAlreadySolved])

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#b91c1c', '#0f4437', '#248896', '#c89332', '#faf6f2'],
      })
    } catch {
      // ignore
    }
  }

  const handleSuccess = (score?: number, _total?: number) => {
    triggerConfetti()
    onSolved(dayNumber, score)
    if (challengeType === 'photo_voting') {
      if (onOpenPuzzle) {
        onOpenPuzzle(dayNumber)
      } else {
        onClose()
      }
      return
    }
    setIsSuccess(true)
  }

  if (!isOpen) return null

  // Determinar tipus i configuració efectiva
  const meta = CHALLENGE_REGISTRY[challengeType] || CHALLENGE_REGISTRY.riddle

  // Combinar el camp config JSONB amb els camps clàssics (question, solution, hint) per compatibilitat
  const effectiveConfig = {
    ...(challengeData?.config as Record<string, unknown> || {}),
    question: (challengeData?.config as any)?.question || challengeData?.riddle_text || '',
    solution: (challengeData?.config as any)?.solution || challengeData?.solution || '',
    hint: (challengeData?.config as any)?.hint || challengeData?.hint || '',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0a2c22]/65 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto overscroll-contain rounded-3xl border border-[#e8dfd3] bg-[#fdfbf7] p-4 sm:p-6 text-[#2c2825] shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 rounded-full bg-[#f4ede3] p-1.5 text-[#6e6358] hover:bg-[#eae0d2] hover:text-[#2c2825] transition z-10"
          aria-label="Tancar finestra"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Header amb miniatura de la porta */}
        <div className="flex items-center gap-3 mb-3.5 sm:mb-4 pr-7">
          <div className="relative shrink-0 overflow-hidden rounded-xl w-11 h-11 sm:w-12 sm:h-12 border border-[#e5ded4] shadow-xs bg-[#0f4437]">
            <img
              src={`/doors/${dayNumber}.png`}
              alt={`Porta ${dayNumber}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#b91c1c]/10 text-[#b91c1c] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-0.5">
              Dia {dayNumber} • {meta.name}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#0f4437] leading-tight">
              Porta de Nadal
            </h3>
            <p className="text-[11px] sm:text-xs text-[#6e6358] font-medium">
              {isAlreadySolved ? '⭐️ Ja està resolt!' : 'Supera el repte per obrir-la'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-[#7e7368]">
            <span className="inline-block animate-spin mr-2">❄️</span>
            Carregant el repte de Nadal...
          </div>
        ) : isSuccess ? (
          <div className="space-y-4 rounded-2xl border border-[#0f4437]/25 bg-[#0f4437]/5 p-5 text-center animate-in fade-in duration-300">
            <CheckCircle2 className="mx-auto w-10 h-10 text-[#0f4437]" />
            <h4 className="text-lg font-bold text-[#0f4437]">
              Repte resolt!
            </h4>
            {challengeType === 'riddle' && effectiveConfig.solution && (
              <p className="text-xs text-[#524a42]">
                La solució era: <strong className="text-[#0f4437] uppercase">{String(effectiveConfig.solution)}</strong>
              </p>
            )}
            {challengeType === 'wordsearch' && (
              <p className="text-xs text-[#524a42]">
                Has trobat totes les paraules amagades!
              </p>
            )}
            {challengeType === 'quiz' && (
              <p className="text-xs text-[#524a42]">
                Molt bona resposta! Coneixes molt bé la història de la família!
              </p>
            )}
            {challengeType === 'photo_voting' && (
              <p className="text-xs text-[#524a42]">
                Molt bona vista! Has encertat qui apareix a les fotos familiars!
              </p>
            )}
            {challengeType === 'memory' && (
              <p className="text-xs text-[#524a42]">
                Fantàstica memòria! Has emparellat tots els símbols de Nadal.
              </p>
            )}
            {challengeType === 'wordle' && (
              <p className="text-xs text-[#524a42]">
                Fantàstic! Has endevinat la paraula secreta del Wordle nadalenc!
              </p>
            )}
            {challengeType === 'snowman' && (
              <p className="text-xs text-[#524a42]">
                Molt bé! Has salvat el ninot de neu completant la paraula!
              </p>
            )}
            {challengeType === 'scramble' && (
              <p className="text-xs text-[#524a42]">
                Genial! Has ordenat totes les lletres per descobrir les paraules amagades!
              </p>
            )}
            {challengeType === 'equation' && (
              <p className="text-xs text-[#524a42]">
                Brillant! Has resolt el càlcul de l'enigma matemàtic nadalenc!
              </p>
            )}
            {challengeType === 'snowglobes' && (
              <p className="text-xs text-[#524a42]">
                Magnífic! Has relacionat correctament totes les boles de vidre amb les seves ciutats!
              </p>
            )}
            {challengeType === 'catch_gifts' && (
              <p className="text-xs text-[#524a42]">
                Impressionant velocitat! Has atrapat tots els regals abans que s'acabés el temps!
              </p>
            )}
            {challengeType === 'find_caganer' && (
              <p className="text-xs text-[#524a42]">
                Molt bona vista! Has trobat el Caganer amagat al pessebre!
              </p>
            )}
            {challengeType === 'bells_memory' && (
              <p className="text-xs text-[#524a42]">
                Fantàstica oïda! Has tocat tota la melodia de campanes nadalenques!
              </p>
            )}
            {challengeType === 'pica_tio' && (
              <p className="text-xs text-[#524a42]">
                Caga Tió aconseguit! Has picat amb molta força i il·lusió!
              </p>
            )}
            {challengeType === 'sudoku' && (
              <p className="text-xs text-[#524a42]">
                Enginy pur! Has resolt el Mini Sudoku nadalenc a la perfecció!
              </p>
            )}
            <p className="text-xs text-[#248896] font-medium">
              ✨ S'ha revelat la peça {dayNumber} del trencaclosques secret!
            </p>
            <div className="pt-1.5 space-y-2">
              <button
                type="button"
                onClick={() => {
                  if (onOpenPuzzle) {
                    onOpenPuzzle(dayNumber)
                  } else {
                    onClose()
                  }
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#b91c1c] hover:bg-[#a11818] py-3 text-sm font-bold text-white shadow-md transition active:scale-[0.98]"
              >
                <span>Descobrir el trencaclosques</span>
                <Sparkles className="w-4 h-4 text-[#faf6f2]" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-[#6e6358] hover:text-[#2c2825] transition font-medium"
              >
                Tornar al calendari
              </button>
            </div>
          </div>
        ) : (
          <ChallengeRenderer
            challengeType={challengeType}
            config={effectiveConfig}
            dayNumber={dayNumber}
            isAlreadySolved={isAlreadySolved}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </div>
  )
}
