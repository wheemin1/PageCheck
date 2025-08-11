import { redirect } from '@sveltejs/kit';
import { currentLang } from '$lib/stores/i18n';
import { browser } from '$app/environment';

export const load = async ({ params }: { params: { lang: string } }) => {
  const { lang } = params;
  
  // 지원하는 언어 목록
  const supportedLangs = ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'fr', 'de'];
  
  // 지원하지 않는 언어인 경우 기본 언어로 리다이렉트
  if (!supportedLangs.includes(lang)) {
    throw redirect(302, '/ko/');
  }
  
  // 브라우저 환경에서만 언어 설정
  if (browser) {
    currentLang.set(lang);
  }
  
  return {
    lang
  };
};
