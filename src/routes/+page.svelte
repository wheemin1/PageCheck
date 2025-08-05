<script lang="ts">
  import { onMount } from 'svelte';
  import { appStore } from '$lib/stores/app';
  import { initI18n, t, currentLang } from '$lib/stores/i18n';
  import { initKakao } from '$lib/services/kakao';
  
  import UrlInput from '$lib/components/UrlInput.svelte';
  import ScoreGauge from '$lib/components/ScoreGauge.svelte';
  import CoreWebVitals from '$lib/components/CoreWebVitals.svelte';
  import ImprovementCards from '$lib/components/ImprovementCards.svelte';
  import AuditTable from '$lib/components/AuditTable.svelte';
  import ExportButtons from '$lib/components/ExportButtons.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  onMount(async () => {
    await initI18n();
    initKakao();
  });

  $: results = $appStore.results;
  $: loading = $appStore.loading;
  $: error = $appStore.error;
</script>

<svelte:head>
  <title>MoCheck - 10초 모바일 친화도 체커</title>
</svelte:head>

<main class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            MoCheck
          </h1>
          <p class="text-gray-600 mt-1">
            {$t('header.subtitle')}
          </p>
        </div>
        
        <!-- Language Selector -->
        <div class="flex items-center space-x-2">
          <select 
            bind:value={$currentLang}
            class="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </select>
        </div>
      </div>
    </div>
  </header>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- URL Input Section -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <UrlInput />
    </div>

    <!-- Loading State -->
    {#if loading}
      <div class="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    {/if}

    <!-- Error State -->
    {#if error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <p class="text-red-700 font-medium">{$t('error.title')}</p>
        </div>
        <p class="text-red-600 mt-2">{error}</p>
      </div>
    {/if}

    <!-- Results Section -->
    {#if results && !loading}
      <div id="results-container" class="space-y-8">
        <!-- Score Overview -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">{$t('results.overview')}</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <ScoreGauge 
              score={results.overallScore}
              label={$t('results.overall')}
              isOverall={true}
            />
            <ScoreGauge 
              score={results.scores.performance}
              label={$t('results.performance')}
            />
            <ScoreGauge 
              score={results.scores.accessibility}
              label={$t('results.accessibility')}
            />
            <ScoreGauge 
              score={results.scores.seo}
              label={$t('results.seo')}
            />
            <ScoreGauge 
              score={results.scores.bestPractices}
              label={$t('results.bestPractices')}
            />
          </div>
        </div>

        <!-- Core Web Vitals -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <CoreWebVitals vitals={results.coreWebVitals} />
        </div>

        <!-- Improvement Suggestions -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <ImprovementCards improvements={results.improvements} />
        </div>

        <!-- Export Buttons -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <ExportButtons />
        </div>

        <!-- Detailed Audit Results -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <AuditTable audits={results.audits} />
        </div>
      </div>
    {/if}

    <!-- Empty State -->
    {#if !results && !loading && !error}
      <div class="text-center py-12">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">{$t('empty.title')}</h3>
        <p class="text-gray-600">{$t('empty.subtitle')}</p>
      </div>
    {/if}
  </div>

  <!-- Footer -->
  <footer class="bg-white border-t border-gray-200 mt-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center text-gray-600">
        <p>&copy; 2025 MoCheck. Made with ❤️ using Google PageSpeed Insights API</p>
      </div>
    </div>
  </footer>
</main>