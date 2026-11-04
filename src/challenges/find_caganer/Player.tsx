'use client'

import { useState, useRef } from 'react'
import type { ChallengePlayerProps } from '../types'
import type { FindCaganerConfig } from './types'
import { Sparkles, HelpCircle } from 'lucide-react'

interface ClickRipple {
  id: number
  x: number
  y: number
  feedback: string
  color: string
}

export function FindCaganerPlayer({
  config,
  isAlreadySolved,
  onSuccess,
}: ChallengePlayerProps<FindCaganerConfig>) {
  const targetX = config.caganerX ?? 72
  const targetY = config.caganerY ?? 68
  const tolerance = config.toleranceRadius ?? 8

  const [isFound, setIsFound] = useState(isAlreadySolved)
  const [showHint, setShowHint] = useState(false)
  const [ripples, setRipples] = useState<ClickRipple[]>([])
  const [attempts, setAttempts] = useState(0)
  const [lastFeedback, setLastFeedback] = useState<string | null>(null)

  const rippleId = useRef(1)

  const handleSceneClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFound) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = ((e.clientX - rect.left) / rect.width) * 100
    const clickY = ((e.clientY - rect.top) / rect.height) * 100

    setAttempts((prev) => prev + 1)

    // Càlcul de la distància euclidiana en percentatge
    const dx = clickX - targetX
    const dy = clickY - targetY
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist <= tolerance) {
      // Trobat!
      setIsFound(true)
      setLastFeedback('🎉 Has trobat el Caganer!')
      onSuccess()
    } else {
      let msg = '❄️ Fred, fred...'
      let col = 'text-blue-300'

      if (dist < 18) {
        msg = '🔥 Molt calent, el tens a tocar!'
        col = 'text-red-400'
      } else if (dist < 32) {
        msg = '🌡️ Tébi, t\'hi acostes!'
        col = 'text-amber-300'
      }

      setLastFeedback(msg)

      const newRipple: ClickRipple = {
        id: rippleId.current++,
        x: clickX,
        y: clickY,
        feedback: msg,
        color: col,
      }
      setRipples((prev) => [...prev, newRipple])
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
      }, 1000)
    }
  }

  return (
    <div className="space-y-3 max-w-sm mx-auto select-none">
      {/* Títol */}
      <div className="text-center">
        <h4 className="text-sm font-bold text-[#0f4437]">
          {config.title || 'Troba el Caganer amagat al pessebre!'}
        </h4>
        <p className="text-[11px] text-[#7e7368] mt-0.5">
          {isFound
            ? '💩 Enhorabona! Ja l\'has descobert!'
            : lastFeedback || 'Explora el pessebre i toca on creguis que s\'amaga'}
        </p>
      </div>

      {/* Pista opcional */}
      {config.hint && !isFound && (
        <div className="text-center">
          {!showHint ? (
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="inline-flex items-center gap-1 text-[11px] text-[#248896] hover:underline font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Necessites una pista?
            </button>
          ) : (
            <div className="rounded-lg bg-[#248896]/10 border border-[#248896]/20 py-1 px-2.5 text-[11px] text-[#248896] font-medium animate-in fade-in">
              💡 {config.hint}
            </div>
          )}
        </div>
      )}

      {/* Il·lustració interactiva del pessebre nadalenc */}
      <div
        onClick={handleSceneClick}
        className="relative w-full aspect-[4/3] rounded-2xl border-2 border-[#0f4437]/30 overflow-hidden cursor-pointer bg-gradient-to-b from-[#1b3a4b] via-[#2d5a27] to-[#406830] shadow-md select-none group"
      >
        {/* Cel i estels */}
        <div className="absolute top-2 left-4 text-xs text-yellow-200">⭐ Estel de Betlem</div>
        <div className="absolute top-3 right-8 text-[10px] text-yellow-100">✨</div>
        <div className="absolute top-6 left-1/3 text-[10px] text-yellow-100">✨</div>

        {/* Muntanyes al fons */}
        <div className="absolute top-8 left-1/4 text-2xl">🏔️</div>
        <div className="absolute top-6 right-1/4 text-2xl">⛰️</div>

        {/* Poble, cases i estables */}
        <div className="absolute top-14 left-8 text-2xl">🏠</div>
        <div className="absolute top-20 right-8 text-3xl">🛖</div>
        <div className="absolute top-24 left-1/2 -translate-x-1/2 text-2xl">🏛️</div>

        {/* Pastorets, ovelles i riu */}
        <div className="absolute bottom-12 left-10 text-2xl">🐑</div>
        <div className="absolute bottom-16 left-24 text-2xl">🐑</div>
        <div className="absolute bottom-14 left-1/4 text-xl">🚶‍♂️</div>
        <div className="absolute bottom-6 left-1/3 text-3xl">🌲</div>
        <div className="absolute bottom-14 right-1/3 text-3xl">🌳</div>
        <div className="absolute bottom-8 right-12 text-3xl">🌲</div>
        <div className="absolute bottom-20 right-20 text-xl">🔥</div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-2xl">🌉</div>
        <div className="absolute bottom-10 right-1/4 text-xl">🪨</div>

        {/* El Caganer amagat */}
        <div
          style={{ left: `${targetX}%`, top: `${targetY}%` }}
          className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all ${
            isFound
              ? 'scale-150 z-30 animate-bounce'
              : 'scale-90 opacity-80 hover:opacity-100 z-10'
          }`}
        >
          <span className="text-xl sm:text-2xl drop-shadow-md">💩</span>
          {isFound && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[9px] shadow-lg animate-pulse">
              Aquí sóc!
            </div>
          )}
        </div>

        {/* Efectes d'ondulació i pistes al fer clic */}
        {ripples.map((rip) => (
          <div
            key={rip.id}
            style={{ left: `${rip.x}%`, top: `${rip.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center"
          >
            <div className="w-8 h-8 rounded-full border-2 border-white/60 animate-ping" />
            <div
              className={`text-[10px] font-black whitespace-nowrap bg-black/60 px-1.5 py-0.5 rounded-md -mt-2 animate-out fade-out duration-1000 ${rip.color}`}
            >
              {rip.feedback}
            </div>
          </div>
        ))}
      </div>

      {/* Estat de victòria */}
      {isFound && (
        <div className="rounded-xl bg-[#0f4437]/10 border border-[#0f4437]/20 p-2.5 text-center text-xs font-bold text-[#0f4437] flex items-center justify-center gap-1.5 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-[#c89332]" />
          <span>Bravo! Has trobat el Caganer del pessebre!</span>
        </div>
      )}
    </div>
  )
}

