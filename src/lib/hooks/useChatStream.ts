import { useState, useCallback, useRef } from 'react'
import type { SystemPromptKey, OpenAIModel } from '@/lib/config/openai'
import { OPENAI_CONFIG } from '@/lib/config/openai'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatOptions {
  model?: OpenAIModel
  systemPrompt?: SystemPromptKey
}

export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentModel, setCurrentModel] = useState<OpenAIModel>(OPENAI_CONFIG.defaults.model)
  const [currentPrompt, setCurrentPrompt] = useState<SystemPromptKey>(OPENAI_CONFIG.defaults.systemPrompt)
  const abortController = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (
    content: string,
    options?: ChatOptions
  ) => {
    if (!content.trim() || isLoading) return

    if (abortController.current) {
      abortController.current.abort()
    }
    abortController.current = new AbortController()

    setIsLoading(true)
    setMessages(prev => [...prev, { role: 'user', content }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content,
          model: options?.model || currentModel,
          systemPrompt: options?.systemPrompt || currentPrompt
        }),
        signal: abortController.current.signal
      })

      const reader = response.body?.getReader()
      if (!reader) return

      let currentMessage = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const text = new TextDecoder().decode(value)
        currentMessage += text
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: currentMessage }
        ])
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Chat request aborted')
      } else {
        console.error('Chat error:', error)
      }
    } finally {
      setIsLoading(false)
      abortController.current = null
    }
  }, [isLoading, currentModel, currentPrompt])

  // 添加新方法用于直接设置消息
  const addMessage = useCallback((content: string, role: 'user' | 'assistant' = 'assistant') => {
    setMessages(prev => [...prev, { role, content }])
  }, [])

  // 添加取消方法
  const cancelChat = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort()
    }
  }, [])

  return {
    messages,
    isLoading,
    sendMessage,
    addMessage, // 导出新方法
    clearMessages: () => {
      cancelChat()  // 清空消息时同时取消当前聊天
      setMessages([])
    },
    currentModel,
    setCurrentModel,
    currentPrompt,
    setCurrentPrompt,
    cancelChat  // 导出取消方法
  }
} 