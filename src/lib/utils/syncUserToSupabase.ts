import { createClient } from '@supabase/supabase-js'
import { v5 as uuidv5 } from 'uuid'
import fetch from 'node-fetch'

const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

if (!globalThis.fetch) {
  (globalThis as any).fetch = fetch
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      fetch: fetch as any,
    }
  }
)

interface LinuxDoUser {
  id: string
  email: string
  name: string
  username: string
  image: string
  trust_level: number
  active: boolean
  silenced: boolean
  api_key: string
}

export async function syncUserToSupabase(linuxdoUser: LinuxDoUser) {
  try {
    const now = new Date().toISOString()

    // 直接通过 email 查询用户
    const { data: { users: [existingUser] }, error: getUserError } = await supabaseAdmin
      .auth.admin.listUsers({
        filters: {
          email: linuxdoUser.email
        }
      })

    if (getUserError) {
      console.error('Get user error:', getUserError)
      return false
    }

    if (existingUser) {
      console.log('Updating existing user:', existingUser.email)
      // 用户已存在，只更新可变信息
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        {
          user_metadata: {
            name: linuxdoUser.name,
            avatar_url: linuxdoUser.image,
            trust_level: linuxdoUser.trust_level,
            active: linuxdoUser.active,
            silenced: linuxdoUser.silenced
          }
        }
      )

      if (updateError) {
        console.error('Update metadata error:', updateError)
        return false
      }

      // 更新身份信息时间戳
      const { error: identityError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id, 
        {
          identities: [{
            ...existingUser.identities?.[0],
            last_sign_in_at: now,
            updated_at: now
          }]
        }
      )

      if (identityError) {
        console.error('Update identity error:', identityError)
        return false
      }

      console.log('User updated successfully:', existingUser.email)
    } else {
      console.log('Creating new user:', linuxdoUser.email)
      // 创建新用户
      const supabaseUUID = uuidv5(`linuxdo_${linuxdoUser.id}`, NAMESPACE)
      const { error: createError } = await supabaseAdmin.auth.admin.createUser({
        id: supabaseUUID,
        email: linuxdoUser.email,
        email_confirm: true,
        user_metadata: {
          provider_id: linuxdoUser.id,
          username: linuxdoUser.username,
          name: linuxdoUser.name,
          avatar_url: linuxdoUser.image,
          trust_level: linuxdoUser.trust_level,
          active: linuxdoUser.active,
          silenced: linuxdoUser.silenced
        },
        app_metadata: {
          provider: 'linux.do',
          providers: ['linux.do']
        },
        identities: [{
          id: linuxdoUser.id,
          user_id: supabaseUUID,
          identity_data: {
            sub: linuxdoUser.id,
            email: linuxdoUser.email,
            name: linuxdoUser.name,
            preferred_username: linuxdoUser.username,
            picture: linuxdoUser.image
          },
          provider: 'linux.do',
          last_sign_in_at: now,
          created_at: now,
          updated_at: now
        }]
      })

      if (createError) {
        console.error('Create user error:', createError)
        return false
      }
      console.log('New user created successfully:', linuxdoUser.email)
    }

    return true
  } catch (error) {
    console.error('Failed to sync user to Supabase:', error)
    return false
  }
} 