'use client'

import { Disclaimer } from '@/components/Auth/Disclaimer'
import { ApiConsent } from '@/components/Auth/ApiConsent'
import { AuthStatus } from '@/components/Auth/AuthStatus'
import { useAuthStore } from '@/stores/authStore'
import { useEffect, useState } from 'react'
import { UserAuth } from '@/components/Auth/UserAuth'

// 定义自定义事件类型
declare global {
  interface WindowEventMap {
    'requestApiAuth': CustomEvent<{
      onSuccess?: () => void;
      onCancel?: () => void;
    }>;
    'showApiConsent': CustomEvent;
    'showDisclaimer': CustomEvent;
    'showUserAuth': CustomEvent;
  }
}

export function AuthManager() {
  const { api, setAuth, disclaimer } = useAuthStore()
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [showApiConsent, setShowApiConsent] = useState(false)
  const [isInitialCheck, setIsInitialCheck] = useState(true)
  const [pendingCallback, setPendingCallback] = useState<{
    onSuccess?: () => void;
    onCancel?: () => void;
  }>({})
  const [showUserAuth, setShowUserAuth] = useState(false)

  useEffect(() => {
    const handleShowDisclaimer = () => setShowDisclaimer(true)
    const handleShowApiConsent = () => setShowApiConsent(true)
    const handleShowUserAuth = () => setShowUserAuth(true)
    const handleApiAuthRequest = (event: CustomEvent<{
      onSuccess?: () => void;
      onCancel?: () => void;
    }>) => {
      setShowApiConsent(true)
      setPendingCallback({
        onSuccess: event.detail.onSuccess,
        onCancel: event.detail.onCancel
      })
    }

    window.addEventListener('showDisclaimer', handleShowDisclaimer)
    window.addEventListener('showApiConsent', handleShowApiConsent)
    window.addEventListener('showUserAuth', handleShowUserAuth)
    window.addEventListener('requestApiAuth', handleApiAuthRequest)
    
    return () => {
      window.removeEventListener('showDisclaimer', handleShowDisclaimer)
      window.removeEventListener('showApiConsent', handleShowApiConsent)
      window.removeEventListener('showUserAuth', handleShowUserAuth)
      window.removeEventListener('requestApiAuth', handleApiAuthRequest)
    }
  }, [])

  // 默认显示免责声明，暂不启用
  // useEffect(() => {
  //   if (isInitialCheck && !disclaimer) {
  //     setShowDisclaimer(true)
  //   }
  //   setIsInitialCheck(false)
  // }, [])

  const handleApiConsent = (agreed: boolean) => {
    setShowApiConsent(false)
    if (agreed) {
      setAuth('api', true)
      pendingCallback.onSuccess?.()
    } else {
      if (!api) {
        setAuth('api', false)
        pendingCallback.onCancel?.()
      }
    }
    setPendingCallback({})
  }

  return (
    <>
      <Disclaimer opened={showDisclaimer} onClose={() => setShowDisclaimer(false)} />
      {disclaimer && <AuthStatus />}
      {showApiConsent && (
        <ApiConsent 
          onAgree={() => handleApiConsent(true)}
          onCancel={() => handleApiConsent(false)}
          readOnly={api}
        />
      )}
      {showUserAuth && (
        <UserAuth onClose={() => setShowUserAuth(false)} />
      )}
    </>
  )
} 