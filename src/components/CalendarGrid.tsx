'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

export interface DoorLayout {
  day: number
  colStart: number
  rowStart: number
  colSpan: number
  rowSpan: number
  className: string
}

/**
 * Mosaic 6 x 7 perfecte i unificat (Àrea total = 42 unitats):
 * - La mateixa estructura i geometria exacta tant per a MÒBIL com per a ORDINADOR.
 * - Dia 24 al centre geomètric (Files 3-5, Columnes 3-4, mida 2x3).
 * - Números desordenats per tota la quadrícula respectant la mida nativa de cada imatge.
 * - Proporció aspect-[6/7] que fa que cada unitat 1x1 sigui un quadrat matemàticament idèntic en qualsevol pantalla.
 */
const DOORS_MOSAIC: DoorLayout[] = [
  // Fila 1 (6 columnes): 4(1x1), 17(2x1), 7(1x1), 11(1x1), 14(1x1)
  { day: 4, colStart: 1, rowStart: 1, colSpan: 1, rowSpan: 1, className: 'col-start-1 row-start-1 col-span-1 row-span-1' },
  { day: 17, colStart: 2, rowStart: 1, colSpan: 2, rowSpan: 1, className: 'col-start-2 row-start-1 col-span-2 row-span-1' },
  { day: 7, colStart: 4, rowStart: 1, colSpan: 1, rowSpan: 1, className: 'col-start-4 row-start-1 col-span-1 row-span-1' },
  { day: 11, colStart: 5, rowStart: 1, colSpan: 1, rowSpan: 1, className: 'col-start-5 row-start-1 col-span-1 row-span-1' },
  { day: 14, colStart: 6, rowStart: 1, colSpan: 1, rowSpan: 1, className: 'col-start-6 row-start-1 col-span-1 row-span-1' },

  // Fila 2 (6 columnes): 13(2x2 gran esquerra), 2(2x1), 8(1x1), 22(1x1)
  { day: 13, colStart: 1, rowStart: 2, colSpan: 2, rowSpan: 2, className: 'col-start-1 row-start-2 col-span-2 row-span-2' },
  { day: 2, colStart: 3, rowStart: 2, colSpan: 2, rowSpan: 1, className: 'col-start-3 row-start-2 col-span-2 row-span-1' },
  { day: 8, colStart: 5, rowStart: 2, colSpan: 1, rowSpan: 1, className: 'col-start-5 row-start-2 col-span-1 row-span-1' },
  { day: 22, colStart: 6, rowStart: 2, colSpan: 1, rowSpan: 1, className: 'col-start-6 row-start-2 col-span-1 row-span-1' },

  // Fila 3: Dia 24 (AL MIG! 2 ample x 3 alçada), 9(1x1) i 18(1x1) a la dreta
  { day: 24, colStart: 3, rowStart: 3, colSpan: 2, rowSpan: 3, className: 'col-start-3 row-start-3 col-span-2 row-span-3' },
  { day: 9, colStart: 5, rowStart: 3, colSpan: 1, rowSpan: 1, className: 'col-start-5 row-start-3 col-span-1 row-span-1' },
  { day: 18, colStart: 6, rowStart: 3, colSpan: 1, rowSpan: 1, className: 'col-start-6 row-start-3 col-span-1 row-span-1' },

  // Fila 4: 15(1x2 alt), 20(1x1), 24(al mig), 5(2x2 gran dreta)
  { day: 15, colStart: 1, rowStart: 4, colSpan: 1, rowSpan: 2, className: 'col-start-1 row-start-4 col-span-1 row-span-2' },
  { day: 20, colStart: 2, rowStart: 4, colSpan: 1, rowSpan: 1, className: 'col-start-2 row-start-4 col-span-1 row-span-1' },
  { day: 5, colStart: 5, rowStart: 4, colSpan: 2, rowSpan: 2, className: 'col-start-5 row-start-4 col-span-2 row-span-2' },

  // Fila 5: 12(1x2 alt), 24(al mig), 5(dreta)
  { day: 12, colStart: 2, rowStart: 5, colSpan: 1, rowSpan: 2, className: 'col-start-2 row-start-5 col-span-1 row-span-2' },

  // Fila 6 (6 columnes): 3(1x1), 19(2x1), 6(2x1)
  { day: 3, colStart: 1, rowStart: 6, colSpan: 1, rowSpan: 1, className: 'col-start-1 row-start-6 col-span-1 row-span-1' },
  { day: 19, colStart: 3, rowStart: 6, colSpan: 2, rowSpan: 1, className: 'col-start-3 row-start-6 col-span-2 row-span-1' },
  { day: 6, colStart: 5, rowStart: 6, colSpan: 2, rowSpan: 1, className: 'col-start-5 row-start-6 col-span-2 row-span-1' },

  // Fila 7 (6 columnes): 16(2x1), 1(1x1), 23(1x1), 10(1x1), 21(1x1)
  { day: 16, colStart: 1, rowStart: 7, colSpan: 2, rowSpan: 1, className: 'col-start-1 row-start-7 col-span-2 row-span-1' },
  { day: 1, colStart: 3, rowStart: 7, colSpan: 1, rowSpan: 1, className: 'col-start-3 row-start-7 col-span-1 row-span-1' },
  { day: 23, colStart: 4, rowStart: 7, colSpan: 1, rowSpan: 1, className: 'col-start-4 row-start-7 col-span-1 row-span-1' },
  { day: 10, colStart: 5, rowStart: 7, colSpan: 1, rowSpan: 1, className: 'col-start-5 row-start-7 col-span-1 row-span-1' },
  { day: 21, colStart: 6, rowStart: 7, colSpan: 1, rowSpan: 1, className: 'col-start-6 row-start-7 col-span-1 row-span-1' },
]

interface CalendarGridProps {
  solvedDays: number[]
  onDayClick: (dayNumber: number) => void
}

export function CalendarGrid({ solvedDays, onDayClick }: CalendarGridProps) {
  const [shakingDay, setShakingDay] = useState<number | null>(null)
  const [devUnlockAll, setDevUnlockAll] = useState(false)

  // Comprovació estricta del dia (només desembre i data actual >= dia de la casella)
  const checkIsUnlocked = (doorNumber: number): boolean => {
    if (devUnlockAll) return true
    const now = new Date()
    return now.getMonth() === 11 && now.getDate() >= doorNumber
  }

  const handleDoorClick = (dayNumber: number) => {
    const isUnlocked = checkIsUnlocked(dayNumber)

    if (!isUnlocked) {
      setShakingDay(dayNumber)
      setTimeout(() => setShakingDay(null), 500)
      return
    }

    onDayClick(dayNumber)
  }

  return (
    <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl mx-auto px-2.5 sm:px-4 md:px-6 pt-16 sm:pt-20 pb-24">
      {/* Selector Mode Prova */}
      <div className="flex justify-end mb-2.5 sm:mb-3.5">
        <label className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-white/80 px-2.5 py-1 sm:px-3.5 sm:py-1.5 backdrop-blur border border-[#e5ded4] text-[10px] sm:text-xs text-[#2b2b2b] shadow-xs cursor-pointer hover:bg-white transition">
          <input
            type="checkbox"
            checked={devUnlockAll}
            onChange={(e) => setDevUnlockAll(e.target.checked)}
            className="h-3 w-3 sm:h-3.5 sm:w-3.5 rounded border-[#c7beb2] text-[#8B1A1A] focus:ring-[#8B1A1A]"
          />
          <span className="font-medium text-[#524a42]">
            Mode prova (Desbloquejar tot)
          </span>
        </label>
      </div>

      {/* 
        Bento Grid estructurat (6 columnes x 7 files unificat mòbil & ordinador):
        - Rectangle complet i tancat sense cap buit.
        - Dia 24 al centre geomètric (columna 3-4, fila 3-5).
        - Proporció aspect-[6/7] que garanteix caselles quadrades i encaix perfecte en mòbil.
      */}
      <div
        className="grid grid-cols-6 aspect-[6/7] w-full gap-1.5 sm:gap-2.5 md:gap-3"
        style={{
          gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(7, minmax(0, 1fr))',
        }}
      >
        {DOORS_MOSAIC.map(({ day, colStart, rowStart, colSpan, rowSpan, className }) => {
          const isSolved = solvedDays.includes(day)
          const isShaking = shakingDay === day

          return (
            <button
              key={day}
              onClick={() => handleDoorClick(day)}
              className={`group relative overflow-hidden rounded-lg sm:rounded-2xl md:rounded-3xl transition-all duration-300 select-none shadow-xs hover:shadow-md active:scale-[0.97] ${className} ${
                isShaking ? 'animate-shake' : ''
              }`}
              style={{
                backgroundColor: '#0f4437',
                gridColumn: `${colStart} / span ${colSpan}`,
                gridRow: `${rowStart} / span ${rowSpan}`,
              }}
            >
              {/* Imatge de la casella */}
              <img
                src={`/doors/${day}.png`}
                alt={`Dia ${day}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />

              {/* Marca discreta només si el dia ja ha estat resolt */}
              {isSolved && (
                <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 md:top-2 md:right-2 z-10 flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-[#0f4437] text-[#fdfbf7] shadow-xs border border-[#248896]/60">
                  <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 stroke-[3]" />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
