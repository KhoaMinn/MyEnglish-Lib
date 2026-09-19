// ==========================================================================
// MOCHI ENGLISH - 3D INTERACTIVE FLASHCARD CONTROLLER
// Handles 3D flipping, keyboard navigation, learned marking, and progress
// ==========================================================================

import { audioPlayer } from './audio.js';
import { storage } from './storage.js';

export class FlashcardController {
  constructor(containerElement, onProgressUpdate) {
    this.container = containerElement;
    this.onProgressUpdate = onProgressUpdate;
    this.wordsList = [];
    this.currentIndex = 0;
    this.isFlipped = false;
    this.bindKeyboardShortcuts();
  }

  setWords(words) {
    this.wordsList = words;
    this.currentIndex = 0;
    this.isFlipped = false;
    this.render();
  }

  getCurrentWord() {
    return this.wordsList[this.currentIndex] || null;
  }

  flipCard() {
    this.isFlipped = !this.isFlipped;
    const flipper = this.container.querySelector('.card-flipper');
    if (flipper) {
      if (this.isFlipped) {
        flipper.classList.add('flipped');
      } else {
        flipper.classList.remove('flipped');
      }
    }
  }

  nextCard() {
    if (this.currentIndex < this.wordsList.length - 1) {
      this.currentIndex++;
      this.isFlipped = false;
      this.render();
    }
  }

  prevCard() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.isFlipped = false;
      this.render();
    }
  }

  markLearned() {
    const word = this.getCurrentWord();
    if (!word) return;
    const { isLearned, totalLearned } = storage.toggleLearned(word.id);
    if (this.onProgressUpdate) {
      this.onProgressUpdate({ wordId: word.id, isLearned, totalLearned });
    }
    this.nextCard();
  }

  markReview() {
    this.nextCard();
  }

  bindKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Only active if flashcard tab is visible
      if (this.container.offsetParent === null) return;

      if (e.code === 'Space') {
        e.preventDefault();
        this.flipCard();
      } else if (e.code === 'ArrowRight') {
        this.nextCard();
      } else if (e.code === 'ArrowLeft') {
        this.prevCard();
      } else if (e.code === 'KeyP') {
        const word = this.getCurrentWord();
        if (word) audioPlayer.speak(word.word);
      }
    });
  }

  render() {
    const word = this.getCurrentWord();
    if (!word) {
      this.container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
          <h3>Không tìm thấy từ vựng nào trong danh mục này.</h3>
        </div>
      `;
      return;
    }

    const isLearned = storage.isWordLearned(word.id);
    const progressPercent = Math.round(((this.currentIndex + 1) / this.wordsList.length) * 100);

    this.container.innerHTML = `
      <div class="flashcard-mode-container">
        <!-- Progress Bar -->
        <div class="flashcard-progress-text">
          <span>Thẻ số ${this.currentIndex + 1} / ${this.wordsList.length}</span>
          <span>${progressPercent}%</span>
        </div>
        <div class="flashcard-progress-bar">
          <div class="flashcard-progress-fill" style="width: ${progressPercent}%"></div>
        </div>

        <!-- 3D Card Scene -->
        <div class="card-scene" id="flashcardElement">
          <div class="card-flipper ${this.isFlipped ? 'flipped' : ''}">
            
            <!-- Mặt Trước (Front) -->
            <div class="card-face front">
              <div class="card-face-badge">
                <span class="badge-level ${word.level.toLowerCase()}">${word.cambridge_tier}</span>
              </div>
              <button class="icon-btn card-face-audio" id="btnAudioFront" title="Phát âm từ vựng">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
              </button>

              <div class="flashcard-big-word">${word.word}</div>
              <div class="flashcard-pos-text">${word.part_of_speech.vi} • ${word.topic}</div>

              <div class="flashcard-flip-prompt">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 21h5v-5"></path></svg>
                Nhấp chuột hoặc ấn phím Space để xem nghĩa
              </div>
            </div>

            <!-- Mặt Sau (Back) -->
            <div class="card-face back">
              <div class="card-face-badge">
                <span class="badge-level ${word.level.toLowerCase()}">${word.level}</span>
              </div>
              <button class="icon-btn card-face-audio" id="btnAudioBack" title="Phát âm lại">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
              </button>

              <div class="flashcard-vi-title">${word.meaning_vi}</div>
              <div class="flashcard-en-def">${word.meaning_en}</div>

              <div class="flashcard-example-quote">
                <p>“${word.example_en}”</p>
                <span><strong style="color: var(--secondary-blue);">Dịch:</strong> ${word.example_vi}</span>
              </div>

              <div class="flashcard-flip-prompt">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                Nhấp để quay lại mặt trước
              </div>
            </div>

          </div>
        </div>

        <!-- Controls -->
        <div class="flashcard-controls">
          <button class="btn-3d-secondary" id="btnPrevCard" ${this.currentIndex === 0 ? 'disabled' : ''} style="opacity: ${this.currentIndex === 0 ? 0.5 : 1}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 6px; vertical-align: -2px;"><polyline points="15 18 9 12 15 6"></polyline></svg>Quay lại
          </button>

          <button class="btn-3d-primary btn-review-again" id="btnReview">
            Chưa thuộc (Học lại)
          </button>

          <button class="btn-3d-green btn-learned" id="btnMarkLearned">
            ${isLearned ? '✓ Đã thuộc' : '✓ Đánh dấu đã thuộc'}
          </button>

          <button class="btn-3d-secondary" id="btnNextCard" ${this.currentIndex === this.wordsList.length - 1 ? 'disabled' : ''}>
            Tiếp theo <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-left: 6px; vertical-align: -2px;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>
    `;

    // Bind events
    const cardScene = this.container.querySelector('#flashcardElement');
    cardScene.addEventListener('click', (e) => {
      if (e.target.closest('.icon-btn')) return;
      this.flipCard();
    });

    const btnAudioFront = this.container.querySelector('#btnAudioFront');
    if (btnAudioFront) {
      btnAudioFront.addEventListener('click', (e) => {
        e.stopPropagation();
        audioPlayer.speak(word.word);
      });
    }

    const btnAudioBack = this.container.querySelector('#btnAudioBack');
    if (btnAudioBack) {
      btnAudioBack.addEventListener('click', (e) => {
        e.stopPropagation();
        audioPlayer.speak(word.example_en || word.word);
      });
    }

    this.container.querySelector('#btnPrevCard')?.addEventListener('click', () => this.prevCard());
    this.container.querySelector('#btnNextCard')?.addEventListener('click', () => this.nextCard());
    this.container.querySelector('#btnReview')?.addEventListener('click', () => this.markReview());
    this.container.querySelector('#btnMarkLearned')?.addEventListener('click', () => this.markLearned());
  }
}
