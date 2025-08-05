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
- **SvelteKit**: 풀스택 웹 프레임워크
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **Vite**: 빠른 빌드 도구

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
git clone https://github.com/wheemin1/PageCheck.git
cd PageCheck

# 의존성 설치
npm install

# 환경변수 설정
# .env.local 파일 생성 후 다음 내용 추가:
VITE_KAKAO_APP_KEY=your_kakao_javascript_key_here

# Netlify Functions와 함께 개발 서버 실행
netlify dev
```

### 배포 (Netlify)

#### 1. GitHub 저장소 연결
- Netlify 대시보드에서 "New site from Git" 선택
- GitHub 저장소 연결

#### 2. 빌드 설정
- **Build command**: `npm run build`
- **Publish directory**: `build`

#### 3. 환경변수 설정
Netlify 대시보드 → Site settings → Environment variables에서 설정:
```bash
VITE_KAKAO_APP_KEY=750f37260ad32e3c51064ec6abff6dd2
```

#### 4. 카카오 개발자 플랫폼 설정
1. [Kakao Developers](https://developers.kakao.com) 로그인
2. 내 애플리케이션 → 플랫폼 → Web 플랫폼 등록
3. 사이트 도메인에 배포된 Netlify URL 추가

## 🔧 환경변수

| 변수명 | 설명 | 필수 여부 |
|--------|------|-----------|
| `VITE_KAKAO_APP_KEY` | 카카오톡 공유용 JavaScript 키 | 선택 (없으면 클립보드 복사) |

## 📱 사용법

1. **URL 입력**: 분석할 웹사이트 URL 입력
2. **분석 시작**: "분석 시작" 버튼 클릭
3. **결과 확인**: 종합 점수, Core Web Vitals, 개선 제안 확인
4. **결과 공유**: PNG, PDF 다운로드 또는 카카오톡 공유
