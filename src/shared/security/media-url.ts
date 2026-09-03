const VIDEO_ID = /^[A-Za-z0-9_-]{6,128}$/
const VIDEO_HOSTS = new Set(['vk.com', 'www.youtube.com', 'youtube.com', 'youtu.be'])

function parseHTTPSURL(value: string) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null
    return url
  } catch {
    return null
  }
}

export function isAllowedExternalImageURL(value: string, allowedHosts: readonly string[]) {
  const url = parseHTTPSURL(value)
  return Boolean(url && allowedHosts.includes(url.hostname.toLowerCase()))
}

export function toSafeVideoEmbedURL(value?: string | null) {
  if (!value) return null
  const url = parseHTTPSURL(value)
  if (!url || !VIDEO_HOSTS.has(url.hostname.toLowerCase())) return null

  const hostname = url.hostname.toLowerCase()
  if (hostname === 'youtube.com' || hostname === 'www.youtube.com') {
    const videoID = url.pathname === '/watch' ? url.searchParams.get('v') : url.pathname.startsWith('/embed/') ? url.pathname.slice(7) : null
    return videoID && VIDEO_ID.test(videoID) ? `https://www.youtube.com/embed/${videoID}` : null
  }
  if (hostname === 'youtu.be') {
    const videoID = url.pathname.slice(1)
    return VIDEO_ID.test(videoID) ? `https://www.youtube.com/embed/${videoID}` : null
  }
  if (hostname === 'vk.com' && url.pathname === '/video_ext.php') return url.toString()
  return null
}

export function validateSafeVideoURL(value: unknown) {
  if (value == null || value === '') return true
  return typeof value === 'string' && toSafeVideoEmbedURL(value)
    ? true
    : 'Разрешены только HTTPS-ссылки YouTube или VK Video.'
}
