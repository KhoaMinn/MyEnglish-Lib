// ==========================================================================
// MYENGLISHLIB - QUIZ CHALLENGE ENGINE
// Generates dynamic 4-choice questions from Cambridge wordlist (En->Vi, Vi->En, Mixed)
// ==========================================================================

import { audioPlayer } from './audio.js';
import { storage } from './storage.js';

export class QuizController {
  constructor(containerElement, onQuizComplete) {
    this.container = containerElement;
    this.onQuizComplete = onQuizComplete;
    this.onReconfigure = null;
    this.allWords = [];
    this.questions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.answered = false;
    this.mode = 'mixed';
    this.totalQuestions = 10;
  }

  startQuiz(words, totalQuestions = 10, mode = 'mixed') {
    this.allWords = words;
    this.totalQuestions = totalQuestions;
    this.mode = mode;
    this.score = 0;
    this.currentIndex = 0;
    this.answered = false;

    // Shuffle and pick target words
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    const count = totalQuestions === 'all' ? words.length : Math.min(parseInt(totalQuestions, 10) || 10, words.length);
    const selectedTargets = shuffled.slice(0, count);

    this.questions = selectedTargets.map((target, idx) => {
      // Determine question direction
      let qType = this.mode;
      if (this.mode === 'mixed') {
        qType = idx % 2 === 0 ? 'en_to_vi' : 'vi_to_en';
      }

      // Pick 3 distractors
      const distractors = words
        .filter(w => w.id !== target.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const options = [target, ...distractors].sort(() => 0.5 - Math.random());

      return {
        target,
        options,
        correctOptionId: target.id,
        type: qType // 'en_to_vi' or 'vi_to_en'
      };
    });

    this.renderQuestion();
  }

  handleAnswer(selectedOption, optionButton) {
    if (this.answered) return;
    this.answered = true;

    const currentQ = this.questions[this.currentIndex];
    const isCorrect = selectedOption.id === currentQ.correctOptionId;
    const feedbackBox = this.container.querySelector('#quizFeedback');
    const allButtons = this.container.querySelectorAll('.quiz-option-btn');

    allButtons.forEach(btn => {
      const btnId = parseInt(btn.dataset.id, 10);
      if (btnId === currentQ.correctOptionId) {
        btn.classList.add('correct');
      } else if (btn === optionButton && !isCorrect) {
        btn.classList.add('incorrect');
      }
      btn.disabled = true;
    });

    if (isCorrect) {
      this.score++;
      audioPlayer.speak('Excellent!');
      feedbackBox.innerHTML = `
        <span style="color: #27ae60; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#27ae60" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Chính xác! Đáp án hoàn toàn đúng
        </span>
      `;
    } else {
      audioPlayer.speak('Nice try!');
      const answerStr = currentQ.type === 'en_to_vi' ? currentQ.target.meaning_vi : currentQ.target.word;
      feedbackBox.innerHTML = `
        <span style="color: #c0392b; font-weight: 600;">Chưa chính xác. Đáp án đúng là: <strong>${answerStr}</strong></span>
      `;
    }

    const nextBtn = this.container.querySelector('#btnQuizNext');
    if (nextBtn) nextBtn.style.display = 'inline-flex';
  }

  nextQuestion() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.answered = false;
      this.renderQuestion();
    } else {
      this.finishQuiz();
    }
  }

  finishQuiz() {
    const total = this.questions.length;
    const percent = Math.round((this.score / total) * 100);

    this.container.innerHTML = `
      <div class="quiz-container" style="text-align: center;">
        <div style="margin-bottom: 16px; color: var(--accent-gold); display: flex; justify-content: center;">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.82 2.67 3.32 3.19L10 19H8v2h8v-2h-2.71l-.71-2.87c1.5-.52 2.69-1.69 3.32-3.19C18.08 12.63 20 10.55 20 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>
        </div>
        <h2 style="font-size: 28px; color: var(--primary-blue); margin-bottom: 8px;">
          ${percent >= 80 ? 'Xuất Sắc! Bạn Đã Vượt Qua!' : 'Luyện Tập Hoàn Thành!'}
        </h2>
        <p style="font-size: 16px; color: var(--text-muted); margin-bottom: 24px;">
          Bạn đã trả lời đúng <strong>${this.score}/${total}</strong> câu hỏi (${percent}%)
        </p>

        <div style="display: flex; justify-content: center; gap: 16px; margin-bottom: 32px; flex-wrap: wrap;">
          <div class="stat-chip streak" style="font-size: 16px; padding: 10px 24px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0950AE" style="vertical-align: -2px; margin-right: 6px;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>Điểm số: ${this.score}/${total} câu (${percent}%)
          </div>
        </div>

        <div style="display: flex; justify-content: center; gap: 14px; flex-wrap: wrap;">
          <button class="btn-3d-primary" id="btnRestartQuiz">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 6px; vertical-align: -2px;"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>Thử thách lại
          </button>
          <button class="btn-3d-secondary" id="btnReconfigQuizCompletion">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 6px; vertical-align: -2px;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Thiết lập bài mới
          </button>
        </div>
      </div>
    `;

    this.container.querySelector('#btnRestartQuiz')?.addEventListener('click', () => {
      this.startQuiz(this.allWords, this.totalQuestions, this.mode);
    });

    this.container.querySelector('#btnReconfigQuizCompletion')?.addEventListener('click', () => {
      if (this.onReconfigure) {
        this.onReconfigure();
      }
    });

    if (this.onQuizComplete) {
      this.onQuizComplete({ score: this.score, total });
    }
  }

  renderQuestion() {
    const q = this.questions[this.currentIndex];
    if (!q) return;

    const isEnToVi = q.type === 'en_to_vi';

    this.container.innerHTML = `
      <div class="quiz-container">
        <!-- Header -->
        <div class="quiz-header">
          <span class="quiz-progress-text">Câu hỏi ${this.currentIndex + 1} / ${this.questions.length}</span>
          <span class="quiz-score-badge">Điểm: ${this.score} đúng</span>
        </div>

        <!-- Question Prompt -->
        <div class="quiz-question-box">
          <div class="quiz-prompt-label">
            ${isEnToVi ? 'Nghĩa tiếng Việt của từ sau là gì?' : 'Từ tiếng Anh nào có nghĩa là:'}
          </div>
          <div class="quiz-target-word">
            ${isEnToVi ? q.target.word : `"${q.target.meaning_vi}"`}
            ${isEnToVi ? `
              <button class="icon-btn" id="btnQuizAudio" style="display: inline-flex; vertical-align: middle; margin-left: 8px;" title="Nghe phát âm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
              </button>
            ` : ''}
          </div>
          <div style="font-size: 14px; color: var(--text-muted);">
            ${q.target.part_of_speech.vi} • Chủ đề: ${q.target.topic}
          </div>
        </div>

        <!-- 4 Options Grid -->
        <div class="quiz-options-grid">
          ${q.options.map((opt, idx) => `
            <button class="quiz-option-btn" data-id="${opt.id}">
              ${String.fromCharCode(65 + idx)}. ${isEnToVi ? opt.meaning_vi : `${opt.word} <span style="font-size: 12px; color: var(--text-muted);">(${opt.part_of_speech.vi})</span>`}
            </button>
          `).join('')}
        </div>

        <!-- Feedback & Next Button -->
        <div class="quiz-feedback-box" id="quizFeedback"></div>

        <div style="text-align: center;">
          <button class="btn-3d-primary" id="btnQuizNext" style="display: none; padding: 12px 48px;">
            ${this.currentIndex === this.questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-left: 6px; vertical-align: -2px;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>
    `;

    // Bind Option clicks
    this.container.querySelectorAll('.quiz-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const optId = parseInt(btn.dataset.id, 10);
        const selectedOpt = q.options.find(o => o.id === optId);
        this.handleAnswer(selectedOpt, btn);
      });
    });

    if (isEnToVi) {
      this.container.querySelector('#btnQuizAudio')?.addEventListener('click', () => {
        audioPlayer.speak(q.target.word);
      });
      audioPlayer.speak(q.target.word);
    }

    this.container.querySelector('#btnQuizNext')?.addEventListener('click', () => {
      this.nextQuestion();
    });
  }
}
