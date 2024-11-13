import { MusicAPI } from './base'
import { SbyAPI } from '@/lib/api/sources/sby'
import { XfAPI } from '@/lib/api/sources/xf'
import { XzgAPI } from '@/lib/api/sources/xzg'
import { LzAPI } from '@/lib/api/sources/lz'
import { CggAPI } from '@/lib/api/sources/cgg'
import type { SearchResponse } from './types'
import type { Platform, APISource } from './config'

export class APIManager {
  private apis: Record<APISource, MusicAPI> = {
    SBY: new SbyAPI(),
    XF: new XfAPI(),
    XZG: new XzgAPI(),
    LZ: new LzAPI(),
    CGG: new CggAPI(),
  }

  // 单一API源和平台搜索
  async search(
    keyword: string, 
    platform: Platform, 
    source: APISource, 
    page = 1, 
    limit = 10
  ): Promise<SearchResponse> {
    if (!keyword || !platform || !source) {
      return { code: 200, data: [] }
    }

    console.log('[APIManager] Starting search:', { keyword, platform, source })
    
    try {
      const api = this.apis[source]
      const result = await api.search(keyword, platform, source, page, limit)
      
      console.log(`[APIManager] ${source} API result:`, result)
      return result
    } catch (error) {
      console.error(`[APIManager] ${source} API failed:`, error)
      throw error
    }
  }

  // 获取歌曲详情
  async getSongDetail(
    shortRequestUrl: string, 
    platform: Platform, 
    source: APISource
  ) {
    const api = this.apis[source]
    if (!api) throw new Error(`Unknown API source: ${source}`)
    return api.getSongDetail(shortRequestUrl, platform, source)
  }

  // 获取歌词（如果支持）
  async getLyrics(
    shortRequestUrl: string, 
    platform: Platform, 
    source: APISource
  ) {
    const api = this.apis[source]
    if (!api || !api.getLyrics) {
      throw new Error(`Lyrics not supported for ${source}`)
    }
    return api.getLyrics(shortRequestUrl, platform, source)
  }
}

// 导出单例
export const apiManager = new APIManager()