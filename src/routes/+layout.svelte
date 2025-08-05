<script>
  import '../app.css';
</script>

<svelte:head>
  <title>MoCheck - 10초 모바일 친화도 체커</title>
  <meta name="description" content="Google PageSpeed Insights를 활용한 웹사이트 성능 분석 도구. 모바일 친화도, 접근성, SEO 점수를 10초 만에 확인하세요." />
  
  <!-- Open Graph -->
  <meta property="og:title" content="MoCheck - 10초 모바일 친화도 체커" />
  <meta property="og:description" content="Google PageSpeed Insights를 활용한 웹사이트 성능 분석 도구" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://mocheck.netlify.app" />
  <meta property="og:image" content="https://mocheck.netlify.app/og-image.png" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="MoCheck - 10초 모바일 친화도 체커" />
  <meta name="twitter:description" content="Google PageSpeed Insights를 활용한 웹사이트 성능 분석 도구" />
  <meta name="twitter:image" content="https://mocheck.netlify.app/og-image.png" />
  
  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  
  <!-- Kakao SDK -->
  <script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js" 
          integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4" 
          crossorigin="anonymous"></script>
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<slot />