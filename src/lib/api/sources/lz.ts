import { MusicAPI } from '../base'
import type { SearchResponse, SongResponse, LyricResponse, SearchResult } from '../types'
import { getFullUrl } from '../config'
import { apiRequest } from '@/lib/api/request'
import type { Platform, APISource } from '../config'

type LZPlatform = 'kg_sq' | 'kg' | 'kw' | 'wy' | 'mg' | 'bd' | '5s';

interface LZSearchResult {
  n: number
  title: string
  singer: string
  songid?: string
  song_rid?: string
  ID?: number
  songtype?: string
  originSinger?: string
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
  private readonly ENDPOINTS: Record<LZPlatform, string> = {
    kg_sq: 'dg_kugouSQ.php',
    kg: 'dg_kgmusic.php',
    kw: 'dg_kuwomusic.php', 
    wy: 'dg_wyymusic.php',
    mg: 'dg_mgmusic.php',
    bd: 'dg_BDbdmusic.php',
    '5s': 'dg_5signmusic.php'
  }

  async search(
    keyword: string, 
    platform: Platform, 
    source: APISource, 
    _page?: number, 
    limit = 20
  ): Promise<SearchResponse> {
    const endpoint = this.getEndpointForPlatform(platform)
    if (!endpoint) {
      return { code: 404, data: [], msg: `Platform ${platform} not supported` }
    }

    const url = getFullUrl(`lz/${endpoint}?${this.getSearchParams(platform, keyword, limit)}&type=json`)

    try {
      const res = await apiRequest.searchRequest<LZSearchResult[] | { code: number; data: LZSearchResult[] }>(url, source)
      
      const searchResults = Array.isArray(res) ? res : res.data
      
      return {
        code: 200,
        data: this.mapSearchResults(searchResults, platform, keyword)
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
      const url = getFullUrl(shortRequestUrl)
      console.log('[LzAPI] Detail request URL:', url)

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
    const url = getFullUrl(`lz/${this.ENDPOINTS[requestPlatform as LZPlatform]}?${params}&type=json`)
    
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

  private getEndpointForPlatform(platform: Platform): string | undefined {
    return (this.ENDPOINTS as Record<string, string>)[platform];
  }

  private mapSearchResults(results: LZSearchResult[], platform: LZPlatform, keyword: string): SearchResult[] {
    if (!results?.length) return []
    
    console.log('[LzAPI] Mapping search results:', { results, platform })
    
    return results.map(item => ({
      shortRequestUrl: `lz/${this.ENDPOINTS[platform]}?${this.buildDetailParams(platform, item, keyword)}`,
      title: String(item.title || ''),
      artist: String(item.singer || ''),
      platform: platform === 'kg_sq' ? 'kg' : platform,
      source: 'LZ',
      extra: {
        songId: platform === '5s' ? item.ID : (item.songid || item.song_rid)
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

    const audioUrl = res.music_url || res.flac_url || res.url || ''
    if (!audioUrl) {
      return {
        code: 404,
        msg: 'No audio URL found',
        data: null
      }
    }

    return {
      code: res.code,
      data: {
        shortRequestUrl,
        title: res.title || res.song_name || '未知歌曲',
        artist: res.singer || res.song_singer || '未知歌手',
        cover: res.cover || res.song_cover || '',
        platform: platform === 'kg_sq' ? 'kg' : platform,
        source: 'LZ',
        audioUrl,
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
    const n = platform === '5s' ? item.ID : item.n
    const baseParams = platform === 'kg' || platform === 'wy' || platform === 'mg' || platform === 'bd'
      ? `gm=${encodedKeyword}&n=${n}&type=json`
      : `msg=${encodedKeyword}&n=${n}&type=json`

    switch (platform) {
      case 'kg_sq':
        return `${baseParams}&quality=flac`
      default:
        return baseParams
    }
  }

  private parseUrl(url: string): [Platform, string] {
    const [, endpoint, queryString] = url.split('/')
    
    const platform = Object.entries(this.ENDPOINTS).find(([_, value]) => value === endpoint)?.[0] as Platform
    if (!platform) {
      throw new Error(`Invalid platform endpoint: ${endpoint}`)
    }

    return [platform, queryString]
  }
}