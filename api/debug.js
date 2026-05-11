/**
 * Debug endpoint - checks PayPal configuration status
 * Remove in production
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_SECRET;
  const useSandbox = process.env.USE_SANDBOX;
  const sunoKey = process.env.SUNO_API_KEY;
  
  const result = {
    paypal: {
      clientIdSet: !!clientId,
      clientIdLength: clientId?.length || 0,
      clientIdPrefix: clientId?.substring(0, 10) || 'NOT SET',
      secretSet: !!clientSecret,
      secretLength: clientSecret?.length || 0,
      useSandbox: useSandbox,
      useSandboxType: typeof useSandbox,
    },
    suno: {
      keySet: !!sunoKey,
    },
    env: process.env.NODE_ENV || 'unknown',
  };

  // Try to get PayPal access token
  if (clientId && clientSecret) {
    try {
      const baseUrl = useSandbox === 'true' 
        ? 'https://api-m.sandbox.paypal.com' 
        : 'https://api-m.paypal.com';
      
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });
      
      result.paypal.authTest = tokenRes.ok ? 'SUCCESS' : 'FAILED';
      result.paypal.authStatus = tokenRes.status;
      result.paypal.apiUrl = baseUrl;
      
      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        result.paypal.authError = errText.substring(0, 200);
      }
    } catch (e) {
      result.paypal.authTest = 'ERROR';
      result.paypal.authError = e.message;
    }
  } else {
    result.paypal.authTest = 'SKIPPED - missing credentials';
  }

  return res.json(result);
}
