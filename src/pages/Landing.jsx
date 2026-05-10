import { useState, useMemo } from 'react';
import { getActiveHoliday, getHolidayCountdown } from '../utils/holidayDetector';

const emotions = [
  { id: 'heartfelt', name: 'Heartfelt', gradient: 'from-rose-400 to-pink-600', icon: '❤️' },
  { id: 'funny', name: 'Funny', gradient: 'from-amber-400 to-orange-500', icon: '😂' },
  { id: 'celebration', name: 'Celebration', gradient: 'from-violet-500 to-purple-600', icon: '🎉' },
  { id: 'healing', name: 'Healing', gradient: 'from-cyan-400 to-blue-500', icon: '💙' },
  { id: 'hype', name: 'Hype', gradient: 'from-red-500 to-orange-500', icon: '🔥' }
];

const occasions = ['Birthday', 'Anniversary', 'Just Because', 'Apology', 'Thank You', 'Congratulations', 'Get Well Soon', 'Goodbye'];

const voiceTypes = [
  { id: 'male', name: 'Male', emoji: '🎤', gradient: 'from-blue-500 to-cyan-500' },
  { id: 'female', name: 'Female', emoji: '🎧', gradient: 'from-pink-500 to-rose-500' },
  { id: 'duet', name: 'Duet', emoji: '🎵', gradient: 'from-purple-500 to-indigo-500' }
];

const songStyles = [
  { id: 'pop', name: 'Pop', emoji: '🎹' },
  { id: 'folk', name: 'Folk', emoji: '🪕' },
  { id: 'rnb', name: 'R&B', emoji: '🎷' },
  { id: 'electronic', name: 'Electronic', emoji: '🎛️' },
  { id: 'rock', name: 'Rock', emoji: '🎸' },
  { id: 'acoustic', name: 'Acoustic', emoji: '🎻' }
];

const quickStoryTags = [
  { emoji: '🌟', text: 'First meeting', template: 'Our first meeting was unforgettable.' },
  { emoji: '😂', text: 'Funny moment', template: 'There was this hilarious moment that still makes me laugh.' },
  { emoji: '💖', text: 'Kindness', template: 'Your kindness has touched so many lives.' },
  { emoji: '🌍', text: 'Adventure', template: 'Remember our amazing adventure together?' },
  { emoji: '🎁', text: 'Surprise', template: 'I still remember the surprise you gave me.' },
];

function Landing({ formData, onStartCreation, onEmotionSelect, onFormSubmit }) {
  const [localEmotion, setLocalEmotion] = useState(formData.emotion || '');
  const selectedEmotion = localEmotion || formData.emotion || '';
  const activeHoliday = useMemo(() => getActiveHoliday(), []);
  const countdown = useMemo(() => getHolidayCountdown(activeHoliday), [activeHoliday]);
  
  const [formValues, setFormValues] = useState({
    recipientName: formData.recipientName || '',
    yourName: formData.yourName || '',
    occasion: formData.occasion || '',
    story: formData.story || '',
    voiceType: formData.voiceType || '',
    songStyle: formData.songStyle || 'pop'
  });
  const [formStep, setFormStep] = useState(0);

  const handleEmotionClick = (emotionId) => {
    setLocalEmotion(emotionId);
    onEmotionSelect(emotionId);
  };

  const handleFormChange = (field, value) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const addQuickStory = (template) => {
    const current = formValues.story || '';
    const newText = current + (current ? ' ' : '') + template;
    handleFormChange('story', newText);
  };

  const goToStep2 = () => {
    setFormStep(1);
  };

  const goBackToStep1 = () => {
    setFormStep(0);
  };

  const handleSubmit = () => {
    onFormSubmit({ ...formValues, emotion: selectedEmotion });
  };

  const isStep1Valid = selectedEmotion && formValues.recipientName.trim() && formValues.yourName.trim();

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${activeHoliday.colors.bgGradient}`} />
        <div className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] ${activeHoliday.colors.glowColor} rounded-full blur-[120px] animate-blob`} />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '2s' }} />
        
        <div className="relative z-10 text-center px-6">
          {activeHoliday.badge && (
            <div className="mb-6 animate-fade-in-up">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 ${activeHoliday.colors.badgeBg} ${activeHoliday.colors.badgeText} text-sm font-medium tracking-wide`}>
                <span>{activeHoliday.emoji}</span>
                <span>{activeHoliday.badge}</span>
                {countdown && <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">{countdown}</span>}
              </span>
            </div>
          )}
          
          <h1 className="text-[clamp(3rem,10vw,8rem)] font-black tracking-tight leading-[0.9] gradient-text-hero">
            {activeHoliday.title}
          </h1>
          
          <p className="text-xl md:text-3xl text-white/80 font-light mt-8 max-w-2xl mx-auto leading-relaxed">
            {activeHoliday.subtitle}
          </p>
          
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-white/60">
            <span className="flex items-center gap-2">
              <span className="text-green-400">✓</span> 25,000+ songs created
            </span>
            <span className="flex items-center gap-2">
              <span className="text-yellow-400">★</span> 4.8 rating
            </span>
            <span className="flex items-center gap-2">
              <span className="text-pink-400">♥</span> From $4.99
            </span>
          </div>
          
          <button onClick={onStartCreation} className="mt-14 group">
            <span className="btn-cta inline-flex items-center gap-3">
              {activeHoliday.cta}
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>
        
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-[#0a0a1a]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-2xl font-bold">1</div>
              <h3 className="text-xl font-bold mb-2">Tell Your Story</h3>
              <p className="text-white/60">Share a memory or pick a quick tag. Takes less than 30 seconds.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold">2</div>
              <h3 className="text-xl font-bold mb-2">AI Creates Magic</h3>
              <p className="text-white/60">Our AI crafts a unique song in minutes with personal details.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-2xl font-bold">3</div>
              <h3 className="text-xl font-bold mb-2">Gift & Delight</h3>
              <p className="text-white/60">Share the link or download. They will love this personal gift!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#0a0a1a] to-[#0f0f2a]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Loved by Thousands</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card p-6">
              <div className="text-yellow-400 mb-3">★★★★★</div>
              <p className="text-white/80 mb-4">"My mom cried when she heard her song. It had details only we would know. Absolutely magical."</p>
              <p className="text-white/40 text-sm">— Sarah M., Birthday Gift</p>
            </div>
            <div className="glass-card p-6">
              <div className="text-yellow-400 mb-3">★★★★★</div>
              <p className="text-white/80 mb-4">"Better than any card or flowers. The song was so personal and touching. Best gift ever!"</p>
              <p className="text-white/40 text-sm">— David K., Anniversary Gift</p>
            </div>
            <div className="glass-card p-6">
              <div className="text-yellow-400 mb-3">★★★★★</div>
              <p className="text-white/80 mb-4">"I sent it to my best friend and she played it on repeat all day. The duet version is amazing!"</p>
              <p className="text-white/40 text-sm">— Emily R., Friendship Gift</p>
            </div>
          </div>
        </div>
      </section>

      {/* Price Comparison */}
      <section className="py-20 px-6 bg-[#0a0a1a]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Why Pay More?</h2>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <div className="glass-card p-6 border border-red-500/30 opacity-75 flex-1">
              <p className="text-white/40 text-sm mb-2">Traditional Song Services</p>
              <p className="text-4xl font-bold text-white/50">$179</p>
              <p className="text-white/30 text-sm mt-2">7-day wait • Limited styles</p>
            </div>
            <div className="glass-card p-6 border border-green-500/50 flex-1">
              <p className="text-green-400 text-sm mb-2 font-semibold">AI Gift Song</p>
              <p className="text-4xl font-bold gradient-text">$4.99</p>
              <p className="text-white/60 text-sm mt-2">3-5 min • 90+ styles • Instant delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* Creation Form */}
      <section id="emotions-section" className="py-20 px-6 bg-gradient-to-b from-[#0a0a1a] to-[#0f0f2a]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Create Your Song</h2>
            <p className="text-white/50">A song only they understand — in 2 simple steps</p>
          </div>

          {/* Step indicator */}
          <div className="flex justify-center gap-4 mb-10">
            <div className={`flex items-center gap-2 ${formStep >= 0 ? 'text-pink-400' : 'text-white/30'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                formStep >= 0 ? 'bg-pink-500 text-white' : 'bg-white/10'
              }`}>1</div>
              <span className="font-medium">Details</span>
            </div>
            <div className="w-12 h-0.5 bg-white/20 mt-4" />
            <div className={`flex items-center gap-2 ${formStep >= 1 ? 'text-pink-400' : 'text-white/30'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                formStep >= 1 ? 'bg-pink-500 text-white' : 'bg-white/10'
              }`}>2</div>
              <span className="font-medium">Create</span>
            </div>
          </div>
          
          <div className="glass-card p-6 md:p-8">
            
            {/* ============ STEP 1: Emotion + Names + Story ============ */}
            {formStep === 0 && (
              <div className="space-y-6">
                {/* Emotion Selection */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-3 text-center">Choose the vibe</label>
                  <div className="grid grid-cols-5 gap-2">
                    {emotions.map((emotion) => (
                      <button
                        key={emotion.id}
                        onClick={() => handleEmotionClick(emotion.id)}
                        className={`p-3 rounded-xl transition-all duration-300 text-center ${
                          selectedEmotion === emotion.id
                            ? 'bg-gradient-to-br ' + emotion.gradient + ' shadow-lg scale-105'
                            : 'bg-white/5 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        <span className="text-2xl">{emotion.icon}</span>
                        <span className={`block text-xs mt-1 ${selectedEmotion === emotion.id ? 'text-white' : 'text-white/60'}`}>
                          {emotion.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Names */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">For (their name)</label>
                    <input
                      type="text"
                      value={formValues.recipientName}
                      onChange={(e) => handleFormChange('recipientName', e.target.value)}
                      placeholder="Who is this song for?"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">From (your name)</label>
                    <input
                      type="text"
                      value={formValues.yourName}
                      onChange={(e) => handleFormChange('yourName', e.target.value)}
                      placeholder="Your name"
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Occasion */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Occasion <span className="text-white/30">(optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {occasions.map((occasion) => (
                      <button
                        key={occasion}
                        onClick={() => handleFormChange('occasion', occasion)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          formValues.occasion === occasion
                            ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {occasion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Story */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Add a memory <span className="text-white/30">(optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {quickStoryTags.map((tag, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => addQuickStory(tag.template)}
                        className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm border border-white/10 hover:border-white/20"
                      >
                        {tag.emoji} {tag.text}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={formValues.story}
                    onChange={(e) => handleFormChange('story', e.target.value)}
                    placeholder="Or write your own story here..."
                    className="input-field min-h-[80px] resize-none text-sm"
                  />
                </div>

                <button
                  onClick={goToStep2}
                  disabled={!isStep1Valid}
                  className={`w-full btn-cta ${!isStep1Valid ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Continue to Style Selection →
                </button>
              </div>
            )}
            
            {/* ============ STEP 2: Voice + Style + Submit ============ */}
            {formStep === 1 && (
              <div className="space-y-6">
                <button
                  onClick={goBackToStep1}
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-2"
                >
                  ← Back
                </button>

                {/* Summary */}
                <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/60 text-sm">Creating for</p>
                  <p className="text-2xl font-bold gradient-text">{formValues.recipientName}</p>
                  <p className="text-white/40 text-sm">from {formValues.yourName} • {selectedEmotion}</p>
                </div>

                {/* Voice Type */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-3 text-center">Choose vocal style</label>
                  <div className="grid grid-cols-3 gap-3">
                    {voiceTypes.map((voice) => (
                      <button
                        key={voice.id}
                        onClick={() => handleFormChange('voiceType', voice.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-center ${
                          formValues.voiceType === voice.id
                            ? 'border-pink-500 bg-pink-500/20'
                            : 'border-white/10 bg-white/5 hover:border-white/30'
                        }`}
                      >
                        <div className={`w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br ${voice.gradient} flex items-center justify-center text-2xl`}>
                          {voice.emoji}
                        </div>
                        <span className="font-bold text-sm">{voice.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Song Style - always show after voice is selected */}
                {formValues.voiceType && (
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-3 text-center">Select genre</label>
                    <div className="grid grid-cols-3 gap-2">
                      {songStyles.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => handleFormChange('songStyle', style.id)}
                          className={`p-3 rounded-xl border transition-all flex items-center gap-2 ${
                            formValues.songStyle === style.id
                              ? 'border-pink-500 bg-pink-500/20'
                              : 'border-white/10 bg-white/5 hover:border-white/30'
                          }`}
                        >
                          <span className="text-xl">{style.emoji}</span>
                          <span className="font-semibold text-sm">{style.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Create Button - always show, disabled until valid */}
                <button
                  onClick={handleSubmit}
                  disabled={!formValues.voiceType || !formValues.songStyle}
                  className={`w-full btn-cta ${(!formValues.voiceType || !formValues.songStyle) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Create My Song ✨
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-[#0a0a1a]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Is the song really unique?', a: 'Yes! Every song is AI-generated based on YOUR specific story and details. No two songs are alike.' },
              { q: 'How long does it take?', a: "Most songs are ready in 3-5 minutes. You will get an email when your song is ready." },
              { q: 'Can I download and share the song?', a: 'Absolutely! You get a permanent link to share and can download the MP3 file.' },
              { q: 'What if I don\'t like it?', a: 'We offer a satisfaction guarantee. Contact us within 7 days if you need adjustments.' },
              { q: 'Is my story kept private?', a: 'Yes! Your story is only used to create your song and is never shared.' },
            ].map((item, idx) => (
              <div key={idx} className="glass-card p-6">
                <h3 className="font-semibold text-lg mb-2">{item.q}</h3>
                <p className="text-white/60">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#050510] border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-between gap-6 mb-8">
            <div>
              <h4 className="font-bold text-lg mb-3">AI Gift Song</h4>
              <p className="text-white/40 text-sm max-w-xs">Create personalized songs powered by AI. Perfect for birthdays, anniversaries, and special moments.</p>
            </div>
            <div className="flex gap-8">
              <div>
                <h5 className="font-semibold mb-3">Product</h5>
                <ul className="space-y-2 text-white/40 text-sm">
                  <li><a href="#" className="hover:text-white transition">How It Works</a></li>
                  <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition">FAQ</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold mb-3">Legal</h5>
                <ul className="space-y-2 text-white/40 text-sm">
                  <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white transition">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-white/30 text-sm">
            &copy; 2026 AI Gift Song. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
