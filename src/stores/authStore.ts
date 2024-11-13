import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  disclaimer: boolean
  api: boolean
  user: boolean
  setAuth: (type: 'disclaimer' | 'api' | 'user', value: boolean) => void
  requestApiAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      disclaimer: false,
      api: false,
      user: false,
      setAuth: (type, value) => {
        set({ [type]: value })
      },
      requestApiAuth: () => {
        return new Promise<boolean>((resolve) => {
          if (get().api) {
            resolve(true)
            return
          }
          
          const event = new CustomEvent('requestApiAuth', {
            detail: {
              onSuccess: () => resolve(true),
              onCancel: () => resolve(false)
            }
          })
          window.dispatchEvent(event)
        })
      }
    }),
    {
      name: 'auth-storage',
    }
  )
) 