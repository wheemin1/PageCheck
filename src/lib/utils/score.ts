export interface Scores {
  performance: number;
  accessibility: number;
  seo: number;
  bestPractices: number;
}

export function calculateOverallScore(scores: Scores): number {
  const { performance, accessibility, seo, bestPractices } = scores;
  
  // Weighted calculation: performance*4 + accessibility*2 + seo*2 + bestPractices*1 / 9
  const weightedSum = (performance * 4) + (accessibility * 2) + (seo * 2) + (bestPractices * 1);
  const totalWeight = 9;
  
  return Math.round(weightedSum / totalWeight);
}

export function getScoreLevel(score: number): 'good' | 'average' | 'poor' {
  if (score >= 90) return 'good';
  if (score >= 50) return 'average';
  return 'poor';
}

export function getScoreColor(score: number): string {
  const level = getScoreLevel(score);
  return {
    good: '#10B981',
    average: '#F59E0B',
    poor: '#EF4444'
  }[level];
}
