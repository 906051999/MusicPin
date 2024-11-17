'use client'

import { Container, Text } from '@mantine/core'
import { AppProvider } from '@/contexts/AppContext'
import { SearchBar } from '@/components/Search/SearchBar'
import { SearchResults } from '@/components/Search/SearchResults'
import { LayoutToggle } from '@/components/LayoutToggle'
import { useApp } from '@/contexts/AppContext'
import { AuthManager } from '@/components/AuthManager'
import { useAuthStore } from '@/stores/authStore'
import { MusicOcean } from '@/components/MusicOcean/MusicOcean'
import { NoAccess } from '@/components/Auth/NoAccess'
import { ChatLayout } from '@/components/Chat/ChatLayout'

function MainContent() {
  const { layout } = useApp()
  const { disclaimer } = useAuthStore()
  
  if (!disclaimer) {
    return (
      <>
        <AuthManager />
        <NoAccess />
      </>
    )
  }
  
  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      overflow: 'auto',
      gap: '1rem'
    }}>
      <AuthManager />
      <Text size="xl" fw={700} ta="center">
        MusicPin Demo
      </Text>
      <LayoutToggle />
      <Container 
        size="md"
        style={{ 
          flex: 1,
          overflow: 'auto',
          padding: '0 1rem',
          minHeight: 0,
          width: '100%'
        }}
      >
        {layout === 'ocean' ? (
          <MusicOcean />
        ) : layout === 'search' ? (
          <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            <SearchBar />
            <SearchResults />
          </div>
        ) : (
          <ChatLayout />
        )}
      </Container>
    </div>
  )
}

export default function Home() {
  return (
    <AppProvider>
      <Container 
      
        py="xl" 
        style={{
          height: '100vh',
          display: 'flex',
          overflow: 'hidden',
          flexDirection: 'column',
          maxWidth: '100%'
        }}
      >
        <MainContent />
      </Container>
    </AppProvider>
  )
}
