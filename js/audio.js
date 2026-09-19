// ==========================================================================
// MOCHI ENGLISH - WEB SPEECH AUDIO SYNTHESIS
// Speaks English words and sentences using native browser speech API
// ==========================================================================

class AudioPlayer {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voice = null;
    this.initVoice();
  }

  initVoice() {
    if (!this.synth) return;
    const updateVoice = () => {
      const voices = this.synth.getVoices();
      // Prefer natural English voices (Google, Daniel, Samantha, etc.)
      this.voice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')))
                || voices.find(v => v.lang.startsWith('en'))
                || null;
    };
    updateVoice();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = updateVoice;
    }
  }

  speak(text, rate = 0.88) {
    if (!this.synth) {
      console.warn('SpeechSynthesis is not supported on this browser.');
      return;
    }

    this.synth.cancel(); // Cancel any ongoing speech

    const cleanText = text.replace(/[*_#]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    utterance.pitch = 1.0;
    if (this.voice) {
      utterance.voice = this.voice;
    }

    this.synth.speak(utterance);
  }
}

export const audioPlayer = new AudioPlayer();
