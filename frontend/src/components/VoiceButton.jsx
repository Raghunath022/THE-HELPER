import React, { useState, useCallback, useRef } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';

/**
 * VoiceButton – uses the Web Speech API to transcribe voice to text.
 * Props:
 *   onTranscript(text: string) – called when recognition returns a result
 *   lang – BCP-47 language tag, e.g. 'en-IN' or 'ta-IN'
 *   disabled – boolean
 */
export default function VoiceButton({ onTranscript, lang = 'en-IN', disabled = false, customTitles }) {
  const [status, setStatus] = useState('idle'); // idle | listening | error
  const recognitionRef = useRef(null);

  const SpeechRecognition =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  const isSupported = Boolean(SpeechRecognition);

  const toggleListening = useCallback(() => {
    if (!isSupported || disabled) return;

    if (status === 'listening') {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setStatus('idle');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = lang;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setStatus('listening');

      recognition.onresult = (event) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            onTranscript(transcript);
          }
        }
        setStatus('idle');
      };

      recognition.onerror = (e) => {
        console.error('Speech recognition error:', e.error);
        setStatus('error');
      };

      recognition.onend = () => {
        setStatus(s => s === 'listening' ? 'idle' : s);
        recognitionRef.current = null;
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition start failed:', err);
      setStatus('error');
    }
  }, [isSupported, status, disabled, lang, onTranscript]);

  if (!isSupported) {
    return (
      <button className="voice-btn voice-btn-unsupported" disabled title="Voice not supported in this browser">
        <MicOff size={18} />
      </button>
    );
  }

  const titles = customTitles || { idle: 'Click to speak', listening: 'Listening…', error: 'Try again' };
  const icons  = {
    idle:      <Mic size={18} />,
    listening: <Loader size={18} className="animate-spin" />,
    error:     <MicOff size={18} />,
  };

  return (
    <button
      id="voice-btn"
      className={`voice-btn voice-btn-${status}`}
      onClick={toggleListening}
      disabled={disabled}
      title={titles[status]}
      aria-label={titles[status]}
    >
      {icons[status]}
      {status === 'listening' && <span className="voice-pulse-ring" />}
    </button>
  );
}
