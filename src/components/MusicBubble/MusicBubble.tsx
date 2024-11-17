'use client'

import { useState } from 'react'
import { Paper, Text, ActionIcon, Group, Stack, Badge } from '@mantine/core'
import { IconSearch, IconHeart, IconPlayerPlay } from '@tabler/icons-react'
import { useApp } from '@/contexts/AppContext'
import styles from './MusicBubble.module.css'
import { supabase } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { notifications } from '@mantine/notifications'
import { useComments } from '@/lib/hooks/useMusic'

interface MusicBubbleProps {
  id: number
  song: string
  artist: string 
  comment: string
  status: string
  info: {
    likes: number
    play_count: number
  }
  user_id: string | null
  created_at: string
}

export function MusicBubble({ 
  id, song, artist, comment, status, info, user_id, created_at 
}: MusicBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [likes, setLikes] = useState(info.likes)
  const [plays, setPlays] = useState(info.play_count)
  const { handleBubbleSearch } = useApp()
  const { invalidateComments } = useComments()
  
  const handleSearchClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    handleBubbleSearch(song, artist)
    
    const newPlays = plays + 1
    setPlays(newPlays)
    
    try {
      const { error } = await supabase.rpc('increment_info_counter', {
        row_id: id,
        counter_name: 'play_count'
      })
      
      if (error) throw error
      
      // 更新缓存
      invalidateComments()
    } catch (error) {
      console.error('Failed to update play count:', error)
      setPlays(plays)
      notifications.show({
        title: '更新播放次数失败',
        message: error instanceof Error ? error.message : '未知错误',
        color: 'red'
      })
    }
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const newLikes = likes + 1
    setLikes(newLikes)
    
    try {
      const { error } = await supabase.rpc('increment_info_counter', {
        row_id: id,
        counter_name: 'likes'
      })
      
      if (error) throw error
      
      // 更新缓存
      invalidateComments()
    } catch (error) {
      console.error('Failed to update likes:', error)
      setLikes(likes)
      notifications.show({
        title: '点赞失败',
        message: error instanceof Error ? error.message : '未知错误',
        color: 'red'
      })
    }
  }
  
  return (
    <Paper 
      className={`${styles.bubble} ${isExpanded ? styles.expanded : ''}`}
      radius="sm" 
      withBorder
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <Stack gap={4} style={{ flex: 1 }}>
        {/* 主要评论内容 */}
        <Text className={styles.quote}>"{comment}"</Text>

        {/* 歌曲信息 */}
        <Text className={styles.songInfo}>
          《{song}》- {artist}
        </Text>

        {/* 底部信息栏 */}
        <Group justify="space-between" wrap="nowrap" className={styles.footer}>
          <Group gap="xs" wrap="nowrap">
            <Group gap={4} wrap="nowrap" className={styles.actionGroup}>
              <ActionIcon 
                variant="subtle" 
                onClick={handleLike}
                className={styles.actionButton}
              >
                <IconHeart size={14} stroke={1.5} />
              </ActionIcon>
              <Text className={styles.actionText}>{likes}</Text>
            </Group>
            <Group gap={4} wrap="nowrap" className={styles.actionGroup}>
              <ActionIcon
                variant="subtle"
                className={styles.actionButton}
              >
                <IconPlayerPlay size={14} stroke={1.5} />
              </ActionIcon>
              <Text className={styles.actionText}>{plays}</Text>
            </Group>
          </Group>

          <Group gap="xs" wrap="nowrap">
            <Text size="xs" c="dimmed">
              {formatDistanceToNow(new Date(created_at), { 
                locale: zhCN,
                addSuffix: true 
              })}
            </Text>
            <ActionIcon 
              variant="subtle"
              size="sm"
              onClick={handleSearchClick}
              className={styles.actionButton}
            >
              <IconSearch size={14} stroke={1.5} />
            </ActionIcon>
          </Group>
        </Group>
      </Stack>
    </Paper>
  )
} 