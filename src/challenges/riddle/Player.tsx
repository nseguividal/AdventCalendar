'use client'

import { useState } from 'react'
import type { ChallengePlayerProps } from '../types'
import type { RiddleConfig } from './types'
import { KeyRound, HelpCircle } from 'lucide-react'

export function RiddlePlayer({
  config,
  dayNumber,
  isAlreadySolved,
  onSuccess,
}: ChallengePlayerProps<RiddleConfig>) {
  const [answer, setAnswer] = useState('')
  const [isShaking, setIsShaking] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [feedback, setFeedback] = useState<'idle' | 'wrong'>('idle')

  const question =
    config.question ||
    `Un floc de neu cau suaument a la plaça del poble. Resol el secret del dia ${dayNumber}: Té branques, llums de colors i una estrella brillant al capdamunt. Què és?`
  const solution = config.solution || 'arbre de nadal'
  const hint = (config.hint || '').trim()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const normalizedInput = answer.trim().toLowerCase()
    const normalizedSolution = solution.trim().toLowerCase()

    if (normalizedInput === normalizedSolution) {
      setFeedback('idle')
      onSuccess()
    } else {
      setFeedback('wrong')
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 600)
    }
  }

  return (
    <div className={`space-y-5 ${isShaking ? 'animate-shake' : ''}`}>
      {/* Riddle Scroll Box */}
      <div className="relative rounded-2xl border border-[#e4d6c4] bg-[#f5ede3]/70 p-4 sm:p-5 shadow-xs">
        <span className="text-xl absolute -top-3 left-4">📜</span>
        <p className="mt-1.5 text-sm sm:text-base leading-relaxed text-[#2c2825] font-medium italic">
          "{question}"
        </p>
      </div>

      {/* Hint toggler */}
      {!isAlreadySolved && hint && (
        <div className="text-xs">
          {showHint ? (
            <div className="rounded-xl border border-[#248896]/30 bg-[#248896]/10 p-3 text-[#1a6572] leading-relaxed">
              💡 <strong>Pista:</strong> {hint}
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

      {/* Form de resposta */}
      {!isAlreadySolved && (
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
              {hint
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
  )
}

