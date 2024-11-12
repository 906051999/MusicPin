import type { SearchResponse, SongResponse, LyricResponse } from './types'

export interface MusicAPI {
  // 搜索音乐
  search(keyword: string, page?: number, limit?: number): Promise<SearchResponse>
  
  // 获取音乐详情 
  getSongDetail(shortRequestUrl: string): Promise<SongResponse>
  
  // 获取歌词,可选实现
  getLyrics?(key: string): Promise<LyricResponse>
}

// 统一错误处理
export class APIError extends Error {
  constructor(
    message: string,
    public code: number,
    public source: string
  ) {
    super(message)
    this.name = 'APIError'
  }
} 