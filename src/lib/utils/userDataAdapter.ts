interface StandardUserData {
  id: string
  email: string | null
  user_metadata: {
    avatar_url?: string
    name?: string
    username?: string
    provider_id?: string
    trust_level?: number
    active?: boolean
    silenced?: boolean
    linuxdo_id?: string | number
  }
  app_metadata: {
    provider: string
    providers: string[]
  }
}

export function normalizeUserData(
  user: any, 
  provider: 'supabase' | 'nextauth'
): StandardUserData {
  if (provider === 'supabase') {
    return {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata || {},
      app_metadata: user.app_metadata || {}
    }
  }

  // NextAuth Linux.do 用户
  return {
    id: user.id || user.linuxdoId,
    email: user.email,
    user_metadata: {
      avatar_url: user.image,
      name: user.name,
      username: user.username,
      trust_level: user.trust_level,
      active: user.active,
      silenced: user.silenced,
      linuxdo_id: user.linuxdoId
    },
    app_metadata: {
      provider: 'linuxdo',
      providers: ['linuxdo']
    }
  }
} 