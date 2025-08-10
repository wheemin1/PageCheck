import { writable } from 'svelte/store';
import type { PageSpeedResults } from '../types/pagespeed';

interface AppState {
  loading: boolean;
  error: string | null;
  results: PageSpeedResults | null;
  currentUrl: string;
  currentStrategy: 'mobile' | 'desktop';
  isFromCache: boolean;
}

const initialState: AppState = {
  loading: false,
  error: null,
  results: null,
  currentUrl: '',
  currentStrategy: 'mobile',
  isFromCache: false
};

function createAppStore() {
  const { subscribe, set, update } = writable<AppState>(initialState);

  return {
    subscribe,
    setLoading: (loading: boolean) => update(state => ({ ...state, loading })),
    setError: (error: string | null) => update(state => ({ ...state, error })),
    setResults: (results: PageSpeedResults | null, isFromCache: boolean = false) => 
      update(state => ({ ...state, results, isFromCache })),
    setCurrentUrl: (url: string) => update(state => ({ ...state, currentUrl: url })),
    setCurrentStrategy: (strategy: 'mobile' | 'desktop') => update(state => ({ ...state, currentStrategy: strategy })),
    reset: () => set(initialState)
  };
}

export const appStore = createAppStore();
