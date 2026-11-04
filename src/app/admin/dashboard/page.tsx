'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { deleteCalendarStorageFolder } from '@/lib/storage'
import AdminProgressView from '@/components/AdminProgressView'

interface CalendarWithCounts {
  id: string
  slug: string
  title: string
  created_at: string | null
  userCount: number
  riddleCount: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [calendars, setCalendars] = useState<CalendarWithCounts[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // New calendar form state
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)

  // Expanded progress panels
  const [expandedCalendar, setExpandedCalendar] = useState<string | null>(null)

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const slugify = (text: string): string =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')

  const fetchCalendars = useCallback(async () => {
    setError(null)

    try {
      const fetchPromise = (async () => {
        const { data: cals, error: calError } = await supabase
          .from('calendars')
          .select('*')
          .order('created_at', { ascending: false })

        if (calError) {
          setError(calError.message)
          return
        }

        if (!cals || cals.length === 0) {
          setCalendars([])
          return
        }

        const { data: users } = await supabase
          .from('users')
          .select('calendar_id')

        const { data: riddles } = await supabase
          .from('calendar_riddles')
          .select('calendar_id')

        const userCountMap: Record<string, number> = {}
        users?.forEach((u) => {
          userCountMap[u.calendar_id] = (userCountMap[u.calendar_id] || 0) + 1
        })

        const riddleCountMap: Record<string, number> = {}
        riddles?.forEach((r) => {
          riddleCountMap[r.calendar_id] = (riddleCountMap[r.calendar_id] || 0) + 1
        })

        const enriched: CalendarWithCounts[] = cals.map((c) => ({
          ...c,
          userCount: userCountMap[c.id] || 0,
          riddleCount: riddleCountMap[c.id] || 0,
        }))

        setCalendars(enriched)
      })()

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error('Temps d\'espera esgotat carregant dades de Supabase.')
            ),
          7000
        )
      )

      await Promise.race([fetchPromise, timeoutPromise])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperat carregant els calendaris'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCalendars()
  }, [fetchCalendars])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedTitle = newTitle.trim()
    if (!trimmedTitle) return

    setCreating(true)
    setError(null)

    const slug = slugify(trimmedTitle)
    if (!slug) {
      setError('El títol no genera un enllaç vàlid. Fes servir lletres o números.')
      setCreating(false)
      return
    }

    const { error: insertError } = await supabase.from('calendars').insert({
      title: trimmedTitle,
      slug,
    })

    if (insertError) {
      setError(
        insertError.code === '23505'
          ? 'Ja existeix un calendari amb aquest enllaç. Prova un altre títol.'
          : insertError.message
      )
      setCreating(false)
      return
    }

    setNewTitle('')
    setShowForm(false)
    setCreating(false)
    fetchCalendars()
  }

  const handleDelete = async (id: string) => {
    setError(null)

    // Netejar fitxers d'imatges del calendari a Supabase Storage per no deixar fitxers orfes
    await deleteCalendarStorageFolder(id)

    const { error: deleteError } = await supabase
      .from('calendars')
      .delete()
      .eq('id', id)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    setDeletingId(null)
    if (expandedCalendar === id) setExpandedCalendar(null)
    fetchCalendars()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/admin')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-[#0f4437]">
        <div className="text-lg font-medium animate-pulse">🎄 Carregant calendaris...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0f4437]">Calendaris familiars</h2>
          <p className="text-[#6e6358] text-sm mt-0.5">
            Gestiona els calendaris d'advent i el progrés de cada família
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-[#0f4437] hover:bg-[#145647] text-white font-medium text-sm rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            {showForm ? '✕ Cancel·lar' : '+ Nou Calendari'}
          </button>
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 bg-white hover:bg-[#f5ede3] text-[#6e6358] hover:text-[#2c2825] text-sm rounded-xl transition border border-[#e8dfd3]"
          >
            Tancar sessió
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="bg-[#fdfbf7] border border-[#e8dfd3] rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#0f4437] mb-3">Crear nou calendari</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="calendar-title" className="block text-[#6e6358] text-xs font-semibold uppercase tracking-wider mb-1.5">
                Títol del calendari
              </label>
              <input
                id="calendar-title"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="p. ex. Família Garcia Nadal"
                required
                className="w-full max-w-md px-4 py-2.5 bg-white border border-[#d8cdbf] rounded-xl text-[#2c2825] placeholder-[#9c9184] text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4437]/15 focus:border-[#0f4437]"
              />
              {newTitle.trim() && (
                <p className="text-xs text-[#7e7368] mt-1.5">
                  Enllaç generat: <code className="text-[#0f4437] font-bold">/app/{slugify(newTitle)}</code>
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2.5 bg-[#b91c1c] hover:bg-[#a11818] text-white text-sm font-bold rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {creating ? 'Creant...' : 'Crear calendari'}
            </button>
          </form>
        </div>
      )}

      {/* Calendar list */}
      {calendars.length === 0 ? (
        <div className="text-center py-16 bg-[#fdfbf7] border border-[#e8dfd3] rounded-3xl">
          <div className="text-5xl mb-3">❄️</div>
          <p className="text-[#0f4437] font-bold text-lg">Encara no s'ha creat cap calendari.</p>
          <p className="text-[#7e7368] text-sm mt-1">Fes clic a "+ Nou Calendari" per començar!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {calendars.map((cal) => {
            const isExpanded = expandedCalendar === cal.id
            const isDeleting = deletingId === cal.id

            return (
              <div
                key={cal.id}
                className="bg-[#fdfbf7] border border-[#e8dfd3] rounded-2xl overflow-hidden shadow-xs hover:border-[#d8cdbf] transition"
              >
                {/* Main card row */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-[#0f4437] flex items-center gap-2">
                      <span>🎄</span> {cal.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#7e7368]">
                      <a
                        href={`/app/${cal.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#248896] hover:underline font-mono"
                      >
                        /app/{cal.slug} ↗
                      </a>
                      <span>•</span>
                      <span>👥 {cal.userCount} usuaris</span>
                      <span>•</span>
                      <span>🧩 {cal.riddleCount}/24 endevinalles</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() =>
                        setExpandedCalendar(isExpanded ? null : cal.id)
                      }
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition border ${
                        isExpanded
                          ? 'bg-[#0f4437] text-white border-[#0f4437]'
                          : 'bg-white hover:bg-[#f5ede3] text-[#2c2825] border-[#e8dfd3]'
                      }`}
                    >
                      {isExpanded ? 'Amagar progrés' : 'Veure progrés'}
                    </button>

                    <button
                      onClick={() => router.push(`/admin/calendar/${cal.id}`)}
                      className="px-3 py-1.5 text-xs font-medium bg-[#0f4437] hover:bg-[#145647] text-white rounded-lg transition"
                    >
                      Editar endevinalles
                    </button>

                    {isDeleting ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(cal.id)}
                          className="px-2.5 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-2.5 py-1 text-xs bg-white text-[#6e6358] border border-[#e8dfd3] rounded-lg transition"
                        >
                          Cancel·lar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(cal.id)}
                        className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Eliminar calendari"
                      >
                        🗑
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress View Panel */}
                {isExpanded && (
                  <div className="border-t border-[#e8dfd3] p-5 bg-white">
                    <AdminProgressView calendarId={cal.id} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
