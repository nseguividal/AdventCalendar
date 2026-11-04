'use client'

import { useState, useEffect, useRef } from 'react'
import type { ChallengePlayerProps } from '../types'
import type { BellsMemoryConfig } from './types'
import { Sparkles, Play, RotateCcw, Volume2 } from 'lucide-react'

interface BellDef {
  id: number
  name: string
  color: string
  activeColor: string
  borderColor: string
  textColor: string
  freq: number // Hz
}

const BELLS: BellDef[] = [
  {
    id: 0,
    name: 'Vermella',
    color: 'bg-red-600',
    activeColor: 'bg-red-400 ring-4 ring-red-300 scale-105',
    borderColor: 'border-red-700',
    textColor: 'text-red-100',
    freq: 261.63, // C4
  },
  {
    id: 1,
    name: 'Daurada',
    color: 'bg-amber-500',
    activeColor: 'bg-amber-300 ring-4 ring-amber-200 scale-105',
    borderColor: 'border-amber-600',
    textColor: 'text-amber-100',
    freq: 329.63, // E4
  },
  {
    id: 2,
    name: 'Verda',
    color: 'bg-emerald-600',
    activeColor: 'bg-emerald-400 ring-4 ring-emerald-300 scale-105',
    borderColor: 'border-emerald-700',
    textColor: 'text-emerald-100',
    freq: 392.0, // G4
  },
  {
    id: 3,
    name: 'Blava',
    color: 'bg-cyan-600',
    activeColor: 'bg-cyan-400 ring-4 ring-cyan-200 scale-105',
    borderColor: 'border-cyan-700',
    textColor: 'text-cyan-100',
    freq: 523.25, // C5
  },
]

// Sintetitzador de so de campana mitjançant Web Audio API
function playBellSound(freq: number) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, ctx.currentTime)

    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.6)
  } catch {
    // Si l'àudio està silenciat pel navegador no passa res
  }
}

export function BellsMemoryPlayer({
  config,
  isAlreadySolved,
  onSuccess,
}: ChallengePlayerProps<BellsMemoryConfig>) {
  const targetRounds = config.rounds ?? 4

  const [gameState, setGameState] = useState<'idle' | 'showing' | 'player' | 'won' | 'fail'>(
    isAlreadySolved ? 'won' : 'idle'
  )
  const [sequence, setSequence] = useState<number[]>([])
  const [playerStep, setPlayerStep] = useState(0)
  const [activeBell, setActiveBell] = useState<number | null>(null)
  const [round, setRound] = useState(1)

  const timeoutsRef = useRef<NodeJS.Timeout[]>([])

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }

  // Començar el joc
  const startNewGame = () => {
    clearAllTimeouts()
    // Generar seqüència aleatòria de longitud targetRounds
    const newSeq = Array.from({ length: targetRounds }, () => Math.floor(Math.random() * 4))
    setSequence(newSeq)
    setRound(1)
    setPlayerStep(0)
    playSequenceForRound(newSeq, 1)
  }

  // Reproduir la seqüència fins a la ronda actual
  const playSequenceForRound = (seq: number[], currentRound: number) => {
    clearAllTimeouts()
    setGameState('showing')
    setPlayerStep(0)

    const subSeq = seq.slice(0, currentRound)

    subSeq.forEach((bellId, index) => {
      // Activar campana
      const tOn = setTimeout(() => {
        setActiveBell(bellId)
        playBellSound(BELLS[bellId].freq)
      }, index * 750 + 400)

      // Desactivar campana
      const tOff = setTimeout(() => {
        setActiveBell(null)
      }, index * 750 + 850)

      timeoutsRef.current.push(tOn, tOff)
    })

    // Donar el torn al jugador
    const tEnd = setTimeout(() => {
      setActiveBell(null)
      setGameState('player')
    }, subSeq.length * 750 + 600)

    timeoutsRef.current.push(tEnd)
  }

  // Clic de l'usuari sobre una campana
  const handleBellClick = (bellId: number) => {
    if (gameState !== 'player') return

    playBellSound(BELLS[bellId].freq)
    setActiveBell(bellId)
    setTimeout(() => setActiveBell(null), 250)

    const expected = sequence[playerStep]

    if (bellId === expected) {
      // Nota correcta
      const nextStep = playerStep + 1

      if (nextStep >= round) {
        // Ronda completada!
        if (round >= targetRounds) {
          // Joc superat!
          setGameState('won')
          onSuccess()
        } else {
          // Següent ronda amb una nota més
          const nextRound = round + 1
          setRound(nextRound)
          setGameState('showing')
          setTimeout(() => {
            playSequenceForRound(sequence, nextRound)
          }, 800)
        }
      } else {
        setPlayerStep(nextStep)
      }
    } else {
      // Error
      setGameState('fail')
    }
  }

  useEffect(() => {
    return () => clearAllTimeouts()
  }, [])

  return (
    <div className="space-y-4 max-w-sm mx-auto select-none">
      {/* Títol */}
      <div className="text-center">
        <h4 className="text-sm font-bold text-[#0f4437]">
          {config.title || 'Campanes de Nadal'}
        </h4>
        <p className="text-[11px] text-[#7e7368] mt-0.5">
          {gameState === 'showing'
            ? '👂 Escolta i mira la melodia...'
            : gameState === 'player'
            ? `Toca les campanes (${playerStep}/${round})`
            : gameState === 'won'
            ? '✨ Has completat tota la melodia!'
            : gameState === 'fail'
            ? 'T\'has equivocat de campana!'
            : 'Recorda la seqüència i repeteix-la!'}
        </p>
      </div>

      {/* Indicador de Progrés de Rondes */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#0f4437]/10 border border-[#0f4437]/20 text-xs font-bold text-[#0f4437]">
        <div className="flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-[#248896]" />
          <span>Melodia de Nadal</span>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: targetRounds }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i < round - (gameState === 'player' ? 1 : 0) || gameState === 'won'
                  ? 'bg-[#0f4437]'
                  : i === round - 1 && gameState === 'player'
                  ? 'bg-[#248896] animate-pulse'
                  : 'bg-[#d8cdbf]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Quadrícula de les 4 Campanes */}
      <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-[#f4ede3] border border-[#e8dfd3]">
        {BELLS.map((bell) => {
          const isActive = activeBell === bell.id
          return (
            <button
              key={bell.id}
              type="button"
              disabled={gameState === 'showing' || gameState === 'won'}
              onClick={() => handleBellClick(bell.id)}
              className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center p-3 text-white border-b-4 transition-all duration-150 shadow-sm ${
                bell.color
              } ${bell.borderColor} ${
                isActive ? bell.activeColor : 'hover:brightness-105 active:scale-95'
              } disabled:opacity-90`}
            >
              <span className={`text-4xl transition-transform ${isActive ? 'scale-125' : ''}`}>
                🔔
              </span>
              <span className={`text-[11px] font-bold mt-1 ${bell.textColor}`}>
                {bell.name}
              </span>
            </button>
          )
        })}
      </div>

      {/* Botons d'estat / Reintent */}
      {gameState === 'idle' && (
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={startNewGame}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0f4437] hover:bg-[#145647] text-white text-xs font-bold rounded-xl transition shadow-xs active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Tocar la melodia</span>
          </button>
        </div>
      )}

      {gameState === 'fail' && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-center space-y-2 animate-in fade-in">
          <p className="text-xs text-red-800">
            Aquesta no era la campana correcta!
          </p>
          <button
            type="button"
            onClick={() => playSequenceForRound(sequence, round)}
            className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[#b91c1c] text-white text-xs font-bold rounded-lg hover:bg-[#a11818] transition active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Tornar a escoltar
          </button>
        </div>
      )}

      {/* Estat de victòria */}
      {gameState === 'won' && (
        <div className="rounded-xl bg-[#0f4437]/10 border border-[#0f4437]/20 p-2.5 text-center text-xs font-bold text-[#0f4437] flex items-center justify-center gap-1.5 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-[#c89332]" />
          <span>Perfecte! Has tocat tota la melodia nadalenca!</span>
        </div>
      )}
    </div>
  )
}

