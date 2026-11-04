'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import type { ChallengePlayerProps } from '../types'
import type { ScrambleConfig, ScrambleWordItem } from './types'
import { Sparkles, HelpCircle, RotateCcw, ArrowRight, CheckCircle2 } from 'lucide-react'

interface ScrambledTile {
  id: string
  letter: string
}

function normalize(str: string): string {
  return str
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function shuffleTiles(word: string): ScrambledTile[] {
  const letters = word
    .trim()
    .toUpperCase()
    .split('')
    .map((letter, i) => ({ id: `tile-${i}-${letter}`, letter }))

  if (letters.length <= 1) return letters

  let shuffled = [...letters]
  let attempts = 0
  // Ens assegurem que quedi desordenada
  while (attempts < 10) {
    shuffled.sort(() => Math.random() - 0.5)
    if (shuffled.map((t) => t.letter).join('') !== word.trim().toUpperCase()) {
      break
    }
    attempts++
  }
  return shuffled
}

export function ScramblePlayer({
  config,
  isAlreadySolved,
  onSuccess,
}: ChallengePlayerProps<ScrambleConfig>) {
  // Normalitzar llista de paraules
  const wordsList: ScrambleWordItem[] = useMemo(() => {
    if (config.words && config.words.length > 0) {
      return config.words.filter((w) => w.word.trim().length > 0)
    }
    if (config.word) {
      return [{ word: config.word, hint: config.hint }]
    }
    return [
      { word: 'NADAL', hint: "L'època més màgica de l'any" },
      { word: 'ESTEL', hint: "Brilla al cel de la nit de Nadal" },
    ]
  }, [config])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [bankTiles, setBankTiles] = useState<ScrambledTile[]>([])
  const [placedTiles, setPlacedTiles] = useState<ScrambledTile[]>([])
  const [showHint, setShowHint] = useState(false)
  const [isWordCorrect, setIsWordCorrect] = useState(false)
  const [isGameFinished, setIsGameFinished] = useState(isAlreadySolved)

  const currentItem = wordsList[currentIndex] || wordsList[0]
  const targetClean = (currentItem?.word || 'NADAL').trim().toUpperCase()

  // Inicialitzar lletres de la paraula actual
  useEffect(() => {
    if (isAlreadySolved) {
      setIsGameFinished(true)
      return
    }
    const initialTiles = shuffleTiles(targetClean)
    setBankTiles(initialTiles)
    setPlacedTiles([])
    setIsWordCorrect(false)
    setShowHint(false)
  }, [currentIndex, targetClean, isAlreadySolved])

  // Comprovar si les lletres col·locades formen la paraula correcta
  const checkAnswer = useCallback(
    (currentPlaced: ScrambledTile[]) => {
      if (currentPlaced.length === targetClean.length) {
        const formed = currentPlaced.map((t) => t.letter).join('')
        if (normalize(formed) === normalize(targetClean)) {
          setIsWordCorrect(true)
          if (currentIndex >= wordsList.length - 1) {
            setIsGameFinished(true)
            onSuccess()
          }
        }
      }
    },
    [targetClean, currentIndex, wordsList.length, onSuccess]
  )

  const handleTileToAnswer = (tile: ScrambledTile) => {
    if (isWordCorrect || isGameFinished) return
    const nextBank = bankTiles.filter((t) => t.id !== tile.id)
    const nextPlaced = [...placedTiles, tile]
    setBankTiles(nextBank)
    setPlacedTiles(nextPlaced)
    checkAnswer(nextPlaced)
  }

  const handleTileToBank = (tile: ScrambledTile) => {
    if (isWordCorrect || isGameFinished) return
    const nextPlaced = placedTiles.filter((t) => t.id !== tile.id)
    const nextBank = [...bankTiles, tile]
    setPlacedTiles(nextPlaced)
    setBankTiles(nextBank)
  }

  const handleResetWord = () => {
    const all = [...placedTiles, ...bankTiles]
    all.sort(() => Math.random() - 0.5)
    setBankTiles(all)
    setPlacedTiles([])
    setIsWordCorrect(false)
  }

  const handleNextWord = () => {
    if (currentIndex < wordsList.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  return (
    <div className="space-y-3.5 sm:space-y-4 max-w-sm mx-auto select-none">
      {/* Títol i progrés */}
      <div className="text-center">
        <h4 className="text-sm font-bold text-[#0f4437]">
          {config.title || 'Ordena les lletres per formar la paraula'}
        </h4>
        {wordsList.length > 1 && (
          <p className="text-[11px] text-[#248896] font-semibold mt-0.5">
            Paraula {currentIndex + 1} de {wordsList.length}
          </p>
        )}
      </div>

      {/* Pista opcional */}
      {currentItem?.hint && !isWordCorrect && (
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
              💡 {currentItem.hint}
            </div>
          )}
        </div>
      )}

      {/* Zona de caselles on es col·loquen les lletres ordenades */}
      <div className="rounded-2xl border border-[#e8dfd3] bg-[#f4ede3]/80 p-3 shadow-xs">
        <p className="text-[10px] text-center font-bold uppercase tracking-wider text-[#7e7368] mb-2">
          La teva resposta:
        </p>

        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 min-h-[48px]">
          {Array.from({ length: targetClean.length }).map((_, idx) => {
            const tile = placedTiles[idx]

            return (
              <div
                key={idx}
                onClick={() => tile && handleTileToBank(tile)}
                className={`w-10 sm:w-11 h-11 sm:h-12 rounded-xl flex items-center justify-center font-black text-base sm:text-lg transition-all duration-200 select-none ${
                  tile
                    ? isWordCorrect
                      ? 'bg-[#0f4437] text-white shadow-xs border-2 border-[#0f4437]'
                      : 'bg-white text-[#2c2825] border-2 border-[#248896] shadow-xs active:scale-95 cursor-pointer'
                    : 'border-2 border-dashed border-[#d8cdbf] bg-white/40 text-transparent'
                }`}
              >
                {tile ? tile.letter : ''}
              </div>
            )
          })}
        </div>

        {/* Botó per desfer / reiniciar lletres */}
        {placedTiles.length > 0 && !isWordCorrect && (
          <div className="text-center mt-2.5">
            <button
              type="button"
              onClick={handleResetWord}
              className="inline-flex items-center gap-1 text-[11px] text-[#7e7368] hover:text-[#b91c1c] font-medium transition"
            >
              <RotateCcw className="w-3 h-3" /> Reiniciar lletres
            </button>
          </div>
        )}
      </div>

      {/* Banc de lletres desordenades */}
      {!isWordCorrect && (
        <div className="space-y-1.5">
          <p className="text-[11px] text-center font-medium text-[#6e6358]">
            Toca una lletra per col·locar-la:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {bankTiles.map((tile) => (
              <button
                key={tile.id}
                type="button"
                onClick={() => handleTileToAnswer(tile)}
                className="w-10 sm:w-11 h-11 sm:h-12 rounded-xl bg-white border border-[#d8cdbf] text-[#2c2825] font-black text-base sm:text-lg flex items-center justify-center shadow-xs hover:border-[#0f4437] hover:bg-[#faf6f2] active:scale-90 transition"
              >
                {tile.letter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Feedback de paraula correcta i botó de següent */}
      {isWordCorrect && (
        <div className="rounded-xl bg-[#0f4437]/10 border border-[#0f4437]/20 p-3 text-center space-y-2 animate-in fade-in">
          <div className="flex items-center justify-center gap-1.5 font-bold text-xs sm:text-sm text-[#0f4437]">
            <CheckCircle2 className="w-4 h-4 text-[#0f4437]" />
            <span>Molt bé! Era "{targetClean}"!</span>
          </div>

          {currentIndex < wordsList.length - 1 && (
            <button
              type="button"
              onClick={handleNextWord}
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#0f4437] hover:bg-[#145647] text-white font-bold rounded-lg transition shadow-xs text-xs active:scale-[0.98]"
            >
              <span>Següent paraula</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {isGameFinished && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#248896] font-bold">
              <Sparkles className="w-4 h-4 text-[#c89332]" />
              <span>Has desxifrat totes les paraules!</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

