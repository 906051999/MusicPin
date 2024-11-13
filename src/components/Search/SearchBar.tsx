'use client'

import { Input, Button, Group } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { useApp } from '@/contexts/AppContext'

export function SearchBar() {
  const { keyword, setKeyword, handleSearch, setShouldSearch } = useApp()

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <Group mb="xl">
      <Input
        placeholder="输入关键词搜索..."
        value={keyword}
        onChange={(e) => {
          setKeyword(e.currentTarget.value)
          setShouldSearch(false)
        }}
        onKeyPress={handleKeyPress}
        className="flex-1"
        size="md"
      />
      <Button 
        onClick={handleSearch}
        disabled={!keyword.trim()}
        size="md"
        leftSection={<IconSearch size={16} />}
      >
        搜索
      </Button>
    </Group>
  )
} 