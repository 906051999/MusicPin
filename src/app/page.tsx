'use client'

import { useState } from 'react'
import { Input, Select, Card, Group, Text, Button, Stack, Container } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { useSearch, useSongDetail } from '@/lib/hooks/useMusic'
import { PLATFORMS } from '@/lib/api/config'
import type { SearchResult } from '@/lib/api/types'
import { Disclaimer } from '@/components/Disclaimer'

export default function Home() {
  const [keyword, setKeyword] = useState('')
  const [searchText, setSearchText] = useState('')
  const [platform, setPlatform] = useState<string>('wy')
  const [selectedSong, setSelectedSong] = useState<string>('')
  
  const { data: searchData, isLoading: isSearching, error: searchError, refetch } = useSearch(searchText, platform)
  const { data: songData } = useSongDetail(selectedSong)

  // 过滤当前平台的结果
  const filteredResults = searchData?.data.filter(item => 
    item.platform === platform
  )

  const handleSearch = () => {
    if (keyword.trim()) {
      setSearchText(keyword.trim())  // 确保设置了搜索文本
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
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
          onChange={(e) => setKeyword(e.currentTarget.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
          size="md"
        />
        <Select
          value={platform}
          onChange={(value) => setPlatform(value || 'wy')}
          data={Object.entries(PLATFORMS).map(([value, label]) => ({
            value,
            label
          }))}
          w={120}
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
      ) : searchText && filteredResults?.length === 0 ? (
        <Text ta="center" c="dimmed">未找到相关结果</Text>
      ) : null}

      {/* 搜索结果列表 */}
      <Stack gap="md">
        {filteredResults?.map((result) => (
          <SearchResultCard
            key={result.shortRequestUrl}
            result={result}
            isPlaying={selectedSong === result.shortRequestUrl}
            onPlay={() => {
              if (selectedSong === result.shortRequestUrl) {
                setSelectedSong('')  // 如果当前歌曲正在播放，点击则停止
              } else {
                setSelectedSong(result.shortRequestUrl)  // 否则播放新选中的歌曲
              }
            }}
          />
        ))}
      </Stack>

      {/* 播放器 */}
      {songData && (
        <Card 
          withBorder 
          className="fixed bottom-0 left-0 right-0 rounded-none"
          p="md"
        >
          <Group justify="space-between" mb="xs">
            <div>
              <Text fw={500}>{songData.data.title}</Text>
              <Text size="sm" c="dimmed">{songData.data.artist}</Text>
            </div>
          </Group>
          <audio
            src={songData.data.audioUrl}
            controls
            autoPlay
            className="w-full"
            onEnded={() => setSelectedSong('')}  // 播放结束时清除选中状态
          />
        </Card>
      )}
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
      <Group justify="space-between" align="center">
        <div>
          <Text fw={500} lineClamp={1}>{result.title}</Text>
          <Text size="sm" c="dimmed" lineClamp={1}>
            {result.artist} · {PLATFORMS[result.platform as keyof typeof PLATFORMS]}
          </Text>
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
