'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Image as ImageIcon, X } from 'lucide-react'
import confetti from 'canvas-confetti'

interface PuzzleRevealProps {
  puzzleImageUrl: string | null
  solvedDays: number[]
  isOpen?: boolean
  onClose?: () => void
  onOpen?: () => void
  highlightDay?: number | null
  onHighlightComplete?: () => void
}

type RevealStage = 'idle' | 'suspense' | 'charging' | 'unveiling' | 'celebrating'

interface GiftTheme {
  name: string
  boxGradient: string
  ribbonGradient: string
  tagTextColor: string
  bowEmoji: string
  confettiColors: string[]
}

const GIFT_THEMES: GiftTheme[] = [
  // 1. Vermell nadalenc clàssic amb or
  {
    name: 'classic-red',
    boxGradient: 'from-[#c92a2a] via-[#b91c1c] to-[#8b1a1a]',
    ribbonGradient: 'from-[#ffd700] via-[#fef08a] to-[#ca8a04]',
    tagTextColor: 'text-[#b91c1c]',
    bowEmoji: '🎀',
    confettiColors: ['#b91c1c', '#ffd700', '#ffffff', '#ea580c'],
  },
  // 2. Verd avet bosc amb cinta daurada
  {
    name: 'pine-green',
    boxGradient: 'from-[#15803d] via-[#0f4437] to-[#062c23]',
    ribbonGradient: 'from-[#ffd700] via-[#fef08a] to-[#ca8a04]',
    tagTextColor: 'text-[#0f4437]',
    bowEmoji: '🎀',
    confettiColors: ['#0f4437', '#16a34a', '#ffd700', '#ffffff'],
  },
  // 3. Blau nòrdic / Tecla amb or suau
  {
    name: 'nordic-teal',
    boxGradient: 'from-[#0891b2] via-[#248896] to-[#0e4e59]',
    ribbonGradient: 'from-[#fef08a] via-[#ffffff] to-[#ffd700]',
    tagTextColor: 'text-[#0e4e59]',
    bowEmoji: '🎀',
    confettiColors: ['#248896', '#06b6d4', '#ffd700', '#ffffff'],
  },
  // 4. Vi calent / Pruna d'hivern amb or rosa
  {
    name: 'mulled-wine',
    boxGradient: 'from-[#9d174d] via-[#831843] to-[#500724]',
    ribbonGradient: 'from-[#fde047] via-[#fef08a] to-[#eab308]',
    tagTextColor: 'text-[#831843]',
    bowEmoji: '🎀',
    confettiColors: ['#831843', '#f43f5e', '#ffd700', '#ffffff'],
  },
  // 5. Blau nit estrellada amb cinta d'argent i or
  {
    name: 'midnight-navy',
    boxGradient: 'from-[#1e3a8a] via-[#172554] to-[#0f172a]',
    ribbonGradient: 'from-[#ffd700] via-[#e2e8f0] to-[#ca8a04]',
    tagTextColor: 'text-[#1e3a8a]',
    bowEmoji: '✨',
    confettiColors: ['#1e3a8a', '#3b82f6', '#ffd700', '#ffffff'],
  },
  // 6. Or imperial amb cinta vermella (especial per a dies destacats)
  {
    name: 'royal-gold',
    boxGradient: 'from-[#eab308] via-[#ca8a04] to-[#854d0e]',
    ribbonGradient: 'from-[#ef4444] via-[#dc2626] to-[#991b1b]',
    tagTextColor: 'text-[#854d0e]',
    bowEmoji: '⭐',
    confettiColors: ['#ffd700', '#ca8a04', '#b91c1c', '#ffffff'],
  },
]

// Distribució desordenada (random) dels 24 dies sobre la quadrícula de 6x4 del trencaclosques
const PUZZLE_TILES_ORDER = [
  14,  3, 19,  8, 22,  5,
   9, 16,  1, 24, 11, 18,
  21,  6, 13,  4, 17,  2,
  12, 23, 10, 15,  7, 20,
]

function getGiftTheme(dayNumber: number): GiftTheme {
  // Dia 24 (Nit de Nadal): Regal gran d'or imperial
  if (dayNumber === 24) {
    return GIFT_THEMES[5]
  }
  return GIFT_THEMES[(dayNumber - 1) % GIFT_THEMES.length]
}

export function PuzzleReveal({
  puzzleImageUrl,
  solvedDays,
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  onOpen: controlledOnOpen,
  highlightDay,
  onHighlightComplete,
}: PuzzleRevealProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isModalOpen =
    controlledIsOpen !== undefined
      ? controlledIsOpen || internalIsOpen
      : internalIsOpen

  // Fases de l'animació de revelació del regal
  const [revealStage, setRevealStage] = useState<RevealStage>('idle')
  const [activeHighlightDay, setActiveHighlightDay] = useState<number | null>(null)

  const totalSolved = solvedDays.length

  const handleOpen = () => {
    setInternalIsOpen(true)
    if (controlledOnOpen) {
      controlledOnOpen()
    }
  }

  const handleClose = () => {
    setInternalIsOpen(false)
    if (controlledOnClose) {
      controlledOnClose()
    }
    setActiveHighlightDay(null)
    setRevealStage('idle')
  }

  // Seqüència de revelació del regal de Nadal
  useEffect(() => {
    if (isModalOpen && highlightDay) {
      setActiveHighlightDay(highlightDay)
      setRevealStage('suspense')
      const theme = getGiftTheme(highlightDay)

      // Etapa 1 -> Etapa 2: El regal tremola d'emoció (als 1.1s)
      const t1 = setTimeout(() => {
        setRevealStage('charging')

        // Petites espurnes que coincideixen amb els colors d'aquest regal
        try {
          confetti({
            particleCount: 25,
            spread: 50,
            origin: { y: 0.55 },
            colors: theme.confettiColors,
          })
        } catch {}
      }, 1100)

      // Etapa 2 -> Etapa 3: El regal EXPLOTA revelant la foto! (als 2.3s)
      const t2 = setTimeout(() => {
        setRevealStage('unveiling')

        // Gran explosió de confeti amb la paleta del regal
        try {
          confetti({
            particleCount: 95,
            spread: 85,
            origin: { y: 0.55 },
            colors: [...theme.confettiColors, '#ffffff'],
          })
        } catch {}
      }, 2300)

      // Etapa 3 -> Etapa 4: Celebració final (als 3.5s)
      const t3 = setTimeout(() => {
        setRevealStage('celebrating')

        if (onHighlightComplete) {
          onHighlightComplete()
        }
      }, 3500)

      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
      }
    } else {
      setRevealStage('idle')
      setActiveHighlightDay(null)
    }
  }, [isModalOpen, highlightDay, onHighlightComplete])

  // Imatge per defecte nadalenca si l'administrador encara no n'ha pujat cap
  const imageUrl =
    puzzleImageUrl ||
    'https://images.unsplash.com/photo-1543258103-a62bdc069871?auto=format&fit=crop&w=1200&q=80'

  // El comptador avança fluidament a l'etapa de revelació
  const isRevealedYet =
    revealStage === 'unveiling' || revealStage === 'celebrating' || !activeHighlightDay

  const displayedCount = isRevealedYet
    ? totalSolved
    : Math.max(0, totalSolved - 1)

  return (
    <>
      {/* Botó flotant sempre disponible per obrir */}
      <button
        type="button"
        onClick={handleOpen}
        className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-40 flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#e5ded4] bg-white/95 px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold text-[#b91c1c] shadow-sm hover:shadow-md hover:bg-white active:scale-95 transition backdrop-blur"
      >
        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#b91c1c]" />
        <span>Trencaclosques ({totalSolved}/24)</span>
      </button>

      {/* Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0a2c22]/65 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto overscroll-contain rounded-3xl border border-[#e8dfd3] bg-[#fdfbf7] p-4 sm:p-6 text-[#2c2825] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#e8dfd3] mb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#0f4437]/10 text-[#0f4437]">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0f4437]">
                    El Gran Secret de Nadal
                  </h3>
                  <p className="text-xs text-[#7e7368]">
                    Descobreix la fotografia familiar oculta
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="rounded-full bg-[#f4ede3] p-1.5 text-[#6e6358] hover:bg-[#eae0d2] hover:text-[#2c2825] transition"
                aria-label="Tancar finestra"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subtítol fix d'una sola línia */}
            <p className="text-xs text-[#6e6358] mb-3.5 text-center">
              Resol les endevinalles de cada dia per descobrir la imatge secreta familiar ✨
            </p>

            {/* Barra de progrés amb transició suau */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-[#0f4437] font-semibold mb-1.5">
                <span>Record desbloquejat</span>
                <span className="transition-all duration-500 font-mono">
                  {displayedCount} de 24 peces ({Math.round((displayedCount / 24) * 100)}%)
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#ede4d8] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#248896] to-[#0f4437] transition-all duration-1000 ease-out"
                  style={{ width: `${(displayedCount / 24) * 100}%` }}
                />
              </div>
            </div>

            {/* Puzzle Grid Box (Aspect Ratio exacte 3:2 = 6 columnes x 4 files de caselles quadrades) */}
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl border border-[#e5ded4] shadow-inner bg-[#ede4d8]">
              <img
                src={imageUrl}
                alt="Trencaclosques secret de la família"
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* 24-Square Grid Overlay (6 columnes x 4 files desordenades, gap-0 per tapar completament la imatge) */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-0">
                {PUZZLE_TILES_ORDER.map((day) => {
                  const isAlreadySolved = solvedDays.includes(day)
                  const isThisHighlight = activeHighlightDay === day

                  // Si és la peça que s'està destapant: Regal de Nadal temàtic
                  if (isThisHighlight) {
                    const theme = getGiftTheme(day)

                    return (
                      <div
                        key={day}
                        className="relative flex items-center justify-center select-none"
                      >
                        {/* Regal de Nadal amb colors únics segons el dia */}
                        <div
                          className={`absolute inset-0 flex items-center justify-center overflow-hidden transition-all ${
                            revealStage === 'idle' || revealStage === 'suspense'
                              ? `bg-gradient-to-br ${theme.boxGradient} shadow-2xl scale-105 z-30 animate-pulse`
                              : revealStage === 'charging'
                              ? `bg-gradient-to-br ${theme.boxGradient} shadow-2xl scale-120 z-30 animate-shake`
                              : revealStage === 'unveiling'
                              ? `bg-gradient-to-br ${theme.boxGradient} opacity-0 scale-160 rotate-12 blur-xs z-30 duration-1000 ease-out pointer-events-none`
                              : 'opacity-0 pointer-events-none'
                          }`}
                        >
                          {/* Cinta vertical */}
                          <div
                            className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-2 sm:w-2.5 bg-gradient-to-r ${theme.ribbonGradient} shadow-xs`}
                          />
                          {/* Cinta horitzontal */}
                          <div
                            className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 sm:h-2.5 bg-gradient-to-b ${theme.ribbonGradient} shadow-xs`}
                          />

                          {/* Llaç del regal al centre */}
                          <div className="relative z-10 flex items-center justify-center">
                            <span className="text-sm sm:text-base drop-shadow-md select-none">
                              {theme.bowEmoji}
                            </span>
                          </div>

                          {/* Etiqueta amb el número del dia */}
                          <div
                            className={`absolute top-1 left-1 px-1 py-0.5 rounded bg-white/95 ${theme.tagTextColor} font-black text-[9px] leading-none shadow-xs border border-white/50 z-20`}
                          >
                            {day}
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // Totes les altres peces normals cobertes (sense escletxes entre finestres)
                  return (
                    <div
                      key={day}
                      className={`relative flex items-center justify-center font-bold text-xs transition-opacity duration-700 select-none ${
                        isAlreadySolved
                          ? 'opacity-0 pointer-events-none'
                          : 'opacity-100 bg-[#0f4437] border border-[#145647] shadow-[0_0_0_1px_#0f4437] text-[#faf6f2]'
                      }`}
                    >
                      <span className="drop-shadow-xs">{day}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Botó inferior per tornar al calendari (sempre disponible) */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleClose}
                className="w-full rounded-xl bg-[#0f4437] hover:bg-[#145647] py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-xs transition active:scale-[0.98]"
              >
                Continuar explorant el calendari
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
