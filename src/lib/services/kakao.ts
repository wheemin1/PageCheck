declare global {
  interface Window {
    Kakao: any;
  }
}

let kakaoInitialized = false;
let kakaoLoading = false;

// 동적으로 Kakao SDK 로드
async function loadKakaoSDK(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  
  return new Promise((resolve, reject) => {
    if (window.Kakao) {
      resolve();
      return;
    }

    if (kakaoLoading) {
      // 이미 로딩 중이면 잠시 기다린 후 재시도
      setTimeout(() => {
        if (window.Kakao) resolve();
        else reject(new Error('Kakao SDK loading timeout'));
      }, 3000);
      return;
    }

    kakaoLoading = true;
    const script = document.createElement('script');
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
    script.integrity = 'sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4';
    script.crossOrigin = 'anonymous';
    script.async = true; // 비동기 로드
    
    script.onload = () => {
      kakaoLoading = false;
      resolve();
    };
    
    script.onerror = () => {
      kakaoLoading = false;
      reject(new Error('Failed to load Kakao SDK'));
    };
    
    document.head.appendChild(script);
  });
}

export async function initKakao(): Promise<void> {
  console.log('Initializing Kakao SDK...');
  
  if (typeof window === 'undefined') {
    console.log('Window is undefined, skipping Kakao init');
    return;
  }

  if (kakaoInitialized) {
    console.log('Kakao SDK already initialized');
    return;
  }

  try {
    // SDK가 없으면 동적으로 로드
    if (!window.Kakao) {
      console.log('Loading Kakao SDK dynamically...');
      await loadKakaoSDK();
    }

    // Get API key from environment variable
    const APP_KEY = import.meta.env.VITE_KAKAO_APP_KEY;
    
    console.log('Environment check:', {
      isDev: import.meta.env.DEV,
      mode: import.meta.env.MODE,
      hasKey: !!APP_KEY,
      keyPrefix: APP_KEY ? APP_KEY.substring(0, 4) + '...' : 'none'
    });
    
    if (!APP_KEY || APP_KEY === 'your_javascript_key_here') {
      console.log('Kakao SDK available but no valid app key configured');
      console.log('Please set VITE_KAKAO_APP_KEY in environment variables');
      console.log('For local development: add to .env.local file');
      console.log('For production: set in Netlify environment variables');
      return;
    }

    
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(APP_KEY);
      console.log('Kakao SDK initialized with app key');
      kakaoInitialized = true;
    } else {
      console.log('Kakao SDK already initialized');
      kakaoInitialized = true;
    }
  } catch (error) {
    console.error('Kakao initialization error:', error);
    throw error;
  }
}

export async function shareToKakao(url: string, overallScore: number): Promise<void> {
  console.log('Starting Kakao share...', { url, overallScore });
  
  if (typeof window === 'undefined') {
    throw new Error('카카오톡 공유는 브라우저에서만 사용할 수 있습니다.');
  }

  // Kakao SDK가 없으면 초기화 시도
  if (!window.Kakao) {
    console.log('Kakao SDK not found, initializing...');
    try {
      await initKakao();
    } catch (error) {
      console.error('Failed to initialize Kakao SDK:', error);
      throw new Error('카카오톡 SDK를 로드할 수 없습니다.');
    }
  }

  const APP_KEY = import.meta.env.VITE_KAKAO_APP_KEY;  if (!APP_KEY || APP_KEY === 'your_javascript_key_here' || !window.Kakao.isInitialized()) {
    // Fallback: Copy to clipboard if no API key
    const shareUrl = window.location.href;
    const shareText = `🔍 MoCheck 성능 분석 결과\n\n📊 ${url}\n⭐ 종합 점수: ${overallScore}점\n\n자세한 결과 보기: ${shareUrl}`;
    
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        alert('🎉 카카오톡 공유 링크가 클립보드에 복사되었습니다!\n\n💡 실제 카카오톡 공유를 원하시면:\n1. Kakao Developers에서 앱 등록\n2. .env.local 파일에 VITE_KAKAO_APP_KEY 설정\n\n지금은 클립보드에서 붙여넣기하여 공유하세요.');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('카카오톡 공유 링크가 클립보드에 복사되었습니다!\n\n카카오톡에서 붙여넣기 하여 공유하세요.');
      }
      console.log('Kakao share completed (clipboard mode)');
      return;
    } catch (error) {
      console.error('Clipboard copy failed:', error);
      throw new Error('클립보드 복사에 실패했습니다.');
    }
  }

  try {
    // Real Kakao sharing
    await window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '🔍 MoCheck - 성능 분석 결과',
        description: `${url}의 성능 점수: ${overallScore}점\n\n빠르고 정확한 웹사이트 성능 분석 서비스`,
        imageUrl: 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=MoCheck',
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href,
        },
      },
      buttons: [
        {
          title: '결과 자세히 보기',
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
      ],
    });
    
    console.log('Kakao share completed successfully');
  } catch (error) {
    console.error('Kakao share failed:', error);
    throw new Error('카카오톡 공유에 실패했습니다. 다시 시도해보세요.');
  }
}
