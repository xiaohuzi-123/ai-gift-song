/**
 * Suno API Integration - Status Endpoint
 * Poll task status and retrieve results
 * 
 * Endpoint: GET https://api.evolink.ai/v1/tasks/{task_id}
 */

// Shared task storage - will be merged with generate.js in Vercel edge
const taskResults = new Map();

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
    const { taskId } = req.query;

    if (!taskId) {
      return res.status(400).json({ error: 'Task ID required' });
    }

    // Check local cache first (for callback results)
    const cachedResult = taskResults.get(taskId);
    
    // Check if it's a mock task
    if (taskId.startsWith('mock_')) {
      // Return mock result for development
      return res.json({
        task_id: taskId,
        status: 'completed',
        data: cachedResult ? [
          {
            id: `mock_audio_${Date.now()}`,
            title: `A Song for ${cachedResult.recipientName || 'You'}`,
            audio_url: null, // No real audio in mock mode
            duration: 180,
            created_at: new Date().toISOString()
          }
        ] : [],
        lyrics: cachedResult?.lyrics || '',
        secretDetails: cachedResult?.secretDetails || [],
        is_mock: true
      });
    }

    // Call Suno API to check status
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
    
    // Update cache if we have stored info
    if (cachedResult && data.status === 'completed') {
      data.lyrics = cachedResult.lyrics;
      data.secretDetails = cachedResult.secretDetails;
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

export { taskResults };
