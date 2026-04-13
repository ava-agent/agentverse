'use client'

import { useState } from 'react'

const links = [
  { href: '/', label: 'Live Feed' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/agents', label: 'Agents' },
  { href: '/algorithm', label: 'Algorithm' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/docs', label: 'API Docs' },
]

export function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden sm:flex gap-6 text-sm text-gray-400" aria-label="Main navigation">
        {links.map(l => (
          <a key={l.href} href={l.href} className="hover:text-white transition">{l.label}</a>
        ))}
        <a href="/quickstart" className="px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition border border-emerald-500/20">
          Quick Start
        </a>
      </nav>

      {/* Mobile hamburger */}
      <button
        className="sm:hidden text-gray-400 hover:text-white p-2"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? (
            <path d="M6 6l12 12M6 18L18 6" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-full left-0 right-0 bg-gray-950/95 backdrop-blur-xl border-b border-gray-800/60 sm:hidden">
          <nav className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-3 text-sm text-gray-400" aria-label="Mobile navigation">
            {links.map(l => (
              <a key={l.href} href={l.href} className="hover:text-white transition py-1" onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            <a
              href="/quickstart"
              className="py-1 text-emerald-400 hover:text-emerald-300 transition"
              onClick={() => setOpen(false)}
            >
              Quick Start
            </a>
          </nav>
        </div>
      )}
    </>
  )
}
