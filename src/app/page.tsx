'use client'

import { Container, Text } from '@mantine/core'
import { AppProvider } from '@/contexts/AppContext'
import { SearchBar } from '@/components/Search/SearchBar'
import { SearchResults } from '@/components/Search/SearchResults'
import { Disclaimer } from '@/components/Disclaimer'
import { MusicOcean } from '@/components/MusicOcean/MusicOcean'
import { LayoutToggle } from '@/components/LayoutToggle'
import { useApp } from '@/contexts/AppContext'

function MainContent() {
  const { layout } = useApp()
  
  return (
    <>
      <Disclaimer />
      <Text size="xl" fw={700} ta="center" mb="xl">
        MusicPin Demo
      </Text>
      <LayoutToggle />
      {layout === 'ocean' ? (
        <MusicOcean />
      ) : (
        <>
          <SearchBar />
          <SearchResults />
        </>
      )}
    </>
  )
}

export default function Home() {
  return (
    <AppProvider>
      <Container size="md" py="xl">
        <MainContent />
      </Container>
    </AppProvider>
  )
}
