'use client'

import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1
    }
  }
})

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <Notifications position="top-right" />
        {children}
      </MantineProvider>
    </QueryClientProvider>
  )
} 