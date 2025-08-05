<script lang="ts">
  import { t } from '../stores/i18n';
  import type { Audit } from '../types/pagespeed';

  export let audits: Audit[];

  let searchTerm = '';
  let selectedCategory = 'all';
  let selectedStatus = 'all';
  let expandedRows = new Set<string>();

  $: categories = [...new Set(audits.map(audit => audit.category))];
  
  $: filteredAudits = audits.filter(audit => {
    const matchesSearch = audit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audit.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || audit.category === selectedCategory;
    
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'passed' && (audit.score === null || audit.score >= 0.9)) ||
                         (selectedStatus === 'warning' && audit.score !== null && audit.score >= 0.5 && audit.score < 0.9) ||
                         (selectedStatus === 'failed' && audit.score !== null && audit.score < 0.5);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  function getStatusInfo(audit: Audit) {
    if (audit.score === null) {
      return { label: 'N/A', class: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
    if (audit.score >= 0.9) {
      return { label: '통과', class: 'bg-green-100 text-green-800 border-green-200' };
    }
    if (audit.score >= 0.5) {
      return { label: '경고', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    }
    return { label: '실패', class: 'bg-red-100 text-red-800 border-red-200' };
  }

  function getCategoryDisplayName(category: string): string {
    const names: Record<string, string> = {
      performance: '성능',
      accessibility: '접근성',
      seo: 'SEO',
      'best-practices': '모범 사례',
      other: '기타'
    };
    return names[category] || category;
  }

  function toggleRow(auditId: string) {
    if (expandedRows.has(auditId)) {
      expandedRows.delete(auditId);
    } else {
      expandedRows.add(auditId);
    }
    expandedRows = expandedRows; // Trigger reactivity
  }

  function exportToCSV() {
    const headers = ['제목', '카테고리', '상태', '점수', '설명'];
    const csvContent = [
      headers.join(','),
      ...filteredAudits.map(audit => [
        `"${audit.title}"`,
        getCategoryDisplayName(audit.category),
        getStatusInfo(audit).label,
        audit.score ? Math.round(audit.score * 100) : 'N/A',
        `"${audit.description}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mocheck-audits-${Date.now()}.csv`;
    link.click();
  }

  function exportToJSON() {
    const jsonContent = JSON.stringify(filteredAudits, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mocheck-audits-${Date.now()}.json`;
    link.click();
  }
</script>

<div>
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
    <h2 class="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">{$t('audits.title')}</h2>
    
    <div class="flex space-x-2">
      <button
        on:click={exportToCSV}
        class="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
      >
        CSV 내보내기
      </button>
      <button
        on:click={exportToJSON}
        class="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
      >
        JSON 내보내기
      </button>
    </div>
  </div>

  <!-- Filters -->
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
    <!-- Search -->
    <div>
      <label for="search" class="block text-sm font-medium text-gray-700 mb-1">검색</label>
      <input
        id="search"
        type="text"
        bind:value={searchTerm}
        placeholder="감사 항목 검색..."
        class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <!-- Category Filter -->
    <div>
      <label for="category" class="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
      <select
        id="category"
        bind:value={selectedCategory}
        class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">전체</option>
        {#each categories as category}
          <option value={category}>{getCategoryDisplayName(category)}</option>
        {/each}
      </select>
    </div>

    <!-- Status Filter -->
    <div>
      <label for="status" class="block text-sm font-medium text-gray-700 mb-1">상태</label>
      <select
        id="status"
        bind:value={selectedStatus}
        class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">전체</option>
        <option value="passed">통과</option>
        <option value="warning">경고</option>
        <option value="failed">실패</option>
      </select>
    </div>
  </div>

  <!-- Results count -->
  <div class="mb-4 text-sm text-gray-600">
    총 {filteredAudits.length}개 결과
  </div>

  <!-- Table -->
  <div class="overflow-x-auto border border-gray-200 rounded-lg">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50 sticky top-0">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
            감사 항목
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
            카테고리
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
            상태
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
            점수
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
            값
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
            상세
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        {#each filteredAudits as audit (audit.id)}
          <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 max-w-0">
              <div class="text-sm font-medium text-gray-900 word-break break-words overflow-wrap break-word">
                {audit.title}
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
              {getCategoryDisplayName(audit.category)}
            </td>
            <td class="px-6 py-4">
              <span class="inline-flex px-2 py-1 text-xs font-medium border rounded-full {getStatusInfo(audit).class} whitespace-nowrap">
                {getStatusInfo(audit).label}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
              {audit.score !== null ? Math.round(audit.score * 100) : 'N/A'}
            </td>
            <td class="px-6 py-4 text-sm text-gray-500 max-w-0">
              <div class="word-break break-words overflow-wrap break-word">
                {audit.displayValue || '-'}
              </div>
            </td>
            <td class="px-6 py-4 text-center">
              <button
                on:click={() => toggleRow(audit.id)}
                class="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap"
              >
                {expandedRows.has(audit.id) ? '접기' : '펼치기'}
              </button>
            </td>
          </tr>
          
          {#if expandedRows.has(audit.id)}
            <tr class="bg-gray-50">
              <td colspan="6" class="px-6 py-4">
                <div class="space-y-3">
                  <div>
                    <h4 class="text-sm font-medium text-gray-900 mb-1">설명</h4>
                    <p class="text-sm text-gray-600 word-break break-words overflow-wrap break-word leading-relaxed">
                      {audit.description}
                    </p>
                  </div>
                  
                  {#if audit.details}
                    <div>
                      <h4 class="text-sm font-medium text-gray-900 mb-1">세부 정보</h4>
                      <pre class="text-xs bg-white border rounded p-3 overflow-x-auto max-h-40 word-break break-all">
                        {JSON.stringify(audit.details, null, 2)}
                      </pre>
                    </div>
                  {/if}
                </div>
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
    
    {#if filteredAudits.length === 0}
      <div class="text-center py-8">
        <p class="text-gray-500">검색 조건에 맞는 결과가 없습니다.</p>
      </div>
    {/if}
  </div>
</div>
