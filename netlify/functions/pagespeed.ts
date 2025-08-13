import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

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
  const startTime = Date.now();
  console.log(`Function started at ${new Date().toISOString()} - Netlify limit: 26 seconds`);
  
  // Add a safety timeout for the entire function (20 seconds to be safe)
  const functionTimeout = setTimeout(() => {
    console.error('Function approaching Netlify 26s limit - forcing early return');
  }, 20000);
  
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

    // Build ultra-optimized PageSpeed Insights API URL for minimal analysis time
    const apiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
    apiUrl.searchParams.set('url', url);
    apiUrl.searchParams.set('key', API_KEY);
    apiUrl.searchParams.set('strategy', strategy);
    
    // Minimal categories for fastest analysis
    apiUrl.searchParams.append('category', 'performance');
    
    // Speed optimizations
    apiUrl.searchParams.set('locale', 'en'); // English is faster than Korean
    apiUrl.searchParams.set('snapshots', 'false'); // No screenshots
    
    console.log('Ultra-optimized API URL (targeting <10s):', apiUrl.toString());

    console.log('Calling PageSpeed Insights API for:', url, 'with strategy:', strategy);

    // Ultra-fast API call optimized for Netlify Functions 26s limit
    const makeRequestWithRetry = async (maxRetries = 2): Promise<Response> => {
      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        // Ultra-aggressive timeouts: 8s, 12s to stay well under 26s Netlify limit
        let timeoutMs = Math.min(6000 + (attempt * 4000), 12000);
        
        try {
          console.log(`Attempt ${attempt}/${maxRetries} for ${url} - Timeout: ${timeoutMs}ms (Netlify limit: 26s)`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
          
          const response = await fetch(apiUrl.toString(), {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; Fast PageSpeed Tool)',
              'Accept': 'application/json',
              'Accept-Encoding': 'gzip, deflate'
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          console.log(`Analysis completed for ${url} with status:`, response.status);
          
          if (response.ok) {
            return response;
          }
          
          const errorText = await response.text().catch(() => 'Unable to read response');
          console.error(`HTTP ${response.status} response:`, errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          
        } catch (fetchError) {
          lastError = fetchError as Error;
          
          if (lastError.name === 'AbortError') {
            console.error(`Timeout after ${timeoutMs}ms on attempt ${attempt}`);
            
            if (attempt === maxRetries) {
              throw new Error(`PageSpeed 분석이 ${timeoutMs/1000}초 내에 완료되지 않았습니다. 사이트가 복잡하거나 Google 서버가 바쁠 수 있습니다.`);
            }
          } else {
            console.error(`Attempt ${attempt} failed:`, lastError.message);
            
            // Handle specific API errors
            if (lastError.message.includes('429')) {
              throw new Error('Google API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
            }
          }
          
          if (attempt < maxRetries) {
            // Very short wait - we need to finish within 26 seconds total
            const waitTime = 500; // Fixed 500ms wait
            console.log(`Quick retry in ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      }
      
      throw lastError || new Error('All attempts failed within Netlify timeout limits');
    };

    let response: Response;
    try {
      response = await makeRequestWithRetry();
    } catch (error) {
      console.error('All retry attempts failed for URL:', url, error);
      
      // Handle specific timeout errors with user-friendly messages
      if (error instanceof Error && error.message.includes('분석 시간이 초과')) {
        return {
          statusCode: 504,
          headers,
          body: JSON.stringify({ 
            error: error.message,
            details: `Request timeout after multiple attempts for ${url}`,
            suggestions: [
              '페이지를 새로고침하고 다시 시도',
              '모바일 버전 페이지 사용 (예: m.example.com)',
              '메인 페이지가 아닌 특정 하위 페이지 분석',
              '잠시 후 재시도'
            ]
          })
        };
      }
      
      throw error;
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
    const totalTime = Date.now() - startTime;
    console.log(`Function completed in ${totalTime}ms`);
    clearTimeout(functionTimeout);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Cache-Control': 'public, max-age=1800' // Cache for 30 minutes
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`PageSpeed function error after ${totalTime}ms:`, error);
    clearTimeout(functionTimeout);
    
    // Check if we're approaching Netlify's 26-second limit
    if (totalTime > 18000) {
      return {
        statusCode: 504,
        headers,
        body: JSON.stringify({ 
          error: 'Netlify Function timeout limit approaching',
          message: `분석이 Netlify 제한 시간(26초)에 근접했습니다 (${totalTime}ms). 더 간단한 사이트를 분석하거나 잠시 후 다시 시도해주세요.`,
          executionTime: `${totalTime}ms`,
          suggestions: [
            '메인 페이지가 아닌 특정 페이지를 분석해보세요',
            '모바일 버전을 시도해보세요',
            '잠시 후 다시 시도해주세요'
          ]
        })
      };
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        executionTime: `${totalTime}ms`
      })
    };
  }
};

export { handler };
