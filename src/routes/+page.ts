import { redirect } from '@sveltejs/kit';
import { browser } from '$app/environment';

export const load = async () => {
  // 브라우저 언어 감지
  let defaultLang = 'en'; // 기본값은 영어
  
  if (browser) {
    const browserLang = navigator.language.slice(0, 2);
    const supportedLangs = ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'fr', 'de'];
    
    if (supportedLangs.includes(browserLang)) {
      defaultLang = browserLang;
    }
  }
  
  throw redirect(302, `/${defaultLang}/`);
};
