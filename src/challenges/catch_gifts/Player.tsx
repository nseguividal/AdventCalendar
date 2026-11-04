'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { ChallengePlayerProps } from '../types'
import type { CatchGiftsConfig } from './types'
import { Sparkles, Timer, RotateCcw, Play } from 'lucide-react'

interface FallingItem {
  id: number
  emoji: string
  type: 'gift' | 'hazard'
  x: number // percentage 5-90%
  y: number // percentage 0-100%
  speed: number // percentage per tick
}

interface FloatingEffect {
  id: number
  text: string
  x: number
  y: number
  color: string
}

const GIFT_EMOJIS = ['🎁', '🧸', '🎀', '🔔', '🎄', '🍬', '⭐']
const HAZARD_EMOJIS = ['🪨', '❄️']

export function CatchGiftsPlayer({
  config,
  isAlreadySolved,
  onSuccess,
}: ChallengePlayerProps<CatchGiftsConfig>) {
  const targetScore = config.targetScore ?? 8
  const initialDuration = config.durationSeconds ?? 20
  const speedMultiplier = config.speed === 'easy' ? 0.75 : config.speed === 'hard' ? 1.35 : 1.0

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'won' | 'lost'>(
    isAlreadySolved ? 'won' : 'ready'
  )
  const [score, setScore] = useState(isAlreadySolved ? targetScore : 0)
  const [timeLeft, setTimeLeft] = useState(initialDuration)
  const [items, setItems] = useState<FallingItem[]>([])
  const [effects, setEffects] = useState<FloatingEffect[]>([])

  const nextItemId = useRef(1)
  const nextEffectId = useRef(1)
  const lastSpawnTime = useRef(0)

  // Iniciar joc
  const startGame = () => {
    setScore(0)
    setTimeLeft(initialDuration)
    setItems([])
    setEffects([])
    setGameState('playing')
  }

  // Bucle principal del joc
  useEffect(() => {
    if (gameState !== 'playing') return

    // Temporitzador per segons
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState('lost')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Animació de caiguda (~40fps)
    const tickInterval = setInterval(() => {
      const now = Date.now()

      // Generar nous objectes que cauen
      if (now - lastSpawnTime.current > 800 / speedMultiplier) {
        lastSpawnTime.current = now
        const isGift = Math.random() < 0.8
        const emoji = isGift
          ? GIFT_EMOJIS[Math.floor(Math.random() * GIFT_EMOJIS.length)]
          : HAZARD_EMOJIS[Math.floor(Math.random() * HAZARD_EMOJIS.length)]

        const newItem: FallingItem = {
          id: nextItemId.current++,
          emoji,
          type: isGift ? 'gift' : 'hazard',
          x: Math.floor(Math.random() * 80) + 8, // entre 8% i 88%
          y: -8,
          speed: (1.2 + Math.random() * 0.8) * speedMultiplier,
        }

        setItems((prev) => [...prev, newItem])
      }

      // Moure els objectes cap avall i eliminar els que surten de la pantalla
      setItems((prev) =>
        prev
          .map((item) => ({ ...item, y: item.y + item.speed }))
          .filter((item) => item.y < 105)
      )
    }, 35)

    return () => {
      clearInterval(timerInterval)
      clearInterval(tickInterval)
    }
  }, [gameState, speedMultiplier])

  // Clic sobre un objecte que cau
  const handleItemClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, item: FallingItem) => {
      e.stopPropagation()
      if (gameState !== 'playing') return

      // Treure l'objecte de la pantalla
      setItems((prev) => prev.filter((i) => i.id !== item.id))

      // Efecte visual flotant
      const effectText = item.type === 'gift' ? '+1 🎁' : '-1 ❄️'
      const effectColor = item.type === 'gift' ? 'text-amber-300' : 'text-blue-300'
      const newEffect: FloatingEffect = {
        id: nextEffectId.current++,
        text: effectText,
        x: item.x,
        y: Math.max(10, item.y),
        color: effectColor,
      }
      setEffects((prev) => [...prev, newEffect])
      setTimeout(() => {
        setEffects((prev) => prev.filter((ef) => ef.id !== newEffect.id))
      }, 700)

      if (item.type === 'gift') {
        setScore((prev) => {
          const nextScore = prev + 1
          if (nextScore >= targetScore) {
            setGameState('won')
            onSuccess()
          }
          return nextScore
        })
      } else {
        // Penalització lleugera
        setScore((prev) => Math.max(0, prev - 1))
      }
    },
    [gameState, targetScore, onSuccess]
  )

  return (
    <div className="space-y-3 max-w-sm mx-auto select-none">
      {/* Títol */}
      <div className="text-center">
        <h4 className="text-sm font-bold text-[#0f4437]">
          {config.title || 'Atrapa els regals de Nadal!'}
        </h4>
        <p className="text-[11px] text-[#7e7368] mt-0.5">
          Toca els regals que cauen del cel i evita el carbó o gel!
        </p>
      </div>

      {/* Marcador superior */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0f4437]/10 border border-[#0f4437]/20 text-xs font-bold text-[#0f4437]">
        <div className="flex items-center gap-1.5">
          <span>🎁</span>
          <span>
            Regals: {score}/{targetScore}
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[#b91c1c]">
          <Timer className="w-3.5 h-3.5" />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* Camp de joc interactiu */}
      <div className="relative w-full h-72 sm:h-80 rounded-2xl border-2 border-[#0f4437]/30 bg-gradient-to-b from-[#062c23] via-[#0b3c30] to-[#0f4437] overflow-hidden shadow-inner">
        {/* Flocs de neu de fons */}
        <div className="absolute inset-0 pointer-events-none opacity-20 flex justify-around text-white text-xs">
          <span>❄️</span>
          <span>❅</span>
          <span>❄️</span>
          <span>❅</span>
        </div>

        {/* Objectes que cauen */}
        {gameState === 'playing' &&
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={(e) => handleItemClick(e, item)}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-2xl sm:text-3xl active:scale-125 transition-transform cursor-pointer drop-shadow-md hover:scale-110 p-1"
            >
              {item.emoji}
            </button>
          ))}

        {/* Efectes flotants (+1 / -1) */}
        {effects.map((ef) => (
          <div
            key={ef.id}
            style={{ left: `${ef.x}%`, top: `${ef.y}%` }}
            className={`absolute -translate-x-1/2 pointer-events-none font-black text-sm drop-shadow animate-out fade-out slide-out-to-top duration-700 ${ef.color}`}
          >
            {ef.text}
          </div>
        ))}

        {/* Pantalla d'inici */}
        {gameState === 'ready' && (
          <div className="absolute inset-0 bg-[#062c23]/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center text-white space-y-3">
            <span className="text-4xl animate-bounce">🎁</span>
            <div className="space-y-1">
              <h5 className="text-base font-bold text-amber-300">A punt per atrapar regals?</h5>
              <p className="text-xs text-white/80 max-w-[200px]">
                Aconsegueix {targetScore} regals abans que s'acabin els {initialDuration} segons.
              </p>
            </div>
            <button
              type="button"
              onClick={startGame}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#b91c1c] hover:bg-[#a11818] text-white text-xs font-bold rounded-xl transition shadow-lg active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Començar!</span>
            </button>
          </div>
        )}

        {/* Pantalla de derrota */}
        {gameState === 'lost' && (
          <div className="absolute inset-0 bg-[#062c23]/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center text-white space-y-3">
            <span className="text-4xl">⏰</span>
            <div className="space-y-1">
              <h5 className="text-base font-bold text-red-300">S'ha acabat el temps!</h5>
              <p className="text-xs text-white/80">
                Has atrapat {score} de {targetScore} regals.
              </p>
            </div>
            <button
              type="button"
              onClick={startGame}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#b91c1c] hover:bg-[#a11818] text-white text-xs font-bold rounded-xl transition shadow-lg active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Torna-ho a provar</span>
            </button>
          </div>
        )}

        {/* Pantalla de victòria */}
        {gameState === 'won' && (
          <div className="absolute inset-0 bg-[#062c23]/90 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center text-white space-y-2">
            <span className="text-4xl">🎄✨</span>
            <h5 className="text-base font-bold text-amber-300">Molt bé! Els has atrapat tots!</h5>
            <p className="text-xs text-white/90">
              Has aconseguit els {targetScore} regals nadalencs!
            </p>
          </div>
        )}
      </div>

      {/* Estat de victòria visible a sota */}
      {gameState === 'won' && (
        <div className="rounded-xl bg-[#0f4437]/10 border border-[#0f4437]/20 p-2.5 text-center text-xs font-bold text-[#0f4437] flex items-center justify-center gap-1.5 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-[#c89332]" />
          <span>Felicitats! Has salvat el sac de regals!</span>
        </div>
      )}
    </div>
  )
}

