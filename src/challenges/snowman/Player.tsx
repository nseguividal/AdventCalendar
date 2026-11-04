'use client'

import { useState, useMemo, useCallback } from 'react'
import type { ChallengePlayerProps } from '../types'
import type { SnowmanConfig } from './types'
import { Sparkles, HelpCircle, RotateCcw } from 'lucide-react'

function normalizeChar(char: string): string {
  return char
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function SnowmanPlayer({
  config,
  isAlreadySolved,
  onSuccess,
}: ChallengePlayerProps<SnowmanConfig>) {
  // Llista de frases configurades (suport multi-frase o frase única clàssica)
  const phrases = useMemo(() => {
    if (config.words && config.words.length > 0) {
      const list = config.words
        .map((item) => {
          if (typeof item === 'string') {
            return {
              word: item.trim().toUpperCase(),
              hint: config.hint || '',
            }
          }
          return {
            word: (item.word || '').trim().toUpperCase(),
            hint: item.hint || config.hint || '',
          }
        })
        .filter((item) => item.word.length > 0)

      if (list.length > 0) return list
    }

    if (config.word && config.word.trim().length > 0) {
      return [{ word: config.word.trim().toUpperCase(), hint: config.hint || '' }]
    }

    return [{ word: 'TIÓ DE NADAL', hint: config.hint || '' }]
  }, [config.words, config.word, config.hint])

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(() => {
    if (!isAlreadySolved && phrases.length > 1) {
      return Math.floor(Math.random() * phrases.length)
    }
    return 0
  })

  const safeIndex = currentPhraseIndex % phrases.length
  const currentItem = phrases[safeIndex] || { word: 'TIÓ DE NADAL', hint: '' }
  const secretRaw = currentItem.word
  const currentHint = currentItem.hint

  // Sempre 6 intents màxims (el ninot de neu té 6 etapes de desglaç)
  const maxErrors = 6

  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(() =>
    isAlreadySolved
      ? new Set(secretRaw.split('').map((c) => normalizeChar(c)))
      : new Set()
  )
  const [showHint, setShowHint] = useState(false)
  const [isWon, setIsWon] = useState(isAlreadySolved)
  const [isLost, setIsLost] = useState(false)

  // Separació per paraules per garantir que les lletres d'una mateixa paraula mai se separin en línies diferents
  const words = useMemo(() => {
    return secretRaw.split(' ').filter(Boolean)
  }, [secretRaw])

  // Càlcul de la paraula més llarga per ajustar dinàmicament la mida de les caselles
  const longestWordLen = useMemo(() => {
    return Math.max(...words.map((w) => w.length), 0)
  }, [words])

  const slotSizeClass =
    longestWordLen > 8
      ? 'w-5 sm:w-6 h-7 sm:h-8'
      : longestWordLen > 6
      ? 'w-6 sm:w-7 h-8 sm:h-9'
      : 'w-7 sm:w-8 h-9'

  const fontSizeClass =
    longestWordLen > 8
      ? 'text-xs sm:text-sm'
      : longestWordLen > 6
      ? 'text-sm sm:text-base'
      : 'text-base sm:text-lg'

  // Calculem les lletres úniques de la paraula (normalitzades)
  const targetLetters = useMemo(() => {
    const letters = new Set<string>()
    for (const ch of secretRaw) {
      if (/[A-ZÇ]/.test(normalizeChar(ch))) {
        letters.add(normalizeChar(ch))
      }
    }
    return letters
  }, [secretRaw])

  // Lletres errònies intentades
  const wrongLetters = useMemo(() => {
    const wrong: string[] = []
    guessedLetters.forEach((letter) => {
      if (!targetLetters.has(letter)) {
        wrong.push(letter)
      }
    })
    return wrong
  }, [guessedLetters, targetLetters])

  const errors = wrongLetters.length

  const handleGuess = useCallback(
    (letter: string) => {
      if (isWon || isLost || isAlreadySolved) return
      const norm = normalizeChar(letter)
      if (guessedLetters.has(norm)) return

      const nextGuessed = new Set(guessedLetters)
      nextGuessed.add(norm)
      setGuessedLetters(nextGuessed)

      // Comprovar si ha encertat totes les lletres
      let allFound = true
      targetLetters.forEach((t) => {
        if (!nextGuessed.has(t)) {
          allFound = false
        }
      })

      if (allFound) {
        setIsWon(true)
        onSuccess()
        return
      }

      // Comprovar si s'han superat els errors màxims
      if (!targetLetters.has(norm)) {
        if (wrongLetters.length + 1 >= maxErrors) {
          setIsLost(true)
        }
      }
    },
    [guessedLetters, isWon, isLost, isAlreadySolved, targetLetters, onSuccess, wrongLetters.length, maxErrors]
  )

  const handleRetry = () => {
    if (phrases.length > 1) {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
    }
    setGuessedLetters(new Set())
    setIsLost(false)
    setIsWon(false)
    setShowHint(false)
  }

  const ALPHABET = [
    'A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'H', 'I',
    'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
    'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  ]

  return (
    <div className="space-y-3 sm:space-y-4 max-w-sm mx-auto select-none">
      {/* Títol i estat */}
      <div className="text-center">
        <h4 className="text-sm font-bold text-[#0f4437]">
          {config.title || 'Salva el ninot de neu!'}
        </h4>
        <p className="text-[11px] text-[#7e7368] mt-0.5">
          {errors === 0
            ? 'Cap error: el ninot de neu està radiant! ⛄️'
            : errors >= maxErrors
            ? 'Oh no! El ninot de neu s\'ha desfet completament!'
            : `Compte amb la calor: ${errors} de ${maxErrors} errades`}
        </p>
      </div>

      {/* Pista opcional */}
      {currentHint && !isWon && (
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
              💡 {currentHint}
            </div>
          )}
        </div>
      )}

      {/* Dibuix dinàmic del ninot de neu (es desfà segons els errors) */}
      <div className="relative mx-auto w-40 h-40 bg-[#f4ede3] rounded-2xl border border-[#e8dfd3] shadow-xs flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 160 160" className="w-full h-full">
          {/* Fons suau de neu */}
          <ellipse cx="80" cy="148" rx="60" ry="10" fill="#e2d6c6" />

          {errors < 6 ? (
            <>
              {/* Bola inferior */}
              <circle
                cx="80"
                cy="118"
                r={errors >= 5 ? 20 : 28}
                fill="#ffffff"
                stroke="#d0c4b2"
                strokeWidth="2"
              />
              {/* Botons de carbó al cos */}
              {errors < 4 && (
                <>
                  <circle cx="80" cy="112" r="2.5" fill="#2c2825" />
                  <circle cx="80" cy="124" r="2.5" fill="#2c2825" />
                </>
              )}

              {/* Braços de branques (desapareixen a errors >= 3) */}
              {errors < 3 && (
                <>
                  {/* Braç esquerre */}
                  <path
                    d="M 52 108 L 28 96 M 36 100 L 32 90"
                    stroke="#8c5835"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Braç dret */}
                  <path
                    d="M 108 108 L 132 96 M 124 100 L 128 90"
                    stroke="#8c5835"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </>
              )}

              {/* Bola superior (cap) */}
              <circle
                cx="80"
                cy={errors >= 5 ? 88 : 74}
                r={errors >= 5 ? 14 : 20}
                fill="#ffffff"
                stroke="#d0c4b2"
                strokeWidth="2"
              />

              {/* Cara (ulls i nas de pastanaga - desapareixen a errors >= 4) */}
              {errors < 4 && (
                <>
                  <circle cx="73" cy="70" r="2" fill="#2c2825" />
                  <circle cx="87" cy="70" r="2" fill="#2c2825" />
                  {/* Nas de pastanaga */}
                  <polygon points="80,73 94,76 80,78" fill="#ea580c" />
                  {/* Somriure de carbó */}
                  <circle cx="74" cy="82" r="1.5" fill="#2c2825" />
                  <circle cx="78" cy="84" r="1.5" fill="#2c2825" />
                  <circle cx="82" cy="84" r="1.5" fill="#2c2825" />
                  <circle cx="86" cy="82" r="1.5" fill="#2c2825" />
                </>
              )}

              {/* Bufanda nadalenca (desapareix a errors >= 2) */}
              {errors < 2 && (
                <g>
                  <path
                    d="M 64 88 Q 80 94 96 88 Q 96 95 80 97 Q 64 95 64 88 Z"
                    fill="#b91c1c"
                  />
                  <path
                    d="M 88 92 L 95 118 L 86 119 L 81 94 Z"
                    fill="#b91c1c"
                  />
                  {/* Detalls daurats de la bufanda */}
                  <rect x="87" y="114" width="8" height="2" fill="#ffd700" />
                </g>
              )}

              {/* Barret de copa negre (desapareix a errors >= 1) */}
              {errors < 1 && (
                <g>
                  <ellipse cx="80" cy="56" rx="22" ry="4" fill="#2c2825" />
                  <rect x="66" y="32" width="28" height="23" rx="2" fill="#2c2825" />
                  <rect x="66" y="50" width="28" height="4" fill="#b91c1c" />
                </g>
              )}
            </>
          ) : (
            /* Estat de desglaç total */
            <g>
              <ellipse cx="80" cy="144" rx="45" ry="8" fill="#a5f3fc" opacity="0.8" />
              <ellipse cx="80" cy="144" rx="35" ry="6" fill="#67e8f9" opacity="0.6" />
              {/* Nas de pastanaga surant */}
              <polygon points="68,142 82,144 70,147" fill="#ea580c" />
              {/* Carbó caigut */}
              <circle cx="95" cy="144" r="2.5" fill="#2c2825" />
              <circle cx="102" cy="143" r="2" fill="#2c2825" />
              {/* Barret caigut a l'aigua */}
              <g transform="translate(38, 126) rotate(-25)">
                <ellipse cx="20" cy="18" rx="14" ry="3" fill="#2c2825" />
                <rect x="11" y="5" width="18" height="13" rx="1" fill="#2c2825" />
              </g>
              <text x="80" y="70" textAnchor="middle" fontSize="24">
                ☀️ 💧
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Visualització de la paraula o frase secreta (amb lletres d'una mateixa paraula sempre juntes) */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-2.5 px-2 py-2">
        {words.map((word, wordIdx) => (
          <div
            key={wordIdx}
            className="flex items-center gap-1 sm:gap-1.5 flex-nowrap whitespace-nowrap"
          >
            {word.split('').map((char, charIdx) => {
              const norm = normalizeChar(char)
              const isPunctuation = !/[A-ZÇ]/.test(norm)
              const isRevealed =
                isPunctuation || guessedLetters.has(norm) || isWon || isAlreadySolved

              return (
                <div
                  key={charIdx}
                  className={`flex flex-col items-center justify-end ${
                    isPunctuation
                      ? 'w-3 h-9 border-b-0'
                      : `${slotSizeClass} border-b-2 sm:border-b-3`
                  } transition-colors ${
                    isRevealed
                      ? isPunctuation
                        ? 'text-[#0f4437]'
                        : 'border-[#0f4437] text-[#0f4437]'
                      : 'border-[#7e7368] text-transparent'
                  }`}
                >
                  <span className={`${fontSizeClass} font-black leading-none mb-1`}>
                    {isRevealed ? char : '_'}
                  </span>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Estat de derrota */}
      {isLost && !isWon && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-center space-y-2 animate-in fade-in">
          <p className="text-xs text-red-800">
            S'ha desfet el ninot de neu! La solució era:{' '}
            <strong className="text-[#0f4437] uppercase">{secretRaw}</strong>
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
          <span>Molt bé! Has salvat el ninot de neu!</span>
        </div>
      )}

      {/* Teclat de lletres (A-Z) */}
      {!isWon && !isLost && (
        <div className="flex flex-wrap justify-center gap-1 sm:gap-1.5 pt-1">
          {ALPHABET.map((letter) => {
            const isUsed = guessedLetters.has(letter)
            const isCorrect = isUsed && targetLetters.has(letter)

            let btnStyle = 'bg-white border-[#d8cdbf] text-[#2c2825] hover:bg-[#faf6f2]'
            if (isUsed) {
              btnStyle = isCorrect
                ? 'bg-[#0f4437] border-[#0f4437] text-white font-bold opacity-90'
                : 'bg-[#e8dfd3] border-[#d8cdbf] text-[#8c8277] opacity-40 cursor-default'
            }

            return (
              <button
                key={letter}
                type="button"
                disabled={isUsed}
                onClick={() => handleGuess(letter)}
                className={`w-7 sm:w-8 h-8 rounded-lg border text-xs font-bold transition flex items-center justify-center shadow-2xs ${
                  !isUsed ? 'active:scale-95' : ''
                } ${btnStyle}`}
              >
                {letter}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

