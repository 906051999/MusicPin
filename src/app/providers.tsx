'use client'

import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import { SessionProvider } from 'next-auth/react'
import { useState } from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        retry: 1
      }
    }
  }))

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <Notifications position="top-right" />
          {children}
        </MantineProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
} 