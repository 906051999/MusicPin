# MusicPin

音乐海，音乐交流站

## 技术栈
- Next.js 14
- TypeScript
- 请求API：Axios + React Query
- API数据验证：zod
- 数据缓存：tanstack/query-sync-storage-persister、tanstack/react-query-persist-client
- 全局状态：zustand
- 数据存储：localforage
- UI库：Mantine v7
- 动画：framer-motion
- 手势：use-gesture/react
- 通知：sonner 或 mantine/notifications
- 小工具：clsx、dayjs、lodash-es、ms

## 实现规划

1. （最高优先级）整合接口，统一返回数据格式
2. 接口容错
3. 自动内容纠错
4. 其他功能，后期实现

## 功能重心

### 搜索权重推荐
聚合搜索歌曲，根据权重排序返回结果，权重高的优先展示

### 自动内容纠错
假如某接口返回的歌曲信息不可用，则自动匹配其他接口的歌曲信息

### 歌单导出分享（后期实现）
支持markdown、json格式、特征码导出导入，自动匹配音乐形成歌单

### 音乐海（后期实现）
用户可以在音乐海中发现音乐，并且每日可以向音乐海中分享一首带点评的歌曲

## 免责声明
本项目仅供学习交流使用，只提供分享交流音乐的平台，项目不存储任何资源，所有资源均来自互联网。
使用本项目即表示您同意：
- 不得用于商业用途
- 资源版权归版权方所有
- 开发者不对任何因使用本项目造成的损失负责