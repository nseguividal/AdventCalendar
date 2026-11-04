'use client'

import { useState, useMemo } from 'react'
import type { ChallengePlayerProps } from '../types'
import type { MemoryConfig, MemoryCardCount } from './types'
import { Sparkles } from 'lucide-react'

const FESTIVE_SYMBOLS = [
  { id: 'tree', icon: '🎄', name: 'Arbre' },
  { id: 'snowman', icon: '⛄', name: 'Ninot' },
  { id: 'santa', icon: '🎅', name: 'Pare Noel' },
  { id: 'gift', icon: '🎁', name: 'Regal' },
  { id: 'star', icon: '⭐', name: 'Estrella' },
  { id: 'bell', icon: '🔔', name: 'Campana' },
  { id: 'reindeer', icon: '🦌', name: 'Ren' },
  { id: 'candle', icon: '🕯️', name: 'Espelma' },
  { id: 'cookie', icon: '🍪', name: 'Galeta' },
  { id: 'sock', icon: '🧦', name: 'Mitjó' },
  { id: 'snowflake', icon: '❄️', name: 'Floc' },
  { id: 'ribbon', icon: '🎀', name: 'Llaç' },
  { id: 'log', icon: '🪵', name: 'Tió' },
  { id: 'crown', icon: '👑', name: 'Corona' },
]

interface CardItem {
  uid: string
  symbolId: string
  icon: string
}

export function MemoryPlayer({
  config,
  isAlreadySolved,
  onSuccess,
}: ChallengePlayerProps<MemoryConfig>) {
  // Determinar el nombre de caselles (6, 8, 12 o 24)
  const totalCards: MemoryCardCount = useMemo(() => {
    if (config.totalCards && [6, 8, 12, 24].includes(config.totalCards)) {
      return config.totalCards as MemoryCardCount
    }
    if (config.pairCount) {
      const doubled = config.pairCount * 2
      if (doubled === 6 || doubled === 8 || doubled === 12 || doubled === 24) {
        return doubled as MemoryCardCount
      }
    }
    return 12 // per defecte 12 caselles (6 parelles)
  }, [config.totalCards, config.pairCount])

  const pairCount = totalCards / 2

  // Generar i barrejar la baralla de cartes un cop
  const cards = useMemo(() => {
    const selected = FESTIVE_SYMBOLS.slice(0, pairCount)
    const deck: CardItem[] = []

    selected.forEach((s) => {
      deck.push({ uid: `${s.id}-1`, symbolId: s.id, icon: s.icon })
      deck.push({ uid: `${s.id}-2`, symbolId: s.id, icon: s.icon })
    })

    // Algorisme Fisher-Yates per barrejar
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[deck[i], deck[j]] = [deck[j], deck[i]]
    }

    return deck
  }, [pairCount])

  const [flippedUids, setFlippedUids] = useState<string[]>([])
  const [matchedIds, setMatchedIds] = useState<string[]>(() => {
    if (isAlreadySolved) {
      return FESTIVE_SYMBOLS.slice(0, pairCount).map((s) => s.id)
    }
    return []
  })
  const [isChecking, setIsChecking] = useState(false)

  const handleCardClick = (card: CardItem) => {
    if (isAlreadySolved || isChecking) return
    if (flippedUids.includes(card.uid) || matchedIds.includes(card.symbolId)) return

    const newFlipped = [...flippedUids, card.uid]
    setFlippedUids(newFlipped)

    if (newFlipped.length === 2) {
      setIsChecking(true)
      const firstCard = cards.find((c) => c.uid === newFlipped[0])!
      const secondCard = card

      if (firstCard.symbolId === secondCard.symbolId) {
        // Encert!
        setTimeout(() => {
          const nextMatched = [...matchedIds, firstCard.symbolId]
          setMatchedIds(nextMatched)
          setFlippedUids([])
          setIsChecking(false)

          if (nextMatched.length === pairCount) {
            onSuccess()
          }
        }, 400)
      } else {
        // Fallada, girar de nou
        setTimeout(() => {
          setFlippedUids([])
          setIsChecking(false)
        }, 850)
      }
    }
  }

  const isComplete = matchedIds.length === pairCount

  // Configuració de graella segons nombre de caselles
  const gridClasses = {
    6: 'grid-cols-3 max-w-[320px] sm:max-w-[360px]',
    8: 'grid-cols-4 max-w-[350px] sm:max-w-[400px]',
    12: 'grid-cols-4 max-w-[360px] sm:max-w-[440px]',
    24: 'grid-cols-4 sm:grid-cols-6 max-w-[360px] sm:max-w-[460px]',
  }[totalCards]

  // Mida dinàmica amb clamp() perquè l'emoticona ocupi el 65-75% de la casella tant a mòbil com a ordinador
  const emojiFontSize = {
    6: 'clamp(3.5rem, 16vw, 4.8rem)',
    8: 'clamp(2.8rem, 13vw, 4rem)',
    12: 'clamp(2.6rem, 12vw, 3.6rem)',
    24: 'clamp(1.8rem, 8.5vw, 2.6rem)',
  }[totalCards]

  return (
    <div className="space-y-3.5">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#6e6358] mb-1">
          {config.title || `Troba les ${pairCount} parelles nadalenques:`}
        </p>
        <p className="text-xs text-[#248896] font-medium">
          {isComplete
            ? 'Totes les parelles trobades! ⭐️'
            : `Parelles: ${matchedIds.length} / ${pairCount}`}
        </p>
      </div>

      {/* Graella de cartes */}
      <div
        className={`mx-auto grid gap-1.5 sm:gap-2.5 p-2 sm:p-3 rounded-2xl bg-[#f5ede3]/70 border border-[#e4d6c4] shadow-xs ${gridClasses}`}
      >
        {cards.map((card) => {
          const isFlipped =
            flippedUids.includes(card.uid) || matchedIds.includes(card.symbolId) || isAlreadySolved
          const isMatched = matchedIds.includes(card.symbolId) || isAlreadySolved

          return (
            <button
              key={card.uid}
              type="button"
              disabled={isAlreadySolved || isFlipped || isChecking}
              onClick={() => handleCardClick(card)}
              className={`aspect-square rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 select-none shadow-xs p-1 overflow-hidden ${
                isMatched
                  ? 'bg-[#0f4437] text-white ring-2 ring-[#0f4437]/30 scale-95'
                  : isFlipped
                  ? 'bg-white text-[#2c2825] border-2 border-[#248896] scale-100 shadow-md'
                  : 'bg-[#faf6f2] hover:bg-white border border-[#d8cdbf] hover:border-[#0f4437]/30 hover:scale-105 active:scale-95'
              }`}
            >
              {isFlipped && (
                <span
                  style={{ fontSize: emojiFontSize }}
                  className="leading-none flex items-center justify-center select-none transition-transform duration-200"
                >
                  {card.icon}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {isComplete && !isAlreadySolved && (
        <div className="rounded-xl bg-[#0f4437]/10 border border-[#0f4437]/20 p-2.5 text-center text-xs font-semibold text-[#0f4437] flex items-center justify-center gap-1.5 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#c89332]" />
          <span>Molt bona memòria! Has trobat totes les parelles!</span>
        </div>
      )}
    </div>
  )
}
