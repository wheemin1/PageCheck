<script lang="ts">
  import { t } from '../stores/i18n';
  import type { CoreWebVitals } from '../types/pagespeed';

  export let vitals: CoreWebVitals;

  function getVitalStatus(score: number): { color: string; label: string } {
    if (score >= 0.9) return { color: 'bg-green-500', label: 'Good' };
    if (score >= 0.5) return { color: 'bg-yellow-500', label: 'Needs Improvement' };
    return { color: 'bg-red-500', label: 'Poor' };
  }

  function getVitalDescription(vital: string): string {
    const descriptions: Record<string, string> = {
      lcp: 'Largest Contentful Paint - 페이지의 주요 콘텐츠가 로드되는 시간',
      fid: 'First Input Delay - 사용자 상호작용에 대한 응답 시간',
      cls: 'Cumulative Layout Shift - 페이지 로딩 중 레이아웃 변화'
    };
    return descriptions[vital] || '';
  }
</script>

<div>
  <h2 class="text-xl font-semibold text-gray-900 mb-6">{$t('vitals.title')}</h2>
  
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- LCP -->
    <div class="p-4 border border-gray-200 rounded-lg">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-medium text-gray-900">LCP</h3>
        <span class="px-2 py-1 text-xs font-medium text-white rounded-full {getVitalStatus(vitals.lcp.score).color}">
          {getVitalStatus(vitals.lcp.score).label}
        </span>
      </div>
      
      <div class="mb-2">
        <div class="text-2xl font-bold text-gray-900">
          {vitals.lcp.displayValue}
        </div>
      </div>
      
      <!-- Progress bar -->
      <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          class="h-2 rounded-full transition-all duration-500 {getVitalStatus(vitals.lcp.score).color}"
          style="width: {Math.min(vitals.lcp.score * 100, 100)}%"
        ></div>
      </div>
      
      <p class="text-xs text-gray-600">
        {getVitalDescription('lcp')}
      </p>
    </div>

    <!-- FID -->
    <div class="p-4 border border-gray-200 rounded-lg">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-medium text-gray-900">FID</h3>
        <span class="px-2 py-1 text-xs font-medium text-white rounded-full {getVitalStatus(vitals.fid.score).color}">
          {getVitalStatus(vitals.fid.score).label}
        </span>
      </div>
      
      <div class="mb-2">
        <div class="text-2xl font-bold text-gray-900">
          {vitals.fid.displayValue}
        </div>
      </div>
      
      <!-- Progress bar -->
      <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          class="h-2 rounded-full transition-all duration-500 {getVitalStatus(vitals.fid.score).color}"
          style="width: {Math.min(vitals.fid.score * 100, 100)}%"
        ></div>
      </div>
      
      <p class="text-xs text-gray-600">
        {getVitalDescription('fid')}
      </p>
    </div>

    <!-- CLS -->
    <div class="p-4 border border-gray-200 rounded-lg">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-medium text-gray-900">CLS</h3>
        <span class="px-2 py-1 text-xs font-medium text-white rounded-full {getVitalStatus(vitals.cls.score).color}">
          {getVitalStatus(vitals.cls.score).label}
        </span>
      </div>
      
      <div class="mb-2">
        <div class="text-2xl font-bold text-gray-900">
          {vitals.cls.displayValue}
        </div>
      </div>
      
      <!-- Progress bar -->
      <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          class="h-2 rounded-full transition-all duration-500 {getVitalStatus(vitals.cls.score).color}"
          style="width: {Math.min(vitals.cls.score * 100, 100)}%"
        ></div>
      </div>
      
      <p class="text-xs text-gray-600">
        {getVitalDescription('cls')}
      </p>
    </div>
  </div>
</div>
