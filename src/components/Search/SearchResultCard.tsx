'use client'

import { Card, Group, Text, Button } from '@mantine/core'
import { PLATFORM_COLORS } from '@/lib/api/config'
import type { SearchResult } from '@/lib/api/types'

interface SearchResultCardProps {
  result: SearchResult
  isPlaying: boolean
  onPlay: () => void
}

export function SearchResultCard({ result, isPlaying, onPlay }: SearchResultCardProps) {
  return (
    <Card withBorder shadow="sm">
      <Group align="flex-start">
        <div 
          style={{ 
            width: '4px',
            alignSelf: 'stretch',
            backgroundColor: PLATFORM_COLORS[result.platform as keyof typeof PLATFORM_COLORS],
            borderRadius: '2px',
            marginRight: '8px'
          }} 
        />
        <div style={{ flex: 1 }}>
          <Text fw={500} lineClamp={1}>{result.title}</Text>
          <Text size="sm" c="dimmed" lineClamp={1}>{result.artist}</Text>
        </div>
        <Button
          variant={isPlaying ? "filled" : "light"}
          onClick={onPlay}
          size="sm"
        >
          {isPlaying ? '停止播放' : '播放'}
        </Button>
      </Group>
    </Card>
  )
} 