import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pageSize = Number(searchParams.get('pageSize')) || 10
  const pageNumber = Number(searchParams.get('pageNumber')) || 0
  const type = searchParams.get('type')

  try {
    if (type === 'songs') {
      const { data, error } = await supabase.rpc('get_unique_songs')
      
      if (error) throw error
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data format')
      }

      return NextResponse.json(data)
    }

    const { data, error } = await supabase.rpc('get_public_comments_with_count', {
      page_size: pageSize,
      page_number: pageNumber
    })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { id, counterName } = await request.json()
    
    const { error } = await supabase.rpc('increment_info_counter', {
      row_id: id,
      counter_name: counterName
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update counter' },
      { status: 500 }
    )
  }
} 