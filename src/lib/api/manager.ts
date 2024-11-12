import { MusicAPI } from './base'
import { SbyAPI } from './sources/sby'
import { XfAPI } from './sources/xf'
import { XzgAPI } from './sources/xzg'
import { LzAPI } from './sources/lz'
import { CggAPI } from './sources/cgg'
import type { SearchResponse } from './types'
import { API_BASE_URLS } from './config'

export class APIManager {
  private apis: Record<string, MusicAPI> = {
    SBY: new SbyAPI(),
    XF: new XfAPI(),
    XZG: new XzgAPI(),
    LZ: new LzAPI(),
    CGG: new CggAPI(),
  }

  // 添加单平台搜索方法
  async search(keyword: string, platform: string): Promise<SearchResponse> {
    if (!keyword || !platform) {
      return { code: 200, data: [] }
    }

    console.log('[APIManager] Starting search:', { keyword, platform })
    console.log('[APIManager] API_BASE_URLS:', API_BASE_URLS)
    
    const apiOrder = ['XF', 'SBY', 'XZG', 'LZ', 'CGG']
    
    let lastError: Error | null = null;
    
    for (const apiKey of apiOrder) {
      try {
        console.log(`[APIManager] Trying ${apiKey} API...`)
        const api = this.apis[apiKey]
        const result = await api.search(keyword)
        console.log(`[APIManager] ${apiKey} API result:`, result)
        
        const filteredData = result.data.filter(item => item.platform === platform)
        if (filteredData.length > 0) {
          return {
            code: result.code,
            msg: result.msg,
            data: filteredData
          }
        }
      } catch (error) {
        console.error(`[APIManager] ${apiKey} API failed:`, error)
        lastError = error as Error;
        continue
      }
    }

    // 如果所有 API 都失败，抛出最后一个错误
    if (lastError) {
      throw lastError
    }

    // 如果没有找到结果，返回空数组
    return {
      code: 200,
      data: []
    }
  }

  // 保留原有的 searchAll 方法
  async searchAll(keyword: string): Promise<SearchResponse> {
    const results = await Promise.allSettled(
      Object.values(this.apis).map(api => 
        api.search(keyword).catch(err => ({ code: err.code, msg: err.message, data: [] }))
      )
    )
    
    // 合并所有成功的结果
    const successResults = results
      .filter((result): result is PromiseFulfilledResult<SearchResponse> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value.data)
      .flat()

    return {
      code: 200,
      data: successResults
    }
  }

  // 保留原有的 getSongDetail 方法
  async getSongDetail(shortRequestUrl: string) {
    const [source] = shortRequestUrl.split('/')
    const api = this.apis[source.toUpperCase()]
    if (!api) throw new Error(`Unknown API source: ${source}`)
    return api.getSongDetail(shortRequestUrl)
  }
}

// 导出单例
export const apiManager = new APIManager()