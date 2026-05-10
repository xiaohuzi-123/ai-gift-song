# AI Gift Song - A Song Only They Understand 🎵

> Create a personalized AI-generated song that's a unique musical gift, with hidden secrets only the recipient will understand.

![AI Gift Song](https://img.shields.io/badge/AI-Gift%20Song-ff6b9d?style=for-the-badge)
![Vercel](https://img.shields.io/badge/Vercel-Ready-000000?style=for-the-badge)

## ✨ Features

- **AI-Powered Song Generation** - Using Suno API for realistic, high-quality music
- **Personalized Lyrics** - Based on your story, memories, and inside jokes
- **Secret Messages** - Hidden details only you and the recipient will understand
- **Beautiful UI** - Heartwarming, gift-like presentation
- **Shareable** - Generate a unique link to share the song experience

## 🎯 How It Works

1. **Share Your Story** - Tell us about your relationship with the recipient
2. **Add Personal Touches** - Nicknames, shared memories, inside jokes
3. **Choose the Vibe** - Select emotion and music style
4. **Generate & Gift** - Get your unique AI-generated song

## 🛠️ Tech Stack

- **Frontend**: React 19, TailwindCSS 4, Vite
- **Backend**: Vercel Serverless Functions
- **AI**: Suno API (via Evolink)
- **Deployment**: Vercel

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env and add your SUNO_API_KEY

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
ai-gift-song/
├── api/                    # Vercel serverless functions
│   ├── generate.js        # Song generation endpoint
│   ├── status.js          # Task status polling
│   └── callback.js        # Webhook callback handler
├── src/
│   ├── components/        # React components
│   ├── pages/             # Page components
│   └── utils/             # Utilities (lyrics generator)
├── public/                # Static assets
├── vercel.json           # Vercel configuration
└── package.json
```

## 🔧 Environment Variables

```env
SUNO_API_KEY=your_suno_api_key
EVOLINK_API_KEY=your_evolink_api_key  # Alternative
```

## 📄 License

MIT License - Feel free to use and modify!
