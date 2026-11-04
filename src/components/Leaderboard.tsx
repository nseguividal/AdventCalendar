'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types/database'
import { Trophy, Clock, Zap, X, Award } from 'lucide-react'

interface LeaderboardProps {
  calendarId: string
}

interface SolveDeltaEntry {
  userName: string
  avatarColor: string
  dayNumber: number
  deltaSeconds: number
  formattedTime: string
  score?: number | null
  totalPhotos?: number
  solvedAt: string
  challengeType: string
}

interface FirstOpenEntry {
  userName: string
  avatarColor: string
  dayNumber: number
  openedAt: string
}

interface DayChallengeInfo {
  challengeType: string
  totalPhotos: number
}

function getDefaultDay(): number {
  const now = new Date()
  // 11 és Desembre a JavaScript (0-indexat)
  if (now.getMonth() === 11) {
    const day = now.getDate()
    if (day >= 1 && day <= 24) return day
    if (day > 24) return 24
  }
  return 1 // Si encara no és desembre (p. ex. novembre o octubre), per defecte el dia 1
}

export function Leaderboard({ calendarId }: LeaderboardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'solvers' | 'openers'>('solvers')
  const [loading, setLoading] = useState(false)
  const [fastestSolves, setFastestSolves] = useState<SolveDeltaEntry[]>([])
  const [firstOpens, setFirstOpens] = useState<FirstOpenEntry[]>([])
  const [dayFilter, setDayFilter] = useState<number | 'all'>(getDefaultDay)
  const [riddlesMap, setRiddlesMap] = useState<Map<number, DayChallengeInfo>>(
    new Map()
  )

  const fetchLeaderboards = async () => {
    setLoading(true)
    try {
      // 1. Fetch all users for this calendar
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .eq('calendar_id', calendarId)

      const usersMap = new Map<string, User>()
      ;(usersData || []).forEach((u) => usersMap.set(u.id, u))

      // 2. Fetch challenges/riddles to identify challenge types and total photos
      const { data: riddlesData } = await supabase
        .from('calendar_riddles')
        .select('day_number, challenge_type, config')
        .eq('calendar_id', calendarId)

      const rMap = new Map<number, DayChallengeInfo>()
      ;(riddlesData || []).forEach((r) => {
        const cfg = (r.config || {}) as any
        let totalPhotos = 1
        if (Array.isArray(cfg?.photos) && cfg.photos.length > 0) {
          totalPhotos = cfg.photos.length
        }
        rMap.set(r.day_number, {
          challengeType: r.challenge_type || 'riddle',
          totalPhotos,
        })
      })
      setRiddlesMap(rMap)

      // 3. Fetch all progress records
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('calendar_id', calendarId)

      if (!progressData) return

      // Process Solves
      const solves: SolveDeltaEntry[] = []
      progressData.forEach((p) => {
        if (p.opened_at && p.solved_at) {
          const user = usersMap.get(p.user_id)
          const start = new Date(p.opened_at).getTime()
          const end = new Date(p.solved_at).getTime()
          const diffMs = Math.max(0, end - start)
          const diffSec = Math.floor(diffMs / 1000)

          const minutes = Math.floor(diffSec / 60)
          const seconds = diffSec % 60
          const formatted =
            minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`

          const dayInfo = rMap.get(p.day_number)
          let userScore = (p as any).score ?? null
          if (userScore === null && typeof window !== 'undefined') {
            const cached = localStorage.getItem(
              `advent_score_${calendarId}_${p.day_number}_${p.user_id}`
            )
            if (cached !== null) {
              userScore = parseInt(cached, 10)
            }
          }

          solves.push({
            userName: user?.name || 'Follet anònim',
            avatarColor: user?.avatar_color || '#b91c1c',
            dayNumber: p.day_number,
            deltaSeconds: diffSec,
            formattedTime: formatted,
            score: userScore,
            totalPhotos:
              dayInfo?.totalPhotos ||
              (userScore !== null ? Math.max(userScore, 1) : 1),
            solvedAt: p.solved_at,
            challengeType: dayInfo?.challengeType || 'riddle',
          })
        }
      })

      setFastestSolves(solves)

      // Process First Opens per Day
      const firstsMap = new Map<number, FirstOpenEntry>()
      progressData.forEach((p) => {
        if (p.opened_at) {
          const user = usersMap.get(p.user_id)
          const current = firstsMap.get(p.day_number)
          if (
            !current ||
            new Date(p.opened_at).getTime() <
              new Date(current.openedAt).getTime()
          ) {
            firstsMap.set(p.day_number, {
              userName: user?.name || 'Follet anònim',
              avatarColor: user?.avatar_color || '#b91c1c',
              dayNumber: p.day_number,
              openedAt: p.opened_at,
            })
          }
        }
      })

      const firsts = Array.from(firstsMap.values()).sort(
        (a, b) => a.dayNumber - b.dayNumber
      )
      setFirstOpens(firsts)
    } catch (err) {
      console.error('Error carregant la classificació:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      setDayFilter(getDefaultDay())
      fetchLeaderboards()
    }
  }, [isOpen, calendarId])

  const selectedDayInfo =
    typeof dayFilter === 'number' ? riddlesMap.get(dayFilter) : null
  const isPhotoVotingDay = selectedDayInfo?.challengeType === 'photo_voting'
  const isSnowglobesDay = selectedDayInfo?.challengeType === 'snowglobes'
  const isScoreRankedDay = isPhotoVotingDay || isSnowglobesDay

  const filteredSolves = useMemo(() => {
    const list =
      dayFilter === 'all'
        ? [...fastestSolves]
        : fastestSolves.filter((s) => s.dayNumber === dayFilter)

    if (isScoreRankedDay) {
      // Per als jocs amb puntuació (nadó o barreja de boles):
      // 1. Millors puntuacions (més punts/encerts primer)
      // 2. En cas d'empat, qui hagi respost abans (solvedAt més antic)
      // 3. Temps de resolució més ràpid si fos idèntic
      return list.sort((a, b) => {
        const scoreA = a.score ?? 0
        const scoreB = b.score ?? 0
        if (scoreB !== scoreA) {
          return scoreB - scoreA
        }
        const timeA = new Date(a.solvedAt).getTime()
        const timeB = new Date(b.solvedAt).getTime()
        if (timeA !== timeB) {
          return timeA - timeB
        }
        return a.deltaSeconds - b.deltaSeconds
      })
    }

    // Per a altres dies: ordenats per qui ha trigat menys temps
    return list.sort((a, b) => a.deltaSeconds - b.deltaSeconds)
  }, [fastestSolves, dayFilter, isScoreRankedDay])

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-3 sm:bottom-6 sm:left-6 z-40 flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#e5ded4] bg-white/95 px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold text-[#0f4437] shadow-sm hover:shadow-md hover:bg-white active:scale-95 transition backdrop-blur"
      >
        <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0f4437]" />
        <span>Classificació</span>
      </button>

      {/* Modal / Slide-up panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a2c22]/65 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden rounded-3xl border border-[#e8dfd3] bg-[#fdfbf7] text-[#2c2825] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#e8dfd3] bg-[#f5ede3]/60">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#0f4437]/10 text-[#0f4437]">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0f4437]">
                    Classificació del Poble
                  </h3>
                  <p className="text-xs text-[#7e7368]">
                    Marcador nadalenc de la família
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-[#f4ede3] p-1.5 text-[#6e6358] hover:bg-[#eae0d2] hover:text-[#2c2825] transition"
                aria-label="Tancar finestra"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#e8dfd3] bg-white px-4 pt-2">
              <button
                onClick={() => setActiveTab('solvers')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                  activeTab === 'solvers'
                    ? 'border-[#0f4437] text-[#0f4437]'
                    : 'border-transparent text-[#7e7368] hover:text-[#2c2825]'
                }`}
              >
                {isPhotoVotingDay ? (
                  <>
                    <Award className="w-4 h-4 text-[#c89332]" />
                    Rànquing de puntuació
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Més ràpids resolent
                  </>
                )}
              </button>
              <button
                onClick={() => setActiveTab('openers')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                  activeTab === 'openers'
                    ? 'border-[#0f4437] text-[#0f4437]'
                    : 'border-transparent text-[#7e7368] hover:text-[#2c2825]'
                }`}
              >
                <Clock className="w-4 h-4" />
                Primers a obrir la porta
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {loading ? (
                <div className="py-12 text-center text-sm text-[#7e7368]">
                  <span className="inline-block animate-spin mr-2">❄️</span>
                  Consultant els arxius del poble...
                </div>
              ) : activeTab === 'solvers' ? (
                <>
                  {/* Day filter selector */}
                  <div className="flex items-center justify-between text-xs pb-1">
                    <span className="text-[#6e6358] font-semibold">
                      Filtrar per dia:
                    </span>
                    <select
                      value={dayFilter}
                      onChange={(e) =>
                        setDayFilter(
                          e.target.value === 'all'
                            ? 'all'
                            : Number(e.target.value)
                        )
                      }
                      className="rounded-lg border border-[#d8cdbf] bg-white px-3 py-1.5 text-[#2c2825] text-xs focus:border-[#0f4437] focus:outline-none"
                    >
                      <option value="all">Tots els dies combinats</option>
                      {Array.from({ length: 24 }, (_, i) => i + 1).map((d) => {
                        const now = new Date()
                        const isToday =
                          now.getMonth() === 11 && now.getDate() === d
                        return (
                          <option key={d} value={d}>
                            Dia {d} {isToday ? '(Avui ⭐)' : ''}
                          </option>
                        )
                      })}
                    </select>
                  </div>

                  {filteredSolves.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#8c8277]">
                      Encara no hi ha endevinalles resoltes en aquesta vista!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredSolves.map((item, idx) => {
                        const isScoreItem =
                          item.challengeType === 'photo_voting' ||
                          item.challengeType === 'snowglobes' ||
                          isScoreRankedDay

                        return (
                          <div
                            key={`${item.userName}-${item.dayNumber}-${idx}`}
                            className="flex items-center justify-between rounded-xl border border-[#e8dfd3] bg-white p-3 hover:bg-[#faf6f2] transition shadow-xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                                  idx === 0
                                    ? 'bg-[#c89332] text-white shadow-xs'
                                    : idx === 1
                                    ? 'bg-slate-300 text-slate-800'
                                    : idx === 2
                                    ? 'bg-amber-700 text-white'
                                    : 'text-[#8c8277] bg-[#f4ede3]'
                                }`}
                              >
                                {idx + 1}
                              </span>
                              <span className="text-sm font-semibold text-[#2c2825] truncate">
                                {item.userName}
                              </span>
                            </div>

                            {isScoreItem ? (
                              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0f4437] shrink-0">
                                <Award className="w-3.5 h-3.5 text-[#c89332]" />
                                <span>
                                  {item.challengeType === 'snowglobes'
                                    ? item.score !== null && item.score !== undefined
                                      ? `${item.score} pts`
                                      : 'Completat'
                                    : item.score !== null && item.score !== undefined
                                    ? `${item.score}/${
                                        item.totalPhotos || item.score
                                      } ${
                                        item.score === 1
                                          ? 'encert'
                                          : 'encerts'
                                      }`
                                    : 'Completat'}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#0f4437] shrink-0">
                                <Zap className="w-3.5 h-3.5 text-[#248896]" />
                                <span>{item.formattedTime}</span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-xs text-[#7e7368] mb-2">
                    En honor als follets més matiners que han obert cada porta primer!
                  </p>
                  {firstOpens.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#8c8277]">
                      Encara no s'ha obert cap porta!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {firstOpens.map((item) => (
                        <div
                          key={item.dayNumber}
                          className="flex items-center justify-between rounded-xl border border-[#e8dfd3] bg-white p-3 hover:bg-[#faf6f2] transition shadow-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#b91c1c] text-xs font-bold text-white shadow-xs">
                              {item.dayNumber}
                            </span>
                            <span className="text-sm font-semibold text-[#2c2825] truncate">
                              {item.userName}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-semibold text-[#0f4437]">
                              {new Date(item.openedAt).toLocaleTimeString('ca-ES', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            <p className="text-[10px] text-[#8c8277]">
                              {new Date(item.openedAt).toLocaleDateString('ca-ES', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 text-center border-t border-[#e8dfd3] bg-[#f5ede3]/40">
              <button
                onClick={fetchLeaderboards}
                className="text-xs font-semibold text-[#0f4437] hover:text-[#185e4d] transition"
              >
                ↻ Actualitzar classificació
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
