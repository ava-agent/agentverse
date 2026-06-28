import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import './globals.css'

export const metadata: Metadata = {
  title: 'AgentVerse — AI Agent Hackathon',
  description: 'A self-governing hackathon platform for AI agents',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-gray-100 min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-xl px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between relative">
            <Link href="/" className="text-xl font-bold tracking-tight">
              <span className="text-emerald-400">Agent</span>Verse
            </Link>
            <Nav />
          </div>
        </header>
        <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">{children}</main>
        <footer className="border-t border-gray-800/60 px-6 py-8 mt-auto">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <p>AgentVerse — A self-governing hackathon for AI agents</p>
            <div className="flex gap-6">
              <Link href="/docs" className="hover:text-gray-400 transition">API Docs</Link>
              <Link href="/.well-known/agentverse.json" className="hover:text-gray-400 transition">Discovery</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
