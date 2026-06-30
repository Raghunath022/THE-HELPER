import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, Volume2 } from 'lucide-react';
import VoiceButton from './VoiceButton';
import { getDecisionData } from './plannerHelpers';

export default function FarmPlanner({ user }) {
  const { t, i18n } = useTranslation();

  // --- States ---
  const [locationState, setLocationState] = useState('Uttar Pradesh');
  const [soilType, setSoilType] = useState('Loamy');
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [voiceResult, setVoiceResult] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (user && user.smartCardId) {
      const record = {
        'F-88291': { state: 'Uttar Pradesh', soil: 'Loamy', crop: 'Tomato' },
        'F-77482': { state: 'Uttar Pradesh', soil: 'Loamy', crop: 'Wheat' },
        'F-55321': { state: 'Tamil Nadu', soil: 'Clay', crop: 'Paddy' }
      }[user.smartCardId];
      if (record) {
        setLocationState(record.state);
        setSoilType(record.soil);
        setSelectedCrop(record.crop);
      }
    }
  }, [user]);

  // Text to Speech
  const speakText = (text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Pick active language voice if available
    const indVoice = voices.find(v => v.lang.includes('IN') || v.name.includes('India'));
    if (indVoice) utterance.voice = indVoice;
    
    // Attempt script detection for native voice selection
    const isDevanagari = /[\u0900-\u097F]/.test(text);
    const isTamil = /[\u0B80-\u0BFF]/.test(text);
    const isBengali = /[\u0980-\u09FF]/.test(text);

    if (isDevanagari) {
      const hiVoice = voices.find(v => v.lang.startsWith('hi'));
      if (hiVoice) utterance.voice = hiVoice;
    } else if (isTamil) {
      const taVoice = voices.find(v => v.lang.startsWith('ta'));
      if (taVoice) utterance.voice = taVoice;
    } else if (isBengali) {
      const bnVoice = voices.find(v => v.lang.startsWith('bn') || v.lang.startsWith('as'));
      if (bnVoice) utterance.voice = bnVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceInput = (transcript) => {
    const cleanText = transcript.toLowerCase();
    let response = "";
    
    // Multilingual Voice Responses Mapping
    const lang = i18n.language;
    if (lang === 'hi') {
      if (cleanText.includes("लगाना") || cleanText.includes("बोना") || cleanText.includes("फसल")) {
        if (cleanText.includes("टमाटर") || cleanText.includes("tomato")) {
          response = `क्षेत्रीय रुझानों के आधार पर, टमाटर के लिए वर्तमान बुवाई उपयुक्तता सूचकांक ${getDecisionData('Tomato', soilType, locationState, lang).sowingScore} प्रतिशत है। इष्टतम परिस्थितियां मौजूद हैं। हम देर शाम के घंटों के दौरान उठी क्यारियों पर पौधे लगाने की सलाह देते हैं।`;
          setSelectedCrop('Tomato');
        } else if (cleanText.includes("धान") || cleanText.includes("धान्य") || cleanText.includes("paddy")) {
          response = `धान की बुवाई उपयुक्तता वर्तमान में बहुत अधिक ${getDecisionData('Paddy', soilType, locationState, lang).sowingScore} प्रतिशत है। बारिश की उम्मीद है, जिससे रोपाई के लिए यह उत्कृष्ट है।`;
          setSelectedCrop('Paddy');
        } else {
          response = `आपकी चुनी हुई फसल के लिए बुवाई की उपयुक्तता वर्तमान में अनुकूल है। कृपया विस्तृत रिपोर्ट देखें।`;
        }
      } else if (cleanText.includes("पानी") || cleanText.includes("सिंचाई")) {
        response = "मिट्टी के सूखेपन के अनुसार सिंचाई करें। सुबह के ठंडे समय में पानी दें।";
      } else if (cleanText.includes("खाद") || cleanText.includes("उर्वरक")) {
        response = "पोषक तत्वों के लिए यूरिया और संतुलित एनपीके का उपयोग करें। मिट्टी का परीक्षण अवश्य कराएं।";
      } else {
        response = `नमस्ते! मैं आपका एआई वॉयस असिस्टेंट हूं। आप मुझसे रोपाई के समय, सिंचाई या उर्वरकों के बारे में पूछ सकते हैं।`;
      }
    } else if (lang === 'ta') {
      if (cleanText.includes("பயிர்") || cleanText.includes("விதை")) {
        if (cleanText.includes("தக்காளி") || cleanText.includes("tomato")) {
          response = `தக்காளி பயிர் செய்வதற்கான தற்போதைய விதைப்பு குறியீடு ${getDecisionData('Tomato', soilType, locationState, lang).sowingScore} சதவீதம் ஆகும். மாலையில் நடவு செய்ய பரிந்துரைக்கப்படுகிறது.`;
          setSelectedCrop('Tomato');
        } else if (cleanText.includes("நெல்") || cleanText.includes("paddy")) {
          response = `நெல் விதைப்பு குறியீடு தற்பொழுது மிக அதிகமாக ${getDecisionData('Paddy', soilType, locationState, lang).sowingScore} சதவீதம் உள்ளது.`;
          setSelectedCrop('Paddy');
        } else {
          response = `விதைப்பு தகுந்ததாக உள்ளது. உங்கள் டாஷ்போர்டு சரிபார்க்கவும்.`;
        }
      } else if (cleanText.includes("தண்ணீர்") || cleanText.includes("பாசனம்")) {
        response = "காலை நேரத்தில் பாசனம் செய்யவும். அதிக வறட்சி இருந்தால் மட்டும் தண்ணீர் ஊற்றவும்.";
      } else {
        response = "வணக்கம்! நான் உங்கள் வேளாண் குரல் உதவியாளர். பயிர் சாகுபடி பற்றி ஏதேனும் கேட்கலாம்.";
      }
    } else {
      // Default to English response
      if (cleanText.includes("plant") || cleanText.includes("sow") || cleanText.includes("planting")) {
        if (cleanText.includes("tomato")) {
          response = `Based on regional trends, the current sowing suitability index for tomato is ${getDecisionData('Tomato', soilType, locationState, lang).sowingScore} percent. Optimal conditions are present. We recommend transplanting seedlings on raised beds during late evening hours.`;
          setSelectedCrop('Tomato');
        } else if (cleanText.includes("paddy") || cleanText.includes("rice")) {
          response = `Paddy sowing suitability is currently very high at ${getDecisionData('Paddy', soilType, locationState, lang).sowingScore} percent. Rain is expected, making it excellent for transplanting.`;
          setSelectedCrop('Paddy');
        } else if (cleanText.includes("potato")) {
          response = `Potato suitability index is ${getDecisionData('Potato', soilType, locationState, lang).sowingScore} percent. Ensure loose soil and avoid waterlogging.`;
          setSelectedCrop('Potato');
        } else if (cleanText.includes("wheat")) {
          response = `Wheat sowing suitability is currently at ${getDecisionData('Wheat', soilType, locationState, lang).sowingScore} percent. Preparation of fine seedbed is recommended.`;
          setSelectedCrop('Wheat');
        } else {
          response = `Sowing suitability for your selected crop is currently favorable. Please refer to today's status card.`;
        }
      } else if (cleanText.includes("irrigate") || cleanText.includes("irrigation") || cleanText.includes("water")) {
        response = "Perform irrigation according to soil dryness. Water at base level and avoid overhead sprinkling during sunny hours.";
      } else if (cleanText.includes("fertilizer") || cleanText.includes("npk")) {
        response = "Apply NPK fertilizer corrective doses based on your target crop's specific requirements.";
      } else {
        response = `Hello! I am your AI farming assistant. You can ask me questions about planting times, irrigation schedules, or fertilizer doses.`;
      }
    }
    
    setVoiceResult(response);
    speakText(response);
  };

  const triggerPresetSpeech = (presetText) => {
    handleVoiceInput(presetText);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Title */}
      <div className="card-glass" style={{ borderLeft: '4px solid #52b788', padding: '16px 24px' }}>
        <h2 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
          {t('voice_hub_title', 'Farmer Voice Advisor Hub')}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginTop: '4px', margin: 0 }}>
          {t('voice_hub_subtitle', 'Consult with our voice-first intelligent advisor on crop plans, fertilizers, and irrigation.')}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        
        {/* Voice-First Assistant Hub */}
        <div className="card-glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Bot size={20} style={{ color: '#52b788' }} />
              {t('voice_assistant_title', 'Farmer Voice Assistant')}
            </h3>
            {isSpeaking && (
              <div className="voice-speaking-indicator">
                <Volume2 size={13} />
                <span style={{ fontSize: '0.75rem' }}>{t('ai_speaking', 'AI Speaking')}</span>
                <div className="voice-wave-bar" />
                <div className="voice-wave-bar" />
                <div className="voice-wave-bar" />
              </div>
            )}
          </div>

          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginBottom: '14px', lineHeight: 1.4 }}>
            {t('voice_assistant_desc', 'Click the microphone button to ask a question aloud, or select one of the quick test presets below:')}
          </p>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap' }}>
            <VoiceButton 
              onTranscript={handleVoiceInput}
              lang={i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'ta' ? 'ta-IN' : 'en-IN'}
            />
            <div style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(82, 183, 136, 0.1)', fontSize: '0.85rem', minHeight: '38px', color: 'hsl(var(--text-secondary))', minWidth: '200px' }}>
              {voiceResult ? (
                <span><strong>{t('ai_response_label', 'AI Response')}:</strong> {voiceResult}</span>
              ) : (
                <span style={{ fontStyle: 'italic', color: 'hsl(var(--text-muted))' }}>{t('ai_response_placeholder', 'AI advice text will output here...')}</span>
              )}
            </div>
          </div>

          {/* Presets Grid */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', width: '100%', marginBottom: '2px', fontWeight: 600 }}>{t('test_presets_label', 'Test Voice Presets:')}</span>
            <button 
              onClick={() => triggerPresetSpeech("Can I plant tomato this week?")}
              className="btn-secondary" 
              style={{ padding: '6px 12px', fontSize: '0.72rem', borderRadius: '8px' }}
            >
              "Can I plant tomato this week?"
            </button>
            <button 
              onClick={() => triggerPresetSpeech("What is the irrigation advice for paddy today?")}
              className="btn-secondary" 
              style={{ padding: '6px 12px', fontSize: '0.72rem', borderRadius: '8px' }}
            >
              "What is irrigation advice for paddy?"
            </button>
            <button 
              onClick={() => triggerPresetSpeech("How can I improve my potato yield?")}
              className="btn-secondary" 
              style={{ padding: '6px 12px', fontSize: '0.72rem', borderRadius: '8px' }}
            >
              "How to improve potato yield?"
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
