// ==========================================================================
// MOCHI ENGLISH - FLASHCARD PAGE CONTROLLER
// Manages flashcard.html: Stage selection, 3D flipping, Audio, Progress
// ==========================================================================

import { audioPlayer } from './audio.js';
import { storage } from './storage.js';
import { FlashcardController } from './flashcard.js';
import { ROADMAP_STAGES } from './roadmap-data.js';

class FlashcardPageApp {
  constructor() {
    this.allWords = [];
    this.currentWords = [];
    this.currentLevel = 'all';
    this.currentStage = '1'; // default Stage 1
    this.flashcardController = null;

    this.init();
  }

  async init() {
    this.updateHeaderStats();
    this.checkUrlParams();
    await this.loadData();
    this.populateStageSelector();
    this.bindLevelButtons();
    this.initFlashcard();
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
    const levelParam = params.get('level');
    if (levelParam) {
      this.currentLevel = levelParam.toUpperCase();
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

  bindLevelButtons() {
    const levelBtns = document.querySelectorAll('.controls-panel .level-btn');
    levelBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.level === this.currentLevel);

      btn.addEventListener('click', () => {
        levelBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentLevel = btn.dataset.level;
        this.filterWordsAndReload();
      });
    });
  }

  populateStageSelector() {
    const select = document.getElementById('selectFlashcardStage');
    if (!select) return;

    select.innerHTML = '<option value="all">Tất cả 10 chặng (880 từ vựng)</option>';
    ROADMAP_STAGES.forEach(stg => {
      select.innerHTML += `
        <option value="${stg.stage}">Chặng ${stg.stage}: ${stg.badge} (${stg.targetCount} từ)</option>
      `;
    });

    select.value = this.currentStage;
    select.addEventListener('change', (e) => {
      this.currentStage = e.target.value;
      this.filterWordsAndReload();
    });
  }

  filterWordsAndReload() {
    let list = [...this.allWords];

    // Filter by Level
    if (this.currentLevel !== 'all') {
      list = list.filter(w => w.level === this.currentLevel);
    }

    // Filter by Stage
    if (this.currentStage !== 'all') {
      const stageNum = parseInt(this.currentStage, 10);
      const stageObj = ROADMAP_STAGES.find(s => s.stage === stageNum);
      if (stageObj) {
        const [start, end] = stageObj.wordRange;
        list = list.filter(w => w.id >= start && w.id <= end);
      }
    }

    this.currentWords = list;

    // Update section title badge
    const badge = document.getElementById('flashcardStageBadge');
    if (badge) {
      badge.textContent = `${this.currentWords.length} từ vựng`;
    }

    if (this.flashcardController) {
      this.flashcardController.setWords(this.currentWords);
    }
  }

  initFlashcard() {
    const container = document.getElementById('flashcardContainer');
    if (!container) return;

    this.flashcardController = new FlashcardController(container, (info) => {
      this.updateHeaderStats();
    });

    this.filterWordsAndReload();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new FlashcardPageApp();
});
