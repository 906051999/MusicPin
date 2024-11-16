'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { SearchResult } from '@/lib/api/types'
import { useAuthStore } from '@/stores/authStore'
import { useMediaSession } from '@/lib/hooks/useMediaSession'

interface AppContextType {
  song: string
  setSong: (value: string) => void
  artist: string
  setArtist: (value: string) => void
  selectedSong: string
  setSelectedSong: (value: string) => void
  shouldSearch: boolean
  setShouldSearch: (value: boolean) => void
  handleSearch: () => void
  handlePlay: (result: SearchResult) => void
  layout: 'ocean' | 'search'
  setLayout: (value: 'ocean' | 'search') => void
  clearSearch: () => void
  handleBubbleSearch: (song: string, artist: string) => void
  setAudioElement: (audio: HTMLAudioElement | null, title?: string, artist?: string, cover?: string | null) => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [song, setSong] = useState('')
  const [artist, setArtist] = useState('')
  const [selectedSong, setSelectedSong] = useState('')
  const [shouldSearch, setShouldSearch] = useState(false)
  const [layout, setLayout] = useState<'ocean' | 'search'>('ocean')
  const { requestApiAuth } = useAuthStore()
  const [currentSongData, setCurrentSongData] = useState<{
    title: string
    artist: string
    audioElement: HTMLAudioElement | null
    cover?: string | null
  }>({
    title: '',
    artist: '',
    audioElement: null,
    cover: null
  })

  useMediaSession(currentSongData)

  const clearSearch = () => {
    setSong('')
    setArtist('')
    setSelectedSong('')
    setShouldSearch(false)
  }

  const handleSearch = async () => {
    const trimmedSong = song.trim()
    const trimmedArtist = artist.trim()
    if (trimmedSong || trimmedArtist) {
      const apiAuthorized = await requestApiAuth()
      if (apiAuthorized) {
        setShouldSearch(true)
      }
    }
  }

  const handleBubbleSearch = async (song: string, artist: string) => {
    const apiAuthorized = await requestApiAuth()
    if (apiAuthorized) {
      clearSearch()
      setSong(song)
      setArtist(artist)
      setShouldSearch(true)
      setLayout('search')
    }
  }

  const handlePlay = useCallback((result: SearchResult) => {
    setSelectedSong(prev => {
      const newValue = prev === result.shortRequestUrl ? '' : result.shortRequestUrl
      if (!newValue) {
        setCurrentSongData(prev => ({ ...prev, audioElement: null }))
      }
      return newValue
    })
  }, [])

  const setAudioElement = useCallback((
    audio: HTMLAudioElement | null, 
    title?: string, 
    artist?: string,
    cover?: string | null
  ) => {
    setCurrentSongData({
      title: title || '',
      artist: artist || '',
      audioElement: audio,
      cover
    })
  }, [])

  return (
    <AppContext.Provider value={{
      song,
      setSong,
      artist,
      setArtist,
      selectedSong,
      setSelectedSong,
      shouldSearch,
      setShouldSearch,
      handleSearch,
      handleBubbleSearch,
      handlePlay,
      layout,
      setLayout,
      clearSearch,
      setAudioElement,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}