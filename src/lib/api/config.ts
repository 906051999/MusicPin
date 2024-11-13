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
  'xmly:cgg': '西西(CGG)',
  'bd:lz': '点点(LZ)', 
  'mg:lz': '咕咕(LZ)', 
  '5s:lz': '五五(LZ)', 
} as const;
  
  // 平台标识
  export const PLATFORMS = {
    wy: '云云',
    qq: '秋秋',
    kg: '狗狗',
    kg_sq: '狗狗高品',
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

  // 添加 API 成功状态码配置
export const API_SUCCESS_CODES = {
  CGG: [200],
  LZ: [200],
  SBY: [200],
  XF: [200],
  XZG: [0, 200]
} as const;

// 工具函数：检查是否为成功状态码
export function isSuccessCode(source: APISource, code: number): boolean {
  return API_SUCCESS_CODES[source].includes(code);
}

// 添加接口状态配置
export const API_STATUS = {
  // 云云
  'wy:sby': true,
  'wy:xf': true,
  'wy:xzg': true,
  'wy:lz': true,
  
  // 狗狗
  'kg_sq:lz': true,
  'kg:lz': true,
  'kg:xzg': true,
  
  // 咕咕
  'mg:lz': true,
  
  // 秋秋
  'qq:sby': false, // 11.13 搜索返回400
  
  // 蜗蜗
  'kw:lz': false, // 11.13 搜索cors问题
  'kw:xzg': false, // 11.13 搜索起始页码为0，结果对应不上
  
  // 其他
  'bd:lz': false, // 11.13 搜索cors问题
  'dy:cgg': false, // 11.13 搜索返回正常，播放cors问题
  'qs:cgg': false, // 11.13 搜索cors问题
  'xmly:cgg': false, //有声、电台
  '5s:lz': false, // 原创、伴奏、翻唱
} as const;

// 工具函数：检查接口是否可用
export function isInterfaceEnabled(platform: string, source: string): boolean {
  const key = `${platform}:${source.toLowerCase()}` as keyof typeof API_STATUS;
  return API_STATUS[key] ?? false;
}

// 平台颜色配置
export const PLATFORM_COLORS = {
  wy: '#E60026',   // 云云
  kg: '#00A9FF',   // 狗狗
  kg_sq: '#00A9FF', // 狗狗高品
  mg: '#FD3B74',   // 咕咕
  kw: '#FFE634',   // 蜗蜗
  bd: '#315EFB',   // 点点
  qq: '#12B7F5',   // 秋秋
  dy: '#FF0050',   // 豆豆
  qs: '#FF6A00',   // 七七
  '5s': '#FF4B4B', // 五五
  xmly: '#FF5100'  // 西西
} as const;

