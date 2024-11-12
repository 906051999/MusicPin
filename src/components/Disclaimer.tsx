'use client'

import { useState, useEffect } from 'react'
import { Modal, Text, Button, Group, Stack, Container, Box } from '@mantine/core'
import Cookies from 'js-cookie'

export function Disclaimer() {
  const [mounted, setMounted] = useState(false)
  const [opened, setOpened] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    setMounted(true)
    setAgreed(!!Cookies.get('disclaimer-agreed'))
  }, [])

  useEffect(() => {
    if (!agreed && mounted) {
      setOpened(true)
      setCountdown(3)
    }
  }, [agreed, mounted])

  useEffect(() => {
    if (opened && !agreed && countdown > 0) {
      const timer = setInterval(() => setCountdown(c => c - 1), 1000)
      return () => clearInterval(timer)
    }
    if (countdown === 0 && !agreed) handleAgree()
  }, [countdown, opened, agreed])

  const handleAgree = () => {
    Cookies.set('disclaimer-agreed', 'true', { expires: 7 })
    setAgreed(true)
    setOpened(false)
    setCountdown(3)
  }

  if (!mounted) return null

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => agreed && setOpened(false)}
        closeOnClickOutside={agreed}
        withCloseButton={false}
        size="lg"
        radius="md"
        padding={0}
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        <Box>
          {/* 标题区域 - 改用更柔和的背景色 */}
          <Box bg="gray.2" py="xl" ta="center">
            <Text size="xl" fw={700} c="dark.7">免责声明</Text>
          </Box>

          {/* 内容区域 */}
          <Container size="md" py="xl">
            <Stack gap="md">
              {[
                "本站仅作为音乐交流平台使用，不提供音乐存储、下载或付费服务。",
                "本站不对展示内容的来源、合法性、准确性负责，所有内容版权归版权方所有。",
                "使用本站即表示您已理解并接受：本站仅供技术研究，因使用本站引发的法律纠纷，开发人员不承担责任。",
                "如不同意以上声明，请立即停止使用本站。",
                "请支持正版音乐，尊重知识产权。"
              ].map((text, index) => (
                <Text
                  key={index}
                  size="sm"
                  c={index === 2 ? 'red.5' : 'dark.5'} // 调整文字颜色
                  fw={index === 2 ? 500 : 400}
                >
                  {index + 1}. {text}
                </Text>
              ))}
            </Stack>
          </Container>

          {/* 项目信息区域 - 稍微调亮背景色 */}
          <Box bg="gray.0" py="xl">
            <Stack align="center" gap="xs">
              <Text size="sm" fw={500} c="dark.5">MusicPin | 音乐海</Text>
              <Text size="sm" c="dark.5">
                GitHub:{' '}
                <Text
                  component="a"
                  href="https://github.com/MindMorbius/MusicPin"
                  target="_blank"
                  rel="noopener noreferrer"
                  c="blue.5"
                  td="underline"
                >
                  MindMorbius/MusicPin
                </Text>
              </Text>
            </Stack>
          </Box>

          {/* 按钮区域 - 改用更柔和的背景色 */}
          <Box bg="gray.2" py="xl">
            <Group justify="center">
              <Button
                onClick={handleAgree}
                disabled={!agreed && countdown > 0}
                size="md"
                px="xl"
                variant="light" // 改用 light 变体
                color="blue" // 使用蓝色主题
              >
                同意 ({!agreed && countdown > 0 ? countdown : '确认'})
              </Button>
            </Group>
          </Box>
        </Box>
      </Modal>

      {agreed && (
        <Group pos="fixed" top={16} right={16} style={{ zIndex: 50 }} gap="xs">
          <Stack 
            align="center" 
            gap={2} 
            style={{ cursor: 'pointer', opacity:0.8 }}
            onClick={() => setOpened(true)}
          >
            <Text size="15px" fw={500}>MusicPin</Text>
            <Text size="10px" c="dimmed">已同意免责声明</Text>
          </Stack>
        </Group>
      )}
    </>
  )
}