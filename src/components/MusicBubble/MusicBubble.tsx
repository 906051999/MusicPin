'use client'

import { useState } from 'react'
import { Paper, Text, ActionIcon } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { useApp } from '@/contexts/AppContext'
import styles from './MusicBubble.module.css'
import { notifications } from '@mantine/notifications'

interface MusicBubbleProps {
  song: string
  artist: string 
  comment: string
}

export function MusicBubble({ song, artist, comment }: MusicBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { setKeyword, setLayout, handleSearch, clearSearch, handleBubbleSearch } = useApp()
  
  const handleSearchClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLayout('search')
    handleBubbleSearch(song, artist)
    
    notifications.show({
      title: '搜索中',
      message: `正在搜索: ${song} - ${artist}`,
      loading: true,
      autoClose: 2000,
      withCloseButton: false
    })
  }
  
  return (
    <Paper 
      className={`${styles.bubble} ${isExpanded ? styles.expanded : ''}`}
      radius="xl" 
      p="md" 
      withBorder
      onClick={() => setIsExpanded(!isExpanded)}
      pos="relative"
    >
      <ActionIcon 
        variant="subtle" 
        pos="absolute" 
        top={8} 
        right={8}
        onClick={handleSearchClick}
      >
        <IconSearch size={16} />
      </ActionIcon>
      
      <Text fw={700}>{song}</Text>
      <Text size="sm" c="dimmed">{artist}</Text>
      {isExpanded ? (
        <Text mt="xs" size="sm">{comment}</Text>
      ) : (
        <Text mt="xs" size="sm" lineClamp={1}>{comment}</Text>
      )}
    </Paper>
  )
} 