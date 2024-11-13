'use client'

import { Container, Stack, Title, Text, Button } from '@mantine/core'
import { IconAlertTriangle } from '@tabler/icons-react'

export function NoAccess() {
  const handleShowDisclaimer = () => {
    window.dispatchEvent(new CustomEvent('showDisclaimer'))
  }

  return (
    <Container size="lg" py={100}>
      <Stack align="center" gap={50}>
        <IconAlertTriangle 
          size={64} 
          color="var(--mantine-color-blue-4)" 
          opacity={0.8} 
          stroke={1.2} 
        />
        
        <Title order={1} 
          fz={{ base: 32, sm: 56 }} 
          ta="center" 
          px={{ base: 10, sm: 0 }} 
          style={{
            background: 'linear-gradient(135deg, var(--mantine-color-cyan-4), var(--mantine-color-blue-6))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: { base: '0.05em', sm: '0.08em' }, 
            textShadow: '0 2px 15px rgba(0,0,0,0.1)',
            lineHeight: { base: 1.2, sm: 1.4 } 
          }}
        >
          MusicPin | 音乐海
        </Title>

        <Text 
          c="dimmed" 
          ta="center" 
          maw={{ base: '100%', sm: 720 }} 
          fz={{ base: '0.95rem', sm: '1.1rem' }}
          lh={{ base: 1.8, sm: 2.2 }} 
          px={{ base: 20, sm: 20 }}
          style={(theme) => ({ 
            letterSpacing: { base: '0.02em', sm: '0.03em' },
            whiteSpace: 'pre-line',
            '& br': {
              content: '""',
              display: 'block',
              marginBottom: { base: '0.8em', sm: '1em' }
            }
          })}
        >
          欢迎来到这片充满音符的海域，<br />
          这里有来自世界各地水手们带来的珍藏。<br />
          我们是一群热爱音乐的寻宝者，<br />
          用分享的方式让美好永续流传。<br />
          <br />
          但请记住，<br />
          这片海域虽然自由，却也有它的规矩：<br />
          <Text component="span" fw={500} c="blue.6">不做无度索取的海盗，</Text><br />
          <Text component="span" fw={500} c="blue.6">不当散布病毒的黑帆，</Text><br />
          <Text component="span" fw={500} c="blue.6">更不要把这些音乐明珠变成你的摇钱树。</Text><br />
          <br />
          愿你能在这里找到心仪的音乐，<br />
          也请帮忙守护这片纯净的港湾。<br />
          <br />
          这里不是商业码头，<br />
          而是音乐爱好者的桃花源。
        </Text>

        <Button 
          variant="gradient" 
          gradient={{ from: 'cyan.4', to: 'blue.6', deg: 135 }}
          size="lg"
          px={{ base: 20, sm: 60 }}
          fz={{ base: '1rem', sm: '1.15rem' }}
          onClick={handleShowDisclaimer}
          style={{ 
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            letterSpacing: '0.05em',
            fontWeight: 500,
            '&:hover': { 
              transform: 'translateY(-2px) scale(1.02)',
              boxShadow: '0 8px 20px -5px rgba(0,0,0,0.15)'
            }
          }}
        >
          启航须知
        </Button>
      </Stack>
    </Container>
  )
} 