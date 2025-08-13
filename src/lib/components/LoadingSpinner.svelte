<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  
  let elapsedTime = 0;
  let interval: NodeJS.Timeout;
  
  onMount(() => {
    interval = setInterval(() => {
      elapsedTime += 1;
    }, 1000);
  });
  
  onDestroy(() => {
    if (interval) {
      clearInterval(interval);
    }
  });
  
  $: timeMessage = elapsedTime > 90 
    ? '복잡한 페이지를 분석 중입니다... 조금 더 기다려주세요.' 
    : '분석 중...';
    
  $: progressStep = elapsedTime < 30 ? 0 : elapsedTime < 60 ? 1 : 2;
</script>

<div class="flex flex-col items-center space-y-4">
  <div class="relative">
    <!-- Outer ring -->
    <div class="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
    <!-- Spinner -->
    <div class="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
  
  <div class="text-center">
    <p class="text-lg font-medium text-gray-900">{timeMessage}</p>
    <p class="text-sm text-gray-600 mt-1">PageSpeed Insights 데이터를 가져오고 있습니다</p>
    <p class="text-xs text-gray-500 mt-2">경과 시간: {elapsedTime}초</p>
    
    {#if elapsedTime > 90}
      <div class="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
        <p class="text-sm text-orange-700">
          ⚠️ 평소보다 오래 걸리고 있습니다. 복잡한 페이지이거나 서버가 바쁠 수 있습니다.
        </p>
        <p class="text-xs text-orange-600 mt-1">
          최대 3분까지 기다린 후 자동으로 재시도됩니다.
        </p>
      </div>
    {/if}
  </div>
  
  <!-- Progress steps -->
  <div class="flex items-center space-x-2 text-xs text-gray-500">
    <div class="flex items-center space-x-1">
      <div class="w-2 h-2 {progressStep >= 0 ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'} rounded-full"></div>
      <span class="{progressStep >= 0 ? 'text-blue-600' : ''}">성능 분석</span>
    </div>
    <div class="w-1 h-1 bg-gray-300 rounded-full"></div>
    <div class="flex items-center space-x-1">
      <div class="w-2 h-2 {progressStep >= 1 ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'} rounded-full"></div>
      <span class="{progressStep >= 1 ? 'text-blue-600' : ''}">접근성 검사</span>
    </div>
    <div class="w-1 h-1 bg-gray-300 rounded-full"></div>
    <div class="flex items-center space-x-1">
      <div class="w-2 h-2 {progressStep >= 2 ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'} rounded-full"></div>
      <span class="{progressStep >= 2 ? 'text-blue-600' : ''}">SEO 분석</span>
    </div>
  </div>
</div>
