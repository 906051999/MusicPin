import { useEffect } from 'react'

interface MediaSessionData {
  title: string
  artist: string
  audioElement: HTMLAudioElement | null
}

export function useMediaSession(data: MediaSessionData) {
  useEffect(() => {
    if (!data.audioElement || !('mediaSession' in navigator)) return

    navigator.mediaSession.metadata = new MediaMetadata({
      title: data.title,
      artist: data.artist
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