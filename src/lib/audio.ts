import { InterviewLanguage } from '@/types';

// Speech Recognition types for browser compatibility
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

let activeRecognition: SpeechRecognitionInstance | null = null;

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return [];
  return window.speechSynthesis.getVoices();
}

/**
 * Initiates speech recognition with callbacks
 */
export function startSpeechRecognition(options: {
  lang: InterviewLanguage;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (errorMessage: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}): (() => void) | null {
  if (!isSpeechRecognitionSupported()) {
    options.onError('Browser Speech Recognition is not supported in this browser. Please use the text input.');
    return null;
  }

  try {
    stopSpeechRecognition();

    const SpeechRecognitionConstructor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition: SpeechRecognitionInstance = new SpeechRecognitionConstructor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = options.lang || 'en-US';

    recognition.onstart = () => {
      options.onStart?.();
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      options.onResult(final || interim, !!final);
    };

    recognition.onerror = (event: any) => {
      let msg = 'Speech recognition error occurred.';
      if (event.error === 'not-allowed') {
        msg = 'Microphone access denied. Please grant microphone permissions in browser settings or use text typing.';
      } else if (event.error === 'no-speech') {
        msg = 'No speech detected. Please speak closer to your microphone or type your response.';
      } else if (event.error === 'network') {
        msg = 'Speech recognition network error. Text fallback is available.';
      }
      options.onError(msg);
    };

    recognition.onend = () => {
      options.onEnd?.();
      activeRecognition = null;
    };

    recognition.start();
    activeRecognition = recognition;

    return () => stopSpeechRecognition();
  } catch (err: any) {
    options.onError(err?.message || 'Could not start speech recognition.');
    return null;
  }
}

export function stopSpeechRecognition(): void {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch (e) {
      // ignore
    }
    activeRecognition = null;
  }
}

/**
 * Text-to-Speech playback for question asking
 */
export function speakText(
  text: string,
  options?: {
    lang?: InterviewLanguage;
    rate?: number;
    pitch?: number;
    voiceURI?: string;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): void {
  if (!isSpeechSynthesisSupported()) {
    options?.onError?.(new Error('Speech Synthesis not supported in this browser'));
    return;
  }

  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options?.lang || 'en-US';
  utterance.rate = options?.rate ?? 1.0;
  utterance.pitch = options?.pitch ?? 1.0;

  if (options?.voiceURI) {
    const voices = getAvailableVoices();
    const matchingVoice = voices.find((v) => v.voiceURI === options.voiceURI);
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
  }

  utterance.onstart = () => {
    options?.onStart?.();
  };

  utterance.onend = () => {
    options?.onEnd?.();
  };

  utterance.onerror = (event) => {
    options?.onError?.(event);
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}
