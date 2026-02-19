'use client'

import { useState, useEffect, useRef } from 'react'
import { addBookmark } from '@/app/actions/bookmarks'
import { Plus } from 'lucide-react'

function validateUrl(value: string) {
  try {
    const url = new URL(value)

    // Protocol check
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false

    const hostname = url.hostname

    // Must contain at least one dot
    if (!hostname.includes('.')) return false

    // Split labels
    const labels = hostname.split('.')
    if (labels.some(label => !/^[a-zA-Z0-9-]+$/.test(label))) return false
    if (labels.some(label => label.startsWith('-') || label.endsWith('-'))) return false

    // TLD must be >= 2 chars
    const tld = labels[labels.length - 1]
    if (tld.length < 2) return false

    return true
  } catch {
    return false
  }
}



export default function AddBookmarkForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)
  const [isScraping, setIsScraping] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const formRef = useRef<HTMLFormElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  /* ---------------- URL VALIDATION ---------------- */
  useEffect(() => {
    if (!url) {
      setUrlError(null)
      setTitle('')
      return
    }

    if (!validateUrl(url)) {
      setUrlError('Enter a valid URL (including domain, e.g., example.com).')
      setTitle('')
      return
    }

    setUrlError(null)
  }, [url])

  /* ---------------- SCRAPING LOGIC ---------------- */
  useEffect(() => {
    if (!url || !validateUrl(url)) return

    const debounce = setTimeout(() => {
      scrapeTitle(url)
    }, 600)

    return () => clearTimeout(debounce)
  }, [url])

  async function scrapeTitle(targetUrl: string) {
    // Cancel ongoing request
    if (abortRef.current) {
      abortRef.current.abort()
    }

    const controller = new AbortController()
    abortRef.current = controller

    setIsScraping(true)
    setTitle('') // reset only when starting new scrape

    try {
      const res = await fetch(
        `/api/scrape?url=${encodeURIComponent(targetUrl)}`,
        { signal: controller.signal }
      )

      if (!res.ok) throw new Error('Failed to scrape')

      const data = await res.json()

      if (!controller.signal.aborted && data?.title) {
        setTitle(data.title)
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setUrlError('Unable to fetch title from this URL.')
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsScraping(false)
      }
    }
  }

  /* ---------------- SUBMIT ---------------- */
  async function handleSubmit(formData: FormData) {
    if (!validateUrl(url)) {
      setUrlError('Enter a valid URL before saving.')
      return
    }

    setIsSaving(true)
    try {
      await addBookmark(formData)
      handleClose()
    } finally {
      setIsSaving(false)
    }
  }

  /* ---------------- RESET ---------------- */
  function handleClose() {
    if (abortRef.current) {
      abortRef.current.abort()
    }

    setIsOpen(false)
    setUrl('')
    setTitle('')
    setUrlError(null)
    setIsScraping(false)
    formRef.current?.reset()
  }

  /* ---------------- UI ---------------- */
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg transition-all active:scale-95"
      >
        <Plus className="w-4 h-4 mr-2 inline text-white" />
        Add Bookmark
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-slate-200">

            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Save Bookmark
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Add a link to your smart library
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500"
              >
                ✕
              </button>
            </div>

            <form
              ref={formRef}
              action={handleSubmit}
              className="px-6 pb-6 space-y-6"
            >

              {/* URL */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">
                  Website URL
                </label>

                <input
                  name="url"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition
                    ${urlError
                      ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-400'
                      : 'border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500'
                    }`}
                  required
                />

                {urlError && (
                  <p className="text-xs text-red-500">
                    {urlError}
                  </p>
                )}
              </div>

              {/* TITLE */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">
                  Title
                </label>

                <p className="text-xs text-slate-400">
                  We’ll automatically fetch the page title. You can edit it.
                </p>

                <div className="relative">
                  <input
                    name="title"
                    type="text"
                    value={title}
                    disabled={isScraping || !!urlError}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      isScraping ? 'Fetching title...' : 'My Project'
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    required
                  />

                  {isScraping && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isSaving || isScraping || !!urlError}
                className="cursor-pointer w-full bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition"
              >
                {isSaving ? 'Saving...' : 'Save Bookmark'}
              </button>

            </form>
          </div>
        </div>
      )}
    </>
  )
}
