'use client'

import { useState } from 'react'
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from 'react-zoom-pan-pinch'
import { toast } from 'sonner'
import { Lock, Check, Sparkles, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

export interface HitboxPosition {
  day: number
  top: string
  left: string
}

export const HITBOX_POSITIONS: HitboxPosition[] = [
  { day: 1, top: '15%', left: '10%' },
  { day: 2, top: '25%', left: '35%' },
  { day: 3, top: '10%', left: '55%' },
  { day: 4, top: '30%', left: '75%' },
  { day: 5, top: '45%', left: '20%' },
  { day: 6, top: '40%', left: '48%' },
  { day: 7, top: '35%', left: '85%' },
  { day: 8, top: '55%', left: '8%' },
  { day: 9, top: '50%', left: '30%' },
  { day: 10, top: '48%', left: '62%' },
  { day: 11, top: '60%', left: '45%' },
  { day: 12, top: '58%', left: '78%' },
  { day: 13, top: '65%', left: '15%' },
  { day: 14, top: '70%', left: '55%' },
  { day: 15, top: '68%', left: '88%' },
  { day: 16, top: '75%', left: '25%' },
  { day: 17, top: '72%', left: '42%' },
  { day: 18, top: '78%', left: '68%' },
  { day: 19, top: '82%', left: '10%' },
  { day: 20, top: '80%', left: '50%' },
  { day: 21, top: '85%', left: '80%' },
  { day: 22, top: '88%', left: '30%' },
  { day: 23, top: '90%', left: '60%' },
  { day: 24, top: '42%', left: '42%' }, // Central Grand Hall
]

interface VillageMapProps {
  solvedDays: number[]
  onDayClick: (dayNumber: number) => void
}

function ZoomControls() {
  const { zoomIn, zoomOut, resetTransform } = useControls()
  return (
    <div className="absolute top-14 right-3 sm:top-4 sm:right-4 z-30 flex flex-col gap-1 rounded-xl bg-black/70 p-1 backdrop-blur border border-white/20 shadow-lg">
      <button
        onClick={() => zoomIn()}
        className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-white hover:bg-white/20 active:scale-90 transition"
        title="Apropar"
        aria-label="Apropar"
      >
        <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFD700]" />
      </button>
      <button
        onClick={() => zoomOut()}
        className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-white hover:bg-white/20 active:scale-90 transition"
        title="Allunyar"
        aria-label="Allunyar"
      >
        <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFD700]" />
      </button>
      <button
        onClick={() => resetTransform()}
        className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-white hover:bg-white/20 active:scale-90 transition"
        title="Restablir mapa"
        aria-label="Restablir mapa"
      >
        <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFD700]" />
      </button>
    </div>
  )
}

export function VillageMap({ solvedDays, onDayClick }: VillageMapProps) {
  const [shakingDay, setShakingDay] = useState<number | null>(null)
  const [devUnlockAll, setDevUnlockAll] = useState(false)

  /**
   * Time-Lock Logic:
   * Client-side verification using JavaScript's Date() object:
   * Verify current month is December (month 11 in JS) and currentDay >= door clicked.
   */
  const checkIsUnlocked = (doorNumber: number): boolean => {
    if (devUnlockAll) return true

    const now = new Date()
    const month = now.getMonth() // 0 = Jan, 11 = Dec
    const currentDay = now.getDate()

    // Strict client-side check: month is December AND currentDay >= doorNumber
    return month === 11 && currentDay >= doorNumber
  }

  const handleDoorClick = (dayNumber: number) => {
    const isUnlocked = checkIsUnlocked(dayNumber)

    if (!isUnlocked) {
      // Trigger CSS shake animation on the hitbox
      setShakingDay(dayNumber)
      setTimeout(() => setShakingDay(null), 500)

      // Toast notification
      toast.error("Encara no és l'hora! ❄️", {
        description: `El dia ${dayNumber} es desbloqueja el ${dayNumber} de desembre. Paciència, petit follet!`,
        duration: 3000,
      })
      return
    }

    onDayClick(dayNumber)
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#1B4332] select-none [touch-action:none]">
      {/* Dev Mode switch for testing outside of December */}
      <div className="absolute top-14 left-3 sm:top-4 sm:left-4 z-30 flex items-center gap-1.5 rounded-xl bg-black/70 px-2.5 py-1 backdrop-blur border border-white/20 text-[10px] sm:text-[11px] text-white shadow-md">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={devUnlockAll}
            onChange={(e) => {
              setDevUnlockAll(e.target.checked)
              if (e.target.checked) {
                toast.info('Mode de prova activat: Les 24 portes s\'han desbloquejat!')
              }
            }}
            className="h-3 w-3 rounded border-[#D4A843] text-[#C41E3A] focus:ring-[#D4A843]"
          />
          <span className="text-[#FFD700] font-medium whitespace-nowrap">Mode prova</span>
        </label>
      </div>

      <TransformWrapper
        initialScale={0.7}
        minScale={0.35}
        maxScale={2.5}
        centerOnInit={true}
        wheel={{ step: 0.1 }}
        pinch={{ step: 5 }}
        doubleClick={{ disabled: false, mode: 'zoomIn' }}
      >
        <ZoomControls />
        <TransformComponent
          wrapperClass="!w-full !h-full cursor-grab active:cursor-grabbing"
          contentClass="!w-fit !h-fit"
        >
          {/* Main Map Container holding 2400x1600 illustration */}
          <div className="relative w-[2400px] h-[1600px] select-none pointer-events-auto">
            {/* Snowy Christmas Village Background SVG */}
            <img
              src="/village-map.svg"
              alt="Christmas Village Map"
              width={2400}
              height={1600}
              draggable={false}
              className="w-full h-full object-cover pointer-events-none"
            />

            {/* 24 Interactive Door Hitboxes */}
            {HITBOX_POSITIONS.map(({ day, top, left }) => {
              const isUnlocked = checkIsUnlocked(day)
              const isSolved = solvedDays.includes(day)
              const isShaking = shakingDay === day
              const isDay24 = day === 24

              return (
                <div
                  key={day}
                  style={{ top, left }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <button
                    onClick={() => handleDoorClick(day)}
                    aria-label={`Day ${day} ${
                      isSolved ? 'Solved' : isUnlocked ? 'Unlocked' : 'Locked'
                    }`}
                    className={`relative flex items-center justify-center rounded-2xl font-black transition-all duration-300 shadow-xl border-2 active:scale-95 ${
                      isDay24 ? 'w-16 h-16 text-xl' : 'w-12 h-12 text-base'
                    } ${isShaking ? 'animate-shake' : ''} ${
                      isSolved
                        ? 'bg-[#2D6A4F] text-[#FFD700] border-[#FFD700] shadow-[0_0_15px_rgba(45,106,79,0.8)]'
                        : isUnlocked
                        ? 'bg-gradient-to-br from-[#C41E3A] to-[#8B1A1A] text-white border-[#FFD700] animate-pulse-glow shadow-[0_0_20px_rgba(212,168,67,0.8)] hover:scale-110'
                        : 'bg-slate-900/80 text-white/40 border-white/20 shadow-md backdrop-blur-sm opacity-65 hover:opacity-85'
                    }`}
                  >
                    {/* Status Badge Icon */}
                    {isSolved ? (
                      <div className="flex flex-col items-center">
                        <Check className="w-5 h-5 text-[#FFD700] stroke-[3]" />
                        <span className="text-[10px] leading-none text-white/90">{day}</span>
                      </div>
                    ) : isUnlocked ? (
                      <div className="flex flex-col items-center">
                        {isDay24 && (
                          <Sparkles className="w-3.5 h-3.5 text-[#FFD700] animate-spin" />
                        )}
                        <span>{day}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-0.5">
                        <Lock className="w-3.5 h-3.5 text-white/40" />
                        <span className="text-[10px] leading-none">{day}</span>
                      </div>
                    )}

                    {/* Day 24 Ribbon Flag */}
                    {isDay24 && (
                      <div className="absolute -top-3 -right-2 rounded-full bg-[#FFD700] px-1.5 py-0.5 text-[8px] font-extrabold text-black uppercase shadow">
                        Vigília
                      </div>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  )
}

