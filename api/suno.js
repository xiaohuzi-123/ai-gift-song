// Suno API Integration
// Endpoint: https://api.evolink.ai/v1/suno
// API Key: GiftSong (stored in Vercel environment variables)

const API_ENDPOINT = 'https://api.evolink.ai/v1/suno';

/**
 * Generate song lyrics prompt from form data
 */
function generateLyricsPrompt(formData, emotion, style) {
  const { recipientName, nickname, sharedMemory, insideJoke, personalMessage } = formData;
  
  // Emotion-based tone mapping
  const emotionTones = {
    heartfelt: 'heartfelt, romantic, emotional',
    funny: 'playful, humorous, light-hearted',
    celebration: 'joyful, celebratory, exciting',
    healing: 'tender, soothing, comforting',
    hype: 'energetic, motivating, powerful'
  };

  // Style prompt mapping
  const stylePrompts = {
    pop: 'pop music style, catchy melody, modern production',
    folk: 'folk music style, acoustic guitar, storytelling',
    rnb: 'R&B style, smooth vocals, soulful groove',
    electronic: 'electronic music, synth beats, modern sound',
    rock: 'rock music, powerful guitars, high energy',
    acoustic: 'acoustic style, gentle melody, intimate feel'
  };

  const tone = emotionTones[emotion?.id] || 'heartfelt';
  const stylePrompt = stylePrompts[style?.id] || 'pop';

  // Build the lyrics structure with special details
  let prompt = `Create a ${tone} song in ${stylePrompt} format.\n\n`;
  
  if (nickname) {
    prompt += `Use the nickname "${nickname}" for the recipient throughout the song.\n`;
  }
  
  if (sharedMemory) {
    prompt += `Include the shared memory: "${sharedMemory}" as a key moment in the lyrics.\n`;
  }
  
  if (insideJoke) {
    prompt += `Reference the inside joke: "${insideJoke}" as a special callback.\n`;
  }
  
  prompt += `\nSong structure should include:\n`;
  prompt += `- Intro: Setting the mood\n`;
  prompt += `- Verse 1: Reference the shared memory\n`;
  prompt += `- Chorus: Main emotional message\n`;
  prompt += `- Verse 2: Reference the nickname/inside joke\n`;
  prompt += `- Bridge: Personal message\n`;
  prompt += `- Outro: Special dedication to ${recipientName}\n`;

  return prompt;
}

/**
 * Generate song using Suno API
 */
export async function generateSong(formData, emotion, style) {
  const prompt = generateLyricsPrompt(formData, emotion, style);
  const title = `${formData.nickname || formData.recipientName}'s Special Song`;

  try {
    const response = await fetch(`${API_ENDPOINT}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUNO_API_KEY || 'GiftSong'}`
      },
      body: JSON.stringify({
        prompt,
        style: style?.id || 'pop',
        title
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Suno API Error:', error);
    throw error;
  }
}

/**
 * Poll for song generation status
 */
export async function checkSongStatus(generationId) {
  try {
    const response = await fetch(`${API_ENDPOINT}/status/${generationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.SUNO_API_KEY || 'GiftSong'}`
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Suno API Error:', error);
    throw error;
  }
}

/**
 * Get song by ID
 */
export async function getSong(songId) {
  try {
    const response = await fetch(`${API_ENDPOINT}/song/${songId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.SUNO_API_KEY || 'GiftSong'}`
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Suno API Error:', error);
    throw error;
  }
}
