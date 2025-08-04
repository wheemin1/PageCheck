<script lang="ts">
  import { onMount } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  export let score: number;
  export let label: string;
  export let category: string = '';
  export let isOverall: boolean = false;

  const animatedScore = tweened(0, {
    duration: 1000,
    easing: cubicOut
  });

  let mounted = false;

  onMount(() => {
    mounted = true;
    animatedScore.set(score);
  });

  $: circumference = 2 * Math.PI * 45;
  $: strokeDashoffset = circumference - (($animatedScore / 100) * circumference);
  
  $: scoreColor = score >= 90 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
  $: bgColor = isOverall ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : 'bg-gray-50';
</script>

<div class="flex flex-col items-center p-4 rounded-lg {bgColor} {isOverall ? 'ring-2 ring-blue-200' : ''}">
  <div class="relative w-24 h-24 mb-3">
    <!-- Background circle -->
    <svg class="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="#E5E7EB"
        stroke-width="8"
        fill="none"
      />
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke={scoreColor}
        stroke-width="8"
        fill="none"
        stroke-linecap="round"
        stroke-dasharray={circumference}
        stroke-dashoffset={mounted ? strokeDashoffset : circumference}
        class="transition-all duration-1000 ease-out"
      />
    </svg>
    
    <!-- Score text -->
    <div class="absolute inset-0 flex items-center justify-center">
      <span class="text-xl font-bold" style="color: {scoreColor}">
        {Math.round($animatedScore)}
      </span>
    </div>
  </div>
  
  <h3 class="text-sm font-medium text-gray-900 text-center {isOverall ? 'text-blue-900' : ''}">
    {label}
  </h3>
  
  {#if isOverall}
    <p class="text-xs text-blue-600 mt-1 text-center">종합 점수</p>
  {/if}
</div>
