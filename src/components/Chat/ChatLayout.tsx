'use client'

import { Box, Paper, Button, Textarea, Select, Table } from '@mantine/core'
import { useState, useRef, useEffect } from 'react'
import { IconSend, IconDatabase, IconX, } from '@tabler/icons-react'
import { useChatStream } from '@/lib/hooks/useChatStream'
import { generateMusicPrompt, OPENAI_CONFIG } from '@/lib/config/openai'
import { notifications } from '@mantine/notifications'
import { supabase } from '@/lib/supabase'

interface Song {
  id: number
  title: string
  artist: string
}

interface SongsCache {
  data: Song[]
  timestamp: number
}

const fetchWithTimeout = async (promise: Promise<any>, timeout: number) => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), timeout)
  })
  return Promise.race([promise, timeoutPromise])
}

export function ChatLayout() {
  const [prompt, setPrompt] = useState('')
  const [songs, setSongs] = useState<Song[]>([])
  const songsCache = useRef<SongsCache | null>(null)
  const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存
  const [isFetching, setIsFetching] = useState(false)
  
  const { 
    messages, 
    isLoading, 
    sendMessage,
    currentModel,
    setCurrentModel,
    currentPrompt,
    setCurrentPrompt,
    addMessage,
    clearMessages,
    cancelChat
  } = useChatStream()

  const fetchSongs = async () => {
    setIsFetching(true)
    cancelChat()
    clearMessages()
    
    // 检查缓存
    const now = Date.now()
    if (songsCache.current && (now - songsCache.current.timestamp < CACHE_DURATION)) {
      setSongs(songsCache.current.data)
      await handleSongsDisplay(songsCache.current.data)
      setIsFetching(false)
      return
    }

    try {
      // 先尝试通过 Supabase 客户端获取
      const supabasePromise = supabase.rpc('get_unique_songs')
      const { data, error } = await fetchWithTimeout(supabasePromise, 3000)
      
      if (!error && data) {
        songsCache.current = { data, timestamp: now }
        setSongs(data)
        await handleSongsDisplay(data)
        setIsFetching(false)
        return
      }
    } catch (e) {
      // 超时或其他错误，尝试通过后端 API 获取
      try {
        const response = await fetch('/api/comments?type=songs')
        const data = await response.json()
        
        if ('error' in data) {
          throw new Error(data.error)
        }

        if (!Array.isArray(data)) {
          throw new Error('获取到的数据格式不正确')
        }

        songsCache.current = { data, timestamp: now }
        setSongs(data)
        await handleSongsDisplay(data)
      } catch (error) {
        console.error('Error fetching songs:', error)
        notifications.show({
          title: '获取歌曲失败',
          message: error instanceof Error ? error.message : '请稍后重试',
          color: 'red',
          icon: <IconX size={16} />,
        })
      } finally {
        setIsFetching(false)
      }
    }
  }

  const handleSongsDisplay = async (songsData: Song[]) => {
    const songsText = songsData
      .map(s => `${s.id}. ${s.title} - ${s.artist}`)
      .join('\n')
      
    setPrompt('')
    addMessage('选择一首歌曲让我来告诉你为什么值得推荐哦', 'assistant')
    addMessage(songsText, 'assistant')
  }

  const handleSend = async () => {
    if (!prompt.trim()) return
    
    // 检查是否输入了有效的歌曲ID
    if (/^\d+$/.test(prompt)) {
      const song = songs.find(s => s.id === parseInt(prompt))
      if (song) {
        await sendMessage(generateMusicPrompt(currentPrompt, {
          title: song.title,
          artist: song.artist
        }))
        setPrompt('')
        return
      }
    }

    await sendMessage(prompt)
    setPrompt('')
  }

  // 组件卸载时取消聊天
  useEffect(() => {
    return () => {
      cancelChat()
    }
  }, [cancelChat])

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Box style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
        <Select
          label="模型"
          value={currentModel}
          onChange={(value: any) => setCurrentModel(value)}
          data={Object.entries(OPENAI_CONFIG.models).map(([id, config]) => ({
            value: id,
            label: config.name
          }))}
          style={{ flex: 1 }}
        />
        <Select
          label="分析类型"
          value={currentPrompt}
          onChange={(value: any) => setCurrentPrompt(value)}
          data={Object.entries(OPENAI_CONFIG.promptLabels).map(([key, label]) => ({
            value: key,
            label: label
          }))}
          style={{ flex: 1 }}
        />
        <Button 
          onClick={fetchSongs}
          loading={isFetching}
          disabled={isFetching}
        >
          {isFetching ? '获取中...' : '获取歌曲'}
        </Button>
      </Box>

      <Paper p="md" style={{ flex: 1, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: '1rem' }}>
            {msg.role === 'user' ? `问：${msg.content}` : `答：${msg.content}`}
          </div>
        ))}
      </Paper>

      <Box style={{ display: 'flex', gap: '1rem' }}>
        <Textarea
          placeholder="输入您的问题..."
          value={prompt}
          onChange={(e) => setPrompt(e.currentTarget.value)}
          style={{ flex: 1 }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
        />
        <Button 
          onClick={handleSend}
          loading={isLoading}
          disabled={!prompt.trim() || isLoading}
        >
          <IconSend size={16} />
        </Button>
      </Box>
    </Box>
  )
} 