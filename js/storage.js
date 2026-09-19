// ==========================================================================
// MYENGLISHLIB - LOCAL STORAGE MANAGER
// Handles learning progress, favorites, streaks, and daily goals
// ==========================================================================

const STORAGE_KEYS = {
  LEARNED: 'myenglishlib_learned_words',
  FAVORITES: 'myenglishlib_favorite_words',
  STREAK: 'myenglishlib_daily_streak',
  LAST_DATE: 'myenglishlib_last_active_date',
  DAILY_GOAL: 'myenglishlib_daily_goal',
  TODAY_LEARNED: 'myenglishlib_today_learned_ids'
};

export class StorageManager {
  constructor() {
    this.migrateLegacyData();
    this.checkStreak();
  }

  migrateLegacyData() {
    try {
      // Migrate from old keys if present
      if (!localStorage.getItem(STORAGE_KEYS.LEARNED) && localStorage.getItem('mochi_learned_words')) {
        localStorage.setItem(STORAGE_KEYS.LEARNED, localStorage.getItem('mochi_learned_words'));
      }
      if (!localStorage.getItem(STORAGE_KEYS.FAVORITES) && localStorage.getItem('mochi_favorite_words')) {
        localStorage.setItem(STORAGE_KEYS.FAVORITES, localStorage.getItem('mochi_favorite_words'));
      }
      if (!localStorage.getItem(STORAGE_KEYS.STREAK) && localStorage.getItem('mochi_daily_streak')) {
        localStorage.setItem(STORAGE_KEYS.STREAK, localStorage.getItem('mochi_daily_streak'));
      }
      if (!localStorage.getItem(STORAGE_KEYS.DAILY_GOAL) && localStorage.getItem('mochi_daily_goal')) {
        localStorage.setItem(STORAGE_KEYS.DAILY_GOAL, localStorage.getItem('mochi_daily_goal'));
      }
    } catch {
      // ignore
    }
  }

  getLearnedWords() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEARNED);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  isWordLearned(id) {
    const list = this.getLearnedWords();
    return list.includes(id);
  }

  toggleLearned(id) {
    let list = this.getLearnedWords();
    if (list.includes(id)) {
      list = list.filter(item => item !== id);
    } else {
      list.push(id);
      this.recordTodayLearned(id);
    }
    localStorage.setItem(STORAGE_KEYS.LEARNED, JSON.stringify(list));
    return { isLearned: list.includes(id), totalLearned: list.length };
  }

  recordTodayLearned(id) {
    try {
      const today = new Date().toDateString();
      const lastDate = localStorage.getItem(STORAGE_KEYS.LAST_DATE);
      let list = [];
      if (lastDate === today) {
        const stored = localStorage.getItem(STORAGE_KEYS.TODAY_LEARNED);
        list = stored ? JSON.parse(stored) : [];
      }
      if (!list.includes(id)) {
        list.push(id);
      }
      localStorage.setItem(STORAGE_KEYS.TODAY_LEARNED, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  getTodayLearnedCount() {
    try {
      const today = new Date().toDateString();
      const lastDate = localStorage.getItem(STORAGE_KEYS.LAST_DATE);
      if (lastDate !== today) return 0;
      const stored = localStorage.getItem(STORAGE_KEYS.TODAY_LEARNED);
      const list = stored ? JSON.parse(stored) : [];
      return list.length;
    } catch {
      return 0;
    }
  }

  getDailyGoal() {
    return parseInt(localStorage.getItem(STORAGE_KEYS.DAILY_GOAL) || '10', 10);
  }

  setDailyGoal(amount) {
    localStorage.setItem(STORAGE_KEYS.DAILY_GOAL, amount.toString());
    return amount;
  }

  getFavorites() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  isFavorite(id) {
    return this.getFavorites().includes(id);
  }

  toggleFavorite(id) {
    let list = this.getFavorites();
    if (list.includes(id)) {
      list = list.filter(item => item !== id);
    } else {
      list.push(id);
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(list));
    return list.includes(id);
  }

  getXP() {
    return 0;
  }

  addXP() {
    return 0;
  }

  getStreak() {
    return parseInt(localStorage.getItem(STORAGE_KEYS.STREAK) || '1', 10);
  }

  checkStreak() {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem(STORAGE_KEYS.LAST_DATE);

    if (!lastDate) {
      localStorage.setItem(STORAGE_KEYS.LAST_DATE, today);
      localStorage.setItem(STORAGE_KEYS.STREAK, '1');
      return 1;
    }

    if (lastDate === today) {
      return this.getStreak();
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (yesterday.toDateString() === lastDate) {
      const newStreak = this.getStreak() + 1;
      localStorage.setItem(STORAGE_KEYS.STREAK, newStreak.toString());
      localStorage.setItem(STORAGE_KEYS.LAST_DATE, today);
      return newStreak;
    } else {
      localStorage.setItem(STORAGE_KEYS.STREAK, '1');
      localStorage.setItem(STORAGE_KEYS.LAST_DATE, today);
      return 1;
    }
  }
}

export const storage = new StorageManager();
