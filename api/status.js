/**
 * Suno API Integration - Status Endpoint
 * Poll task status and retrieve results
 * 
 * Endpoint: GET https://api.evolink.ai/v1/tasks/{task_id}
 * 
 * NOTE: Vercel Serverless Functions don't share memory between invocations.
 * lyrics and secretDetails are passed via query parameters from frontend.
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
    const { taskId, lyrics, secretDetails } = req.query;

    if (!taskId) {
      return res.status(400).json({ error: 'Task ID required' });
    }

    // Check if it's a mock/demo task
    if (taskId.startsWith('mock_') || taskId.startsWith('demo_')) {
      // Parse lyrics and secrets from query params (base64 encoded if needed)
      let parsedLyrics = lyrics || '';
      let parsedSecrets = [];
      try {
        if (secretDetails) {
          parsedSecrets = JSON.parse(decodeURIComponent(secretDetails));
        }
      } catch (e) {
        console.warn('Failed to parse secretDetails:', e);
      }
      
      return res.json({
        task_id: taskId,
        status: 'completed',
        data: [{
          id: `demo_audio_${Date.now()}`,
          title: 'A Song for You',
          audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          duration: 180,
          created_at: new Date().toISOString()
        }],
        lyrics: parsedLyrics,
        secretDetails: parsedSecrets,
        is_demo: true
      });
    }

    // Call Suno/Evolink API to check status
    const apiKey = process.env.SUNO_API_KEY || process.env.EVOLINK_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const response = await fetch(`https://api.evolink.ai/v1/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Suno Status API Error:', response.status, errorData);
      return res.status(response.status).json({ 
        error: 'Failed to get task status',
        details: errorData
      });
    }

    const data = await response.json();
    
    // Pass lyrics and secretDetails from frontend (since we can't use server memory)
    if (lyrics) {
      data.lyrics = decodeURIComponent(lyrics);
    }
    if (secretDetails) {
      try {
        data.secretDetails = JSON.parse(decodeURIComponent(secretDetails));
      } catch (e) {
        console.warn('Failed to parse secretDetails:', e);
      }
    }

    // Normalize Evolink response format to match frontend expectations
    // Evolink returns: result_data[{audio_url, title, ...}], results[url, url]
    // Frontend expects: data[{audio_url, title, ...}]
    if (data.result_data && !data.data) {
      data.data = data.result_data;
    }
    if (data.data && data.data.length > 0 && !data.data[0].audio_url && data.results) {
      // Fallback: map results URLs to data objects
      data.data = data.results.map((url, i) => ({
        audio_url: url,
        title: data.result_data?.[i]?.title || `A Song for You`,
        duration: data.result_data?.[i]?.duration || 180,
        id: data.result_data?.[i]?.result_id || `audio_${i}`
      }));
    }

    return res.json(data);

  } catch (error) {
    console.error('Status API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
