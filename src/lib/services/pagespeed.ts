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
      appStore.setResults(cached);
      appStore.setLoading(false);
      return;
    }

    // Make API call
    const response = await fetch(`${API_ENDPOINT}?url=${encodeURIComponent(url)}&strategy=${strategy}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data: PageSpeedResponse = await response.json();
    const results = processPageSpeedData(data);
    
    // Cache results
    setToCache(cacheKey, results);
    
    appStore.setResults(results);
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
      value: audits['max-potential-fid']?.numericValue || 0,
      displayValue: audits['max-potential-fid']?.displayValue || 'N/A',
      score: audits['max-potential-fid']?.score || 0
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
