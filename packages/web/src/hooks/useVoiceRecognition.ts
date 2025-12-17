import { useState, useEffect, useRef } from 'react';

interface UseVoiceRecognitionReturn {
  isRecording: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
  startRecording: () => void;
  stopRecording: () => void;
}

export const useVoiceRecognition = (): UseVoiceRecognitionReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Check browser support on mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  // Initialize speech recognition
  const initializeRecognition = () => {
    if (recognitionRef.current) {
      return recognitionRef.current;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return null;
    }

    const recognition = new SpeechRecognition();

    // Configuration
    recognition.continuous = false; // Auto-stop when user stops speaking
    recognition.interimResults = true; // Show live transcription
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    // Handle results
    recognition.onresult = (event: any) => {
      let finalTranscript = '';

      // Collect final results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' ';
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript.trim());
      }
    };

    // Handle errors
    recognition.onerror = (event: any) => {
      const errorMessages: Record<string, string> = {
        'no-speech': 'No speech detected. Try again.',
        'audio-capture': 'Microphone not found or blocked.',
        'network': 'Network error. Check connection.',
        'not-allowed': 'Microphone permission denied.',
        'permission-denied': 'Microphone permission denied.',
      };

      setError(errorMessages[event.error] || `Error: ${event.error}`);
      setIsRecording(false);
    };

    // Handle end of recognition
    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    return recognition;
  };

  const startRecording = () => {
    const recognition = initializeRecognition();

    if (!recognition) {
      setError('Speech recognition not supported in this browser.');
      return;
    }

    try {
      setError(null);
      setTranscript('');
      recognition.start();
      setIsRecording(true);
    } catch (err: any) {
      setError(err.message || 'Failed to start recording.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Recognition might already be stopped
        setIsRecording(false);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current.onstart = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
        } catch (err) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  return {
    isRecording,
    isSupported,
    transcript,
    error,
    startRecording,
    stopRecording,
  };
};
