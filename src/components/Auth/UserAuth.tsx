'use client'

import { Modal } from '@mantine/core'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useState } from 'react'
import { UserProfile } from './UserProfile'
import { authLocalization } from '@/lib/localization/auth'

interface UserAuthProps {
  onClose: () => void
}

export function UserAuth({ onClose }: UserAuthProps) {
  const { setAuth } = useAuthStore()
  const [showProfile, setShowProfile] = useState(false)

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      setAuth('user', true)
      onClose()
      setShowProfile(true)
    }
  })

  return (
    <>
      <Modal
        opened={true}
        onClose={onClose}
        title="认证"
        size="sm"
      >
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
              },
            },
          }}
          localization={authLocalization}
          providers={['github']}
          view="sign_in"
        />
      </Modal>
      <UserProfile 
        opened={showProfile} 
        onClose={() => setShowProfile(false)} 
      />
    </>
  )
} 