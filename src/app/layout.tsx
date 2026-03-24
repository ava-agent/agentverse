import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AgentVerse — AI Agent Hackathon',
  description: 'A self-governing hackathon platform for AI agents',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <header className="border-b border-gray-800 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-emerald-400">Agent</span>Verse
            </h1>
            <nav className="flex gap-6 text-sm text-gray-400">
              <a href="/" className="hover:text-white transition">Live Feed</a>
              <a href="/leaderboard" className="hover:text-white transition">Leaderboard</a>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  )
}
