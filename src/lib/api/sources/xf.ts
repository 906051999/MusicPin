import { MusicAPI } from '../base'
import type { SearchResponse, SongResponse, LyricResponse, SearchResult } from '../types'
import { getFullUrl } from '../config'
import { apiRequest } from '@/lib/api/request'
import type { Platform, APISource } from '../config'

interface XFSearchResponse {
  code: number
  msg: string
  data: {
    songs: Array<{
      id: number
      name: string
      artistsname: string
      album: string
      duration: number
    }>
  }
}

interface XFDetailResponse {
  code: number
  msg: string
  data: {
    id: string
    name: string
    artistsname: string
    album: string
    picurl: string
    url: string
    duration: number
    pay?: string
  }
}

interface XFLyricResponse {
  code: number
  msg: string
  data: {
    lyric: string
  }
}

export class XfAPI implements MusicAPI {
  private readonly ENDPOINTS = {
    wy: 'wangyi'
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

    const url = getFullUrl(`xf/${endpoint}/search?search=${keyword}&limit=${limit}`)

    try {
      const res = await apiRequest.searchRequest<XFSearchResponse>(url, source)

      return {
        code: res.code,
        msg: res.msg,
        data: this.mapSearchResults(res.data.songs)
      }
    } catch (error) {
      console.error('[XfAPI] Search error:', error)
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
      const res = await apiRequest.detailRequest<XFDetailResponse>(url, source)
      return this.mapSongDetail(res, shortRequestUrl)
    } catch (error) {
      console.error('[XfAPI] Detail request error:', error)
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
    // 从shortRequestUrl中提取歌曲ID
    const match = shortRequestUrl.match(/id=(\d+)/)
    const id = match ? match[1] : ''

    try {
      const res = await apiRequest.detailRequest<XFLyricResponse>(
        getFullUrl(`xf/${this.ENDPOINTS.wy}/lyrics?id=${id}`),
        source
      )

      return {
        code: res.code,
        msg: res.msg,
        data: {
          lyrics: res.data.lyric
        }
      }
    } catch (error) {
      console.error('[XfAPI] Lyrics request error:', error)
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
      default: return undefined
    }
  }

  private mapSearchResults(songs: XFSearchResponse['data']['songs']): SearchResult[] {
    return songs.map(item => ({
      shortRequestUrl: `xf/${this.ENDPOINTS.wy}/music?id=${item.id}`,
      title: item.name,
      artist: item.artistsname,
      platform: 'wy',
      source: 'XF',
      extra: {
        duration: item.duration
      }
    }))
  }

  private mapSongDetail(res: XFDetailResponse, shortRequestUrl: string): SongResponse {
    return {
      code: res.code,
      msg: res.msg,
      data: {
        shortRequestUrl,
        title: res.data.name,
        artist: res.data.artistsname,
        cover: res.data.picurl,
        platform: 'wy',
        source: 'XF',
        audioUrl: res.data.url,
        cloudID: res.data.id,
        extra: {
          duration: res.data.duration,
          album: res.data.album
        }
      }
    }
  }
}