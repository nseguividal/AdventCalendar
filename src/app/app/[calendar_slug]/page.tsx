'use client'

import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'
import { useProgress } from '@/hooks/useProgress'
import type { Calendar, User } from '@/types/database'
import { CalendarGrid } from '@/components/CalendarGrid'
import { UserOnboarding } from '@/components/UserOnboarding'
import { ChallengeModal } from '@/components/ChallengeModal'
import { PuzzleReveal } from '@/components/PuzzleReveal'
import { Leaderboard } from '@/components/Leaderboard'
import { Snowfall } from '@/components/Snowfall'
import { Users, ChevronDown, LogOut } from 'lucide-react'

export default function CalendarPage({
  params,
}: {
  params: Promise<{ calendar_slug: string }>
}) {
  const resolvedParams = use(params)
  const slug = resolvedParams.calendar_slug

  const [calendar, setCalendar] = useState<Calendar | null>(null)
  const [loadingCalendar, setLoadingCalendar] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // User identity hook
  const { user, setUser, clearUser, isLoading: loadingUser } = useUser()

  // User switch menu
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false)

  // Active Riddle Modal
  const [activeDay, setActiveDay] = useState<number | null>(null)

  // Puzzle Modal state & animation trigger
  const [isPuzzleOpen, setIsPuzzleOpen] = useState(false)
  const [highlightPuzzleDay, setHighlightPuzzleDay] = useState<number | null>(null)

  const handleOpenPuzzleFromRiddle = (dayNumber: number) => {
    setActiveDay(null)
    setHighlightPuzzleDay(dayNumber)
    setIsPuzzleOpen(true)
  }

  // Progress hook (only executes query when calendar.id is resolved)
  const { progress, recordOpen, recordSolve } = useProgress(
    user?.id || null,
    calendar?.id || ''
  )

  // 1. Fetch calendar by slug
  useEffect(() => {
    async function fetchCalendar() {
      setLoadingCalendar(true)
      try {
        const { data, error: fetchErr } = await supabase
          .from('calendars')
          .select('*')
          .eq('slug', slug)
          .single()

        if (fetchErr || !data) {
          setError(
            `No s'ha trobat el poble "${slug}". Revisa l'adreça URL o demana a l'administrador de la família que el creï.`
          )
          return
        }

        setCalendar(data)
      } catch {
        setError('S\'ha produït un error en carregar el calendari.')
      } finally {
        setLoadingCalendar(false)
      }
    }

    if (slug) {
      fetchCalendar()
    }
  }, [slug])

  // 2. Fetch all users for this calendar
  useEffect(() => {
    if (!calendar?.id) return

    async function loadCalendarUsers() {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('calendar_id', calendar!.id)
        .order('name', { ascending: true })

      if (data) {
        setAllUsers(data)
      }
    }

    loadCalendarUsers()
  }, [calendar?.id])

  const handleUserSelected = (selectedUser: User) => {
    if (!calendar) return
    setUser(selectedUser.id, selectedUser.name, calendar.id)
  }

  const handleDayClick = (dayNumber: number) => {
    if (!user || !calendar) return
    recordOpen(dayNumber)
    setActiveDay(dayNumber)
  }

  const handleRiddleSolved = (dayNumber: number, score?: number) => {
    recordSolve(dayNumber, score)
  }

  const solvedDays = progress
    .filter((p) => p.solved_at !== null)
    .map((p) => p.day_number)

  if (loadingCalendar || loadingUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#1B4332] text-white">
        <div className="text-4xl animate-bounce mb-3">🎄</div>
        <p className="text-sm font-semibold tracking-wide text-[#FFD700]">
          Carregant el màgic poble de Nadal...
        </p>
      </div>
    )
  }

  if (error || !calendar) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1B4332] p-4 text-white">
        <div className="max-w-md rounded-3xl border border-[#D4A843]/40 bg-[#122e23] p-8 text-center shadow-2xl">
          <span className="text-4xl mb-4 inline-block">❄️</span>
          <h2 className="text-xl font-bold text-[#FFD700] mb-2">Poble no trobat</h2>
          <p className="text-xs text-white/70 mb-6">{error}</p>
          <a
            href="/admin"
            className="inline-block rounded-xl bg-gradient-to-r from-[#C41E3A] to-[#8B1A1A] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:brightness-110 transition"
          >
            Ves al Panell d'Administració
          </a>
        </div>
      </div>
    )
  }

  const isUserMatchingCalendar = user && user.calendarId === calendar.id
  if (!isUserMatchingCalendar) {
    return (
      <UserOnboarding
        calendarId={calendar.id}
        calendarTitle={calendar.title}
        onUserSelected={handleUserSelected}
      />
    )
  }

  return (
    <main className="relative min-h-screen w-full bg-[#faf6f2] text-[#2b2b2b]">
      {/* Falling Snowflakes Effect */}
      <Snowfall count={35} />

      {/* Top Floating Bar */}
      <header className="fixed top-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 sm:gap-3 rounded-full border border-[#e5ded4] bg-white/90 px-3.5 py-1.5 sm:px-4 sm:py-2 text-[#2b2b2b] shadow-sm backdrop-blur-md max-w-[92vw] sm:max-w-none">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="text-base sm:text-lg shrink-0">🎄</span>
          <h1 className="text-xs sm:text-sm font-bold text-[#2b2b2b] tracking-wide max-w-[110px] sm:max-w-[220px] truncate">
            {calendar.title}
          </h1>
        </div>

        <div className="h-3.5 w-px bg-[#e5ded4] shrink-0" />

        {/* User Identity Pill with Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
            className="flex items-center gap-1 sm:gap-1.5 rounded-full bg-[#f5ede3] px-2.5 py-1 text-xs font-medium text-[#4a3f35] hover:bg-[#ebdccf] transition"
          >
            <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#0f4437]" />
            <span className="max-w-[70px] sm:max-w-[100px] truncate">{user.name}</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {showSwitchDropdown && (
            <div className="absolute top-full right-0 mt-2 w-48 rounded-2xl border border-[#e8dfd3] bg-[#fdfbf7] p-2 text-xs shadow-xl z-50">
              <p className="px-3 py-1.5 font-bold uppercase tracking-wider text-[10px] text-[#8c8277]">
                Canviar de jugador:
              </p>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setUser(u.id, u.name, calendar.id)
                      setShowSwitchDropdown(false)
                    }}
                    className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                      u.id === user.id
                        ? 'bg-[#0f4437]/10 text-[#0f4437] font-bold'
                        : 'text-[#4a423a] hover:bg-[#f5ede3]'
                    }`}
                  >
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: u.avatar_color || '#b91c1c' }}
                    />
                    <span className="truncate">{u.name}</span>
                  </button>
                ))}
              </div>

              <div className="mt-2 border-t border-[#e8dfd3] pt-1.5">
                <button
                  onClick={() => {
                    clearUser()
                    setShowSwitchDropdown(false)
                  }}
                  className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-[#b91c1c] hover:bg-red-50 transition"
                >
                  <LogOut className="w-3 h-3" />
                  Sortir / Nou jugador
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main 24-Doors Bento Grid (Varied squares & rectangles) */}
      <CalendarGrid solvedDays={solvedDays} onDayClick={handleDayClick} />

      {/* Challenge Modal (Supports Riddles, WordSearch, etc.) */}
      {activeDay !== null && (
        <ChallengeModal
          isOpen={activeDay !== null}
          onClose={() => setActiveDay(null)}
          dayNumber={activeDay}
          calendarId={calendar.id}
          userId={user.id}
          isAlreadySolved={solvedDays.includes(activeDay)}
          onSolved={handleRiddleSolved}
          onOpenPuzzle={handleOpenPuzzleFromRiddle}
        />
      )}

      {/* Floating Family Puzzle Component */}
      <PuzzleReveal
        puzzleImageUrl={calendar.puzzle_image_url}
        solvedDays={solvedDays}
        isOpen={isPuzzleOpen}
        onOpen={() => setIsPuzzleOpen(true)}
        onClose={() => setIsPuzzleOpen(false)}
        highlightDay={highlightPuzzleDay}
        onHighlightComplete={() => setHighlightPuzzleDay(null)}
      />

      {/* Floating Leaderboard Component */}
      <Leaderboard calendarId={calendar.id} />
    </main>
  )
}
