'use client'

import { Modal, Stack, Text, Avatar, Group, Button } from '@mantine/core'
import { useAuthStore } from '@/stores/authStore'
import { IconMail, IconBrandGithub, IconLogout, IconId, IconUser, IconUserCircle, IconShield, IconCircleCheck, IconCircleX } from '@tabler/icons-react'
import { supabase } from '@/lib/supabase'
import { notifications } from '@mantine/notifications'
import { useSession, signOut } from 'next-auth/react'
import { normalizeUserData } from '@/lib/utils/userDataAdapter'

interface UserProfileProps {
  opened: boolean
  onClose: () => void
}

const TRUST_LEVELS = {
  0: '访客',
  1: '新手',
  2: '活跃用户', 
  3: '资深用户',
  4: '社区领袖'
} as const

const AUTH_PROVIDERS = {
  email: {
    icon: IconMail,
    label: '邮箱登录'
  },
  github: {
    icon: IconBrandGithub,
    label: 'GitHub'
  },
  linuxdo: {
    icon: IconId,
    label: 'Linux.do'
  }
} as const

export function UserProfile({ opened, onClose }: UserProfileProps) {
  const { session } = useAuthStore()
  const { data: nextAuthSession } = useSession()
  
  const rawUser = session?.user || nextAuthSession?.user
  const userData = rawUser ? normalizeUserData(
    rawUser, 
    session ? 'supabase' : 'nextauth'
  ) : null
  
  const authProvider = userData?.app_metadata?.provider
  const AuthProviderIcon = authProvider ? AUTH_PROVIDERS[authProvider]?.icon : null

  const handleLogout = async () => {
    if (session) {
      await supabase.auth.signOut()
    } else if (nextAuthSession) {
      await signOut()
    }
    
    notifications.show({
      title: '已登出',
      message: '期待您的下次登录',
      color: 'blue'
    })
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="用户资料" size="sm">
      <Stack>
        <Group justify="center">
          <Avatar 
            size="xl" 
            src={userData?.user_metadata?.avatar_url} 
            radius=""
          />
        </Group>

        {authProvider && AUTH_PROVIDERS[authProvider] && (
          <Group justify="center">
            <AuthProviderIcon size={16} />
            <Text size="sm" c="dimmed">
              通过{AUTH_PROVIDERS[authProvider].label}认证
            </Text>
          </Group>
        )}
        
        <Stack gap="xs">
          {userData?.user_metadata?.username && (
            <Group>
              <IconUser size={16} />
              <Text size="sm">用户名: {userData.user_metadata.username}</Text>
            </Group>
          )}

          {userData?.user_metadata?.name && (
            <Group>
              <IconUserCircle size={16} />
              <Text size="sm">昵称: {userData.user_metadata.name}</Text>
            </Group>
          )}

          {userData?.email && (
            <Group>
              <IconMail size={16} />
              <Text size="sm">邮箱: {userData.email}</Text>
            </Group>
          )}

          {userData?.user_metadata?.trust_level !== undefined && (
            <Group>
              <IconShield size={16} />
              <Text size="sm">
                信任等级: Lv.{userData.user_metadata.trust_level} - {TRUST_LEVELS[userData.user_metadata.trust_level as keyof typeof TRUST_LEVELS]}
              </Text>
            </Group>
          )}

          {userData?.user_metadata?.active !== undefined && (
            <Group>
              <IconCircleCheck size={16} color={userData.user_metadata.active ? 'green' : 'gray'} />
              <Text size="sm">账号状态: {userData.user_metadata.active ? '活跃' : '未激活'}</Text>
            </Group>
          )}

          {userData?.user_metadata?.silenced && (
            <Group>
              <IconCircleX size={16} color="red" />
              <Text size="sm" c="red">账号已被禁言</Text>
            </Group>
          )}
        </Stack>

        <Button 
          variant="light" 
          color="red" 
          leftSection={<IconLogout size={14} />}
          onClick={handleLogout}
          mt="md"
        >
          登出
        </Button>
      </Stack>
    </Modal>
  )
} 