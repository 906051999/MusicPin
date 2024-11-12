import { useQuery } from '@tanstack/react-query'
import { apiManager } from '../api/manager'
import { SearchResponseSchema, SongResponseSchema } from '../api/schemas'

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
    enabled: Boolean(keyword && platform && source && shouldSearch)
  })
}

export function useSongDetail(shortRequestUrl: string, platform: string, source: string) {
  return useQuery({
    queryKey: ['song', shortRequestUrl, platform, source],
    queryFn: async () => {
      const data = await apiManager.getSongDetail(shortRequestUrl, platform, source)
      return SongResponseSchema.parse(data)
    },
    enabled: Boolean(shortRequestUrl && platform && source)
  })
}