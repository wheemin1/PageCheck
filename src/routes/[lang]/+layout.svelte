<script>
  import '../../app.css';
  import { t } from '$lib/stores/i18n';
  import { page } from '$app/stores';
  
  $: lang = $page.params.lang || 'en';
  $: currentUrl = `https://mocheck.netlify.app/${lang}/`;
</script>

<svelte:head>
  <title>{$t('meta.title')}</title>
  <meta name="description" content="{$t('meta.description')}" />
  <meta name="keywords" content="{$t('meta.keywords')}" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="{$t('meta.title')}" />
  <meta property="og:description" content="{$t('meta.description')}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="{currentUrl}" />
  <meta property="og:image" content="https://mocheck.netlify.app/og-image.png" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{$t('meta.title')}" />
  <meta name="twitter:description" content="{$t('meta.description')}" />
  <meta name="twitter:image" content="https://mocheck.netlify.app/og-image.png" />
  
  <!-- Language alternatives -->
  <link rel="canonical" href="{currentUrl}" />
  <link rel="alternate" hreflang="ko" href="https://mocheck.netlify.app/ko/" />
  <link rel="alternate" hreflang="en" href="https://mocheck.netlify.app/en/" />
  <link rel="alternate" hreflang="ja" href="https://mocheck.netlify.app/ja/" />
  <link rel="alternate" hreflang="zh" href="https://mocheck.netlify.app/zh/" />
  <link rel="alternate" hreflang="es" href="https://mocheck.netlify.app/es/" />
  <link rel="alternate" hreflang="pt" href="https://mocheck.netlify.app/pt/" />
  <link rel="alternate" hreflang="fr" href="https://mocheck.netlify.app/fr/" />
  <link rel="alternate" hreflang="de" href="https://mocheck.netlify.app/de/" />
  <link rel="alternate" hreflang="x-default" href="https://mocheck.netlify.app/en/" />
  
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