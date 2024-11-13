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
  private validateSearchResult(result: SearchResponse, keyword: string): boolean {
    const data = result.data?.[0]
    if (!data?.title || !data?.artist || !data?.shortRequestUrl) return false
    
    const cleanText = (text: string) => {
      return t2s(text)
        .toLowerCase()
        .replace(/\([^)]*\)/g, '')
        .replace(/（[^）]*）/g, '')
        .replace(/[,，、]/g, ' ')  // 将常见分隔符转为空格
        .replace(/\s+/g, ' ')     // 合并多个空格
        .trim()
    }

    const searchText = cleanText(keyword)
    const titleText = cleanText(data.title)
    const artistText = cleanText(data.artist)

    // 创建搜索对象
    const searchItem = { title: titleText, artist: artistText }
    const fuseOptions = {
      keys: ['title', 'artist'],
      threshold: 0.45,    // 稍微放宽阈值
      ignoreLocation: true,
      useExtendedSearch: true
    }
    const fuse = new Fuse([searchItem], fuseOptions)

    // 1. 尝试精确匹配
    if (searchText === titleText || searchText === artistText) {
      return true
    }

    // 2. 尝试智能分割歌名和歌手
    const parts = searchText.split(' ')
    if (parts.length >= 2) {
      // 尝试不同的分割点
      for (let i = 1; i < parts.length; i++) {
        const possibleTitle = parts.slice(0, i).join(' ')
        const possibleArtist = parts.slice(i).join(' ')
        
        // 正向匹配: 歌名 歌手
        if (possibleTitle === titleText && possibleArtist === artistText) {
          return true
        }
        // 反向匹配: 歌手 歌名
        if (possibleTitle === artistText && possibleArtist === titleText) {
          return true
        }

        // 模糊匹配两种格式
        const patterns: FuseExpression[] = [
          { $and: [{ title: `=${possibleTitle}` }, { artist: `=${possibleArtist}` }] },
          { $and: [{ artist: `=${possibleTitle}` }, { title: `=${possibleArtist}` }] }
        ];

        for (const pattern of patterns) {
          const fuseResult = fuse.search(pattern)
          if (fuseResult.length > 0 && fuseResult[0].score && fuseResult[0].score < 0.4) {
            return true
          }
        }
      }
    }

    // 3. 对整个搜索词进行模糊匹配
    const fuseResult = fuse.search(searchText)
    if (fuseResult.length > 0 && fuseResult[0].score && fuseResult[0].score < 0.35) {
      return true
    }

    // 4. 分别对歌名和歌手进行模糊匹配
    const titleResult = fuse.search({ title: searchText })
    const artistResult = fuse.search({ artist: searchText })
    
    return (
      (titleResult.length > 0 && titleResult[0].score !== undefined && titleResult[0].score < 0.3) ||
      (artistResult.length > 0 && artistResult[0].score !== undefined && artistResult[0].score < 0.3)
    );
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
  ): Promise<{ result: SearchResponse | null; fallback: SearchResponse | null }> {
    try {
      const result = await apiManager.search(keyword, platform, source)
      
      // 如果有数据，先保存为兜底结果
      let fallback: SearchResponse | null = null
      if (result.data?.[0]?.shortRequestUrl) {
        const detail = await apiManager.getSongDetail(result.data[0].shortRequestUrl, platform, source)
        if (this.validateSongDetail(detail)) {
          fallback = result
        }
      }

      // 尝试验证匹配度
      if (this.validateSearchResult(result, keyword)) {
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
  async smartSearch(keyword: string): Promise<SearchResponse> {
    const interfaces = this.getAvailableInterfaces()
    if (interfaces.length === 0) {
      throw new Error('没有可用的数据源')
    }

    let firstFallback: SearchResponse | null = null

    // 依次测试每个接口
    for (const { platform, source } of interfaces) {
      const { result, fallback } = await this.testInterface(keyword, platform, source)
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