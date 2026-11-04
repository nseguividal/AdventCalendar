'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import type { ChallengePlayerProps } from '../types'
import type { WordleConfig } from './types'
import { Sparkles, HelpCircle, RotateCcw } from 'lucide-react'

function normalizeLetter(str: string): string {
  return str
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

type LetterStatus = 'correct' | 'present' | 'absent' | 'empty'

export function WordlePlayer({
  config,
  isAlreadySolved,
  onSuccess,
}: ChallengePlayerProps<WordleConfig>) {
  const targetRaw = (config.targetWord || 'NADAL').trim().toUpperCase()
  const target = normalizeLetter(targetRaw)
  const wordLength = target.length || 5
  const maxAttempts = config.maxAttempts || 6

  const [guesses, setGuesses] = useState<string[]>(() =>
    isAlreadySolved ? [target] : []
  )
  const [currentGuess, setCurrentGuess] = useState('')
  const [isWon, setIsWon] = useState(isAlreadySolved)
  const [isLost, setIsLost] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)

  // Calculem l'estat de les lletres per al teclat
  const letterStatuses = useMemo(() => {
    const statuses: Record<string, LetterStatus> = {}

    guesses.forEach((guess) => {
      const gNorm = normalizeLetter(guess)
      const targetArr = target.split('')

      for (let i = 0; i < gNorm.length; i++) {
        const char = gNorm[i]
        if (targetArr[i] === char) {
          statuses[char] = 'correct'
        } else if (targetArr.includes(char)) {
          if (statuses[char] !== 'correct') {
            statuses[char] = 'present'
          }
        } else {
          if (!statuses[char]) {
            statuses[char] = 'absent'
          }
        }
      }
    })

    return statuses
  }, [guesses, target])

  const evaluateGuess = useCallback(
    (guess: string): LetterStatus[] => {
      const gNorm = normalizeLetter(guess)
      const targetArr = target.split('')
      const result: LetterStatus[] = Array(wordLength).fill('absent')
      const targetUsed = Array(wordLength).fill(false)

      // Primera passada: Verds (correctes)
      for (let i = 0; i < wordLength; i++) {
        if (gNorm[i] === targetArr[i]) {
          result[i] = 'correct'
          targetUsed[i] = true
        }
      }

      // Segona passada: Grocs (presents)
      for (let i = 0; i < wordLength; i++) {
        if (result[i] === 'correct') continue
        const char = gNorm[i]
        const targetIndex = targetArr.findIndex(
          (tChar, idx) => tChar === char && !targetUsed[idx]
        )
        if (targetIndex !== -1) {
          result[i] = 'present'
          targetUsed[targetIndex] = true
        }
      }

      return result
    },
    [target, wordLength]
  )

  const handleKeyPress = useCallback(
    (key: string) => {
      if (isWon || isLost || isAlreadySolved) return
      setMessage(null)

      if (key === 'ENTER') {
        if (currentGuess.length < wordLength) {
          setMessage(`La paraula ha de tenir ${wordLength} lletres`)
          return
        }

        const newGuesses = [...guesses, currentGuess]
        setGuesses(newGuesses)
        setCurrentGuess('')

        if (normalizeLetter(currentGuess) === target) {
          setIsWon(true)
          onSuccess()
        } else if (newGuesses.length >= maxAttempts) {
          setIsLost(true)
        }
      } else if (key === 'BACKSPACE' || key === '⌫') {
        setCurrentGuess((prev) => prev.slice(0, -1))
      } else if (/^[A-ZÇ]$/.test(key)) {
        if (currentGuess.length < wordLength) {
          setCurrentGuess((prev) => prev + key)
        }
      }
    },
    [currentGuess, guesses, isWon, isLost, isAlreadySolved, maxAttempts, onSuccess, target, wordLength]
  )

  // Suport per al teclat físic
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const k = e.key.toUpperCase()
      if (k === 'ENTER') {
        handleKeyPress('ENTER')
      } else if (k === 'BACKSPACE') {
        handleKeyPress('BACKSPACE')
      } else if (/^[A-ZÇ]$/.test(k)) {
        handleKeyPress(k)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleKeyPress])

  const handleRetry = () => {
    setGuesses([])
    setCurrentGuess('')
    setIsLost(false)
    setIsWon(false)
    setMessage(null)
  }

  const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
  ]

  return (
    <div className="space-y-3 sm:space-y-4 max-w-sm mx-auto select-none">
      {/* Títol i instruccions */}
      <div className="text-center">
        <h4 className="text-sm font-bold text-[#0f4437]">
          {config.title || 'Endevina la paraula secreta'}
        </h4>
        <p className="text-[11px] text-[#7e7368] mt-0.5">
          {guesses.length} de {maxAttempts} intents
        </p>
      </div>

      {/* Pista opcional */}
      {config.hint && !isWon && (
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

      {/* Missatge d'alerta */}
      {message && (
        <div className="text-center text-xs font-bold text-[#b91c1c] animate-bounce">
          {message}
        </div>
      )}

      {/* Graella de paraules */}
      <div className="flex flex-col gap-1.5 items-center justify-center">
        {Array.from({ length: maxAttempts }).map((_, rowIndex) => {
          const isCurrentRow = rowIndex === guesses.length
          const isPastRow = rowIndex < guesses.length
          const guess = isPastRow
            ? guesses[rowIndex]
            : isCurrentRow
            ? currentGuess
            : ''
          const evaluation = isPastRow ? evaluateGuess(guess) : []

          return (
            <div
              key={rowIndex}
              className="flex gap-1.5 justify-center"
              style={{ width: '100%', maxWidth: `${wordLength * 46}px` }}
            >
              {Array.from({ length: wordLength }).map((_, colIndex) => {
                const letter = guess[colIndex] || ''
                const status = evaluation[colIndex]

                let tileStyle =
                  'border-[#d8cdbf] bg-white text-[#2c2825]'
                if (status === 'correct') {
                  tileStyle =
                    'border-[#0f4437] bg-[#0f4437] text-white shadow-xs font-black'
                } else if (status === 'present') {
                  tileStyle =
                    'border-[#c89332] bg-[#c89332] text-white shadow-xs font-black'
                } else if (status === 'absent') {
                  tileStyle =
                    'border-[#7e7368] bg-[#7e7368] text-white/90 font-bold opacity-80'
                } else if (letter) {
                  tileStyle =
                    'border-[#248896] bg-white text-[#2c2825] font-black scale-105'
                }

                return (
                  <div
                    key={colIndex}
                    className={`flex-1 aspect-square rounded-lg border-2 flex items-center justify-center text-base sm:text-lg uppercase transition-all duration-200 ${tileStyle}`}
                  >
                    {letter}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Estat de derrota amb opció de reiniciar */}
      {isLost && !isWon && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-center space-y-2 animate-in fade-in">
          <p className="text-xs text-red-800">
            Has esgotat els {maxAttempts} intents! La paraula era:{' '}
            <strong className="text-[#0f4437] uppercase">{targetRaw}</strong>
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[#b91c1c] text-white text-xs font-bold rounded-lg hover:bg-[#a11818] transition active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Torna-ho a provar
          </button>
        </div>
      )}

      {/* Estat de victòria */}
      {isWon && (
        <div className="rounded-xl bg-[#0f4437]/10 border border-[#0f4437]/20 p-2.5 text-center text-xs font-bold text-[#0f4437] flex items-center justify-center gap-1.5 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-[#c89332]" />
          <span>Molt bé! Has endevinat la paraula secreta: {targetRaw}!</span>
        </div>
      )}

      {/* Teclat virtual */}
      {!isWon && !isLost && (
        <div className="space-y-1.5 pt-1">
          {KEYBOARD_ROWS.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1">
              {row.map((key) => {
                const status = letterStatuses[normalizeLetter(key)]
                let keyStyle =
                  'bg-[#f4ede3] hover:bg-[#e8dfd3] text-[#2c2825] active:scale-95'

                if (status === 'correct') {
                  keyStyle = 'bg-[#0f4437] text-white font-black'
                } else if (status === 'present') {
                  keyStyle = 'bg-[#c89332] text-white font-black'
                } else if (status === 'absent') {
                  keyStyle = 'bg-[#d8cdbf] text-[#8c8277] opacity-60'
                }

                const isSpecial = key === 'ENTER' || key === '⌫'

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeyPress(key)}
                    className={`h-9 rounded-md font-bold text-xs flex items-center justify-center transition shadow-2xs ${
                      isSpecial
                        ? 'px-2 sm:px-3 text-[11px] bg-[#d8cdbf]/70 hover:bg-[#d8cdbf]'
                        : 'flex-1 min-w-[24px] sm:min-w-[28px]'
                    } ${keyStyle}`}
                  >
                    {key}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

