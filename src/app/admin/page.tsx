'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Comprova si ja té una sessió activa de forma asíncrona sense bloquejar el formulari
  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      try {
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) =>
          setTimeout(() => resolve({ data: { session: null } }), 800)
        )

        const result = await Promise.race([sessionPromise, timeoutPromise])
        const session = result?.data?.session

        if (session && isMounted) {
          setIsRedirecting(true)
          router.replace('/admin/dashboard')
        }
      } catch (err) {
        console.warn('Avís verificant sessió admin:', err)
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [router])

  const formatEmail = (raw: string) => {
    const trimmed = raw.trim().toLowerCase()
    return trimmed.includes('@') ? trimmed : `${trimmed}@advent.local`
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const email = formatEmail(username)

    try {
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      })
      const timeoutPromise = new Promise<{ error: { message: string } }>((resolve) =>
        setTimeout(
          () =>
            resolve({
              error: {
                message:
                  'El servidor ha trigat massa a respondre. Comprova la connexió a internet.',
              },
            }),
          8000
        )
      )

      const { error: authError } = (await Promise.race([
        loginPromise,
        timeoutPromise,
      ])) as any

      if (authError) {
        setError(
          authError.message === 'Invalid login credentials'
            ? 'Nom d\'usuari o contrasenya incorrectes. Comprova les credencials creades al teu panell de Supabase.'
            : authError.message
        )
        setSubmitting(false)
        return
      }

      router.replace('/admin/dashboard')
    } catch {
      setError('S\'ha produït un error inesperat. Torna-ho a provar.')
      setSubmitting(false)
    }
  }

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf6f2]">
        <div className="text-[#0f4437] text-xl font-medium animate-pulse">🎄 Entrant al panell...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf6f2] px-4 text-[#2c2825]">
      {/* Decorative snowflakes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-[10%] text-[#0f4437]/15 text-4xl animate-bounce" style={{ animationDelay: '0s' }}>❄</div>
        <div className="absolute top-20 right-[20%] text-[#0f4437]/10 text-3xl animate-bounce" style={{ animationDelay: '1s' }}>❄</div>
        <div className="absolute top-40 left-[30%] text-[#0f4437]/10 text-5xl animate-bounce" style={{ animationDelay: '2s' }}>❄</div>
        <div className="absolute top-16 right-[40%] text-[#0f4437]/15 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>✦</div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Login Card */}
        <div className="bg-[#fdfbf7] rounded-3xl shadow-lg border border-[#e8dfd3] p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🎄</div>
            <h1 className="text-2xl font-bold text-[#0f4437]">Calendari d'Advent</h1>
            <p className="text-[#6e6358] mt-1 text-xs">Panell d'Administració</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-xs leading-relaxed">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-[#6e6358] text-xs font-semibold uppercase tracking-wider mb-1.5">
                Nom d'usuari
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="p. ex. usuari"
                className="w-full px-4 py-2.5 bg-white border border-[#d8cdbf] rounded-xl text-[#2c2825] placeholder-[#9c9184] focus:outline-none focus:ring-2 focus:ring-[#0f4437]/15 focus:border-[#0f4437] transition text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[#6e6358] text-xs font-semibold uppercase tracking-wider mb-1.5">
                Contrasenya
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-white border border-[#d8cdbf] rounded-xl text-[#2c2825] placeholder-[#9c9184] focus:outline-none focus:ring-2 focus:ring-[#0f4437]/15 focus:border-[#0f4437] transition text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#b91c1c] hover:bg-[#a11818] text-white font-bold rounded-xl shadow-md transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">❄️</span> Iniciant sessió...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>

        {/* Footer decoration */}
        <p className="text-center text-[#8c8277] text-xs mt-6">
          🎅 Bon Nadal i bona gestió!
        </p>
      </div>
    </div>
  )
}
