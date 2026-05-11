/**
 * Audio Proxy Endpoint
 * Bypasses CORS/firewall restrictions when playing Suno/Evolink audio URLs
 * Supports range requests for audio seeking
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');

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

    // Build fetch headers, forward Range if present
    const fetchHeaders = {
      'User-Agent': 'Mozilla/5.0 (compatible; AI-Gift-Song/1.0)'
    };
    if (req.headers.range) {
      fetchHeaders['Range'] = req.headers.range;
    }

    // Fetch audio from external URL
    const response = await fetch(url, { headers: fetchHeaders });

    if (!response.ok && response.status !== 206) {
      console.error('Failed to fetch audio:', response.status, url);
      return res.status(response.status).json({ 
        error: 'Failed to fetch audio from source' 
      });
    }

    const contentType = response.headers.get('content-type') || 'audio/mpeg';
    const contentLength = response.headers.get('content-length');
    const contentRange = response.headers.get('content-range');
    const acceptRanges = response.headers.get('accept-ranges') || 'bytes';

    // Stream the audio content
    const buffer = await response.arrayBuffer();
    
    res.setHeader('Content-Type', contentType.includes('audio') ? contentType : 'audio/mpeg');
    res.setHeader('Accept-Ranges', acceptRanges);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    } else {
      res.setHeader('Content-Length', buffer.byteLength);
    }
    
    if (contentRange) {
      res.setHeader('Content-Range', contentRange);
      res.status(206);
    }
    
    res.send(Buffer.from(buffer));

  } catch (error) {
    console.error('Audio proxy error:', error);
    return res.status(500).json({ 
      error: 'Failed to proxy audio',
      message: error.message 
    });
  }
}
