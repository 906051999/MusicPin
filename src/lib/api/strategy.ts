import { APISource, isInterfaceEnabled, API_STATUS } from './config'
import type { SearchResponse, SongResponse } from './types'
import { apiManager } from './manager'

export class RequestStrategy {
  // 简化搜索结果验证
  private validateSearchResult(result: SearchResponse, keyword: string): boolean {
    const data = result.data?.[0]
    if (!data?.title || !data?.artist || !data?.shortRequestUrl) return false
    
    const searchTerms = keyword.toLowerCase().split(/\s+/)
    const titleWords = data.title.toLowerCase().split(/\s+/)
    const artistWords = data.artist.toLowerCase().split(/\s+/)
    
    // 只验证关键词匹配
    return searchTerms.some(term => 
      titleWords.some(word => word.includes(term)) || 
      artistWords.some(word => word.includes(term))
    )
  }

  // 简化歌曲详情验证
  private validateSongDetail(result: SongResponse): boolean {
    return Boolean(result.data?.audioUrl) // 只验证音频链接存在
  }

  // 测试单个接口
  private async testInterface(
    keyword: string,
    platform: Platform,
    source: APISource
  ): Promise<SearchResponse | null> {
    try {
      const result = await apiManager.search(keyword, platform, source)
      
      if (this.validateSearchResult(result, keyword)) {
        const firstSong = result.data?.[0]
        if (firstSong?.shortRequestUrl) {
          const detail = await apiManager.getSongDetail(firstSong.shortRequestUrl, platform, source)
          if (this.validateSongDetail(detail)) {
            return result
          }
        }
      }
      return null
    } catch (error) {
      console.error(`Interface test failed for ${platform}:${source}:`, error)
      return null
    }
  }

  // 智能搜索实现
  async smartSearch(keyword: string): Promise<SearchResponse> {
    const interfaces = this.getAvailableInterfaces()
    if (interfaces.length === 0) {
      throw new Error('没有可用的数据源')
    }

    // 依次测试每个接口，找到第一个合格的就返回
    for (const { platform, source } of interfaces) {
      const result = await this.testInterface(keyword, platform, source)
      if (result) {
        return result
      }
    }

    throw new Error('未找到匹配度足够高的结果')
  }

  // 简化智能获取歌曲详情
  async smartGetSongDetail(shortRequestUrl: string): Promise<SongResponse> {
    const sources = this.getAvailableSources()
    if (sources.length === 0) {
      throw new Error('没有可用的数据源')
    }

    for (const source of sources) {
      try {
        const result = await apiManager.getSongDetail(shortRequestUrl, 'wy', source)
        if (this.validateSongDetail(result)) {
          return result
        }
      } catch (error) {
        console.error(`Song detail failed for ${source}:`, error)
        continue
      }
    }

    throw new Error('未找到有效的音频资源')
  }

  // 添加这个方法来获取可用的数据源
  private getAvailableSources(): APISource[] {
    return Object.entries(API_STATUS)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => key.split(':')[1].toUpperCase() as APISource)
      .filter((source, index, self) => self.indexOf(source) === index); // 去重
  }

  // 获取所有可用的API接口
  private getAvailableInterfaces(): Array<{ platform: Platform; source: APISource }> {
    return Object.entries(API_STATUS)
      .filter(([key, enabled]) => enabled)
      .map(([key]) => {
        const [platform, source] = key.split(':')
        return {
          platform: platform as Platform,
          source: source.toUpperCase() as APISource
        }
      })
  }
}

export const requestStrategy = new RequestStrategy() 