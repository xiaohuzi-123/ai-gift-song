import { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Generating from './pages/Generating';
import Result from './pages/Result';
import SharePage from './pages/SharePage';

function App() {
  const [step, setStep] = useState('landing');
  const [formData, setFormData] = useState({
    emotion: '',
    recipientName: '',
    yourName: '',
    occasion: '',
    story: '',
    details: '',
    // Step 3 new fields
    voiceType: '',
    songStyle: ''
  });
  const [resultData, setResultData] = useState(null);
  const [isPaid, setIsPaid] = useState(false); // Payment state for 40s preview unlock
  const [shareUrl, setShareUrl] = useState('');

  // Check for shared link in URL hash on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#share=')) {
      try {
        const encoded = hash.slice(7);
        const data = JSON.parse(decodeURIComponent(atob(encoded)));
        
        setFormData({
          emotion: data.e || '',
          recipientName: data.n || '',
          yourName: data.y || '',
          occasion: data.o || '',
          story: '',
          details: '',
          voiceType: data.v || '',
          songStyle: data.s || ''
        });
        
        setResultData({
          audioUrl: data.a,
          title: data.t,
          duration: data.d,
          lyrics: data.ly,
          songId: 'shared'
        });
        
        // Navigate to share page
        setStep('share');
        
        // Clear the hash from URL without reloading
        if (window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      } catch (e) {
        console.error('Invalid share data:', e);
      }
    }
  }, []);

  const handleStartCreation = () => {
    const element = document.getElementById('emotions-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleEmotionSelect = (emotion) => {
    setFormData(prev => ({ ...prev, emotion }));
    const element = document.getElementById('form-section');
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  const handleFormSubmit = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
    setStep('generating');
  };

  const handleGenerationResult = (result) => {
    setResultData(result);
  };

  const handleGenerationComplete = () => {
    setStep('result');
  };

  const handleShare = () => {
    if (resultData) {
      // Generate share URL with encoded data
      const shareData = {
        a: resultData.audioUrl,
        t: resultData.title,
        e: formData.emotion,
        n: formData.recipientName,
        y: formData.yourName,
        o: formData.occasion,
        v: formData.voiceType,
        s: formData.songStyle,
        d: resultData.duration,
        ly: resultData.lyrics
      };
      
      const encoded = btoa(encodeURIComponent(JSON.stringify(shareData)));
      const url = `https://ai-gift-song.vercel.app/#share=${encoded}`;
      setShareUrl(url);
    }
    setStep('share');
  };

  const handleRestart = () => {
    setStep('landing');
    setResultData(null);
    setIsPaid(false); // Reset payment state on restart
    setShareUrl(''); // Clear share URL
    setFormData({
      emotion: '',
      recipientName: '',
      yourName: '',
      occasion: '',
      story: '',
      details: '',
      voiceType: '',
      songStyle: ''
    });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {step === 'landing' && (
        <Landing 
          formData={formData}
          onStartCreation={handleStartCreation}
          onEmotionSelect={handleEmotionSelect}
          onFormSubmit={handleFormSubmit}
        />
      )}
      {step === 'generating' && (
        <Generating 
          formData={formData}
          onComplete={handleGenerationComplete}
          onResult={handleGenerationResult}
        />
      )}
      {step === 'result' && (
        <Result 
          formData={formData}
          resultData={resultData}
          onShare={handleShare}
          onRestart={handleRestart}
          isPaid={isPaid}
          setIsPaid={setIsPaid}
        />
      )}
      {step === 'share' && (
        <SharePage 
          formData={formData}
          resultData={resultData}
          onRestart={handleRestart}
          isPaid={isPaid}
          setIsPaid={setIsPaid}
          shareUrl={shareUrl}
        />
      )}
    </div>
  );
}

export default App;
