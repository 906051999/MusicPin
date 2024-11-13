'use client'

import { useState } from 'react'
import { Modal, Text, Button, Group, Stack, TextInput, PasswordInput } from '@mantine/core'
import { useAuthStore } from '@/stores/authStore'

export function UserAuth() {
  const { setAuth } = useAuthStore()
  const [isLogin, setIsLogin] = useState(true)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 这里添加实际的登录/注册逻辑
    setAuth('user', true)
  }

  return (
    <Modal
      opened={true}
      onClose={() => {}}
      title={isLogin ? "登录" : "注册"}
      size="sm"
    >
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            required
            label="用户名"
            placeholder="请输入用户名"
          />
          <PasswordInput
            required
            label="密码"
            placeholder="请输入密码"
          />
          
          <Button type="submit" fullWidth>
            {isLogin ? "登录" : "注册"}
          </Button>
          
          <Group justify="center">
            <Text size="sm" c="dimmed" style={{ cursor: 'pointer' }}
              onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "没有账号？点击注册" : "已有账号？点击登录"}
            </Text>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
} 