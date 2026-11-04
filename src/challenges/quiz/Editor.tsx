'use client'

import { useMemo } from 'react'
import type { ChallengeEditorProps } from '../types'
import type { QuizConfig, QuizQuestion } from './types'
import { Plus, Trash2, HelpCircle } from 'lucide-react'

export function QuizEditor({
  config,
  onChange,
}: ChallengeEditorProps<QuizConfig>) {
  // Normalitzar llista de preguntes
  const questions: QuizQuestion[] = useMemo(() => {
    if (config.questions && config.questions.length > 0) {
      return config.questions
    }
    if (config.question) {
      return [
        {
          question: config.question,
          options: config.options || ['Opció 1', 'Opció 2', 'Opció 3', 'Opció 4'],
          correctIndex: typeof config.correctIndex === 'number' ? config.correctIndex : 0,
          explanation: config.explanation || '',
        },
      ]
    }
    return [
      {
        question: '',
        options: ['Opció 1', 'Opció 2', 'Opció 3', 'Opció 4'],
        correctIndex: 0,
        explanation: '',
      },
    ]
  }, [config])

  const updateQuestions = (newQuestions: QuizQuestion[]) => {
    onChange({
      ...config,
      questions: newQuestions,
      // Mantenir el primer com a fallback clàssic per compatibilitat
      question: newQuestions[0]?.question || '',
      options: newQuestions[0]?.options || [],
      correctIndex: newQuestions[0]?.correctIndex ?? 0,
      explanation: newQuestions[0]?.explanation || '',
    })
  }

  const handleQuestionTextChange = (qIndex: number, text: string) => {
    const updated = [...questions]
    updated[qIndex] = { ...updated[qIndex], question: text }
    updateQuestions(updated)
  }

  const handleOptionChange = (qIndex: number, optIndex: number, val: string) => {
    const updated = [...questions]
    const opts = [...(updated[qIndex].options || [])]
    opts[optIndex] = val
    updated[qIndex] = { ...updated[qIndex], options: opts }
    updateQuestions(updated)
  }

  const handleCorrectChange = (qIndex: number, optIndex: number) => {
    const updated = [...questions]
    updated[qIndex] = { ...updated[qIndex], correctIndex: optIndex }
    updateQuestions(updated)
  }

  const handleExplanationChange = (qIndex: number, explanation: string) => {
    const updated = [...questions]
    updated[qIndex] = { ...updated[qIndex], explanation }
    updateQuestions(updated)
  }

  const handleAddOption = (qIndex: number) => {
    const updated = [...questions]
    const opts = updated[qIndex].options || []
    if (opts.length >= 6) return
    updated[qIndex] = {
      ...updated[qIndex],
      options: [...opts, `Opció ${opts.length + 1}`],
    }
    updateQuestions(updated)
  }

  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    const updated = [...questions]
    const opts = updated[qIndex].options || []
    if (opts.length <= 2) return
    const newOpts = opts.filter((_, i) => i !== optIndex)
    const currentCorrect = updated[qIndex].correctIndex || 0
    const newCorrect = currentCorrect >= newOpts.length ? 0 : currentCorrect
    updated[qIndex] = {
      ...updated[qIndex],
      options: newOpts,
      correctIndex: newCorrect,
    }
    updateQuestions(updated)
  }

  const handleAddQuestion = () => {
    const newQ: QuizQuestion = {
      question: '',
      options: ['Opció 1', 'Opció 2', 'Opció 3', 'Opció 4'],
      correctIndex: 0,
      explanation: '',
    }
    updateQuestions([...questions, newQ])
  }

  const handleRemoveQuestion = (qIndex: number) => {
    if (questions.length <= 1) return
    const updated = questions.filter((_, i) => i !== qIndex)
    updateQuestions(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#6e6358] uppercase tracking-wider">
          Preguntes del Quiz ({questions.length})
        </span>
        <button
          type="button"
          onClick={handleAddQuestion}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0f4437]/10 hover:bg-[#0f4437]/20 text-[#0f4437] text-xs font-bold rounded-lg transition"
        >
          <Plus className="w-3.5 h-3.5" /> Afegir pregunta
        </button>
      </div>

      {questions.map((q, qIndex) => {
        const opts = q.options && q.options.length > 0 ? q.options : ['Opció 1', 'Opció 2']
        const correct = typeof q.correctIndex === 'number' ? q.correctIndex : 0

        return (
          <div
            key={qIndex}
            className="p-3.5 rounded-xl border border-[#e8dfd3] bg-white space-y-3 relative shadow-xs"
          >
            {/* Header de la pregunta */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0f4437] flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                Pregunta {qIndex + 1}
              </span>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(qIndex)}
                  className="text-[#7e7368] hover:text-[#b91c1c] p-1 transition"
                  title="Eliminar aquesta pregunta"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Enunciat */}
            <div>
              <label className="block text-[10px] font-semibold text-[#7e7368] uppercase tracking-wider mb-1">
                Text de la pregunta
              </label>
              <textarea
                rows={2}
                value={q.question || ''}
                onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                placeholder="p. ex. Quin any vam anar a la neu per Nadal?"
                className="w-full px-2.5 py-1.5 bg-[#fdfbf7] border border-[#d8cdbf] rounded-lg text-[#2c2825] placeholder-[#9c9184] text-xs focus:outline-none focus:ring-2 focus:ring-[#0f4437]/15 focus:border-[#0f4437] resize-none"
              />
            </div>

            {/* Opcions */}
            <div>
              <label className="block text-[10px] font-semibold text-[#7e7368] uppercase tracking-wider mb-1">
                Opcions (marca el cercle de la resposta correcta ✓)
              </label>
              <div className="space-y-1.5">
                {opts.map((opt, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name={`quiz_q_${qIndex}`}
                      checked={correct === optIndex}
                      onChange={() => handleCorrectChange(qIndex, optIndex)}
                      className="w-3.5 h-3.5 text-[#0f4437] accent-[#0f4437] cursor-pointer"
                      title="Marcar com a resposta correcta"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                      placeholder={`Opció ${optIndex + 1}`}
                      className="flex-1 px-2.5 py-1 bg-[#fdfbf7] border border-[#d8cdbf] rounded-lg text-[#2c2825] text-xs focus:outline-none focus:ring-1 focus:ring-[#0f4437]"
                    />
                    {opts.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(qIndex, optIndex)}
                        className="p-1 text-[#7e7368] hover:text-[#b91c1c] transition"
                        title="Eliminar opció"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {opts.length < 6 && (
                <button
                  type="button"
                  onClick={() => handleAddOption(qIndex)}
                  className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-[#0f4437] hover:underline"
                >
                  <Plus className="w-3 h-3" /> Afegir opció
                </button>
              )}
            </div>

            {/* Explicació opcional */}
            <div>
              <label className="block text-[10px] font-semibold text-[#7e7368] uppercase tracking-wider mb-1">
                Anècdota o explicació <span className="font-normal lowercase">(opcional)</span>
              </label>
              <input
                type="text"
                value={q.explanation || ''}
                onChange={(e) => handleExplanationChange(qIndex, e.target.value)}
                placeholder="p. ex. Va ser l'any 2018 i va caure una gran nevada!"
                className="w-full px-2.5 py-1 bg-[#fdfbf7] border border-[#d8cdbf] rounded-lg text-[#2c2825] placeholder-[#9c9184] text-xs focus:outline-none focus:ring-1 focus:ring-[#0f4437]"
              />
            </div>
          </div>
        )
      })}

      {questions.length > 1 && (
        <button
          type="button"
          onClick={handleAddQuestion}
          className="w-full py-2 border-2 border-dashed border-[#d8cdbf] hover:border-[#0f4437] rounded-xl text-xs font-bold text-[#0f4437] hover:bg-[#0f4437]/5 transition flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Afegir una altra pregunta al quiz
        </button>
      )}
    </div>
  )
}
