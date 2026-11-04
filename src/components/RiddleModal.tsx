'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { CalendarRiddle } from '@/types/database'
import confetti from 'canvas-confetti'
import { X, KeyRound, HelpCircle, CheckCircle2, Sparkles } from 'lucide-react'

interface RiddleModalProps {
  isOpen: boolean
  onClose: () => void
  dayNumber: number
  calendarId: string
  userId: string
  isAlreadySolved: boolean
  onSolved: (dayNumber: number) => void
  onOpenPuzzle?: (dayNumber: number) => void
}

export function RiddleModal({
  isOpen,
  onClose,
  dayNumber,
  calendarId,
  isAlreadySolved,
  onSolved,
  onOpenPuzzle,
}: RiddleModalProps) {
  const [riddle, setRiddle] = useState<CalendarRiddle | null>(null)
  const [loading, setLoading] = useState(true)
  const [answer, setAnswer] = useState('')
  const [isShaking, setIsShaking] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'success'>(
    isAlreadySolved ? 'success' : 'idle'
  )

  useEffect(() => {
    if (!isOpen) return

    setAnswer('')
    setShowHint(false)
    setFeedback(isAlreadySolved ? 'success' : 'idle')
    setLoading(true)

    async function fetchRiddle() {
      try {
        const { data, error } = await supabase
          .from('calendar_riddles')
          .select('*')
          .eq('calendar_id', calendarId)
          .eq('day_number', dayNumber)
          .single()

        if (!error && data) {
          setRiddle(data)
        } else {
          // Default festive riddle in Catalan if not configured yet
          setRiddle({
            id: 'fallback',
            calendar_id: calendarId,
            day_number: dayNumber,
            riddle_text: `Un floc de neu cau suaument a la plaça del poble. Resol el secret del dia ${dayNumber}: Té branques, llums de colors i una estrella brillant al capdamunt. Què és?`,
            solution: 'arbre de nadal',
            hint: null,
            challenge_type: 'riddle',
            config: {},
            created_at: null,
          })
        }
      } catch (err) {
        console.error('Error en carregar l\'endevinalla:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRiddle()
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
      // Confetti canvas may be disabled in some environments
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!riddle) return

    const normalizedInput = answer.trim().toLowerCase()
    const normalizedSolution = riddle.solution.trim().toLowerCase()

    if (normalizedInput === normalizedSolution) {
      setFeedback('success')
      triggerConfetti()
      onSolved(dayNumber)
    } else {
      setFeedback('wrong')
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 600)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a2c22]/65 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#e8dfd3] bg-[#fdfbf7] p-6 sm:p-7 text-[#2c2825] shadow-2xl ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-[#f4ede3] p-2 text-[#6e6358] hover:bg-[#eae0d2] hover:text-[#2c2825] transition"
          aria-label="Tancar finestra"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header amb la miniatura real de la porta */}
        <div className="flex items-center gap-3.5 mb-5 pr-8">
          <div className="relative shrink-0 overflow-hidden rounded-2xl w-14 h-14 border border-[#e5ded4] shadow-sm bg-[#0f4437]">
            <img
              src={`/doors/${dayNumber}.png`}
              alt={`Porta ${dayNumber}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#b91c1c]/10 text-[#b91c1c] text-[11px] font-bold uppercase tracking-wider mb-1">
              Dia {dayNumber}
            </div>
            <h3 className="text-xl font-bold text-[#0f4437] leading-tight">
              Porta de Nadal
            </h3>
            <p className="text-xs text-[#6e6358] font-medium">
              {isAlreadySolved ? '⭐️ Ja està resolt!' : 'Resol l\'endevinalla per obrir-la'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-[#7e7368]">
            <span className="inline-block animate-spin mr-2">❄️</span>
            Desenrotllant el pergamí de Nadal...
          </div>
        ) : (
          <div className="space-y-5">
            {/* Riddle Scroll Box */}
            <div className="relative rounded-2xl border border-[#e4d6c4] bg-[#f5ede3]/70 p-4 sm:p-5 shadow-xs">
              <span className="text-xl absolute -top-3 left-4">📜</span>
              <p className="mt-1.5 text-sm sm:text-base leading-relaxed text-[#2c2825] font-medium italic">
                "{riddle?.riddle_text}"
              </p>
            </div>

            {/* Hint toggler (només es mostra si encara no s'ha resolt) */}
            {!isAlreadySolved && feedback !== 'success' && riddle?.hint && (
              <div className="text-xs">
                {showHint ? (
                  <div className="rounded-xl border border-[#248896]/30 bg-[#248896]/10 p-3 text-[#1a6572] leading-relaxed">
                    💡 <strong>Pista:</strong> {riddle.hint}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowHint(true)}
                    className="inline-flex items-center gap-1.5 text-[#248896] hover:text-[#196470] font-semibold underline underline-offset-4 transition"
                  >
                    <HelpCircle className="w-4 h-4" /> Necessites una pista?
                  </button>
                )}
              </div>
            )}

            {/* Form or Solved State */}
            {isAlreadySolved || feedback === 'success' ? (
              <div className="space-y-3.5 rounded-2xl border border-[#0f4437]/25 bg-[#0f4437]/5 p-5 text-center">
                <CheckCircle2 className="mx-auto w-10 h-10 text-[#0f4437]" />
                <h4 className="text-lg font-bold text-[#0f4437]">
                  Endevinalla resolta!
                </h4>
                <p className="text-xs text-[#524a42]">
                  La solució era: <strong className="text-[#0f4437] uppercase">{riddle?.solution}</strong>
                </p>
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6358] mb-1.5">
                    La teva resposta
                  </label>
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Escriu la resposta aquí..."
                    required
                    autoFocus
                    className="w-full rounded-xl border border-[#d8cdbf] bg-white px-4 py-3 text-sm text-[#2c2825] placeholder-[#9c9184] focus:border-[#0f4437] focus:outline-none focus:ring-2 focus:ring-[#0f4437]/15 transition"
                  />
                </div>

                {feedback === 'wrong' && (
                  <p className="text-xs text-[#b91c1c] font-semibold">
                    {riddle?.hint
                      ? "❄️ Resposta incorrecta! Revisa com s'escriu o mira la pista."
                      : "❄️ Resposta incorrecta! Revisa com s'escriu."}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#b91c1c] hover:bg-[#a11818] py-3.5 font-bold text-white shadow-md active:scale-[0.98] transition text-sm"
                >
                  <KeyRound className="w-4 h-4" />
                  Obrir la porta
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
