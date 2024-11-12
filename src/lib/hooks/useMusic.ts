import { useQuery } from '@tanstack/react-query'
import { apiManager } from '../api/manager'
import { SearchResponseSchema, SongResponseSchema } from '../api/schemas'

export function useSearch(keyword: string, platform: string) {
  return useQuery({
    queryKey: ['search', keyword, platform],
    queryFn: async () => {
      if (!keyword || !platform) {
        return { code: 200, data: [] }
      }
      const data = await apiManager.search(keyword, platform)
      return SearchResponseSchema.parse(data)
    },
    enabled: Boolean(keyword && platform)
  })
}

export function useSongDetail(shortRequestUrl: string) {
  return useQuery({
    queryKey: ['song', shortRequestUrl],
    queryFn: async () => {
      const data = await apiManager.getSongDetail(shortRequestUrl)
      return SongResponseSchema.parse(data)
    },
    enabled: Boolean(shortRequestUrl)
  })
}