'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Json } from '@/types/database'
import { CHALLENGE_REGISTRY } from '@/challenges/registry'
import type { ChallengeType } from '@/challenges/types'
import { RiddleEditor } from '@/challenges/riddle/Editor'
import { WordSearchEditor } from '@/challenges/wordsearch/Editor'
import { QuizEditor } from '@/challenges/quiz/Editor'
import { PhotoVotingEditor } from '@/challenges/photo_voting/Editor'
import { MemoryEditor } from '@/challenges/memory/Editor'
import { WordleEditor } from '@/challenges/wordle/Editor'
import { SnowmanEditor } from '@/challenges/snowman/Editor'
import { ScrambleEditor } from '@/challenges/scramble/Editor'
import { EquationEditor } from '@/challenges/equation/Editor'
import { SnowglobesEditor } from '@/challenges/snowglobes/Editor'
import { CatchGiftsEditor } from '@/challenges/catch_gifts/Editor'
import { FindCaganerEditor } from '@/challenges/find_caganer/Editor'
import { BellsMemoryEditor } from '@/challenges/bells_memory/Editor'
import { PicaTioEditor } from '@/challenges/pica_tio/Editor'
import { SudokuEditor } from '@/challenges/sudoku/Editor'
import { ImageUploader } from '@/components/ImageUploader'

interface ChallengeDayItem {
  day_number: number
  challenge_type: ChallengeType
  config: any
  riddle_text: string
  solution: string
  hint: string
  saved: boolean
  saving: boolean
  dirty: boolean
}

export default function CalendarRiddlesPage() {
  const router = useRouter()
  const params = useParams()
  const calendarId = params.id as string

  const [calendarTitle, setCalendarTitle] = useState('')
  const [puzzleImageUrl, setPuzzleImageUrl] = useState('')
  const [savingPuzzle, setSavingPuzzle] = useState(false)
  const [puzzleSaved, setPuzzleSaved] = useState(false)
  const [days, setDays] = useState<ChallengeDayItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingAll, setSavingAll] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const emptyDays = (): ChallengeDayItem[] =>
    Array.from({ length: 24 }, (_, i) => ({
      day_number: i + 1,
      challenge_type: 'riddle',
      config: { ...CHALLENGE_REGISTRY.riddle.defaultConfig },
      riddle_text: '',
      solution: '',
      hint: '',
      saved: false,
      saving: false,
      dirty: false,
    }))

  const fetchData = useCallback(async () => {
    setError(null)

    try {
      const fetchPromise = (async () => {
        const { data: cal, error: calError } = await supabase
          .from('calendars')
          .select('*')
          .eq('id', calendarId)
          .single()

        if (calError || !cal) {
          setError("No s'ha trobat el calendari.")
          return
        }

        setCalendarTitle(cal.title)
        setPuzzleImageUrl(cal.puzzle_image_url || '')

        const { data: existing, error: fetchError } = await supabase
          .from('calendar_riddles')
          .select('*')
          .eq('calendar_id', calendarId)

        if (fetchError) {
          setError(fetchError.message)
          return
        }

        const base = emptyDays()
        if (existing && existing.length > 0) {
          existing.forEach((r) => {
            const idx = r.day_number - 1
            if (idx >= 0 && idx < 24) {
              const cType = (r.challenge_type || 'riddle') as ChallengeType
              const reg = CHALLENGE_REGISTRY[cType] || CHALLENGE_REGISTRY.riddle

              let conf = (r.config as Record<string, unknown>) || {}
              if (Object.keys(conf).length === 0) {
                if (cType === 'riddle') {
                  conf = {
                    question: r.riddle_text || '',
                    solution: r.solution || '',
                    hint: r.hint || '',
                  }
                } else {
                  conf = { ...reg.defaultConfig }
                }
              }

              base[idx] = {
                day_number: r.day_number,
                challenge_type: cType,
                config: conf,
                riddle_text: r.riddle_text || '',
                solution: r.solution || '',
                hint: r.hint || '',
                saved: true,
                saving: false,
                dirty: false,
              }
            }
          })
        }

        setDays(base)
      })()

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error('Temps d\'espera esgotat carregant el calendari.')
            ),
          7000
        )
      )

      await Promise.race([fetchPromise, timeoutPromise])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error carregant les dades del calendari.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [calendarId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSavePuzzleImage = async (newUrl: string) => {
    setPuzzleImageUrl(newUrl)
    setSavingPuzzle(true)
    setError(null)

    const { error: updateError } = await supabase
      .from('calendars')
      .update({ puzzle_image_url: newUrl ? newUrl.trim() : null })
      .eq('id', calendarId)

    setSavingPuzzle(false)
    if (updateError) {
      setError(`Error en desar la imatge del trencaclosques: ${updateError.message}`)
    } else {
      setSuccessMessage('Imatge del trencaclosques actualitzada correctament!')
      setPuzzleSaved(true)
      setTimeout(() => setPuzzleSaved(false), 3000)
    }
  }

  const changeChallengeType = (dayNumber: number, newType: ChallengeType) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.day_number !== dayNumber) return d
        const reg = CHALLENGE_REGISTRY[newType] || CHALLENGE_REGISTRY.riddle
        return {
          ...d,
          challenge_type: newType,
          config: { ...reg.defaultConfig },
          dirty: true,
        }
      })
    )
  }

  const updateConfig = (dayNumber: number, newConfig: any) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.day_number !== dayNumber) return d

        let rText = d.riddle_text
        let sol = d.solution
        let h = d.hint

        if (d.challenge_type === 'riddle') {
          rText = (newConfig.question as string) || ''
          sol = (newConfig.solution as string) || ''
          h = (newConfig.hint as string) || ''
        } else if (d.challenge_type === 'wordsearch') {
          rText = (newConfig.title as string) || 'Sopa de lletres'
          sol = Array.isArray(newConfig.words) ? (newConfig.words as string[]).join(', ') : ''
        } else if (d.challenge_type === 'quiz') {
          const qList = newConfig.questions || []
          rText = qList.length > 1
            ? `Quiz familiar (${qList.length} preguntes)`
            : (qList[0]?.question || (newConfig.question as string) || 'Pregunta familiar')
          const firstOpts = qList[0]?.options || (newConfig.options as string[]) || []
          const cIdx = typeof qList[0]?.correctIndex === 'number' ? qList[0].correctIndex : (typeof newConfig.correctIndex === 'number' ? newConfig.correctIndex : 0)
          sol = firstOpts[cIdx] || ''
        } else if (d.challenge_type === 'photo_voting') {
          const pList = newConfig.photos || []
          rText = pList.length > 1
            ? `Foto misteriosa (${pList.length} fotos)`
            : (pList[0]?.title || (newConfig.title as string) || 'Foto misteriosa')
          sol = pList[0]?.correctPerson || (newConfig.correctPerson as string) || ''
          h = (pList[0]?.hint as string) || (newConfig.hint as string) || ''
        } else if (d.challenge_type === 'memory') {
          const total = newConfig.totalCards || (newConfig.pairCount ? newConfig.pairCount * 2 : 12)
          rText = (newConfig.title as string) || `Joc de memòria (${total} caselles)`
          sol = `${total} caselles completades`
        }

        return {
          ...d,
          config: newConfig,
          riddle_text: rText,
          solution: sol,
          hint: h,
          dirty: true,
        }
      })
    )
  }

  const saveDay = async (dayNumber: number) => {
    setError(null)
    setSuccessMessage(null)

    const item = days.find((d) => d.day_number === dayNumber)
    if (!item) return

    setDays((prev) =>
      prev.map((d) => (d.day_number === dayNumber ? { ...d, saving: true } : d))
    )

    const cleanHint = item.challenge_type === 'riddle' && item.hint && item.hint.trim()
      ? item.hint.trim()
      : null
    const cleanConfig = {
      ...item.config,
      ...(item.challenge_type === 'riddle' ? { hint: cleanHint } : {}),
    }

    const payload = {
      calendar_id: calendarId,
      day_number: dayNumber,
      challenge_type: item.challenge_type,
      config: cleanConfig as Json,
      riddle_text: item.riddle_text,
      solution: item.solution,
      hint: cleanHint,
    }

    const { error: upsertError } = await supabase
      .from('calendar_riddles')
      .upsert(payload, { onConflict: 'calendar_id,day_number' })

    if (upsertError) {
      setError(`Error en desar el dia ${dayNumber}: ${upsertError.message}`)
      setDays((prev) =>
        prev.map((d) => (d.day_number === dayNumber ? { ...d, saving: false } : d))
      )
      return
    }

    setDays((prev) =>
      prev.map((d) =>
        d.day_number === dayNumber
          ? { ...d, saved: true, dirty: false, saving: false }
          : d
      )
    )
    setSuccessMessage(`Dia ${dayNumber} desat correctament!`)
  }

  const saveAll = async () => {
    setError(null)
    setSuccessMessage(null)
    setSavingAll(true)

    const dirtyOrUnsaved = days.filter((d) => d.dirty || !d.saved)

    if (dirtyOrUnsaved.length === 0) {
      setSuccessMessage('No hi ha canvis pendents per desar.')
      setSavingAll(false)
      return
    }

    const payload = dirtyOrUnsaved.map((d) => {
      const cleanHint = d.challenge_type === 'riddle' && d.hint && d.hint.trim() ? d.hint.trim() : null
      const cleanConfig = {
        ...d.config,
        ...(d.challenge_type === 'riddle' ? { hint: cleanHint } : {}),
      }
      return {
        calendar_id: calendarId,
        day_number: d.day_number,
        challenge_type: d.challenge_type,
        config: cleanConfig as Json,
        riddle_text: d.riddle_text,
        solution: d.solution,
        hint: cleanHint,
      }
    })

    const { error: upsertError } = await supabase
      .from('calendar_riddles')
      .upsert(payload, { onConflict: 'calendar_id,day_number' })

    if (upsertError) {
      setError(`Error en desar: ${upsertError.message}`)
      setSavingAll(false)
      return
    }

    setDays((prev) =>
      prev.map((d) => {
        const wasSaved = dirtyOrUnsaved.some((item) => item.day_number === d.day_number)
        return wasSaved ? { ...d, saved: true, dirty: false, saving: false } : d
      })
    )

    setSavingAll(false)
    setSuccessMessage(`S'han desat ${dirtyOrUnsaved.length} dies correctament!`)
  }

  const renderEditor = (day: ChallengeDayItem) => {
    switch (day.challenge_type) {
      case 'wordsearch':
        return (
          <WordSearchEditor
            config={day.config as any}
            onChange={(newConf) => updateConfig(day.day_number, newConf)}
          />
        )
      case 'quiz':
        return (
          <QuizEditor
            config={day.config as any}
            onChange={(newConf) => updateConfig(day.day_number, newConf)}
          />
        )
      case 'photo_voting':
        return (
          <PhotoVotingEditor
            config={day.config as any}
            onChange={(newConf) => updateConfig(day.day_number, newConf)}
          />
        )
      case 'memory':
        return (
          <MemoryEditor
            config={day.config as any}
            onChange={(newConf) => updateConfig(day.day_number, newConf)}
          />
        )
      case 'wordle':
        return (
          <WordleEditor
            config={day.config as any}
            onChange={(newConf) => updateConfig(day.day_number, newConf)}
          />
        )
      case 'snowman':
        return (
          <SnowmanEditor
            config={day.config as any}
            onChange={(newConf) => updateConfig(day.day_number, newConf)}
          />
        )
      case 'scramble':
        return (
          <ScrambleEditor
            config={day.config as any}
            onChange={(newConf) => updateConfig(day.day_number, newConf)}
          />
        )
      case 'equation':
        return (
          <EquationEditor
            config={day.config as any}
            onChange={(newConf) => updateConfig(day.day_number, newConf)}
          />
        )
      case 'snowglobes':
        return (
          <SnowglobesEditor
            config={day.config as any}
            onChange={(newConf) => updateConfig(day.day_number, newConf)}
          />
        )
      case 'catch_gifts':
        return (
          <CatchGiftsEditor
            config={day.config as any}
            onChange={(newConf) => updateConfig(day.day_number, newConf)}
          />
        )
      case 'find_caganer':
        return (
          <FindCaganerEditor
            config={day.config as any}
            onChange={(newConf) => updateConfig(day.day_number, newConf)}
          />
        )
      case 'bells_memory':
        return (
          <BellsMemoryEditor
            config={day.config as any}
            onChange={(newConf) => updateConfig(day.day_number, newConf)}
          />
        )
      case 'pica_tio':
        return (
          <PicaTioEditor
            config={day.config as any}
            onChange={(newConf) => updateConfig(day.day_number, newConf)}
          />
        )
      case 'sudoku':
        return (
          <SudokuEditor
            config={day.config as any}
            onChange={(newConf) => updateConfig(day.day_number, newConf)}
          />
        )
      case 'riddle':
      default:
        return (
          <RiddleEditor
            config={day.config as any}
            onChange={(newConf) => updateConfig(day.day_number, newConf)}
          />
        )
    }
  }

  const filledCount = days.filter((d) => d.saved).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-[#0f4437]">
        <div className="text-lg font-medium animate-pulse">🎄 Carregant reptes del calendari...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="text-[#6e6358] hover:text-[#0f4437] text-xs flex items-center gap-1 mb-1 transition-colors font-medium"
          >
            ← Tornar als calendaris
          </button>
          <h2 className="text-2xl font-bold text-[#0f4437]">{calendarTitle}</h2>
          <p className="text-[#6e6358] text-sm mt-0.5">
            Configura els 24 minijocs i endevinalles diàries per a aquest calendari
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-[#7e7368]">Estat</div>
            <div
              className={`text-sm font-bold ${
                filledCount === 24 ? 'text-[#0f4437]' : 'text-amber-700'
              }`}
            >
              {filledCount}/24 configurats
            </div>
          </div>
          <button
            onClick={saveAll}
            disabled={savingAll}
            className="px-4 py-2 bg-[#b91c1c] hover:bg-[#a11818] text-white font-bold text-sm rounded-xl shadow-xs transition disabled:opacity-50"
          >
            {savingAll ? 'Desant tot...' : '💾 Desar-ho tot'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-[#0f4437]/10 border border-[#0f4437]/25 text-[#0f4437] px-4 py-3 rounded-xl text-sm font-medium">
          {successMessage}
        </div>
      )}

      {/* Targeta de la Foto Secreta del Trencaclosques Familiar */}
      <div className="rounded-2xl border border-[#0f4437]/20 bg-[#fdfbf7] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0e8dc] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#0f4437] flex items-center gap-2">
              <span className="text-lg">🧩</span>
              <span>Foto Secreta del Trencaclosques Familiar</span>
            </h3>
            <p className="text-xs text-[#6e6358] mt-0.5">
              Aquesta és la foto que es destaparà peça a peça a mesura que la família resolgui els 24 dies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {savingPuzzle && (
              <span className="text-xs text-[#0f4437] font-semibold animate-pulse">
                ⏳ Desant foto...
              </span>
            )}
            {puzzleSaved && (
              <span className="text-xs text-[#0f4437] font-bold bg-[#0f4437]/10 px-2.5 py-1 rounded-full">
                ✓ Desada correctament
              </span>
            )}
          </div>
        </div>

        <div className="max-w-md">
          <ImageUploader
            value={puzzleImageUrl}
            onChange={handleSavePuzzleImage}
            calendarId={calendarId}
            aspectRatio="wide"
            enableCropper={true}
            cropAspectRatio={1.5}
            label="Fotografia familiar del trencaclosques (6×4)"
            sublabel="S'enquadrarà en format 3:2 exacte per cobrir al 100% l'alçada i amplada del trencaclosques sense retallades."
          />
        </div>
      </div>

      {/* Grid de 24 caselles de jocs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days.map((day) => {
          const isConfigured = day.saved && !day.dirty
          const meta = CHALLENGE_REGISTRY[day.challenge_type] || CHALLENGE_REGISTRY.riddle

          return (
            <div
              key={day.day_number}
              className={`rounded-2xl border p-4 space-y-3 transition-colors bg-[#fdfbf7] flex flex-col justify-between ${
                isConfigured
                  ? 'border-[#0f4437]/30 shadow-xs'
                  : 'border-[#e8dfd3]'
              }`}
            >
              <div className="space-y-3">
                {/* Capçalera del dia */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0f4437] flex items-center gap-2 text-sm">
                    <span className="w-7 h-7 rounded-lg bg-[#0f4437]/10 text-[#0f4437] flex items-center justify-center text-xs font-black">
                      {day.day_number}
                    </span>
                    Dia {day.day_number}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      isConfigured
                        ? 'bg-[#0f4437]/15 text-[#0f4437]'
                        : day.dirty
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-[#f5ede3] text-[#7e7368]'
                    }`}
                  >
                    {isConfigured ? '✓ Desat' : day.dirty ? '● Modificat' : '○ Buit'}
                  </span>
                </div>

                {/* Selector de Minijoc */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#6e6358] uppercase tracking-wider mb-1">
                    Tipus de Minijoc
                  </label>
                  <select
                    value={day.challenge_type}
                    onChange={(e) =>
                      changeChallengeType(day.day_number, e.target.value as ChallengeType)
                    }
                    className="w-full px-3 py-1.5 bg-white border border-[#d8cdbf] rounded-xl text-xs font-bold text-[#0f4437] focus:outline-none focus:ring-2 focus:ring-[#0f4437]/15 focus:border-[#0f4437]"
                  >
                    {Object.values(CHALLENGE_REGISTRY).map((reg) => (
                      <option key={reg.type} value={reg.type}>
                        {reg.icon} {reg.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-[#7e7368] mt-1">
                    {meta.description}
                  </p>
                </div>

                {/* Editor interactiu específic del tipus de joc */}
                <div className="pt-1 border-t border-[#f0e8dc]">
                  {renderEditor(day)}
                </div>
              </div>

              {/* Botó de desar per dia */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => saveDay(day.day_number)}
                  disabled={day.saving || (!day.dirty && day.saved)}
                  className="w-full py-2 bg-[#0f4437] hover:bg-[#145647] text-white text-xs font-semibold rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                >
                  {day.saving ? 'Desant...' : 'Desar aquest dia'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
