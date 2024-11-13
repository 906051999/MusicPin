'use client'

import { useState } from 'react'
import { Modal, Text, Button, Group, Stack, Container, Box, Checkbox } from '@mantine/core'

interface ApiConsentProps {
  onAgree: () => void;
  onCancel: () => void;
  readOnly?: boolean;
}

export function ApiConsent({ onAgree, onCancel, readOnly = false }: ApiConsentProps) {
  const [checked, setChecked] = useState(false)

  return (
    <Modal
      opened={true}
      onClose={readOnly ? onCancel : () => {}}
      closeOnClickOutside={readOnly}
      withCloseButton={false}
      size="lg"
      radius="md"
      padding={0}
    >
      <Box>
        <Box bg="gray.2" py="xl" ta="center">
          <Text size="xl" fw={700} c="dark.7">搜索功能使用声明</Text>
        </Box>

        <Container size="md" py="xl">
          <Stack gap="md">
            {[
              "本站不提供搜索内容，用户自行操作使用搜索功能获取互联网公开数据，本站不对搜索行为负责。",
              "搜索结果来自第三方数据，本站不对搜索返回的内容进行任何处理或保证。",
              "使用搜索功能完全基于用户个人意愿，与本站无关，所有风险由用户自行承担。",
              "请遵守相关法律法规，禁止用于任何非法用途。"
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
            {!readOnly && (
              <Checkbox
                mt="md"
                checked={checked}
                onChange={(e) => setChecked(e.currentTarget.checked)}
                label="我已阅读并同意上述声明"
              />
            )}
          </Stack>
        </Container>

        <Box bg="gray.0" py="xl">
          <Stack align="center" gap="xs">
            <Text size="sm" c="dark.5">
              如不同意，仍可以使用其他功能
            </Text>
          </Stack>
        </Box>

        <Box bg="gray.2" py="xl">
          <Group justify="center" gap="md">
            {!readOnly && (
              <Button
                variant="subtle"
                color="gray"
                onClick={onCancel}
              >
                暂不使用
              </Button>
            )}
            <Button
              onClick={onAgree}
              disabled={!readOnly && !checked}
              variant="light"
              color="blue"
            >
              {readOnly ? '已同意' : '同意并继续'}
            </Button>
          </Group>
        </Box>
      </Box>
    </Modal>
  )
} 