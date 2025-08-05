declare global {
  interface Window {
    Kakao: any;
  }
}

export function initKakao(): void {
  console.log('Initializing Kakao SDK...');
  
  if (typeof window === 'undefined') {
    console.log('Window is undefined, skipping Kakao init');
    return;
  }

  if (!window.Kakao) {
    console.error('Kakao SDK not loaded');
    return;
  }

  try {
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
    } else {
      console.log('Kakao SDK already initialized');
    }
  } catch (error) {
    console.error('Kakao initialization error:', error);
  }
}

export async function shareToKakao(url: string, overallScore: number): Promise<void> {
  console.log('Starting Kakao share...', { url, overallScore });
  
  if (typeof window === 'undefined') {
    throw new Error('카카오톡 공유는 브라우저에서만 사용할 수 있습니다.');
  }

  if (!window.Kakao) {
    throw new Error('카카오톡 SDK가 로드되지 않았습니다. 페이지를 새로고침 해보세요.');
  }

  const APP_KEY = import.meta.env.VITE_KAKAO_APP_KEY;
  
  if (!APP_KEY || APP_KEY === 'your_javascript_key_here' || !window.Kakao.isInitialized()) {
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
