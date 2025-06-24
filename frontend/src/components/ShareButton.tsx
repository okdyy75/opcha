'use client'

import { useState } from 'react'

interface ShareButtonProps {
  roomId: string
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
  className?: string
  title?: string
  iconOnly?: boolean
}

export default function ShareButton({ 
  roomId, 
  onSuccess, 
  onError,
  className,
  title = "URLをコピー",
  iconOnly = false
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCopyUrl = async () => {
    if (isProcessing) return
    
    setIsProcessing(true)
    
    try {
      // window.location.originが利用できない場合の対処
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const url = `${origin}/rooms/${roomId}`
      
      // Clipboard APIが利用可能かチェック
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        // フォールバック: 旧式のdocument.execCommand()を使用
        const textArea = document.createElement('textarea')
        textArea.value = url
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        
        if (!successful) {
          throw new Error('フォールバックコピーも失敗しました')
        }
      }
      
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      
      if (onSuccess) {
        onSuccess('URLをコピーしました')
      }
    } catch (error) {
      console.error('URLのコピーに失敗しました:', error)
      
      const errorMessage = error instanceof Error 
        ? `コピーに失敗しました: ${error.message}`
        : 'URLのコピーに失敗しました。手動でURLをコピーしてください。'
      
      if (onError) {
        onError(errorMessage)
      } else {
        // エラーコールバックがない場合はデフォルトでアラート表示
        alert(errorMessage)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  if (iconOnly) {
    return (
      <button
        onClick={handleCopyUrl}
        disabled={isProcessing}
        className={className || "p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"}
        title={isProcessing ? "処理中..." : title}
        aria-label={isProcessing ? "URLコピー処理中" : "ルームのURLをコピー"}
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
    )
  }

  return (
    <button
      onClick={handleCopyUrl}
      disabled={isProcessing}
      className={className || "flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"}
      aria-label={isProcessing ? "URLコピー処理中" : "ルームのURLをコピー"}
    >
      <span>
        {isProcessing ? 'コピー中...' : 
         copied ? 'コピー済み!' : 
         '🔗 URLをシェア'}
      </span>
    </button>
  )
} 