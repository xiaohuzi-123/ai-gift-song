import { useState, useEffect, useRef } from 'react';
import './SharePage.css';

function SharePage({ formData, onRestart }) {
  const [phase, setPhase] = useState('envelope'); // envelope -> opening -> letter -> player
  const [showPlayer, setShowPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  
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

  // Auto play music when player shows
  useEffect(() => {
    if (showPlayer && audioRef.current) {
      setTimeout(() => {
        audioRef.current?.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          // Autoplay blocked, user needs to interact
        });
      }, 500);
    }
  }, [showPlayer]);

  const handleEnvelopeClick = () => {
    if (phase === 'envelope') {
      setPhase('opening');
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
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
              <span className="time-current">0:00</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '35%' }} />
              </div>
              <span className="time-total">3:24</span>
            </div>
            
            {/* Hidden audio element */}
            <audio ref={audioRef} src="/placeholder-audio.mp3" />
          </div>
        )}

        {/* CTA Button */}
        <div className={`cta-container ${phase === 'player' ? 'visible' : ''}`}>
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
