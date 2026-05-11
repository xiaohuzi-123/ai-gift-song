import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createServer } from 'vite'

// Development server with API mock
const mockApiPlugin = () => {
  return {
    name: 'mock-api',
    configureServer(server) {
      server.middlewares.use('/api/generate', async (req, res) => {
        if (req.method === 'POST') {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', () => {
            const data = JSON.parse(body)
            
            // Simulate API response
            const mockResponse = {
              mock: true,
              taskId: `mock_${Date.now()}`,
              lyrics: generateMockLyrics(data),
              secretDetails: [
                { text: data.sharedMemory?.substring(0, 50) || 'The special moment you shared', label: 'Your Memory' },
                { text: data.nickname || data.recipientName, label: 'Personal Nickname' },
                { text: data.insideJoke?.substring(0, 50) || 'The inside joke between you', label: 'Inside Joke' }
              ],
              style: `${data.emotion} ${data.songStyle} song`,
              message: 'Development mode mock'
            }
            
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.end(JSON.stringify(mockResponse))
          })
        } else {
          res.statusCode = 405
          res.end()
        }
      })
      
      server.middlewares.use('/api/status', async (req, res) => {
        const url = new URL(req.url, 'http://localhost')
        const taskId = url.searchParams.get('taskId')
        
        const mockResponse = {
          task_id: taskId,
          status: 'completed',
          data: [{
            id: `mock_audio_${Date.now()}`,
            title: `A Song for ${url.searchParams.get('recipientName') || 'You'}`,
            audio_url: null,
            duration: 180,
            created_at: new Date().toISOString()
          }],
          lyrics: generateMockLyrics({}),
          secretDetails: [],
          is_mock: true
        }
        
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.end(JSON.stringify(mockResponse))
      })
    }
  }
}

function generateMockLyrics(data) {
  return `[Intro]
♪ Soft instrumental intro ♪

[Verse 1]
Every moment with you is a treasure I hold dear
The way you light up my life is something words can't compare
Remember when we shared that beautiful moment
${data.sharedMemory || 'The memories we created together'}

[Pre-Chorus]
When I think of everything
Every smile, every laugh
I know there's something special
Between us, that's a fact

[Chorus]
This song is for you, ${data.nickname || data.recipientName || 'you'}
Every word I sing is true
From the bottom of my heart
I'm sending all my love to you

[Verse 2]
And then there's our little joke
Something only we know
${data.insideJoke || 'The secret that makes us smile'}
[secret:${data.insideJoke || 'Inside joke'}]

[Bridge]
There's something I need to say
From the depths of me to you
${data.personalMessage || 'You mean everything to me'}

[Final Chorus]
THIS song is for you, ${data.nickname || data.recipientName || 'you'}!
Every single word is true!
From the deepest part of me
I give my heart to you!

[Outro]
${data.nickname || 'You'}...
This is our song.
♪ Fade out ♪`
}

export default defineConfig({
  plugins: [react(), tailwindcss(), mockApiPlugin()],
  server: {
    port: 5173
  },
  define: {
    'import.meta.env.VITE_PAYPAL_CLIENT_ID': JSON.stringify(process.env.VITE_PAYPAL_CLIENT_ID || '')
  }
})
