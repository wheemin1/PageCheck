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
      return { label: $t('audits.passed'), class: 'bg-green-100 text-green-800 border-green-200' };
    }
    if (audit.score >= 0.5) {
      return { label: $t('audits.warning'), class: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    }
    return { label: $t('audits.failed'), class: 'bg-red-100 text-red-800 border-red-200' };
  }

  function getCategoryDisplayName(category: string): string {
    const names: Record<string, string> = {
      performance: $t('audits.performance'),
      accessibility: $t('audits.accessibility'), 
      seo: $t('audits.seo'),
      'best-practices': $t('audits.bestPractices'),
      other: $t('audits.other')
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
    const headers = [$t('audits.tableTitle'), $t('audits.tableCategory'), $t('audits.tableStatus'), $t('audits.tableScore')];
    const csvContent = [
      headers.join(','),
      ...filteredAudits.map(audit => [
        `"${audit.title}"`,
        getCategoryDisplayName(audit.category),
        getStatusInfo(audit).label,
        audit.score ? Math.round(audit.score * 100) : 'N/A'
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

<div class="mt-8">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
    <h2 class="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">{$t('audits.title')}</h2>
    
    <div class="flex space-x-2">
      <button
        on:click={exportToCSV}
        class="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
      >
        {$t('audits.exportCsv')}
      </button>
      <button
        on:click={exportToJSON}
        class="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
      >
        {$t('audits.exportJson')}
      </button>
    </div>
  </div>

  <!-- Filters -->
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
    <!-- Search -->
    <div>
      <label for="search" class="block text-sm font-medium text-gray-700 mb-1">{$t('audits.search')}</label>
      <input
        id="search"
        type="text"
        bind:value={searchTerm}
        placeholder={$t('audits.searchPlaceholder')}
        class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <!-- Category Filter -->
    <div>
      <label for="category" class="block text-sm font-medium text-gray-700 mb-1">{$t('audits.category')}</label>
      <select
        id="category"
        bind:value={selectedCategory}
        class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">{$t('audits.all')}</option>
        {#each categories as category}
          <option value={category}>{getCategoryDisplayName(category)}</option>
        {/each}
      </select>
    </div>

    <!-- Status Filter -->
    <div>
      <label for="status" class="block text-sm font-medium text-gray-700 mb-1">{$t('audits.tableStatus')}</label>
      <select
        id="status"
        bind:value={selectedStatus}
        class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">{$t('audits.all')}</option>
        <option value="passed">{$t('audits.passed')}</option>
        <option value="warning">{$t('audits.warning')}</option>
        <option value="failed">{$t('audits.failed')}</option>
      </select>
    </div>
  </div>

  <!-- Results count -->
  <div class="mb-4 text-sm text-gray-600">
    {$t('audits.totalResults', { count: filteredAudits.length })}
  </div>

  <!-- Enhanced Table with Better Styling -->
  <div class="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50 sticky top-0">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
            {$t('audits.tableTitle')}
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
            {$t('audits.tableCategory')}
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
            {$t('audits.tableStatus')}
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
            {$t('audits.tableScore')}
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
            {$t('audits.value')}
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
            {$t('audits.details')}
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        {#each filteredAudits as audit (audit.id)}
          <tr class="hover:bg-gray-50 {expandedRows.has(audit.id) ? 'bg-blue-50 border-l-4 border-blue-400' : ''}">
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
                class="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap transition-colors duration-200 {expandedRows.has(audit.id) ? 'bg-blue-100 px-2 py-1 rounded' : ''}"
              >
                {expandedRows.has(audit.id) ? $t('audits.collapse') : $t('audits.expand')}
              </button>
            </td>
          </tr>
          
          {#if expandedRows.has(audit.id)}
            <tr class="bg-blue-25 border-l-4 border-blue-400">
              <td colspan="6" class="px-6 py-4">
                <div class="space-y-3 max-w-full">
                  <div>
                    <h4 class="text-sm font-medium text-gray-900 mb-1">{$t('audits.description')}</h4>
                    <div class="text-sm text-gray-600 leading-relaxed max-w-full break-words whitespace-pre-wrap">
                      {audit.description}
                    </div>
                  </div>
                  
                  {#if audit.details}
                    <div>
                      <h4 class="text-sm font-medium text-gray-900 mb-1">{$t('audits.detailsInfo')}</h4>
                      <div class="text-xs bg-white border rounded p-3 overflow-auto max-h-60 max-w-full">
                        <pre class="whitespace-pre-wrap break-words font-mono text-xs">{JSON.stringify(audit.details, null, 2)}</pre>
                      </div>
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
        <p class="text-gray-500">{$t('audits.noResults')}</p>
      </div>
    {/if}
  </div>
</div>
