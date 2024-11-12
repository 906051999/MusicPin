import type { Metadata, Viewport } from 'next'
import Providers from './providers'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  title: 'MusicPin | 音乐海',
  description: '分享交流音乐的海洋',
  keywords: '音乐, 音乐分享, 音乐交流, MusicPin, 音乐海',
  authors: [{ name: 'MindMorbius' }],
  openGraph: {
    title: 'MusicPin | 音乐海',
    description: '分享交流音乐的海洋',
    type: 'website',
    url: 'https://music.rkpin.site',
    images: [
      {
        url: './favicon.ico',
        width: 800,
        height: 600,
        alt: 'MusicPin Logo',
      },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}