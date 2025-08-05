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

    // Call PageSpeed Insights API
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PageSpeed Analysis Tool)',
        'Accept': 'application/json',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'
      }
    });

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
