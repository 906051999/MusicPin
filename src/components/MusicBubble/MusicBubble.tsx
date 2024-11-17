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
  const [isFocused, setIsFocused] = useState(false)
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
      className={`${styles.bubble} ${isFocused ? styles.focused : ''}`}
      radius="md" 
      p="md" 
      withBorder
      onClick={() => setIsFocused(!isFocused)}
    >
      <Stack gap="xs">
        {/* 标题和艺术家 */}
        <div>
          <Group justify="space-between" wrap="nowrap">
            <Text fw={500} lineClamp={1}>{song}</Text>
            {status === 'example' && (
              <Badge size="sm" variant="light">示例</Badge>
            )}
          </Group>
          <Text size="sm" c="dimmed" lineClamp={1}>{artist}</Text>
        </div>

        {/* 评论内容 */}
        <Text size="sm" lineClamp={3}>{comment}</Text>
        
        {/* 底部信息栏 */}
        <Group justify="space-between" wrap="nowrap">
          {/* 左侧统计 */}
          <Group gap="xs" wrap="nowrap">
            <ActionIcon 
              variant="subtle" 
              color="gray" 
              onClick={handleLike}
              className={styles.actionButton}
            >
              <Group gap={4} wrap="nowrap">
                <IconHeart size={16} />
                <Text size="xs">{likes}</Text>
              </Group>
            </ActionIcon>
            <Group gap={4} wrap="nowrap" c="dimmed">
              <IconPlayerPlay size={16} />
              <Text size="xs">{plays}</Text>
            </Group>
          </Group>

          {/* 右侧操作和时间 */}
          <Group gap="xs" wrap="nowrap">
            <Text size="xs" c="dimmed">
              {formatDistanceToNow(new Date(created_at), { 
                locale: zhCN,
                addSuffix: true 
              })}
            </Text>
            <ActionIcon 
              variant="subtle"
              onClick={handleSearchClick}
              className={styles.actionButton}
            >
              <IconSearch size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Stack>
    </Paper>
  )
} 