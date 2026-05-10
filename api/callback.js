/**
 * Suno API Integration - Callback Endpoint
 * Receives webhook callbacks from Suno when generation completes
 * 
 * Note: In Vercel serverless, in-memory storage is ephemeral.
 * For production, use Vercel KV or a database to store results.
 */

// Shared task storage - will be merged with generate.js in Vercel edge
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
    const body = req.body;
    
    console.log('Suno Callback received:', JSON.stringify(body, null, 2));

    // Extract task info from callback
    // Callback format varies by provider, common patterns:
    const taskId = body.task_id || body.id || body.taskId;
    const status = body.status;
    const audioData = body.data || body.result || body.audios;

    if (!taskId) {
      console.warn('Callback missing task ID');
      return res.status(400).json({ error: 'Missing task ID' });
    }

    // Update task result in cache
    const existingResult = taskResults.get(taskId);
    if (existingResult) {
      taskResults.set(taskId, {
        ...existingResult,
        status: status || 'completed',
        audioData: audioData,
        completedAt: new Date().toISOString()
      });
    } else {
      // Create new entry if not exists
      taskResults.set(taskId, {
        status: status || 'completed',
        audioData: audioData,
        completedAt: new Date().toISOString()
      });
    }

    // Log for debugging
    if (status === 'completed' && audioData) {
      console.log(`Task ${taskId} completed with ${audioData.length} audio(s)`);
      audioData.forEach((audio, i) => {
        console.log(`  Audio ${i + 1}: ${audio.title} - ${audio.audio_url}`);
      });
    } else if (status === 'failed') {
      console.error(`Task ${taskId} failed:`, body.error || body.message);
    }

    // Always return 200 to acknowledge receipt
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Callback Error:', error);
    // Still return 200 to prevent retries
    return res.status(200).json({ received: true, error: error.message });
  }
}

export { taskResults };
