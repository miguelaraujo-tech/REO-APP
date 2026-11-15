export type TennisCue = 'serve' | 'hit' | 'good' | 'bad' | 'star' | 'win' | 'lose' | 'timeup' | 'tick';

const MUSIC_URL = '/tennis-education-music.mp3';

export class TennisAudio {
  private music: HTMLAudioElement | null = null;
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private sources = new Set<AudioScheduledSourceNode>();
  private enabled = true;
  private playing = false;
  private disposed = false;
  private playRequest = 0;

  constructor(private onBlocked: (blocked: boolean) => void = () => {}) {}

  prepare() {
    if (this.music || this.disposed || typeof Audio === 'undefined') return;
    this.music = new Audio(MUSIC_URL);
    this.music.preload = 'auto';
    this.music.loop = true;
    this.music.volume = 0.35;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (this.master) this.master.gain.value = enabled ? 0.65 : 0;
    if (!enabled) {
      this.playRequest++;
      this.music?.pause();
      this.stopEffects();
    } else if (this.playing) {
      this.unlock();
      this.playMusic();
    }
  }

  start(restart = false) {
    if (this.disposed) return;
    this.prepare();
    this.playing = true;
    if (restart && this.music) this.music.currentTime = 0;
    if (!this.enabled) return;
    // Chamado diretamente pelo botão Começar/Continuar ou pelo teclado.
    this.unlock();
    this.playMusic();
  }

  pause() {
    this.playing = false;
    this.playRequest++;
    this.music?.pause();
    this.stopEffects();
  }

  finish(cue?: TennisCue) {
    this.pause();
    if (this.music) this.music.currentTime = 0;
    if (cue) this.effect(cue);
  }

  private playMusic() {
    const music = this.music;
    if (!music || !this.playing || !this.enabled || this.disposed) return;
    const request = ++this.playRequest;
    try {
      void music.play().then(() => {
        if (this.disposed || request !== this.playRequest) return;
        if (!this.playing || !this.enabled) music.pause();
        else this.onBlocked(false);
      }).catch((error: unknown) => {
        if (!this.disposed && request === this.playRequest && this.playing && this.enabled &&
          (error as { name?: string })?.name === 'NotAllowedError') this.onBlocked(true);
      });
    } catch {
      // Uma falha de áudio nunca impede a partida.
    }
  }

  private unlock() {
    if (!this.enabled || this.disposed || typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      if (!this.context) {
        this.context = new AudioContextClass();
        this.master = this.context.createGain();
        this.master.gain.value = 0.65;
        this.master.connect(this.context.destination);
      }
      if (this.context.state === 'suspended') void this.context.resume().catch(() => {});
    } catch {
      // A música pode funcionar mesmo sem suporte para efeitos Web Audio.
    }
  }

  private stopEffects() {
    for (const source of this.sources) {
      try { source.stop(); } catch { /* O som pode já ter terminado. */ }
    }
    this.sources.clear();
  }

  private track(source: AudioScheduledSourceNode, nodes: AudioNode[]) {
    this.sources.add(source);
    source.onended = () => {
      this.sources.delete(source);
      source.disconnect();
      nodes.forEach((node) => node.disconnect());
    };
  }

  private note(frequency: number, offset: number, duration: number, volume = 0.11,
    type: OscillatorType = 'sine', endFrequency?: number) {
    const context = this.context;
    if (!context || !this.master) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + offset;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(this.master);
    this.track(oscillator, [gain]);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.01);
  }

  private noise(duration: number, volume: number, frequency: number) {
    const context = this.context;
    if (!context || !this.master) return;
    if (!this.noiseBuffer) {
      this.noiseBuffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.25), context.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const start = context.currentTime;
    source.buffer = this.noiseBuffer;
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(frequency, start);
    filter.Q.value = 0.7;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    this.track(source, [filter, gain]);
    source.start(start);
    source.stop(start + duration);
  }

  effect(cue: TennisCue) {
    if (!this.enabled || this.disposed || this.context?.state !== 'running') return;
    try {
      if (cue === 'serve') this.noise(0.13, 0.07, 1800);
      else if (cue === 'hit') {
        this.noise(0.065, 0.16, 1300);
        this.note(240, 0, 0.085, 0.14, 'triangle', 90);
      } else if (cue === 'good') {
        this.note(660, 0, 0.1);
        this.note(880, 0.065, 0.16);
      } else if (cue === 'bad') {
        this.note(230, 0, 0.15, 0.12, 'triangle', 150);
        this.note(170, 0.1, 0.19, 0.09, 'triangle');
      } else if (cue === 'tick') {
        this.note(900, 0, 0.045, 0.045);
      } else {
        const notes: Record<'star' | 'win' | 'lose' | 'timeup', number[]> = {
          star: [523, 659, 784, 1047],
          win: [523, 659, 784, 1047, 1319],
          lose: [330, 262, 196],
          timeup: [660, 660, 440],
        };
        notes[cue].forEach((frequency, index) => {
          this.note(frequency, index * 0.11, index === notes[cue].length - 1 ? 0.35 : 0.15,
            0.11, cue === 'lose' ? 'triangle' : 'sine');
        });
      }
    } catch {
      // Efeitos opcionais, sem impacto na lógica de jogo.
    }
  }

  dispose() {
    this.disposed = true;
    this.pause();
    if (this.music) {
      this.music.removeAttribute('src');
      this.music.load();
      this.music = null;
    }
    if (this.context) void this.context.close().catch(() => {});
    this.context = null;
    this.master = null;
    this.noiseBuffer = null;
  }
}
