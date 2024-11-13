'use client'

import { useState, useEffect } from 'react'
import { Modal, Text, Button, Group, Stack, Container, Box } from '@mantine/core'
import { useAuthStore } from '@/stores/authStore'

export function Disclaimer() {
  const { disclaimer, setAuth } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [opened, setOpened] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [isManualShow, setIsManualShow] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !disclaimer) {
      setOpened(true)
      setCountdown(5)
    }
  }, [mounted, disclaimer])

  useEffect(() => {
    const handleShowDisclaimer = () => {
      setOpened(true)
      setIsManualShow(true)
    }

    window.addEventListener('showDisclaimer', handleShowDisclaimer)
    return () => window.removeEventListener('showDisclaimer', handleShowDisclaimer)
  }, [disclaimer])

  useEffect(() => {
    if (opened && !disclaimer && countdown > 0 && !isManualShow) {
      const timer = setInterval(() => setCountdown(c => c - 1), 1000)
      return () => clearInterval(timer)
    }
    if (countdown === 0 && !disclaimer && !isManualShow) handleAgree()
  }, [countdown, opened, disclaimer, isManualShow])

  const handleAgree = () => {
    setAuth('disclaimer', true)
    setOpened(false)
    setCountdown(5)
    setIsManualShow(false)
  }

  const handleDisagree = () => {
    setAuth('disclaimer', false)
    setOpened(false)
    setCountdown(5)
    setIsManualShow(false)
  }

  if (!mounted) return null

  return (
    <Modal
      opened={opened}
      onClose={() => disclaimer && setOpened(false)}
      closeOnClickOutside={false}
      withCloseButton={false}
      closeOnEscape={false}
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
        <Box bg="gray.2" py="xl" ta="center">
          <Text size="xl" fw={700} c="dark.7">启航须知</Text>
        </Box>

        <Container size="md" py="xl">
          <Stack gap="md">
            {[
              "音乐海仅供音乐爱好者交流分享，不提供音乐存储、下载或商业服务。",
              "港务人员不对分享内容的来源、合法性、准确性负责，所有内容版权归原作者所有。",
              "扬帆启航即表示您已理解并接受：这里仅供技术研究，因使用本站引发的法律纠纷，港务人员不承担任何责任。",
              "如不认同以上约定，请即刻离港。",
              "请支持正版音乐创作，尊重知识产权。"
            ].map((text, index) => (
              <Text
                key={index}
                size="sm"
                c={index === 2 ? 'red.5' : 'dark.5'}
                fw={index === 2 ? 500 : 400}
              >
                {index + 1}. {text}
              </Text>
            ))}
          </Stack>
        </Container>

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

        <Box bg="gray.2" py="xl">
          <Group justify="center" gap="md">
            <Button
              onClick={handleDisagree}
              size="md"
              px="xl"
              variant="light"
              color="red"
            >
              离港
            </Button>
            <Button
              onClick={handleAgree}
              disabled={!disclaimer && countdown > 0 && !isManualShow}
              size="md"
              px="xl"
              variant="light"
              color="blue"
            >
              启航 {!disclaimer && countdown > 0 && !isManualShow ? `(${countdown})` : ''}
            </Button>
          </Group>
        </Box>
      </Box>
    </Modal>
  )
}