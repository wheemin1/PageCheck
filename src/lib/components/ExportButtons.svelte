<script lang="ts">
  import { appStore } from '../stores/app';
  import { t } from '../stores/i18n';
  import { exportToPNG, exportToPDF, exportToCSV, exportToJSON } from '../services/export';
  import { shareToKakao } from '../services/kakao';

  let loading = {
    png: false,
    pdf: false,
    csv: false,
    json: false,
    kakao: false
  };

  async function handlePNGExport() {
    try {
      loading.png = true;
      await exportToPNG();
    } catch (error) {
      alert(error instanceof Error ? error.message : $t('export.pngError'));
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
      alert(error instanceof Error ? error.message : $t('export.pdfError'));
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
      alert(error instanceof Error ? error.message : $t('export.kakaoError'));
    } finally {
      loading.kakao = false;
    }
  }

  async function handleCSVExport() {
    const results = $appStore.results;
    console.log('CSV export clicked, results:', results);
    
    if (!results) {
      console.error('No results available for CSV export');
      alert($t('export.noResults'));
      return;
    }

    try {
      loading.csv = true;
      console.log('Starting CSV export...');
      await exportToCSV(results);
      console.log('CSV export completed');
    } catch (error) {
      console.error('CSV export error:', error);
      alert(error instanceof Error ? error.message : $t('export.csvError'));
    } finally {
      loading.csv = false;
    }
  }

  async function handleJSONExport() {
    const results = $appStore.results;
    console.log('JSON export clicked, results:', results);
    
    if (!results) {
      console.error('No results available for JSON export');
      alert($t('export.noResults'));
      return;
    }

    try {
      loading.json = true;
      console.log('Starting JSON export...');
      await exportToJSON(results);
      console.log('JSON export completed');
    } catch (error) {
      console.error('JSON export error:', error);
      alert(error instanceof Error ? error.message : $t('export.jsonError'));
    } finally {
      loading.json = false;
    }
  }
</script>

<div>
  <h2 class="text-xl font-semibold text-gray-900 mb-6">{$t('export.title')}</h2>
  
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
    <!-- CSV Export -->
    <button
      on:click={handleCSVExport}
      disabled={loading.csv}
      class="flex items-center justify-center px-4 py-3 border border-green-300 rounded-lg text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {#if loading.csv}
        <svg class="animate-spin w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      {:else}
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      {/if}
      {$t('export.csv')}
    </button>

    <!-- JSON Export -->
    <button
      on:click={handleJSONExport}
      disabled={loading.json}
      class="flex items-center justify-center px-4 py-3 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {#if loading.json}
        <svg class="animate-spin w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      {:else}
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      {/if}
      {$t('export.json')}
    </button>

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
      {$t('export.png')}
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
      {$t('export.pdf')}
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
      {$t('export.kakao')}
    </button>
  </div>
</div>
