'use client'

import { Modal, Stack, Text, Avatar, Group, Button } from '@mantine/core'
import { useAuthStore } from '@/stores/authStore'
import { IconMail, IconBrandGithub, IconLogout } from '@tabler/icons-react'
import { supabase } from '@/lib/supabase'
import { notifications } from '@mantine/notifications'

interface UserProfileProps {
  opened: boolean
  onClose: () => void
}

export function UserProfile({ opened, onClose }: UserProfileProps) {
  const { session } = useAuthStore()
  const user = session?.user

  const handleLogout = async () => {
    await supabase.auth.signOut()
    notifications.show({
      title: '已登出',
      message: '期待您的下次登录',
      color: 'blue'
    })
    onClose()
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="用户资料"
      size="sm"
    >
      <Stack>
        <Group justify="center">
          <Avatar 
            size="xl" 
            src={user?.user_metadata?.avatar_url} 
            radius="xl"
          />
        </Group>
        
        <Stack gap="xs">
          <Group>
            <IconMail size={16} />
            <Text size="sm">{user?.email}</Text>
          </Group>
          
          {user?.app_metadata?.provider === 'github' && (
            <Group>
              <IconBrandGithub size={16} />
              <Text size="sm">{user?.user_metadata?.user_name}</Text>
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