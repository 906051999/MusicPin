'use client'

import { useState } from 'react'
import { Input, Select, Card, Group, Text, Button, Stack, Container } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { useSearch, useSongDetail } from '@/lib/hooks/useMusic'
import { PLATFORMS, API_INTERFACE } from '@/lib/api/config'
import type { SearchResult } from '@/lib/api/types'
import { Disclaimer } from '@/components/Disclaimer'

export default function Home() {
  const [keyword, setKeyword] = useState('')
  const [searchText, setSearchText] = useState('')
  const [platform, setPlatform] = useState<string>('wy')
  const [source, setSource] = useState<string>('XF')
  const [selectedSong, setSelectedSong] = useState<string>('')
  const [shouldSearch, setShouldSearch] = useState(false)
  
  const { data: searchData, isLoading: isSearching, error: searchError, refetch } = useSearch(searchText, platform, source, shouldSearch)
  const { data: songData } = useSongDetail(selectedSong, platform, source)

  const handleSearch = () => {
    if (keyword.trim()) {
      setSearchText(keyword.trim())
      setShouldSearch(true)
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

  // 可用的API源选项
  const sourceOptions = Object.entries(API_INTERFACE)
    .filter(([key]) => key.startsWith(`${platform}:`))
    .map(([key, label]) => ({
      value: key.split(':')[1].toUpperCase(),
      label
    }))

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
            resetSearch() // 输入变化时重置搜索状态
          }}
          onKeyPress={handleKeyPress}
          className="flex-1"
          size="md"
        />
        <Select
          value={platform}
          onChange={(value) => {
            setPlatform(value || 'wy')
            resetSearch() // 平台变化时重置搜索状态
            // 重置source为该平台的第一个可用源
            const newSources = Object.entries(API_INTERFACE)
              .filter(([key]) => key.startsWith(`${value}:`))
            if (newSources.length > 0) {
              setSource(newSources[0][0].split(':')[1].toUpperCase())
            }
          }}
          data={Object.entries(PLATFORMS).map(([value, label]) => ({
            value,
            label
          }))}
          w={120}
          size="md"
        />
        <Select
          value={source}
          onChange={(value) => {
            setSource(value || 'XF')
            resetSearch() // source变化时重置搜索状态
          }}
          data={sourceOptions}
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
      ) : searchText && searchData?.data?.length === 0 ? (
        <Text ta="center" c="dimmed">未找到相关结果</Text>
      ) : null}

      {/* 搜索结果列表 */}
      <Stack gap="md">
        {searchData?.data?.map((result) => (
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
