// ==========================================================================
// MOCHI ENGLISH - ROADMAP PAGE CONTROLLER
// Manages index.html: Daily goals, 10-stage milestone trail (Clean SVG, No Emojis)
// ==========================================================================

import { ROADMAP_STAGES } from './roadmap-data.js';
import { storage } from './storage.js';

class RoadmapApp {
  constructor() {
    this.allWords = [];
    this.init();
  }

  async init() {
    this.updateHeaderStats();
    await this.loadData();
    this.renderDailyGoalCard();
    this.renderRoadmapStages();
    this.renderOverallSummary();
  }

  updateHeaderStats() {
    const streakEl = document.getElementById('statStreak');
    const learnedEl = document.getElementById('statLearnedCount');

    if (streakEl) streakEl.textContent = storage.getStreak();
    if (learnedEl) learnedEl.textContent = storage.getLearnedWords().length;
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

  renderDailyGoalCard() {
    const container = document.getElementById('dailyGoalSection');
    if (!container) return;

    const currentGoal = storage.getDailyGoal();
    const todayCount = storage.getTodayLearnedCount();
    const percent = Math.min(100, Math.round((todayCount / currentGoal) * 100));

    container.innerHTML = `
      <div class="goal-card-section">
        <div class="goal-card-header">
          <div class="goal-title-group">
            <h3>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--primary-blue);"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
              Thiết Lập Mục Tiêu Học Hàng Ngày
            </h3>
            <p>Học đều đặn mỗi ngày để duy trì chuỗi Streak và củng cố trí nhớ dài hạn.</p>
          </div>
          <div class="daily-progress-meter">
            <span>Tiến độ hôm nay:</span>
            <strong>${todayCount} / ${currentGoal} từ (${percent}%)</strong>
          </div>
        </div>

        <div class="goal-options-grid">
          <!-- Option 1: 5 words/day -->
          <div class="goal-option-box ${currentGoal === 5 ? 'active' : ''}" data-goal="5">
            <span class="goal-option-badge badge-easy">Khởi Động</span>
            <div class="goal-option-number">5 từ / ngày</div>
            <div class="goal-option-time">Thời lượng: ~10 phút mỗi ngày</div>
          </div>

          <!-- Option 2: 10 words/day -->
          <div class="goal-option-box ${currentGoal === 10 ? 'active' : ''}" data-goal="10">
            <span class="goal-option-badge badge-rec">Khuyên Dùng</span>
            <div class="goal-option-number">10 từ / ngày</div>
            <div class="goal-option-time">Thời lượng: ~20 phút mỗi ngày</div>
          </div>

          <!-- Option 3: 20 words/day -->
          <div class="goal-option-box ${currentGoal === 20 ? 'active' : ''}" data-goal="20">
            <span class="goal-option-badge badge-hard">Thách Thức</span>
            <div class="goal-option-number">20 từ / ngày</div>
            <div class="goal-option-time">Thời lượng: ~35 phút mỗi ngày</div>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('.goal-option-box').forEach(box => {
      box.addEventListener('click', () => {
        const goalVal = parseInt(box.dataset.goal, 10);
        storage.setDailyGoal(goalVal);
        this.renderDailyGoalCard();
      });
    });
  }

  renderRoadmapStages() {
    const container = document.getElementById('roadmapTrailContainer');
    if (!container) return;

    const learnedList = storage.getLearnedWords();

    container.innerHTML = ROADMAP_STAGES.map((stg) => {
      const [startId, endId] = stg.wordRange;
      const stageTotal = endId - startId + 1;
      const stageLearned = learnedList.filter(id => id >= startId && id <= endId).length;
      const percent = Math.round((stageLearned / stageTotal) * 100);
      const isCompleted = stageLearned >= stageTotal;

      return `
        <div class="roadmap-stage-card ${isCompleted ? 'completed' : ''}" id="stage-${stg.stage}">
          <div class="roadmap-stage-node">
            <div class="node-icon" style="color: ${stg.color}">${stg.iconSvg}</div>
            <div class="node-number">Chặng ${stg.stage}</div>
          </div>

          <div class="roadmap-stage-content">
            <div class="stage-header-row">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="stage-tag ${stg.level.toLowerCase()}">${stg.tier}</span>
                <span class="stage-badge-name">${stg.badge}</span>
              </div>
              <div style="font-size: 13px; font-weight: 700; color: ${isCompleted ? 'var(--accent-green)' : 'var(--secondary-blue)'};">
                ${isCompleted ? '✓ ĐÃ HOÀN THÀNH' : `${stageLearned}/${stageTotal} từ (${percent}%)`}
              </div>
            </div>

            <h3 class="stage-title">${stg.title}</h3>
            <p class="stage-desc">${stg.desc}</p>

            <div class="stage-progress-text">
              <span>Tiến độ chặng:</span>
              <span>${percent}%</span>
            </div>
            <div class="stage-progress-bar-wrap">
              <div class="stage-progress-bar-fill" style="width: ${percent}%; background: ${isCompleted ? 'var(--accent-green)' : ''}"></div>
            </div>

            <div class="stage-actions-row">
              <a href="flashcard.html?stage=${stg.stage}" class="btn-3d-primary" style="font-size: 14.5px; padding: 10px 22px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Học Thẻ 3D Chặng ${stg.stage}
              </a>

              <a href="quiz.html?stage=${stg.stage}" class="btn-3d-secondary" style="font-size: 14.5px; padding: 10px 20px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                Trắc Nghiệm
              </a>

              <a href="dictionary.html?stage=${stg.stage}" class="btn-3d-secondary" style="font-size: 14.5px; padding: 10px 18px; color: var(--text-muted);">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                Xem Từ Vựng
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderOverallSummary() {
    const summaryContainer = document.getElementById('overallSummaryCard');
    if (!summaryContainer) return;

    const learnedTotal = storage.getLearnedWords().length;
    const grandTotal = 880;
    const overallPercent = Math.round((learnedTotal / grandTotal) * 100);

    summaryContainer.innerHTML = `
      <div style="background: var(--white); border-radius: var(--radius-round); padding: 30px 32px; border: 2px solid #d5e6ff; box-shadow: var(--shadow-card); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 24px; margin-bottom: 40px;">
        <div style="max-width: 600px;">
          <h3 style="font-size: 22px; color: var(--primary-blue); margin-bottom: 8px; display: flex; align-items: center; gap: 10px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            Tổng Quan Tiến Trình Chinh Phục
          </h3>
          <p style="color: var(--text-body); font-size: 15px; line-height: 1.5;">
            Bạn đã làm chủ <strong>${learnedTotal}</strong> trên tổng số <strong>${grandTotal}</strong> từ vựng Cambridge. Tiếp tục duy trì phong độ để hoàn thành lộ trình!
          </p>
        </div>

        <div style="display: flex; align-items: center; gap: 24px;">
          <div style="text-align: center;">
            <div style="font-size: 34px; font-weight: 700; color: var(--primary-blue); line-height: 1;">${overallPercent}%</div>
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); margin-top: 4px;">HOÀN THÀNH</div>
          </div>

          <div style="width: 160px; height: 14px; background: #e2edff; border-radius: var(--radius-full); overflow: hidden;">
            <div style="width: ${overallPercent}%; height: 100%; background: linear-gradient(90deg, var(--primary-blue), var(--accent-green)); border-radius: var(--radius-full);"></div>
          </div>
        </div>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new RoadmapApp();
});
