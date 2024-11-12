import { MusicAPI } from '../base'
import type { SearchResponse, SongResponse, SearchResult} from '../types'
import { getFullUrl } from '../config'
import { apiRequest } from '@/lib/api/request'

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

  async search(keyword: string, page = 1, limit = 20): Promise<SearchResponse> {
    const searchUrls = [
      `cgg/${this.ENDPOINTS.dy}/?msg=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}&type=json`,
      `cgg/${this.ENDPOINTS.qs}/?msg=${encodeURIComponent(keyword)}&type=json`,
      `cgg/${this.ENDPOINTS.xmly}?msg=${encodeURIComponent(keyword)}&type=json`
    ].map(url => getFullUrl(url))

    const results = await apiRequest.parallelSearch<{ code: number; data: CGGSearchResult[] }>(
      searchUrls,
      'CGG'
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
    const url = getFullUrl(`cgg/${this.ENDPOINTS[platform]}/?${params}&type=json`)

    switch (platform) {
      case 'dy': {
        const res = await apiRequest.detailRequest<CGGDouyinDetail>(url, 'CGG')
        return this.mapDouyinDetail(res, shortRequestUrl)
      }
      case 'qs': {
        const res = await apiRequest.detailRequest<CGGQishuiDetail>(url, 'CGG')
        return this.mapQishuiDetail(res, shortRequestUrl)
      }
      case 'xmly': {
        const res = await apiRequest.detailRequest<CGGXimalayaDetail>(url, 'CGG')
        return this.mapXimalayaDetail(res, shortRequestUrl)
      }
      default:
        throw new Error(`Unknown platform: ${platform}`)
    }
  }

  private mapSearchResults(results: CGGSearchResult[], platform: keyof typeof this.ENDPOINTS, keyword: string): SearchResult[] {
    if (!results) return []
    
    return results.map(item => ({
      shortRequestUrl: `cgg/${this.ENDPOINTS[platform]}?${this.buildDetailParams(keyword, item)}`,
      title: item.title || '',
      artist: item.singer || item.Nickname || '',
      cover: item.cover || '',
      platform: platform === 'dy' ? 'dy' : 
               platform === 'qs' ? 'qs' : 'xmly',
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

  private getSearchParams(platform: string, keyword: string, page = 1, limit = 20): string {
    switch (platform) {
      case 'dy':
        return `msg=${keyword}&page=${page}&limit=${limit}`
      default:
        return `msg=${keyword}`
    }
  }

  private buildDetailParams(keyword: string, item: CGGSearchResult): string {
    return `msg=${encodeURIComponent(keyword)}&n=${item.n}&type=json`
  }

  private parseUrl(url: string): [keyof typeof this.ENDPOINTS, string] {
    const [, platform, params] = url.split('/')
    return [platform as keyof typeof this.ENDPOINTS, params]
  }
}