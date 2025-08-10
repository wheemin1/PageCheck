<script lang="ts">
  import { analyzeUrl } from '../services/pagespeed';
  import { t } from '../stores/i18n';
  import { appStore } from '../stores/app';
  import { clearCache } from '../utils/cache';

  let url = '';
  let strategy: 'mobile' | 'desktop' = 'mobile';
  let forceRefresh = false;

  async function handleSubmit() {
    if (!url.trim()) return;
    
    // Add protocol if missing
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    try {
      new URL(formattedUrl); // Validate URL
      
      // Clear cache if force refresh is enabled
      if (forceRefresh) {
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
    appStore.setError('🗑️ 캐시가 지워졌습니다. 이제 모든 분석이 새로고침됩니다.');
    setTimeout(() => {
      appStore.setError(null);
    }, 3000);
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

    <!-- Cache Options -->
    <div class="flex items-center justify-between">
      <label class="flex items-center">
        <input
          type="checkbox"
          bind:checked={forceRefresh}
          class="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <span class="ml-2 text-sm text-gray-700">
          🔄 항상 최신 데이터 가져오기 (캐시 무시)
        </span>
      </label>
      
      <button
        on:click={clearAllCache}
        class="text-xs text-gray-500 hover:text-red-600 underline transition-colors"
        title="저장된 모든 분석 결과 캐시를 지웁니다"
      >
        🗑️ 전체 캐시 지우기
      </button>
    </div>

    <!-- Cache Info -->
    <div class="text-xs text-gray-400 bg-gray-50 p-2 rounded">
      💡 동일한 URL은 30분간 캐시됩니다. "항상 최신 데이터 가져오기"를 체크하면 매번 새로 분석합니다.
    </div>
  </div>
</div>
