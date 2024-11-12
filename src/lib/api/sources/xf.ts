import { MusicAPI } from '../base'
import type { SearchResponse, SongResponse, LyricResponse, SearchResult } from '../types'
import { getFullUrl } from '../config'
import { apiRequest } from '@/lib/api/request'

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

  async search(keyword: string, _page? : 1, limit = 20): Promise<SearchResponse> {
    const res = await apiRequest.searchRequest<XFSearchResponse>(
      getFullUrl(`xf/${this.ENDPOINTS.wy}/search?search=${keyword}&limit=${limit}`),
      'XF'
    )

    return {
      code: res.code,
      msg: res.msg,
      data: this.mapSearchResults(res.data.songs)
    }
  }

  async getSongDetail(shortRequestUrl: string): Promise<SongResponse> {
    const res = await apiRequest.detailRequest<XFDetailResponse>(
      getFullUrl(shortRequestUrl + '&type=json'),
      'XF'
    )

    return this.mapSongDetail(res, shortRequestUrl)
  }

  async getLyrics(id: string): Promise<LyricResponse> {
    const res = await apiRequest.detailRequest<XFLyricResponse>(
      getFullUrl(`xf/${this.ENDPOINTS.wy}/lyrics?id=${id}`),
      'XF'
    )

    return {
      code: res.code,
      msg: res.msg,
      data: {
        lyrics: res.data.lyric
      }
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