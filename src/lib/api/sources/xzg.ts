import { MusicAPI } from '../base'
import type { SearchResponse, SongResponse, LyricResponse, SearchResult } from '../types'
import { getFullUrl } from '../config'
import { apiRequest } from '@/lib/api/request'
import type { Platform, APISource } from '../config'

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

type XZGPlatform = 'kg' | 'kw' | 'wy';

export class XzgAPI implements MusicAPI {
  private readonly ENDPOINTS: Record<XZGPlatform, string> = {
    kg: 'Kugou_GN_new',
    kw: 'Kuwo_BD_new', 
    wy: 'NetEase_CloudMusic_new'
  }

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

    const url = getFullUrl(`xzg/${endpoint}/?name=${encodeURIComponent(keyword)}&page=${page}&pagesize=${limit}`)

    try {
      const res = await apiRequest.searchRequest<XZGResponse>(url, source)
      
      return {
        code: 200,
        data: this.mapSearchResults(
          res.data as XZGSearchResult[], 
          platform,
          keyword
        )
      }
    } catch (error) {
      console.error('[XzgAPI] Search error:', error)
      return { code: 500, data: [], msg: String(error) }
    }
  }

  async getSongDetail(
    shortRequestUrl: string, 
    platform: Platform, 
    source: APISource
  ): Promise<SongResponse> {
    // 移除多余的 &type=json
    const cleanUrl = shortRequestUrl.replace('&type=json', '')
    const url = getFullUrl(cleanUrl)

    try {
      const res = await apiRequest.detailRequest<XZGResponse>(url, source)
      return this.mapSongDetail(res, shortRequestUrl)
    } catch (error) {
      console.error('[XzgAPI] Detail request error:', error)
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
    const match = shortRequestUrl.match(/n=([^&]+)/)
    const id = match ? match[1] : ''

    try {
      const res = await apiRequest.detailRequest<XZGLyricResponse>(
        getFullUrl(`xzg/lyrc/?id=${id}`),
        source
      )

      return {
        code: res.code,
        msg: res.msg,
        data: {
          lyrics: res.data.encode.context
        }
      }
    } catch (error) {
      console.error('[XzgAPI] Lyrics request error:', error)
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
    return (this.ENDPOINTS as Record<string, string>)[platform];
  }

  private mapSearchResults(results: XZGSearchResult[], platform: Platform, keyword: string): SearchResult[] {
    return results.map((item, index) => ({
      shortRequestUrl: `xzg/${this.ENDPOINTS[platform as XZGPlatform]}/?name=${encodeURIComponent(keyword)}&n=${index + 1}`,
      title: item.songname,
      artist: item.name,
      cover: item.cover,
      platform,
      source: 'XZG',
      extra: {
        songId: item.id || item.FileHash
      }
    }))
  }

  private mapSongDetail(res: XZGResponse, shortRequestUrl: string): SongResponse {
    const detail = res.data as XZGSongDetail
    const platform = this.getPlatformFromUrl(shortRequestUrl)

    if (!detail.src) {
      return {
        code: 404,
        msg: 'No audio URL found',
        data: null
      }
    }

    return {
      code: res.code,
      msg: res.msg,
      data: {
        shortRequestUrl,
        title: detail.songname || '未知歌曲',
        artist: detail.name || '未知歌手',
        cover: detail.cover || '',
        platform,
        source: 'XZG',
        audioUrl: detail.src,
        extra: {
          quality: detail.quality || '',
          duration: detail.interval ? this.parseDuration(detail.interval) : undefined,
          bitrate: detail.kbps ? parseInt(detail.kbps) : undefined,
          size: detail.size || '',
          album: detail.album || '',
          platformUrl: detail.songurl || ''
        }
      }
    }
  }

  private getPlatformFromUrl(url: string): Platform {
    if (url.includes('Kugou')) return 'kg'
    if (url.includes('Kuwo')) return 'kw'
    return 'wy'
  }

  private parseDuration(timeStr: string): number {
    const [min, sec] = timeStr.split('分')[0].split('秒')[0].split(':').map(Number)
    return (min * 60 + (sec || 0)) * 1000
  }
}