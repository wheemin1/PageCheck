import { appStore } from '../stores/app';
import { getFromCache, setToCache } from '../utils/cache';
import { calculateOverallScore } from '../utils/score';
import type { PageSpeedResults, PageSpeedResponse } from '../types/pagespeed';

const API_ENDPOINT = '/.netlify/functions/pagespeed';

export async function analyzeUrl(url: string, strategy: 'mobile' | 'desktop' = 'mobile'): Promise<void> {
  try {
    appStore.setLoading(true);
    appStore.setError(null);
    appStore.setCurrentUrl(url);
    appStore.setCurrentStrategy(strategy);

    // Check cache first
    const cacheKey = `${url}_${strategy}`;
    const cached = getFromCache<PageSpeedResults>(cacheKey);
    if (cached) {
      appStore.setResults(cached, true); // true = from cache
      appStore.setLoading(false);
      return;
    }

    // Enhanced handling for complex domains
    const complexDomains = ['naver.com', 'daum.net', 'kakao.com', 'gamsgo.com', 'coupang.com', 'auction.co.kr'];
    const isComplexDomain = complexDomains.some(domain => url.includes(domain));
    
    if (isComplexDomain) {
      appStore.setError('⏰ 복잡한 웹사이트를 분석 중입니다... 최대 2분까지 소요될 수 있습니다. 잠시만 기다려주세요.');
      // Show countdown timer for user feedback
      let seconds = 120;
      const countdownInterval = setInterval(() => {
        seconds -= 10;
        if (seconds > 0) {
          appStore.setError(`⏰ 분석 중... 최대 ${Math.ceil(seconds/60)}분 더 소요될 수 있습니다. (남은 시간: ${seconds}초)`);
        } else {
          clearInterval(countdownInterval);
        }
      }, 10000);
      
      // Clear countdown on completion or error
      setTimeout(() => clearInterval(countdownInterval), 120000);
    }

    // Make API call with longer timeout expectation
    const response = await fetch(`${API_ENDPOINT}?url=${encodeURIComponent(url)}&strategy=${strategy}`, {
      // Frontend timeout slightly longer than backend
      signal: AbortSignal.timeout(125000) // 125초 = 2분 5초
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Enhanced 504 error handling with helpful suggestions
      if (response.status === 504) {
        const suggestions = errorData.suggestions || [
          '페이지를 새로고침하고 다시 시도',
          '더 간단한 하위 페이지 분석',
          '모바일 버전 사용 (예: m.example.com)',
          '잠시 후 재시도'
        ];
        throw new Error(errorData.error || `분석 시간 초과: ${suggestions.join(', ')}`);
      }
      
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data: PageSpeedResponse = await response.json();
    console.log('Raw API Response:', {
      performanceScore: data.lighthouseResult.categories.performance?.score,
      accessibilityScore: data.lighthouseResult.categories.accessibility?.score,
      seoScore: data.lighthouseResult.categories.seo?.score,
      bestPracticesScore: data.lighthouseResult.categories['best-practices']?.score
    });
    
    const results = processPageSpeedData(data);
    console.log('Processed Results:', results.scores);
    
    // Cache results
    setToCache(cacheKey, results);
    
    appStore.setResults(results, false); // false = fresh data (not from cache)
  } catch (error) {
    console.error('PageSpeed analysis failed:', error);
    appStore.setError(error instanceof Error ? error.message : 'Unknown error occurred');
  } finally {
    appStore.setLoading(false);
  }
}

function processPageSpeedData(data: PageSpeedResponse): PageSpeedResults {
  const lighthouse = data.lighthouseResult;
  const categories = lighthouse.categories;
  
  // Extract scores
  const scores = {
    performance: Math.round((categories.performance?.score || 0) * 100),
    accessibility: Math.round((categories.accessibility?.score || 0) * 100),
    seo: Math.round((categories.seo?.score || 0) * 100),
    bestPractices: Math.round((categories['best-practices']?.score || 0) * 100)
  };

  // Calculate overall score
  const overallScore = calculateOverallScore(scores);

  // Extract Core Web Vitals
  const audits = lighthouse.audits;
  const coreWebVitals = {
    lcp: {
      value: audits['largest-contentful-paint']?.numericValue || 0,
      displayValue: audits['largest-contentful-paint']?.displayValue || 'N/A',
      score: audits['largest-contentful-paint']?.score || 0
    },
    fid: {
      value: audits['interaction-to-next-paint']?.numericValue || audits['max-potential-fid']?.numericValue || audits['total-blocking-time']?.numericValue || 0,
      displayValue: audits['interaction-to-next-paint']?.displayValue || audits['max-potential-fid']?.displayValue || audits['total-blocking-time']?.displayValue || 'N/A',
      score: audits['interaction-to-next-paint']?.score || audits['max-potential-fid']?.score || audits['total-blocking-time']?.score || 0
    },
    cls: {
      value: audits['cumulative-layout-shift']?.numericValue || 0,
      displayValue: audits['cumulative-layout-shift']?.displayValue || 'N/A',
      score: audits['cumulative-layout-shift']?.score || 0
    }
  };

  // Extract improvement opportunities (score < 0.9)
  const improvements = Object.entries(audits)
    .filter(([_, audit]) => audit.score !== null && audit.score < 0.9)
    .sort(([_, a], [__, b]) => (a.score || 0) - (b.score || 0))
    .slice(0, 5)
    .map(([id, audit]) => ({
      id,
      title: audit.title,
      description: audit.description,
      score: audit.score || 0,
      displayValue: audit.displayValue,
      details: audit.details
    }));

  // Process all audits for detailed table
  const processedAudits = Object.entries(audits).map(([id, audit]) => ({
    id,
    title: audit.title,
    description: audit.description,
    score: audit.score,
    scoreDisplayMode: audit.scoreDisplayMode,
    displayValue: audit.displayValue,
    details: audit.details,
    category: getCategoryForAudit(id, categories)
  }));

  return {
    url: data.id,
    strategy: data.lighthouseResult.configSettings?.emulatedFormFactor === 'mobile' ? 'mobile' : 'desktop',
    scores,
    overallScore,
    coreWebVitals,
    improvements,
    audits: processedAudits,
    timestamp: new Date(data.analysisUTCTimestamp)
  };
}

function getCategoryForAudit(auditId: string, categories: any): string {
  for (const [categoryId, category] of Object.entries(categories)) {
    if (category && typeof category === 'object' && 'auditRefs' in category) {
      const auditRefs = (category as any).auditRefs;
      if (auditRefs?.some((ref: any) => ref.id === auditId)) {
        return categoryId;
      }
    }
  }
  return 'other';
}
