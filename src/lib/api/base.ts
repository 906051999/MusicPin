import type { SearchResponse, SongResponse, LyricResponse } from './types'
import type { Platform, APISource } from './config'

export interface MusicAPI {
  // 搜索音乐，增加平台和API源参数
  search(
    keyword: string, 
    platform: Platform, 
    source: APISource, 
    page?: number, 
    limit?: number
  ): Promise<SearchResponse>
  
  // 获取音乐详情，增加平台和API源参数
  getSongDetail(
    shortRequestUrl: string, 
    platform: Platform, 
    source: APISource
  ): Promise<SongResponse>
  
  // 获取歌词，可选实现，增加平台和API源参数
  getLyrics?(
    shortRequestUrl: string, 
    platform: Platform, 
    source: APISource
  ): Promise<LyricResponse>
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