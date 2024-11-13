'use client'

import { useEffect, useState } from 'react'
import { Box, Paper, Text } from '@mantine/core'
import styles from './MusicOcean.module.css'
import { MusicBubble } from '../MusicBubble/MusicBubble'

interface MusicBubble {
  id: string
  song: string
  artist: string
  comment: string
}

const testBubbles: MusicBubble[] = [
  {
    id: '1',
    song: '海阔天空',
    artist: "Beyond",
    comment: '香港摇滚乐的巅峰之作,以热血的旋律和真挚的歌词传递永不言弃的精神'
  },
  {
    id: '2', 
    song: '夜曲',
    artist: '周杰伦',
    comment: '以爵士钢琴和中国风元素,谱写都市夜色中的浪漫故事'
  },
  {
    id: '3',
    song: 'Bohemian Rhapsody',
    artist: 'Queen',
    comment: '摇滚史上的不朽杰作,以歌剧式的编曲和戏剧性的结构展现音乐的无限可能'
  },
  {
    id: '4',
    song: '天龙八部之宿命',
    artist: '许嵩',
    comment: '中国风与流行音乐的完美结合,以古韵新声演绎武侠世界的江湖情'
  },
  {
    id: '5',
    song: 'Hotel California',
    artist: 'Eagles',
    comment: '美国乡村摇滚的经典之作,以隽永的吉他独奏讲述加州旅馆的迷离故事'
  },
  {
    id: '6',
    song: '千の風になって',
    artist: '秋川雅史',
    comment: '日本演歌与古典的交融,以空灵的男高音诠释生命与永恒的哲思'
  },
  {
    id: '7',
    song: '红豆',
    artist: '王菲',
    comment: '粤语歌后的代表作,以空灵的嗓音和诗意的词句描绘相思之情'
  },
  {
    id: '8',
    song: 'TSUNAMI',
    artist: 'サザンオールスターズ',
    comment: '日本国民乐团的经典金曲,以热情的旋律唱出夏日海边的青春回忆'
  }
]

export function MusicOcean() {
  const [mounted, setMounted] = useState(false)
  const [bubbles, setBubbles] = useState<MusicBubble[]>([])

  useEffect(() => {
    setMounted(true)
    setBubbles(testBubbles)
  }, [])

  if (!mounted) return null

  return (
    <Box className={styles.ocean}>
      <div className={styles.bubblesGrid}>
        {bubbles.map((bubble) => (
          <MusicBubble
            key={bubble.id}
            song={bubble.song}
            artist={bubble.artist} 
            comment={bubble.comment}
          />
        ))}
      </div>
    </Box>
  )
} 