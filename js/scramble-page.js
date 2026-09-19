// ==========================================================================
// MYENGLISHLIB - SCRAMBLE PAGE CONTROLLER
// Handles 3 Pre-Exercise Configs: Lộ trình bài học, Số lượng câu hỏi, Dạng luyện
// ==========================================================================

import { storage } from './storage.js';
import { ROADMAP_STAGES } from './roadmap-data.js';
import { ScrambleEngine } from './scramble.js';

class ScramblePageApp {
  constructor() {
    this.allWords = [];
    this.filteredWords = [];
    this.currentStage = 'all'; // Lộ trình bài học
    this.currentCount = 10;    // Số lượng câu hỏi
    this.currentMode = 'mixed'; // Dạng luyện: 'mixed', 'vi_to_en', 'en_to_vi'
    this.engine = null;

    this.init();
  }

  async init() {
    this.updateHeaderStats();
    this.checkUrlParams();
    await this.loadData();
    this.populateSetupControls();
    this.bindSetupEvents();
    this.updateLivePreview();
  }

  updateHeaderStats() {
    const streakEl = document.getElementById('statStreak');
    const learnedEl = document.getElementById('statLearnedCount');
    if (streakEl) streakEl.textContent = storage.getStreak();
    if (learnedEl) learnedEl.textContent = storage.getLearnedWords().length;
  }

  checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const stageParam = params.get('stage');
    if (stageParam) {
      this.currentStage = stageParam;
    }
    const countParam = params.get('count');
    if (countParam) {
      this.currentCount = parseInt(countParam, 10);
    }
    const modeParam = params.get('mode');
    if (modeParam && ['vi_to_en', 'en_to_vi', 'mixed'].includes(modeParam)) {
      this.currentMode = modeParam;
    }
  }

  async loadData() {
    try {
      const response = await fetch('./vocabulary_cambridge_a1_a2.json');
      const data = await response.json();
      this.allWords = data.words || [];
    } catch (err) {
      console.error('Failed to load vocabulary data:', err);
    }
  }

  populateSetupControls() {
    // 1. Lộ trình bài học (Stages)
    const stageSelect = document.getElementById('setupScrambleStage');
    if (stageSelect) {
      stageSelect.innerHTML = '<option value="all">Tất cả 10 chặng (880 câu ví dụ)</option>';
      ROADMAP_STAGES.forEach(stg => {
        stageSelect.innerHTML += `
          <option value="${stg.stage}">Chặng ${stg.stage}: ${stg.badge} (${stg.targetCount} câu)</option>
        `;
      });
      stageSelect.value = this.currentStage;
    }

    // 2. Số lượng câu hỏi (10, 20, 30, all)
    document.querySelectorAll('#setupScrambleCountGroup .chip-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.count === String(this.currentCount));
    });

    // 3. Dạng luyện
    document.querySelectorAll('#setupScrambleModeGroup .chip-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === this.currentMode);
    });
  }

  bindSetupEvents() {
    // 1. Lộ trình bài học change
    const stageSelect = document.getElementById('setupScrambleStage');
    stageSelect?.addEventListener('change', (e) => {
      this.currentStage = e.target.value;
      this.updateLivePreview();
    });

    // 2. Số lượng câu hỏi chips (10, 20, 30, all)
    const countBtns = document.querySelectorAll('#setupScrambleCountGroup .chip-btn');
    countBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        countBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCount = btn.dataset.count === 'all' ? 'all' : parseInt(btn.dataset.count, 10);
        this.updateLivePreview();
      });
    });

    // 3. Dạng luyện chips
    const modeBtns = document.querySelectorAll('#setupScrambleModeGroup .chip-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentMode = btn.dataset.mode;
        this.updateLivePreview();
      });
    });

    // Nút Bắt đầu luyện tập
    document.getElementById('btnStartScramble')?.addEventListener('click', () => {
      this.startPracticeSession();
    });

    // Nút Đổi thiết lập bài
    document.getElementById('btnReconfigScramble')?.addEventListener('click', () => {
      this.showSetupView();
    });
  }

  getMatchingWords() {
    let list = this.allWords.filter(w => w.example_en && w.example_vi);

    // Lọc theo Lộ trình bài học (Stage)
    if (this.currentStage !== 'all') {
      const stageNum = parseInt(this.currentStage, 10);
      const stageObj = ROADMAP_STAGES.find(s => s.stage === stageNum);
      if (stageObj) {
        const [start, end] = stageObj.wordRange;
        list = list.filter(w => w.id >= start && w.id <= end);
      }
    }

    return list;
  }

  updateLivePreview() {
    const list = this.getMatchingWords();
    const badge = document.getElementById('setupScrambleSummaryBadge');
    if (badge) {
      const stageLabel = this.currentStage === 'all' ? 'Toàn bộ 10 chặng' : `Chặng ${this.currentStage}`;
      const countLabel = this.currentCount === 'all' ? `toàn bộ ${list.length}` : `${Math.min(parseInt(this.currentCount, 10), list.length || 1)}`;
      badge.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>${stageLabel} • Có ${list.length} câu ví dụ khả dụng • Sẽ tạo ${countLabel} câu ghép</span>
      `;
    }
  }

  startPracticeSession() {
    const matchingWords = this.getMatchingWords();
    if (matchingWords.length === 0) {
      alert('Không tìm thấy câu ví dụ nào trong chặng này. Vui lòng chọn lại chặng học!');
      return;
    }

    const countNum = this.currentCount === 'all' ? matchingWords.length : Math.min(parseInt(this.currentCount, 10), matchingWords.length);

    const setupView = document.getElementById('scrambleSetupView');
    const exerciseView = document.getElementById('scrambleExerciseView');
    const scopeBadge = document.getElementById('exerciseScrambleScopeBadge');

    if (setupView) setupView.style.display = 'none';
    if (exerciseView) exerciseView.style.display = 'block';

    if (scopeBadge) {
      const stageLabel = this.currentStage === 'all' ? 'Toàn bộ 10 chặng' : `Chặng ${this.currentStage}`;
      const modeText = this.currentMode === 'vi_to_en' ? 'Việt ➔ Anh' : (this.currentMode === 'en_to_vi' ? 'Anh ➔ Việt' : 'Xáo trộn');
      const countText = this.currentCount === 'all' ? `Tất cả ${countNum} câu` : `${countNum} câu`;
      scopeBadge.textContent = `${stageLabel} • ${modeText} • ${countText}`;
    }

    const container = document.getElementById('scrambleContainer');
    if (!container) return;

    this.engine = new ScrambleEngine(container, {
      onComplete: () => {
        this.updateHeaderStats();
      }
    });

    this.engine.onReconfigure = () => {
      this.showSetupView();
    };

    this.engine.setPool(matchingWords, this.currentMode, countNum);
  }

  showSetupView() {
    const setupView = document.getElementById('scrambleSetupView');
    const exerciseView = document.getElementById('scrambleExerciseView');

    if (setupView) setupView.style.display = 'block';
    if (exerciseView) exerciseView.style.display = 'none';

    this.updateLivePreview();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ScramblePageApp();
});
