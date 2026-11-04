'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface AdminProgressViewProps {
  calendarId: string
}

interface UserWithProgress {
  id: string
  name: string
  avatar_color: string
  days: Record<number, 'opened' | 'solved'>
  solvedCount: number
}

export default function AdminProgressView({ calendarId }: AdminProgressViewProps) {
  const [users, setUsers] = useState<UserWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProgress = async () => {
      setError(null)

      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('calendar_id', calendarId)
        .order('created_at', { ascending: true })

      if (usersError) {
        setError(usersError.message)
        setLoading(false)
        return
      }

      if (!usersData || usersData.length === 0) {
        setUsers([])
        setLoading(false)
        return
      }

      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('calendar_id', calendarId)

      if (progressError) {
        setError(progressError.message)
        setLoading(false)
        return
      }

      const userMap: Record<string, UserWithProgress> = {}
      usersData.forEach((u) => {
        userMap[u.id] = {
          id: u.id,
          name: u.name,
          avatar_color: u.avatar_color || '#b91c1c',
          days: {},
          solvedCount: 0,
        }
      })

      progressData?.forEach((p) => {
        if (userMap[p.user_id]) {
          const status = p.solved_at ? 'solved' : 'opened'
          userMap[p.user_id].days[p.day_number] = status
          if (status === 'solved') {
            userMap[p.user_id].solvedCount += 1
          }
        }
      })

      const sortedUsers = Object.values(userMap).sort(
        (a, b) => b.solvedCount - a.solvedCount
      )

      setUsers(sortedUsers)
      setLoading(false)
    }

    fetchProgress()
  }, [calendarId])

  if (loading) {
    return (
      <div className="text-center py-6 text-xs text-[#7e7368]">
        <span className="animate-spin inline-block mr-1.5">❄️</span> Carregant progrés dels participants...
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg">
        {error}
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-[#8c8277]">
        Encara no s'ha unit cap membre de la família a aquest calendari.
      </div>
    )
  }

  const days = Array.from({ length: 24 }, (_, i) => i + 1)

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-[#6e6358]">
        <span className="font-semibold text-[#0f4437]">Llegenda:</span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-4 rounded bg-[#ede4d8] text-[10px] text-center leading-4 text-[#8c8277]">
            —
          </span>
          Sense obrir
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-4 rounded bg-amber-100 text-amber-800 text-[10px] text-center leading-4">
            🔓
          </span>
          Obert (sense resoldre)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-4 rounded bg-[#0f4437]/15 text-[#0f4437] text-[10px] text-center leading-4">
            ✅
          </span>
          Resolt
        </span>
      </div>

      {/* Responsive table */}
      <div className="overflow-x-auto rounded-xl border border-[#e8dfd3]">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#f5ede3] text-[#0f4437] uppercase text-[10px] tracking-wider border-b border-[#e8dfd3]">
            <tr>
              <th className="py-2.5 px-3 sticky left-0 bg-[#f5ede3] z-10 min-w-[130px]">
                Usuari
              </th>
              {days.map((d) => (
                <th key={d} className="py-2.5 px-1.5 text-center min-w-[32px]">
                  {d}
                </th>
              ))}
              <th className="py-2.5 px-3 text-center min-w-[70px]">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8dfd3]">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[#faf6f2] transition-colors">
                <td className="py-2 px-3 font-semibold text-[#2c2825] sticky left-0 bg-white z-10 flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: u.avatar_color }}
                  />
                  <span className="truncate max-w-[100px]">{u.name}</span>
                </td>
                {days.map((d) => {
                  const status = u.days[d]
                  return (
                    <td key={d} className="py-2 px-1 text-center">
                      {status === 'solved' ? (
                        <span
                          className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#0f4437]/15 text-[#0f4437] text-[11px]"
                          title={`Dia ${d}: Resolt`}
                        >
                          ✅
                        </span>
                      ) : status === 'opened' ? (
                        <span
                          className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-100 text-amber-800 text-[11px]"
                          title={`Dia ${d}: Obert`}
                        >
                          🔓
                        </span>
                      ) : (
                        <span
                          className="inline-block w-6 h-6 rounded bg-[#f5ede3]/60 text-[#8c8277] text-[10px] leading-6"
                          title={`Dia ${d}: No obert`}
                        >
                          —
                        </span>
                      )}
                    </td>
                  )
                })}
                <td className="py-2 px-3 text-center font-bold text-[#0f4437]">
                  {u.solvedCount}/24
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
