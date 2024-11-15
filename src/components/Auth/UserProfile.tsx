'use client'

import { Modal, Stack, Text, Avatar, Group, Button } from '@mantine/core'
import { useAuthStore } from '@/stores/authStore'
import { IconMail, IconBrandGithub, IconLogout, IconId, IconUser, IconUserCircle, IconShield, IconCircleCheck, IconCircleX, IconSpy, IconCheck, IconAlertCircle, IconCloudOff } from '@tabler/icons-react'
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
  const { session, syncStatus, setSyncStatus } = useAuthStore()
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
      color: 'blue',
      autoClose: 1000
    })
    onClose()
  }

  const handleSync = async () => {
    if (!userData?.app_metadata?.provider?.includes('linuxdo')) {
      notifications.show({
        title: '无需同步',
        message: '只有 Linux.do 用户需要同步信息',
        color: 'blue'
      })
      return
    }

    setSyncStatus('syncing')
    
    const timeoutId = setTimeout(() => {
      setSyncStatus('error')
      notifications.show({
        title: '同步超时',
        message: '同步操作超时，请重试',
        color: 'red'
      })
    }, 10000) // 10秒超时

    try {
      const response = await fetch('/api/auth/sync', {
        method: 'POST',
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) throw new Error('Sync failed')
      
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Sync failed')
      }
      
      setSyncStatus('synced')
      notifications.show({
        title: '同步成功',
        message: '用户信息已更新',
        color: 'green'
      })
    } catch (error) {
      clearTimeout(timeoutId)
      console.error('Sync error:', error)
      setSyncStatus('error')
      notifications.show({
        title: '同步失败',
        message: error instanceof Error ? error.message : '请稍后重试',
        color: 'red'
      })
    }
  }

  const getSyncStatusIcon = () => {
    switch(syncStatus) {
      case 'syncing':
        return <IconSpy size={14} className="animate-spin" />
      case 'synced':
        return <IconCheck size={14} />
      case 'error':
        return <IconAlertCircle size={14} />
      default:
        return <IconCloudOff size={14} />
    }
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

        <Group justify="center">
          <IconBrandGithub size={16} />
          <Text size="sm" c="dimmed">
            通过{userData?.user_metadata?.provider === 'github' ? 'GitHub' : 'Linux.do'}认证
          </Text>
        </Group>
        
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
              <Text size="sm">
                邮箱: {userData.email}
                {userData.user_metadata.email_verified && (
                  <IconCircleCheck size={14} style={{ marginLeft: 4 }} color="green" />
                )}
              </Text>
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

        <Group justify="space-between" mt="md">
          <Button 
            variant="light" 
            color="red" 
            leftSection={<IconLogout size={14} />}
            onClick={handleLogout}
          >
            登出
          </Button>
          
          {userData?.user_metadata?.provider === 'linuxdo' && (
            <Button
              variant="light"
              color="blue"
              leftSection={getSyncStatusIcon()}
              onClick={handleSync}
              loading={syncStatus === 'syncing'}
              disabled={syncStatus === 'synced'}
            >
              {syncStatus === 'synced' ? '已同步' : syncStatus === 'syncing' ? '同步中' : '同步信息'}
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  )
} 