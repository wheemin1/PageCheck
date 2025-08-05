<script lang="ts">
  import { analyzeUrl } from '../services/pagespeed';
  import { t } from '../stores/i18n';
  import { appStore } from '../stores/app';

  let url = '';
  let strategy: 'mobile' | 'desktop' = 'mobile';

  async function handleSubmit() {
    if (!url.trim()) return;
    
    // Add protocol if missing
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    try {
      new URL(formattedUrl); // Validate URL
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

  <!-- Strategy Toggle -->
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
</div>
