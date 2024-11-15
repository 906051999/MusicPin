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
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error'
  setSyncStatus: (status: 'idle' | 'syncing' | 'synced' | 'error') => void
  resetSyncStatus: () => void
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
      },
      syncStatus: 'idle',
      setSyncStatus: (status) => set({ syncStatus: status }),
      resetSyncStatus: () => {
        const currentStatus = get().syncStatus
        if (currentStatus === 'syncing') {
          set({ syncStatus: 'error' })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        disclaimer: state.disclaimer,
        api: state.api,
        user: state.user,
        syncStatus: state.syncStatus
      })
    }
  )
)

if (typeof window !== 'undefined') {
  useAuthStore.getState().init()
} 