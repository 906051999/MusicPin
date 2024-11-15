'use client'

import { Group, Stack, Text, Tooltip } from '@mantine/core'
import { useAuthStore } from '@/stores/authStore'
import { 
  IconFileDescription, 
  IconSearch, 
  IconUser,
  IconCircleCheck,
  IconCircleX,
  IconDatabase,
} from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import { UserProfile } from './UserProfile'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import { notifications } from '@mantine/notifications'

type StatusItem = {
  key: 'disclaimer' | 'api' | 'user' | 'database'
  icon: typeof IconFileDescription
  label: string
  description: string
  agreed: boolean
  menu?: boolean
  syncStatus?: 'idle' | 'syncing' | 'synced' | 'error'
}

export function AuthStatus() {
  const { disclaimer, api, user, syncStatus, setAuth } = useAuthStore()
  const { data: nextAuthSession } = useSession()
  const [showProfile, setShowProfile] = useState(false)
  const [dbStatus, setDbStatus] = useState<{
    browser: boolean
    server: boolean
  }>({ browser: false, server: false })

  useEffect(() => {
    setAuth('user', !!nextAuthSession?.user)
  }, [nextAuthSession, setAuth])

  const handleClick = async (type: 'disclaimer' | 'api' | 'user' | 'database') => {
    switch (type) {
      case 'disclaimer':
        window.dispatchEvent(new CustomEvent('showDisclaimer'))
        break
      case 'api':
        if (api) {
          window.dispatchEvent(new CustomEvent('showApiConsent'))
        } else {
          window.dispatchEvent(new CustomEvent('showApiConsent'))
        }
        break
      case 'user':
        if (!user) {
          window.dispatchEvent(new CustomEvent('showUserAuth'))
        } else {
          setShowProfile(true)
        }
        break
      case 'database':
        await checkDbConnection()
        break
    }
  }

  const checkDbConnection = async () => {
    // 重置状态
    setDbStatus({ browser: false, server: false })

    // 浏览器直接访问 Supabase
    try {
      const clientStart = Date.now()
      const { data, error } = await supabase.rpc('check_db_health')
      const clientLatency = Date.now() - clientStart
      if (error) throw error

      const clientTimeDiff = Math.abs(Date.now() - data.timestamp)
      notifications.show({
        title: '浏览器 -> Supabase',
        message: [
          `RPC延迟: ${clientLatency}ms`,
          `时差: ${formatTimeDiff(clientTimeDiff)}`,
        ].join('\n'),
        color: 'green',
        style: { whiteSpace: 'pre-line' },
        autoClose: 3000
      })
      setDbStatus(prev => ({ ...prev, browser: true }))
    } catch (error) {
      notifications.show({
        title: '浏览器连接异常',
        message: error instanceof Error ? error.message : '未知错误',
        color: 'red',
        autoClose: 3000
      })
    }

    // 通过服务器访问 Supabase
    try {
      const result = await fetch('/api/check-db-health').then(res => res.json())
      if (result.error) throw new Error(result.error)

      const serverTimeDiff = Math.abs(Date.now() - result.timestamp)
      notifications.show({
        title: '服务器 -> Supabase',
        message: [
          `直接访问延迟: ${result.serverMetrics.directLatency}ms`,
          `RPC延迟: ${result.serverMetrics.rpcLatency}ms`,
          `时差: ${formatTimeDiff(serverTimeDiff)}`,
        ].join('\n'),
        color: 'green',
        style: { whiteSpace: 'pre-line' },
        autoClose: 3000
      })
      setDbStatus(prev => ({ ...prev, server: true }))
    } catch (error) {
      notifications.show({
        title: '服务器连接异常',
        message: error instanceof Error ? error.message : '未知错误',
        color: 'red',
        autoClose: 3000
      })
      setDbStatus(prev => ({ ...prev, server: false }))
    }
  }

  const formatTimeDiff = (diff: number) => {
    return diff > 1000 
      ? `${(diff / 1000).toFixed(2)}s`
      : `${Math.round(diff)}ms`
  }

  const getUserDescription = () => {
    if (!user) return '点击登录'
    
    const userName = nextAuthSession?.user?.name
    // 检查是否是 Linux.do 用户
    const isLinuxDoUser = nextAuthSession?.user?.linuxdoId

    if (!isLinuxDoUser) {
      return `已登录: ${userName}`
    }

    return `已登录: ${userName} (${
      syncStatus === 'synced' ? '已同步' : 
      syncStatus === 'syncing' ? '同步中' : 
      syncStatus === 'error' ? '同步失败' :
      '未同步'
    })`
  }

  const statuses: StatusItem[] = [
    {
      key: 'disclaimer',
      icon: IconFileDescription,
      label: '',
      description: disclaimer ? '已同意免责声明' : '点击同意免责声明',
      agreed: disclaimer
    },
    {
      key: 'api',
      icon: IconSearch,
      label: '',
      description: api ? '已授权搜索功能' : '点击授权搜索功能',
      agreed: api
    },
    {
      key: 'user',
      icon: IconUser,
      label: '',
      description: getUserDescription(),
      agreed: user,
      menu: user,
      syncStatus: nextAuthSession?.user?.linuxdoId ? syncStatus : undefined
    },
    {
      key: 'database',
      icon: IconDatabase,
      label: '',
      description: getDbStatusDescription(dbStatus),
      agreed: dbStatus.browser && dbStatus.server
    }
  ]

  return (
    <>
      <Group pos="fixed" top={16} right={16} style={{ zIndex: 50 }}>
        <Stack 
          p="xs" 
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          gap="xs"
        >
          <Text size="15px" fw={500} ta="center">MusicPin</Text>
          <Group gap="md">
            {statuses.map(status => (
              <StatusIcon 
                key={status.key}
                status={status} 
                onClick={() => status.menu ? setShowProfile(true) : handleClick(status.key as 'disclaimer' | 'api' | 'user' | 'database')}
              />
            ))}
          </Group>
        </Stack>
      </Group>
      <UserProfile 
        opened={showProfile} 
        onClose={() => setShowProfile(false)} 
      />
    </>
  )
}

function StatusIcon({ status, onClick }: { 
  status: StatusItem, 
  onClick: () => void 
}) {
  const getStatusColor = () => {
    if (status.key === 'database') {
      const dbStatus = status.description
      if (dbStatus === '数据库连接正常') return 'var(--mantine-color-green-6)'
      if (dbStatus === '仅浏览器连接正常' || dbStatus === '仅服务器连接正常') return 'var(--mantine-color-yellow-6)'
      return 'var(--mantine-color-gray-6)'
    }
    if (status.key === 'user' && status.agreed && status.syncStatus) {
      switch(status.syncStatus) {
        case 'synced':
          return 'var(--mantine-color-green-6)'
        case 'syncing':
          return 'var(--mantine-color-yellow-6)'
        case 'error':
          return 'var(--mantine-color-red-6)'
        default:
          return 'var(--mantine-color-gray-6)'
      }
    }
    return 'var(--mantine-color-gray-6)'
  }

  return (
    <Tooltip
      label={status.description}
      position="bottom"
      withArrow
    >
      <Stack 
        align="center" 
        gap={4}
        style={{ cursor: 'pointer', opacity: 0.8 }}
        onClick={onClick}
      >
        <Group gap={4}>
          <status.icon size={16} color={getStatusColor()} />
          {status.agreed ? (
            <IconCircleCheck size={14} color="var(--mantine-color-green-6)" />
          ) : (
            <IconCircleX size={14} color="var(--mantine-color-gray-6)" />
          )}
        </Group>
        <Text size="10px" c="dimmed">
          {status.label}
        </Text>
      </Stack>
    </Tooltip>
  )
}

function getDbStatusDescription(status: { browser: boolean; server: boolean }) {
  if (status.browser && status.server) return '数据库连接正常'
  if (status.browser) return '仅浏览器连接正常'
  if (status.server) return '仅服务器连接正常'
  return '点击测试数据库连接'
} 