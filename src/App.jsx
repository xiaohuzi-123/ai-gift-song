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
  const [isPaid, setIsPaid] = useState(false); // Payment state for 30s preview unlock

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
    setStep('share');
  };

  const handleRestart = () => {
    setStep('landing');
    setResultData(null);
    setIsPaid(false); // Reset payment state on restart
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
        />
      )}
    </div>
  );
}

export default App;
