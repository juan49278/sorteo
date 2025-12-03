
class AudioService {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  private init() {
    if (!this.context) {
      // Create AudioContext on first user interaction
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 0.3; // Default volume (not too loud)
      this.masterGain.connect(this.context.destination);
    }
    
    // Resume if suspended (browser autoplay policy)
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  playTick() {
    this.init();
    if (!this.context || !this.masterGain) return;
    
    const t = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    // Short, high-pitched "woodblock" sound for suspense
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);
    
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(t);
    osc.stop(t + 0.06);
  }

  playWin() {
    this.init();
    if (!this.context || !this.masterGain) return;

    const t = this.context.currentTime;
    // C Major chord (C4, E4, G4, C5) with a "brass" feel
    const notes = [523.25, 659.25, 783.99, 1046.50]; 

    notes.forEach((freq, i) => {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      
      // Sawtooth for a brighter, triumphant sound
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      
      // Envelope for the "fanfare" swell
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.1); // Attack
      gain.gain.exponentialRampToValueAtTime(0.01, t + 2.5); // Decay
      
      osc.connect(gain);
      gain.connect(this.masterGain!);
      
      // Stagger entries slightly for a arpeggiated effect
      osc.start(t + (i * 0.04)); 
      osc.stop(t + 3.0);
    });
  }
}

export const audioService = new AudioService();
