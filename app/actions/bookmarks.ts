'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import * as cheerio from 'cheerio'

export async function addBookmark(formData: FormData) {
  const supabase = await createClient()
  let title = formData.get('title') as string
  const url = formData.get('url') as string

  if (!title || title.trim() === "") {
    try {
      // Add headers to bypass bot detection
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        next: { revalidate: 3600 }
      })

      const html = await response.text()
      const $ = cheerio.load(html)

      // Use the OpenGraph logic for better titles
      title = 
        $('meta[property="og:title"]').attr('content') || 
        $('meta[name="twitter:title"]').attr('content') || 
        $('title').text().trim() || 
        'Untitled Bookmark'

    } catch (error) {
      console.error('Scraping failed:', error)
      title = 'Untitled Bookmark'
    }
  }

  const { error } = await supabase
    .from('bookmarks')
    .insert([{ title, url }])

  if (error) {
    console.error('Error:', error.message)
    return
  }

  revalidatePath('/')
}

export async function deleteBookmark(formData: FormData) {
    const supabase = await createClient()
    const id = formData.get('id') as string

    const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting bookmark:', error.message)
        return
    }

    revalidatePath('/')
}