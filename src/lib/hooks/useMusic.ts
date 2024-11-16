import { useQuery } from '@tanstack/react-query'
import { requestStrategy } from '../api/strategy'
import { notifications } from '@mantine/notifications';
import { useApp } from '@/contexts/AppContext'

export function useSearch() {
  const { searchParams, isSearching } = useApp()
  const { song, artist } = searchParams
  
  return useQuery({
    queryKey: ['smart-search', song, artist],
    queryFn: async () => {
      try {
        return await requestStrategy.smartSearch(song, artist)
      } catch (error) {
        notifications.show({
          title: '搜索失败',
          message: error instanceof Error ? error.message : '未知错误',
          color: 'red'
        })
        throw error
      }
    },
    enabled: isSearching && (Boolean(song) || Boolean(artist)),
    staleTime: Infinity,
    refetchOnMount: false,
    gcTime: 5 * 60 * 1000, // 5分钟后清理缓存
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })
}

export function useSongDetail(shortRequestUrl: string) {
  return useQuery({
    queryKey: ['smart-song', shortRequestUrl],
    queryFn: async () => {
      try {
        return await requestStrategy.smartGetSongDetail(shortRequestUrl)
      } catch (error) {
        notifications.show({
          title: '获取歌曲详情失败',
          message: error instanceof Error ? error.message : '未知错误',
          color: 'red'
        })
        throw error
      }
    },
    enabled: Boolean(shortRequestUrl),
    retry: 0,
    gcTime: 0,
    networkMode: 'always'
  })
}