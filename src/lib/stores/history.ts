import { writable, derived } from 'svelte/store';
import type { PageSpeedResults } from '../types/pagespeed';

export interface HistoryEntry {
  id: string;
  url: string;
  timestamp: number;
  scores: {
    performance: number;
    accessibility: number;
    seo: number;
    bestPractices: number;
  };
  overallScore: number;
  strategy: 'mobile' | 'desktop';
  isFavorite?: boolean;
}

export interface FavoriteEntry {
  url: string;
  name: string;
  addedAt: number;
}

const HISTORY_KEY = 'mocheck_history';
const FAVORITES_KEY = 'mocheck_favorites';
const MAX_HISTORY_ENTRIES = 100;

// Load from localStorage
function loadHistory(): HistoryEntry[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
}

function loadFavorites(): FavoriteEntry[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load favorites:', error);
    return [];
  }
}

// Save to localStorage
function saveHistory(history: HistoryEntry[]) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save history:', error);
  }
}

function saveFavorites(favorites: FavoriteEntry[]) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Failed to save favorites:', error);
  }
}

// Create stores
function createHistoryStore() {
  const { subscribe, set, update } = writable<HistoryEntry[]>(loadHistory());

  return {
    subscribe,
    addEntry: (results: PageSpeedResults) => {
      const newEntry: HistoryEntry = {
        id: `${results.url}_${results.strategy}_${Date.now()}`,
        url: results.url,
        timestamp: results.timestamp.getTime(),
        scores: results.scores,
        overallScore: results.overallScore,
        strategy: results.strategy,
        isFavorite: false
      };

      update(history => {
        // Remove duplicates (same URL and strategy)
        const filtered = history.filter(entry => 
          !(entry.url === results.url && entry.strategy === results.strategy)
        );
        
        // Add new entry at the beginning
        const newHistory = [newEntry, ...filtered];
        
        // Keep only the latest MAX_HISTORY_ENTRIES
        const trimmed = newHistory.slice(0, MAX_HISTORY_ENTRIES);
        
        saveHistory(trimmed);
        return trimmed;
      });
    },
    
    removeEntry: (entryId: string) => {
      update(history => {
        const filtered = history.filter(entry => entry.id !== entryId);
        saveHistory(filtered);
        return filtered;
      });
    },
    
    toggleFavorite: (entryId: string) => {
      update(history => {
        const updated = history.map(entry => 
          entry.id === entryId 
            ? { ...entry, isFavorite: !entry.isFavorite }
            : entry
        );
        saveHistory(updated);
        return updated;
      });
    },
    
    clearHistory: () => {
      set([]);
      saveHistory([]);
    },
    
    getEntriesByUrl: (url: string) => {
      const history = loadHistory();
      return history.filter(entry => entry.url === url);
    }
  };
}

function createFavoritesStore() {
  const { subscribe, set, update } = writable<FavoriteEntry[]>(loadFavorites());

  return {
    subscribe,
    addFavorite: (url: string, name?: string) => {
      update(favorites => {
        // Check if already exists
        if (favorites.some(fav => fav.url === url)) {
          return favorites;
        }
        
        const newFavorite: FavoriteEntry = {
          url,
          name: name || new URL(url).hostname,
          addedAt: Date.now()
        };
        
        const updated = [newFavorite, ...favorites];
        saveFavorites(updated);
        return updated;
      });
    },
    
    removeFavorite: (url: string) => {
      update(favorites => {
        const filtered = favorites.filter(fav => fav.url !== url);
        saveFavorites(filtered);
        return filtered;
      });
    },
    
    updateFavoriteName: (url: string, name: string) => {
      update(favorites => {
        const updated = favorites.map(fav => 
          fav.url === url ? { ...fav, name } : fav
        );
        saveFavorites(updated);
        return updated;
      });
    },
    
    isFavorite: (url: string): boolean => {
      const favorites = loadFavorites();
      return favorites.some(fav => fav.url === url);
    }
  };
}

// Create store instances
export const historyStore = createHistoryStore();
export const favoritesStore = createFavoritesStore();

// Derived stores for analytics
export const historyStats = derived(historyStore, (history) => {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;
  const oneMonth = 30 * oneDay;

  return {
    total: history.length,
    today: history.filter(entry => now - entry.timestamp < oneDay).length,
    thisWeek: history.filter(entry => now - entry.timestamp < oneWeek).length,
    thisMonth: history.filter(entry => now - entry.timestamp < oneMonth).length,
    averageScore: history.length > 0 
      ? Math.round(history.reduce((sum, entry) => sum + entry.overallScore, 0) / history.length)
      : 0
  };
});

// Get history grouped by date for charts
export const getHistoryByDate = derived(historyStore, (history) => {
  const grouped = history.reduce((acc, entry) => {
    const date = new Date(entry.timestamp).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, HistoryEntry[]>);

  return Object.entries(grouped)
    .map(([date, entries]) => ({
      date,
      count: entries.length,
      averageScore: Math.round(entries.reduce((sum, entry) => sum + entry.overallScore, 0) / entries.length),
      entries
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});
