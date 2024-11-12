import { MusicAPI } from '../base'
import type { SearchResponse, SongResponse, LyricResponse, SearchResult } from '../types'
import { getFullUrl } from '../config'
import { apiRequest } from '@/lib/api/request'

interface XZGSearchResult {
  songname: string
  name: string
  album: string
  pay: string
  cover: string
  id?: number
  FileHash?: string
  src: string
  songurl?: string
}

interface XZGSongDetail {
  songname: string
  name: string
  album: string
  quality: string
  interval: string
  size: string
  kbps: string
  cover: string
  src: string
  songurl: string
}

interface XZGResponse {
  code: number
  msg: string
  data: XZGSearchResult[] | XZGSongDetail
}

interface XZGLyricResponse {
  code: number
  msg: string
  data: {
    encode: {
      context: string
    }
  }
}

export class XzgAPI implements MusicAPI {
  private readonly ENDPOINTS = {
    kg: 'Kugou_GN_new',
    kw: 'Kuwo_BD_new', 
    wy: 'NetEase_CloudMusic_new'
  } as const

  async search(keyword: string, page = 1, limit = 20): Promise<SearchResponse> {
    const searchUrls = Object.entries(this.ENDPOINTS).map(([platform, api]) => 
      getFullUrl(`xzg/${api}/?name=${keyword}&page=${page}&pagesize=${limit}`)
    )

    const results = await apiRequest.parallelSearch<XZGResponse>(searchUrls, 'XZG')
    
    return {
      code: 200,
      data: results.flatMap((res, index) => 
        this.mapSearchResults(
          res.data as XZGSearchResult[], 
          Object.keys(this.ENDPOINTS)[index]
        )
      )
    }
  }

  async getSongDetail(shortRequestUrl: string): Promise<SongResponse> {
    const res = await apiRequest.detailRequest<XZGResponse>(
      getFullUrl(shortRequestUrl),
      'XZG'
    )

    return this.mapSongDetail(res, shortRequestUrl)
  }

  async getLyrics(id: string): Promise<LyricResponse> {
    const res = await apiRequest.detailRequest<XZGLyricResponse>(
      getFullUrl(`xzg/lyrc/?id=${id}`),
      'XZG'
    )

    return {
      code: res.code,
      msg: res.msg,
      data: {
        lyrics: res.data.encode.context
      }
    }
  }

  private mapSongDetail(res: XZGResponse, shortRequestUrl: string): SongResponse {
    const detail = res.data as XZGSongDetail
    const platform = this.getPlatformFromUrl(shortRequestUrl)

    return {
      code: res.code,
      msg: res.msg,
      data: {
        shortRequestUrl,
        title: detail.songname,
        artist: detail.name,
        cover: detail.cover,
        platform,
        source: 'XZG',
        audioUrl: detail.src,
        extra: {
          quality: detail.quality,
          duration: this.parseDuration(detail.interval),
          bitrate: parseInt(detail.kbps),
          size: detail.size,
          album: detail.album,
          platformUrl: detail.songurl
        }
      }
    }
  }

  private mapSearchResults(results: XZGSearchResult[], platform: string): SearchResult[] {
    return results.map(item => ({
      shortRequestUrl: `xzg/${this.ENDPOINTS[platform]}/?name=${item.songname}&n=1`,
      title: item.songname,
      artist: item.name,
      cover: item.cover,
      platform,
      source: 'XZG'
    }))
  }

  private getPlatformFromUrl(url: string): string {
    if (url.includes('Kugou')) return 'kg'
    if (url.includes('Kuwo')) return 'kw'
    return 'wy'
  }

  private parseDuration(timeStr: string): number {
    const [min, sec] = timeStr.split('分')[0].split('秒')[0].split(':').map(Number)
    return (min * 60 + (sec || 0)) * 1000
  }
}