<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  onMount(() => {
    // 브라우저 언어 감지 (클라이언트 사이드에서 추가 보완)
    const browserLang = navigator.language.slice(0, 2);
    const supportedLangs = ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'fr', 'de'];
    
    // 한국어가 감지되면 확실히 한국어로, 그 외에는 감지된 언어나 기본값
    let defaultLang = 'ko'; // 기본값을 한국어로
    
    if (supportedLangs.includes(browserLang)) {
      defaultLang = browserLang;
    }
    
    console.log('Client detected language:', browserLang, '→', defaultLang);
    goto(`/${defaultLang}/`, { replaceState: true });
  });
</script>

<!-- 로딩 화면 -->
<div class="min-h-screen flex items-center justify-center bg-gray-50">
  <div class="text-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
    <p class="text-gray-600">언어를 감지하는 중...</p>
    <p class="text-sm text-gray-500 mt-2">Detecting language...</p>
  </div>
</div>