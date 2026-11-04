"use client";

import { useEffect, useState } from "react";

/** Individual snowflake particle */
function Snowflake({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="pointer-events-none fixed text-[#0f4437]/20 animate-snowfall select-none"
      style={style}
      aria-hidden="true"
    >
      ❄
    </div>
  );
}

/** Generates random snowflake styles for the background effect */
function useSnowflakes(count: number) {
  const [flakes, setFlakes] = useState<React.CSSProperties[]>([]);

  useEffect(() => {
    const generated: React.CSSProperties[] = Array.from({ length: count }, () => ({
      left: `${Math.random() * 100}%`,
      fontSize: `${Math.random() * 14 + 10}px`,
      animationDuration: `${Math.random() * 8 + 6}s`,
      animationDelay: `${Math.random() * 10}s`,
      opacity: Math.random() * 0.5 + 0.2,
    }));
    setFlakes(generated);
  }, [count]);

  return flakes;
}

export default function LandingPage() {
  const snowflakes = useSnowflakes(25);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 bg-[#faf6f2] text-[#2c2825]">
      {/* Snowfall background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {snowflakes.map((style, i) => (
          <Snowflake key={i} style={style} />
        ))}
      </div>

      {/* Hero content */}
      <div className="relative z-10 flex max-w-2xl flex-col items-center text-center">
        {/* Glowing tree emoji */}
        <div className="mb-6 text-7xl sm:text-8xl animate-float drop-shadow-sm">
          🎄
        </div>

        {/* Title */}
        <h1 className="mb-3 font-display text-4xl sm:text-6xl font-bold tracking-tight text-[#0f4437]">
          Calendari d'Advent
        </h1>

        {/* Subtitle */}
        <p className="mb-8 max-w-md text-base sm:text-lg text-[#6e6358]">
          Una tradició màgica de Nadal per a tota la família
        </p>

        {/* Info card */}
        <div className="w-full max-w-md rounded-3xl border border-[#e8dfd3] bg-[#fdfbf7] px-6 py-7 shadow-sm">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#b91c1c]">
            Comença aquí
          </p>
          <p className="mb-4 text-xs sm:text-sm text-[#524a42]">
            Introdueix l'enllaç del teu calendari per iniciar el compte enrere ✨
          </p>

          {/* Sample link */}
          <div className="rounded-xl border border-[#e4d6c4] bg-[#f5ede3] px-4 py-3 text-left">
            <code className="text-xs sm:text-sm text-[#0f4437] font-mono font-medium">
              elteulloc.com/app/<span className="text-[#b91c1c] font-bold">nom-de-la-familia</span>
            </code>
          </div>
        </div>

        {/* Decorative ornaments */}
        <div className="mt-10 flex gap-4 text-2xl sm:text-3xl" aria-hidden="true">
          <span className="animate-float" style={{ animationDelay: "0s" }}>🎁</span>
          <span className="animate-float" style={{ animationDelay: "0.5s" }}>⭐</span>
          <span className="animate-float" style={{ animationDelay: "1s" }}>🔔</span>
          <span className="animate-float" style={{ animationDelay: "1.5s" }}>🎅</span>
          <span className="animate-float" style={{ animationDelay: "2s" }}>❄️</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-auto pb-6 pt-12 text-center text-xs text-[#8c8277]">
        Fet amb ❤️ per a Nadal
      </footer>
    </main>
  );
}
