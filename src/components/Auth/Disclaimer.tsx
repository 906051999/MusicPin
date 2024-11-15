'use client'

import { useState, useEffect } from 'react'
import { Modal, Text, Button, Group, Stack, Container, Box } from '@mantine/core'
import { useAuthStore } from '@/stores/authStore'

// Add props interface
interface DisclaimerProps {
  opened: boolean;
  onClose: () => void;
}

// Update component to accept props
export function Disclaimer({ opened: externalOpened, onClose }: DisclaimerProps) {
  const { disclaimer, setAuth } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [isManualShow, setIsManualShow] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !disclaimer) {
      setCountdown(5)
    }
  }, [mounted, disclaimer])

  useEffect(() => {
    const handleShowDisclaimer = () => {
      onClose()
      setIsManualShow(true)
    }

    window.addEventListener('showDisclaimer', handleShowDisclaimer)
    return () => window.removeEventListener('showDisclaimer', handleShowDisclaimer)
  }, [disclaimer])

  useEffect(() => {
    if (externalOpened && countdown > 0 && !isManualShow) {
      const timer = setInterval(() => setCountdown(c => c - 1), 1000)
      return () => clearInterval(timer)
    }
    if (countdown === 0 && !isManualShow) handleAgree()
  }, [countdown, externalOpened, isManualShow])

  const handleAgree = () => {
    setAuth('disclaimer', true)
    onClose()
    setCountdown(5)
    setIsManualShow(false)
  }

  const handleDisagree = () => {
    setAuth('disclaimer', false)
    onClose()
    setCountdown(5)
    setIsManualShow(false)
  }

  const handleTemporaryLeave = () => {
    setAuth('disclaimer', false)
    onClose()
  }

  if (!mounted) return null

  return (
    <Modal
      opened={externalOpened}
      onClose={() => disclaimer && onClose()}
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
              "音乐海（MusicPin，以下简称本站）仅供音乐爱好者交流分享使用，本站不提供音乐存储、下载或商业服务。",
              "本站不对分享内容的来源、合法性、准确性负责，所有内容版权归原作者所有。",
              "点击同意即表示您已理解并接受：本站仅供个人学习研究使用，在使用过程中引发的任何问题，本站不承担任何责任。",
              "如不认同以上声明，本站暂不提供服务。",
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
            {disclaimer ? (
              <>
                <Button
                  onClick={handleTemporaryLeave}
                  size="md"
                  px="xl"
                  variant="light"
                  color="yellow"
                >
                  我想离开
                </Button>
                <Button
                  onClick={onClose}
                  size="md"
                  px="xl"
                  variant="light"
                  color="blue"
                >
                  已同意
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleDisagree}
                  size="md"
                  px="xl"
                  variant="light"
                  color="red"
                >
                  不同意
                </Button>
                <Button
                  onClick={handleAgree}
                  disabled={countdown > 0 && !isManualShow}
                  size="md"
                  px="xl"
                  variant="light"
                  color="blue"
                >
                  同意 {countdown > 0 && !isManualShow ? `(${countdown})` : ''}
                </Button>
              </>
            )}
          </Group>
        </Box>
      </Box>
    </Modal>
  )
}