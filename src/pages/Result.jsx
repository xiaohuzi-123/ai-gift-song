import { useState, useEffect, useRef } from 'react';

// Default lyrics for when no real lyrics provided
const defaultLyrics = [
  "♪ Instrumental intro setting the mood ♪",
  "",
  "Every moment with you",
  "Is a treasure I hold dear",
  "The way you light up my life",
  "Is something words can't compare",
  "",
  "This song is for you...",
  "Every word I sing is true",
  "From the bottom of my heart",
  "I'm sending all my love to you"
];

// Default secrets for display
const defaultSecrets = [
  { text: "The shared memory mentioned in your story", label: "Your Special Memory" },
  { text: "The nickname you provided", label: "Personal Nickname" },
  { text: "The inside joke from your details", label: "Inside Joke" }
];

function Result({ formData, resultData, onShare, onRestart }) {
  const [currentLine, setCurrentLine] = useState(0);
  const [showSecrets, setShowSecrets] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef(null);
  
  // Get data from form or result
  const { emotion, recipientName, nickname, yourName, occasion, voiceType, songStyle } = formData || {};
  const { 
    audioUrl, 
    audioUrl2, 
    title, 
    lyrics, 
    secretDetails, 
    duration,
    isMock 
  } = resultData || {};
  
  // Parse lyrics for display
  const lyricsLines = lyrics 
    ? lyrics.split('\n').filter(line => line.trim())
    : defaultLyrics;
  
  // Use provided secrets or defaults
  const displaySecrets = secretDetails?.length > 0 
    ? secretDetails 
    : defaultSecrets;
  
  // Filter chorus-like lines for typewriter effect
  const chorusLines = lyricsLines.filter(line => 
    line.includes('[') || line.length < 50
  ).slice(0, 15);

  useEffect(() => {
    // Lyrics typewriter effect
    const lines = chorusLines.length > 0 ? chorusLines : lyricsLines.slice(0, 12);
    const interval = setInterval(() => {
      setCurrentLine(prev => {
        if (prev < lines.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => setShowSecrets(true), 500);
          return prev;
        }
      });
    }, 600);
    
    return () => clearInterval(interval);
  }, []);

  // Handle audio playback
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Audio play error:', err);
          setAudioError(true);
        });
      }
    }
  }, [audioUrl, isPlaying]);

  const togglePlay = () => {
    if (!audioUrl || isMock) {
      // Show message that audio isn't available
      setAudioError(true);
      return;
    }
    
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.error('Audio play error:', err);
          setAudioError(true);
        });
      }
    }
    setIsPlaying(!isPlaying);
  };

  const getEmotionGradient = () => {
    const gradients = {
      heartfelt: 'from-rose-400 to-pink-600',
      funny: 'from-amber-400 to-orange-500',
      celebration: 'from-violet-500 to-purple-600',
      healing: 'from-cyan-400 to-blue-500',
      hype: 'from-red-500 to-orange-500'
    };
    return gradients[emotion] || 'from-pink-500 to-purple-600';
  };

  const getVoiceLabel = () => {
    const labels = {
      male: 'Male Vocal',
      female: 'Female Vocal',
      duet: 'Duet'
    };
    return labels[voiceType] || 'Song';
  };

  const getStyleLabel = () => {
    const labels = {
      pop: 'Pop',
      folk: 'Folk',
      rnb: 'R&B',
      electronic: 'Electronic',
      rock: 'Rock',
      acoustic: 'Acoustic'
    };
    return labels[songStyle] || 'Pop';
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] py-12 px-6">
      {/* Hidden audio element */}
      <audio 
        ref={audioRef} 
        onEnded={() => setIsPlaying(false)}
        onError={() => setAudioError(true)}
      />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="badge-gradient inline-flex items-center gap-2 mb-6">
            <span>✨</span>
            {isMock ? 'Preview Mode' : 'Your Song is Ready'}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            A Song for <span className="gradient-text">{nickname || recipientName}</span>
          </h1>
          <p className="text-white/50 text-lg">"{occasion}" — from {yourName}</p>
          
          {/* Song metadata */}
          <div className="flex justify-center gap-4 mt-4">
            <span className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-sm">
              {getVoiceLabel()}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-sm">
              {getStyleLabel()}
            </span>
            {duration && (
              <span className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-sm">
                {Math.round(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
              </span>
            )}
          </div>
        </div>
        
        {/* Mock mode notice */}
        {isMock && (
          <div className="glass-card p-6 mb-8 border border-yellow-500/30 bg-yellow-500/10">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <div className="font-semibold text-yellow-300 mb-1">Preview Mode</div>
                <p className="text-white/60 text-sm">
                  No API key configured. This shows a preview of how your song will look when generated.
                  Connect your Suno API key to create real songs.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Album Card */}
        <div className="glass-card p-8 md:p-12 mb-12 relative overflow-hidden">
          {/* Album art */}
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className={`w-48 h-48 rounded-2xl bg-gradient-to-br ${getEmotionGradient()} flex items-center justify-center shadow-2xl flex-shrink-0 relative overflow-hidden`}>
              {/* Decorative pattern */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-4 left-4 w-16 h-16 border-2 border-white/30 rounded-full" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border border-white/20 rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-white/20 rounded-full" />
              </div>
              <span className="text-6xl relative z-10">🎵</span>
            </div>
            
            {/* Song info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">{title || 'Our Song'}</h2>
              <p className="text-white/50 mb-2">AI Gift Song • {occasion}</p>
              <p className="text-white/30 text-sm mb-6">
                {getVoiceLabel()} • {getStyleLabel()}
              </p>
              
              {/* Play button */}
              <button
                onClick={togglePlay}
                className={`inline-flex items-center gap-3 px-8 py-4 rounded-full transition-all duration-300 border ${
                  audioUrl && !isMock
                    ? 'bg-white/10 hover:bg-white/20 cursor-pointer'
                    : 'bg-white/5 cursor-not-allowed opacity-50'
                } border-white/10`}
              >
                <div className={`w-10 h-10 rounded-full bg-white/20 flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                  {audioError ? (
                    <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : isPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </div>
                <span className="font-semibold">
                  {audioError ? 'Audio Unavailable' : isPlaying ? 'Pause' : 'Play Song'}
                </span>
              </button>
              
              {audioError && !isMock && (
                <p className="text-yellow-400/60 text-xs mt-2">
                  Audio playback unavailable. The song may still be generating.
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Lyrics */}
        <div className="glass-card p-8 md:p-12 mb-12">
          <h3 className="text-xl font-semibold mb-8 text-white/80 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center text-sm">♪</span>
            Lyrics Preview
          </h3>
          
          <div className="space-y-3">
            {(chorusLines.length > 0 ? chorusLines : lyricsLines).map((line, index) => (
              <p 
                key={index}
                className={`text-lg md:text-xl leading-relaxed transition-all duration-500 ${
                  index <= currentLine ? 'text-white opacity-100' : 'text-white/20'
                } ${line.includes('[') ? 'text-pink-300/60 text-sm uppercase mt-4' : ''}`}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {line.replace(/\[.*?\]/g, '').trim() || '\u00A0'}
              </p>
            ))}
          </div>
          
          {!lyrics && !isMock && (
            <p className="text-white/30 text-center mt-8 italic">
              Full lyrics will appear here when your song is generated
            </p>
          )}
        </div>
        
        {/* Secret Details */}
        {showSecrets && (
          <div className="glass-card p-8 md:p-12 mb-12 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                <span className="text-lg">🔐</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold">3 Details Only They Understand</h3>
                <p className="text-white/50 text-sm">Hover to reveal what makes this song truly personal</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {displaySecrets.map((secret, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <span className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <span className="text-white/40 text-xs block">{secret.label}</span>
                    <span className="secret-highlight text-lg">
                      {secret.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={onShare}
            className="btn-cta inline-flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Share as Musical Letter
          </button>
          <button 
            onClick={onRestart}
            className="btn-outline inline-flex items-center justify-center gap-2"
          >
            Create Another Song
          </button>
        </div>
      </div>
    </div>
  );
}

export default Result;
