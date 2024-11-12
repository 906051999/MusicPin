import { useQuery } from '@tanstack/react-query'
import { apiManager } from '../api/manager'
import { SearchResponseSchema, SongResponseSchema } from '../api/schemas'
import * as z from 'zod'

export function useSearch(keyword: string, platform: string, source: string, shouldSearch: boolean) {
  return useQuery({
    queryKey: ['search', keyword, platform, source],
    queryFn: async () => {
      if (!keyword || !platform || !source) {
        return { code: 200, data: [] }
      }
      const data = await apiManager.search(keyword, platform, source)
      return SearchResponseSchema.parse(data)
    },
    enabled: Boolean(keyword && platform && source && shouldSearch),
    refetchOnMount: false,
    staleTime: 0,
    cacheTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })
}

export function useSongDetail(shortRequestUrl: string, platform: string, source: string) {
  return useQuery({
    queryKey: ['song', shortRequestUrl, platform, source],
    queryFn: async () => {
      if (!shortRequestUrl || !platform || !source) {
        return null
      }
      try {
        const data = await apiManager.getSongDetail(shortRequestUrl, platform, source)
        console.log('Raw song detail data:', JSON.stringify(data, null, 2))
        
        // 尝试手动验证关键字段
        if (!data.data?.audioUrl) {
          console.error('Missing audioUrl in song detail')
          throw new Error('Missing audioUrl')
        }
        
        const parsedData = SongResponseSchema.parse(data)
        console.log('Parsed song detail:', JSON.stringify(parsedData, null, 2))
        return parsedData
      } catch (error) {
        console.error('Song detail validation error:', error)
        // 如果是 ZodError，打印详细信息
        if (error instanceof z.ZodError) {
          console.error('Validation errors:', error.errors)
        }
        throw error
      }
    },
    enabled: Boolean(shortRequestUrl && platform && source),
    retry: 0,
    throwOnError: false,
    onError: (error) => {
      console.error('Song detail fetch error:', error)
    }
  })
}