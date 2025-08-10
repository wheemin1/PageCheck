import { writable, derived } from 'svelte/store';

interface Translations {
  [key: string]: any;
}

const translations = writable<Record<string, Translations>>({});
const currentLanguage = writable<string>('ko');

export const currentLang = currentLanguage;

export const t = derived(
  [translations, currentLanguage],
  ([trans, lang]) => {
    return (key: string, params?: Record<string, string>): string => {
      const keys = key.split('.');
      let value = trans[lang];
      
      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = value[k];
        } else {
          return key; // fallback to key if not found
        }
      }
      
      if (typeof value !== 'string') {
        return key;
      }
      
      // Simple parameter substitution
      if (params) {
        return Object.entries(params).reduce((acc: string, [param, val]: [string, string]) => {
          return acc.replace(new RegExp(`{${param}}`, 'g'), val);
        }, value);
      }
      
      return value;
    };
  }
);

export async function initI18n() {
  const langs = ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'fr', 'de'];
  const loadedTranslations: Record<string, Translations> = {};
  
  for (const lang of langs) {
    try {
      const module = await import(`../i18n/${lang}.json`);
      loadedTranslations[lang] = module.default;
    } catch (error) {
      console.error(`Failed to load translation for ${lang}:`, error);
    }
  }
  
  translations.set(loadedTranslations);
  
  // Set language based on browser preference
  const browserLang = navigator.language.slice(0, 2);
  if (langs.includes(browserLang)) {
    currentLanguage.set(browserLang);
  }
}

currentLanguage.subscribe(lang => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mocheck-lang', lang);
  }
});

// Load saved language preference
if (typeof window !== 'undefined') {
  const savedLang = localStorage.getItem('mocheck-lang');
  if (savedLang) {
    currentLanguage.set(savedLang);
  }
}
