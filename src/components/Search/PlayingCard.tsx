'use client'

import { Card, Group, Text, Button } from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { PLATFORM_COLORS } from '@/lib/api/config'
import type { SearchResult, SongDetail } from '@/lib/api/types'

interface PlayingCardProps {
  result: SearchResult
  songData: SongDetail
  onStop: () => void
  onError: () => void
}

export function PlayingCard({ result, songData, onStop, onError }: PlayingCardProps) {
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
          <Text fw={500} lineClamp={1}>{songData.title || result.title}</Text>
          <Text size="sm" c="dimmed" lineClamp={1}>
            {songData.artist || result.artist}
          </Text>
          <Text size="xs" c="gray">
            {songData.extra?.quality && `音质: ${songData.extra.quality}`}
          </Text>
        </div>
        <Button
          variant="filled"
          onClick={onStop}
          size="sm"
        >
          停止播放
        </Button>
      </Group>
      <audio
        src={songData.audioUrl}
        controls
        autoPlay
        style={{ width: '100%', marginTop: '15px' }}
        onEnded={onError}
        onError={() => {
          onError()
          notifications.show({
            title: '播放失败',
            message: '音频加载错误',
            color: 'red',
            icon: <IconX />
          })
        }}
      />
    </Card>
  )
} 