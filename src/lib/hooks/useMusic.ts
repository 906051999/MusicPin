import { useQuery } from '@tanstack/react-query'
import { requestStrategy } from '../api/strategy'

export function useSearch(keyword: string, shouldSearch: boolean) {
  return useQuery({
    queryKey: ['smart-search', keyword],
    queryFn: () => requestStrategy.smartSearch(keyword),
    enabled: Boolean(keyword && shouldSearch),
    refetchOnMount: false,
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })
}

export function useSongDetail(shortRequestUrl: string) {
  return useQuery({
    queryKey: ['smart-song', shortRequestUrl],
    queryFn: () => requestStrategy.smartGetSongDetail(shortRequestUrl),
    enabled: Boolean(shortRequestUrl),
    retry: 0,
    throwOnError: false,
    onError: (error) => {
      console.error('Song detail fetch error:', error)
    }
  })
}