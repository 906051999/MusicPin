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
  handleSearch: () => void
  handlePlay: (result: SearchResult) => void
  layout: 'ocean' | 'search'
  setLayout: (value: 'ocean' | 'search') => void
  clearSearch: () => void
  handleBubbleSearch: (song: string, artist: string) => void
  setAudioElement: (audio: HTMLAudioElement | null, title?: string, artist?: string, cover?: string | null) => void
  searchParams: {
    song: string
    artist: string
  }
  setSearchParams: (params: { song: string; artist: string }) => void
  isSearching: boolean
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [song, setSong] = useState('')
  const [artist, setArtist] = useState('')
  const [selectedSong, setSelectedSong] = useState('')
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
  const [searchParams, setSearchParams] = useState({ song: '', artist: '' })
  const [isSearching, setIsSearching] = useState(false)

  useMediaSession(currentSongData)

  const clearSearch = () => {
    setSong('')
    setArtist('')
    setSelectedSong('')
    setLayout('ocean')
    setIsSearching(false)
    setSearchParams({ song: '', artist: '' })
  }

  const handleSearch = async () => {
    const apiAuthorized = await requestApiAuth()
    if (apiAuthorized) {
      setLayout('search')
      setIsSearching(true)
      setSearchParams({ song, artist })
    }
  }

  const handleBubbleSearch = async (song: string, artist: string) => {
    const apiAuthorized = await requestApiAuth()
    if (apiAuthorized) {
      clearSearch()
      setSong(song)
      setArtist(artist)
      setLayout('search')
      setIsSearching(true)
      setSearchParams({ song, artist })
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
      handleSearch,
      handleBubbleSearch,
      handlePlay,
      layout,
      setLayout,
      clearSearch,
      setAudioElement,
      searchParams,
      setSearchParams,
      isSearching,
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