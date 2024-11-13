'use client'

import { useState } from 'react'
import { Paper, Text, ActionIcon } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { useApp } from '@/contexts/AppContext'
import styles from './MusicBubble.module.css'

interface MusicBubbleProps {
  song: string
  artist: string 
  comment: string
}

export function MusicBubble({ song, artist, comment }: MusicBubbleProps) {
  const [isFocused, setIsFocused] = useState(false)
  const { handleBubbleSearch } = useApp()
  
  const handleSearchClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleBubbleSearch(song, artist)

  }
  
  return (
    <Paper 
      className={`${styles.bubble} ${isFocused ? styles.focused : ''}`}
      radius="md" 
      p="md" 
      withBorder
      onClick={() => setIsFocused(!isFocused)}
      style={{ position: 'relative' }}
    >
      <ActionIcon 
        variant="outline"
        style={{ position: 'absolute' }}
        top={8} 
        right={8}
        onClick={handleSearchClick}
      >
        <IconSearch size={16} />
      </ActionIcon>
      
      <Text>{song}</Text>
      <Text size="sm">{artist}</Text>
      <Text mt="xs" size="sm">{comment}</Text>
    </Paper>
  )
} 