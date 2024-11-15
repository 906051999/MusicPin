interface StandardUserData {
  id: string
  email: string | null
  user_metadata: {
    avatar_url?: string
    name?: string
    username?: string
    provider_id?: string
    provider?: string
    trust_level?: number
    active?: boolean
    silenced?: boolean
    email_verified?: boolean
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
    const metadata = user.user_metadata || {}
    return {
      id: user.id,
      email: user.email,
      user_metadata: {
        avatar_url: metadata.avatar_url,
        name: metadata.name || metadata.user_name,
        username: metadata.preferred_username || metadata.user_name,
        provider_id: metadata.provider_id,
        provider: 'github',
        email_verified: metadata.email_verified
      },
      app_metadata: {
        provider: 'github',
        providers: ['github']
      }
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
      provider: 'linuxdo',
      trust_level: user.trust_level,
      active: user.active,
      silenced: user.silenced,
      email_verified: true // Linux.do 用户默认邮箱已验证
    },
    app_metadata: {
      provider: 'linuxdo',
      providers: ['linuxdo']
    }
  }
} 