export interface PageSpeedResponse {
  captchaResult: string;
  kind: string;
  id: string;
  loadingExperience?: LoadingExperience;
  originLoadingExperience?: LoadingExperience;
  lighthouseResult: LighthouseResult;
  analysisUTCTimestamp: string;
}

export interface LoadingExperience {
  id: string;
  metrics: {
    [key: string]: Metric;
  };
  overall_category: string;
  initial_url: string;
}

export interface Metric {
  percentile: number;
  distributions: Distribution[];
  category: string;
}

export interface Distribution {
  min?: number;
  max?: number;
  proportion: number;
}

export interface LighthouseResult {
  requestedUrl: string;
  finalUrl: string;
  lighthouseVersion: string;
  userAgent: string;
  fetchTime: string;
  environment: Environment;
  runWarnings: string[];
  configSettings: ConfigSettings;
  audits: { [key: string]: LighthouseAudit };
  categories: { [key: string]: Category };
  categoryGroups: { [key: string]: CategoryGroup };
  timing: Timing;
  i18n: I18n;
}

export interface Environment {
  networkUserAgent: string;
  hostUserAgent: string;
  benchmarkIndex: number;
}

export interface ConfigSettings {
  emulatedFormFactor?: string;
  locale: string;
  onlyCategories?: string[];
}

export interface LighthouseAudit {
  id: string;
  title: string;
  description: string;
  score: number | null;
  scoreDisplayMode: string;
  displayValue?: string;
  explanation?: string;
  errorMessage?: string;
  warnings?: string[];
  details?: any;
  numericValue?: number;
  numericUnit?: string;
}

export interface Category {
  id: string;
  title: string;
  description?: string;
  score: number | null;
  manualDescription?: string;
  auditRefs: AuditRef[];
}

export interface AuditRef {
  id: string;
  weight: number;
  group?: string;
  acronym?: string;
  relevantAudits?: string[];
}

export interface CategoryGroup {
  title: string;
  description: string;
}

export interface Timing {
  entries: TimingEntry[];
  total: number;
}

export interface TimingEntry {
  name: string;
  duration: number;
  entryType: string;
  startTime: number;
}

export interface I18n {
  rendererFormattedStrings: { [key: string]: string };
  icuMessagePaths: { [key: string]: any };
}

// Processed data types for our app
export interface PageSpeedResults {
  url: string;
  strategy: 'mobile' | 'desktop';
  scores: {
    performance: number;
    accessibility: number;
    seo: number;
    bestPractices: number;
  };
  overallScore: number;
  coreWebVitals: CoreWebVitals;
  improvements: Improvement[];
  audits: Audit[];
  timestamp: Date;
}

export interface CoreWebVitals {
  lcp: {
    value: number;
    displayValue: string;
    score: number;
  };
  fid: {
    value: number;
    displayValue: string;
    score: number;
  };
  cls: {
    value: number;
    displayValue: string;
    score: number;
  };
}

export interface Improvement {
  id: string;
  title: string;
  description: string;
  score: number;
  displayValue?: string;
  details?: any;
}

export interface Audit {
  id: string;
  title: string;
  description: string;
  score: number | null;
  scoreDisplayMode: string;
  displayValue?: string;
  details?: any;
  category: string;
}
