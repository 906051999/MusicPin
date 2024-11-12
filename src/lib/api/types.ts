export interface SearchResponse {
    code: number;
    msg?: string;
    data: SearchResult[];
}

export interface SearchResult {
  // 唯一键,如 "sby/qqdg/?word=trip&n=1"
  shortRequestUrl: string;
  // 歌曲标题
  title: string;
  // 歌手
  artist: string;
  // 封面图片URL,可选
  cover?: string;
  // 平台标识: wy/qq/kg/bd/kw/mg/qs/dy/5s/xmly
  platform: string;
  // API源标识: CGG/LZ/SBY/XF/XZG
  source: string;
}

export interface SongResponse {
    code: number;
    msg?: string;
    data: SongDetail | null;
}

export interface SongDetail {
  // 唯一键,同搜索结果的key
  shortRequestUrl: string;
  // 歌曲标题  
  title: string;
  // 歌手
  artist: string;
  // 封面图片URL
  cover: string;
  // 平台标识
  platform: string;
  // API源标识
  source: string;
  // 歌词,可选
  lyrics?: string;
  // 平台ID,可选
  cloudID?: string;
  // 音频URL
  audioUrl: string;
  // 扩展信息
  extra?: {
    // 音质信息
    quality?: string;
    // 时长(ms)
    duration?: number;
    // 比特率
    bitrate?: number;
    // 文件大小
    size?: string;
    // 专辑信息
    album?: string;
    // 平台链接
    platformUrl?: string;
  };
}

export interface LyricResponse {
    code: number;
    msg?: string;
    data: {
      lyrics: string;
    };
}
