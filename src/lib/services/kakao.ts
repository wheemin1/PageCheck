declare global {
  interface Window {
    Kakao: any;
  }
}

export function initKakao(): void {
  if (typeof window !== 'undefined' && window.Kakao) {
    // Use a test key for development - replace with actual key in production
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init('YOUR_KAKAO_APP_KEY'); // Replace with actual Kakao app key
    }
  }
}

export async function shareToKakao(url: string, overallScore: number): Promise<void> {
  if (typeof window === 'undefined' || !window.Kakao) {
    throw new Error('Kakao SDK not loaded');
  }

  try {
    await window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: 'MoCheck 분석 결과',
        description: `${url}의 모바일 친화도 점수: ${overallScore}점`,
        imageUrl: 'https://mocheck.netlify.app/og-image.png',
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href,
        },
      },
      buttons: [
        {
          title: '결과 보기',
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
      ],
    });
  } catch (error) {
    console.error('Kakao share failed:', error);
    throw new Error('카카오톡 공유에 실패했습니다.');
  }
}
