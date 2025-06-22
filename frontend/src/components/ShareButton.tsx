'use client'

import { useState } from 'react'

interface ShareButtonProps {
  roomId: string
  onSuccess?: (message: string) => void
  className?: string
  title?: string
  iconOnly?: boolean
}

export default function ShareButton({ 
  roomId, 
  onSuccess, 
  className,
  title = "URLをコピー",
  iconOnly = false
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyUrl = async () => {
    const url = `${window.location.origin}/rooms/${roomId}`
    
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      
      if (onSuccess) {
        onSuccess('URLをコピーしました')
      }
    } catch (err) {
      console.error('URLのコピーに失敗しました:', err)
    }
  }

  if (iconOnly) {
    return (
      <button
        onClick={handleCopyUrl}
        className={className || "p-2 hover:bg-[var(--line-gray)] rounded-full transition-colors"}
        title={title}
      >
        <svg className="w-5 h-5 text-[var(--line-dark-gray)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
    )
  }

  return (
    <button
      onClick={handleCopyUrl}
      className={className || "flex items-center space-x-2 px-4 py-2 bg-[var(--line-green)] hover:bg-[var(--line-green-hover)] text-white text-sm rounded-lg transition-colors duration-200"}
    >
      <span>{copied ? 'コピー済み!' : '🔗 URLをシェア'}</span>
    </button>
  )
} 