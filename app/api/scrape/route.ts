import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    // Fetch the page normally
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
      },
    })

    const reader = response.body?.getReader()
    if (!reader) return NextResponse.json({ title: 'Unknown Title' })

    const decoder = new TextDecoder('utf-8')
    let headHtml = ''
    let done = false

    while (!done) {
      const { value, done: streamDone } = await reader.read()
      done = streamDone
      if (value) {
        headHtml += decoder.decode(value, { stream: true })

        // Stop reading once we reach </head>
        if (headHtml.toLowerCase().includes('</head>')) {
          break
        }
      }
    }

    const $ = cheerio.load(headHtml)

    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text().trim() ||
      'Unknown Title'

    return NextResponse.json({ title })
  } catch (error) {
    return NextResponse.json({ title: 'Unknown Title' })
  }
}
