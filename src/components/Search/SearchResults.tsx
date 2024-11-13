'use client'

import { Stack, Text, Card, Group, Button } from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import { useApp } from '@/contexts/AppContext'
import { useSearch, useSongDetail } from '@/lib/hooks/useMusic'
import { notifications } from '@mantine/notifications'
import { isSuccessCode } from '@/lib/api/config'
import type { APISource } from '@/lib/api/config'
import { PlayingCard } from './PlayingCard'
import { SearchResultCard } from './SearchResultCard'
import { useEffect } from 'react'

export function SearchResults() {
  const { searchText, shouldSearch, selectedSong, setSelectedSong, handlePlay } = useApp()
  const { data: searchData, isLoading, error, refetch } = useSearch(searchText, shouldSearch)
  const { data: songData, error: songDetailError } = useSongDetail(selectedSong)

  // 监听歌曲详情错误
  useEffect(() => {
    if (songDetailError) {
      console.error('Complete song detail error:', songDetailError)
      notifications.show({
        title: '播放失败',
        message: songDetailError.message || '无法获取歌曲详情',
        color: 'red',
        icon: <IconX />,
        autoClose: 3000,
        onClose: () => setSelectedSong('')
      })
    } else if (songData && !isSuccessCode(songData.data?.source as APISource, songData.code)) {
      console.error('Detailed song data error:', songData)
      notifications.show({
        title: '播放失败',
        message: songData.msg || '歌曲详情获取异常',
        color: 'red',
        icon: <IconX />,
        autoClose: 3000,
        onClose: () => setSelectedSong('')
      })
    }
  }, [songDetailError, songData, setSelectedSong])

  return (
    <Stack gap="md">
      {/* 搜索状态展示 */}
      {isLoading ? (
        <Text ta="center" c="dimmed">搜索中...</Text>
      ) : error ? (
        <Card withBorder p="md" mb="md">
          <Group justify="space-between" align="center">
            <div>
              <Text c="red">搜索失败: {error.message}</Text>
              <Text size="sm" c="dimmed">请检查网络连接后重试</Text>
            </div>
            <Button variant="light" onClick={() => refetch()}>
              重试
            </Button>
          </Group>
        </Card>
      ) : searchText && searchData?.data?.length === 0 ? (
        <Text ta="center" c="dimmed">未找到相关结果</Text>
      ) : null}

      {searchData?.data?.map((result) => (
        result.shortRequestUrl === selectedSong && songData?.data ? (
          <PlayingCard 
            key={result.shortRequestUrl}
            result={result}
            songData={songData.data}
            onStop={() => handlePlay(result)}
            onError={() => setSelectedSong('')}
          />
        ) : (
          <SearchResultCard
            key={result.shortRequestUrl}
            result={result}
            isPlaying={selectedSong === result.shortRequestUrl}
            onPlay={() => handlePlay(result)}
          />
        )
      ))}
    </Stack>
  )
} 