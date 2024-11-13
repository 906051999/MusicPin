'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import type { SearchResult } from '@/lib/api/types'

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
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [keyword, setKeyword] = useState('')
  const [searchText, setSearchText] = useState('')
  const [selectedSong, setSelectedSong] = useState('')
  const [shouldSearch, setShouldSearch] = useState(false)
  const [layout, setLayout] = useState<'ocean' | 'search'>('ocean')

  const clearSearch = () => {
    setSearchText('')
    setSelectedSong('')
    setShouldSearch(false)
  }

  const handleSearch = () => {
    const trimmedKeyword = keyword.trim()
    if (trimmedKeyword) {
      setSearchText(trimmedKeyword)
      setShouldSearch(true)
    }
  }

  const handleBubbleSearch = (song: string, artist: string) => {
    clearSearch()
    const newKeyword = `${song} ${artist}`
    setKeyword(newKeyword)
    setSearchText(newKeyword)
    setShouldSearch(true)
    setLayout('search')
  }

  const handlePlay = (result: SearchResult) => {
    setSelectedSong(prev => 
      prev === result.shortRequestUrl ? '' : result.shortRequestUrl
    )
  }

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