// ==========================================================================
// MYENGLISHLIB - SENTENCE SCRAMBLE ENGINE (DUOLINGO STYLE)
// Interactive slot & bank sentence ordering logic
// ==========================================================================

import { audioPlayer } from './audio.js';
import { storage } from './storage.js';

export class ScrambleEngine {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.onComplete = options.onComplete || null;
    this.wordsPool = [];
    this.questions = [];
    this.currentIndex = 0;
    this.mode = 'mixed'; // 'vi_to_en', 'en_to_vi', 'mixed'
    this.currentQuestion = null;
    this.bankTokens = []; // [{ uid, text, isDistractor }]
    this.selectedUids = [];
    this.isAnswered = false;
    this.isCorrect = false;
    this.score = 0;
  }

  setPool(words, mode = 'mixed', totalQuestions = 10) {
    this.wordsPool = words.filter(w => w.example_en && w.example_vi);
    this.mode = mode;
    this.totalQuestions = totalQuestions;
    this.score = 0;
    this.currentIndex = 0;
    this.isAnswered = false;

    // Pick random items from pool
    const shuffled = [...this.wordsPool].sort(() => 0.5 - Math.random());
    const count = totalQuestions === 'all' ? shuffled.length : Math.min(parseInt(totalQuestions, 10) || 10, shuffled.length);
    const selected = shuffled.slice(0, count);

    this.questions = selected.map((item, idx) => {
      let qType = this.mode;
      if (this.mode === 'mixed') {
        qType = idx % 2 === 0 ? 'vi_to_en' : 'en_to_vi';
      }
      return {
        item,
        type: qType // 'vi_to_en' or 'en_to_vi'
      };
    });

    this.loadQuestion(this.currentIndex);
  }

  loadQuestion(index) {
    if (index >= this.questions.length) {
      this.renderCompletionScreen();
      return;
    }

    this.currentIndex = index;
    this.currentQuestion = this.questions[index];
    this.isAnswered = false;
    this.isCorrect = false;
    this.selectedUids = [];

    const { item, type } = this.currentQuestion;
    const isViToEn = type === 'vi_to_en';

    // Target sentence to assemble
    const targetSentence = isViToEn ? item.example_en : item.example_vi;

    // Clean tokens (strictly within the sentence, no outside words)
    const rawTokens = targetSentence
      .replace(/[“"”]/g, '')
      .replace(/[.?!]$/, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    // Create unique tokens strictly from the target sentence
    this.bankTokens = rawTokens.map((t, i) => ({
      uid: `token-${i}`,
      text: t
    }));

    // Shuffle the bank tokens
    this.bankTokens.sort(() => 0.5 - Math.random());

    this.render();

    // Auto-speak if English source prompt
    if (!isViToEn) {
      audioPlayer.speak(item.example_en);
    }
  }

  render() {
    const { item, type } = this.currentQuestion;
    const isViToEn = type === 'vi_to_en';

    const sourceSentence = isViToEn ? item.example_vi : item.example_en;
    const promptTitle = isViToEn
      ? "Sắp xếp các từ tiếng Anh để dịch câu sau:"
      : "Sắp xếp các từ tiếng Việt để dịch câu sau:";

    const progressPercent = Math.round(((this.currentIndex + 1) / this.questions.length) * 100);

    this.container.innerHTML = `
      <div class="scramble-wrapper">
        
        <!-- Header Progress -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <span style="font-weight: 700; color: var(--secondary-blue); font-size: 15px;">
            Câu ${this.currentIndex + 1} / ${this.questions.length}
          </span>
          <span style="font-weight: 700; color: var(--text-muted); font-size: 14px;">
            ${progressPercent}%
          </span>
        </div>

        <div class="flashcard-progress-bar" style="margin-bottom: 24px;">
          <div class="flashcard-progress-fill" style="width: ${progressPercent}%"></div>
        </div>

        <!-- Prompt Card -->
        <div class="scramble-prompt-card">
          <div class="scramble-mode-badge-row">
            <span class="scramble-direction-badge">
              ${isViToEn ? 'Tiếng Việt ➔ Tiếng Anh' : 'Tiếng Anh ➔ Tiếng Việt'}
            </span>
            <span class="badge-level ${item.level.toLowerCase()}">
              ${item.cambridge_tier} • ${item.topic}
            </span>
          </div>

          <div class="scramble-question-title">${promptTitle}</div>

          <div class="scramble-bubble-container">
            <div class="scramble-avatar-circle" title="MyEnglishLib Tutor">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0950AE" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>

            <div class="scramble-speech-bubble">
              <div class="scramble-source-sentence">${sourceSentence}</div>
              ${!isViToEn ? `
                <button class="scramble-audio-btn" id="btnPlaySourceAudio" title="Nghe phát âm">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
                </button>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Answer Tray (Ngăn chứa từ đã chọn) -->
        <div class="scramble-answer-tray ${this.selectedUids.length === 0 ? 'empty' : ''}" id="scrambleAnswerTray">
          ${this.selectedUids.length === 0 ? `
            <span class="scramble-tray-placeholder">Nhấp vào các thẻ từ bên dưới để ghép vào đây</span>
          ` : this.selectedUids.map(uid => {
            const token = this.bankTokens.find(t => t.uid === uid);
            return `<button class="word-chip" data-uid="${token.uid}">${token.text}</button>`;
          }).join('')}
        </div>

        <!-- Word Bank (Ngân hàng từ bên dưới) -->
        <div class="scramble-word-bank" id="scrambleWordBank">
          ${this.bankTokens.map(token => {
            const isUsed = this.selectedUids.includes(token.uid);
            return `
              <button class="word-chip ${isUsed ? 'is-used' : ''}" data-uid="${token.uid}">
                ${token.text}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Floating Bottom Action Drawer -->
        <div class="scramble-action-bar" id="scrambleActionBar">
          <div class="scramble-action-content">
            <div class="scramble-feedback-info" id="scrambleFeedbackInfo" style="display: none;">
              <div class="scramble-feedback-icon" id="scrambleFeedbackIcon">
                <!-- Injected on check -->
              </div>
              <div class="scramble-feedback-text" id="scrambleFeedbackText">
                <!-- Injected on check -->
              </div>
            </div>

            <button class="btn-duo-check" id="btnCheckAnswer" ${this.selectedUids.length === 0 ? 'disabled' : ''}>
              Kiểm tra
            </button>
          </div>
        </div>

      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Audio button on prompt
    this.container.querySelector('#btnPlaySourceAudio')?.addEventListener('click', () => {
      audioPlayer.speak(this.currentQuestion.item.example_en);
    });

    // Word Bank click: Move chip into Answer Tray
    const wordBank = this.container.querySelector('#scrambleWordBank');
    if (wordBank) {
      wordBank.querySelectorAll('.word-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          if (this.isAnswered) return;
          const uid = chip.dataset.uid;
          if (!this.selectedUids.includes(uid)) {
            this.selectedUids.push(uid);
            this.updateTrayAndBank();
          }
        });
      });
    }

    // Answer Tray click: Remove chip from Tray back to Bank
    const answerTray = this.container.querySelector('#scrambleAnswerTray');
    if (answerTray) {
      answerTray.querySelectorAll('.word-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          if (this.isAnswered) return;
          const uid = chip.dataset.uid;
          this.selectedUids = this.selectedUids.filter(id => id !== uid);
          this.updateTrayAndBank();
        });
      });
    }

    // Check Answer Button
    const checkBtn = this.container.querySelector('#btnCheckAnswer');
    if (checkBtn) {
      checkBtn.addEventListener('click', () => {
        if (!this.isAnswered) {
          this.checkAnswer();
        } else {
          this.nextQuestion();
        }
      });
    }
  }

  updateTrayAndBank() {
    // Re-render only the tray and bank for instant, seamless responsiveness
    const answerTray = this.container.querySelector('#scrambleAnswerTray');
    if (answerTray) {
      if (this.selectedUids.length === 0) {
        answerTray.classList.add('empty');
        answerTray.innerHTML = `<span class="scramble-tray-placeholder">Nhấp vào các thẻ từ bên dưới để ghép vào đây</span>`;
      } else {
        answerTray.classList.remove('empty');
        answerTray.innerHTML = this.selectedUids.map(uid => {
          const token = this.bankTokens.find(t => t.uid === uid);
          return `<button class="word-chip" data-uid="${token.uid}">${token.text}</button>`;
        }).join('');

        // Bind removal clicks
        answerTray.querySelectorAll('.word-chip').forEach(chip => {
          chip.addEventListener('click', () => {
            if (this.isAnswered) return;
            const uid = chip.dataset.uid;
            this.selectedUids = this.selectedUids.filter(id => id !== uid);
            this.updateTrayAndBank();
          });
        });
      }
    }

    // Update used states in bank
    const wordBank = this.container.querySelector('#scrambleWordBank');
    if (wordBank) {
      wordBank.querySelectorAll('.word-chip').forEach(chip => {
        const uid = chip.dataset.uid;
        chip.classList.toggle('is-used', this.selectedUids.includes(uid));
      });
    }

    // Update Check Button disabled state
    const checkBtn = this.container.querySelector('#btnCheckAnswer');
    if (checkBtn) {
      checkBtn.disabled = this.selectedUids.length === 0;
    }
  }

  normalizeForComparison(str) {
    return str
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'“”]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  checkAnswer() {
    if (this.isAnswered || this.selectedUids.length === 0) return;
    this.isAnswered = true;

    const { item, type } = this.currentQuestion;
    const isViToEn = type === 'vi_to_en';
    const targetSentence = isViToEn ? item.example_en : item.example_vi;

    // Assembled sentence string
    const assembledWords = this.selectedUids.map(uid => {
      const token = this.bankTokens.find(t => t.uid === uid);
      return token ? token.text : '';
    });
    const assembledSentence = assembledWords.join(' ');

    const normAssembled = this.normalizeForComparison(assembledSentence);
    const normTarget = this.normalizeForComparison(targetSentence);

    this.isCorrect = normAssembled === normTarget;

    const actionBar = this.container.querySelector('#scrambleActionBar');
    const feedbackInfo = this.container.querySelector('#scrambleFeedbackInfo');
    const feedbackIcon = this.container.querySelector('#scrambleFeedbackIcon');
    const feedbackText = this.container.querySelector('#scrambleFeedbackText');
    const checkBtn = this.container.querySelector('#btnCheckAnswer');

    if (feedbackInfo) feedbackInfo.style.display = 'flex';

    if (this.isCorrect) {
      this.score++;
      // Speak English target sentence
      audioPlayer.speak(item.example_en);

      if (actionBar) {
        actionBar.classList.remove('is-incorrect');
        actionBar.classList.add('is-correct');
      }

      if (feedbackIcon) {
        feedbackIcon.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
      }

      if (feedbackText) {
        feedbackText.innerHTML = `
          <h4>Tuyệt vời! Bạn đã ghép chính xác.</h4>
          <p>${item.example_en} — ${item.example_vi}</p>
        `;
      }

      if (checkBtn) {
        checkBtn.textContent = 'Tiếp tục';
        checkBtn.className = 'btn-duo-check';
        checkBtn.disabled = false;
      }
    } else {
      audioPlayer.speak('Check the answer');

      if (actionBar) {
        actionBar.classList.remove('is-correct');
        actionBar.classList.add('is-incorrect');
      }

      if (feedbackIcon) {
        feedbackIcon.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        `;
      }

      if (feedbackText) {
        feedbackText.innerHTML = `
          <h4>Chưa chính xác!</h4>
          <p>Đáp án đúng: <strong>${targetSentence}</strong></p>
        `;
      }

      if (checkBtn) {
        checkBtn.textContent = 'Đã hiểu / Tiếp tục';
        checkBtn.className = 'btn-duo-check btn-danger';
        checkBtn.disabled = false;
      }
    }
  }

  nextQuestion() {
    this.loadQuestion(this.currentIndex + 1);
  }

  renderCompletionScreen() {
    const total = this.questions.length;
    const percent = Math.round((this.score / total) * 100);

    this.container.innerHTML = `
      <div class="scramble-wrapper" style="text-align: center; padding-top: 40px;">
        <div class="scramble-prompt-card" style="padding: 48px 32px;">
          <div style="margin-bottom: 20px; color: var(--accent-gold); display: flex; justify-content: center;">
            <svg width="68" height="68" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.82 2.67 3.32 3.19L10 19H8v2h8v-2h-2.71l-.71-2.87c1.5-.52 2.69-1.69 3.32-3.19C18.08 12.63 20 10.55 20 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
            </svg>
          </div>

          <h2 style="font-size: 28px; color: var(--primary-blue); margin-bottom: 12px;">
            ${percent >= 80 ? 'Hoàn Thành Xuất Sắc!' : 'Luyện Tập Hoàn Thành!'}
          </h2>

          <p style="font-size: 16px; color: var(--text-muted); margin-bottom: 28px;">
            Bạn đã ghép đúng <strong>${this.score}/${total}</strong> câu (${percent}%)
          </p>

          <div style="display: flex; justify-content: center; gap: 16px; margin-bottom: 32px; flex-wrap: wrap;">
            <div class="stat-chip streak" style="font-size: 16px; padding: 10px 24px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#0950AE" style="vertical-align: -2px; margin-right: 6px;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              Kết quả: ${this.score}/${total} câu
            </div>
          </div>

          <div style="display: flex; justify-content: center; gap: 14px; flex-wrap: wrap;">
            <button class="btn-3d-primary" id="btnRestartScramble">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 6px; vertical-align: -2px;"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
              Luyện tiếp ${total} câu mới
            </button>
            <button class="btn-3d-secondary" id="btnReconfigScrambleCompletion">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 6px; vertical-align: -2px;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              Thiết lập bài mới
            </button>
            <a href="index.html" class="btn-3d-secondary">
              Về lộ trình học
            </a>
          </div>
        </div>
      </div>
    `;

    this.container.querySelector('#btnRestartScramble')?.addEventListener('click', () => {
      this.setPool(this.wordsPool, this.mode, this.totalQuestions);
    });

    this.container.querySelector('#btnReconfigScrambleCompletion')?.addEventListener('click', () => {
      if (this.onReconfigure) {
        this.onReconfigure();
      }
    });

    if (this.onComplete) {
      this.onComplete({ score: this.score, total });
    }
  }
}
