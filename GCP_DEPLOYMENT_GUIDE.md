# Google Cloud Functions 배포 가이드

## 1. 준비 사항
- Google Cloud 프로젝트: mocheck-468907
- Cloud Functions API 활성화 완료
- PageSpeed Insights API 키 필요

## 2. 로컬 테스트 (선택사항)
```bash
# Functions Framework 설치
npm install -g @google-cloud/functions-framework

# 로컬에서 함수 실행
functions-framework --target=pagespeedAnalysis --source=gcp-function.js
```

## 3. Google Cloud Console에서 배포

### 3-1. Cloud Functions 콘솔 접속
https://console.cloud.google.com/functions?project=mocheck-468907

### 3-2. 함수 생성
1. "함수 만들기" 클릭
2. 환경: 2세대 선택
3. 함수 이름: `pagespeed-analysis`
4. 지역: `asia-northeast3` (서울)
5. 트리거 유형: HTTP
6. 인증: "인증되지 않은 호출 허용" 체크
7. "저장" 후 "다음" 클릭

### 3-3. 코드 설정
1. 런타임: Node.js 18
2. 진입점: `pagespeedAnalysis`
3. 소스 코드: 인라인 편집기
4. `index.js`에 gcp-function.js 내용 복사
5. `package.json`:
```json
{
  "name": "pagespeed-function",
  "version": "1.0.0",
  "dependencies": {
    "@google-cloud/functions-framework": "^3.3.0"
  }
}
```

### 3-4. 고급 설정
1. 메모리: 512MB
2. 시간 초과: 540초 (9분)
3. 환경 변수:
   - `PAGESPEED_API_KEY`: [PageSpeed API 키]

### 3-5. 배포
"배포" 버튼 클릭하고 완료까지 대기

## 4. 테스트
배포 완료 후 트리거 URL로 POST 요청:
```javascript
fetch('https://asia-northeast3-mocheck-468907.cloudfunctions.net/pagespeed-analysis', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://example.com',
    strategy: 'mobile'
  })
})
```

## 5. 프론트엔드 연결
`src/lib/services/pagespeed.ts`에서 API 엔드포인트 변경
