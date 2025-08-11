exports.handler = async (event, context) => {
  console.log('Test function called');
  console.log('Event:', JSON.stringify(event, null, 2));
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Test function works',
      timestamp: new Date().toISOString(),
      method: event.httpMethod,
      params: event.queryStringParameters
    })
  };
};
