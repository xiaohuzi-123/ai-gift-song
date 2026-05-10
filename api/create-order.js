/**
 * PayPal Create Order API
 * Creates a PayPal order for song purchase
 * 
 * Environment Variables Required:
 * - PAYPAL_CLIENT_ID: Your PayPal Business Client ID
 * - PAYPAL_SECRET: Your PayPal Business Secret
 * - USE_SANDBOX: Set to 'true' for testing (optional, defaults to sandbox)
 * 
 * For testing without a PayPal Business account:
 * 1. Go to https://developer.paypal.com/
 * 2. Create a sandbox account
 * 3. Get your sandbox Client ID and Secret
 * 4. Set PAYPAL_CLIENT_ID and PAYPAL_SECRET in .env
 * 5. Set USE_SANDBOX=true
 */

const SANDBOX_API = 'https://api-m.sandbox.paypal.com';
const LIVE_API = 'https://api-m.paypal.com';

const PRICE = parseFloat(process.env.SONG_PRICE) || 4.99;
const CURRENCY = 'USD';

// Helper function to get PayPal access token
async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID || 'ASVmBXV9BvBOt6mkrAMdQzXpVvyBgvCc2cCBYdh0_RhCJwwoa3NjVmLuY2PZz-IN8Z5FWn6CVqLJ8N61';
  const clientSecret = process.env.PAYPAL_SECRET || 'EC2msuov9Ejs3tzruofc1AcIVQQGPgXhHm-Fwv73OkWK7ofwSom9A6gUjiPDr0grHgIqM2J-Xj23mY2x';
  const baseUrl = process.env.USE_SANDBOX === 'true' ? SANDBOX_API : LIVE_API;
  
  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_SECRET in .env');
  }
  
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error('PayPal auth error:', error);
    throw new Error('Failed to authenticate with PayPal');
  }
  
  const data = await response.json();
  return data.access_token;
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, songId, songTitle } = req.body;
    
    // Validate request
    if (!amount || amount !== PRICE) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    const songDisplayTitle = songTitle || 'AI Gift Song - Full Version';
    const itemPrice = PRICE;
    
    // Get PayPal access token
    const accessToken = await getAccessToken();
    const baseUrl = process.env.USE_SANDBOX === 'true' ? SANDBOX_API : LIVE_API;
    
    // Create PayPal order
    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: songId || 'default-song',
          description: songDisplayTitle,
          amount: {
            currency_code: CURRENCY,
            value: itemPrice.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: CURRENCY,
                value: itemPrice.toFixed(2),
              },
            },
          },
          items: [
            {
              name: songDisplayTitle,
              description: 'Full MP3 download of your personalized AI gift song',
              unit_amount: {
                currency_code: CURRENCY,
                value: itemPrice.toFixed(2),
              },
              quantity: '1',
              category: 'DIGITAL_GOODS',
            },
          ],
        },
      ],
      application_context: {
        brand_name: 'AI Gift Song',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${req.headers.origin || 'https://example.com'}/result?payment=success`,
        cancel_url: `${req.headers.origin || 'https://example.com'}/result?payment=cancelled`,
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
      console.error('PayPal create order error:', error);
      return res.status(500).json({ error: 'Failed to create PayPal order', details: error });
    }
    
    const orderData = await response.json();
    
    console.log('PayPal order created:', orderData.id);
    
    return res.status(200).json({
      orderId: orderData.id,
      status: orderData.status,
      approveUrl: orderData.links?.find(link => link.rel === 'approve')?.href,
    });
    
  } catch (error) {
    console.error('Create order error:', error);
    
    // Return a more helpful error message
    if (error.message.includes('credentials')) {
      return res.status(500).json({
        error: 'PayPal not configured',
        message: 'Payment processing is not available. Please configure PayPal credentials.',
        details: 'Set PAYPAL_CLIENT_ID and PAYPAL_SECRET in your .env file. For testing, use sandbox credentials from https://developer.paypal.com/',
      });
    }
    
    return res.status(500).json({
      error: 'Failed to create order',
      message: error.message,
    });
  }
}
