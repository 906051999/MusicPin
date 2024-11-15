import NextAuth from 'next-auth'
import type { AuthOptions } from 'next-auth'

export const authOptions: AuthOptions = {
  debug: true,
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
        async request({ client, params, checks, provider }) {
          console.log('Token exchange starting with params:', {
            code: params.code,
            redirect_uri: provider.callbackUrl,
            clientId: provider.clientId
          })
          
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
              const error = await response.text()
              console.error('Token exchange failed:', {
                status: response.status,
                error
              })
              throw new Error(`Token exchange failed: ${error}`)
            }

            const tokens = await response.json()
            console.log('Token exchange successful:', {
              hasAccessToken: !!tokens.access_token
            })
            
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
          console.log('Requesting user info with token')
          try {
            const response = await fetch(provider.userinfo.url, {
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
              },
            })
            
            if (!response.ok) {
              const error = await response.text()
              console.error('Userinfo request failed:', {
                status: response.status,
                error
              })
              throw new Error(`Userinfo request failed: ${error}`)
            }

            const profile = await response.json()
            console.log('User info received:', {
              hasId: !!profile.id,
              hasEmail: !!profile.email
            })
            return profile
          } catch (error) {
            console.error('Userinfo request error:', error)
            throw error
          }
        }
      },
      profile(profile) {
        console.log('Raw profile from Linux.do:', profile)
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
    },
    async signIn({ user, account, profile }) {
      console.log('SignIn callback:', {
        hasUser: !!user,
        hasAccount: !!account,
        hasProfile: !!profile
      })
      try {
        if (account?.provider === 'linuxdo') {
          return true
        }
        return true
      } catch (error) {
        console.error('Sign in error:', error)
        return false
      }
    }
  },
  pages: {
    signIn: '/',
    error: '/'
  },
  events: {
    async error(error) {
      console.error('Auth error:', error)
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 