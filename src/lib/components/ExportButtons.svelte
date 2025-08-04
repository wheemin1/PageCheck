<script lang="ts">
  import { appStore } from '../stores/app';
  import { t } from '../stores/i18n';
  import { exportToPNG, exportToPDF } from '../services/export';
  import { shareToKakao } from '../services/kakao';

  let loading = {
    png: false,
    pdf: false,
    kakao: false
  };

  async function handlePNGExport() {
    try {
      loading.png = true;
      await exportToPNG();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'PNG 내보내기에 실패했습니다.');
    } finally {
      loading.png = false;
    }
  }

  async function handlePDFExport() {
    const results = $appStore.results;
    if (!results) return;

    try {
      loading.pdf = true;
      await exportToPDF(results);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'PDF 내보내기에 실패했습니다.');
    } finally {
      loading.pdf = false;
    }
  }

  async function handleKakaoShare() {
    const results = $appStore.results;
    if (!results) return;

    try {
      loading.kakao = true;
      await shareToKakao(results.url, results.overallScore);
    } catch (error) {
      alert(error instanceof Error ? error.message : '카카오톡 공유에 실패했습니다.');
    } finally {
      loading.kakao = false;
    }
  }
</script>

<div>
  <h2 class="text-xl font-semibold text-gray-900 mb-6">{$t('export.title')}</h2>
  
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <!-- PNG Export -->
    <button
      on:click={handlePNGExport}
      disabled={loading.png}
      class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {#if loading.png}
        <svg class="animate-spin w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      {:else}
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      {/if}
      PNG 다운로드
    </button>

    <!-- PDF Export -->
    <button
      on:click={handlePDFExport}
      disabled={loading.pdf}
      class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {#if loading.pdf}
        <svg class="animate-spin w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      {:else}
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      {/if}
      PDF 다운로드
    </button>

    <!-- Kakao Share -->
    <button
      on:click={handleKakaoShare}
      disabled={loading.kakao}
      class="flex items-center justify-center px-4 py-3 bg-yellow-400 text-gray-900 rounded-lg text-sm font-medium hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {#if loading.kakao}
        <svg class="animate-spin w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      {:else}
        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 01-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
        </svg>
      {/if}
      카카오톡 공유
    </button>
  </div>
</div>
