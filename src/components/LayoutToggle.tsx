'use client'

import { SegmentedControl, Box } from '@mantine/core'
import { IconWash, IconSearch, IconMessageCircle } from '@tabler/icons-react'
import { useApp } from '@/contexts/AppContext'

export function LayoutToggle() {
  const { layout, setLayout, setSelectedSong } = useApp()
  
  return (
    <Box ta="center" mb="md">
      <SegmentedControl
        value={layout}
        onChange={(value) => {
          setLayout(value as 'ocean' | 'search' | 'chat')
          setSelectedSong('')
        }}
        data={[
          {
            value: 'ocean',
            label: (
              <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconWash size={16} stroke={1.5} />
                音乐海
              </Box>
            ),
          },
          {
            value: 'search',
            label: (
              <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconSearch size={16} stroke={1.5} />
                搜索
              </Box>
            ),
          },
          {
            value: 'chat',
            label: (
              <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconMessageCircle size={16} stroke={1.5} />
                问东问西
              </Box>
            ),
          },
        ]}
      />
    </Box>
  )
}