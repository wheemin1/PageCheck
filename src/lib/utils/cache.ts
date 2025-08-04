const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export function getFromCache<T>(key: string): T | null {
  try {
    const item = sessionStorage.getItem(`mocheck-${key}`);
    if (!item) return null;

    const cacheItem: CacheItem<T> = JSON.parse(item);
    const now = Date.now();

    // Check if cache is expired
    if (now - cacheItem.timestamp > CACHE_DURATION) {
      sessionStorage.removeItem(`mocheck-${key}`);
      return null;
    }

    return cacheItem.data;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

export function setToCache<T>(key: string, data: T): void {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now()
    };
    
    sessionStorage.setItem(`mocheck-${key}`, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

export function clearCache(): void {
  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('mocheck-')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Cache clear error:', error);
  }
}

export function getCacheSize(): number {
  try {
    const keys = Object.keys(sessionStorage);
    return keys.filter(key => key.startsWith('mocheck-')).length;
  } catch (error) {
    console.error('Cache size check error:', error);
    return 0;
  }
}
