import { redirect } from '@sveltejs/kit';

export const load = async ({ request }: { request: Request }) => {
  // Accept-Language 헤더에서 언어 감지
  const acceptLanguage = request.headers.get('accept-language') || '';
  
  // 지원하는 언어 목록
  const supportedLangs = ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'fr', 'de'];
  
  // Accept-Language 헤더 파싱
  let detectedLang = 'ko'; // 기본값을 한국어로 변경 (한국 서비스이므로)
  
  // Accept-Language 헤더에서 언어 추출
  const languages = acceptLanguage
    .split(',')
    .map((lang: string) => {
      const [code, q = '1'] = lang.trim().split(';q=');
      return { code: code.slice(0, 2).toLowerCase(), quality: parseFloat(q) };
    })
    .sort((a: any, b: any) => b.quality - a.quality);
  
  // 지원하는 언어 중에서 가장 우선순위가 높은 언어 선택
  for (const lang of languages) {
    if (supportedLangs.includes(lang.code)) {
      detectedLang = lang.code;
      break;
    }
  }
  
  console.log('Accept-Language:', acceptLanguage);
  console.log('Detected language:', detectedLang);
  
  throw redirect(302, `/${detectedLang}/`);
};
