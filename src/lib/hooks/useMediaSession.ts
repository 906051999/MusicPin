import { useEffect } from 'react'

interface MediaSessionData {
  title: string
  artist: string
  audioElement: HTMLAudioElement | null
  cover?: string | null
}

export function useMediaSession(data: MediaSessionData) {
  useEffect(() => {
    if (!data.audioElement || !('mediaSession' in navigator)) return

    navigator.mediaSession.metadata = new MediaMetadata({
      title: data.title,
      artist: data.artist,
      artwork: data.cover ? [
        { src: data.cover, sizes: '96x96', type: 'image/jpeg' },
        { src: data.cover, sizes: '128x128', type: 'image/jpeg' },
        { src: data.cover, sizes: '192x192', type: 'image/jpeg' },
        { src: data.cover, sizes: '256x256', type: 'image/jpeg' },
        { src: data.cover, sizes: '384x384', type: 'image/jpeg' },
        { src: data.cover, sizes: '512x512', type: 'image/jpeg' }
      ] : []
    })

    navigator.mediaSession.setActionHandler('play', () => data.audioElement?.play())
    navigator.mediaSession.setActionHandler('pause', () => data.audioElement?.pause())
    navigator.mediaSession.setActionHandler('stop', () => {
      data.audioElement?.pause()
      data.audioElement!.currentTime = 0
    })

    return () => {
      navigator.mediaSession.metadata = null
      navigator.mediaSession.setActionHandler('play', null)
      navigator.mediaSession.setActionHandler('pause', null)
      navigator.mediaSession.setActionHandler('stop', null)
    }
  }, [data])
} 