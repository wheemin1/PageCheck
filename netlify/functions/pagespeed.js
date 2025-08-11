const https = require('https');
const { URL } = require('url');

// Google PageSpeed Insights API Key
const API_KEY = 'AIzaSyBgFQm9iHA78OFQASVDQadu7ZrkoD5Fjv8';

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    console.log('PageSpeed API function called');
    console.log('Event:', JSON.stringify(event, null, 2));

    const { url, strategy = 'mobile' } = event.queryStringParameters || {};

    if (!url) {
      console.error('No URL provided');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'URL parameter is required' 
        })
      };
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (urlError) {
      console.error('Invalid URL format:', url);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid URL format' 
        })
      };
    }

    // Validate strategy
    if (!['mobile', 'desktop'].includes(strategy)) {
      console.error('Invalid strategy:', strategy);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Strategy must be mobile or desktop' 
        })
      };
    }

    console.log(`Analyzing URL: ${url} with strategy: ${strategy}`);

    // Build Google PageSpeed Insights API URL
    const apiUrl = `https://www.googleapis.com/pagespeed/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${API_KEY}`;
    
    console.log('API URL:', apiUrl.replace(API_KEY, '[REDACTED]'));

    // Call Google PageSpeed Insights API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MoCheck/1.0'
      }
    });

    console.log('Google API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google API Error:', response.status, errorText);
      
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: `Google API Error: ${response.status}`,
          details: errorText
        })
      };
    }

    const data = await response.json();
    console.log('API call successful, data length:', JSON.stringify(data).length);

    // Transform the data for our frontend
    const transformedData = transformPageSpeedData(data, url, strategy);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(transformedData)
    };

  } catch (error) {
    console.error('Function error:', error);
    console.error('Error stack:', error.stack);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};

function transformPageSpeedData(data, url, strategy) {
  try {
    const lighthouseResult = data.lighthouseResult;
    const categories = lighthouseResult.categories;
    const audits = lighthouseResult.audits;

    // Extract scores
    const scores = {
      performance: Math.round((categories.performance?.score || 0) * 100),
      accessibility: Math.round((categories.accessibility?.score || 0) * 100),
      seo: Math.round((categories.seo?.score || 0) * 100),
      bestPractices: Math.round((categories['best-practices']?.score || 0) * 100)
    };

    // Calculate overall score
    const overallScore = Math.round(
      (scores.performance + scores.accessibility + scores.seo + scores.bestPractices) / 4
    );

    // Extract Core Web Vitals
    const coreWebVitals = {
      lcp: {
        value: audits['largest-contentful-paint']?.numericValue || 0,
        displayValue: audits['largest-contentful-paint']?.displayValue || 'N/A',
        score: Math.round((audits['largest-contentful-paint']?.score || 0) * 100)
      },
      fid: {
        value: audits['max-potential-fid']?.numericValue || 0,
        displayValue: audits['max-potential-fid']?.displayValue || 'N/A',
        score: Math.round((audits['max-potential-fid']?.score || 0) * 100)
      },
      cls: {
        value: audits['cumulative-layout-shift']?.numericValue || 0,
        displayValue: audits['cumulative-layout-shift']?.displayValue || 'N/A',
        score: Math.round((audits['cumulative-layout-shift']?.score || 0) * 100)
      }
    };

    // Extract improvements (failed audits)
    const improvements = [];
    const auditDetails = [];

    Object.entries(audits).forEach(([key, audit]) => {
      if (audit.score !== null && audit.score < 1) {
        improvements.push({
          id: key,
          title: audit.title,
          description: audit.description,
          score: Math.round(audit.score * 100),
          displayValue: audit.displayValue || '',
          details: audit.details
        });
      }

      auditDetails.push({
        id: key,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        scoreDisplayMode: audit.scoreDisplayMode,
        displayValue: audit.displayValue || '',
        details: audit.details,
        category: getCategoryFromAudit(key, categories)
      });
    });

    return {
      url,
      strategy,
      scores,
      overallScore,
      coreWebVitals,
      improvements: improvements.slice(0, 10), // Top 10 improvements
      audits: auditDetails,
      timestamp: new Date()
    };

  } catch (transformError) {
    console.error('Data transformation error:', transformError);
    throw new Error('Failed to transform PageSpeed data');
  }
}

function getCategoryFromAudit(auditKey, categories) {
  for (const [categoryKey, category] of Object.entries(categories)) {
    if (category.auditRefs?.some(ref => ref.id === auditKey)) {
      return categoryKey;
    }
  }
  return 'other';
}