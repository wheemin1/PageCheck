<script lang="ts">
  import { t } from '../stores/i18n';
  import type { Improvement } from '../types/pagespeed';

  export let improvements: Improvement[];

  function getScoreColor(score: number): string {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  }

  function getScoreBadge(score: number): string {
    if (score >= 0.9) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 0.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  }
</script>

<div>
  <h2 class="text-xl font-semibold text-gray-900 mb-6">{$t('improvements.title')}</h2>
  
  {#if improvements.length === 0}
    <div class="text-center py-8">
      <svg class="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-1">{$t('improvements.excellent')}</h3>
      <p class="text-gray-600">{$t('improvements.noIssues')}</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each improvements as improvement, index}
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow min-h-[200px] flex flex-col">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center space-x-2">
              <span class="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex-shrink-0">
                {index + 1}
              </span>
              <span class="px-2 py-1 text-xs font-medium border rounded-full {getScoreBadge(improvement.score)} flex-shrink-0">
                {Math.round(improvement.score * 100)}
              </span>
            </div>
          </div>
          
          <h3 class="font-medium text-gray-900 mb-2 word-break break-words">
            {improvement.title}
          </h3>
          
          <p class="text-sm text-gray-600 mb-3 leading-relaxed flex-1 word-break break-words overflow-wrap break-word">
            {improvement.description}
          </p>
          
          {#if improvement.displayValue}
            <div class="text-sm font-medium {getScoreColor(improvement.score)} mb-3 word-break break-words">
              {improvement.displayValue}
            </div>
          {/if}
          
          <!-- Expandable details -->
          <details class="mt-auto">
            <summary class="text-sm text-blue-600 cursor-pointer hover:text-blue-800">
              자세히 보기
            </summary>
            <div class="mt-2 text-xs text-gray-600">
              {#if improvement.details}
                <pre class="whitespace-pre-wrap bg-gray-50 p-2 rounded text-xs overflow-x-auto max-h-32 overflow-y-auto word-break break-all">
                  {JSON.stringify(improvement.details, null, 2)}
                </pre>
              {:else}
                <p>추가 세부 정보가 없습니다.</p>
              {/if}
            </div>
          </details>
        </div>
      {/each}
    </div>
  {/if}
</div>
