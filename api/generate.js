/**
 * Suno API Integration - Generate Endpoint
 * Handles song generation requests via Evolink API
 * 
 * API Docs: https://evolink.ai/suno
 * Endpoint: POST https://api.evolink.ai/v1/audios/generations
 */

// Simple in-memory storage for callback results (use Vercel KV in production)
const taskResults = new Map();

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      emotion,
      recipientName,
      nickname,
      sharedMemory,
      insideJoke,
      personalMessage,
      voiceType,
      songStyle,
      yourName
    } = req.body;

    // Validate required fields
    if (!emotion || !recipientName || !voiceType || !songStyle) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['emotion', 'recipientName', 'voiceType', 'songStyle']
      });
    }

    // Import lyrics generator from local API directory
    const { generateLyrics, extractSecrets, buildStyle, getVocalGender } = await import('./lyricsGenerator.js');

    // 1. Generate lyrics using our custom generator
    const lyrics = generateLyrics({
      emotion,
      recipientName,
      nickname,
      sharedMemory,
      insideJoke,
      personalMessage,
      voiceType
    });

    // Extract secret details for frontend highlighting
    const secretDetails = extractSecrets(lyrics);

    // 2. Build the precise style string for Suno
    const sunoStyle = buildStyle(emotion, voiceType, songStyle);

    // 3. Get vocal gender for API
    const vocalGender = getVocalGender(voiceType);

    // 4. Prepare callback URL (optional - Evolink works without it)
    const callbackUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}/api/callback`
      : undefined;

    // 5. Call Suno API via Evolink
    const apiKey = process.env.SUNO_API_KEY;
    
    if (!apiKey) {
      // If no API key, return mock response for development
      console.warn('No Suno API key found, returning mock response');
      return res.json({
        mock: true,
        taskId: `mock_${Date.now()}`,
        lyrics,
        secretDetails,
        style: sunoStyle,
        message: 'Development mode: No API key configured'
      });
    }

    const requestBody = {
        model: 'suno-v5-beta',
        custom_mode: true,
        prompt: lyrics,
        style: sunoStyle,
        title: `A Song for ${recipientName}`,
        vocal_gender: vocalGender || 'f',
        negative_tags: 'Heavy Metal, Screaming, Harsh vocals, Distorted guitars',
        style_weight: 0.55 + Math.random() * 0.25,
        weirdness: 0.3 + Math.random() * 0.4,
        callback_url: callbackUrl,
        wait_audio: false // We'll poll for results
      };

    const response = await fetch('https://api.evolink.ai/v1/audios/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Suno API Error:', response.status, errorData);
      
      // If quota insufficient or API error, return demo mode so user can still experience the product
      try {
        const parsed = JSON.parse(errorData);
        if (parsed.error?.code === 'insufficient_quota' || response.status === 402 || response.status === 429) {
          console.warn('Suno API quota insufficient, returning demo mode');
          return res.json({
            success: true,
            taskId: `demo_${Date.now()}`,
            lyrics,
            secretDetails,
            style: sunoStyle,
            isDemo: true,
            demoAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            message: 'Demo mode - API quota temporarily unavailable'
          });
        }
      } catch (e) {}
      
      return res.status(response.status).json({ 
        error: 'Failed to submit generation task',
        details: errorData
      });
    }

    const data = await response.json();
    
    // Extract task ID from response
    // Response format: { task_id: "xxx" } or { id: "xxx" }
    const taskId = data.task_id || data.id || data.data?.task_id;
    
    if (!taskId) {
      console.error('No task ID in response:', data);
      return res.status(500).json({ 
        error: 'No task ID returned from API',
        response: data
      });
    }

    // Store initial task info
    taskResults.set(taskId, {
      emotion,
      recipientName,
      nickname,
      lyrics,
      secretDetails,
      style: sunoStyle,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    // Return task info to frontend
    return res.json({
      success: true,
      taskId,
      lyrics,
      secretDetails,
      style: sunoStyle
    });

  } catch (error) {
    console.error('Generate API Error:', error);
    
    // If Suno API call fails for any reason, fall back to demo mode
    // so users can still experience the product
    console.warn('Falling back to demo mode due to error');
    return res.json({
      success: true,
      taskId: `demo_${Date.now()}`,
      lyrics: lyrics || 'A song from the heart',
      secretDetails: secretDetails || [],
      style: sunoStyle || 'Pop',
      isDemo: true,
      demoAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      message: 'Demo mode - ' + (error.message || 'Service temporarily unavailable')
    });
  }
}

// Export storage for use by callback
export { taskResults };
