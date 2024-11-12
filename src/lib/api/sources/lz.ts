import { MusicAPI } from '../base'
import type { SearchResponse, SongResponse, LyricResponse, SearchResult } from '../types'
import { getFullUrl } from '../config'
import { apiRequest } from '@/lib/api/request'

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
    bd: 'dg_bdmusic.php',
    '5s': 'dg_5signmusic.php'
  } as const

  async search(keyword: string, _page?: 1, limit = 20): Promise<SearchResponse> {
    const searchUrls = [
      `lz/${this.ENDPOINTS.kg_sq}?${this.getSearchParams('kg_sq', keyword, limit)}&type=json`,
      `lz/${this.ENDPOINTS.kw}?${this.getSearchParams('kw', keyword, limit)}&type=json`,
      `lz/${this.ENDPOINTS.wy}?${this.getSearchParams('wy', keyword, limit)}&type=json`,
      `lz/${this.ENDPOINTS['5s']}?${this.getSearchParams('5s', keyword, limit)}&type=json`
    ]

    const results = await apiRequest.parallelSearch<{ code: number; data: LZSearchResult[] }>(
      searchUrls.map(url => getFullUrl(url)),
      'LZ'
    )

    return {
      code: 200,
      data: results.flatMap((res, index) => 
        this.mapSearchResults(
          res.data, 
          Object.keys(this.ENDPOINTS)[index] as keyof typeof this.ENDPOINTS,
          keyword
        )
      )
    }
  }

  async getSongDetail(shortRequestUrl: string): Promise<SongResponse> {
    const [platform, params] = this.parseUrl(shortRequestUrl)
    const url = getFullUrl(`lz/${this.ENDPOINTS[platform]}?${params}&type=json`)
    
    const res = await apiRequest.detailRequest<LZSongDetail>(url, 'LZ')
    return this.mapSongDetail(res, shortRequestUrl, platform)
  }

  async getLyrics(shortRequestUrl: string): Promise<LyricResponse> {
    const [platform, params] = this.parseUrl(shortRequestUrl)
    const url = getFullUrl(`lz/${this.ENDPOINTS[platform]}?${params}&type=json`)
    
    const res = await apiRequest.detailRequest<LZSongDetail>(url, 'LZ')
    
    return {
      code: res.code,
      data: {
        lyrics: res.lyrics || res.lrc || ''
      }
    }
  }

  private mapSearchResults(results: LZSearchResult[], platform: keyof typeof this.ENDPOINTS, keyword: string): SearchResult[] {
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

  private getSearchParams(platform: string, keyword: string, limit: number): string {
    switch (platform) {
      case 'kg_sq':
      case '5s':
        return `msg=${keyword}&num=${limit}`
      case 'kg':
      case 'wy':
      case 'mg':
      case 'bd':
        return `gm=${keyword}&num=${limit}`
      case 'kw':
        return `msg=${keyword}&num=${limit}`
      default:
        return `msg=${keyword}&num=${limit}`
    }
  }

  private buildDetailParams(platform: string, item: LZSearchResult, keyword: string): string {
    const baseParams = `msg=${encodeURIComponent(keyword)}&n=${item.n}&type=json`
    switch (platform) {
      case 'kw':
        return baseParams
      case 'kg_sq':
        return `${baseParams}&quality=flac`
      default:
        return baseParams
    }
  }

  private parseUrl(url: string): [keyof typeof this.ENDPOINTS, string] {
    const [, platform, ...rest] = url.split('/')
    const params = rest.join('/').replace('?', '')
    return [platform as keyof typeof this.ENDPOINTS, params]
  }
}