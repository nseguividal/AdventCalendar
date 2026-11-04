'use client'

import { useState, useMemo } from 'react'
import type { ChallengePlayerProps } from '../types'
import type { QuizConfig, QuizQuestion } from './types'
import { CheckCircle2, XCircle, HelpCircle, ArrowRight, Sparkles } from 'lucide-react'

export function QuizPlayer({
  config,
  isAlreadySolved,
  onSuccess,
}: ChallengePlayerProps<QuizConfig>) {
  // Normalitzar preguntes (suporta tant el format nou amb array com l'antic d'una sola pregunta)
  const questions: QuizQuestion[] = useMemo(() => {
    if (config.questions && config.questions.length > 0) {
      return config.questions
    }
    if (config.question) {
      return [
        {
          question: config.question,
          options: config.options || ['Opció A', 'Opció B', 'Opció C', 'Opció D'],
          correctIndex: typeof config.correctIndex === 'number' ? config.correctIndex : 0,
          explanation: config.explanation,
        },
      ]
    }
    return [
      {
        question: "Pregunta sobre la família per al dia d'avui:",
        options: ['Opció 1', 'Opció 2', 'Opció 3', 'Opció 4'],
        correctIndex: 0,
      },
    ]
  }, [config])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isWrong, setIsWrong] = useState(false)
  const [isCurrentCorrect, setIsCurrentCorrect] = useState(false)

  const currentQ = questions[currentIndex] || questions[0]
  const options = currentQ.options && currentQ.options.length > 0
    ? currentQ.options
    : ['Opció A', 'Opció B']
  const correctIdx = typeof currentQ.correctIndex === 'number' ? currentQ.correctIndex : 0

  const handleSelect = (idx: number) => {
    if (isAlreadySolved || isCurrentCorrect) return

    setSelectedIndex(idx)

    if (idx === correctIdx) {
      setIsWrong(false)
      setIsCurrentCorrect(true)

      // Si és l'última pregunta i no té explicació, donem un petit moment i completem
      const isLastQuestion = currentIndex === questions.length - 1
      if (isLastQuestion && !currentQ.explanation) {
        setTimeout(() => {
          onSuccess()
        }, 600)
      }
    } else {
      setIsWrong(true)
      setIsCurrentCorrect(false)
    }
  }

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedIndex(null)
      setIsWrong(false)
      setIsCurrentCorrect(false)
    } else {
      onSuccess()
    }
  }

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F']
  const isLast = currentIndex === questions.length - 1

  return (
    <div className="space-y-4">
      {/* Indicador de progrés per a múltiples preguntes */}
      {questions.length > 1 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#6e6358]">
            <span className="flex items-center gap-1.5 text-[#0f4437]">
              <HelpCircle className="w-3.5 h-3.5" /> Trivia familiar
            </span>
            <span>
              Pregunta {currentIndex + 1} de {questions.length}
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#e8dfd3] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0f4437] transition-all duration-300 rounded-full"
              style={{
                width: `${((currentIndex + (isCurrentCorrect ? 1 : 0)) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Targeta de la pregunta actual */}
      <div className="rounded-2xl bg-[#f5ede3]/70 border border-[#e8dfd3] p-4 text-center">
        {questions.length === 1 && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0f4437]/10 text-[#0f4437] text-[11px] font-bold uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5" /> Trivia familiar
          </div>
        )}
        <h4 className="text-sm sm:text-base font-bold text-[#0f4437] leading-snug">
          {currentQ.question}
        </h4>
      </div>

      {/* Llista d'opcions */}
      <div className="space-y-2">
        {options.map((option, idx) => {
          const isSelected = selectedIndex === idx
          const isCorrectAnswer = idx === correctIdx

          let buttonStyle = 'bg-white border-[#d8cdbf] text-[#2c2825] hover:bg-[#faf6f2]'
          if (isAlreadySolved || (isCurrentCorrect && isCorrectAnswer)) {
            buttonStyle = 'bg-[#0f4437] border-[#0f4437] text-white shadow-sm'
          } else if (isSelected && isWrong) {
            buttonStyle = 'bg-red-50 border-red-300 text-red-800 animate-shake'
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isAlreadySolved || isCurrentCorrect}
              onClick={() => handleSelect(idx)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl border text-left text-xs sm:text-sm font-semibold transition active:scale-[0.99] ${buttonStyle}`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    (isAlreadySolved && isCorrectAnswer) || (isCurrentCorrect && isCorrectAnswer)
                      ? 'bg-white/20 text-white'
                      : isSelected && isWrong
                      ? 'bg-red-200 text-red-900'
                      : 'bg-[#f4ede3] text-[#6e6358]'
                  }`}
                >
                  {optionLetters[idx] || idx + 1}
                </span>
                <span>{option}</span>
              </div>

              {((isAlreadySolved && isCorrectAnswer) || (isCurrentCorrect && isCorrectAnswer)) && (
                <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
              )}
              {isSelected && isWrong && (
                <XCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
            </button>
          )
        })}
      </div>

      {/* Feedback d'error */}
      {isWrong && !isAlreadySolved && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-2.5 text-center text-xs text-red-700 animate-in fade-in">
          ❌ Resposta incorrecta. Torna-ho a provar!
        </div>
      )}

      {/* Explicació o pas següent quan s'ha encertat la pregunta actual */}
      {isCurrentCorrect && !isAlreadySolved && (
        <div className="space-y-3 rounded-xl bg-[#0f4437]/10 border border-[#0f4437]/20 p-3 text-xs text-[#0f4437] animate-in fade-in">
          <div className="flex items-center justify-center gap-1.5 font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#0f4437]" />
            <span>Resposta correcta!</span>
          </div>

          {currentQ.explanation && (
            <p className="text-center text-[#2c2825]">
              💡 {currentQ.explanation}
            </p>
          )}

          <button
            type="button"
            onClick={handleNextQuestion}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0f4437] hover:bg-[#145647] text-white font-bold rounded-xl transition shadow-xs text-xs sm:text-sm"
          >
            {isLast ? (
              <>
                <Sparkles className="w-4 h-4 text-[#faf6f2]" />
                <span>Finalitzar quiz familiar</span>
              </>
            ) : (
              <>
                <span>Següent pregunta</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Si ja està resolt anteriorment */}
      {isAlreadySolved && currentQ.explanation && (
        <div className="rounded-xl bg-[#0f4437]/10 border border-[#0f4437]/20 p-3 text-xs text-[#0f4437] text-center">
          💡 {currentQ.explanation}
        </div>
      )}
    </div>
  )
}
