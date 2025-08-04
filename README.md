# MoCheck - 10초 모바일 친화도 체커

Google PageSpeed Insights API를 활용한 웹사이트 성능 분석 도구입니다. URL을 입력하면 Performance, Accessibility, SEO, Best Practices 점수와 Core Web Vitals를 시각화하고, 결과를 PNG, PDF, 카카오톡으로 즉시 공유할 수 있습니다.

## 🚀 주요 기능

- **빠른 분석**: URL 입력 후 10초 내 결과 제공
- **종합 점수**: 4개 카테고리의 가중평균 계산
- **Core Web Vitals**: LCP, FID, CLS 시각화
- **개선 제안**: 상위 5개 개선 항목 제시
- **상세 감사**: 전체 Lighthouse 결과 테이블
- **다양한 내보내기**: PNG, PDF 다운로드 및 카카오톡 공유
- **다국어 지원**: 한국어, 영어, 일본어
- **캐시 시스템**: 30분간 결과 캐싱으로 속도 향상

## 🛠 기술 스택

### Frontend
- **Svelte**: 반응형 UI 프레임워크
- **Vite**: 빠른 빌드 도구
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **Svelte-i18n**: 다국어 지원

### Backend
- **Netlify Functions**: 서버리스 백엔드
- **Google PageSpeed Insights API v5**: 성능 데이터

### 라이브러리
- **html-to-image**: PNG 내보내기
- **pdf-lib**: PDF 생성
- **Kakao JS SDK**: 카카오톡 공유

## 📦 설치 및 실행

### 로컬 개발 환경

```bash
# 저장소 클론
git clone https://github.com/your-username/mocheck.git
cd mocheck

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local에서 PSI_API_KEY 설정

# 개발 서버 실행
npm run dev
