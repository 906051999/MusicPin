'use client'

import { useEffect, useState } from 'react'
import { Box, Paper, Text } from '@mantine/core'
import styles from './MusicOcean.module.css'

interface MusicBubble {
  id: string
  song: string
  artist: string
  comment: string
}

const testBubbles: MusicBubble[] = [
  {
    id: '1',
    song: '夜の向日葵',
    artist: "world's end girlfriend",
    comment: '后摇滚与现代古典的完美融合,以实验电子和弦乐编织出超现实主义的声音景观'
  },
  {
    id: '2', 
    song: '浮雲',
    artist: '蒼山幸子',
    comment: '70年代日本民谣的隐藏瑰宝,以空灵的嗓音和极简吉他勾勒出禅意诗境'
  },
  {
    id: '3',
    song: 'Echoes',
    artist: 'Pink Floyd',
    comment: '23分钟的迷幻摇滚史诗,以实验性的音效和结构探索人类意识的深层空间'
  },
  {
    id: '4',
    song: '約束の夜',
    artist: '梶浦由記',
    comment: '以新古典主义配乐风格,构建出介于现实与幻想之间的音乐意境'
  },
  {
    id: '5',
    song: '天下無雙',
    artist: '陳奕迅',
    comment: '融合爵士与粤语流行,以复杂的和声编排展现都市人内心的矛盾与挣扎'
  },
  {
    id: '6',
    song: 'Tubular Bells',
    artist: 'Mike Oldfield',
    comment: '前卫摇滚的里程碑之作,19岁的天才用管钟声编织出超现实主义的音乐图景'
  },
  {
    id: '7',
    song: 'グランドエスケープ',
    artist: 'RADWIMPS',
    comment: '以史诗般的配器与细腻的情感表达,描绘了超越时空的浪漫与羁绊'
  }
]

export function MusicOcean() {
  const [bubbles, setBubbles] = useState<MusicBubble[]>([])

  useEffect(() => {
    setBubbles(testBubbles)
  }, [])

  return (
    <Box className={styles.ocean}>
      <div className={styles.bubblesGrid}>
        {bubbles.map((bubble) => (
          <Paper key={bubble.id} className={styles.bubble} radius="xl" p="md" withBorder>
            <Text fw={700}>{bubble.song}</Text>
            <Text size="sm" c="dimmed">{bubble.artist}</Text>
            <Text mt="xs" size="sm">{bubble.comment}</Text>
          </Paper>
        ))}
      </div>
    </Box>
  )
} 