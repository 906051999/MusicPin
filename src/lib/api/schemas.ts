import { z } from 'zod'

export const SearchResultSchema = z.object({
  shortRequestUrl: z.string(),
  title: z.string(),
  artist: z.string(),
  cover: z.string().optional(),
  platform: z.string(),
  source: z.string()
})

export const SongDetailSchema = z.object({
  shortRequestUrl: z.string(),
  title: z.string(), 
  artist: z.string(),
  cover: z.string(),
  platform: z.string(),
  source: z.string(),
  lyrics: z.string().optional(),
  cloudID: z.string().optional(),
  audioUrl: z.string(),
  extra: z.object({
    quality: z.string().optional(),
    duration: z.number().optional(),
    bitrate: z.number().optional(),
    size: z.string().optional(),
    album: z.string().optional(),
    platformUrl: z.string().optional()
  }).optional()
})

export const SearchResponseSchema = z.object({
  code: z.number(),
  msg: z.string().optional(),
  data: z.array(SearchResultSchema)
})

export const SongResponseSchema = z.object({
  code: z.number(),
  msg: z.string().optional(), 
  data: SongDetailSchema
}) 