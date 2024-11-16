'use client'

import { Input, Button, Group, Stack, ActionIcon, Text } from '@mantine/core'
import { IconSearch, IconX } from '@tabler/icons-react'
import { useApp } from '@/contexts/AppContext'
import { useViewportSize } from '@mantine/hooks'

export function SearchBar() {
  const { song, setSong, artist, setArtist, handleSearch, setShouldSearch } = useApp()
  const { width } = useViewportSize()
  const isMobile = width < 768 // md breakpoint

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (song.trim() || artist.trim())) {
      handleSearch()
    }
  }

  const SearchInputs = (
    <>
      <Group gap="sm" style={{ flex: 1 }}>
        <Text size="sm" c="dimmed" w={30}>歌名</Text>
        <Input
          placeholder="请输入歌名..."
          value={song}
          onChange={(e) => {
            setSong(e.currentTarget.value)
            setShouldSearch(false)
          }}
          onKeyPress={handleKeyPress}
          style={{ flex: 1 }}
          size="md"
          rightSection={
            song && (
              <ActionIcon 
                variant="subtle" 
                onClick={(e) => {
                  e.stopPropagation()
                  setSong('')
                  setShouldSearch(false)
                }}
                style={{ pointerEvents: 'auto' }}
              >
                <IconX size={16} />
              </ActionIcon>
            )
          }
        />
      </Group>
      <Group gap="sm" style={{ flex: 1 }}>
        <Text size="sm" c="dimmed" w={30}>歌手</Text>
        <Input
          placeholder="请输入歌手..."
          value={artist}
          onChange={(e) => {
            setArtist(e.currentTarget.value)
            setShouldSearch(false)
          }}
          onKeyPress={handleKeyPress}
          style={{ flex: 1 }}
          size="md"
          rightSection={
            artist && (
              <ActionIcon 
                variant="subtle" 
                onClick={(e) => {
                  e.stopPropagation()
                  setArtist('')
                  setShouldSearch(false)
                }}
                style={{ pointerEvents: 'auto' }}
              >
                <IconX size={16} />
              </ActionIcon>
            )
          }
        />
      </Group>
    </>
  )

  return (
    <Stack gap="md" mb="xl" style={{ width: '100%' }}>
      {isMobile ? (
        <>
          <Stack gap="md">
            {SearchInputs}
          </Stack>
          <Button 
            onClick={handleSearch}
            disabled={!song.trim() && !artist.trim()}
            size="md"
            leftSection={<IconSearch size={16} />}
            fullWidth
          >
            搜索
          </Button>
        </>
      ) : (
        <Group gap="md" grow>
          {SearchInputs}
          <Button 
            onClick={handleSearch}
            disabled={!song.trim() && !artist.trim()}
            size="md"
            leftSection={<IconSearch size={16} />}
            style={{ flexShrink: 0, width: 'auto' }}
          >
            搜索
          </Button>
        </Group>
      )}
    </Stack>
  )
} 