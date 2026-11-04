'use client'

import { useState } from 'react'
import type { ChallengePlayerProps } from '../types'
import type { EquationConfig } from './types'
import { Sparkles, HelpCircle, CheckCircle2, Delete } from 'lucide-react'

export function EquationPlayer({
  config,
  isAlreadySolved,
  onSuccess,
}: ChallengePlayerProps<EquationConfig>) {
  const lines =
    config.lines && config.lines.length > 0
      ? config.lines
      : [
          '🎄 + 🎄 = 10',
          '🎄 + 🎁 = 9',
          '🎁 + 🔔 = 7',
          '🎄 + 🎁 × 🔔 = ?',
        ]

  const correctSolution = String(config.solution ?? '17').trim()

  const [inputVal, setInputVal] = useState(isAlreadySolved ? correctSolution : '')
  const [isSolved, setIsSolved] = useState(isAlreadySolved)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)

  const handleDigit = (digit: string) => {
    if (isSolved || isAlreadySolved) return
    setErrorMsg(null)
    if (inputVal.length < 6) {
      setInputVal((prev) => prev + digit)
    }
  }

  const handleDelete = () => {
    if (isSolved || isAlreadySolved) return
    setErrorMsg(null)
    setInputVal((prev) => prev.slice(0, -1))
  }

  const handleClear = () => {
    if (isSolved || isAlreadySolved) return
    setErrorMsg(null)
    setInputVal('')
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isSolved || isAlreadySolved) return

    if (!inputVal.trim()) {
      setErrorMsg('Introdueix un número')
      return
    }

    if (inputVal.trim() === correctSolution) {
      setIsSolved(true)
      setErrorMsg(null)
      onSuccess()
    } else {
      setErrorMsg('Aquest no és el resultat correcte. Revisa els càlculs!')
    }
  }

  return (
    <div className="space-y-2 sm:space-y-2.5 max-w-sm mx-auto select-none">
      {/* Títol i instruccions */}
      <div className="text-center">
        <h4 className="text-xs sm:text-sm font-bold text-[#0f4437]">
          {config.title || 'Enigma Matemàtic de Nadal'}
        </h4>
        <p className="text-[10px] text-[#7e7368] mt-0.5">
          {config.instructions || 'Calcula el valor de cada símbol'}
        </p>
      </div>

      {/* Pista opcional */}
      {config.hint && !isSolved && (
        <div className="text-center">
          {!showHint ? (
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="inline-flex items-center gap-1 text-[10px] text-[#248896] hover:underline font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Necessites una pista?
            </button>
          ) : (
            <div className="rounded-lg bg-[#248896]/10 border border-[#248896]/20 py-1 px-2.5 text-[10px] text-[#248896] font-medium animate-in fade-in">
              💡 {config.hint}
            </div>
          )}
        </div>
      )}

      {/* Pissarra amb les equacions */}
      <div className="rounded-2xl border-2 border-[#d8cdbf] bg-[#faf6f2] p-2.5 sm:p-3 shadow-sm space-y-1.5">
        {lines.map((line, idx) => {
          const isQuestionLine = idx === lines.length - 1 || line.includes('?')

          return (
            <div
              key={idx}
              className={`rounded-xl px-2.5 py-1 sm:py-1.5 text-center text-xs sm:text-sm font-bold transition-colors ${
                isQuestionLine
                  ? 'bg-[#0f4437]/10 border border-[#0f4437]/25 text-[#0f4437] text-sm sm:text-base shadow-2xs font-black'
                  : 'bg-white/80 border border-[#e8dfd3] text-[#2c2825]'
              }`}
            >
              <span>{line}</span>
            </div>
          )
        })}
      </div>

      {/* Missatge d'error */}
      {errorMsg && (
        <div className="text-center text-xs font-bold text-[#b91c1c] animate-bounce">
          {errorMsg}
        </div>
      )}

      {/* Estat resolt */}
      {isSolved && (
        <div className="rounded-xl bg-[#0f4437]/10 border border-[#0f4437]/20 p-2.5 text-center text-xs font-bold text-[#0f4437] flex items-center justify-center gap-1.5 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-[#c89332]" />
          <span>Molt ben calculat! La resposta correcta és {correctSolution}!</span>
        </div>
      )}

      {/* Pantalla de resposta i teclat numèric compacte */}
      {!isSolved && (
        <div className="space-y-2">
          {/* Caixa de visualització del número */}
          <div className="flex items-center justify-between rounded-xl border-2 border-[#0f4437] bg-white px-3 py-1.5 shadow-xs">
            <span className="text-[11px] font-bold text-[#6e6358]">La teva solució:</span>
            <span className="text-lg font-black font-mono text-[#0f4437] tracking-wider min-h-[24px]">
              {inputVal || <span className="text-[#c0b5a6] font-normal">?</span>}
            </span>
          </div>

          {/* Teclat numèric compacte d'alçada reduïda */}
          <div className="grid grid-cols-3 gap-1 pt-0.5">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigit(digit)}
                className="h-8 sm:h-8.5 rounded-lg bg-white border border-[#d8cdbf] text-sm sm:text-base font-bold text-[#2c2825] hover:bg-[#faf6f2] hover:border-[#0f4437] active:scale-95 transition shadow-2xs"
              >
                {digit}
              </button>
            ))}

            <button
              type="button"
              onClick={handleClear}
              className="h-8 sm:h-8.5 rounded-lg bg-[#f4ede3] border border-[#d8cdbf] text-xs font-bold text-[#7e7368] hover:bg-[#e8dfd3] active:scale-95 transition"
            >
              C
            </button>

            <button
              type="button"
              onClick={() => handleDigit('0')}
              className="h-8 sm:h-8.5 rounded-lg bg-white border border-[#d8cdbf] text-sm sm:text-base font-bold text-[#2c2825] hover:bg-[#faf6f2] hover:border-[#0f4437] active:scale-95 transition shadow-2xs"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="h-8 sm:h-8.5 rounded-lg bg-[#f4ede3] border border-[#d8cdbf] text-xs font-bold text-[#7e7368] hover:bg-[#e8dfd3] active:scale-95 transition flex items-center justify-center"
            >
              <Delete className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleSubmit()}
            className="w-full flex items-center justify-center gap-1.5 py-2 sm:py-2.5 bg-[#0f4437] hover:bg-[#145647] text-white font-bold rounded-xl transition shadow-xs text-xs sm:text-sm active:scale-[0.98]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Comprovar resultat</span>
          </button>
        </div>
      )}
    </div>
  )
}

