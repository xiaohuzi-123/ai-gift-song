/**
 * Config API - Returns public configuration to the frontend
 * This allows runtime config without needing VITE_ env vars
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.json({
    paypalClientId: process.env.PAYPAL_CLIENT_ID || '',
    useSandbox: process.env.USE_SANDBOX === 'true'
  });
}
