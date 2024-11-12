import { MusicAPI } from '../base'
import type { SearchResponse, SongResponse, SearchResult } from '../types'
import { getFullUrl } from '../config'
import { apiRequest } from '@/lib/api/request'

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

  async search(keyword: string, page = 1, limit = 20): Promise<SearchResponse> {
    const searchUrls = [
      getFullUrl(`sby/${this.ENDPOINTS.wy}/?msg=${keyword}&type=json`),
      getFullUrl(`sby/${this.ENDPOINTS.qq}/?word=${keyword}&type=json`)
    ]

    console.log('[SbyAPI] Search URLs:', searchUrls)

    try {
      const [wyRes, qqRes] = await apiRequest.parallelSearch<[WySearchResponse, QQSearchResponse]>(
        searchUrls,
        'SBY'
      )

      console.log('[SbyAPI] Search results:', { wyRes, qqRes })

      const results = [
        ...this.mapWySearchResults(wyRes.data, keyword),
        ...this.mapQQSearchResults(qqRes.data, keyword)
      ]

      return {
        code: 200,
        data: results.slice((page - 1) * limit, page * limit)
      }
    } catch (error) {
      console.error('[SbyAPI] Search failed:', error)
      throw error
    }
  }

  async getSongDetail(shortRequestUrl: string): Promise<SongResponse> {
    const isWy = shortRequestUrl.includes(this.ENDPOINTS.wy)
    const url = getFullUrl(shortRequestUrl + '&type=json')
    
    if (isWy) {
      const res = await apiRequest.detailRequest<WyDetailResponse>(url, 'SBY')
      return this.mapWyDetail(res, shortRequestUrl)
    } else {
      const res = await apiRequest.detailRequest<QQDetailResponse>(url, 'SBY')
      return this.mapQQDetail(res, shortRequestUrl)
    }
  }

  private mapWySearchResults(data: WySearchResponse['data'], keyword: string): SearchResult[] {
    return data.map(item => ({
      shortRequestUrl: `sby/${this.ENDPOINTS.wy}/?msg=${keyword}&n=${item.id}`,
      title: item.name,
      artist: item.singer,
      cover: item.img,
      platform: 'wy',
      source: 'SBY'
    }))
  }

  private mapQQSearchResults(data: QQSearchResponse['data'], keyword: string): SearchResult[] {
    return data.map(item => ({
      shortRequestUrl: `sby/${this.ENDPOINTS.qq}/?word=${keyword}&n=${item.id}`,
      title: item.song,
      artist: item.singer,
      cover: item.cover,
      platform: 'qq',
      source: 'SBY'
    }))
  }

  private mapWyDetail(res: WyDetailResponse, shortRequestUrl: string): SongResponse {
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
  }

  private mapQQDetail(res: QQDetailResponse, shortRequestUrl: string): SongResponse {
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