import { useState, useEffect, useRef } from 'react';

const musicNotes = ['♪', '♫', '♬', '♩', '🎵', '🎶', '✨', '⭐'];

function Generating({ onComplete, formData, onResult }) {
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState([]);
  const [stage, setStage] = useState('lyrics'); // lyrics, generating, polling, complete
  const [taskId, setTaskId] = useState(null);
  const [error, setError] = useState(null);
  const pollingRef = useRef(null);
  
  // Form data passed from App
  const { emotion, recipientName, nickname, yourName, occasion, story, details, voiceType, songStyle } = formData || {};
  
  useEffect(() => {
    // Generate floating notes
    const generateNotes = () => {
      return Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 3 + Math.random() * 4,
        note: musicNotes[Math.floor(Math.random() * musicNotes.length)],
        size: 16 + Math.random() * 24
      }));
    };
    setNotes(generateNotes());
  }, []);
  
  // Start generation when component mounts
  useEffect(() => {
    if (formData && !taskId && !error) {
      startGeneration();
    }
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [formData]);

  // Progress animation
  useEffect(() => {
    let interval;
    
    if (stage === 'lyrics') {
      // Stage 1: Generating lyrics (fast)
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 25) {
            clearInterval(interval);
            setStage('generating');
            return 25;
          }
          return prev + (Math.random() * 5);
        });
      }, 150);
    } else if (stage === 'generating') {
      // Stage 2: Submitting to Suno (medium)
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 50) {
            clearInterval(interval);
            setStage('polling');
            return 50;
          }
          return prev + (Math.random() * 3);
        });
      }, 200);
    } else if (stage === 'polling') {
      // Stage 3: Waiting for Suno (slow, varies)
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            return 95; // Wait for actual completion
          }
          return prev + (Math.random() * 1.5);
        });
      }, 500);
    }
    
    return () => clearInterval(interval);
  }, [stage]);

  const startGeneration = async () => {
    try {
      setError(null);
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emotion,
          recipientName,
          nickname,
          yourName,
          occasion,
          sharedMemory: story,
          insideJoke: details,
          personalMessage: '', // Can be extracted from story if needed
          voiceType,
          songStyle
        })
      });
      
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error('Server returned invalid response. Please try again.');
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start generation');
      }
      
      setTaskId(data.taskId);
      
      // Store lyrics and secrets for passing to status API
      // (Vercel serverless doesn't share memory between functions)
      const generatedLyrics = data.lyrics || '';
      const generatedSecrets = data.secretDetails || [];
      
      // Demo mode - skip to result with demo audio
      if (data.isDemo || data.mock) {
        setTimeout(() => {
          setStage('complete');
          setProgress(100);
          onResult({
            ...data,
            audioUrl: data.demoAudioUrl || null,
            isMock: true,
            isDemo: data.isDemo || false
          });
          setTimeout(onComplete, 1000);
        }, 3000);
        return;
      }
      
      // Start polling for results (pass lyrics/secrets via query params)
      pollForResults(data.taskId, generatedLyrics, generatedSecrets);
      
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message);
    }
  };

  const pollForResults = async (id, lyrics, secretDetails) => {
    let attempts = 0;
    const maxAttempts = 180; // 3 minutes max (180 * 1 second)
    
    pollingRef.current = setInterval(async () => {
      attempts++;
      
      try {
        // Pass lyrics and secrets via query params (since serverless doesn't share memory)
        const params = new URLSearchParams({ taskId: id });
        if (lyrics) params.set('lyrics', encodeURIComponent(lyrics));
        if (secretDetails?.length > 0) params.set('secretDetails', encodeURIComponent(JSON.stringify(secretDetails)));
        
        const response = await fetch(`/api/status?${params.toString()}`);
        const data = await response.json();
        
        if (data.status === 'completed') {
          clearInterval(pollingRef.current);
          setStage('complete');
          setProgress(100);
          
          // Pass results to parent
          onResult({
            taskId: id,
            audioUrl: data.data?.[0]?.audio_url,
            audioUrl2: data.data?.[1]?.audio_url,
            title: data.data?.[0]?.title || `A Song for ${recipientName}`,
            lyrics: data.lyrics || lyrics,
            secretDetails: data.secretDetails || secretDetails,
            duration: data.data?.[0]?.duration
          });
          
          setTimeout(onComplete, 1000);
        } else if (data.status === 'failed' || attempts >= maxAttempts) {
          clearInterval(pollingRef.current);
          setError(data.error || 'Generation failed or timed out');
        }
      } catch (err) {
        console.error('Polling error:', err);
        if (attempts >= 10) { // Give up after 10 failed polls
          clearInterval(pollingRef.current);
          setError('Failed to check generation status');
        }
      }
    }, 2000); // Poll every 2 seconds
  };

  const getEmotionText = () => {
    const texts = {
      heartfelt: ' weaving your love into melody...',
      funny: ' adding jokes and laughter...',
      celebration: ' composing moments of joy...',
      healing: ' creating a soothing harmony...',
      hype: ' building an energetic beat...'
    };
    return texts[emotion] || ' crafting your unique melody...';
  };

  const getStageText = () => {
    switch (stage) {
      case 'lyrics':
        return 'Writing personalized lyrics...';
      case 'generating':
        return 'Submitting to AI music studio...';
      case 'polling':
        return 'Your song is being composed (usually 2-4 minutes)...';
      case 'complete':
        return 'Your song is ready!';
      default:
        return 'Creating your song...';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-red-900 via-pink-900 to-orange-900">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-red-500/20 rounded-full blur-[150px]" />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-md">
          <div className="text-6xl mb-6">😔</div>
          <h2 className="text-3xl font-bold mb-4 text-white">Generation Failed</h2>
          <p className="text-white/60 mb-8">{error}</p>
          
          <div className="glass-card p-6 mb-8">
            <h3 className="font-semibold mb-4">What happened?</h3>
            <p className="text-white/50 text-sm">
              The AI music service might be temporarily unavailable. Your lyrics have been saved 
              and we'll try again when the service is back online.
            </p>
          </div>
          
          <button
            onClick={onComplete}
            className="btn-cta"
          >
            Continue Anyway
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900">
      {/* Animated background blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-[150px] animate-breathe" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[150px] animate-breathe" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/10 rounded-full blur-[200px] animate-breathe" style={{ animationDelay: '4s' }} />
      </div>
      
      {/* Floating music notes */}
      {notes.map(note => (
        <div
          key={note.id}
          className="absolute pointer-events-none text-white/30 animate-note-float"
          style={{
            left: `${note.x}%`,
            top: `${note.y}%`,
            fontSize: `${note.size}px`,
            animationDelay: `${note.delay}s`,
            animationDuration: `${note.duration}s`
          }}
        >
          {note.note}
        </div>
      ))}
      
      {/* Content */}
      <div className="relative z-10 text-center px-6">
        {/* Vinyl Record */}
        <div className="mb-16">
          <div className={`vinyl-record mx-auto ${stage === 'complete' ? 'animate-spin-slow' : 'animate-spin-slow'}`}>
            <div className="vinyl-record-label">
              <div className="text-center">
                <span className="text-3xl">
                  {stage === 'complete' ? '✅' : '🎵'}
                </span>
              </div>
            </div>
            <div className="vinyl-record-hole" />
          </div>
        </div>
        
        {/* Text */}
        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
          {stage === 'complete' ? 'Your Song is Ready!' : 'Composing your story'}
          {stage !== 'complete' && <span className="inline-block animate-pulse">...</span>}
        </h2>
        <p className="text-xl text-white/60 mb-4">
          {getStageText()}
        </p>
        
        {/* For recipient */}
        {recipientName && (
          <p className="text-white/40 mb-8">
            A special song for {nickname || recipientName}
          </p>
        )}
        
        {/* Progress bar */}
        <div className="w-80 mx-auto mb-4">
          <div className="progress-bar">
            <div 
              className="progress-bar-fill"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-4 text-sm text-white/40">
            <span>{getEmotionText()}</span>
            <span>{Math.round(Math.min(progress, 100))}%</span>
          </div>
        </div>

        {/* Stage indicators */}
        <div className="flex justify-center gap-4 mt-8">
          {['lyrics', 'generating', 'polling', 'complete'].map((s, i) => (
            <div
              key={s}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                stage === s
                  ? 'bg-pink-500/30 text-pink-300'
                  : ['lyrics', 'generating', 'polling', 'complete'].indexOf(stage) > i
                    ? 'bg-green-500/30 text-green-300'
                    : 'bg-white/10 text-white/40'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                stage === s ? 'bg-pink-400 animate-pulse' :
                ['lyrics', 'generating', 'polling', 'complete'].indexOf(stage) > i ? 'bg-green-400' : 'bg-white/30'
              }`} />
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </div>
          ))}
        </div>
        
        {/* Polling indicator */}
        {stage === 'polling' && (
          <p className="text-white/30 text-sm mt-6">
            AI music generation takes 2-4 minutes. Please wait...
          </p>
        )}
        
        {/* Decorative elements */}
        <div className="mt-16 flex justify-center gap-8">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-white/30"
              style={{
                animation: `breathe 1.5s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Generating;
