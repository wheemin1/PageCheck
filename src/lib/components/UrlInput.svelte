<script lang="ts">
  import { analyzeUrl } from '../services/pagespeed';
  import { t } from '../stores/i18n';
  import { appStore } from '../stores/app';
  import { clearCache } from '../utils/cache';

  let url = '';
  let strategy: 'mobile' | 'desktop' = 'mobile';
  let analysisMode: 'smart' | 'fresh' = 'smart';

  async function handleSubmit() {
    if (!url.trim()) return;
    
    // Add protocol if missing
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    try {
      new URL(formattedUrl); // Validate URL
      
      // Clear cache if fresh analysis is requested
      if (analysisMode === 'fresh') {
        const cacheKey = `${formattedUrl}_${strategy}`;
        sessionStorage.removeItem(`mocheck-${cacheKey}`);
      }
      
      await analyzeUrl(formattedUrl, strategy);
    } catch (error) {
      appStore.setError($t('error.invalidUrl'));
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  }

  function clearAllCache() {
    clearCache();
    appStore.setError('✨ 저장된 결과를 모두 삭제했습니다. 이제 모든 사이트가 새로 분석됩니다.');
    setTimeout(() => {
      appStore.setError(null);
    }, 4000);
  }
</script>

<div class="space-y-4">
  <div>
    <label for="url" class="block text-sm font-medium text-gray-700 mb-2">
      {$t('input.urlLabel')}
    </label>
    <div class="flex space-x-3">
      <input
        id="url"
        type="text"
        bind:value={url}
        on:keydown={handleKeydown}
        placeholder={$t('input.urlPlaceholder')}
        class="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        on:click={handleSubmit}
        disabled={!url.trim() || $appStore.loading}
        class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {#if $appStore.loading}
          <svg class="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        {:else}
          {$t('input.analyze')}
        {/if}
      </button>
    </div>
  </div>

  <!-- Strategy and Options -->
  <div class="space-y-3">
    <!-- Device Strategy -->
    <div class="flex items-center space-x-4">
      <span class="text-sm font-medium text-gray-700">{$t('input.device')}:</span>
      <div class="flex items-center space-x-2">
        <label class="flex items-center">
          <input
            type="radio"
            bind:group={strategy}
            value="mobile"
            class="w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <span class="ml-2 text-sm text-gray-700">{$t('input.mobile')}</span>
        </label>
        <label class="flex items-center">
          <input
            type="radio"
            bind:group={strategy}
            value="desktop"
            class="w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <span class="ml-2 text-sm text-gray-700">{$t('input.desktop')}</span>
        </label>
      </div>
    </div>

    <!-- Cache Options - 더 직관적으로 개선 -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-start space-x-3">
        <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
        </svg>
        <div class="flex-1">
          <h3 class="text-sm font-medium text-blue-800 mb-2">⚡ 분석 방식 선택</h3>
          <div class="space-y-2">
            <label class="flex items-start space-x-2 cursor-pointer">
              <input
                type="radio"
                bind:group={analysisMode}
                value="smart"
                class="w-4 h-4 text-blue-600 focus:ring-blue-500 mt-0.5"
              />
              <div>
                <div class="text-sm text-blue-700 font-medium">🧠 스마트 분석 (권장)</div>
                <div class="text-xs text-blue-600">30분 이내 분석한 사이트는 저장된 결과 사용 (즉시 표시)</div>
              </div>
            </label>
            <label class="flex items-start space-x-2 cursor-pointer">
              <input
                type="radio"
                bind:group={analysisMode}
                value="fresh"
                class="w-4 h-4 text-blue-600 focus:ring-blue-500 mt-0.5"
              />
              <div>
                <div class="text-sm text-blue-700 font-medium">🔄 실시간 분석</div>
                <div class="text-xs text-blue-600">매번 새로 분석 (최대 2분 소요, API 할당량 사용)</div>
              </div>
            </label>
          </div>
        </div>
      </div>
      
      <div class="flex items-center justify-between mt-3 pt-3 border-t border-blue-200">
        <div class="text-xs text-blue-600">
          💡 대부분의 경우 스마트 분석으로 충분합니다
        </div>
        <button
          on:click={clearAllCache}
          class="text-xs text-blue-600 hover:text-red-600 underline transition-colors"
          title="저장된 모든 분석 결과를 삭제합니다"
        >
          🗑️ 저장된 결과 모두 삭제
        </button>
      </div>
    </div>
  </div>
</div>
