 'use client'

import { SegmentedControl, Box } from '@mantine/core'
// 修改图标导入方式
import { IconWash, IconSearch } from '@tabler/icons-react'
import { useApp } from '@/contexts/AppContext'

export function LayoutToggle() {
  const { layout, setLayout } = useApp()
  
  return (
    <Box ta="center" mb="md">
      <SegmentedControl
        value={layout}
        onChange={(value: 'ocean' | 'search') => setLayout(value)}
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
        ]}
      />
    </Box>
  )
}