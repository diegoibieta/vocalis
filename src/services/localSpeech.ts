// Speech recognition and audio synthesis using standard Web APIs (100% Client-Side, Zero-Token)

export interface SpeechOptions {
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onAudioLevel?: (level: number) => void;
  onEnd?: () => void;
  onStart?: () => void;
}

export class LocalSpeechService {
  private recognition: any = null;
  private isListening = false;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private speechLang = 'es-ES';

  constructor() {
    // Check SpeechRecognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'es-ES';
    }
  }

  public isSupported(): boolean {
    return !!(
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    );
  }

  public setLanguage(lang: string) {
    this.speechLang = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  public async startListening(options: SpeechOptions = {}): Promise<boolean> {
    if (this.isListening) return true;

    try {
      if (!this.recognition) {
        options.onError?.('Reconocimiento de voz no soportado en este navegador.');
        return false;
      }

      this.recognition.lang = options.language || this.speechLang;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.playBeep('start');
        options.onStart?.();
      };

      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const text = final || interim;
        options.onResult?.(text, !!final);
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          options.onError?.(event.error);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.stopAudioAnalyser();
        options.onEnd?.();
      };

      this.recognition.start();
      this.startAudioAnalyser(options.onAudioLevel);
      return true;
    } catch (err: any) {
      console.error('Error starting speech recognition:', err);
      options.onError?.(err?.message || 'Error al acceder al micrófono');
      return false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
    this.isListening = false;
    this.stopAudioAnalyser();
  }

  public speak(
    text: string,
    options: {
      onEnd?: () => void;
      rate?: number;
      pitch?: number;
      lang?: string;
    } = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }

      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang || this.speechLang;
      utterance.rate = options.rate || 1.05; // natural swift pace
      utterance.pitch = options.pitch || 1.0;

      // Try selecting the best local voice
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(
        (v) => (v.lang.startsWith('es') || v.lang.startsWith('ES')) && (v.localService || v.name.includes('Natural') || v.name.includes('Google'))
      ) || voices.find((v) => v.lang.startsWith('es'));

      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }

      utterance.onend = () => {
        options.onEnd?.();
        resolve();
      };

      utterance.onerror = () => {
        options.onEnd?.();
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  public cancelSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  // Pure Web Audio API Sound Generator for feedback beeps (No MP3 downloads required)
  public playBeep(type: 'start' | 'success' | 'learn' | 'error') {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'start') {
        // Listening chime (gentle high blip)
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'success') {
        // Success chord (pleasant rising major third)
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'learn') {
        // Neural learning chime (sparkling 4-note ascending arpeggio)
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.06);
        osc.frequency.setValueAtTime(659.25, now + 0.12);
        osc.frequency.setValueAtTime(880, now + 0.18);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'error') {
        // Soft error buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(160, now + 0.2);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      }
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }

  private async startAudioAnalyser(onLevel?: (level: number) => void) {
    if (!onLevel) return;

    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const source = this.audioContext.createMediaStreamSource(this.micStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      const buffer = new Uint8Array(this.analyser.frequencyBinCount);

      const update = () => {
        if (!this.analyser || !this.isListening) return;
        this.analyser.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        const avg = sum / buffer.length;
        const normalized = Math.min(1, avg / 128);
        onLevel(normalized);
        this.animationFrameId = requestAnimationFrame(update);
      };

      update();
    } catch (e) {
      // Microphones permission denied or fallback simulation
      this.simulateAudioLevel(onLevel);
    }
  }

  private simulateAudioLevel(onLevel: (level: number) => void) {
    let t = 0;
    const interval = setInterval(() => {
      if (!this.isListening) {
        clearInterval(interval);
        onLevel(0);
        return;
      }
      t += 0.2;
      const simulated = Math.abs(Math.sin(t) * 0.6 + Math.cos(t * 1.5) * 0.3);
      onLevel(simulated);
    }, 80);
  }

  private stopAudioAnalyser() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
  }
}

export const speechService = new LocalSpeechService();
