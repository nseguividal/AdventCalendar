'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { UserProgress } from '@/types/database'

interface UseProgressReturn {
  progress: UserProgress[]
  isLoading: boolean
  recordOpen: (dayNumber: number) => Promise<void>
  recordSolve: (dayNumber: number, score?: number) => Promise<void>
}

/**
 * Hook for tracking a user's advent calendar progress.
 * Fetches existing progress and provides methods to record opens and solves.
 */
export function useProgress(
  userId: string | null,
  calendarId: string
): UseProgressReturn {
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchProgress = useCallback(async () => {
    if (!userId || !calendarId) {
      setProgress([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('calendar_id', calendarId)
        .order('day_number', { ascending: true })

      if (error) {
        console.error('Error en carregar el progrés:', error.message)
        return
      }

      setProgress(data ?? [])
    } finally {
      setIsLoading(false)
    }
  }, [userId, calendarId])

  // Fetch progress on mount and when dependencies change
  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  /**
   * Record that the user opened a specific day's door.
   * Creates a new user_progress row with opened_at set to now.
   */
  const recordOpen = useCallback(
    async (dayNumber: number) => {
      if (!userId) return

      // Skip if this day was already opened
      const existing = progress.find((p) => p.day_number === dayNumber)
      if (existing) return

      const { data, error } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          calendar_id: calendarId,
          day_number: dayNumber,
          opened_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to record open:', error.message)
        return
      }

      if (data) {
        setProgress((prev) => [...prev, data].sort((a, b) => a.day_number - b.day_number))
      }
    },
    [userId, calendarId, progress]
  )

  /**
   * Record that the user solved a specific day's riddle.
   * Updates the existing user_progress row to set solved_at to now.
   */
  const recordSolve = useCallback(
    async (dayNumber: number, score?: number) => {
      if (!userId) return

      const existing = progress.find((p) => p.day_number === dayNumber)
      if (!existing) {
        console.error('Cannot solve a day that has not been opened yet')
        return
      }

      if (existing.solved_at) return // Already solved

      const now = new Date().toISOString()
      const updateData: { solved_at: string; score?: number } = {
        solved_at: now,
      }
      if (typeof score === 'number') {
        updateData.score = score
      }

      // Save to localStorage as immediate cache and client fallback
      if (typeof window !== 'undefined' && typeof score === 'number') {
        try {
          localStorage.setItem(`advent_score_${calendarId}_${dayNumber}_${userId}`, String(score))
        } catch {
          // ignore
        }
      }

      let { data, error } = await supabase
        .from('user_progress')
        .update(updateData as any)
        .eq('id', existing.id)
        .select()
        .single()

      // Graceful fallback if the remote Supabase database does not have the 'score' column yet
      if (error && typeof score === 'number') {
        console.warn('Could not update score in user_progress (column might not exist yet), falling back to solved_at only:', error.message)
        const fallback = await supabase
          .from('user_progress')
          .update({ solved_at: now })
          .eq('id', existing.id)
          .select()
          .single()
        data = fallback.data
        error = fallback.error
      }

      if (error) {
        console.error('Failed to record solve:', error.message)
        return
      }

      if (data) {
        setProgress((prev) =>
          prev.map((p) =>
            p.id === data.id
              ? { ...p, ...data, ...(typeof score === 'number' ? { score } : {}) }
              : p
          )
        )
      }
    },
    [userId, calendarId, progress]
  )

  return { progress, isLoading, recordOpen, recordSolve }
}
