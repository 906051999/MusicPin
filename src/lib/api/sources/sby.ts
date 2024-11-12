import { MusicAPI } from '../base'
import type { SearchResponse, SongResponse, SearchResult, LyricResponse } from '../types'
import { getFullUrl } from '../config'
import { apiRequest } from '@/lib/api/request'
import type { Platform, APISource } from '../config'

// wy搜索结果类型
interface WySearchResponse {
  code: number
  msg: string
  data: Array<{
    name: string
    singer: string
    img: string
    id: number
  }>
}

// wy歌曲详情类型
interface WyDetailResponse {
  code: number
  msg: string
  img: string
  name: string
  author: string
  id: number
  market: string
  mp3: string
  lyric: Array<{
    name: string
    time: string
  }>
}

// qq搜索结果类型
interface QQSearchResponse {
  code: number
  data: Array<{
    id: number
    song: string
    singer: string
    cover: string
  }>
}

// qq歌曲详情类型
interface QQDetailResponse {
  code: number
  data: {
    id: number
    song: string
    singer: string
    album: string
    quality: string
    interval: string
    size: string
    kbps: string
    cover: string
    link: string
    url: string
  }
}

export class SbyAPI implements MusicAPI {
  private readonly ENDPOINTS = {
    wy: 'wydg',  
    qq: 'qqdg'  
  } as const

  async search(
    keyword: string, 
    platform: Platform, 
    source: APISource, 
    page = 1, 
    limit = 20
  ): Promise<SearchResponse> {
    // 根据平台选择对应的endpoint
    const endpoint = this.getEndpointForPlatform(platform)
    if (!endpoint) {
      return { code: 404, data: [], msg: `Platform ${platform} not supported` }
    }

    const url = getFullUrl(`sby/${endpoint}/?msg=${keyword}&type=json`)

    try {
      const res = await apiRequest.searchRequest<WySearchResponse | QQSearchResponse>(url, source)

      const processedResults = this.mapSearchResults(res, platform, keyword)

      return {
        code: 200,
        data: processedResults.slice((page - 1) * limit, page * limit)
      }
    } catch (error) {
      console.error('[SbyAPI] Search failed:', error)
      return { code: 500, data: [], msg: String(error) }
    }
  }

  async getSongDetail(
    shortRequestUrl: string, 
    platform: Platform, 
    source: APISource
  ): Promise<SongResponse> {
    const url = getFullUrl(shortRequestUrl + '&type=json')
    
    try {
      const res = await apiRequest.detailRequest<WyDetailResponse | QQDetailResponse>(url, source)
      return this.mapSongDetail(res, shortRequestUrl, platform)
    } catch (error) {
      console.error('[SbyAPI] Detail request failed:', error)
      return { 
        code: 500, 
        msg: String(error), 
        data: null 
      }
    }
  }

  async getLyrics(
    shortRequestUrl: string, 
    platform: Platform, 
    source: APISource
  ): Promise<LyricResponse> {
    const url = getFullUrl(shortRequestUrl + '&type=json')
    
    try {
      const res = await apiRequest.detailRequest<WyDetailResponse | QQDetailResponse>(url, source)
      
      if ('lyric' in res) {
        return {
          code: 200,
          data: {
            lyrics: this.formatWyLyrics(res.lyric)
          }
        }
      }
      
      return { 
        code: 404, 
        data: { 
          lyrics: '' 
        } 
      }
    } catch (error) {
      console.error('[SbyAPI] Lyrics request failed:', error)
      return { 
        code: 500, 
        data: { 
          lyrics: '' 
        } 
      }
    }
  }

  // 根据平台获取对应的endpoint
  private getEndpointForPlatform(platform: Platform): string | undefined {
    switch (platform) {
      case 'wy': return this.ENDPOINTS.wy
      case 'qq': return this.ENDPOINTS.qq
      default: return undefined
    }
  }

  private mapSearchResults(
    res: WySearchResponse | QQSearchResponse, 
    platform: Platform, 
    keyword: string
  ): SearchResult[] {
    if ('data' in res) {
      if (platform === 'wy') {
        return (res as WySearchResponse).data.map((item, index) => ({
          shortRequestUrl: `sby/${this.ENDPOINTS.wy}/?msg=${encodeURIComponent(keyword)}&n=${index + 1}&type=json`,
          title: item.name,
          artist: item.singer,
          cover: item.img || undefined,
          platform: 'wy',
          source: 'SBY',
          extra: {
            cloudID: String(item.id)
          }
        }))
      } else if (platform === 'qq') {
        return (res as QQSearchResponse).data.map((item, index) => ({
          shortRequestUrl: `sby/${this.ENDPOINTS.qq}/?word=${encodeURIComponent(keyword)}&n=${index + 1}&type=json`,
          title: item.song,
          artist: item.singer,
          cover: item.cover,
          platform: 'qq',
          source: 'SBY',
          extra: {
            cloudID: String(item.id)
          }
        }))
      }
    }
    return []
  }

  private mapSongDetail(
    res: WyDetailResponse | QQDetailResponse, 
    shortRequestUrl: string, 
    platform: Platform
  ): SongResponse {
    if (platform === 'wy' && 'lyric' in res) {
      return {
        code: 200,
        data: {
          shortRequestUrl,
          title: res.name,
          artist: res.author,
          cover: res.img,
          platform: 'wy',
          source: 'SBY',
          audioUrl: res.mp3,
          lyrics: this.formatWyLyrics(res.lyric),
          cloudID: String(res.id),
          extra: {
            duration: this.parseDuration(res.market)
          }
        }
      }
    } else if (platform === 'qq' && 'data' in res) {
      return {
        code: 200,
        data: {
          shortRequestUrl,
          title: res.data.song,
          artist: res.data.singer,
          cover: res.data.cover,
          platform: 'qq',
          source: 'SBY',
          audioUrl: res.data.url,
          cloudID: String(res.data.id),
          extra: {
            quality: res.data.quality,
            duration: this.parseDuration(res.data.interval),
            bitrate: this.parseBitrate(res.data.kbps),
            size: res.data.size,
            album: res.data.album,
            platformUrl: res.data.link
          }
        }
      }
    }

    return {
      code: 500,
      data: null
    }
  }

  private formatWyLyrics(lyrics: Array<{time: string, name: string}>): string {
    return lyrics
      .map(line => `[${line.time}]${line.name}`)
      .join('\n')
  }

  private parseDuration(timeStr: string): number {
    const [min, sec] = timeStr.split('分')[0].split(':').map(Number)
    return (min * 60 + (sec || 0)) * 1000
  }

  private parseBitrate(bitrateStr: string): number {
    return parseInt(bitrateStr)
  }
}