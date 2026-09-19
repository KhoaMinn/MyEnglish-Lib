// ==========================================================================
// MYENGLISHLIB - FILL IN THE BLANK ENGINE (4-CHOICE MULTIPLE CHOICE)
// Generates sentence completion challenges with smart contextual distractors
// ==========================================================================

export class FillBlankEngine {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.onComplete = options.onComplete || null;
    this.wordsPool = [];
    this.questions = [];
    this.currentIndex = 0;
    this.currentQuestion = null;
    this.score = 0;
    this.isAnswered = false;
  }

  setPool(words, totalQuestions = 10) {
    this.totalQuestions = totalQuestions;
    // Filter words that have valid examples
    this.wordsPool = words.filter(w => w.example_en && w.example_en.length > 5 && w.word);
    this.score = 0;
    this.currentIndex = 0;
    this.isAnswered = false;

    // Pick random items that contain the word in their example
    const candidates = this.wordsPool.filter(w => {
      const regex = new RegExp(`\\b${this.escapeRegex(w.word)}`, 'i');
      return regex.test(w.example_en);
    });

    const count = totalQuestions === 'all' ? this.wordsPool.length : (parseInt(totalQuestions, 10) || 10);
    const shuffled = [...(candidates.length >= count ? candidates : this.wordsPool)].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    this.questions = selected.map(item => this.buildQuestion(item));
    this.loadQuestion(0);
  }

  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  buildQuestion(item) {
    const fullSentence = item.example_en.replace(/[“"”]/g, '').trim();
    let sentenceWithBlank = fullSentence;
    let targetAnswer = item.word;

    // Try finding exact or inflected match in sentence
    const regex = new RegExp(`\\b(${this.escapeRegex(item.word)}[a-z]*)\\b`, 'i');
    const match = fullSentence.match(regex);

    if (match) {
      targetAnswer = match[1]; // Use exact casing/form found in sentence
      sentenceWithBlank = fullSentence.replace(regex, '<span class="blank-slot" id="blankSlot">_______</span>');
    } else {
      // Fallback: replace first word-like occurrence
      const words = fullSentence.split(' ');
      if (words.length > 2) {
        targetAnswer = words[1];
        words[1] = '<span class="blank-slot" id="blankSlot">_______</span>';
        sentenceWithBlank = words.join(' ');
      }
    }

    // Pick 3 smart distractors (prefer same part of speech)
    const targetPos = item.part_of_speech ? item.part_of_speech.abbr : '';
    let distractors = this.wordsPool
      .filter(w => w.id !== item.id && w.word.toLowerCase() !== targetAnswer.toLowerCase() && w.part_of_speech && w.part_of_speech.abbr === targetPos)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(w => w.word);

    // Fallback if not enough with same POS
    if (distractors.length < 3) {
      const more = this.wordsPool
        .filter(w => w.id !== item.id && w.word.toLowerCase() !== targetAnswer.toLowerCase() && !distractors.includes(w.word))
        .sort(() => 0.5 - Math.random())
        .slice(0, 3 - distractors.length)
        .map(w => w.word);
      distractors = [...distractors, ...more];
    }

    // 4 Options shuffled
    const options = [targetAnswer, ...distractors].sort(() => 0.5 - Math.random());

    return {
      item,
      fullSentence,
      sentenceWithBlank,
      targetAnswer,
      options
    };
  }

  loadQuestion(index) {
    if (index >= this.questions.length) {
      this.renderCompletionScreen();
      return;
    }

    this.currentIndex = index;
    this.currentQuestion = this.questions[index];
    this.isAnswered = false;

    this.render();
  }

  render() {
    const q = this.currentQuestion;
    const progressPercent = Math.round(((this.currentIndex + 1) / this.questions.length) * 100);

    this.container.innerHTML = `
      <div class="fill-blank-wrapper">
        
        <!-- Header Progress -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <span style="font-weight: 700; color: var(--secondary-blue); font-size: 15px;">
            Câu ${this.currentIndex + 1} / ${this.questions.length}
          </span>
          <span style="font-weight: 700; color: var(--text-muted); font-size: 14px;">
            Điểm: ${this.score} đúng
          </span>
        </div>

        <div class="flashcard-progress-bar" style="margin-bottom: 24px;">
          <div class="flashcard-progress-fill" style="width: ${progressPercent}%"></div>
        </div>

        <!-- Question Card -->
        <div class="fill-blank-card">
          <div class="fill-blank-meta-row">
            <span class="fill-blank-type-tag">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              Điền từ thích hợp vào chỗ trống
            </span>
            <span class="badge-level ${q.item.level.toLowerCase()}">
              ${q.item.cambridge_tier} • ${q.item.part_of_speech.vi}
            </span>
          </div>

          <!-- Sentence Box with Blank -->
          <div class="fill-blank-sentence-box">
            <div class="fill-blank-sentence">
              ${q.sentenceWithBlank}
            </div>

            <div class="fill-blank-translation" id="fillBlankTranslation">
              <strong>Nghĩa câu:</strong> “${q.item.example_vi}”
            </div>
          </div>

          <!-- 4 Multiple Choice Options -->
          <div class="fill-blank-options-grid">
            ${q.options.map((opt, idx) => `
              <button class="fill-blank-option-btn" data-word="${opt}">
                <span class="fill-blank-option-letter">${String.fromCharCode(65 + idx)}</span>
                <span>${opt}</span>
              </button>
            `).join('')}
          </div>

          <!-- Feedback Banner -->
          <div class="fill-blank-feedback" id="fillBlankFeedback"></div>

          <!-- Next Action Row -->
          <div style="text-align: center; margin-top: 10px;">
            <button class="btn-fill-next" id="btnNextQuestion" style="display: none;">
              ${this.currentIndex === this.questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-left: 6px;"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>

        </div>

      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Options click
    const optionBtns = this.container.querySelectorAll('.fill-blank-option-btn');
    optionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.isAnswered) return;
        this.handleAnswer(btn.dataset.word, btn);
      });
    });

    // Next Button
    this.container.querySelector('#btnNextQuestion')?.addEventListener('click', () => {
      this.loadQuestion(this.currentIndex + 1);
    });
  }

  handleAnswer(selectedWord, selectedBtn) {
    if (this.isAnswered) return;
    this.isAnswered = true;

    const q = this.currentQuestion;
    const isCorrect = selectedWord.toLowerCase() === q.targetAnswer.toLowerCase();
    const blankSlot = this.container.querySelector('#blankSlot');
    const feedbackBox = this.container.querySelector('#fillBlankFeedback');
    const translationBox = this.container.querySelector('#fillBlankTranslation');
    const nextBtn = this.container.querySelector('#btnNextQuestion');
    const allBtns = this.container.querySelectorAll('.fill-blank-option-btn');

    // Reveal sentence Vietnamese meaning after answering
    if (translationBox) {
      translationBox.classList.add('is-visible');
    }

    // Disable all options and show colors
    allBtns.forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.word.toLowerCase() === q.targetAnswer.toLowerCase()) {
        btn.classList.add('correct');
      } else if (btn === selectedBtn && !isCorrect) {
        btn.classList.add('incorrect');
      }
    });

    if (isCorrect) {
      this.score++;
      if (blankSlot) {
        blankSlot.textContent = q.targetAnswer;
        blankSlot.className = 'blank-slot filled-correct';
      }

      if (feedbackBox) {
        feedbackBox.className = 'fill-blank-feedback is-correct';
        feedbackBox.innerHTML = `
          <span>✓ Chính xác! Bạn đã chọn đúng từ: <strong>${q.targetAnswer}</strong> (${q.item.meaning_vi})</span>
        `;
      }
    } else {
      if (blankSlot) {
        blankSlot.textContent = q.targetAnswer;
        blankSlot.className = 'blank-slot filled-incorrect';
      }

      if (feedbackBox) {
        feedbackBox.className = 'fill-blank-feedback is-incorrect';
        feedbackBox.innerHTML = `
          <span>Chưa chính xác! Đáp án đúng là: <strong>${q.targetAnswer}</strong> (${q.item.meaning_vi})</span>
        `;
      }
    }

    if (nextBtn) {
      nextBtn.style.display = 'inline-flex';
    }
  }

  renderCompletionScreen() {
    const total = this.questions.length;
    const percent = Math.round((this.score / total) * 100);

    this.container.innerHTML = `
      <div class="fill-blank-wrapper" style="text-align: center; padding-top: 40px;">
        <div class="fill-blank-card" style="padding: 48px 32px;">
          <div style="margin-bottom: 20px; color: var(--accent-gold); display: flex; justify-content: center;">
            <svg width="68" height="68" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.82 2.67 3.32 3.19L10 19H8v2h8v-2h-2.71l-.71-2.87c1.5-.52 2.69-1.69 3.32-3.19C18.08 12.63 20 10.55 20 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
            </svg>
          </div>

          <h2 style="font-size: 28px; color: var(--primary-blue); margin-bottom: 12px;">
            ${percent >= 80 ? 'Hoàn Thành Xuất Sắc!' : 'Luyện Tập Hoàn Thành!'}
          </h2>

          <p style="font-size: 16px; color: var(--text-muted); margin-bottom: 28px;">
            Bạn đã điền đúng <strong>${this.score}/${total}</strong> câu hỏi (${percent}%)
          </p>

          <div style="display: flex; justify-content: center; gap: 16px; margin-bottom: 32px; flex-wrap: wrap;">
            <div class="stat-chip streak" style="font-size: 16px; padding: 10px 24px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#0950AE" style="vertical-align: -2px; margin-right: 6px;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              Kết quả: ${this.score}/${total} câu (${percent}%)
            </div>
          </div>

          <div style="display: flex; justify-content: center; gap: 14px; flex-wrap: wrap;">
            <button class="btn-3d-primary" id="btnRestartFillBlank">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 6px; vertical-align: -2px;"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
              Luyện tiếp ${total} câu mới
            </button>
            <button class="btn-3d-secondary" id="btnReconfigCompletion">
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

    this.container.querySelector('#btnRestartFillBlank')?.addEventListener('click', () => {
      this.setPool(this.wordsPool, this.totalQuestions);
    });

    this.container.querySelector('#btnReconfigCompletion')?.addEventListener('click', () => {
      if (this.onReconfigure) {
        this.onReconfigure();
      }
    });

    if (this.onComplete) {
      this.onComplete({ score: this.score, total });
    }
  }
}
