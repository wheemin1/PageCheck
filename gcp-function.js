// Google Cloud Functions용 PageSpeed 분석 함수
const functions = require('@google-cloud/functions-framework');

functions.http('pagespeedAnalysis', async (req, res) => {
  // CORS 설정 - MoCheck 도메인만 허용
  res.set('Access-Control-Allow-Origin', 'https://mocheck.netlify.app');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  try {
    const { url, strategy = 'mobile', categories = ['performance'] } = req.body || req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Google PageSpeed Insights API 키 (환경 변수에서 가져옴)
    const apiKey = process.env.PAGESPEED_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'PageSpeed API key not configured' });
    }

    const apiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
    apiUrl.searchParams.append('url', url);
    apiUrl.searchParams.append('key', apiKey);
    apiUrl.searchParams.append('strategy', strategy);
    
    categories.forEach(category => {
      apiUrl.searchParams.append('category', category);
    });

    console.log(`Analyzing ${url} with strategy: ${strategy}`);
    
    // Google Cloud Functions는 최대 9분 타임아웃 가능
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8 * 60 * 1000); // 8분 타임아웃

    try {
      const response = await fetch(apiUrl.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent': 'PageSpeedLens/1.0'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`PageSpeed API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log(`Analysis completed for ${url}`);
      return res.json({
        success: true,
        data,
        timestamp: new Date().toISOString()
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error(`Analysis timed out for ${url}`);
        return res.status(504).json({
          error: 'Request timed out',
          message: 'The PageSpeed analysis took too long to complete',
          url
        });
      }
      
      throw fetchError;
    }

  } catch (error) {
    console.error('PageSpeed analysis error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});
