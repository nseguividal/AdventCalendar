'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types/database'
import { Sparkles, UserPlus, LogIn } from 'lucide-react'

const CHRISTMAS_AVATARS = [
  '#b91c1c', // Christmas Red
  '#0f4437', // Forest Pine
  '#248896', // Nordic Teal
  '#c89332', // Warm Gold
  '#8b1a1a', // Deep Cranberry
  '#1b7b8a', // Arctic Cyan
  '#d97706', // Amber
]

interface UserOnboardingProps {
  calendarId: string
  calendarTitle: string
  onUserSelected: (user: User) => void
}

export function UserOnboarding({
  calendarId,
  calendarTitle,
  onUserSelected,
}: UserOnboardingProps) {
  const [mode, setMode] = useState<'create' | 'select'>('create')
  const [name, setName] = useState('')
  const [existingUsers, setExistingUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch existing users for this calendar
  useEffect(() => {
    async function loadExistingUsers() {
      setIsLoadingUsers(true)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('calendar_id', calendarId)
        .order('name', { ascending: true })

      if (!error && data) {
        setExistingUsers(data)
        if (data.length > 0) {
          setSelectedUserId(data[0].id)
        }
      }
      setIsLoadingUsers(false)
    }

    loadExistingUsers()
  }, [calendarId])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Si us plau, introdueix el teu nom.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const existing = existingUsers.find(
        (u) => u.name.toLowerCase() === trimmed.toLowerCase()
      )

      if (existing) {
        onUserSelected(existing)
        return
      }

      const randomColor =
        CHRISTMAS_AVATARS[Math.floor(Math.random() * CHRISTMAS_AVATARS.length)]

      const { data, error: insertError } = await supabase
        .from('users')
        .insert({
          name: trimmed,
          calendar_id: calendarId,
          avatar_color: randomColor,
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      if (data) {
        onUserSelected(data)
      }
    } catch (err: unknown) {
      console.error('Error creant usuari:', err)
      setError('No s\'ha pogut registrar el nom. Torna-ho a provar.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectExisting = (e: React.FormEvent) => {
    e.preventDefault()
    const found = existingUsers.find((u) => u.id === selectedUserId)
    if (found) {
      onUserSelected(found)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a2c22]/65 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#e8dfd3] bg-[#fdfbf7] p-7 text-[#2c2825] shadow-2xl">
        {/* Corner Ribbon */}
        <div className="absolute -right-12 -top-12 h-24 w-24 rotate-45 bg-[#b91c1c] shadow-sm flex items-end justify-center pb-1">
          <span className="text-[10px] font-bold tracking-widest text-[#faf6f2]">NADAL</span>
        </div>

        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0f4437]/10 text-3xl mb-2">
            🎄
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0f4437]">
            {calendarTitle}
          </h2>
          <p className="text-xs text-[#6e6358] max-w-xs mx-auto leading-relaxed">
            Benvingut al calendari d'advent de la família! Qui s'hi uneix avui?
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {mode === 'create' ? (
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6358] mb-1.5">
                El teu nom o sobrenom
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="p. ex. Àvia Maria, Pau..."
                maxLength={30}
                required
                className="w-full rounded-xl border border-[#d8cdbf] bg-white px-4 py-3 text-sm text-[#2c2825] placeholder-[#9c9184] focus:border-[#0f4437] focus:outline-none focus:ring-2 focus:ring-[#0f4437]/15 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#b91c1c] hover:bg-[#a11818] py-3.5 font-bold text-white shadow-md active:scale-[0.98] transition disabled:opacity-50 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              {isSubmitting ? 'Entrant al calendari...' : 'Comença a explorar'}
            </button>

            {existingUsers.length > 0 && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setMode('select')}
                  className="text-xs text-[#0f4437] hover:text-[#175d4b] font-medium underline underline-offset-4 transition inline-flex items-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Ja t'has registrat? Tria el teu nom aquí
                </button>
              </div>
            )}
          </form>
        ) : (
          <form onSubmit={handleSelectExisting} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6358] mb-1.5">
                Tria el teu nom
              </label>
              {isLoadingUsers ? (
                <div className="text-center py-4 text-xs text-[#7e7368]">
                  Carregant participants...
                </div>
              ) : (
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full rounded-xl border border-[#d8cdbf] bg-white px-4 py-3 text-sm text-[#2c2825] focus:border-[#0f4437] focus:outline-none"
                >
                  {existingUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              type="submit"
              disabled={!selectedUserId}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0f4437] hover:bg-[#145647] py-3.5 font-bold text-white shadow-md active:scale-[0.98] transition text-sm disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              Continuar com a aquest jugador
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setMode('create')}
                className="text-xs text-[#0f4437] hover:text-[#175d4b] font-medium underline underline-offset-4 transition inline-flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Registrar un nom nou
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
