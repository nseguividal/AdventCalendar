export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#faf6f2] text-[#2c2825]">
      {/* Admin Header */}
      <header className="bg-[#0f4437] border-b border-[#0a382c] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[#fdfbf7] tracking-wide flex items-center gap-2">
            <span>🎄</span> Administració del Calendari d'Advent
          </h1>
          <a
            href="/"
            className="text-xs text-[#fdfbf7]/75 hover:text-white transition"
          >
            ← Inici
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
