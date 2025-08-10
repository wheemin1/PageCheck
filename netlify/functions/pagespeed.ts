import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

interface PageSpeedAPIResponse {
  captchaResult: string;
  kind: string;
  id: string;
  loadingExperience?: any;
  originLoadingExperience?: any;
  lighthouseResult: any;
  analysisUTCTimestamp: string;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { url, strategy = 'mobile' } = event.queryStringParameters || {};

    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'URL parameter is required' })
      };
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid URL format' })
      };
    }

    // Get API key from environment variable
    const API_KEY = process.env.PSI_API_KEY || 'AIzaSyBgFQm9iHA78OFQASVDQadu7ZrkoD5Fjv8';

    if (!API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'PageSpeed Insights API key not configured' })
      };
    }

    // Build PageSpeed Insights API URL
    const apiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
    apiUrl.searchParams.set('url', url);
    apiUrl.searchParams.set('key', API_KEY);
    apiUrl.searchParams.set('strategy', strategy);
    
    // Add categories using append() to include multiple values
    apiUrl.searchParams.append('category', 'performance');
    apiUrl.searchParams.append('category', 'accessibility');
    apiUrl.searchParams.append('category', 'best-practices');
    apiUrl.searchParams.append('category', 'seo');
    
    // Add locale for consistent results
    apiUrl.searchParams.set('locale', 'ko');
    
    console.log('API URL:', apiUrl.toString());

    console.log('Calling PageSpeed Insights API for:', url, 'with strategy:', strategy);

    // Call PageSpeed Insights API with enhanced timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120초 타임아웃 (2분)

    let response;
    try {
      console.log(`Starting analysis for ${url} - This may take up to 2 minutes for complex sites...`);
      
      response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PageSpeed Analysis Tool)',
          'Accept': 'application/json',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log(`Analysis completed for ${url} with status:`, response.status);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('PageSpeed API timeout for URL:', url);
        return {
          statusCode: 504,
          headers,
          body: JSON.stringify({ 
            error: '분석 시간이 초과되었습니다 (2분). 복잡한 웹사이트는 분석하는 데 시간이 오래 걸릴 수 있습니다. 잠시 후 다시 시도하거나 더 간단한 페이지를 분석해보세요.',
            details: `Request timeout after 120 seconds for ${url}`,
            suggestions: [
              '페이지를 새로고침하고 다시 시도',
              '모바일 버전 페이지 사용 (예: m.example.com)',
              '메인 페이지가 아닌 특정 하위 페이지 분석',
              '잠시 후 재시도'
            ]
          })
        };
      }
      
      console.error('Fetch error for URL:', url, fetchError);
      throw fetchError; // Re-throw other errors
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PageSpeed API error:', response.status, errorText);
      
      let errorMessage = 'PageSpeed Insights API error';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch {
        // Use default error message
      }

      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: errorMessage,
          details: `HTTP ${response.status}: ${response.statusText}`
        })
      };
    }

    const data: PageSpeedAPIResponse = await response.json();

    // Basic validation of the response
    if (!data.lighthouseResult || !data.lighthouseResult.categories) {
      console.error('Invalid PageSpeed API response structure:', data);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Invalid response from PageSpeed Insights API' })
      };
    }

    console.log('Successfully fetched PageSpeed data for:', url);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Cache-Control': 'public, max-age=1800' // Cache for 30 minutes
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('PageSpeed function error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export { handler };
