import { redirect } from '@sveltejs/kit';

export const load = async ({ request }: { request: Request }) => {
  try {
    // Accept-Language 헤더에서 언어 감지
    const acceptLanguage = request.headers.get('accept-language') || '';
    
    // 지원하는 언어 목록
    const supportedLangs = ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'fr', 'de'];
    
    // 기본값을 한국어로 설정 (한국 서비스이므로)
    let detectedLang = 'ko';
    
    // Accept-Language 헤더 간단 파싱
    if (acceptLanguage) {
      // 간단한 언어 코드 추출 (복잡한 파싱 대신 안전한 방식)
      const langCodes = acceptLanguage
        .toLowerCase()
        .split(',')
        .map(lang => lang.trim().split(';')[0].split('-')[0])
        .filter(code => supportedLangs.includes(code));
      
      if (langCodes.length > 0) {
        detectedLang = langCodes[0];
      }
    }
    
    console.log('Accept-Language:', acceptLanguage);
    console.log('Detected language:', detectedLang);
    
    throw redirect(302, `/${detectedLang}/`);
  } catch (error) {
    // 리다이렉트 이외의 오류가 발생하면 기본값으로
    if (error && typeof error === 'object' && 'status' in error) {
      throw error; // 리다이렉트는 그대로 throw
    }
    
    console.error('Language detection error:', error);
    throw redirect(302, '/ko/'); // 오류 발생시 한국어로 기본 리다이렉트
  }
};