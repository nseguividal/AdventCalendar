'use client'

import { useState, useRef } from 'react'
import type { ChallengePlayerProps } from '../types'
import type { PicaTioConfig } from './types'
import { Sparkles, Music } from 'lucide-react'

// Sintetitzador d'àudio per al cop sec de fusta del bastó
function playWoodKnockSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    // Cop de fusta descendent ràpid (pitch drop)
    osc.frequency.setValueAtTime(180, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.12)

    gain.gain.setValueAtTime(0.7, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.13)
  } catch {}
}

export function PicaTioPlayer({
  config,
  isAlreadySolved,
  onSuccess,
}: ChallengePlayerProps<PicaTioConfig>) {
  const hitsRequired = config.hitsRequired ?? 20
  const prizeName = config.prizeName || 'Torrons, neules i xocolata!'
  const verse =
    config.verse ||
    'Caga tió, tió de Nadal, no caguis arengades que són massa salades, caga torrons que són més bons!'

  const [hits, setHits] = useState(isAlreadySolved ? hitsRequired : 0)
  const [isWon, setIsWon] = useState(isAlreadySolved)
  const [isHitting, setIsHitting] = useState(false)
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; text: string }[]>([])

  const particleId = useRef(1)

  const handleStickHit = () => {
    if (isWon) return

    playWoodKnockSound()
    setIsHitting(true)
    setTimeout(() => setIsHitting(false), 120)

    // Partícules de cop
    const pText = ['💥', '✨', '🪵', '⭐'][Math.floor(Math.random() * 4)]
    const newP = {
      id: particleId.current++,
      x: 40 + Math.random() * 20,
      y: 45 + Math.random() * 15,
      text: pText,
    }
    setParticles((prev) => [...prev, newP])
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newP.id))
    }, 500)

    setHits((prev) => {
      const next = prev + 1
      if (next >= hitsRequired) {
        setIsWon(true)
        onSuccess()
      }
      return next
    })
  }

  const progressPercent = Math.min(100, Math.round((hits / hitsRequired) * 100))

  return (
    <div className="space-y-3.5 max-w-sm mx-auto select-none">
      {/* Títol */}
      <div className="text-center">
        <h4 className="text-sm font-bold text-[#0f4437]">
          {config.title || 'Pica fort el Tió de Nadal!'}
        </h4>
        <p className="text-[11px] text-[#7e7368] mt-0.5">
          {isWon
            ? '🎉 El Tió ja ha cagat el regal!'
            : 'Fes clic o toca a la pantalla per picar-lo amb el bastó!'}
        </p>
      </div>

      {/* Lletra de la cançó */}
      <div className="rounded-xl bg-[#c89332]/10 border border-[#c89332]/25 px-3 py-2 text-center text-xs font-semibold text-[#854d0e] flex items-center justify-center gap-1.5">
        <Music className="w-3.5 h-3.5 shrink-0" />
        <span className="italic leading-tight">&ldquo;{verse}&rdquo;</span>
      </div>

      {/* Barra de progrés de cops */}
      <div>
        <div className="flex justify-between text-xs text-[#0f4437] font-bold mb-1">
          <span>Força del Tió</span>
          <span className="font-mono">
            {hits}/{hitsRequired} cops ({progressPercent}%)
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-[#ede4d8] overflow-hidden p-0.5 border border-[#d8cdbf]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#ca8a04] via-[#ea580c] to-[#b91c1c] transition-all duration-150"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Escena interactiva del Tió */}
      <div
        onClick={handleStickHit}
        className={`relative w-full h-56 rounded-2xl border-2 border-[#d8cdbf] bg-[#faf6f0] overflow-hidden flex items-center justify-center cursor-pointer shadow-inner transition-transform ${
          isHitting ? 'scale-[0.98]' : 'hover:scale-[1.01]'
        }`}
      >
        {/* Bastó de fusta animat */}
        <div
          className={`absolute top-4 right-12 z-20 text-4xl transition-transform duration-100 origin-bottom-right pointer-events-none ${
            isHitting ? 'rotate-[-35deg] translate-y-6 scale-110' : 'rotate-12'
          }`}
        >
          🦯
        </div>

        {/* Partícules flotants del cop */}
        {particles.map((p) => (
          <div
            key={p.id}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            className="absolute pointer-events-none text-xl animate-out fade-out zoom-out duration-500"
          >
            {p.text}
          </div>
        ))}

        {/* Dibuix complet del Tió de Nadal en SVG */}
        <div
          className={`relative w-64 h-40 transition-transform ${
            isHitting ? 'translate-y-1 rotate-1' : ''
          }`}
        >
          <svg viewBox="0 0 240 140" className="w-full h-full drop-shadow-md">
            {/* Potes de branques davanteres */}
            <line x1="60" y1="100" x2="45" y2="130" stroke="#5c3818" strokeWidth="8" strokeLinecap="round" />
            <line x1="100" y1="100" x2="115" y2="130" stroke="#5c3818" strokeWidth="8" strokeLinecap="round" />

            {/* Tronc principal (fusta fosca amb vetes) */}
            <rect x="50" y="55" width="150" height="52" rx="26" fill="#8b5226" stroke="#4a2810" strokeWidth="3" />
            {/* Vetes de la fusta */}
            <path d="M 90 70 Q 140 68 180 72" stroke="#6f3f1a" strokeWidth="3" fill="none" />
            <path d="M 85 88 Q 135 90 175 86" stroke="#6f3f1a" strokeWidth="3" fill="none" />

            {/* Manta nadalenca (cobreix el darrere del tronc) */}
            {isWon ? (
              // Manta aixecada revelant regals!
              <g>
                <path d="M 120 50 Q 160 20 200 45 L 205 80 L 120 70 Z" fill="#b91c1c" stroke="#fef08a" strokeWidth="2" />
                <rect x="155" y="65" width="28" height="24" rx="3" fill="#ffd700" />
                <text x="169" y="82" fontSize="14" textAnchor="middle">🍫</text>
                <text x="195" y="86" fontSize="16" textAnchor="middle">🎁</text>
                <text x="180" y="105" fontSize="14" textAnchor="middle">🍬</text>
              </g>
            ) : (
              // Manta tapant el tronc
              <g>
                <path d="M 110 52 Q 165 48 202 54 L 202 100 Q 165 106 110 100 Z" fill="#b91c1c" stroke="#d97706" strokeWidth="2" />
                {/* Estampat de quadres daurats */}
                <line x1="140" y1="52" x2="140" y2="102" stroke="#fef08a" strokeWidth="2" />
                <line x1="170" y1="52" x2="170" y2="102" stroke="#fef08a" strokeWidth="2" />
                <line x1="110" y1="76" x2="202" y2="76" stroke="#fef08a" strokeWidth="2" />
              </g>
            )}

            {/* Cara davantera del tronc (secció tallada rodona) */}
            <ellipse cx="60" cy="81" rx="22" ry="26" fill="#d4a373" stroke="#4a2810" strokeWidth="3" />
            <ellipse cx="60" cy="81" rx="16" ry="19" fill="#e6bc94" />

            {/* Ulls expressius */}
            <circle cx="53" cy="74" r="3.5" fill="#2c1810" />
            <circle cx="67" cy="74" r="3.5" fill="#2c1810" />
            <circle cx="54" cy="72" r="1.2" fill="#ffffff" />
            <circle cx="68" cy="72" r="1.2" fill="#ffffff" />

            {/* Nas rodonet vermell */}
            <circle cx="60" cy="82" r="4.5" fill="#dc2626" />

            {/* Gran somriure amable */}
            <path d="M 52 90 Q 60 99 68 90" stroke="#2c1810" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Galtes vermelloses */}
            <ellipse cx="49" cy="84" rx="3" ry="2" fill="#f87171" opacity="0.6" />
            <ellipse cx="71" cy="84" rx="3" ry="2" fill="#f87171" opacity="0.6" />

            {/* Barretina catalana vermella al cap */}
            <path d="M 44 60 C 44 40 76 35 76 60 Z" fill="#b91c1c" stroke="#4a2810" strokeWidth="2" />
            {/* Cinta negra de la barretina */}
            <path d="M 42 60 Q 60 64 78 60" stroke="#1f2937" strokeWidth="4" fill="none" />
            {/* Caiguda superior de la barretina */}
            <path d="M 60 38 Q 42 30 40 45" stroke="#b91c1c" strokeWidth="7" strokeLinecap="round" fill="none" />
          </svg>
        </div>

        {/* Text emergent quan es clica */}
        {!isWon && (
          <div className="absolute bottom-2 text-[11px] font-bold text-[#8b5226] bg-white/80 px-2.5 py-0.5 rounded-full shadow-xs">
            👆 Toca per picar amb el bastó!
          </div>
        )}
      </div>

      {/* Estat de victòria */}
      {isWon && (
        <div className="rounded-xl bg-[#0f4437]/10 border border-[#0f4437]/20 p-3 text-center space-y-1 animate-in fade-in">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#0f4437]">
            <Sparkles className="w-4 h-4 text-[#c89332]" />
            <span>El Tió ha cagat: <strong>{prizeName}</strong>!</span>
          </div>
          <p className="text-[11px] text-[#7e7368]">
            Has picat fort i amb molta il·lusió de Nadal! 🍫🎁✨
          </p>
        </div>
      )}
    </div>
  )
}

