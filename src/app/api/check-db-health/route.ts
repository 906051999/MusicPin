import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    // 测试直接访问 Supabase URL 的延迟
    const directStart = Date.now()
    const directResponse = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL!)
    const directLatency = Date.now() - directStart

    // 测试 RPC 调用的延迟
    const rpcStart = Date.now()
    const { data, error } = await supabase.rpc('check_db_health')
    const rpcLatency = Date.now() - rpcStart
    
    if (error) throw error

    return NextResponse.json({
      timestamp: data.timestamp,
      connections: data.connections,
      version: data.version,
      serverMetrics: {
        directLatency,    // 服务器直接访问 Supabase 的延迟
        rpcLatency,       // 服务器 RPC 调用的延迟
        directStatus: directResponse.status,
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
} 