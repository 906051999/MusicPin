'use client'

import { Container, Stack, Title, Text, Button } from '@mantine/core'
import { IconAlertTriangle, IconMusicHeart, IconWash, IconStars, IconVinyl, IconMicrophone2, IconHeadphones } from '@tabler/icons-react'
import { motion } from 'framer-motion'

function FloatingElements() {
  const elements = [
    { Icon: IconMusicHeart, size: 24, color: 'var(--mantine-color-blue-4)', delay: 0 },
    { Icon: IconVinyl, size: 28, color: 'var(--mantine-color-cyan-4)', delay: 2 },
    { Icon: IconWash, size: 32, color: 'var(--mantine-color-blue-3)', delay: 1 },
    { Icon: IconStars, size: 20, color: 'var(--mantine-color-blue-4)', delay: 3 },
    { Icon: IconHeadphones, size: 24, color: 'var(--mantine-color-cyan-4)', delay: 4 },
    { Icon: IconMicrophone2, size: 24, color: 'var(--mantine-color-blue-4)', delay: 0 },
    { Icon: IconVinyl, size: 20, color: 'var(--mantine-color-cyan-4)', delay: 2 },
    { Icon: IconMusicHeart, size: 24, color: 'var(--mantine-color-blue-4)', delay: 0 },
    { Icon: IconHeadphones, size: 20, color: 'var(--mantine-color-cyan-4)', delay: 2 },
    { Icon: IconStars, size: 16, color: 'var(--mantine-color-blue-4)', delay: 0 },
    { Icon: IconWash, size: 28, color: 'var(--mantine-color-cyan-4)', delay: 2 },
  ]

  return (
    <>
      {elements.map((el, index) => (
        <motion.div
          key={index}
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.4,
          }}
          animate={{
            y: [-20, 20],
            x: [-10, 10],
            rotate: [0, 360],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: el.delay,
            ease: 'easeInOut',
          }}
        >
          <el.Icon size={el.size} color={el.color} />
        </motion.div>
      ))}
    </>
  )
}

export function NoAccess() {
  const handleShowDisclaimer = () => {
    window.dispatchEvent(new CustomEvent('showDisclaimer'))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(34,139,230,0.03) 0%, rgba(0,190,230,0.05) 100%)',
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(34,139,230,0.05) 0%, transparent 50%)',
          filter: 'blur(60px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <FloatingElements />
      <Container size="lg" py={100}>
        <Stack align="center" gap={50}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <IconAlertTriangle 
              size={64} 
              color="var(--mantine-color-blue-4)" 
              opacity={0.8} 
              stroke={1.2} 
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Title order={1} 
              fz={{ base: 32, sm: 56 }} 
              ta="center" 
              px={{ base: 10, sm: 0 }} 
              style={{
                background: 'linear-gradient(135deg, var(--mantine-color-cyan-4), var(--mantine-color-blue-6))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.05em',
                textShadow: '0 2px 15px rgba(0,0,0,0.1)',
                lineHeight: 1.3
              }}
            >
              MusicPin | 音乐海
            </Title>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Text 
              c="dimmed" 
              ta="center" 
              maw={{ base: '100%', sm: 720 }} 
              fz={{ base: '0.95rem', sm: '1.1rem' }}
              lh={{ base: 1.8, sm: 2.2 }} 
              px={{ base: 20, sm: 20 }}
              style={{ 
                letterSpacing: '0.02em',
                whiteSpace: 'pre-line',
                '& br': {
                  content: '""',
                  display: 'block',
                  marginBottom: '0.8em'
                }
              }}
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            whileHover={{ scale: 1.02, y: -2 }}
          >
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
              }}
            >
              启航须知
            </Button>
          </motion.div>
        </Stack>
      </Container>
    </motion.div>
  )
} 