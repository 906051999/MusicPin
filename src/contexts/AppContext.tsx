'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { SearchResult } from '@/lib/api/types'
import { useAuthStore } from '@/stores/authStore'
import { useMediaSession } from '@/lib/hooks/useMediaSession'

interface AppContextType {
  keyword: string
  setKeyword: (value: string) => void
  searchText: string
  setSearchText: (value: string) => void
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
  const [keyword, setKeyword] = useState('')
  const [searchText, setSearchText] = useState('')
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
    setSearchText('')
    setSelectedSong('')
    setShouldSearch(false)
  }

  const handleSearch = async () => {
    const trimmedKeyword = keyword.trim()
    if (trimmedKeyword) {
      const apiAuthorized = await requestApiAuth()
      if (apiAuthorized) {
        setSearchText(trimmedKeyword)
        setShouldSearch(true)
      }
    }
  }

  const handleBubbleSearch = async (song: string, artist: string) => {
    const apiAuthorized = await requestApiAuth()
    if (apiAuthorized) {
      clearSearch()
      const newKeyword = `${song} ${artist}`
      setKeyword(newKeyword)
      setSearchText(newKeyword)
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
      keyword,
      setKeyword,
      searchText,
      setSearchText,
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