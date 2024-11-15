import type { AuthOptions } from 'next-auth'

export const authOptions: AuthOptions = {
  debug: false,
  providers: [
    {
      id: 'linuxdo',
      name: 'Linux.do',
      type: 'oauth',
      clientId: process.env.LINUX_DO_OAUTH_CLIENT_ID,
      clientSecret: process.env.LINUX_DO_OAUTH_CLIENT_SECRET,
      authorization: {
        url: 'https://connect.linux.do/oauth2/authorize',
        params: { scope: 'read' }
      },
      token: {
        url: 'https://connect.linux.do/oauth2/token',
        async request({ params, provider }) {
          try {
            const response = await fetch('https://connect.linux.do/oauth2/token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                client_id: provider.clientId,
                client_secret: provider.clientSecret,
                grant_type: 'authorization_code',
                code: params.code,
                redirect_uri: provider.callbackUrl,
              }),
            })
            
            if (!response.ok) {
              throw new Error(`Token exchange failed: ${await response.text()}`)
            }

            const tokens = await response.json()            
            return { tokens }
          } catch (error) {
            console.error('Token exchange error:', error)
            throw error
          }
        }
      },
      userinfo: {
        url: 'https://connect.linux.do/api/user',
        async request({ tokens, provider }) {
          const response = await fetch(provider.userinfo.url, {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          })
            
          if (!response.ok) {
            throw new Error(`Userinfo request failed: ${await response.text()}`)
          }

          return response.json()
        }
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.username,
          email: profile.email,
          image: profile.avatar_url || profile.avatar_template,
          username: profile.username || profile.login,
          trust_level: profile.trust_level,
          active: profile.active,
          silenced: profile.silenced,
          api_key: profile.api_key,
          external_ids: profile.external_ids,
        }
      }
    }
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('SignIn callback triggered:', { 
        userId: user.id,
        provider: account?.provider,
        profile: profile
      })

      if (account?.provider === 'linuxdo') {
        const userData = {
          id: user.id,
          email: user.email!,
          name: user.name!,
          username: profile.username || profile.login,
          image: user.image!,
          trust_level: profile.trust_level,
          active: profile.active,
          silenced: profile.silenced,
          api_key: profile.api_key
        }
        
        return true
      }
      return true
    },
    async jwt({ token, account, profile }: any) {
      if (account && profile) {
        return {
          ...token,
          linuxdoId: profile.id,
          username: profile.username || profile.login,
          name: profile.name,
          email: profile.email,
          avatar_url: profile.avatar_url || profile.avatar_template,
          active: profile.active,
          trust_level: profile.trust_level,
          silenced: profile.silenced,
          api_key: profile.api_key,
          accessToken: account.access_token
        }
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      return {
        ...session,
        user: {
          ...session.user,
          linuxdoId: token.linuxdoId,
          username: token.username,
          name: token.name,
          email: token.email,
          image: token.avatar_url,
          active: token.active,
          trust_level: token.trust_level,
          silenced: token.silenced,
          api_key: token.api_key
        },
        accessToken: token.accessToken
      }
    }
  },
  pages: {
    signIn: '/',
    error: '/'
  }
}