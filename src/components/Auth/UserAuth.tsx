'use client'

import { Modal, Stack, Button, Text, Divider } from '@mantine/core'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useState, useEffect } from 'react'
import { UserProfile } from './UserProfile'
import { authLocalization } from '@/lib/localization/auth'
import { signIn } from 'next-auth/react'
import { IconId } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useSession } from 'next-auth/react'

interface UserAuthProps {
  onClose: () => void
}

export function UserAuth({ onClose }: UserAuthProps) {
  const { setAuth } = useAuthStore()
  const [showProfile, setShowProfile] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user) {
      setAuth('user', true)
      onClose()
      setShowProfile(true)
    }
  }, [session, setAuth, onClose])

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      setAuth('user', true)
      onClose()
      setShowProfile(true)
    }
  })

  const handleLinuxDoLogin = async () => {
    try {
      console.log('Starting Linux.do login...')
      const result = await signIn('linuxdo', { 
        redirect: true,
        callbackUrl: `${window.location.origin}/`,
      })
      console.log('SignIn result:', result)
    } catch (error) {
      console.error('Login error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
      notifications.show({
        title: '登录失败',
        message: '认证服务器响应错误，请稍后重试',
        color: 'red'
      })
    }
  }

  return (
    <>
      <Modal
        opened={true}
        onClose={onClose}
        title="登录 MusicPin"
        size="sm"
        centered
      >
        <Stack gap="md">
          <Button
            onClick={handleLinuxDoLogin}
            variant="outline"
            fullWidth
            leftSection={<IconId size={16} color="#FFB003" />}
            h={45}
            color="#FFB003"
          >
            使用 Linux.do 登录
          </Button>

          <Divider
            label={<Text size="sm" c="dimmed">或者</Text>}
            labelPosition="center"
          />

          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#000000',
                    brandAccent: '#333333',
                  },
                  radii: {
                    borderRadiusButton: '4px',
                  },
                },
              },
              style: {
                button: {
                  height: '45px',
                },
                container: {
                  gap: '0',
                },
              },
            }}
            localization={{
              ...authLocalization,
              variables: {
                ...authLocalization.variables,
                sign_in: {
                  ...authLocalization.variables.sign_in,
                  social_provider_text: '使用{{provider}}登录'
                }
              }
            }}
            providers={['github']}
            view="sign_in"
            showLinks={false}
            magicLink={false}
            onlyThirdPartyProviders={true}
          />

        </Stack>
      </Modal>
      <UserProfile 
        opened={showProfile} 
        onClose={() => setShowProfile(false)} 
      />
    </>
  )
} 