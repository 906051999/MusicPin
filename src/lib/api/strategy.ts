import { APISource, API_STATUS, Platform } from './config'
import type { SearchResponse, SongResponse } from './types'
import { apiManager } from './manager'
import Fuse from 'fuse.js'
import { t2s } from 'chinese-s2t'

// 定义 Fuse.js 搜索模式的类型
type FuseExpression = {
  [key: string]: string;
} | {
  $and: Array<{ [key: string]: string }>;
};

export class RequestStrategy {
  // 简化搜索结果验证
  private validateSearchResult(result: SearchResponse, song: string, artist: string): boolean {
    const data = result.data?.[0]
    if (!data?.title || !data?.artist || !data?.shortRequestUrl) return false
    
    const cleanText = (text: string) => {
      return t2s(text)
        .toLowerCase()
        .replace(/\([^)]*\)/g, '')
        .replace(/（[^）]*）/g, '')
        .replace(/[,，、]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    }

    const searchSong = cleanText(song)
    const searchArtist = cleanText(artist)
    const titleText = cleanText(data.title)
    const artistText = cleanText(data.artist)

    // 创建搜索对象
    const searchItem = { title: titleText, artist: artistText }
    const fuseOptions = {
      keys: ['title', 'artist'],
      threshold: 0.45,
      ignoreLocation: true,
      useExtendedSearch: true
    }
    const fuse = new Fuse([searchItem], fuseOptions)

    // 如果有歌名和歌手，都需要匹配
    if (searchSong && searchArtist) {
      return (
        (titleText.includes(searchSong) && artistText.includes(searchArtist)) ||
        (fuse.search({ $and: [{ title: searchSong }, { artist: searchArtist }] }).length > 0)
      )
    }

    // 只有歌名
    if (searchSong) {
      return titleText.includes(searchSong) || fuse.search({ title: searchSong }).length > 0
    }

    // 只有歌手
    if (searchArtist) {
      return artistText.includes(searchArtist) || fuse.search({ artist: searchArtist }).length > 0
    }

    return false
  }

  // 简化歌曲详情验证
  private validateSongDetail(result: SongResponse): boolean {
    return Boolean(result.data?.audioUrl) // 只验证音频链接存在
  }

  // 测试单个接口
  private async testInterface(
    song: string,
    artist: string,
    platform: Platform,
    source: APISource
  ): Promise<{ result: SearchResponse | null; fallback: SearchResponse | null }> {
    try {
      const result = await apiManager.search(song, artist, platform, source)
      
      // 如果有数据，先保存为兜底结果
      let fallback: SearchResponse | null = null
      if (result.data?.[0]?.shortRequestUrl) {
        const detail = await apiManager.getSongDetail(result.data[0].shortRequestUrl, platform, source)
        if (this.validateSongDetail(detail)) {
          fallback = result
        }
      }

      // 尝试验证匹配度
      if (this.validateSearchResult(result, song, artist)) {
        const firstSong = result.data?.[0]
        if (firstSong?.shortRequestUrl) {
          const detail = await apiManager.getSongDetail(firstSong.shortRequestUrl, platform, source)
          if (this.validateSongDetail(detail)) {
            return { result, fallback: null }
          }
        }
      }
      return { result: null, fallback }
    } catch (error) {
      console.error(`Interface test failed for ${platform}:${source}:`, error)
      return { result: null, fallback: null }
    }
  }

  // 智能搜索实现
  async smartSearch(song: string, artist: string): Promise<SearchResponse> {
    const interfaces = this.getAvailableInterfaces()
    if (interfaces.length === 0) {
      throw new Error('没有可用的数据源')
    }

    let firstFallback: SearchResponse | null = null

    // 依次测试每个接口
    for (const { platform, source } of interfaces) {
      const { result, fallback } = await this.testInterface(song, artist, platform, source)
      if (result) {
        return result
      }
      // 保存第一个有效的兜底结果
      if (!firstFallback && fallback) {
        firstFallback = fallback
      }
    }

    // 如果有兜底结果就使用
    if (firstFallback) {
      return firstFallback
    }

    throw new Error('未找到任何可用结果')
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
      .filter(([, enabled]) => enabled)
      .map(([key]) => key.split(':')[1].toUpperCase() as APISource)
      .filter((source, index, self) => self.indexOf(source) === index); // 去重
  }

  // 获取所有可用的API接口
  private getAvailableInterfaces(): Array<{ platform: Platform; source: APISource }> {
    return Object.entries(API_STATUS)
      .filter(([, enabled]) => enabled)
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