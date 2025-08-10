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
        <div class="flex items-center space-x-3">
          <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.766l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clip-rule="evenodd"/>
          </svg>
          <select 
            bind:value={$currentLang}
            class="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="ko">🇰🇷 한국어</option>
            <option value="en">🇺🇸 English</option>
            <option value="ja">🇯🇵 日本語</option>
            <option value="zh">🇨🇳 中文</option>
            <option value="es">🇪🇸 Español</option>
            <option value="pt">🇧🇷 Português</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="de">🇩🇪 Deutsch</option>
          </select>
        </div>
      </div>
    </div>
  </header>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Powered by Google Section -->
    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 mb-8">
      <div class="flex items-center justify-center space-x-4">
        <div class="flex items-center space-x-2">
          <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span class="text-blue-800 font-semibold">{$t('trust.poweredBy')}</span>
        </div>
        <div class="w-px h-6 bg-blue-300"></div>
        <div class="text-sm text-blue-700">
          <span class="font-medium">{$t('trust.officialApi')}</span>와 
          <span class="font-medium">{$t('trust.lighthouseEngine')}</span>{$t('trust.description')}
        </div>
      </div>
      <div class="mt-4 flex items-center justify-center space-x-6 text-xs text-blue-600">
        <div class="flex items-center space-x-1">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          <span>{$t('trust.realData')}</span>
        </div>
        <div class="flex items-center space-x-1">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          <span>{$t('trust.chromeUxReport')}</span>
        </div>
        <div class="flex items-center space-x-1">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          <span>{$t('trust.lighthouseVersion')}</span>
        </div>
      </div>
    </div>

    <!-- URL Input Section -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <UrlInput />
    </div>

    <!-- Analysis Tips -->
    <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
      <div class="flex items-start space-x-3">
        <svg class="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        <div class="flex-1">
          <h2 class="text-sm font-medium text-amber-800 mb-2">{$t('tips.title')}</h2>
          <ul class="text-sm text-amber-700 space-y-1">
            <li>• {$t('tips.largeWebsites')}</li>
            <li>• {$t('tips.mobileVersion')}</li>
            <li>• {$t('tips.timeout')}</li>
          </ul>
        </div>
      </div>
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
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900">{$t('results.overview')}</h2>
            <div class="flex items-center space-x-2">
              <!-- Real-time Analysis Badge -->
              <div class="flex items-center space-x-2 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
                </svg>
                <span class="font-medium">🔄 실시간 최신 분석</span>
              </div>
              
              <!-- Official Data Badge -->
              <div class="flex items-center space-x-2 text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="font-medium">{$t('trust.officialData')}</span>
              </div>
            </div>
          </div>
          
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
      <div class="text-center space-y-4">
        <!-- Trust Indicators -->
        <div class="flex justify-center items-center space-x-8 text-sm text-gray-600">
          <div class="flex items-center space-x-2">
            <svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span>{$t('trust.officialApiUse')}</span>
          </div>
          <div class="flex items-center space-x-2">
            <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span>{$t('trust.realtimeLighthouse')}</span>
          </div>
          <div class="flex items-center space-x-2">
            <svg class="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"/>
            </svg>
            <span>{$t('trust.chromeUxBased')}</span>
          </div>
        </div>
        
        <!-- Technology Stack -->
        <div class="text-xs text-gray-500">
          <p>
            <span class="font-medium">{$t('trust.techStack')}</span> 
            {$t('trust.techDescription')}
          </p>
        </div>
        
        <!-- Copyright -->
        <div class="text-sm text-gray-600 pt-4 border-t border-gray-100">
          <p>{$t('trust.copyright')}</p>
          <p class="text-xs text-gray-500 mt-1">
            {$t('trust.disclaimer')}
          </p>
        </div>
      </div>
    </div>
  </footer>
</main>