import { useQuery } from '@tanstack/react-query'
import { requestStrategy } from '../api/strategy'
import { notifications } from '@mantine/notifications';

export function useSearch(keyword: string, shouldSearch: boolean) {
  return useQuery({
    queryKey: ['smart-search', keyword],
    queryFn: async () => {
      try {
        return await requestStrategy.smartSearch(keyword)
      } catch (error) {
        notifications.show({
          title: '搜索失败',
          message: error instanceof Error ? error.message : '未知错误',
          color: 'red'
        })
        throw error
      }
    },
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