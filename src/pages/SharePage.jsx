import { useState, useEffect, useRef } from 'react';
import './SharePage.css';

// PayPal Client ID - Replace with your actual PayPal Business Client ID
const PAYPAL_CLIENT_ID = 'ASVmBXV9BvBOt6mkrAMdQzXpVvyBgvCc2cCBYdh0_RhCJwwoa3NjVmLuY2PZz-IN8Z5FWn6CVqLJ8N61';

const PREVIEW_DURATION = 30;
const FULL_PRICE = 4.99;

function SharePage({ formData, resultData, onRestart, isPaid, setIsPaid }) {
  const [phase, setPhase] = useState('envelope'); // envelope -> opening -> letter -> player
  const [showPlayer, setShowPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const audioRef = useRef(null);
  const paypalContainerRef = useRef(null);

  const { audioUrl, title, duration, songId } = resultData || {};
  
  // Phase transition sequence
  useEffect(() => {
    if (phase === 'opening') {
      const timer = setTimeout(() => {
        setPhase('letter');
      }, 1500);
      return () => clearTimeout(timer);
    }
    if (phase === 'letter') {
      const timer = setTimeout(() => {
        setShowPlayer(true);
        setPhase('player');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Use proxy URL for Suno audio to bypass CORS
  const getAudioSource = () => {
    if (!audioUrl) return null;
    // Demo audio URL (soundhelix) - use directly without proxy
    if (audioUrl.includes('soundhelix.com')) {
      return audioUrl;
    }
    // If it's a Suno CDN URL, use the proxy endpoint
    if (audioUrl.includes('cdn.suno.ai') || audioUrl.includes('suno.ai')) {
      return `/api/proxy-audio?url=${encodeURIComponent(audioUrl)}`;
    }
    return audioUrl;
  };

  // Auto play music when player shows
  useEffect(() => {
    if (showPlayer && audioRef.current && audioUrl) {
      // Set the audio source with proxy if needed
      const audioSource = getAudioSource();
      if (audioRef.current.src !== audioSource) {
        audioRef.current.src = audioSource;
      }
      setTimeout(() => {
        audioRef.current?.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          // Autoplay blocked, user needs to interact
        });
      }, 500);
    }
  }, [showPlayer, audioUrl]);

  // Time update handler for 30-second preview limit
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const current = audio.currentTime;
      setCurrentTime(current);
      
      // Enforce 30-second preview limit for non-paid users
      if (!isPaid && current >= PREVIEW_DURATION) {
        audio.pause();
        setIsPlaying(false);
        setShowUpgradePrompt(true);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
  }, [isPaid]);

  // Initialize PayPal button
  useEffect(() => {
    if (isPaid || !paypalContainerRef.current) return;
    
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
            
            const response = await fetch('/api/create-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                amount: FULL_PRICE,
                songId: songId || 'shared-song',
                songTitle: title || 'AI Gift Song'
              }),
            });
            
            if (!response.ok) throw new Error('Failed to create order');
            const orderData = await response.json();
            return orderData.orderId;
          } catch (error) {
            console.error('Order creation error:', error);
            setPaymentError('Failed to create order. Please try again.');
            throw error;
          } finally {
            setIsProcessingPayment(false);
          }
        },
        onApprove: async (data, actions) => {
          try {
            const response = await fetch('/api/capture-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderId: data.orderID,
                songId: songId || 'shared-song'
              }),
            });
            
            const captureData = await response.json();
            
            if (captureData.success) {
              setIsPaid(true);
              setShowUpgradePrompt(false);
              
              if (captureData.downloadUrl) {
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
  }, [isPaid, songId, title, setIsPaid]);

  const handleEnvelopeClick = () => {
    if (phase === 'envelope') {
      setPhase('opening');
    }
  };

  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const getShareUrl = () => {
    return window.location.href;
  };

  const togglePlay = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        if (showUpgradePrompt) {
          audioRef.current.currentTime = 0;
          setCurrentTime(0);
          setShowUpgradePrompt(false);
        }
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Highlight personal details in lyrics
  const highlightLyrics = (lyrics) => {
    if (!lyrics || !formData.details) return lyrics;
    const details = formData.details.split(/[,.!?]/).filter(d => d.trim().length > 3);
    
    let highlighted = lyrics;
    details.forEach(detail => {
      const trimmed = detail.trim();
      if (trimmed.length > 3) {
        const regex = new RegExp(`\\b(${trimmed})\\b`, 'gi');
        highlighted = highlighted.replace(regex, '<span class="highlight-gold">$1</span>');
      }
    });
    return highlighted;
  };

  // Sample lyrics with placeholder - in real app this comes from API
  const sampleLyrics = `Verse 1:
When I think of ${formData.recipientName || 'you'}, my heart starts to soar
Like a bird in the sky, I feel love like never before
Every moment with you is a treasure so bright
You're the star in my night, my eternal light

Chorus:
This is our song, written with love
A melody sent from the heavens above
${formData.details || 'Every memory we share'} is a note in this melody
${formData.recipientName || 'You'} are the reason I smile today
This song will stay, forever our melody

Verse 2:
On this special ${formData.occasion?.toLowerCase() || 'day'}, I wanted to say
You're amazing in every single way
${formData.details || 'The way you laugh, the way you care'} makes everything right
You're my morning, my evening, my infinite light

Bridge:
From the bottom of my heart, from the depths of my soul
I write these words so you always know
That ${formData.yourName || 'I'} will be here, through every storm
You're safe in my arms, perfectly warm`;

  return (
    <div className="share-page">
      {/* Background gradient */}
      <div className="share-bg-gradient" />
      
      {/* Floating particles */}
      <div className="particles-container">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            '--delay': `${Math.random() * 5}s`,
            '--x': `${Math.random() * 100}%`,
            '--duration': `${3 + Math.random() * 4}s`
          }} />
        ))}
      </div>

      {/* Main content */}
      <div className="share-content">
        {/* Phase 1: Envelope */}
        {phase === 'envelope' && (
          <div className="envelope-container" onClick={handleEnvelopeClick}>
            <div className="envelope-glow" />
            <div className="envelope">
              <div className="envelope-back" />
              <div className="envelope-front">
                <div className="envelope-paper-texture" />
                <div className="envelope-flap">
                  <div className="envelope-flap-inner" />
                </div>
                <div className="envelope-wax-seal" onClick={(e) => { e.stopPropagation(); handleEnvelopeClick(); }}>
                  <div className="seal-cracks" />
                  <div className="seal-heart">♪</div>
                </div>
                <div className="envelope-text-overlay">
                  <p className="envelope-subtitle">Someone made something special for you</p>
                  <p className="envelope-hint">Tap to open</p>
                </div>
              </div>
              <div className="envelope-inner-shadow" />
            </div>
          </div>
        )}

        {/* Phase 2: Opening Animation */}
        {phase === 'opening' && (
          <div className="envelope-opening">
            <div className="envelope">
              <div className="envelope-back" />
              <div className="envelope-front opening">
                <div className="envelope-paper-texture" />
                <div className="envelope-flap opening">
                  <div className="envelope-flap-inner" />
                </div>
                <div className="envelope-wax-seal breaking">
                  <div className="seal-cracks animate" />
                  <div className="seal-shard shard-1" />
                  <div className="seal-shard shard-2" />
                  <div className="seal-shard shard-3" />
                  <div className="seal-heart">♪</div>
                </div>
              </div>
            </div>
            <div className="letter-peek">
              <div className="letter-peek-content">
                <p className="letter-peek-text">A song written just for you...</p>
              </div>
            </div>
          </div>
        )}

        {/* Phase 3: Letter Reveal */}
        {(phase === 'letter' || phase === 'player') && (
          <div className="letter-container">
            <div className="letter">
              <div className="letter-header">
                <span className="letter-icon">💌</span>
                <h2 className="letter-title">A Musical Gift</h2>
              </div>
              
              <div className="letter-body">
                <p className="letter-greeting">
                  Dear <span className="name-highlight">{formData.recipientName}</span>,
                </p>
                <p className="letter-message">
                  Someone has written a special song just for you. 
                  This melody captures moments, memories, and feelings 
                  that are uniquely yours.
                </p>
                <p className="letter-message">
                  This {formData.occasion?.toLowerCase() || 'special day'}, 
                  they wanted you to know how much you mean to them.
                </p>
                <div className="letter-signature">
                  <p>With love,</p>
                  <p className="signature-name">{formData.yourName}</p>
                </div>
                
                {formData.details && (
                  <div className="personal-note">
                    <p className="note-label">A personal detail for you:</p>
                    <p className="note-content">"{formData.details}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Lyrics with highlights */}
            <div className="lyrics-card">
              <h3 className="lyrics-title">
                <span className="lyrics-icon">🎵</span>
                Your Song Lyrics
              </h3>
              <div 
                className="lyrics-content"
                dangerouslySetInnerHTML={{ __html: highlightLyrics(sampleLyrics) }}
              />
            </div>
          </div>
        )}

        {/* Phase 4: Music Player */}
        {showPlayer && (
          <div className={`music-player ${showPlayer ? 'visible' : ''}`}>
            <div className="player-album-art">
              <div className="album-gradient">
                <span className="album-icon">🎁</span>
              </div>
            </div>
            
            <div className="player-info">
              <h4 className="player-song-title">A Song for {formData.recipientName}</h4>
              <p className="player-artist">Made with 💝 by AI Gift Song</p>
            </div>
            
            <div className="player-visualizer">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className={`visualizer-bar ${isPlaying ? 'playing' : ''}`}
                  style={{ '--delay': `${i * 0.1}s` }}
                />
              ))}
            </div>
            
            <div className="player-controls">
              <button className="control-btn skip">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
              </button>
              <button className="control-btn play-pause" onClick={togglePlay}>
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>
              <button className="control-btn skip">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
              </button>
            </div>
            
            <div className="player-progress">
              <span className="time-current">{formatTime(currentTime)}</span>
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${!isPaid ? 'preview' : 'full'}`} 
                  style={{ width: `${Math.min((currentTime / (duration || 180)) * 100, 100)}%` }} 
                />
                {/* Preview marker */}
                {!isPaid && (
                  <div 
                    className="preview-marker"
                    style={{ left: `${(PREVIEW_DURATION / (duration || 180)) * 100}%` }}
                  />
                )}
              </div>
              <span className="time-total">{formatTime(isPaid ? (duration || 180) : PREVIEW_DURATION)}</span>
            </div>
            
            {/* Hidden audio element */}
            <audio 
              ref={audioRef} 
              src={audioUrl || "/placeholder-audio.mp3"} 
              onEnded={() => {
                setIsPlaying(false);
                if (!isPaid) setShowUpgradePrompt(true);
              }}
            />

            {/* ===== Upgrade Prompt for Shared Users ===== */}
            {showUpgradePrompt && (
              <div className="upgrade-prompt">
                <div className="upgrade-content">
                  <div className="upgrade-icon">💝</div>
                  <h3 className="upgrade-title">Love this song?</h3>
                  <p className="upgrade-subtitle">
                    Unlock the full version for just <span className="price">${FULL_PRICE}</span>
                  </p>
                  
                  <div className="upgrade-comparison">
                    <span className="strike">$179</span>
                    <span className="special">AI Gift Song: ${FULL_PRICE}</span>
                  </div>

                  {paymentError && (
                    <div className="payment-error">{paymentError}</div>
                  )}

                  <div ref={paypalContainerRef} className="paypal-container">
                    {isProcessingPayment && (
                      <div className="processing">
                        <span className="spinner"></span>
                        Processing...
                      </div>
                    )}
                  </div>
                  
                  {!window.paypal && (
                    <p className="sdk-loading">Loading payment options...</p>
                  )}
                </div>
              </div>
            )}

            {/* ===== Full Version Unlocked ===== */}
            {isPaid && (
              <div className="unlocked-badge">
                <span className="check">✓</span>
                Full Version
              </div>
            )}
          </div>
        )}

        {/* CTA Button */}
        <div className={`cta-container ${phase === 'player' ? 'visible' : ''}`}>
          {/* Share Link Section - visible after payment */}
          {isPaid && (
            <div className="share-links-container">
              <p className="share-links-label">Share this song with others:</p>
              <div className="share-url-display">
                <span className="share-url-text">{getShareUrl()}</span>
              </div>
              <div className="share-buttons">
                <button onClick={handleCopyLink} className="share-btn copy-btn">
                  {copySuccess ? (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy Link
                    </>
                  )}
                </button>
                <a 
                  href={`https://wa.me/?text=Someone%20sent%20you%20a%20special%20song!%20${encodeURIComponent(getShareUrl())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-btn whatsapp-btn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
                <a 
                  href={`mailto:?subject=A Special Song For You&body=Someone sent you a special song! Check it out here: ${encodeURIComponent(getShareUrl())}`}
                  className="share-btn email-btn"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </a>
              </div>
            </div>
          )}
          <button onClick={onRestart} className="cta-button">
            <span className="cta-icon">✨</span>
            Make Your Own Gift Song
          </button>
          <p className="cta-subtitle">Create a personalized song for someone special</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="share-footer">
        <p>Made with 💝 by AI Gift Song</p>
      </footer>
    </div>
  );
}

export default SharePage;
