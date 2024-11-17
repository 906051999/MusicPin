import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { getSystemPrompt } from '@/lib/config/openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL
})

export async function POST(req: Request) {
  try {
    const { content, systemPrompt, model } = await req.json()
    
    const messages = [
      ...(systemPrompt ? [{ role: 'system', content: getSystemPrompt(systemPrompt) }] : []),
      { role: 'user', content }
    ]

    const response = await client.chat.completions.create({
      model: model || 'Qwen/Qwen2.5-7B-Instruct',
      messages,
      stream: true
    })

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || ''
          controller.enqueue(new TextEncoder().encode(text))
        }
        controller.close()
      }
    })

    return new Response(stream)
    
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 })
  }
}