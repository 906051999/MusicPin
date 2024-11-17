'use client'

import { useEffect, useCallback } from 'react'
import { Box, Button, Center, Loader } from '@mantine/core'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useIntersection } from '@mantine/hooks'
import styles from './MusicOcean.module.css'
import { MusicBubble } from '../MusicBubble/MusicBubble'
import { supabase } from '@/lib/supabase'

const ITEMS_PER_PAGE = 10

interface MusicComment {
  id: number
  title: string
  artist: string
  content: {
    review: string
    detail: string
  }
  status: string
  info: {
    likes: number
    play_count: number
  }
  user_id: string | null
  created_at: string
}

const fetchWithTimeout = async (promise: Promise<any>, timeout: number) => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), timeout)
  })
  return Promise.race([promise, timeoutPromise])
}

export function MusicOcean() {
  const { ref, entry } = useIntersection({
    threshold: 0.5,
    root: null
  })

  const { 
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error 
  } = useInfiniteQuery({
    queryKey: ['music-comments'],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        // 首先尝试通过 Supabase 客户端获取
        const supabasePromise = supabase.rpc('get_public_comments_with_count', {
          page_size: ITEMS_PER_PAGE,
          page_number: pageParam
        })

        const { data, error } = await fetchWithTimeout(supabasePromise, 3000)
        if (!error) {
          return {
            comments: data.comments as MusicComment[],
            nextPage: (pageParam + 1) * ITEMS_PER_PAGE < data.total_count ? pageParam + 1 : undefined
          }
        }
      } catch (e) {
        // 超时或其他错误，尝试通过后端 API 获取
        const response = await fetch(`/api/comments?pageSize=${ITEMS_PER_PAGE}&pageNumber=${pageParam}`)
        if (!response.ok) throw new Error('Failed to fetch comments')
        const data = await response.json()
        
        return {
          comments: data.comments as MusicComment[],
          nextPage: (pageParam + 1) * ITEMS_PER_PAGE < data.total_count ? pageParam + 1 : undefined
        }
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  })

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [entry?.isIntersecting, fetchNextPage, hasNextPage, isFetchingNextPage])

  if (isLoading) {
    return (
      <Center h={200}>
        <Loader />
      </Center>
    )
  }

  if (isError) {
    return (
      <Center h={200}>
        <div>Error: {error.message}</div>
      </Center>
    )
  }

  const comments = data?.pages.flatMap(page => page.comments) || []

  return (
    <Box className={styles.ocean}>
      <div className={styles.bubblesGrid}>
        {comments.map((comment) => (
          <MusicBubble
            key={comment.id}
            id={comment.id}
            song={comment.title}
            artist={comment.artist}
            comment={comment.content.review}
            status={comment.status}
            info={comment.info}
            user_id={comment.user_id}
            created_at={comment.created_at}
          />
        ))}
      </div>
      
      {hasNextPage && (
        <div ref={ref} style={{ height: '20px', margin: '20px 0' }}>
          {isFetchingNextPage && (
            <Center>
              <Loader size="sm" />
            </Center>
          )}
        </div>
      )}
    </Box>
  )
} 