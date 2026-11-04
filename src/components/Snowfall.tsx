'use client'

import { useEffect, useState } from 'react'

interface SnowflakeData {
  id: number
  left: string
  fontSize: string
  opacity: number
  animationDuration: string
  animationDelay: string
  character: string
}

const SNOW_CHARS = ['❄', '❅', '•', '❄', '❅', '✻']

export function Snowfall({ count = 35 }: { count?: number }) {
  const [flakes, setFlakes] = useState<SnowflakeData[]>([])

  useEffect(() => {
    // Generem els flocs només al client per evitar qualsevol diferència de renderitzat SSR
    const generated: SnowflakeData[] = Array.from({ length: count }, (_, i) => {
      // Mides variades: de 10px a 24px
      const sizePx = Math.floor(Math.random() * 14 + 10)
      // Velocitats variades: entre 7s i 16s
      const durationSec = (Math.random() * 9 + 7).toFixed(1)
      // Retard negatiu: la neu ja està caient per tota la pantalla des del primer mil·lisegon
      const delaySec = -(Math.random() * 15).toFixed(1)
      // Opacitat variada
      const opacity = Number((Math.random() * 0.6 + 0.25).toFixed(2))
      // Posició horitzontal aleatòria (0% a 100%)
      const left = `${(Math.random() * 100).toFixed(1)}%`
      const character = SNOW_CHARS[Math.floor(Math.random() * SNOW_CHARS.length)]

      return {
        id: i,
        left,
        fontSize: `${sizePx}px`,
        opacity,
        animationDuration: `${durationSec}s`,
        animationDelay: `${delaySec}s`,
        character,
      }
    })

    setFlakes(generated)
  }, [count])

  if (flakes.length === 0) return null

  return (
    <>
      <style>{`
        @keyframes snowfall-fall {
          0% {
            transform: translate3d(0, -60px, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(24px, 55vh, 0) rotate(180deg);
          }
          100% {
            transform: translate3d(-18px, 110vh, 0) rotate(360deg);
          }
        }
      `}</style>

      <div
        className="pointer-events-none fixed inset-0 z-20 overflow-hidden select-none"
        aria-hidden="true"
      >
        {flakes.map((flake) => (
          <div
            key={flake.id}
            className="absolute drop-shadow-[0_1px_2px_rgba(15,68,55,0.25)] select-none text-white pointer-events-none"
            style={{
              top: '-60px',
              left: flake.left,
              fontSize: flake.fontSize,
              opacity: flake.opacity,
              animationName: 'snowfall-fall',
              animationDuration: flake.animationDuration,
              animationDelay: flake.animationDelay,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              willChange: 'transform',
            }}
          >
            {flake.character}
          </div>
        ))}
      </div>
    </>
  )
}
