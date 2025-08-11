<script lang="ts">
  import { onMount } from 'svelte';
  import { historyStore, favoritesStore, historyStats, getHistoryByDate, type HistoryEntry } from '../stores/history';
  import { t } from '../stores/i18n';
  
  export let showModal = false;
  
  let selectedTab: 'recent' | 'favorites' | 'stats' = 'recent';
  let searchTerm = '';
  let selectedStrategy: 'all' | 'mobile' | 'desktop' = 'all';
  
  $: filteredHistory = $historyStore.filter(entry => {
    const matchesSearch = entry.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStrategy = selectedStrategy === 'all' || entry.strategy === selectedStrategy;
    return matchesSearch && matchesStrategy;
  });
  
  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString('ko-KR');
  }
  
  function getScoreColor(score: number): string {
    if (score >= 90) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }
  
  function getScoreBg(score: number): string {
    if (score >= 90) return 'bg-green-100';
    if (score >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  }
  
  function handleAnalyzeAgain(entry: HistoryEntry) {
    // Emit event to parent to analyze the URL again
    const event = new CustomEvent('analyze', { 
      detail: { url: entry.url, strategy: entry.strategy } 
    });
    document.dispatchEvent(event);
    showModal = false;
  }
  
  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    // Show toast notification
    alert('URL이 클립보드에 복사되었습니다!');
  }
</script>

{#if showModal}
  <!-- Modal backdrop -->
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <!-- Modal content -->
    <div class="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-900">분석 기록</h2>
        <button 
          on:click={() => showModal = false}
          class="text-gray-400 hover:text-gray-600"
          aria-label="모달 닫기"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Tabs -->
      <div class="border-b">
        <nav class="-mb-px flex">
          <button 
            class="py-2 px-6 border-b-2 font-medium text-sm {selectedTab === 'recent' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
            on:click={() => selectedTab = 'recent'}
          >
            최근 분석 ({$historyStore.length})
          </button>
          <button 
            class="py-2 px-6 border-b-2 font-medium text-sm {selectedTab === 'favorites' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
            on:click={() => selectedTab = 'favorites'}
          >
            즐겨찾기 ({$favoritesStore.length})
          </button>
          <button 
            class="py-2 px-6 border-b-2 font-medium text-sm {selectedTab === 'stats' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
            on:click={() => selectedTab = 'stats'}
          >
            통계
          </button>
        </nav>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto" style="max-height: calc(90vh - 200px);">
        {#if selectedTab === 'recent'}
          <!-- Search and filters -->
          <div class="mb-6 flex flex-col sm:flex-row gap-4">
            <div class="flex-1">
              <input 
                type="text" 
                placeholder="URL로 검색..." 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                bind:value={searchTerm}
              />
            </div>
            <div class="min-w-0 sm:w-40">
              <select 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                bind:value={selectedStrategy}
              >
                <option value="all">전체 기기</option>
                <option value="mobile">📱 모바일</option>
                <option value="desktop">🖥️ 데스크톱</option>
              </select>
            </div>
          </div>

          <!-- History list -->
          <div class="space-y-4">
            {#each filteredHistory as entry (entry.id)}
              <div class="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-2">
                      <p class="text-sm font-medium text-gray-900 truncate">{entry.url}</p>
                      <button 
                        on:click={() => copyUrl(entry.url)}
                        class="text-gray-400 hover:text-gray-600"
                        title="URL 복사"
                        aria-label="URL 복사"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                      </button>
                    </div>
                    <div class="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatDate(entry.timestamp)}</span>
                      <span class="px-2 py-1 bg-gray-100 rounded-full">
                        {entry.strategy === 'mobile' ? '📱 모바일' : '🖥️ 데스크톱'}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Scores -->
                  <div class="flex items-center gap-3">
                    <div class="flex items-center gap-2">
                      <div class="text-center">
                        <div class="w-12 h-12 rounded-full {getScoreBg(entry.overallScore)} flex items-center justify-center">
                          <span class="text-sm font-bold {getScoreColor(entry.overallScore)}">{entry.overallScore}</span>
                        </div>
                        <span class="text-xs text-gray-500 mt-1">종합</span>
                      </div>
                    </div>
                    
                    <!-- Action buttons -->
                    <div class="flex items-center gap-2">
                      <button 
                        on:click={() => favoritesStore.addFavorite(entry.url)}
                        class="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
                        title="즐겨찾기 추가"
                        aria-label="즐겨찾기 추가"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                        </svg>
                      </button>
                      <button 
                        on:click={() => handleAnalyzeAgain(entry)}
                        class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        다시 분석
                      </button>
                      <button 
                        on:click={() => historyStore.removeEntry(entry.id)}
                        class="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="삭제"
                        aria-label="기록 삭제"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                <!-- Individual scores -->
                <div class="mt-3 grid grid-cols-4 gap-2">
                  <div class="text-center">
                    <div class="text-sm font-medium {getScoreColor(entry.scores.performance)}">{entry.scores.performance}</div>
                    <div class="text-xs text-gray-500">성능</div>
                  </div>
                  <div class="text-center">
                    <div class="text-sm font-medium {getScoreColor(entry.scores.accessibility)}">{entry.scores.accessibility}</div>
                    <div class="text-xs text-gray-500">접근성</div>
                  </div>
                  <div class="text-center">
                    <div class="text-sm font-medium {getScoreColor(entry.scores.bestPractices)}">{entry.scores.bestPractices}</div>
                    <div class="text-xs text-gray-500">모범사례</div>
                  </div>
                  <div class="text-center">
                    <div class="text-sm font-medium {getScoreColor(entry.scores.seo)}">{entry.scores.seo}</div>
                    <div class="text-xs text-gray-500">SEO</div>
                  </div>
                </div>
              </div>
            {/each}
            
            {#if filteredHistory.length === 0}
              <div class="text-center py-8 text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <p>분석 기록이 없습니다.</p>
                <p class="text-sm mt-1">웹사이트를 분석하면 여기에 기록이 저장됩니다.</p>
              </div>
            {/if}
          </div>
          
        {:else if selectedTab === 'favorites'}
          <!-- Favorites list -->
          <div class="space-y-4">
            {#each $favoritesStore as favorite (favorite.url)}
              <div class="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div class="flex items-center justify-between">
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900">{favorite.name}</p>
                    <p class="text-sm text-gray-500 truncate">{favorite.url}</p>
                    <p class="text-xs text-gray-400 mt-1">추가일: {formatDate(favorite.addedAt)}</p>
                  </div>
                  <div class="flex items-center gap-2 ml-4">
                    <button 
                      on:click={() => handleAnalyzeAgain({ url: favorite.url, strategy: 'mobile' })}
                      class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      분석하기
                    </button>
                    <button 
                      on:click={() => favoritesStore.removeFavorite(favorite.url)}
                      class="p-2 text-gray-400 hover:text-red-500"
                      title="즐겨찾기 삭제"
                      aria-label="즐겨찾기 삭제"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            {/each}
            
            {#if $favoritesStore.length === 0}
              <div class="text-center py-8 text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                </svg>
                <p>즐겨찾기가 없습니다.</p>
                <p class="text-sm mt-1">자주 확인하는 웹사이트를 즐겨찾기에 추가하세요.</p>
              </div>
            {/if}
          </div>
          
        {:else if selectedTab === 'stats'}
          <!-- Statistics -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-blue-50 rounded-lg p-6 text-center">
              <div class="text-3xl font-bold text-blue-600">{$historyStats.total}</div>
              <div class="text-sm text-gray-600 mt-1">총 분석 횟수</div>
            </div>
            <div class="bg-green-50 rounded-lg p-6 text-center">
              <div class="text-3xl font-bold text-green-600">{$historyStats.today}</div>
              <div class="text-sm text-gray-600 mt-1">오늘 분석</div>
            </div>
            <div class="bg-yellow-50 rounded-lg p-6 text-center">
              <div class="text-3xl font-bold text-yellow-600">{$historyStats.thisWeek}</div>
              <div class="text-sm text-gray-600 mt-1">이번 주</div>
            </div>
            <div class="bg-purple-50 rounded-lg p-6 text-center">
              <div class="text-3xl font-bold text-purple-600">{$historyStats.averageScore}</div>
              <div class="text-sm text-gray-600 mt-1">평균 점수</div>
            </div>
          </div>

          <!-- Daily breakdown -->
          <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4">일별 분석 기록</h3>
            <div class="space-y-3">
              {#each $getHistoryByDate.slice(0, 10) as dayData (dayData.date)}
                <div class="flex items-center justify-between p-3 bg-white rounded border">
                  <div class="flex items-center gap-4">
                    <span class="font-medium">{new Date(dayData.date).toLocaleDateString('ko-KR')}</span>
                    <span class="text-sm text-gray-500">{dayData.count}회 분석</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm">평균:</span>
                    <span class="font-medium {getScoreColor(dayData.averageScore)}">{dayData.averageScore}점</span>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
        <button 
          on:click={() => historyStore.clearHistory()}
          class="text-sm text-red-600 hover:text-red-700"
          disabled={$historyStore.length === 0}
        >
          전체 기록 삭제
        </button>
        <button 
          on:click={() => showModal = false}
          class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          닫기
        </button>
      </div>
    </div>
  </div>
{/if}
