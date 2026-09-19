// ==========================================================================
// MOCHI ENGLISH - DICTIONARY PAGE CONTROLLER
// Manages dictionary.html: Search, multi-filters (Level, Stage, Topic, POS), Cards
// ==========================================================================

import { audioPlayer } from './audio.js';
import { storage } from './storage.js';
import { ROADMAP_STAGES } from './roadmap-data.js';

class DictionaryPageApp {
  constructor() {
    this.allWords = [];
    this.filteredWords = [];
    this.currentLevel = 'all';
    this.currentStage = 'all';
    this.currentTopic = 'all';
    this.currentPos = 'all';
    this.searchQuery = '';
    this.currentPage = 1;
    this.pageSize = 24;

    this.init();
  }

  async init() {
    this.updateHeaderStats();
    this.checkUrlParams();
    await this.loadData();
    this.populateFilters();
    this.applyFilters();
    this.bindDOMEvents();
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

  populateFilters() {
    // Stage dropdown
    const stageSelect = document.getElementById('filterStage');
    if (stageSelect) {
      stageSelect.innerHTML = '<option value="all">Tất cả 10 chặng (880 từ vựng)</option>';
      ROADMAP_STAGES.forEach(stg => {
        stageSelect.innerHTML += `<option value="${stg.stage}">Chặng ${stg.stage}: ${stg.badge} (${stg.targetCount} từ)</option>`;
      });
      if (this.currentStage !== 'all') {
        stageSelect.value = this.currentStage;
      }
    }

    // Topic dropdown
    const topicSelect = document.getElementById('filterTopic');
    if (topicSelect) {
      const topics = [...new Set(this.allWords.map(w => w.topic))].filter(Boolean).sort();
      topicSelect.innerHTML = '<option value="all">Tất cả chủ đề</option>';
      topics.forEach(t => {
        topicSelect.innerHTML += `<option value="${t}">${t}</option>`;
      });
    }

    // Part of speech dropdown
    const posSelect = document.getElementById('filterPos');
    if (posSelect) {
      const posList = [
        { val: 'all', label: 'Tất cả từ loại' },
        { val: 'n', label: 'Danh từ (n)' },
        { val: 'v', label: 'Động từ (v)' },
        { val: 'adj', label: 'Tính từ (adj)' },
        { val: 'adv', label: 'Trạng từ (adv)' },
        { val: 'prep', label: 'Giới từ (prep)' },
        { val: 'conj', label: 'Liên từ (conj)' },
        { val: 'pron', label: 'Đại từ (pron)' }
      ];
      posSelect.innerHTML = '';
      posList.forEach(p => {
        posSelect.innerHTML += `<option value="${p.val}">${p.label}</option>`;
      });
    }

    // Level buttons state
    if (this.currentLevel !== 'all') {
      document.querySelectorAll('.level-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.level === this.currentLevel);
      });
    }
  }

  applyFilters() {
    const query = this.searchQuery.toLowerCase().trim();

    this.filteredWords = this.allWords.filter(w => {
      // Level filter
      if (this.currentLevel !== 'all' && w.level !== this.currentLevel) {
        return false;
      }
      // Stage filter
      if (this.currentStage !== 'all') {
        const stageNum = parseInt(this.currentStage, 10);
        const stageObj = ROADMAP_STAGES.find(s => s.stage === stageNum);
        if (stageObj) {
          const [start, end] = stageObj.wordRange;
          if (w.id < start || w.id > end) return false;
        }
      }
      // Topic filter
      if (this.currentTopic !== 'all' && w.topic !== this.currentTopic) {
        return false;
      }
      // POS filter
      if (this.currentPos !== 'all' && !w.part_of_speech.abbr.includes(this.currentPos)) {
        return false;
      }
      // Search query
      if (query) {
        const matchEn = w.word.toLowerCase().includes(query);
        const matchVi = w.meaning_vi.toLowerCase().includes(query);
        const matchTopic = w.topic.toLowerCase().includes(query);
        if (!matchEn && !matchVi && !matchTopic) return false;
      }
      return true;
    });

    this.currentPage = 1;
    this.render();
  }

  render() {
    const countBadge = document.getElementById('resultCountBadge');
    if (countBadge) {
      countBadge.textContent = `${this.filteredWords.length} từ vựng`;
    }

    const grid = document.getElementById('vocabGrid');
    if (!grid) return;

    const total = this.filteredWords.length;
    const endIndex = this.currentPage * this.pageSize;
    const batch = this.filteredWords.slice(0, endIndex);

    if (batch.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
          <div style="margin-bottom: 16px; color: var(--secondary-blue); display: flex; justify-content: center;">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <h3 style="color: var(--secondary-blue); font-size: 20px;">Không tìm thấy từ vựng phù hợp</h3>
          <p style="color: var(--text-muted); margin-top: 8px;">Vui lòng thử từ khóa tìm kiếm hoặc bộ lọc khác.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = batch.map(w => {
      const isFav = storage.isFavorite(w.id);
      const isLearned = storage.isWordLearned(w.id);

      return `
        <div class="vocab-card ${isLearned ? 'learned' : ''}" data-id="${w.id}">
          <div>
            <div class="card-header-row">
              <div class="card-badges">
                <span class="badge-level ${w.level.toLowerCase()}">${w.cambridge_tier}</span>
                <span class="badge-pos">${w.part_of_speech.vi}</span>
              </div>
              <div class="card-actions">
                <button class="icon-btn btn-speak" data-word="${w.word}" title="Nghe phát âm">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
                </button>
                <button class="icon-btn favorite ${isFav ? 'active' : ''}" data-id="${w.id}" title="Lưu từ yêu thích">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
              </div>
            </div>

            <div class="vocab-word-title">${w.word}</div>
            <div class="vocab-vi-meaning">${w.meaning_vi}</div>
            <div class="vocab-en-def">${w.meaning_en}</div>
          </div>

          <div>
            <div class="vocab-example-box">
              <div class="example-en">“${w.example_en}”</div>
              <div class="example-vi"><strong style="color: var(--secondary-blue);">Dịch:</strong> ${w.example_vi}</div>
            </div>
            <div class="card-topic-tag">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 4px;"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>${w.topic}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const loadMoreBtn = document.getElementById('btnLoadMore');
    if (loadMoreBtn) {
      loadMoreBtn.style.display = endIndex < total ? 'inline-flex' : 'none';
    }

    grid.querySelectorAll('.btn-speak').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        audioPlayer.speak(btn.dataset.word);
      });
    });

    grid.querySelectorAll('.icon-btn.favorite').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id, 10);
        const active = storage.toggleFavorite(id);
        btn.classList.toggle('active', active);
        const svg = btn.querySelector('svg');
        if (svg) svg.setAttribute('fill', active ? 'currentColor' : 'none');
      });
    });
  }

  bindDOMEvents() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.applyFilters();
      });
    }

    document.querySelectorAll('.level-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentLevel = btn.dataset.level;
        this.applyFilters();
      });
    });

    document.getElementById('filterStage')?.addEventListener('change', (e) => {
      this.currentStage = e.target.value;
      this.applyFilters();
    });

    document.getElementById('filterTopic')?.addEventListener('change', (e) => {
      this.currentTopic = e.target.value;
      this.applyFilters();
    });

    document.getElementById('filterPos')?.addEventListener('change', (e) => {
      this.currentPos = e.target.value;
      this.applyFilters();
    });

    document.getElementById('btnLoadMore')?.addEventListener('click', () => {
      this.currentPage++;
      this.render();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new DictionaryPageApp();
});
