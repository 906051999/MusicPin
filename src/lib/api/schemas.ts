import { z } from 'zod'

export const SearchResultSchema = z.object({
  shortRequestUrl: z.string(),
  title: z.string().default('未知歌曲'),
  artist: z.string().default('未知歌手'),
  cover: z.string().nullable().optional().default(''),
  platform: z.string(),
  source: z.string(),
  extra: z.object({
    songId: z.union([z.number(), z.string()]).optional(),
    duration: z.number().optional()
  }).optional().default({})
})

export const SongDetailSchema = z.object({
  shortRequestUrl: z.string(),
  title: z.string().default('未知歌曲'),
  artist: z.string().default('未知歌手'),
  cover: z.string().nullable().optional().default(''),
  platform: z.string(),
  source: z.string(),
  lyrics: z.string().nullable().optional().default(''),
  cloudID: z.string().optional(),
  audioUrl: z.string(),
  extra: z.object({
    quality: z.string().optional(),
    duration: z.number().optional(),
    bitrate: z.number().optional(),
    size: z.string().optional(),
    album: z.string().optional().default(''),
    platformUrl: z.string().optional().default('')
  }).optional().default({})
}).strict()

export const SearchResponseSchema = z.object({
  code: z.number(),
  msg: z.string().optional().default(''),
  data: z.array(SearchResultSchema).default([])
})

export const SongResponseSchema = z.object({
  code: z.number(),
  msg: z.string().optional().default(''),
  data: SongDetailSchema.nullable()
}) 