import { MusicAPI } from '../base'
import type { SearchResponse, SongResponse, SearchResult} from '../types'
import { getFullUrl } from '../config'
import { apiRequest } from '@/lib/api/request'
import type { Platform, APISource } from '../config'

interface CGGSearchResult {
  n: number
  title: string
  singer?: string
  Nickname?: string
  cover: string
  trackId?: number
  type?: string
}

interface CGGDouyinDetail {
  code: number
  msg: string
  data: {
    title: string
    singer: string
    cover: string
    url: string
    lrc: string
  }
}

interface CGGQishuiDetail {
  msg: string
  pay: string
  title: string
  singer: string
  music: string
  cover: string
  link: string
  lrc: string
}

interface CGGXimalayaDetail {
  code: number
  msg: string
  nickname: string
  title: string
  cover: string
  link: string
  url: string
}

export class CggAPI implements MusicAPI {
  private readonly ENDPOINTS = {
    dy: 'douyin/music',
    qs: 'qishui',
    xmly: 'music/dg_ximalayamusic.php'
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

    const url = getFullUrl(`cgg/${endpoint}/?msg=${encodeURIComponent(keyword)}&type=json&page=${page}&limit=${limit}`)

    try {
      const res = await apiRequest.searchRequest<{ code: number; data: CGGSearchResult[] }>(url, source)
      
      return {
        code: 200,
        data: this.mapSearchResults(res.data, platform, keyword)
      }
    } catch (error) {
      console.error('[CggAPI] Search error:', error)
      return { code: 500, data: [], msg: String(error) }
    }
  }

  async getSongDetail(
    shortRequestUrl: string, 
    platform: Platform, 
    source: APISource
  ): Promise<SongResponse> {
    // 移除重复的 &type=json
    const cleanUrl = shortRequestUrl.replace('&&type=json', '&type=json')
    const url = getFullUrl(cleanUrl)

    try {
      switch (platform) {
        case 'dy': {
          const res = await apiRequest.detailRequest<CGGDouyinDetail>(url, source)
          return this.mapDouyinDetail(res, shortRequestUrl)
        }
        case 'qs': {
          const res = await apiRequest.detailRequest<CGGQishuiDetail>(url, source)
          return this.mapQishuiDetail(res, shortRequestUrl)
        }
        case 'xmly': {
          const res = await apiRequest.detailRequest<CGGXimalayaDetail>(url, source)
          return this.mapXimalayaDetail(res, shortRequestUrl)
        }
        default:
          throw new Error(`Unsupported platform: ${platform}`)
      }
    } catch (error) {
      console.error('[CggAPI] Detail request error:', error)
      return { 
        code: 500, 
        msg: String(error), 
        data: null 
      }
    }
  }

  // 可选的歌词获取方法
  async getLyrics(
    shortRequestUrl: string, 
    platform: Platform, 
    source: APISource
  ): Promise<{ code: number; data: { lyrics: string } }> {
    const url = getFullUrl(shortRequestUrl + '&type=json')

    try {
      switch (platform) {
        case 'dy': {
          const res = await apiRequest.detailRequest<CGGDouyinDetail>(url, source)
          return { 
            code: 200, 
            data: { 
              lyrics: res.data.lrc || '' 
            } 
          }
        }
        case 'qs': {
          const res = await apiRequest.detailRequest<CGGQishuiDetail>(url, source)
          return { 
            code: 200, 
            data: { 
              lyrics: res.lrc || '' 
            } 
          }
        }
        default:
          return { 
            code: 404, 
            data: { 
              lyrics: '' 
            } 
          }
      }
    } catch (error) {
      console.error('[CggAPI] Lyrics request error:', error)
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
      case 'dy': return this.ENDPOINTS.dy
      case 'qs': return this.ENDPOINTS.qs
      case 'xmly': return this.ENDPOINTS.xmly
      default: return undefined
    }
  }

  private mapSearchResults(results: CGGSearchResult[], platform: Platform, keyword: string): SearchResult[] {
    if (!results) return []
    
    return results.map((item, index) => ({
      shortRequestUrl: `cgg/${this.getEndpointForPlatform(platform)}?msg=${encodeURIComponent(keyword)}&n=${index + 1}&type=json`,
      title: item.title || '',
      artist: item.singer || item.Nickname || '',
      cover: item.cover || '',
      platform,
      source: 'CGG',
      extra: platform === 'xmly' ? {
        type: item.type,
        trackId: item.trackId
      } : undefined
    }))
  }

  private mapDouyinDetail(res: CGGDouyinDetail, shortRequestUrl: string): SongResponse {
    return {
      code: res.code,
      msg: res.msg,
      data: {
        shortRequestUrl,
        title: res.data.title,
        artist: res.data.singer,
        cover: res.data.cover,
        platform: 'dy',
        source: 'CGG',
        audioUrl: res.data.url,
        lyrics: res.data.lrc
      }
    }
  }

  private mapQishuiDetail(res: CGGQishuiDetail, shortRequestUrl: string): SongResponse {
    return {
      code: 200,
      msg: res.msg,
      data: {
        shortRequestUrl,
        title: res.title,
        artist: res.singer,
        cover: res.cover,
        platform: 'qs',
        source: 'CGG',
        audioUrl: res.music,
        lyrics: res.lrc,
        extra: {
          platformUrl: res.link
        }
      }
    }
  }

  private mapXimalayaDetail(res: CGGXimalayaDetail, shortRequestUrl: string): SongResponse {
    return {
      code: res.code,
      msg: res.msg,
      data: {
        shortRequestUrl,
        title: res.title,
        artist: res.nickname,
        cover: res.cover,
        platform: 'xmly',
        source: 'CGG',
        audioUrl: res.url,
        extra: {
          platformUrl: res.link
        }
      }
    }
  }

  private buildDetailParams(keyword: string, item: CGGSearchResult): string {
    return `msg=${encodeURIComponent(keyword)}&n=${item.n}&type=json`
  }
}