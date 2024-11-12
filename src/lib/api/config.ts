// API源基础URL配置
export const API_BASE_URLS = {
    CGG: process.env.NEXT_PUBLIC_CGG_BASE_URL,
    LZ: process.env.NEXT_PUBLIC_LZ_BASE_URL,
    SBY: process.env.NEXT_PUBLIC_SBY_BASE_URL,
    XF: process.env.NEXT_PUBLIC_XF_BASE_URL,
    XZG: process.env.NEXT_PUBLIC_XZG_BASE_URL
  } as const;
  
  // API源类型
  export type APISource = keyof typeof API_BASE_URLS;

 // 增加API接口类型
export const API_INTERFACE = {
  'wy:sby': '云云(SBY)',
  'qq:sby': '秋秋(SBY)',
  'wy:xf': '云云(XF)',
  'kg:lz': '狗狗(LZ)',
  'kw:lz': '蜗蜗(LZ)',
  'wy:lz': '云云(LZ)',
  'kg_sq:lz': '狗狗高品(LZ)',
  'wy:xzg': '云云(XZG)',
  'kg:xzg': '狗狗(XZG)',
  'kw:xzg': '蜗蜗(XZG)',
  'dy:cgg': '豆豆(CGG)',
  'qs:cgg': '七七(CGG)',
  'xmly:cgg': '西西(CGG)'
} as const;
  
  // 平台标识
  export const PLATFORMS = {
    wy: '云云',
    qq: '秋秋',
    kg: '狗狗',
    kw: '蜗蜗',
    mg: '咕咕',
    bd: '点点',
    dy: '豆豆',
    qs: '七七',
    '5s': '五五',
    xmly: '西西'
  } as const;
  
  export type Platform = keyof typeof PLATFORMS;
  
  // 工具函数:根据简短key获取完整URL
  export function getFullUrl(shortKey: string): string {
    const source = shortKey.split('/')[0].toUpperCase() as APISource;
    if (!source || !API_BASE_URLS[source]) {
      throw new Error(`Invalid API source: ${source}`);
    }
    return `${API_BASE_URLS[source]}/${shortKey.slice(shortKey.split('/')[0].length + 1)}`;
  }
  
  // 工具函数:获取平台显示名称
  export function getPlatformName(platform: Platform): string {
    return PLATFORMS[platform];
  } 