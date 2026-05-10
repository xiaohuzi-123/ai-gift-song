/**
 * Audio Proxy Endpoint
 * Bypasses CORS restrictions when playing Suno audio URLs
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter required' });
    }

    // Validate URL to prevent SSRF
    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return res.status(400).json({ error: 'Invalid protocol' });
      }
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Fetch audio from external URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-Gift-Song/1.0)'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch audio:', response.status, url);
      return res.status(response.status).json({ 
        error: 'Failed to fetch audio from source' 
      });
    }

    // Get content type and verify it's audio
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('audio')) {
      console.warn('Unexpected content type:', contentType);
    }

    // Stream the audio content
    const buffer = await response.arrayBuffer();
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.byteLength);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    res.send(Buffer.from(buffer));

  } catch (error) {
    console.error('Audio proxy error:', error);
    return res.status(500).json({ 
      error: 'Failed to proxy audio',
      message: error.message 
    });
  }
}
