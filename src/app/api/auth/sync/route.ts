import { syncUserToSupabase } from '@/lib/utils/syncUserToSupabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../[...nextauth]/route'

export async function POST() {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000) // 增加到15秒

  try {
    const session = await getServerSession(authOptions)
    console.log('Sync started for user:', session?.user?.email)
    
    if (!session?.user) {
      clearTimeout(timeoutId)
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const syncPromise = syncUserToSupabase({
      id: session.user.id,
      email: session.user.email!,
      name: session.user.name!,
      username: session.user.username!,
      image: session.user.image!,
      trust_level: session.user.trust_level,
      active: session.user.active,
      silenced: session.user.silenced,
      api_key: session.user.api_key
    })

    const success = await Promise.race([
      syncPromise,
      new Promise<boolean>((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          console.log('Sync operation timed out for user:', session.user.email)
          reject(new Error('Sync operation timed out'))
        })
      })
    ])

    clearTimeout(timeoutId)
    console.log('Sync completed for user:', session.user.email, 'success:', success)
    
    if (!success) {
      return NextResponse.json({ success: false, error: 'Sync failed' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    clearTimeout(timeoutId)
    console.error('Sync API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    }, { status: 500 })
  }
} 