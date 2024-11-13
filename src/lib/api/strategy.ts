import { APISource, isInterfaceEnabled, API_STATUS, Platform } from './config'
import type { SearchResponse, SongResponse } from './types'
import { apiManager } from './manager'
import { compareTwoStrings } from 'string-similarity'
import { s2t, t2s } from 'chinese-s2t'

export class RequestStrategy {
  // 简化搜索结果验证
  private validateSearchResult(result: SearchResponse, keyword: string): boolean {
    const data = result.data?.[0]
    if (!data?.title || !data?.artist || !data?.shortRequestUrl) return false
    
    // 使用 t2s 进行繁体转简体并清理文本
    const cleanText = (text: string) => {
      return t2s(text)  // 繁体转简体
        .toLowerCase()
        .replace(/\([^)]*\)/g, '')
        .replace(/（[^）]*）/g, '')
        .trim()
    }

    const searchText = cleanText(keyword)
    const titleText = cleanText(data.title)
    const artistText = cleanText(data.artist)

    // 分别计算标题和艺术家的相似度
    const titleSimilarity = compareTwoStrings(searchText, titleText)
    const artistSimilarity = compareTwoStrings(searchText, artistText)

    // 如果搜索词包含空格，可能是"歌名 歌手"格式
    const [searchTitle, searchArtist] = searchText.split(/\s+/)
    if (searchArtist) {
      const titleMatch = compareTwoStrings(searchTitle, titleText) > 0.6
      const artistMatch = compareTwoStrings(searchArtist, artistText) > 0.6
      if (titleMatch && artistMatch) return true
    }

    // 单个词的搜索，只要标题或艺术家相似度够高就通过
    return titleSimilarity > 0.8 || artistSimilarity > 0.8
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