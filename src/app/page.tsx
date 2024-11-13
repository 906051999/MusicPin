'use client'

import { useState, useEffect } from 'react'
import { Input, Select, Card, Group, Text, Button, Stack, Container, Badge } from '@mantine/core'
import { IconSearch, IconX } from '@tabler/icons-react'
import { useSearch, useSongDetail } from '@/lib/hooks/useMusic'
import { PLATFORMS, API_INTERFACE, isSuccessCode, isInterfaceEnabled, PLATFORM_COLORS } from '@/lib/api/config'
import type { SearchResult } from '@/lib/api/types'
import { Disclaimer } from '@/components/Disclaimer'
import { notifications } from '@mantine/notifications'

// 获取有效平台列表的函数
const getAvailablePlatforms = () => {
  return Object.entries(PLATFORMS)
    .filter(([platformKey]) => 
      // 检查该平台是否有至少一个可用接口
      Object.keys(API_INTERFACE).some(key => {
        const [plt, src] = key.split(':');
        return plt === platformKey && isInterfaceEnabled(plt, src);
      })
    )
    .map(([value, label]) => ({
      value,
      label
    }));
};

export default function Home() {
  const [keyword, setKeyword] = useState('')
  const [searchText, setSearchText] = useState('')
  const [selectedSong, setSelectedSong] = useState<string>('')
  const [shouldSearch, setShouldSearch] = useState(false)
  
  const { data: searchData, isLoading: isSearching, error: searchError, refetch } = useSearch(searchText, shouldSearch)
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
  }, [songDetailError, songData])

  const handleSearch = () => {
    if (keyword.trim()) {
      setSearchText(keyword.trim())
      setShouldSearch(false)
      setTimeout(() => setShouldSearch(true), 0)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // 重置搜索状态
  const resetSearch = () => {
    setShouldSearch(false)
  }

  const handlePlay = (result: SearchResult) => {
    if (selectedSong === result.shortRequestUrl) {
      setSelectedSong('')  // 如果当前歌曲正在播放，点击则停止
    } else {
      setSelectedSong(result.shortRequestUrl)  // 否则播放新选中的歌曲
    }
  }

  return (
    <Container size="md" py="xl">
      <Disclaimer />
      
      <Text size="xl" fw={700} ta="center" mb="xl">
        MusicPin Demo
      </Text>

      <Group mb="xl">
        <Input
          placeholder="输入关键词搜索..."
          value={keyword}
          onChange={(e) => {
            setKeyword(e.currentTarget.value)
            resetSearch()
          }}
          onKeyPress={handleKeyPress}
          className="flex-1"
          size="md"
        />
        <Button 
          onClick={handleSearch}
          loading={isSearching}
          disabled={!keyword.trim()}
          size="md"
          leftSection={<IconSearch size={16} />}
        >
          搜索
        </Button>
      </Group>

      {/* 搜索状态展示 */}
      {isSearching ? (
        <Text ta="center" c="dimmed">搜索中...</Text>
      ) : searchError ? (
        <Card withBorder p="md" mb="md">
          <Group justify="space-between" align="center">
            <div>
              <Text c="red">搜索失败: {searchError.message}</Text>
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

      {/* 修改搜索结果列表的渲染 */}
      <Stack gap="md">
        {searchData?.data?.map((result) => {
          const isPlaying = selectedSong === result.shortRequestUrl
          return isPlaying && songData?.data ? (
            <Card key={result.shortRequestUrl} withBorder shadow="sm">
              <Group align="flex-start" noWrap>
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
                  <Text fw={500} lineClamp={1}>{songData.data.title || result.title}</Text>
                  <Text size="sm" c="dimmed" lineClamp={1}>
                    {songData.data.artist || result.artist}
                  </Text>
                  <Text size="xs" c="gray">
                    {songData.data.extra?.quality && `音质: ${songData.data.extra.quality}`}
                  </Text>


                </div>
               
                                    <Button
                  variant="filled"
                  onClick={() => handlePlay(result)}
                  size="sm"
                >
                  停止播放
                </Button>

              </Group>
              <audio
                    src={songData.data.audioUrl}
                    controls
                    autoPlay
                    style={{ width: '100%', marginTop: '15px' }}
                    onEnded={() => setSelectedSong('')}
                    onError={() => {
                      setSelectedSong('')
                      notifications.show({
                        title: '播放失败',
                        message: '音频加载错误',
                        color: 'red',
                        icon: <IconX />
                      })
                    }}
                  />
            </Card>
          ) : (
            <SearchResultCard
              key={result.shortRequestUrl}
              result={result}
              isPlaying={isPlaying}
              onPlay={() => handlePlay(result)}
            />
          )
        })}
      </Stack>

      {/* 移除底部固定播放器 */}
    </Container>
  )
}

function SearchResultCard({ 
  result, 
  isPlaying, 
  onPlay 
}: { 
  result: SearchResult
  isPlaying: boolean
  onPlay: () => void
}) {
  return (
    <Card withBorder shadow="sm">
      <Group align="flex-start" noWrap>
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
