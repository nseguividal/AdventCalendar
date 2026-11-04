'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type { ChallengePlayerProps } from '../types'
import type { SnowglobesConfig, GlobeItem } from './types'
import { Sparkles, RotateCcw } from 'lucide-react'

// Les 14 ciutats completes del joc
export const ALL_SNOWGLOBES: GlobeItem[] = [
  { id: 'londres', cityName: 'Londres', cityCode: 'LON', imageUrl: '/snowglobes/londres.png' },
  { id: 'paris', cityName: 'París', cityCode: 'PAR', imageUrl: '/snowglobes/paris.png' },
  { id: 'roma', cityName: 'Roma', cityCode: 'FCO', imageUrl: '/snowglobes/roma.png' },
  { id: 'budapest', cityName: 'Budapest', cityCode: 'BUD', imageUrl: '/snowglobes/budapest.png' },
  { id: 'mila', cityName: 'Milà', cityCode: 'MIL', imageUrl: '/snowglobes/mila.png' },
  { id: 'venecia', cityName: 'Venècia', cityCode: 'VCE', imageUrl: '/snowglobes/venecia.png' },
  { id: 'barcelona', cityName: 'Barcelona', cityCode: 'BCN', imageUrl: '/snowglobes/barcelona.png' },
  { id: 'berlin', cityName: 'Berlín', cityCode: 'BER', imageUrl: '/snowglobes/berlin.png' },
  { id: 'novayork', cityName: 'Nova York', cityCode: 'NYC', imageUrl: '/snowglobes/novayork.png' },
  { id: 'atenes', cityName: 'Atenes', cityCode: 'ATH', imageUrl: '/snowglobes/atenes.png' },
  { id: 'elcaire', cityName: 'El Caire', cityCode: 'CAI', imageUrl: '/snowglobes/elcaire.png' },
  { id: 'pisa', cityName: 'Pisa', cityCode: 'PSA', imageUrl: '/snowglobes/pisa.png' },
  { id: 'rio', cityName: 'Rio de Janeiro', cityCode: 'RIO', imageUrl: '/snowglobes/rio.png' },
  { id: 'sydney', cityName: 'Sydney', cityCode: 'SYD', imageUrl: '/snowglobes/sydney.png' },
]

const GLOBE_MAP = new Map<string, GlobeItem>(ALL_SNOWGLOBES.map((g) => [g.id, g]))

// Funció d'inicialització del tauler (9 boles visibles, 4 ciutats inferiors, cua de reserva)
function setupGamePool() {
  const shuffled = [...ALL_SNOWGLOBES].sort(() => Math.random() - 0.5)
  const initialVisibleGlobes = shuffled.slice(0, 9).map((g) => g.id)
  const initialReserve = shuffled.slice(9).map((g) => g.id)

  // Les 4 primeres ciutats inferiors s'escullen d'entre les 9 boles visibles inicials
  const candidateCities = [...initialVisibleGlobes].sort(() => Math.random() - 0.5)
  const initialVisibleCities = candidateCities.slice(0, 4)

  return {
    initialVisibleGlobes,
    initialReserve,
    initialVisibleCities,
  }
}

export function SnowglobesPlayer({
  isAlreadySolved,
  onSuccess,
}: ChallengePlayerProps<SnowglobesConfig>) {
  // Inicialització de l'estat del joc
  const [initialData] = useState(() => setupGamePool())

  // Estat de les 9 posicions de boles
  const [visibleGlobeIds, setVisibleGlobeIds] = useState<(string | null)[]>(() =>
    isAlreadySolved ? [] : initialData.initialVisibleGlobes
  )

  // Cua de boles de reserva per anar reposant (les 5 restants)
  const [reserveGlobeIds, setReserveGlobeIds] = useState<string[]>(() =>
    isAlreadySolved ? [] : initialData.initialReserve
  )

  // Estat dels 4 requadres de ciutats
  const [visibleCityIds, setVisibleCityIds] = useState<(string | null)[]>(() =>
    isAlreadySolved ? [] : initialData.initialVisibleCities
  )

  // Llista de ciutats ja resoltes
  const [matchedIds, setMatchedIds] = useState<string[]>(() =>
    isAlreadySolved ? ALL_SNOWGLOBES.map((i) => i.id) : []
  )

  const [isCompleted, setIsCompleted] = useState(isAlreadySolved)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [selectedGlobeId, setSelectedGlobeId] = useState<string | null>(null)

  // Transició activa de 2s després d'un encert
  const [transitioningMatch, setTransitioningMatch] = useState<{
    globeId: string
    cityId: string
  } | null>(null)

  // Temporitzador
  const [elapsedMs, setElapsedMs] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(!isAlreadySolved)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Feedback flotant sobre la ciutat (+100 / -100) amb durada de 2s
  const [floatingFeedback, setFloatingFeedback] = useState<{
    cityId: string
    text: string
    isPositive: boolean
    id: number
  } | null>(null)
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Referències als requadres de ciutats per detectar Drop per coordenades
  const cityRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // Estat d'arrossegament Pointer (Drag & Drop)
  const [draggingGlobeId, setDraggingGlobeId] = useState<string | null>(null)
  const [dragPos, setDragPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [hoveredCityId, setHoveredCityId] = useState<string | null>(null)

  // Bola que s'està arrossegant actualment
  const draggingGlobe = useMemo(
    () => (draggingGlobeId ? GLOBE_MAP.get(draggingGlobeId) : null),
    [draggingGlobeId]
  )

  // Temporitzador
  useEffect(() => {
    if (isTimerRunning && !isAlreadySolved && !isCompleted) {
      const start = Date.now() - elapsedMs
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - start)
      }, 50)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isTimerRunning, isCompleted, isAlreadySolved, elapsedMs])

  // Neteja de temporitzadors
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current)
    }
  }, [])

  // Formatar temps: minuts i segons (MM:SS)
  const formattedTime = useMemo(() => {
    const totalSec = Math.floor(elapsedMs / 1000)
    const mins = Math.floor(totalSec / 60)
    const secs = totalSec % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }, [elapsedMs])

  // Mostrar pop-up temporal
  const triggerFeedback = useCallback((cityId: string, text: string, isPositive: boolean) => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current)
    }
    setFloatingFeedback({
      cityId,
      text,
      isPositive,
      id: Date.now(),
    })
    feedbackTimeoutRef.current = setTimeout(() => {
      setFloatingFeedback(null)
    }, 2000)
  }, [])

  // Lògica d'intent d'emparellament
  const handleAttemptMatch = useCallback(
    (globeId: string, targetCityId: string) => {
      if (isCompleted || isAlreadySolved || transitioningMatch) return
      if (matchedIds.includes(globeId)) return

      const isCorrect = globeId === targetCityId

      if (isCorrect) {
        // Encert: ratxa i punts
        const nextStreak = streak + 1
        const pointsWon = nextStreak * 100
        const newScore = score + pointsWon

        setStreak(nextStreak)
        setScore(newScore)
        setSelectedGlobeId(null)

        const nextMatched = [...matchedIds, globeId]
        const isGameFinished = nextMatched.length === ALL_SNOWGLOBES.length

        // Activa la transició visual de 2s
        setTransitioningMatch({ globeId, cityId: targetCityId })

        // Pop-up sobre la ciutat encertada durant 2s
        triggerFeedback(targetCityId, `+${pointsWon}`, true)

        // Després de 2 segons: desapareixen la bola i la ciutat, i apareixen les noves
        if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current)
        transitionTimeoutRef.current = setTimeout(() => {
          setMatchedIds(nextMatched)
          setFloatingFeedback(null)

          if (isGameFinished) {
            setIsCompleted(true)
            setIsTimerRunning(false)
            setTransitioningMatch(null)
            onSuccess(newScore, ALL_SNOWGLOBES.length)
            return
          }

          // 1. Reposar la bola encertada a la graella de 9
          let nextReserve = [...reserveGlobeIds]
          const nextVisibleGlobes = [...visibleGlobeIds]
          const globeSlotIdx = visibleGlobeIds.indexOf(globeId)

          if (nextReserve.length > 0 && globeSlotIdx !== -1) {
            const newSpawnedGlobeId = nextReserve[0]
            nextVisibleGlobes[globeSlotIdx] = newSpawnedGlobeId
            nextReserve = nextReserve.slice(1)
          } else if (globeSlotIdx !== -1) {
            nextVisibleGlobes[globeSlotIdx] = null
          }
          setVisibleGlobeIds(nextVisibleGlobes)
          setReserveGlobeIds(nextReserve)

          // 2. Reposar el requadre de ciutat encertada d'entre les 4 inferiors
          const nextVisibleCities = [...visibleCityIds]
          const citySlotIdx = visibleCityIds.indexOf(targetCityId)

          // Candidats per a la nova ciutat:
          // Han d'estar presents a les boles visibles actuals, no estar ja a cap altre requadre de ciutat i no estar resoltes
          const otherCurrentCities = new Set(
            nextVisibleCities.filter((id, idx): id is string => id !== null && idx !== citySlotIdx)
          )
          const availableCandidates = nextVisibleGlobes.filter(
            (id): id is string =>
              id !== null &&
              !otherCurrentCities.has(id) &&
              !nextMatched.includes(id)
          )

          if (availableCandidates.length > 0 && citySlotIdx !== -1) {
            // Escollir un candidat a l'atzar
            const chosenCityId =
              availableCandidates[Math.floor(Math.random() * availableCandidates.length)]
            nextVisibleCities[citySlotIdx] = chosenCityId
          } else if (citySlotIdx !== -1) {
            nextVisibleCities[citySlotIdx] = null
          }

          setVisibleCityIds(nextVisibleCities)
          setTransitioningMatch(null)
        }, 2000)
      } else {
        // Error: resta 100 punts i reinicia la ratxa
        const newScore = Math.max(0, score - 100)
        setScore(newScore)
        setStreak(0)
        setSelectedGlobeId(null)

        // Mostrar feedback negatiu sobre la ciutat corresponent durant 2s
        triggerFeedback(targetCityId, '-100', false)
      }
    },
    [
      isCompleted,
      isAlreadySolved,
      transitioningMatch,
      matchedIds,
      streak,
      score,
      reserveGlobeIds,
      visibleGlobeIds,
      visibleCityIds,
      triggerFeedback,
      onSuccess,
    ]
  )

  // Iniciar arrossegament (Pointer Down)
  const handlePointerDown = (e: React.PointerEvent, globeId: string) => {
    if (matchedIds.includes(globeId) || isCompleted || transitioningMatch) return
    e.preventDefault()

    setDraggingGlobeId(globeId)
    setDragPos({ x: e.clientX, y: e.clientY })
    setSelectedGlobeId(globeId)
  }

  // Listener global per seguir el moviment del ratolí/dit a tota la pantalla
  useEffect(() => {
    if (!draggingGlobeId) return

    const handleGlobalPointerMove = (e: PointerEvent) => {
      e.preventDefault()
      setDragPos({ x: e.clientX, y: e.clientY })

      // Detectar quin requadre de ciutat està sota les coordenades actuals
      let foundCityId: string | null = null
      cityRefs.current.forEach((el, cId) => {
        if (el) {
          const rect = el.getBoundingClientRect()
          if (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          ) {
            foundCityId = cId
          }
        }
      })
      setHoveredCityId(foundCityId)
    }

    const handleGlobalPointerUp = (e: PointerEvent) => {
      e.preventDefault()

      // Buscar si el punter cau sobre algun requadre de ciutat
      let droppedCityId: string | null = null
      cityRefs.current.forEach((el, cId) => {
        if (el) {
          const rect = el.getBoundingClientRect()
          if (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          ) {
            droppedCityId = cId
          }
        }
      })

      const currentGlobe = draggingGlobeId
      setDraggingGlobeId(null)
      setHoveredCityId(null)

      if (droppedCityId && currentGlobe) {
        handleAttemptMatch(currentGlobe, droppedCityId)
      }
    }

    window.addEventListener('pointermove', handleGlobalPointerMove, { passive: false })
    window.addEventListener('pointerup', handleGlobalPointerUp)
    window.addEventListener('pointercancel', handleGlobalPointerUp)

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove)
      window.removeEventListener('pointerup', handleGlobalPointerUp)
      window.removeEventListener('pointercancel', handleGlobalPointerUp)
    }
  }, [draggingGlobeId, handleAttemptMatch])

  // Tocar un requadre de ciutat directament (compatible amb tap-to-select)
  const handleCityClick = (cityId: string) => {
    if (!selectedGlobeId || transitioningMatch) return
    handleAttemptMatch(selectedGlobeId, cityId)
  }

  // Reiniciar partida
  const handleRetry = () => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current)
    const fresh = setupGamePool()
    setVisibleGlobeIds(fresh.initialVisibleGlobes)
    setReserveGlobeIds(fresh.initialReserve)
    setVisibleCityIds(fresh.initialVisibleCities)
    setMatchedIds([])
    setFloatingFeedback(null)
    setTransitioningMatch(null)
    setScore(0)
    setStreak(0)
    setIsCompleted(false)
    setElapsedMs(0)
    setIsTimerRunning(true)
    setSelectedGlobeId(null)
  }

  return (
    <div className="space-y-3 sm:space-y-4 max-w-md mx-auto select-none">
      {/* Marcador superior */}
      <div className="rounded-3xl border-2 border-[#16334a] bg-gradient-to-b from-[#081829] to-[#040d17] p-3 sm:p-4 text-white shadow-xl relative overflow-hidden">
        {/* Fons amb estrelles suaus */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        {/* Barra superior de Puntuació, Temps i Progrés */}
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10 relative z-10">
          {/* Puntuació */}
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-semibold text-[#ffd700]/70 tracking-wider">
              Puntuació
            </span>
            <span className="text-base sm:text-lg font-black text-[#ffd700] tracking-tight drop-shadow-sm">
              {score}
            </span>
          </div>

          {/* Temporitzador blau marí (MM:SS) */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0284c7] border border-[#38bdf8]/40 shadow-sm text-white font-mono font-bold text-xs sm:text-sm">
            <span>⏱</span>
            <span>{formattedTime}</span>
          </div>

          {/* Progrés ciutats a la dreta */}
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase font-semibold text-white/60 tracking-wider">
              Completades
            </span>
            <span className="text-base sm:text-lg font-black text-white/90 tracking-tight drop-shadow-sm">
              {matchedIds.length} / {ALL_SNOWGLOBES.length}
            </span>
          </div>
        </div>

        {/* Instrucció breu */}
        <p className="text-[11px] text-center text-white/70 pt-2 pb-1 font-medium">
          {isCompleted
            ? '🎉 Felicitats! Has completat totes les 14 ciutats!'
            : selectedGlobeId
            ? '👉 Ara toca o deixa anar sobre la ciutat corresponent:'
            : 'Arrossega la bola a la seva ciutat:'}
        </p>

        {/* Graella de les 9 Boles de Vidre (3 files x 3 columnes) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 py-1 min-h-[220px] sm:min-h-[240px] relative">
          {visibleGlobeIds.map((globeId, idx) => {
            if (!globeId) {
              // Espai buit si ja s'han esgotat les boles en aquesta posició
              return (
                <div
                  key={`empty-${idx}`}
                  className="aspect-square rounded-2xl border border-white/5 bg-white/[0.02]"
                />
              )
            }

            const item = GLOBE_MAP.get(globeId)
            if (!item) return null

            const isSelected = selectedGlobeId === item.id
            const isDragging = draggingGlobeId === item.id
            const isTransitioning = transitioningMatch?.globeId === item.id

            return (
              <div
                key={item.id}
                onPointerDown={(e) => handlePointerDown(e, item.id)}
                onClick={() => {
                  if (!draggingGlobeId && !transitioningMatch) {
                    setSelectedGlobeId(isSelected ? null : item.id)
                  }
                }}
                className={`relative aspect-square p-1 flex items-center justify-center transition-all cursor-grab active:cursor-grabbing select-none ${
                  isTransitioning
                    ? 'scale-110 drop-shadow-[0_0_15px_rgba(16,185,129,0.9)] animate-pulse'
                    : isSelected
                    ? 'scale-110 drop-shadow-[0_0_12px_rgba(255,215,0,0.85)]'
                    : isDragging
                    ? 'opacity-25 scale-90'
                    : 'hover:scale-105 active:scale-95'
                }`}
                style={{ touchAction: 'none' }}
              >
                {/* Imatge de la bola transparent */}
                <img
                  src={item.imageUrl}
                  alt={item.cityName}
                  className="w-full h-full object-contain pointer-events-none drop-shadow-md select-none transition-transform animate-in fade-in zoom-in duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const fallback = target.nextElementSibling as HTMLElement
                    if (fallback) fallback.style.display = 'flex'
                  }}
                />

                {/* Fallback si la imatge no carrega */}
                <div
                  style={{ display: 'none' }}
                  className="w-full h-full rounded-2xl border border-white/20 bg-white/10 flex flex-col items-center justify-center text-center p-2"
                >
                  <span className="text-2xl block mb-1">🔮</span>
                  <span className="text-[10px] font-bold text-white/90 leading-tight">
                    {item.cityName}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Zona inferior de les 4 Ciutats */}
        <div className="pt-2.5 border-t border-white/10">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {visibleCityIds.map((cityId, idx) => {
              if (!cityId) {
                return (
                  <div
                    key={`empty-city-${idx}`}
                    className="min-h-[58px] sm:min-h-[62px] rounded-xl border border-white/5 bg-white/[0.02]"
                  />
                )
              }

              const item = GLOBE_MAP.get(cityId)
              if (!item) return null

              const isMatchTransitioning = transitioningMatch?.cityId === item.id
              const isHovered = hoveredCityId === item.id
              const hasFeedback = floatingFeedback?.cityId === item.id

              // Ajust de mida i partició segons si té espais o la llargada del nom per garantir un centrat perfecte
              const hasSpaces = item.cityName.includes(' ')
              const nameLength = item.cityName.length

              let nameFontClass = 'text-[10px] sm:text-[11px]'
              let nameWrapClass = 'whitespace-nowrap'

              if (!hasSpaces) {
                // Ciutats d'una sola paraula: MAI es tallen amb guions
                nameWrapClass = 'whitespace-nowrap'
                if (nameLength >= 8) {
                  // Ex: Barcelona (9 lletres), Budapest (8 lletres)
                  nameFontClass = 'text-[8px] sm:text-[9px] tracking-tight'
                } else if (nameLength >= 6) {
                  // Ex: Londres (7), Venècia (7), Atenes (6), Berlín (6), Sydney (6)
                  nameFontClass = 'text-[9px] sm:text-[10px] tracking-tight'
                } else {
                  // Ex: Roma (4), París (5), Milà (4), Pisa (4)
                  nameFontClass = 'text-[10.5px] sm:text-[11.5px]'
                }
              } else {
                // Ciutats amb espais: trenquen per l'espai entre paraules de forma natural
                nameWrapClass = 'break-normal leading-[1.15]'
                if (nameLength > 11) {
                  // Ex: Rio de Janeiro
                  nameFontClass = 'text-[7.5px] sm:text-[8.5px]'
                } else {
                  // Ex: Nova York, El Caire
                  nameFontClass = 'text-[8.5px] sm:text-[9.5px]'
                }
              }

              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    if (el) cityRefs.current.set(item.id, el)
                    else cityRefs.current.delete(item.id)
                  }}
                  onClick={() => handleCityClick(item.id)}
                  className={`relative p-1 sm:p-1.5 rounded-xl flex items-center justify-center transition-all select-none border-2 min-h-[54px] sm:min-h-[58px] text-center overflow-visible animate-in fade-in zoom-in duration-300 ${
                    isMatchTransitioning
                      ? 'bg-[#0f4437] border-[#10b981] shadow-lg scale-105'
                      : isHovered
                      ? 'bg-[#0284c7]/40 border-[#38bdf8] scale-105 shadow-xl'
                      : selectedGlobeId
                      ? 'bg-[#1b2f42] border-[#ffd700]/70 hover:bg-[#233d54] cursor-pointer active:scale-95'
                      : 'bg-[#102334] border-[#223d54] hover:border-white/30'
                  }`}
                >
                  {/* Cartell / Pop-up flotant amb punts a sobre del requadre (2s de durada) */}
                  {hasFeedback && (
                    <div
                      key={floatingFeedback.id}
                      className={`absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl text-[10px] sm:text-xs font-black shadow-2xl animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300 z-40 whitespace-nowrap pointer-events-none flex items-center justify-center ${
                        floatingFeedback.isPositive
                          ? 'bg-[#10b981] text-white border-2 border-[#6ee7b7] shadow-[0_0_15px_rgba(16,185,129,0.7)]'
                          : 'bg-[#ef4444] text-white border-2 border-[#fca5a5] animate-shake shadow-[0_0_15px_rgba(239,68,68,0.7)]'
                      }`}
                    >
                      <span>{floatingFeedback.text}</span>
                      {/* Fletxa indicadora cap al requadre */}
                      <span
                        className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b ${
                          floatingFeedback.isPositive
                            ? 'bg-[#10b981] border-[#6ee7b7]'
                            : 'bg-[#ef4444] border-[#fca5a5]'
                        }`}
                      />
                    </div>
                  )}

                  {/* Nom de la ciutat: centrat de forma absoluta i matemàtica */}
                  <div className="w-full flex items-center justify-center text-center">
                    <span
                      className={`${nameFontClass} ${nameWrapClass} font-black text-white text-center block w-full drop-shadow-xs`}
                    >
                      {item.cityName}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Resolució i Celebració quan s'han completat totes 14 ciutats */}
        {isCompleted && (
          <div className="mt-4 rounded-2xl bg-[#0f4437] border-2 border-[#34d399] p-3.5 text-center space-y-2 animate-in fade-in">
            <div className="flex items-center justify-center gap-1.5 text-sm font-black text-[#ffd700]">
              <Sparkles className="w-4 h-4 text-[#ffd700]" />
              <span>Totes les 14 ciutats completades!</span>
            </div>
            <p className="text-xs text-white/90">
              Puntuació final:{' '}
              <strong className="text-[#ffd700] text-sm">{score} punts</strong>{' '}
              en {formattedTime}!
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Tornar a jugar
            </button>
          </div>
        )}
      </div>

      {/* Element flotant que segueix el dit / cursor durant l'arrossegament */}
      {draggingGlobe && (
        <div
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 will-change-transform"
          style={{
            left: `${dragPos.x}px`,
            top: `${dragPos.y}px`,
            width: '84px',
            height: '84px',
          }}
        >
          <img
            src={draggingGlobe.imageUrl}
            alt={draggingGlobe.cityName}
            className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const fallback = target.nextElementSibling as HTMLElement
              if (fallback) fallback.style.display = 'flex'
            }}
          />
          <div
            style={{ display: 'none' }}
            className="w-full h-full rounded-2xl bg-[#0284c7]/80 border-2 border-[#38bdf8] flex items-center justify-center text-3xl shadow-2xl"
          >
            🔮
          </div>
        </div>
      )}
    </div>
  )
}
