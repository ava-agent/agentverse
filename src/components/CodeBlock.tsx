'use client'

import { useState, useEffect } from 'react'
import Prism from 'prismjs'

// Import Prism languages
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-rust'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-c'
import 'prismjs/components/prism-cpp'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-yaml'

interface CodeBlockProps {
  code: string
  language?: string
  showLineNumbers?: boolean
  maxHeight?: string
}

const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  python: 'Python',
  rust: 'Rust',
  go: 'Go',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  json: 'JSON',
  markdown: 'Markdown',
  bash: 'Bash',
  sql: 'SQL',
  yaml: 'YAML',
  html: 'HTML',
  css: 'CSS',
  jsx: 'JSX',
  tsx: 'TSX',
}

export function CodeBlock({
  code,
  language = 'text',
  showLineNumbers = true,
  maxHeight = '400px',
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [highlighted, setHighlighted] = useState('')

  useEffect(() => {
    // Normalize language name
    const normalizedLang = normalizeLanguage(language)

    // Highlight code
    if (Prism.languages[normalizedLang]) {
      const highlighted = Prism.highlight(
        code,
        Prism.languages[normalizedLang],
        normalizedLang
      )
      setHighlighted(highlighted)
    } else {
      // Fallback to plain text with HTML escaping
      setHighlighted(escapeHtml(code))
    }
  }, [code, language])

  const normalizeLanguage = (lang: string): string => {
    const normalized = lang.toLowerCase().trim()
    const langMap: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'rs': 'rust',
      'sh': 'bash',
      'shell': 'bash',
      'yml': 'yaml',
    }
    return langMap[normalized] || normalized
  }

  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const displayName = LANGUAGE_DISPLAY_NAMES[language.toLowerCase()] || language.toUpperCase()
  const normalizedLang = normalizeLanguage(language)
  const lines = code.split('\n')

  return (
    <div className="rounded-lg border border-gray-800/60 overflow-hidden bg-[#0f172a]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-800/60">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">{displayName}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded hover:bg-gray-700/50"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <div className="relative" style={{ maxHeight, overflow: 'auto' }}>
        <pre className="m-0 p-4 text-sm leading-relaxed">
          <code className={`language-${normalizedLang}`}>
            {showLineNumbers ? (
              <div className="table w-full">
                {lines.map((line, i) => (
                  <div key={i} className="table-row">
                    <span className="table-cell text-right pr-4 select-none text-gray-600 text-xs w-12">
                      {i + 1}
                    </span>
                    <span
                      className="table-cell text-gray-300"
                      dangerouslySetInnerHTML={{
                        __html: highlighted.split('\n')[i] || '&nbsp;',
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <span dangerouslySetInnerHTML={{ __html: highlighted }} />
            )}
          </code>
        </pre>
      </div>
    </div>
  )
}

// Simple inline code component
export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 text-sm font-mono">
      {children}
    </code>
  )
}
