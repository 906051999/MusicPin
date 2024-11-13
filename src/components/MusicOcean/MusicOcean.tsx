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
    comment: '黄家驹的嘶吼直击灵魂,那个时代香港摇滚最纯粹的呐喊。编曲层次分明,主歌副歌的情绪张力拿捏得恰到好处'
  },
  {
    id: '2',
    song: '音乐爱我',
    artist: '常石磊',
    comment: '编曲简约却不简单,钢琴和弦的进行充满戏剧性。副歌高潮部分的和声编排让人起鸡皮疙瘩'
  },
  {
    id: '3',
    song: 'Bohemian Rhapsody',
    artist: 'Queen',
    comment: '从歌剧到重金属再到钢琴叙事,Mercury把音乐体裁的跨界玩到了极致。中段吉他solo的音色设计简直是教科书级别'
  },
  {
    id: '4',
    song: 'Hey Jude',
    artist: 'The Beatles',
    comment: '最后那段na na na的大合唱编排天才,McCartney把简单的音符变成了最强的情感共鸣。管弦乐的加入时机堪称完美'
  },
  {
    id: '5',
    song: 'Hotel California',
    artist: 'Eagles',
    comment: '双吉他的对话绝了,Felder和Walsh的solo你来我往,把迷幻摇滚推向新高度。鼓手的动态控制也相当讲究'
  },
  {
    id: '6',
    song: '千の風になって',
    artist: '秋川雅史',
    comment: '高音区的气息控制令人叹为观止,泛音的运用恰到好处。那个转调的瞬间,整个编曲的层次瞬间被打开'
  },
  {
    id: '7',
    song: '红豆',
    artist: '王菲',
    comment: '王菲的转音技巧炉火纯青,气声的运用堪称教科书。编曲中若隐若现的古筝和弦乐完美衬托出歌词的诗意'
  },
  {
    id: '8',
    song: 'TSUNAMI',
    artist: 'サザンオールスターズ',
    comment: '桑田佳祐的编曲鬼才在此展露无遗,铜管配器华丽却不显浮夸。副歌前的转折和弦进行特别带感'
  },
  {
    id: '9', 
    song: 'Playing God',
    artist: 'Polyphia',
    comment: 'Tim Henson的指弹技巧炫技却不失音乐性,融合了trap和prog metal的编曲思路。主riff的节奏设计极具创意,和声进行充满现代感'
  },
  {
    id: '10',
    song: '爱在西元前',
    artist: '周杰伦',
    comment: '古典和中国风的完美结合,钢琴和琵琶的对话极具新意。副歌前的转调设计巧妙,弦乐编排层次分明'
  }
]

export function MusicOcean() {
  const [mounted, setMounted] = useState(false)
  const [bubbles, setBubbles] = useState<MusicBubble[]>([])

  useEffect(() => {
    setMounted(true)
    setBubbles(testBubbles)

    return () => {
      setMounted(false)
    }
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