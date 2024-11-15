import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'

interface AuthState {
  disclaimer: boolean
  api: boolean
  user: boolean
  session: any | null
  setAuth: (type: 'disclaimer' | 'api' | 'user', value: boolean) => void
  requestApiAuth: () => Promise<boolean>
  setSession: (session: any) => void
  init: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      disclaimer: false,
      api: false,
      user: false,
      session: null,
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
      },
      setSession: (session) => set({ session }),
      init: async () => {
        const { data: { session } } = await supabase.auth.getSession()
        set({ session, user: !!session })
        
        supabase.auth.onAuthStateChange((_event, session) => {
          set({ session, user: !!session })
        })
      }
    }),
    {
      name: 'auth-storage',
    }
  )
)

if (typeof window !== 'undefined') {
  useAuthStore.getState().init()
} 