'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY_ID = 'advent_user_id'
const STORAGE_KEY_NAME = 'advent_user_name'
const STORAGE_KEY_CALENDAR = 'advent_calendar_id'

interface UserState {
  id: string
  name: string
  calendarId: string
}

interface UseUserReturn {
  user: UserState | null
  setUser: (id: string, name: string, calendarId: string) => void
  clearUser: () => void
  isLoading: boolean
}

/**
 * Hook for managing the current user identity via localStorage.
 * Persists user id, name, and calendarId across page reloads.
 */
export function useUser(): UseUserReturn {
  const [user, setUserState] = useState<UserState | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const id = localStorage.getItem(STORAGE_KEY_ID)
      const name = localStorage.getItem(STORAGE_KEY_NAME)
      const calendarId = localStorage.getItem(STORAGE_KEY_CALENDAR)

      if (id && name && calendarId) {
        setUserState({ id, name, calendarId })
      }
    } catch {
      // localStorage may be unavailable (e.g. SSR or privacy mode)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const setUser = useCallback((id: string, name: string, calendarId: string) => {
    try {
      localStorage.setItem(STORAGE_KEY_ID, id)
      localStorage.setItem(STORAGE_KEY_NAME, name)
      localStorage.setItem(STORAGE_KEY_CALENDAR, calendarId)
    } catch {
      // Silently fail if localStorage is unavailable
    }
    setUserState({ id, name, calendarId })
  }, [])

  const clearUser = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY_ID)
      localStorage.removeItem(STORAGE_KEY_NAME)
      localStorage.removeItem(STORAGE_KEY_CALENDAR)
    } catch {
      // Silently fail if localStorage is unavailable
    }
    setUserState(null)
  }, [])

  return { user, setUser, clearUser, isLoading }
}
