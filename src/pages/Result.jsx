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

const PREVIEW_DURATION = 40; // 40 seconds preview
const FULL_PRICE = 4.99;

function Result({ formData, resultData, onShare, onRestart, isPaid, setIsPaid }) {
  const [paypalClientId, setPaypalClientId] = useState('');
  const [currentLine, setCurrentLine] = useState(0);
  const [showSecrets, setShowSecrets] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const audioRef = useRef(null);
  const paypalContainerRef = useRef(null);
  const previewTimerRef = useRef(null);

  // Fetch PayPal Client ID from server at runtime
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.paypalClientId) {
          setPaypalClientId(data.paypalClientId);
        }
      })
      .catch(err => console.error('Failed to load config:', err));
  }, []);
  
  // Get data from form or result
  const { emotion, recipientName, nickname, yourName, occasion, voiceType, songStyle } = formData || {};
  const { 
    audioUrl, 
    audioUrl2, 
    title, 
    lyrics, 
    secretDetails, 
    duration,
    isMock,
    songId
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

  // Format time display
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const totalSecs = Math.round(seconds); // Fix floating point: 202.4 → 202
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const getProgressPercent = () => {
    const maxTime = isPaid ? (duration || 180) : PREVIEW_DURATION;
    return Math.min((currentTime / maxTime) * 100, 100);
  };

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

  // Get audio source - try direct URL first, fallback to proxy
  const getAudioSource = () => {
    if (!audioUrl) return null;
    // Demo audio URL - use directly
    if (audioUrl.includes('soundhelix.com')) {
      return audioUrl;
    }
    // For external CDN URLs, use proxy to bypass China firewall issues
    // Direct access may fail for users behind GFW
    return `/api/proxy-audio?url=${encodeURIComponent(audioUrl)}`;
  };

  // Handle audio playback with 40-second limit
  useEffect(() => {
    const audioSource = getAudioSource();
    if (audioSource && audioRef.current) {
      audioRef.current.src = audioSource;
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Audio play error:', err);
          // If proxy fails, try direct URL as fallback
          if (audioUrl && !audioUrl.includes('soundhelix.com')) {
            console.log('Proxy failed, trying direct URL...');
            audioRef.current.src = audioUrl;
            audioRef.current.play().catch(err2 => {
              console.error('Direct URL also failed:', err2);
              setAudioError(true);
            });
          } else {
            setAudioError(true);
          }
        });
      }
    }
  }, [audioUrl, isPlaying]);

  // Time update handler for 40-second preview limit
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const current = audio.currentTime;
      setCurrentTime(current);
      
      // Enforce 40-second preview limit for non-paid users
      if (!isPaid && current >= PREVIEW_DURATION) {
        audio.pause();
        setIsPlaying(false);
        setShowUpgradePrompt(true);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
  }, [isPaid]);

  // Backup timer to ensure 40-second cutoff even if timeupdate doesn't fire frequently
  useEffect(() => {
    if (isPlaying && !isPaid) {
      // Clear any existing timer
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
      }
      
      // Set a timer to check at 40 seconds
      const remainingTime = (PREVIEW_DURATION - currentTime) * 1000;
      if (remainingTime > 0) {
        previewTimerRef.current = setTimeout(() => {
          if (audioRef.current && !isPaid && audioRef.current.currentTime >= PREVIEW_DURATION - 1) {
            audioRef.current.pause();
            setIsPlaying(false);
            setShowUpgradePrompt(true);
          }
        }, remainingTime + 500);
      }
    }
    
    return () => {
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
      }
    };
  }, [isPlaying, isPaid, currentTime]);

  // Initialize PayPal button
  useEffect(() => {
    if (isPaid || !paypalContainerRef.current || !paypalClientId) return;
    
    // Check if PayPal SDK is loaded
    if (window.paypal && paypalContainerRef.current && !paypalContainerRef.current.hasChildNodes()) {
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal'
        },
        createOrder: async (data, actions) => {
          try {
            setIsProcessingPayment(true);
            setPaymentError('');
            
            // Call backend to create PayPal order
            const response = await fetch('/api/create-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                amount: FULL_PRICE,
                songId: songId || 'default-song',
                songTitle: title || 'AI Gift Song'
              }),
            });
            
            const orderData = await response.json();
            
            if (!response.ok) {
              console.error('Create order failed:', response.status, orderData);
              setPaymentError(orderData.message || orderData.error || 'Failed to create order. Please try again.');
              throw new Error(orderData.message || orderData.error || 'Failed to create order');
            }
            
            if (!orderData.orderId) {
              console.error('No orderId in response:', orderData);
              setPaymentError('Payment setup failed. Please try again.');
              throw new Error('No order ID returned');
            }
            
            return orderData.orderId;
          } catch (error) {
            console.error('Order creation error:', error);
            if (!paymentError) {
              setPaymentError('Failed to create order. Please try again.');
            }
            throw error;
          } finally {
            setIsProcessingPayment(false);
          }
        },
        onApprove: async (data, actions) => {
          try {
            // Capture the payment
            const response = await fetch('/api/capture-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderId: data.orderID,
                songId: songId || 'default-song'
              }),
            });
            
            const captureData = await response.json();
            
            if (captureData.success) {
              setIsPaid(true);
              setShowUpgradePrompt(false);
              
              // Provide download link
              if (captureData.downloadUrl) {
                // Trigger download
                const link = document.createElement('a');
                link.href = captureData.downloadUrl;
                link.download = `${title || 'gift-song'}.mp3`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            } else {
              setPaymentError(captureData.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment capture error:', error);
            setPaymentError('Payment verification failed. Please contact support.');
          }
        },
        onError: (error) => {
          console.error('PayPal error:', error);
          setPaymentError('Payment failed. Please try again.');
        },
        onCancel: () => {
          console.log('Payment cancelled');
        }
      }).render(paypalContainerRef.current);
    }
  }, [isPaid, songId, title, setIsPaid, paypalClientId]);

  const togglePlay = () => {
    if (!audioUrl) {
      setAudioError(true);
      return;
    }
    
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        // Clear preview timer on pause
        if (previewTimerRef.current) {
          clearTimeout(previewTimerRef.current);
        }
      } else {
        // If resuming from upgrade prompt, start from 0
        if (showUpgradePrompt) {
          audioRef.current.currentTime = 0;
          setCurrentTime(0);
          setShowUpgradePrompt(false);
        }
        // Ensure audio source is set (in case it wasn't loaded yet)
        const audioSource = getAudioSource();
        if (audioRef.current.src !== audioSource && audioSource) {
          audioRef.current.src = audioSource;
        }
        audioRef.current.play().catch(err => {
          console.error('Audio play error:', err);
          // If proxy fails, try direct URL as fallback
          if (audioUrl && !audioUrl.includes('soundhelix.com') && audioRef.current.src.includes('proxy-audio')) {
            console.log('Proxy failed in togglePlay, trying direct URL...');
            audioRef.current.src = audioUrl;
            audioRef.current.play().catch(err2 => {
              console.error('Direct URL also failed:', err2);
              setAudioError(true);
            });
          } else {
            setAudioError(true);
          }
        });
        
        // Set backup timer for preview cutoff
        if (!isPaid) {
          if (previewTimerRef.current) {
            clearTimeout(previewTimerRef.current);
          }
          const remainingTime = (PREVIEW_DURATION - (audioRef.current.currentTime || 0)) * 1000;
          if (remainingTime > 0) {
            previewTimerRef.current = setTimeout(() => {
              if (audioRef.current && !isPaid && audioRef.current.currentTime >= PREVIEW_DURATION - 1) {
                audioRef.current.pause();
                setIsPlaying(false);
                setShowUpgradePrompt(true);
              }
            }, remainingTime + 500);
          }
        }
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
        onEnded={() => {
          setIsPlaying(false);
          if (!isPaid) setShowUpgradePrompt(true);
        }}
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
                {formatTime(duration)}
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
                <div className="font-semibold text-blue-300 mb-1">Demo Preview</div>
                <p className="text-white/60 text-sm">
                  This is a preview of your personalized song. The full version will be uniquely crafted with your story and details.
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
                  audioUrl
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

        {/* ===== Upgrade/Payment Section - Always Visible for Non-Paid Users ===== */}
        {!isPaid && audioUrl && (
          <div className="glass-card p-8 mb-8 border border-pink-500/30 bg-gradient-to-r from-pink-500/5 to-purple-500/5">
            {/* Preview Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                  <span className="text-lg">🎧</span>
                </div>
                <div>
                  <div className="font-semibold text-white">Free Preview</div>
                  <div className="text-white/50 text-sm">40 seconds included</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">${FULL_PRICE}</div>
                <div className="text-white/50 text-xs">Full Song</div>
              </div>
            </div>

            {/* Progress Bar with 40s marker */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-white/60 mb-2">
                <span>{formatTime(currentTime)} / {isPaid ? formatTime(duration || 180) : formatTime(PREVIEW_DURATION)}</span>
                <span className={!isPaid ? 'text-pink-400' : 'text-green-400'}>
                  {isPaid ? 'Full Version' : 'Preview'}
                </span>
              </div>
              
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                {/* Progress fill */}
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-100"
                  style={{ width: `${getProgressPercent()}%` }}
                />
                {/* 40-second marker */}
                {!isPaid && (
                  <div 
                    className="absolute top-0 h-full w-0.5 bg-yellow-400 z-10"
                    style={{ left: `${(PREVIEW_DURATION / (duration || 180)) * 100}%` }}
                  />
                )}
              </div>
              
              <div className="flex justify-between text-xs text-white/40 mt-1">
                <span>0:00</span>
                <span className="text-yellow-400/60">{formatTime(PREVIEW_DURATION)} Preview End</span>
                <span>{formatTime(duration || 180)}</span>
              </div>
            </div>

            {/* Upgrade Prompt - Always visible */}
            <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl p-6 border border-pink-500/30 animate-fade-in-up">
              <div className="text-center">
                <div className="text-4xl mb-3">{showUpgradePrompt ? '💝' : '✨'}</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {showUpgradePrompt ? 'Love this song?' : 'Unlock the Full Version'}
                </h3>
                <p className="text-white/70 mb-4">
                  {showUpgradePrompt 
                    ? `You've heard ${PREVIEW_DURATION} seconds - unlock the full ${formatTime(duration || 180)} song!`
                    : `Get unlimited access to this ${formatTime(duration || 180)} personalized song`}
                  {' for just '}<span className="text-pink-400 font-bold">${FULL_PRICE}</span>
                </p>
                
                {/* Price comparison */}
                <div className="bg-white/5 rounded-lg px-4 py-2 mb-6 inline-block">
                  <p className="text-white/60 text-sm">
                    Others charge <span className="line-through text-white/40">$179</span>
                    <span className="text-green-400 font-bold ml-2">We're just ${FULL_PRICE}</span>
                  </p>
                </div>

                {/* Payment Error */}
                {paymentError && (
                  <div className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
                    {paymentError}
                  </div>
                )}

                {/* PayPal Button Container */}
                <div ref={paypalContainerRef} className="max-w-xs mx-auto">
                  {isProcessingPayment && (
                    <div className="text-center py-4">
                      <div className="inline-block w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      <span className="text-white/70">Processing...</span>
                    </div>
                  )}
                </div>

                {/* Manual PayPal SDK check with retry */}
                {!paypalClientId ? (
                  <p className="text-white/40 text-xs mt-2">
                    Loading payment options...
                  </p>
                ) : !window.paypal ? (
                  <div className="mt-3">
                    <p className="text-yellow-400/60 text-xs mb-2">
                      PayPal SDK loading...
                    </p>
                    <button
                      onClick={() => {
                        // Retry loading PayPal SDK
                        if (paypalClientId && !window.paypal) {
                          const script = document.createElement('script');
                          script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD&intent=capture`;
                          script.async = true;
                          document.head.appendChild(script);
                        }
                      }}
                      className="text-pink-400 text-xs underline hover:text-pink-300"
                    >
                      Retry loading PayPal
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* ===== Paid User Full Download Section ===== */}
        {isPaid && (
          <div className="glass-card p-8 mb-8 border border-green-500/30 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <span className="text-xl">✅</span>
                </div>
                <div>
                  <div className="font-semibold text-white text-lg">Full Version Unlocked!</div>
                  <div className="text-white/50 text-sm">Thank you for supporting AI Gift Song</div>
                </div>
              </div>
              <button
                onClick={() => {
                  // Trigger download from stored download URL or regenerate
                  const link = document.createElement('a');
                  link.href = audioUrl;
                  link.download = `${title || 'gift-song'}.mp3`;
                  link.target = '_blank';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:opacity-90 transition-opacity"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Full MP3
              </button>
            </div>
            
            {/* Full progress bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-white/60 mb-2">
                <span>{formatTime(currentTime)} / {formatTime(duration || 180)}</span>
                <span className="text-green-400">Full Version Playing</span>
              </div>
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-100"
                  style={{ width: `${(currentTime / (duration || 180)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
        
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
        
        {/* Share Button */}
        <div className="text-center mb-8">
          <button
            onClick={onShare}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Share as Musical Letter
          </button>
          <p className="text-white/40 text-sm mt-3">Send this song to someone special</p>
        </div>
        
        {/* Secrets Section */}
        <div className="glass-card p-8 mb-12">
          <h3 className="text-xl font-semibold mb-6 text-white/80 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-sm">🔐</span>
            Secrets in the Song
          </h3>
          
          {showSecrets && (
            <div className="space-y-4 animate-fade-in">
              {displaySecrets.map((secret, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-pink-400/80 text-sm uppercase tracking-wide mb-1">{secret.label}</div>
                  <div className="text-white/90">{secret.text}</div>
                </div>
              ))}
            </div>
          )}
          
          {!showSecrets && (
            <p className="text-white/30 italic">
              Secrets will be revealed as the song plays...
            </p>
          )}
        </div>
        
        {/* CTA: Create Your Own */}
        <div className="text-center">
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold transition-all duration-300"
          >
            <span className="text-xl">✨</span>
            Create Your Own Gift Song
          </button>
          <p className="text-white/40 text-sm mt-3">Make a personalized song for someone special</p>
        </div>
      </div>
    </div>
  );
}

export default Result;
