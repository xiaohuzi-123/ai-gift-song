import { useState, useEffect, useRef, useMemo } from 'react';
import { getActiveHoliday, getHolidayCountdown } from '../utils/holidayDetector';

const emotions = [
  { 
    id: 'heartfelt', 
    name: 'Heartfelt', 
    desc: 'Gratitude, love, and deep appreciation', 
    gradient: 'from-rose-400 to-pink-600',
    icon: (
      <svg viewBox="0 0 80 80" className="w-16 h-16">
        <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="4 4">
          <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="20s" repeatCount="indefinite"/>
        </circle>
        <path d="M40 65 C20 50 10 35 20 25 C25 20 32 20 40 30 C48 20 55 20 60 25 C70 35 60 50 40 65Z" fill="white" opacity="0.95"/>
        <path d="M55 18 C53 16 50 16 52 20 C53 22 55 22 55 18Z" fill="rgba(255,255,255,0.5)" transform="scale(0.6) translate(40, 10)"/>
      </svg>
    )
  },
  { 
    id: 'funny', 
    name: 'Funny', 
    desc: 'Roast, pranks, and hilarious memories', 
    gradient: 'from-amber-400 to-orange-500',
    icon: (
      <svg viewBox="0 0 80 80" className="w-16 h-16">
        <circle cx="40" cy="40" r="30" fill="none" stroke="white" strokeWidth="2" opacity="0.9"/>
        <polygon points="28,32 30,28 32,32 28,30 32,30" fill="white" opacity="0.9"/>
        <polygon points="48,32 50,28 52,32 48,30 52,30" fill="white" opacity="0.9"/>
        <path d="M25 45 Q40 60 55 45" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    )
  },
  { 
    id: 'celebration', 
    name: 'Celebration', 
    desc: 'Milestones, achievements, and joy', 
    gradient: 'from-violet-500 to-purple-600',
    icon: (
      <svg viewBox="0 0 80 80" className="w-16 h-16">
        <path d="M40 15 L43 30 L58 30 L46 38 L50 53 L40 44 L30 53 L34 38 L22 30 L37 30Z" fill="white" opacity="0.95"/>
        <line x1="40" y1="8" x2="40" y2="3" stroke="white" strokeWidth="2" opacity="0.5" strokeLinecap="round"/>
        <line x1="55" y1="12" x2="58" y2="8" stroke="white" strokeWidth="2" opacity="0.5" strokeLinecap="round"/>
        <line x1="25" y1="12" x2="22" y2="8" stroke="white" strokeWidth="2" opacity="0.5" strokeLinecap="round"/>
        <line x1="62" y1="22" x2="66" y2="19" stroke="white" strokeWidth="2" opacity="0.5" strokeLinecap="round"/>
        <line x1="18" y1="22" x2="14" y2="19" stroke="white" strokeWidth="2" opacity="0.5" strokeLinecap="round"/>
        <circle cx="15" cy="35" r="2" fill="white" opacity="0.4"/>
        <circle cx="65" cy="35" r="2" fill="white" opacity="0.4"/>
        <circle cx="20" cy="60" r="1.5" fill="white" opacity="0.3"/>
        <circle cx="60" cy="60" r="1.5" fill="white" opacity="0.3"/>
      </svg>
    )
  },
  { 
    id: 'healing', 
    name: 'Healing', 
    desc: 'Comfort, support, and resilience', 
    gradient: 'from-cyan-400 to-blue-500',
    icon: (
      <svg viewBox="0 0 80 80" className="w-16 h-16">
        <ellipse cx="40" cy="25" rx="10" ry="18" fill="white" opacity="0.3" transform="rotate(0,40,40)"/>
        <ellipse cx="40" cy="25" rx="10" ry="18" fill="white" opacity="0.4" transform="rotate(60,40,40)"/>
        <ellipse cx="40" cy="25" rx="10" ry="18" fill="white" opacity="0.5" transform="rotate(120,40,40)"/>
        <ellipse cx="40" cy="25" rx="10" ry="18" fill="white" opacity="0.4" transform="rotate(180,40,40)"/>
        <ellipse cx="40" cy="25" rx="10" ry="18" fill="white" opacity="0.5" transform="rotate(240,40,40)"/>
        <ellipse cx="40" cy="25" rx="10" ry="18" fill="white" opacity="0.3" transform="rotate(300,40,40)"/>
        <circle cx="40" cy="40" r="4" fill="white" opacity="0.9"/>
      </svg>
    )
  },
  { 
    id: 'hype', 
    name: 'Hype', 
    desc: 'Energy, excitement, and motivation', 
    gradient: 'from-red-500 to-orange-500',
    icon: (
      <svg viewBox="0 0 80 80" className="w-16 h-16">
        <path d="M45 10 L30 40 L40 40 L35 70 L55 35 L43 35 Z" fill="white" opacity="0.95"/>
        <circle cx="40" cy="40" r="25" fill="none" stroke="white" strokeWidth="1" opacity="0.3">
          <animate attributeName="r" from="20" to="35" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="40" cy="40" r="20" fill="none" stroke="white" strokeWidth="1" opacity="0.2">
          <animate attributeName="r" from="15" to="30" dur="2s" begin="0.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="0.3" to="0" dur="2s" begin="0.5s" repeatCount="indefinite"/>
        </circle>
      </svg>
    )
  }
];

const occasions = [
  'Birthday', 'Anniversary', 'Just Because', 'Apology', 'Thank You', 'Congratulations', 'Get Well Soon', 'Goodbye'
];

// Voice type options
const voiceTypes = [
  { 
    id: 'male', 
    name: 'Male', 
    subtitle: 'Warm & soulful',
    emoji: '🎤',
    gradient: 'from-blue-500 to-cyan-500'
  },
  { 
    id: 'female', 
    name: 'Female', 
    subtitle: 'Sweet & expressive',
    emoji: '🎧',
    gradient: 'from-pink-500 to-rose-500'
  },
  { 
    id: 'duet', 
    name: 'Duet', 
    subtitle: 'Together in harmony',
    emoji: '🎵',
    gradient: 'from-purple-500 to-indigo-500'
  }
];

// Song style options
const songStyles = [
  { id: 'pop', name: 'Pop', emoji: '🎹', desc: 'Catchy & modern' },
  { id: 'folk', name: 'Folk', emoji: '🪕', desc: 'Storytelling & acoustic' },
  { id: 'rnb', name: 'R&B', emoji: '🎷', desc: 'Smooth & soulful' },
  { id: 'electronic', name: 'Electronic', emoji: '🎛️', desc: 'Electronic & futuristic' },
  { id: 'rock', name: 'Rock', emoji: '🎸', desc: 'Powerful & energetic' },
  { id: 'acoustic', name: 'Acoustic', emoji: '🎻', desc: 'Intimate & pure' }
];

// Recommended vocal style based on emotion
const getRecommendedVocalStyle = (emotion, voiceType) => {
  const recommendations = {
    heartfelt: { 
      male: 'Soft & Intimate',
      female: 'Soft & Intimate',
      duet: 'Soft & Intimate'
    },
    funny: { 
      male: 'Playful & Fun',
      female: 'Playful & Fun',
      duet: 'Playful & Fun'
    },
    celebration: { 
      male: 'Upbeat & Joyful',
      female: 'Upbeat & Joyful',
      duet: 'Upbeat & Joyful'
    },
    healing: { 
      male: 'Gentle & Soothing',
      female: 'Gentle & Soothing',
      duet: 'Gentle & Soothing'
    },
    hype: { 
      male: 'Powerful & Energetic',
      female: 'Powerful & Energetic',
      duet: 'Powerful & Energetic'
    }
  };
  return recommendations[emotion]?.[voiceType] || 'Soft & Intimate';
};

function Landing({ formData, onStartCreation, onEmotionSelect, onFormSubmit }) {
  const [selectedEmotion, setSelectedEmotion] = useState(formData.emotion);
  
  // Get active holiday theme
  const activeHoliday = useMemo(() => getActiveHoliday(), []);
  const countdown = useMemo(() => getHolidayCountdown(activeHoliday), [activeHoliday]);
  
  const [formValues, setFormValues] = useState({
    recipientName: formData.recipientName || '',
    yourName: formData.yourName || '',
    occasion: formData.occasion || '',
    story: formData.story || '',
    details: formData.details || '',
    // Step 3 fields
    voiceType: formData.voiceType || '',
    songStyle: formData.songStyle || 'pop'
  });
  const [formStep, setFormStep] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const handleEmotionClick = (emotion) => {
    setSelectedEmotion(emotion.id);
    onEmotionSelect(emotion.id);
  };

  const handleFormChange = (field, value) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (formStep < 4) { // Now 5 steps (0-4)
      setFormStep(prev => prev + 1);
    } else {
      // Submit with all data including voice and style
      onFormSubmit({
        ...formValues,
        emotion: selectedEmotion
      });
    }
  };

  const isFormValid = () => {
    if (formStep === 0) return formValues.recipientName.trim() && formValues.yourName.trim();
    if (formStep === 1) return formValues.occasion;
    if (formStep === 2) return true; // Story now optional - no minimum requirement
    if (formStep === 3) return true; // Details optional
    if (formStep === 4) return formValues.voiceType && formValues.songStyle;
    return true;
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        {/* Dynamic holiday-themed gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${activeHoliday.colors.bgGradient}`} />
        
        {/* Animated light blobs with holiday accent */}
        <div className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] ${activeHoliday.colors.glowColor} rounded-full blur-[120px] animate-blob`} />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '4s' }} />
        
        {/* Content */}
        <div className="relative z-10 text-center px-6">
          {/* Holiday Badge */}
          {activeHoliday.badge && (
            <div className="mb-6 animate-fade-in-up">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 ${activeHoliday.colors.badgeBg} ${activeHoliday.colors.badgeText} text-sm font-medium tracking-wide`}>
                <span>{activeHoliday.emoji}</span>
                <span>{activeHoliday.badge}</span>
                {countdown && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                    {countdown}
                  </span>
                )}
              </span>
            </div>
          )}
          
          <h1 className="text-[clamp(3rem,10vw,8rem)] font-black tracking-tight leading-[0.9] gradient-text-hero">
            {activeHoliday.title}
          </h1>
          <p className="text-xl md:text-3xl text-white/80 font-light mt-8 max-w-2xl mx-auto leading-relaxed">
            {activeHoliday.subtitle}
          </p>
          <button 
            onClick={onStartCreation}
            className="mt-14 group"
          >
            <span className="btn-cta inline-flex items-center gap-3">
              {activeHoliday.cta}
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>
        
        {/* Social proof */}
        <div className="absolute bottom-12 text-white/50 text-sm tracking-wider font-light">
          25,000+ songs created • 4.8★ • From $4.99
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Emotions Section */}
      <section id="emotions-section" className="min-h-screen py-32 px-6 relative bg-[#0a0a1a]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold tracking-widest text-pink-400 uppercase mb-4 block">Step 1</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What's the vibe?</h2>
            <p className="text-white/50 text-lg max-w-lg mx-auto">Choose the emotional tone that captures your story</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emotions.map((emotion) => (
              <div
                key={emotion.id}
                onClick={() => handleEmotionClick(emotion)}
                className={`emotion-card ${selectedEmotion === emotion.id ? 'selected' : ''}`}
                style={{
                  borderColor: selectedEmotion === emotion.id ? undefined : undefined,
                  background: selectedEmotion === emotion.id 
                    ? `linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))` 
                    : undefined
                }}
              >
                <div className={`emotion-card-gradient bg-gradient-to-br ${emotion.gradient}`}>
                  <div className="emotion-card-icon">{emotion.icon}</div>
                  {selectedEmotion === emotion.id && (
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="emotion-card-content">
                  <h3 className="emotion-card-title text-white">{emotion.name}</h3>
                  <p className="emotion-card-desc">{emotion.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          {selectedEmotion && (
            <div className="text-center mt-12">
              <button 
                onClick={() => {
                  const element = document.getElementById('form-section');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-outline inline-flex items-center gap-2"
              >
                Continue
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Form Section */}
      <section id="form-section" className="min-h-screen py-32 px-6 relative bg-[#0a0a1a]">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-pink-900/10 to-transparent" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
        </div>
        
        <div className="max-w-4xl mx-auto relative">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold tracking-widest text-pink-400 uppercase mb-4 block">Step 2</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Tell Your Story</h2>
            <p className="text-white/50 text-lg max-w-lg mx-auto">Share the moments that make this relationship special</p>
          </div>
          
          {/* Progress indicator */}
          <div className="flex justify-center gap-2 mb-16">
            {[0, 1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  step <= formStep 
                    ? 'w-12 bg-gradient-to-r from-pink-500 to-orange-500' 
                    : 'w-12 bg-white/10'
                }`}
              />
            ))}
          </div>
          
          {/* Form steps */}
          <div className="glass-card p-8 md:p-12 relative overflow-hidden">
            {/* Step 0: Names */}
            {formStep === 0 && (
              <div className="space-y-8 animate-fade-in-up">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-3">Who is this song for?</label>
                  <input
                    type="text"
                    value={formValues.recipientName}
                    onChange={(e) => handleFormChange('recipientName', e.target.value)}
                    placeholder="Their name"
                    className="input-field text-xl"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-3">From</label>
                  <input
                    type="text"
                    value={formValues.yourName}
                    onChange={(e) => handleFormChange('yourName', e.target.value)}
                    placeholder="Your name"
                    className="input-field text-xl"
                  />
                </div>
              </div>
            )}
            
            {/* Step 1: Occasion */}
            {formStep === 1 && (
              <div className="animate-fade-in-up">
                <label className="block text-sm font-medium text-white/60 mb-6 text-center">What's the occasion?</label>
                <div className="flex flex-wrap justify-center gap-3">
                  {occasions.map((occasion) => (
                    <button
                      key={occasion}
                      onClick={() => handleFormChange('occasion', occasion)}
                      className={`px-6 py-3 rounded-full transition-all duration-300 ${
                        formValues.occasion === occasion
                          ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold shadow-lg'
                          : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {occasion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Step 2: Story */}
            {formStep === 2 && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-3">
                    Share your story
                    <span className="text-white/30 ml-2">(Optional — add details for a more personal song)</span>
                  </label>
                  <textarea
                    value={formValues.story}
                    onChange={(e) => handleFormChange('story', e.target.value)}
                    placeholder="Tell us about a special moment, memory, or what makes this person special to you..."
                    className="input-field min-h-[200px] resize-none text-lg leading-relaxed"
                    autoFocus
                  />
                  <div className="text-right text-sm text-white/30 mt-2">
                    {formValues.story.length} characters
                  </div>
                  
                  {/* Quick tag buttons */}
                  <div className="mt-4">
                    <p className="text-xs text-white/40 mb-3">Quick options (click to add):</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleFormChange('story', formValues.story + (formValues.story ? ' ' : '') + 'Our first meeting was unforgettable.')}
                        className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-all border border-white/10 hover:border-white/20"
                      >
                        🌟 Our first meeting
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFormChange('story', formValues.story + (formValues.story ? ' ' : '') + 'There was this hilarious moment that still makes me laugh.'}
                        className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-all border border-white/10 hover:border-white/20"
                      >
                        😂 A funny moment
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFormChange('story', formValues.story + (formValues.story ? ' ' : '') + 'Your kindness has touched so many lives, including mine.'}
                        className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-all border border-white/10 hover:border-white/20"
                      >
                        💖 Their kindness
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFormChange('story', formValues.story + (formValues.story ? ' ' : '') + 'Remember our amazing adventure together?'}
                        className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-all border border-white/10 hover:border-white/20"
                      >
                        🌍 Our adventure
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFormChange('story', formValues.story + (formValues.story ? ' ' : '') + 'I still remember the surprise you gave me — it meant everything.'}
                        className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-all border border-white/10 hover:border-white/20"
                      >
                        🎁 A surprise moment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 3: Details */}
            {formStep === 3 && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-3">
                    Add personal details
                    <span className="text-white/30 ml-2">(optional - what only they would understand)</span>
                  </label>
                  <textarea
                    value={formValues.details}
                    onChange={(e) => handleFormChange('details', e.target.value)}
                    placeholder="Our inside joke about... The song we always sing together... The nickname only you call me..."
                    className="input-field min-h-[150px] resize-none text-lg leading-relaxed"
                    autoFocus
                  />
                </div>
              </div>
            )}
            
            {/* Step 4: Voice & Style Selection */}
            {formStep === 4 && (
              <div className="space-y-8 animate-fade-in-up">
                {/* Voice Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-4 text-center">
                    Choose the vocal style
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {voiceTypes.map((voice) => (
                      <button
                        key={voice.id}
                        onClick={() => handleFormChange('voiceType', voice.id)}
                        className={`p-6 rounded-2xl border-2 transition-all duration-300 text-center ${
                          formValues.voiceType === voice.id
                            ? 'border-pink-500 bg-pink-500/20 scale-105'
                            : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                        }`}
                      >
                        <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${voice.gradient} flex items-center justify-center text-3xl`}>
                          {voice.emoji}
                        </div>
                        <h4 className="font-bold text-lg mb-1">{voice.name}</h4>
                        <p className="text-white/50 text-sm">{voice.subtitle}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Song Style Selection */}
                {formValues.voiceType && (
                  <div className="animate-fade-in-up">
                    <label className="block text-sm font-medium text-white/60 mb-4 text-center">
                      Select music genre
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {songStyles.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => handleFormChange('songStyle', style.id)}
                          className={`p-4 rounded-xl border transition-all duration-300 flex items-center gap-3 ${
                            formValues.songStyle === style.id
                              ? 'border-pink-500 bg-pink-500/20'
                              : 'border-white/10 bg-white/5 hover:border-white/30'
                          }`}
                        >
                          <span className="text-2xl">{style.emoji}</span>
                          <div className="text-left">
                            <div className="font-semibold">{style.name}</div>
                            <div className="text-white/40 text-xs">{style.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Style Preview */}
                {formValues.voiceType && formValues.songStyle && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-white/10 animate-fade-in-up">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">✨</span>
                      <div>
                        <div className="font-semibold mb-1">Recommended Style</div>
                        <p className="text-white/60 text-sm">
                          {getRecommendedVocalStyle(selectedEmotion, formValues.voiceType)} {formValues.songStyle.charAt(0).toUpperCase() + formValues.songStyle.slice(1)}
                        </p>
                        <p className="text-white/40 text-xs mt-2">
                          {voiceTypes.find(v => v.id === formValues.voiceType)?.name} vocal with {songStyles.find(s => s.id === formValues.songStyle)?.name.toLowerCase()} arrangement
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Navigation */}
            <div className="flex justify-between mt-10 pt-6 border-t border-white/10">
              <button
                onClick={() => setFormStep(prev => Math.max(0, prev - 1))}
                className={`btn-outline ${formStep === 0 ? 'opacity-0 pointer-events-none' : ''}`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </span>
              </button>
              <button
                onClick={handleNextStep}
                disabled={!isFormValid()}
                className={`btn-cta ${!isFormValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {formStep === 4 ? (
                  <span className="flex items-center gap-2">
                    Create Song
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Continue
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Landing;
