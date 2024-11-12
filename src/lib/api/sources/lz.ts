import { MusicAPI } from '../base'
import type { SearchResponse, SongResponse, LyricResponse, SearchResult } from '../types'
import { getFullUrl } from '../config'
import { apiRequest } from '@/lib/api/request'
import type { Platform, APISource } from '../config'

interface LZSearchResult {
  n: number
  title: string
  singer: string
  songid?: string
  song_rid?: string
}

interface LZSongDetail {
  code: number
  title?: string
  song_name?: string
  singer?: string
  song_singer?: string
  cover?: string
  song_cover?: string
  link?: string
  music_url?: string
  flac_url?: string
  url?: string
  lyrics?: string
  lrc?: string
}

export class LzAPI implements MusicAPI {
  private readonly ENDPOINTS = {
    kg_sq: 'dg_kugouSQ.php',
    kg: 'dg_kgmusic.php',
    kw: 'dg_kuwomusic.php', 
    wy: 'dg_wyymusic.php',
    mg: 'dg_mgmusic.php',
    bd: 'dg_BDbdmusic.php',
    '5s': 'dg_5signmusic.php'
  } as const

  async search(
    keyword: string, 
    platform: Platform, 
    source: APISource, 
    _page?: number, 
    limit = 20
  ): Promise<SearchResponse> {
    // 根据平台选择对应的endpoint
    const endpoint = this.getEndpointForPlatform(platform)
    if (!endpoint) {
      return { code: 404, data: [], msg: `Platform ${platform} not supported` }
    }

    const url = getFullUrl(`lz/${endpoint}?${this.getSearchParams(platform, keyword, limit)}&type=json`)

    try {
      const res = await apiRequest.searchRequest<{ code: number; data: LZSearchResult[] }>(url, source)
      
      return {
        code: 200,
        data: this.mapSearchResults(res.data, platform, keyword)
      }
    } catch (error) {
      console.error('[LzAPI] Search error:', error)
      return { code: 500, data: [], msg: String(error) }
    }
  }

  async getSongDetail(
    shortRequestUrl: string, 
    platform: Platform, 
    source: APISource
  ): Promise<SongResponse> {
    try {
      // 直接使用完整的 shortRequestUrl
      const url = getFullUrl(shortRequestUrl)
      console.log('[LzAPI] Detail request URL:', url) // 添加日志

      const res = await apiRequest.detailRequest<LZSongDetail>(url, source)
      return this.mapSongDetail(res, shortRequestUrl, platform)
    } catch (error) {
      console.error('[LzAPI] Detail request error:', error)
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
    const [requestPlatform, params] = this.parseUrl(shortRequestUrl)
    const url = getFullUrl(`lz/${this.ENDPOINTS[requestPlatform]}?${params}&type=json`)
    
    try {
      const res = await apiRequest.detailRequest<LZSongDetail>(url, source)
      
      return {
        code: res.code,
        data: {
          lyrics: res.lyrics || res.lrc || ''
        }
      }
    } catch (error) {
      console.error('[LzAPI] Lyrics request error:', error)
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
      case 'kg_sq': return this.ENDPOINTS.kg_sq
      case 'kg': return this.ENDPOINTS.kg
      case 'kw': return this.ENDPOINTS.kw
      case 'wy': return this.ENDPOINTS.wy
      case 'mg': return this.ENDPOINTS.mg
      case 'bd': return this.ENDPOINTS.bd
      case '5s': return this.ENDPOINTS['5s']
      default: return undefined
    }
  }

  private mapSearchResults(results: LZSearchResult[], platform: Platform, keyword: string): SearchResult[] {
    if (!results) return []
    
    return results.map(item => ({
      shortRequestUrl: `lz/${this.ENDPOINTS[platform]}?${this.buildDetailParams(platform, item, keyword)}`,
      title: item.title || '',
      artist: item.singer || '',
      platform: platform === 'kg_sq' ? 'kg' : platform,
      source: 'LZ',
      extra: {
        songId: item.songid || item.song_rid
      }
    }))
  }

  private mapSongDetail(res: LZSongDetail, shortRequestUrl: string, platform: string): SongResponse {
    if (!res) {
      return {
        code: 500,
        data: null
      }
    }

    return {
      code: res.code,
      data: {
        shortRequestUrl,
        title: res.title || res.song_name || '',
        artist: res.singer || res.song_singer || '',
        cover: res.cover || res.song_cover || '',
        platform: platform === 'kg_sq' ? 'kg' : platform,
        source: 'LZ',
        audioUrl: res.music_url || res.flac_url || res.url || '',
        lyrics: res.lyrics || res.lrc || '',
        extra: {
          platformUrl: res.link || ''
        }
      }
    }
  }

  private getSearchParams(platform: Platform, keyword: string, limit: number): string {
    const encodedKeyword = encodeURIComponent(keyword)
    
    switch (platform) {
      case 'kg_sq':
      case 'kw':
      case '5s':
        return `msg=${encodedKeyword}&num=${limit}&type=json`
      case 'kg':
      case 'wy':
      case 'mg':
      case 'bd':
        return `gm=${encodedKeyword}&num=${limit}&type=json`
      default:
        return `msg=${encodedKeyword}&num=${limit}&type=json`
    }
  }

  private buildDetailParams(platform: Platform, item: LZSearchResult, keyword: string): string {
    const encodedKeyword = encodeURIComponent(keyword)
    const baseParams = platform === 'kg' || platform === 'wy' || platform === 'mg' || platform === 'bd'
      ? `gm=${encodedKeyword}&n=${item.n}&type=json`
      : `msg=${encodedKeyword}&n=${item.n}&type=json`

    switch (platform) {
      case 'kg_sq':
        return `${baseParams}&quality=flac`
      default:
        return baseParams
    }
  }

  private parseUrl(url: string): [keyof typeof this.ENDPOINTS, string] {
    // 示例 URL: lz/dg_kugouSQ.php?msg=关键词&n=1&type=json
    const [, endpoint, queryString] = url.split('/')
    
    // 从 endpoint 中提取平台标识
    const platform = Object.entries(this.ENDPOINTS).find(([_, value]) => value === endpoint)?.[0]
    if (!platform) {
      throw new Error(`Invalid platform endpoint: ${endpoint}`)
    }

    return [platform, queryString]
  }
}