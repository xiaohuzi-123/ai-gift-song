/**
 * PayPal Capture Order API
 * Captures a PayPal payment after user approval
 * 
 * Environment Variables Required:
 * - PAYPAL_CLIENT_ID: Your PayPal Business Client ID
 * - PAYPAL_SECRET: Your PayPal Business Secret
 * - USE_SANDBOX: Set to 'true' for testing (optional, defaults to sandbox)
 * 
 * This endpoint:
 * 1. Captures the PayPal payment
 * 2. Generates a signed download URL for the MP3
 * 3. Returns success with download link
 */

const SANDBOX_API = 'https://api-m.sandbox.paypal.com';
const LIVE_API = 'https://api-m.paypal.com';

const PRICE = parseFloat(process.env.SONG_PRICE) || 4.99;
const CURRENCY = 'USD';

// Generate a signed download URL (simulated - replace with your actual storage solution)
function generateDownloadUrl(songId, orderId) {
  // In production, you would:
  // 1. Store the actual MP3 file in S3/GCS/Azure Blob
  // 2. Generate a pre-signed URL with expiration
  // 3. Return that URL to the client
  
  // For now, we'll create a placeholder URL
  // The actual implementation should use something like:
  // - AWS S3 presigned URLs
  // - Cloudflare R2 presigned URLs
  // - Google Cloud Storage signed URLs
  // - Azure Blob Storage SAS tokens
  
  const baseUrl = process.env.DOWNLOAD_BASE_URL || 'https://your-aigiftsong.com';
  const expiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now
  const signature = Buffer.from(`${songId}-${orderId}-${expiry}-${process.env.DOWNLOAD_SECRET || 'secret'}`).toString('base64');
  
  return `${baseUrl}/api/download/${songId}?token=${signature}&expires=${expiry}`;
}

// Helper function to get PayPal access token
async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_SECRET;
  const baseUrl = process.env.USE_SANDBOX === 'true' ? SANDBOX_API : LIVE_API;
  
  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
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
    const { orderId, songId } = req.body;
    
    // Validate request
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }
    
    // Get PayPal access token
    const accessToken = await getAccessToken();
    const baseUrl = process.env.USE_SANDBOX === 'true' ? SANDBOX_API : LIVE_API;
    
    // Capture the PayPal order
    const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('PayPal capture error:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to capture payment',
        details: error 
      });
    }
    
    const captureData = await response.json();
    
    // Check if capture was successful
    if (captureData.status !== 'COMPLETED') {
      console.error('Payment not completed:', captureData.status);
      return res.status(400).json({
        success: false,
        error: 'Payment not completed',
        status: captureData.status,
      });
    }
    
    // Get capture details
    const purchaseUnit = captureData.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];
    
    if (!capture) {
      return res.status(400).json({
        success: false,
        error: 'No capture found in order',
      });
    }
    
    console.log('Payment captured successfully:', {
      orderId,
      captureId: capture.id,
      amount: capture.amount?.value,
      songId,
    });
    
    // Generate download URL
    const downloadUrl = generateDownloadUrl(songId || 'default-song', orderId);
    
    // In a real implementation, you would:
    // 1. Store the payment record in your database
    // 2. Associate the payment with the user/song
    // 3. Store the actual download URL
    // 4. Log for analytics/reconciliation
    
    return res.status(200).json({
      success: true,
      orderId: orderId,
      captureId: capture.id,
      amount: capture.amount?.value,
      currency: capture.amount?.currency_code,
      status: capture.status,
      downloadUrl: downloadUrl,
      message: 'Payment successful! Here is your download link.',
    });
    
  } catch (error) {
    console.error('Capture order error:', error);
    
    if (error.message.includes('credentials')) {
      return res.status(500).json({
        success: false,
        error: 'PayPal not configured',
        message: 'Payment processing is not available.',
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to capture payment',
      message: error.message,
    });
  }
}
