/**
 * PayPal Create Order API
 * Creates a PayPal order for song purchase
 */

const SANDBOX_API = 'https://api-m.sandbox.paypal.com';
const LIVE_API = 'https://api-m.paypal.com';

const PRICE = 4.99;
const CURRENCY = 'USD';

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_SECRET;
  const useSandbox = process.env.USE_SANDBOX !== 'false'; // default true
  const baseUrl = useSandbox ? SANDBOX_API : LIVE_API;
  
  if (!clientId || !clientSecret) {
    console.error('Missing PayPal credentials. PAYPAL_CLIENT_ID:', !!clientId, 'PAYPAL_SECRET:', !!clientSecret);
    throw new Error('PayPal credentials not configured');
  }
  
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error('PayPal auth error:', response.status, error);
    throw new Error('PayPal authentication failed');
  }
  
  const data = await response.json();
  return data.access_token;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, songId, songTitle } = req.body;
    
    // Validate amount (accept both string and number)
    const numAmount = parseFloat(amount);
    if (!numAmount || Math.abs(numAmount - PRICE) > 0.01) {
      console.error('Invalid amount:', amount, 'expected:', PRICE);
      return res.status(400).json({ error: 'Invalid amount', expected: PRICE, received: amount });
    }
    
    const songDisplayTitle = songTitle || 'AI Gift Song - Full Version';
    
    // Get PayPal access token
    const accessToken = await getAccessToken();
    const useSandbox = process.env.USE_SANDBOX !== 'false';
    const baseUrl = useSandbox ? SANDBOX_API : LIVE_API;
    
    // Create PayPal order - simplified payload
    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: songId || 'gift-song',
        description: songDisplayTitle,
        amount: {
          currency_code: CURRENCY,
          value: PRICE.toFixed(2),
        },
      }],
      application_context: {
        brand_name: 'AI Gift Song',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${req.headers.origin || 'https://ai-gift-song.vercel.app'}`,
        cancel_url: `${req.headers.origin || 'https://ai-gift-song.vercel.app'}`,
      },
    };
    
    const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('PayPal create order error:', response.status, error);
      return res.status(500).json({ error: 'PayPal order creation failed', details: error });
    }
    
    const orderData = await response.json();
    console.log('PayPal order created:', orderData.id);
    
    return res.status(200).json({
      orderId: orderData.id,
      status: orderData.status,
    });
    
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({
      error: 'Failed to create order',
      message: error.message,
    });
  }
}
