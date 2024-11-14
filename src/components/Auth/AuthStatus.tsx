'use client'

import { Group, Stack, Text, Tooltip } from '@mantine/core'
import { useAuthStore } from '@/stores/authStore'
import { 
  IconFileDescription, 
  IconSearch, 
  IconUser,
  IconCircleCheck,
  IconCircleX
} from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import { UserProfile } from './UserProfile'
import { useSession } from 'next-auth/react'

type StatusItem = {
  key: 'disclaimer' | 'api' | 'user'
  icon: typeof IconFileDescription
  label: string
  description: string
  agreed: boolean
  menu?: boolean
}

export function AuthStatus() {
  const { disclaimer, api, user, setAuth } = useAuthStore()
  const { data: session } = useSession()
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    setAuth('user', !!session?.user)
  }, [session, setAuth])

  const handleClick = async (type: 'disclaimer' | 'api' | 'user') => {
    switch (type) {
      case 'disclaimer':
        window.dispatchEvent(new CustomEvent('showDisclaimer'))
        break
      case 'api':
        if (api) {
          window.dispatchEvent(new CustomEvent('showApiConsent'))
        } else {
          await requestApiAuth()
        }
        break
      case 'user':
        if (!user) {
          window.dispatchEvent(new CustomEvent('showUserAuth'))
        } else {
          setShowProfile(true)
        }
        break
    }
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
      description: user ? `已登录: ${session?.user?.name}` : '点击登录',
      agreed: user,
      menu: user
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
                onClick={() => status.menu ? setShowProfile(true) : handleClick(status.key as 'disclaimer' | 'api' | 'user')}
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
          <status.icon size={16} />
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