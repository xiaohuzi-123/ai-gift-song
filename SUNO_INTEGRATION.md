# AI Gift Song - Suno API Integration

## What's New

### 1. Voice Selection (Step 3)
Added a new step in the song creation flow:

**Voice Types:**
- 🎤 **Male** - Warm & soulful
- 🎧 **Female** - Sweet & expressive  
- 🎵 **Duet** - Together in harmony

**Music Styles:**
- Pop / Folk / R&B / Electronic / Rock / Acoustic

### 2. "Dai Zi Zhen" Level Quality

Voice styles are now described with studio-quality precision:

| Emotion | Voice | Style Description |
|---------|-------|-------------------|
| Heartfelt | Male + Pop | "Soft intimate pop ballad, warm male vocal with subtle rasp, breathy phrasing in verses, gentle vibrato on held notes..." |
| Heartfelt | Female + Folk | "Gentle acoustic folk, sweet breathy female vocal, light vibrato, soft head voice transitions..." |
| Funny | Male + Pop | "Quirky upbeat pop, playful male vocal with comedic timing, bouncy rhythm..." |
| Celebration | Female + Pop | "Joyful anthemic pop, powerful female vocal with soaring chorus, uplifting chords..." |
| Healing | Female + Acoustic | "Soothing acoustic, whispery female vocal, gentle and healing, sparse guitar..." |
| Hype | Male + Rock | "High-energy rock, gritty powerful male vocal, driving drums and distorted guitar..." |
| Duet | Any | "Call and response structure, harmonized chorus, [male vocal] / [female vocal] tags" |

### 3. Real Suno API Integration

**API Endpoints:**
- `POST /api/generate` - Submit song generation
- `GET /api/status?taskId=xxx` - Poll for results
- `POST /api/callback` - Webhook for completion

**Suno Parameters:**
```javascript
{
  model: 'suno-v5-beta',
  custom_mode: true,
  prompt: lyrics, // With [male vocal] / [female vocal] tags for duets
  tags: preciseStyleDescription, // e.g., "Soft intimate pop, warm male vocal..."
  vocal_gender: 'm' | 'f' | undefined,
  negative_tags: 'Heavy Metal, Screaming...',
  style_weight: 0.65,
  weirdness: 0.5
}
```

## Setup

### 1. Get API Key
1. Sign up at https://evolink.ai
2. Go to Dashboard → API Keys
3. Create a new key named "GiftSong"
4. Copy the key

### 2. Configure Environment

**Local Development (.env):**
```
SUNO_API_KEY=your_evolink_key_here
```

**Vercel:**
1. Go to your project → Settings → Environment Variables
2. Add `SUNO_API_KEY` with your key

### 3. Run

```bash
# Development (with mock API)
npm run dev

# Production
npm run build
```

## Testing

The app includes a mock API for development without using credits:

1. Start dev server: `npm run dev`
2. Fill out the form
3. On Step 3, select voice and style
4. Click "Create Song"
5. Watch the mock generation (no real API call)

To test real API:
1. Set `SUNO_API_KEY` environment variable
2. Submit a song
3. Wait 2-4 minutes for generation
4. Check Vercel logs for callback

## API Cost

- **Evolink Pricing:** $0.111 per song (8 credits)
- **$10 balance:** ~90 songs
- **Generation time:** 2-4 minutes typically

## File Structure

```
ai-gift-song/
├── api/
│   ├── generate.js    # Song generation endpoint
│   ├── status.js      # Poll task status
│   └── callback.js    # Webhook receiver
├── src/
│   ├── utils/
│   │   └── lyricsGenerator.js  # Lyrics + style generation
│   ├── pages/
│   │   ├── Landing.jsx   # Step 1-3 (emotion, story, voice)
│   │   ├── Generating.jsx # Real API integration
│   │   └── Result.jsx     # Display generated song
│   └── App.jsx
├── vite.config.js     # Mock API for dev
└── vercel.json        # API routing config
```

## Lyrics Quality Features

1. **Shared Memory Integration** - User's story becomes central narrative, not just a mention
2. **Nickname Usage** - Appears naturally at least twice in lyrics
3. **Inside Jokes** - Woven into verse or bridge with [secret:tag]
4. **Personal Message** - Inspires emotional chorus core
5. **Vivid Imagery** - Specific details, not generic phrases
6. **Proper Structure** - Intro → Verse 1 → Pre-Chorus → Chorus → Verse 2 → Chorus → Bridge → Final Chorus → Outro
7. **Secret Highlighting** - [secret:...] tags for frontend to extract and display
